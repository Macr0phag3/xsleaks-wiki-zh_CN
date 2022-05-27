+++
title = "SameSite Cookies"
description = ""
date = "2020-10-01"
category = [
    "Defense",
]
menu = "main"
+++

SameSite cookie 是修复涉及跨站请求相关安全问题的最有影响的现代安全机制之一。这种机制可以让应用程序限制浏览器在发出同站请求时才能带上 cookie [^1]。这种类型的 cookie 有三种模式：`None`、`Lax` 和 `Strict`。

SameSite cookies are one of the most impactful modern security mechanisms for fixing security issues that involve cross-site requests. This mechanism allows applications to force browsers to only include cookies in requests that are issued same-site [^1]. This type of cookie has three modes: `None`, `Lax`, and `Strict`.

## SameSite Cookie 的模式
以下是 SameSite cookie 的可用模式：

The following SameSite cookie modes are available:

* `None` - 禁用所有保护措施，并恢复之前 cookie 的行为。不建议使用这种模式。

  {{< hint important >}}}
  `None` 属性必须与 `Secure` 标志[^same-site-none]同时出现。
  [^same-site-none]: SameSite cookies 解释过了，[链接](https://web.dev/samesite-cookies-explained/#samesitenone-must-be-secure)
  {{< /hint >}}

* `Strict` - 浏览器在任何跨站请求中都不会包括 cookies。这意味着 `<script src="example.com/resource">`、`<img src="example.com/resource">`、`fetch()` 和 `XHR` 发出的请求都不会包含 SameSite `Strict` cookies。即使用户点击了 `example.com/resource` 的链接，他们的 cookie 也不会被带上。

* `Lax` - `Lax` 和 `Strict` 之间的唯一区别是，`Lax` 模式允许将 cookie 添加到跨网站顶层 navigation 引发的请求中。因此 `Lax` cookies 更容易部署，因为它们不会破坏那些访问你的应用程序的请求。不幸的是，攻击者可以通过 `window.open` 触发一个顶层 navigation，允许攻击者获得 `window` 引用对象。
---
* `None` – Disables all protections and restores the old behavior of cookies. This mode is not recommended.

  {{< hint important >}}
  The `None` attribute must be accompanied by the `Secure` flag [^same-site-none].
  [^same-site-none]: SameSite cookies explained, [link](https://web.dev/samesite-cookies-explained/#samesitenone-must-be-secure)
  {{< /hint >}}


* `Strict` – Causes the browser to not include cookies in any cross-site requests. This means `<script src="example.com/resource">`, `<img src="example.com/resource">`, `fetch()`, and `XHR` will all make requests without the SameSite `Strict` cookies attached. Even if the user clicks on a link to `example.com/resource`, their cookies are not included.

* `Lax` – The only difference between `Lax` and `Strict` is that `Lax` mode allows cookies to be added to requests triggered by cross-site top-level navigations. This makes `Lax` cookies much easier to deploy since they won't break incoming links to your application. Unfortunately, an attacker can trigger a top-level navigation via `window.open` that allows the attacker to maintain a reference to the `window` object.

## 权衡

`Strict` cookies 提供了最强的安全保证，但在现有的应用程序中部署 `Strict` same-site cookies 可能非常困难。

`Strict` cookies provide the strongest security guarantees, but it can be very difficult to deploy `Strict` same-site cookies in an existing application.

SameSite cookies 既不是 bulletproof[^2]，也不能解决一切问题。为了补充这一针对 XS-Leaks 的防御策略，应用程序应考虑实施其他额外的保护措施。例如，[COOP]({{< ref "coop.md" >}})可以防止攻击者在第一次 navigation 后使用 `window` 引用来控制页面，即使使用了 `Lax` 模式的 SameSite cookies，也是可以防住的。

SameSite cookies are neither bulletproof [^2] nor can they fix everything. To complement this defense strategy against XS-Leaks, applications should consider implementing other, additional protections. For example, [COOP]({{< ref "coop.md" >}}) can prevent an attacker from controlling pages using a `window` reference after the first navigation even if SameSite cookies in `Lax` mode are used.

{{< hint important >}}
一些浏览器可能不会默认使用 Lax 模式，所以要明确设置 SameSite 属性，确保可以按照预期执行。默认情况下，Chrome 中没有 `SameSite` 属性的 cookies 将默认按照 `Lax` 模式执行。然而，对于通过 POST 请求发送的小于 2 分钟前设置的 cookie，有例外的情况。[^3]

Some browers may not use the default of Lax, So explicitly set the SameSite attrbute to ensure its enforced. By default, cookies in Chrome without `SameSite` attribute will default to `Lax` mode. However, there is an exception for that behavior for cookies set less than 2 minutes ago that are sent via POST requests. [^3]

[^3]: Cookies default to SameSite=Lax, [link](https://www.chromestatus.com/feature/5088147346030592)
{{< /hint >}}

## 部署

任何对如何在网络应用中部署这种机制感兴趣的人，都应该仔细看看这篇 [web.dev](https://web.dev/samesite-cookie-recipes/) 文章。

Anyone interested in deploying this mechanism in web applications should take a careful look at this [web.dev](https://web.dev/samesite-cookie-recipes/) article.

## 参考资料

[^1]: SameSite cookies explained, [link](https://web.dev/samesite-cookies-explained/)
[^2]: Bypass SameSite Cookies Default to Lax and get CSRF, [link](https://medium.com/@renwa/bypass-samesite-cookies-default-to-lax-and-get-csrf-343ba09b9f2b)
