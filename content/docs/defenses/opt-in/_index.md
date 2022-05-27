---
title: "Opt-In Mechanisms"
weight: 1
---

# Opt-In 机制

有许多不同的 opt-in 机制，应用程序可以部署这些机制来抵御 XS-Leaks。请注意，这些机制在防御的技术方面可能会有重叠。

There are many different opt-in mechanisms that applications can deploy to defend against XS-Leaks. Note that mechanisms can overlap in terms of the techniques they defend against. 

* 应用程序可以通过 [Fetch Metadata]({{< ref "./fetch-metadata.md" >}}) 确定请求的发起方式和原因，这样它可以选择拒绝任何恶意的请求。
* 应用程序可以通过 [Cross-Origin-Opener-Policy]({{< ref "./coop.md" >}}) 阻止其他网站通过 `window.open` 或 `window.opener` 与它进行交互。
* 应用程序可以通过 [Cross-Origin-Resource-Policy]({{< ref "./corp.md" >}}) 阻止其他网站包含特定的资源。
* 应用程序可以通过 [Framing Protections]({{< ref "./xfo.md" >}}) 定义允许哪些网站对其进行 frame。
* 应用程序可以通过 [SameSite Cookies]({{< ref "./same-site-cookies.md" >}}) 确定哪些来自第三方网站的请求可以包含 cookies。
---
* [Fetch Metadata]({{< ref "./fetch-metadata.md" >}}) allows the application to determine how and why a request was initiated so that it can choose to reject any malicious requests. 
* [Cross-Origin-Opener-Policy]({{< ref "./coop.md" >}}) allows an application to prevent other websites from interacting with it via `window.open` or `window.opener`.
* [Cross-Origin-Resource-Policy]({{< ref "./corp.md" >}}) allows an application to prevent other sites from including specific resources.
* [Framing Protections]({{< ref "./xfo.md" >}}) allow an application to define what sites are allowed to frame it.
* [SameSite Cookies]({{< ref "./same-site-cookies.md" >}}) allow an application to determine which requests from third party sites can include cookies.
