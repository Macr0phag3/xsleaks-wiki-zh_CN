+++
title = "Framing 隔离策略"
description = ""
date = "2020-11-30"
category = [
    "Defense",
]
menu = "main"
weight = 2
+++

Framing 隔离策略是 [Framing Protections]({{< ref "../opt-in/xfo" >}}) 的一个更严格的版本，请求在应用层面被阻止，而不是被浏览器阻止。这是为了防止各种攻击（如 XSSI、CSRF、XS-Leaks），通过阻止对不打算使用 frame 的 endpoints 的 framing 请求。

Framing Isolation Policy is a stricter version of [Framing Protections]({{< ref "../opt-in/xfo" >}}) where the request gets blocked at the application level rather than by the browser. This is designed to protect against various attacks (e.g. XSSI, CSRF, XS-Leaks) by blocking framing requests to endpoints that are not intended to be framable.

它可以与[资源隔离策略]({{< ref "resource-isolation.md" >}})相结合，有效地缩小跨站信息泄露中的攻击面。

It can be combined with [Resource Isolation Policy]({{< ref "resource-isolation.md" >}}) to effectively tighten the attack surface within cross-site information leaks.

{{< hint tip >}}
与其拒绝所有 non-framable 的 endpoints，不如让用户确认操作，例如*确认你是从一个受信任的源来访问这个页面*，这样可以减少后台攻击的风险，同时，有助于防止应用程序的意外中断。

Instead of rejecting all non-framable endpoints, the user could be prompted to confirm the action, e.g. *Confirm that you visited this page from a trusted origin*, to mitigate the risk of attacks in the background, and, at the same time, help prevent unintended breakages of an application.
{{< /hint >}}

{{< hint tip >}}
当与[资源隔离策略]({{< ref "resource-isolation.md" >}})一起部署时，Framing 隔离策略不能防止利用窗口引用（如 `window.length` ）的泄漏，因此其他 navigational 保护措施，如 [COOP]({{< ref "../opt-in/coop" >}}) 或[导航隔离策略]({{< ref "navigation-isolation" >}})可能会有帮助。

When deployed together with [Resource Isolation Policy]({{< ref "resource-isolation.md" >}}), Framing Isolation Policy does not protect against leaks utilizing window references (e.g. `window.length`), so other navigational protections such as [COOP]({{< ref "../opt-in/coop" >}}) or [Navigation Isolation Policy]({{< ref "navigation-isolation" >}}) can be helpful.
{{< /hint >}}

## 通过 Fetch Metadata 实现
下面的片段展示了一个应用程序实施 Framing 隔离策略的例子。

The below snippet showcases an example implemention of the Framing Isolation Policy by an application:

```py
# 拒绝跨站请求来防止 CSRF、XSSI、XS-Leaks 和发生其他的 bug
# Reject cross-site requests to protect from CSRF, XSSI, XS-Leaks, and other bugs
def allow_request(req):
  # 允许来自不发送 Fetch Metadata 的浏览器的请求
  # Allow requests from browsers which don't send Fetch Metadata
  if not req['headers']['sec-fetch-site']:
    return True
  if not req['headers']['sec-fetch-mode']:
    return True
  if not req['headers']['sec-fetch-dest']:
    return True

  # 允许 non-navigational 的请求
  if req['headers']['sec-fetch-mode'] not in ('navigate', 'nested-navigate'):
    return True

  # 来源不是可嵌入元素的请求，都允许
  if req['headers']['sec-fetch-dest'] not in ('frame', 'iframe', 'embed', 'object'):
      return True

  # [可选] 用于跨网站提供服务的路径/endpoints，都允许
  # [OPTIONAL] Exempt paths/endpoints meant to be served cross-site.
  if req.path in ('/my_frame_ancestors_host_src'):
    return True

  # 拒绝其他请求
  return False
```

## 权衡
如果一个 endpoint 通过 `X-Frame-Options` 和/或 内容安全策略的 `frame-ancestors` 指令允许来自特定源的 framing 请求，则无法应用 framing 隔离策略。

Framing Isolation Policy cannot be applied if an endpoint allows framing requests from specific origins via  `X-Frame-Options` and/or Content Security Policy's `frame-ancestors` directive.
