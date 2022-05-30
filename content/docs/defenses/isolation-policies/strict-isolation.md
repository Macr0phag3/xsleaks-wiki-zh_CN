+++
title = "严格隔离政策"
description = ""
date = "2020-11-30"
category = [
    "Defense",
]
menu = "main"
weight = 4
+++

严格隔离政策旨在防止所有跨网站互动（包括通过超链接 navigate 到应用程序）。这是一个非常严格的政策，有可能危害到应用程序的正常运行。

Strict Isolation Policy is intended to protect against all cross-site interactions (including navigations to the application through hyperlinks). This is a very strict policy that has the potential to prevent applications from functioning properly.

{{< hint tip >}}
与其拒绝所有的跨站互动，不如提示用户确认操作，例如：*确认你是从一个受信任的源来访问这个页面的*，以减少后台攻击的风险，同时，有助于防止应用程序的意外中断。

Instead of rejecting all cross-site interactions, the user could be prompted to confirm the action, e.g. *Confirm that you visited this page from a trusted origin*, to mitigate the risk of attacks in the background, and, at the same time, help prevent unintended breakages of an application.

然而，这只对 navigational 请求有效，因为其他资源是在后台加载的。

However, this would only work for navigational requests, since other resources are loaded in the background.
{{< /hint >}}


## 通过 Fetch Metadata 实现

下面的片段展示了一个应用程序实施严格隔离策略的例子：

The below snippet showcases an example implementation of Strict Isolation Policy by an application:

```py
# 拒绝跨源请求来防止 CSRF、XSSI 和发生其他的 bug
# Reject cross-origin requests to protect from CSRF, XSSI, and other bugs
def allow_request(req):
  # 允许来自不发送 Fetch Metadata 的浏览器的请求
  # Allow requests from browsers which don't send Fetch Metadata
  if not req['headers']['sec-fetch-site']:
    return True

  # 禁止所有跨站请求
  # Block any cross-site request
  if req['headers']['sec-fetch-site'] == 'cross-site':
    return False

  # 允许所有其他请求
  # Allow all other requests
  return True
```

## 通过 SameSite cookies 实现
如果服务器发送了一个带有 [`SameSite=strict`]({{< ref "../opt-in/same-site-cookies/#samesite-cookie-modes" >}}) 标志的 cookie，任何不包含该 cookie 的后续请求都会被拒绝，如本片段所展示：

If a server sends a cookie with the [`SameSite=strict`]({{< ref "../opt-in/same-site-cookies/#samesite-cookie-modes" >}}) flag, any returned request that doesn't contain that cookie can be rejected, as showcased in this snippet:

```py
# 拒绝跨源请求，来防止 XSSI、XS-Leaks 和发生其他的 bug
def allow_request(req):

  if req['cookies']['strict-cookie'] == 'true':
    return True

  # 禁止未携带 strict cookie 的请求
  # Block requests without a strict cookie
  return False
```

## 通过 Referer 实现

也可以用 [`Referer`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer) 头拒绝来自不受信任的来源的请求：

It is also possible to reject requests from untrusted origins with the [`Referer`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer) header:

```py
# 拒绝来自不受信任的 referrer 的请求
# Reject requests that came from untrusted referrers
def allow_request(req):
  # 检查 referer 头是否可信，即是否存在于 trusted_referers dict 中。
  # check if the referer header is trusted, i.e. exists in trusted_referers dict
  if req['headers']['referer'] in trusted_referers:
    return True

  # 禁止未携带 strict cookie 的请求
  # Block requests without a strict cookie
  return False
```

{{< hint important >}}
在现实情况中，无法保证每个请求都包含 Referer 头（例如，扩展可以剥离头），所以这有可能影响一个应用程序的功能。还要需要注意的是，`Referer` 的值也有可能被设置为 `null`。

It is not guaranteed that every request will contain the Referer header (e.g. extensions can strip the header) which could potentially break an application. Also be aware that it is possible to set the value of `Referer` to `null`.

Twitter 部署了[^twitter_silhouette]类似的保护措施来防止 XS-Leaks。

Twitter deployed [^twitter_silhouette] a similar protection against XS-Leaks. 

[^twitter_silhouette]: 保护用户身份免受 Silhouette 的影响，[链接](https://blog.twitter.com/engineering/en_us/topics/insights/2018/twitter_silhouette.html)

[^twitter_silhouette]: Protecting user identity against Silhouette, [link](https://blog.twitter.com/engineering/en_us/topics/insights/2018/twitter_silhouette.html)
{{< /hint >}}
