+++
title = "Navigation 隔离政策"
description = ""
date = "2020-11-30"
category = [
    "Defense",
]
menu = "main"
weight = 3
+++

Navigation 隔离策略是一种服务器端保护机制，用于缓解 CSRF、点击劫持、反射型 XSS 和利用跨站 window contexts 的 XS-Loaks。这是一个严格的策略，有可能破坏一个应用程序的功能，因为它阻止了所有的跨网站的 navigation，包括使用超链接的 navigations。

Navigation Isolation Policy is a server-side protection mechanism intended to mitigate CSRF, clickjacking, reflected XSS, and XS-Leaks that make use of cross-site window contexts. This is a strict policy and has the potential to break an application since it blocks all cross-site navigations, including navigations through hyperlinks.

{{< hint tip >}}
与其拒绝所有的跨站互动，不如提示用户确认操作，例如：*确认你是从一个受信任的源来访问这个页面*，以减少后台攻击的风险，同时，有助于防止应用程序的意外中断。

Instead of rejecting all cross-site interactions, the user could be prompted to confirm the action, e.g. *Confirm that you visited this page from a trusted origin*, to mitigate the risk of attacks in the background, and, at the same time, help prevent unintended breakages of an application.
{{< /hint >}}

## 通过 Fetch Metadata 实现

下面的片段展示了使用 [Fetch Metadata]({{< ref "../opt-in/fetch-metadata.md">}}) 头 [^secmetadata]来实现 navigation 隔离策略的一个例子：

The below snippet showcases an example implemention of the Navigation Isolation Policy with the use of [Fetch Metadata]({{< ref "../opt-in/fetch-metadata.md">}}) headers [^secmetadata]:

```py
# 拒绝跨站请求来防止点击劫持、XS-Leaks 和发生其他的 bug
# Reject cross-site requests to protect from clickjacking, XS-Leaks, and other bugs
def allow_request(req):
  # 允许任何非跨网站的请求
  # Allow any request that is not cross-site
  if req['headers']['sec-fetch-site'] != 'cross-site':
    return True

  # 向那些被 navigate 的 endpoints 提出的请求，例如主页，允许。
  # Allow requests to endpoints meant to be navigated to, e.g. homepage
  if req.path in whitelisted_paths:
    return True

  # 阻止所有顶层的跨网站 navigations，包括嵌入内容
  # Block all top-level cross-site navigations, including embeds
  if req['headers']['sec-fetch-mode'] in ('navigate', 'nested-navigate'):
      return False

  # 允许其他所有的请求
  return True
```

## 参考资料
[^secmetadata]: Fetch Metadata Request Headers playground, [link](https://secmetadata.appspot.com/)
