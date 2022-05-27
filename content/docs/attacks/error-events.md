+++
title = "报错事件"
description = ""
date = "2020-10-01"
category = [
    "Attack",
]
abuse = [
    "Error Events",
    "Status Code",
    "nosniff",
    "Content-Type",
]
defenses = [
    "Fetch Metadata",
    "SameSite Cookies",
]
menu = "main"
weight = 2
+++

当一个网页向服务器发出请求时（例如，fetch 或者 HTML 标签），服务器会接收并处理这个请求。当收到请求时，服务器根据所提供的上下文决定该请求是否应该成功（如 200）或失败（如 404）。当一个响应有错误状态时，浏览器会触发一个[报错事件](https://developer.mozilla.org/en-US/docs/Web/API/Element/error_event)，供页面处理。这些错误也包括解析器操作失败的情况，例如，当试图将 `HTML` 内容以图片的形式嵌入页面。

When a webpage issues a request to a server (e.g. fetch, HTML tags), the server receives and processes this request. When received, the server decides whether the request should succeed (e.g. 200) or fail (e.g. 404) based on the provided context. When a response has an error status, an [error event](https://developer.mozilla.org/en-US/docs/Web/API/Element/error_event) is fired by the browser for the page to handle. These errors also cover situations where the parser fails, for example when trying to embed `HTML` content as an image.

例如，攻击者可以通过检查用户是否可以访问只有经过认证的用户才能使用的资源来检测用户是否登录了某项服务[^3]。这种 XS-Leak 的影响因应用而异，但它可以用来完成复杂的攻击，可以暴露匿名用户 [^1]。

For example, attackers can detect whether a user is logged in to a service by checking if the user has access to resources only available to authenticated users [^3]. The impact of this XS-Leak varies depending on the application, but it can lead to sophisticated attacks with the ability to deanonymize users [^1].

大量的 HTML 标签都可以抛出报错，有些行为因浏览器而异 [^4]。例如，这个行为可能取决于加载的资源、HTML 标签、某些头是否存在（如 `nosniff`, `Content-Type`），或浏览器默认保护机制，等等。

Error events can be thrown from a large variety of HTML tags, and some behaviors vary from browser to browser [^4]. For instance, the behavior can depend on the loaded resources, HTML tags, presence of certain headers (e.g. `nosniff`, `Content-Type`), or the enforcement of default browser protections, etc.

通过报错来泄露信息的原理可以抽象化，从而应用于各种 XS-Leaks。例如，[Cache Probing]({{< ref "cache-probing.md" >}}) 的一种方式是通过报错来检测某张图片是否被浏览器缓存。

The principle of leaking information with error events can be abstracted and applied to a variety of XS-Leaks. For example, one technique for [Cache Probing]({{< ref "cache-probing.md" >}}) uses Error Events to detect if a certain image was cached by the browser.

## 代码片段
下面的片段演示了如何用 `<script>` 标签来检测报错。

The below snippet demonstrates how an Error Event can be detected with the `<script>` tag:

```javascript
function probeError(url) {
  let script = document.createElement('script');
  script.src = url;
  script.onload = () => console.log('Onload event triggered');
  script.onerror = () => console.log('Error event triggered');
  document.head.appendChild(script);
}
// 因为 google.com/404 会返回 HTTP 404，脚本会触发错误事件
probeError('https://google.com/404');

// 因为 google.com 会返回 HTTP 200，脚本会触发加载事件
probeError('https://google.com/');
```

## 防御

对这种 XS-Leak 的防御往往因应用程序如何处理某些资源而不同。通常的方法是尽可能地采用一致的行为。在特定情况下，应用程序可以使用[子资源保护]({{< ref "/docs/defenses/design-protections/subresource-protections.md" >}})来防止攻击者预测一个 URL 并继续进行攻击。

The mitigation of this XS-Leak often varies depending on how applications handle certain resources. The general approach is to adopt consistent behaviors whereever possible. In specific scenarios, applications might use [Subresource Protections]({{< ref "/docs/defenses/design-protections/subresource-protections.md" >}}) to prevent attackers from predicting a URL and going forward with an attack.

最后，为了避免对应用逻辑进行较大改动，可以通过接入通用的网络安全平台，在更大范围内缓解这种 XS-Leak。

Finally, without applying bigger changes in the logic of applications, generic web platform security features can be deployed to mitigate this XS-Leak at a larger scale.

| [SameSite Cookies (Lax)]({{< ref "/docs/defenses/opt-in/same-site-cookies.md" >}}) | [COOP]({{< ref "/docs/defenses/opt-in/coop.md" >}}) | [Framing Protections]({{< ref "/docs/defenses/opt-in/xfo.md" >}}) |                  [Isolation Policies]({{< ref "/docs/defenses/isolation-policies" >}})                   |
| :--------------------------------------------------------------------------------: | :-------------------------------------------------: | :---------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------: |
|                                         ✔️                                          |                          ❌                          |                                 ❌                                 | [RIP]({{< ref "/docs/defenses/isolation-policies/resource-isolation" >}}) {{< katex>}}^{1}{{< /katex >}} |

____

1. 资源隔离策略应该能够防止基于报错的跨站泄漏，虽然在某些情况下，如果没有使用[Frame 隔离策略]({{< ref "/docs/defenses/isolation-policies/framing-isolation" >}})，报错事件可能会通过 iframes 泄漏。
---
1. The resource isolation policy should be enough to prevent error-based cross-site leaks, although in some scenarios without the [Framing Isolation Policy]({{< ref "/docs/defenses/isolation-policies/framing-isolation" >}}), the error events could be leaked through iframes.

## 真实案例

通过利用一个 bug，使得只有指定用户才能访问的 Twitter API 地址。这个地址会向除所有者之外的所有 Twitter 用户返回一个错误信息。攻击者可以利用这种特征暴露出用户的身份 [^3]。同样，通过利用另外一个 bug，利用私人信息的图像认证机制来达到同样的目的[^2] [^1]。

A bug allowed abusing a Twitter API endpoint to which only a specified user would have access. This endpoint would return an error to every Twitter user except the owner. An attacker could exploit this behavior to deanonymize a user [^3]. Similarly, another bug allowed abusing an image authentication mechanism of private messages to achieve the same goal  [^2] [^1].

## 参考文献

[^1]: Leaky Images: Targeted Privacy Attacks in the Web, [link](https://www.usenix.org/system/files/sec19fall_staicu_prepub.pdf)
[^2]: Tracking of users on third-party websites using the Twitter cookie, due to a flaw in authenticating image requests, [link](https://hackerone.com/reports/329957)
[^3]: Twitter ID exposure via error-based side-channel attack, [link](https://hackerone.com/reports/505424)
[^4]: Cross-Origin State Inference (COSI) Attacks: Leaking Web Site States through XS-Leaks, [link](https://arxiv.org/pdf/1908.02204.pdf) (see page 6)
