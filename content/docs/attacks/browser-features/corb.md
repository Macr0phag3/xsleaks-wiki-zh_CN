+++
title = "CORB 泄露"
description = ""
date = "2020-10-01"
category = "Attack"
abuse = [
    "Browser Feature",
    "Error Events",
    "Content-Type",
    "nosniff",
]
defenses = [
    "Fetch Metadata",
    "SameSite Cookies",
]
menu = "main"
weight = 2
+++

[Cross-Origin Read Blocking]({{< ref "/docs/defenses/secure-defaults/corb.md" >}}) (CORB)是一个 Web 平台安全能力，目的是缓解诸如 Spectre 这类巧妙的侧信道攻击。不幸的是，阻止某些类型的请求引入了一种新的 XS-Leaks [^1]，允许攻击者检测一个请求中是否执行了 CORB，而在另一个请求中却没有。但是，新引入的 XS-Leaks 对比 CORB 所防护的威胁（如 Spectre）来看，危害要轻微得多。

[Cross-Origin Read Blocking]({{< ref "/docs/defenses/secure-defaults/corb.md" >}}) (CORB) is a web platform security feature aimed at reducing the impact of speculative side-channel attacks such as Spectre. Unfortunately, blocking certain types of requests introduced a new type of XS-Leaks [^1] that allows attackers to detect if CORB was enforced on one request, but wasn't on another. Nevertheless, the introduced XS-Leaks are much less problematic than the issues actively protected by CORB (e.g. Spectre).

{{< hint info >}}
这是 Chromium 中的一个已知问题，虽然它[可能仍未被修复](https://docs.google.com/document/d/1kdqstoT1uH5JafGmRXrtKE4yVfjUVmXitjcvJ4tbBvM/edit?ts=5f2c8004)，但由于基于 Chromium 的浏览器[默认提供了 SameSite Cookies](https://blog.chromium.org/2020/05/resuming-samesite-cookie-changes-in-july.html)，其影响已大大降低。

This is a known issue in Chromium, and while it [might remain unfixed](https://docs.google.com/document/d/1kdqstoT1uH5JafGmRXrtKE4yVfjUVmXitjcvJ4tbBvM/edit?ts=5f2c8004), its impact is greatly reduced by the [rollout of SameSite Cookies by default](https://blog.chromium.org/2020/05/resuming-samesite-cookie-changes-in-july.html) in Chromium-based browsers.
{{< /hint >}}

## CORB & 报错事件
攻击者可以观察到 CORB 何时被执行，如果一个响应返回一个 *CORB 保护的* `Content-Type`（和 `nosniff` ），状态码为 `2xx`，使得 CORB 从响应中剥离 body 和响应头。通过检测这种防护行为，攻击者可以获取状态码（成功与错误）与 `Content-Type`（受 CORB 保护与否）的组合。这样就可以区分两种可能的状态，如这些例子中所示：

Attackers can observe when CORB is enforced if a response returns a *CORB protected* `Content-Type` (and `nosniff`) with the status code `2xx` which results in CORB stripping the body and headers from the response. Detecting this protection allows an attacker to leak the combination of both the status code (success vs. error) and the `Content-Type` (protected by CORB or not). This allows the distinction of two possible states as shown in these examples:

- 一个状态是请求受到 CORB 的保护，第二个状态是客户端错误 (404)。
- 一个状态是受 CORB 保护的，而第二个状态则不是。
---
- One state results in a request being protected by CORB and the second state in a client error (404).
- One state is protected by CORB and the second state is not.

下面展示了按照上面的第一个示例，利用这种防护的步骤：

The following steps allow abusing this protection in the context of the first example:

1. 攻击者可以在 `script` 标签中嵌入一个跨源资源，该标签返回 `200 OK`，`Content-Type` 为 `text/html`，还有一个 `nosniff` 头。
2. 为了防止敏感内容被攻击者获取，`CORB` 将用一个空的响应来替换原始响应。
3. 由于空响应是有效的 JavaScript，`onerror` 事件不会被触发，`onload` 将被触发。
4. 与步骤 1 类似，攻击者触发第二个请求（这里对应上面的第二个状态，即 404），返回的内容不是 `200 OK`。`onerror` 事件将被触发。
---
1. An attacker can embed a cross-origin resource in a `script` tag which returns `200 OK` with `text/html` as `Content-Type` and a `nosniff` Header.
2. To protect sensitive contents from entering the attacker's process, `CORB` will replace the original response with an empty one.
3. Since an empty response is valid JavaScript, the `onerror` event won't be fired, `onload` will fire instead.
4. The attacker triggers a second request (corresponding to a second state), similar to 1., which returns something other than `200 OK`. The `onerror` event will fire.

有趣的是，CORB 从请求中创建了一个有效的资源，它可能包含除 JavaScript 之外的东西（会导致错误）。考虑到非 CORB 环境，步骤 1 和 步骤 4 请求都会触发一个错误。这就引入了一个 XS-Leak，因为这些情况现在是可以进行区分的。

The interesting behavior is that CORB creates a valid resource out of the request which could contain something other than JavaScript (causing an error). Considering a non-CORB environment, both 1. and 4. requests would trigger an error. This introduces an XS-Leak as these situations are now distinguishable.

## 检测 `nosniff` 头
CORB 也可以让攻击者检测请求中是否存在 `nosniff` 头。这个问题根源是，CORB 的执行只取决于这个头是否存在以及一些 sniff 算法。下面的例子展示了两种可区分的状态：

CORB can also allow attackers to detect when the `nosniff` header is present in the request. This problem originated due to the fact that CORB is only enforced depending on the presence of this header and some sniffing algorithms. The example below shows two distinguishable states:

1. 如果资源的响应头中，`Content-Type` 为 `text/html`，且存在 `nosniff` 头，CORB 会阻止攻击者将资源以 `script` 的形式嵌入在页面中。
2. 如果资源没有设置 `nosniff`，并且 CORB [无法](https://chromium.googlesource.com/chromium/src/+/master/services/network/cross_origin_read_blocking_explainer.md#what-types-of-content-are-protected-by-corb)判断页面的 `Content-Type`（假设仍然是 `text/html`）了，将触发一个 `SyntaxError`，因为内容不能被解析为有效的 JavaScript。这个错误可以通过监听 `window.onerror` 来捕获，因为 `script` 标签只在[特定条件下](https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement)触发错误事件。
---
1. CORB will prevent an attacker page which embeds a resource as a `script` if the resource is served with `text/html` as `Content-Type` along with the `nosniff` header.
2. If the resource does not set `nosniff` and CORB [fails](https://chromium.googlesource.com/chromium/src/+/master/services/network/cross_origin_read_blocking_explainer.md#what-types-of-content-are-protected-by-corb) to infer the `Content-Type` of the page (which remains `text/html`), a `SyntaxError` will be fired since the contents can't be parsed as valid JavaScript. This error can be caught by listening to `window.onerror` as `script` tags only trigger error events under [certain conditions](https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement).

## 防御


| [SameSite Cookies (Lax)]({{< ref "/docs/defenses/opt-in/same-site-cookies.md" >}}) | [COOP]({{< ref "/docs/defenses/opt-in/coop.md" >}}) | [Framing Protections]({{< ref "/docs/defenses/opt-in/xfo.md" >}}) |                                          [Isolation Policies]({{< ref "/docs/defenses/isolation-policies" >}})                                          |
| :--------------------------------------------------------------------------------: | :-------------------------------------------------: | :---------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------: |
|                                         ✔️                                          |                          ❌                          |                                 ❌                                 | [RIP]({{< ref "/docs/defenses/isolation-policies/resource-isolation" >}}) 🔗 [NIP]({{< ref "/docs/defenses/isolation-policies/navigation-isolation" >}}) |

🔗 – 防御机制必须结合起来才能有效地应对不同的情况。

{{< hint tip >}}
开发者可以在应用的子资源中部署 [CORP]({{< ref "/docs/defenses/opt-in/corp.md" >}})，强制执行类似于 CORB 的保护。它不依赖响应来决定是否执行。为了防止攻击者滥用这个 XS-Leak，通用的 XS-Leak 防御机制也是有效的。

Developers can deploy [CORP]({{< ref "/docs/defenses/opt-in/corp.md" >}}) in an application's subresources to force a protection similar to CORB that does not inspect responses to decide when to act. To prevent attackers from abusing this XS-Leak, generic XS-Leaks defense mechanisms are also effective.
{{< /hint >}}

## 参考文献

[^1]: CORB vs side channels, [link](https://docs.google.com/document/d/1kdqstoT1uH5JafGmRXrtKE4yVfjUVmXitjcvJ4tbBvM/edit?ts=5f2c8004)
