+++
title = "ID 属性"
description = ""
date = "2020-10-01"
category = [
    "Attack",
]
abuse = [
    "onblur",
    "focus",
    "iframes",
]
defenses = [
    "Fetch Metadata",
    "SameSite Cookies",
    "Framing Protections",
    "Document Policies"
]
menu = "main"
weight = 3
+++

`id` 属性被广泛用于识别 `HTML` 元素。不幸的是，跨源网站可以通过利用 `focus` 事件和 `URL` 片段来确定一个给定的 `id` 是否存在与页面中。如果加载了 `https://example.com/foo#bar`，浏览器会试图滚动到 `id="bar"` 的元素的位置。所以我们就可以在一个 iframe 中加载 `https://example.com/foo#bar` 来进行跨源检测；如果有一个 `id="bar"` 的元素，就会触发 `focus` 事件。`blur` 事件也可用于同样的目的[^1]。

The `id` attribute is widely used to identify `HTML` elements. Unfortunately, cross-origin websites can determine whether a given `id` is set anywhere on a page by leveraging the `focus` event and `URL` fragments. If `https://example.com/foo#bar` is loaded, the browser attempts to scroll to the element with `id="bar"`. This can be detected cross-origin by loading `https://example.com/foo#bar` in an iframe; if there is an element with `id="bar"`, the `focus` event fires. The `blur` event can also be used for the same purpose [^1].

一些网络应用在 `focusable` 元素中设置了 `id` 属性，这可能会导致用户信息泄露。这些 `id` 可以包含与用户直接相关的信息（比如 secret），或与用户状态相关的信息（如账户状态）。

Some web applications set `id` attributes in `focusable` elements that can lead to disclosing user information. These `id`s can either contain information directly related to the user (e.g. a secret), or information associated with a user state (e.g. account status).

## 代码片段

下面的片段介绍了一个例子，可以从一个网站上检测另一个网站上的 ID 属性。

The below snippet presents an example of detecting the ID attribute from another site:
```javascript
// 监听 onblur 事件
// Listen to onblur event
onblur = () => {
  alert('Focus was lost, so there is a focusable element with the specified ID');
}
var ifr = document.createElement('iframe');
// 如果一个页面存在 focusable 的 id="x"  的元素，那么这个元素就会获得焦点
// If a page has a focusable element with id="x" it will gain focus
// 例如 <input id="x" value="test" />
ifr.src = 'https://example.org/#x';
document.body.appendChild(ifr);
```

{{< hint info >}}
上述手段似乎无法在 Firefox 中使用。

The above technique doesn't seem to work in Firefox.
{{< /hint >}}

## 设想场景
一些基于 `id` 属性的攻击例子：
Some examples of `id`-attribute-based attacks are:

- 一家银行允许其客户在浏览器应用中生成简短的数字一次性 PIN(OTP)，以验证移动设备上的会话。该银行将 OTP 作为一个 `button` 的 `id`，用来向客户显示 PIN。这种方法可以被利用，攻击者可以通过进行暴力破解来窃取这些 OTP 代码，然后利用它们来攻击用户账户。
- 当一个账户具有高级状态或用户具有某种性别时，一个应用程序会使用一组特定的预定义的 `ids` 和 `HTML` 元素。攻击者可以检测到受害者的页面上是否存在特定的 `id`，从而泄露出账户信息。
---
- A bank allows its clients to generate short numeric One-Time PINs (OTP) in the browser application to authenticate sessions on mobile devices. The bank used the OTP as the `id` of a `button` that is used to show the PIN to the client. This approach could be abused to steal these OTP codes by brute-forcing every option and then using them to compromise user accounts.
- A web application uses a specific set of predefined `ids` and `HTML` elements when an account has a premium status or the user is of a certain gender. The attacker can detect whether a specific `id` is present on the victim's page and leak the account information.

## 防御

| [Document Policies]({{< ref "/docs/defenses/opt-in/document-policies.md" >}}) | [SameSite Cookies (Lax)]({{< ref "/docs/defenses/opt-in/same-site-cookies.md" >}}) | [COOP]({{< ref "/docs/defenses/opt-in/coop.md" >}}) | [Framing Protections]({{< ref "/docs/defenses/opt-in/xfo.md" >}}) |                                          [Isolation Policies]({{< ref "/docs/defenses/isolation-policies" >}})                                          |
| :--------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------: | :-------------------------------------------------: | :---------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------: |
|                                         ✔️                                          |                                         ✔️                                          |                          ✔️                          |                                 ❌                                 | [FIP]({{< ref "/docs/defenses/isolation-policies/framing-isolation" >}}) |


## 参考文献

[^1]: Leaking IDs using focus, [link](https://portswigger.net/research/xs-leak-leaking-ids-using-focus)
