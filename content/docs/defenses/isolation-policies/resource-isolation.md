+++
title = "资源隔离策略"
description = ""
date = "2020-11-30"
category = [
    "Defense",
]
menu = "main"
weight = 1
+++

资源隔离策略可以防止外部网站请求你的资源。阻止这种流量可以缓解常见的网络漏洞，如 CSRF、XSSI 或 XS-Leaks。该策略可用于 endpoints 不打算在跨网站上下文中加载的应用程序，还可以允许来自你的应用程序的资源请求以及 direct navigations。

Resource Isolation Policy prevents external websites from requesting your resources. Blocking such traffic mitigates common web vulnerabilities such as CSRF, XSSI, or XS-Leaks. The policy can be enabled for applications whose endpoints are not intended to be loaded in a cross-site context and will allow resource requests coming from your application as well as direct navigations.

## 通过 Fetch Metadata 实现

下面的片段展示了一个使用 [Fetch Metadata]({{< ref "../opt-in/fetch-metadata.md">}})头实现的资源隔离策略的例子：

The below snippet showcases an example implemention of the Resource Isolation Policy with the use of [Fetch Metadata]({{< ref "../opt-in/fetch-metadata.md">}}) headers:

```py
# 拒绝跨源请求，来防止 XSSI、XS-Leaks 和发生其他的 bug
# Reject cross-origin requests to protect from , XSSI, XS-Leaks, and other bugs
def allow_request(req):
  # [可选] 用于跨网站提供服务的路径/endpoints，都允许
  # [OPTIONAL] Exempt paths/endpoints meant to be served cross-origin.
  if req.path in ('/my_CORS_endpoint', '/favicon.png'):
    return True

  # 设置了 `Cross-Origin-Resource-Policy: same-site` 就是安全的 (见本文 权衡 一节) 
  # Safe to set `Cross-Origin-Resource-Policy: same-site`. (see Considerations)

  # 允许来自不发送 Fetch Metadata 的浏览器的请求
  # Allow requests from browsers which don't send Fetch Metadata
  if not req['headers']['sec-fetch-site']:
    return True

  # 允许 same-site 且通过浏览器发起的请求
  # Allow same-site and browser-initiated requests
  if req['headers']['sec-fetch-site'] in ('same-origin', 'same-site', 'none'):
    return True

  # 允许简单的顶层 navigations，这包括了嵌入内容
  # Allow simple top-level navigations, this includes embeds
  if req['headers']['sec-fetch-mode'] == 'navigate' and req.method == 'GET':
      return True

  # 拒绝其他所有请求
  return False
```

## 权衡
在所有没有明确被资源隔离策略豁免的请求上设置 `Cross-Origin-Resource-Policy: same-site` 响应头应该是安全的。参见 [CORP]({{< ref "../opt-in/corp.md" >}})。

It should be safe to set a `Cross-Origin-Resource-Policy: same-site` response header on all requests that have not explicitly been exempted from Resource Isolation Policy. See [CORP]({{< ref "../opt-in/corp.md" >}}).


## 部署
请看 [web.dev](https://web.dev/fetch-metadata/) 这篇文章，了解更多关于这种保护、一些不同的策略以及如何部署它的技巧。

Check out this [web.dev](https://web.dev/fetch-metadata/) article to learn more about this protection, some different policies, and tips on how to deploy it.
