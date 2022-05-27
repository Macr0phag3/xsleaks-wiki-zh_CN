+++
title = "Framing Protections"
description = ""
date = "2020-10-01"
category = [
    "Defense",
]
menu = "main"
+++

相当一部分的 XS-Leaks 依赖于 iframe 的一些属性。如果攻击者无法将页面内容嵌入为 `iframe`、`frame`、`embed` 或 `object`，那么就不可能完成攻击。为了减轻依赖这些对象的 XS-Leaks，页面可以禁止或限制哪些来源可以嵌入这些对象。通过使用 [`X-Frame-Options` 头](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options) 或 [CSP frame-ancestors 指令](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors) 都可以做到这一点。

A considerable number of XS-Leaks rely on some of the properties of iframes. If an attacker is unable to embed the contents of a page as an `iframe`, `frame`, `embed` or `object`, then the attack may no longer be possible. To mitigate XS-Leaks which rely on these objects, pages can forbid or select which origins can embed them. Doing so is possible by using the [`X-Frame-Options` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options) or the [CSP frame-ancestors directive](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors).

由于执行 Framing Protections 的网站不能在攻击者的源中嵌入，该网站不会被渲染，JavaScript 也不会运行。因此，其子资源（图像、JS 或 CSS）都不会被浏览器请求。

Since a website enforcing Framing Protections can't be embedded from an attacker origin, the website is not rendered and the JavaScript does not run. Therefore, none of its subresources (images, JS, or CSS) are retrieved by the browser.

{{< hint tip >}}
[CSP frame-ancestors 指令](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors)是启用 framing protections 的更现代的方式。然而，Internet Explorer 不支持它，所以在许多情况下，建议将它和 [`X-Frame-Options` 头](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options) 一起使用。

The [CSP frame-ancestors directive](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors) is the more modern way of enabling framing protections. However, it is not supported by Internet Explorer, so in many cases it is recommended to use it in conjunction with the [`X-Frame-Options` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options).
{{< /hint >}}

## 权衡
这种保护对[依赖 framing](../../../abuse/iframes/)的 XS-Leaks 非常有效，而且可以很容易地实现，不会破坏绝大多数的应用程序的功能。这种机制不仅可以保护一些 XS-Leaks，还可以防止像[点击劫持](https://owasp.org/www-community/attacks/Clickjacking)这样的攻击。

This protection is very effective against XS-Leaks that [rely on framing](../../../../abuse/iframes/) and can be easily implemented without breaking the vast majority of applications. This mechanism not only protects against some XS-Leaks, but also prevents attacks like [clickjacking](https://owasp.org/www-community/attacks/Clickjacking).

## 部署
部署 framing protections 通常是比较简单的，因为许多应用程序并不打算在 `iframe` 中进行跨源嵌入。请看这篇 [web.dev](https://web.dev/same-origin-policy/) 文章，了解更多关于这个头的优点。

Deploying framing protections is usually straightforward as many applications are not meant to be embedded cross-origin in an `iframe`. Check out this [web.dev](https://web.dev/same-origin-policy/) article to learn more about the advantages of this header.
