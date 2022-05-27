+++
title = "Fetch Metadata"
description = ""
date = "2020-11-30"
category = [
    "Defense",
]
menu = "main"
+++

[Fetch Metadata 的请求头](https://www.w3.org/TR/fetch-metadata/)是由浏览器随 HTTPS 请求发送的。这些头提供了请求相关的背景信息，这样应用程序就可以根据这些信息，更好地决定该如何响应这些请求。这样服务器在检测到潜在的攻击行为（如非预期的跨源请求）时，能够采取不同的行为[^1]。如果在服务器上部署了严格的策略，这可以非常有效地对付跨源攻击，如 XSSI、XS-Leaks、Clickjacking 和 CSRF。

[Fetch Metadata Request Headers](https://www.w3.org/TR/fetch-metadata/) are sent by browsers with HTTPS requests. These headers provide context on how a request was initiated so that applications are able to make more informed decisions on how to respond to them. This allows servers to behave differently when they detect potential attacks (e.g. unexpected cross-origin requests)[^1]. This can be very effective against cross-origin attacks like XSSI, XS-Leaks, Clickjacking, and CSRF if a strict policy is deployed on the server.

在 XS-Leaks 的场景下，服务器可以知道一个请求是跨源的（例如攻击者的源），可以返回一个没有用户数据的不同响应。这种响应对攻击者没有用处，因为它没有携带任何关于用户的信息或状态。Fetch Metadata 也可以用来阻止 framing 甚至是 navigation 请求。

In the XS-Leaks scenario, servers have the ability to know when a request was made cross-origin (e.g. attacker origin) and can return a different response with no user data. This kind of response is not useful to the attacker since it does not carry any information or state about the user. Fetch Metadata can also be used to block framing or even navigational requests.

{{< hint important >}}
出于安全原因，Fetch Metadata 头信息只附在加密的（HTTPS）请求上。

For security reasons, Fetch Metadata headers are only attached to encrypted (HTTPS) requests.
{{< /hint >}}

## Fetch Metadata vs. SameSite cookies

Fetch Metadata 头信息可用于扩展 SameSite cookies 提供的保护。虽然 Fetch Metadata 头和 SameSite cookies 都可以用来拒绝跨站请求，但 Fetch Metadata 可以根据以下情况做出更明智的决定：

Fetch Metadata headers can be used to extend the protections provided by SameSite cookies. While both Fetch Metadata headers and SameSite cookies can be used to reject cross-site requests, Fetch Metadata can make more informed decisions based on factors like:

* 该请求是同源的还是同站的？
* 请求是如何发起的？(例如：获取、脚本、顶部 navigation)
* 该请求是由用户互动发起的吗？
* 请求是由浏览器发起的吗（例如，直接在 omnibox 中输入 URL）？
---
* Was the request same-origin or same-site?
* How was the request initiated? (e.g. fetch, script, top navigation)
* Was the request initiated by user interaction?
* Was the request initiated by the browser (e.g. by entering the URL directly in the omnibox)?

由于 SameSite cookies 可能对服务功能造成影响，根据这些情况就可以更精确地部署保护措施。与 SameSite cookies 相比，Fetch Metadata 的一个缺点是它不能保护未加密的请求（HTTP），而 SameSite cookies 可以。

This allows for a more precise deployment of protections in scenarios where SameSite cookies could break a service's functionalities. One disadvantage of Fetch Metadata compared to SameSite cookies is that the latter can also protect unencrypted requests (HTTP) while the former can't.

## 权衡

Fetch Metadata 头信息是深度防御策略的一个有用工具，但不应被视为 [SameSite Cookies]({{< ref "seame-site-cookies.md" >}})、[COOP]({{< ref "coop.md" >}}) 或 [Framing Protections]({{< ref "xfo.md" >}}) 等机制的替代品。尽管可以使用 Fetch Metadata 头来实现类似的结果，但除了服务器之外，在客户端强制执行这些限制也是一种最佳做法。

Fetch Metadata headers are a useful tool for a defense-in-depth strategy, but should not be seen as a replacement for mechanisms such as [SameSite Cookies]({{< ref "same-site-cookies.md" >}}), [COOP]({{< ref "coop.md" >}}), or [Framing Protections]({{< ref "xfo.md" >}}). Even though Fetch Metadata headers can be used to achieve similar results, it is a best practice to enforce these restrictions on the client side in addition to the server.

Fetch Metadata 头的有效性取决于应用覆盖率和是否正确地进行了部署。

The usefulness of Fetch Metadata headers is dependent on the application coverage and correctness of the deployment.

## 策略
关于利用 Fetch Metadata 请求头的具体策略，请参见 [Resource Isolation Policy]({{< ref "../isolation-policy/resource-isolation.md" >}}) 和 [Framing Isolation Policy]({{< ref ".../isolation-policy/framing-isolation.md" >}})。

See [Resource Isolation Policy]({{< ref "../isolation-policies/resource-isolation.md" >}}) and [Framing Isolation Policy]({{< ref "../isolation-policies/framing-isolation.md" >}}) for specific policies utilizing Fetch Metadata Request Headers.
