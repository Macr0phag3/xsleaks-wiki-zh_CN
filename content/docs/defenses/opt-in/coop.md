+++
title = "Cross-Origin-Opener-Policy"
description = ""
date = "2020-10-01"
category = [
    "Defense",
]
menu = "main"
+++

获得对网站 `window` 对象的访问权是不同 XS-Leak 技术的常见前提条件。[Framing Protections]({{< ref "xfo.md" >}})可以确保攻击者不能使用 iframe 来访问 `window` 对象，但这并不能阻止攻击者通过 `window.open(url)` 或 `window.opener` 引用，从一个打开的窗口访问 `window` 对象。

Getting access to a website's `window` object is a common prerequisite for different XS-Leak techniques. [Framing Protections]({{< ref "xfo.md" >}}) can ensure that an attacker cannot use iframes to access the `window` object, but this does not stop an attacker from accessing the `window` object from an opened window through `window.open(url)` or `window.opener` references. 

使用 `window.open` 开发 XS-Leaks 通常对攻击者来说是最没有吸引力的选择，因为用户会很容易注意到打开了一个浏览器窗口。然而，在下列情况下，却是正确的选择：

Exploiting XS-Leaks with `window.open` is generally seen as the least appealing option for an attacker because the user can see it happen in the open browser window. However, it's usually the right technique when:

- 一个页面设置了[Framing Protections]（{{< ref "xfo.md" >}}）。
- 一个页面设置了[`Lax` 模式的 Same-Site Cookies]({{< ref "same-site-cookies.md" >}})（与 `Strict` 模式不同，`Lax` 模式允许 navigate 顶层窗口）
---
- A page sets [Framing Protections]({{< ref "xfo.md" >}}).
- A page sets [Same-Site Cookies with `Lax` Mode]({{< ref "same-site-cookies.md" >}}) (in contrast to the `Strict` mode, navigating a top-level window is allowed by the `Lax` mode).

为了防止其他网站获得对某一网页的任意 window 引用，应用程序可以部署 Cross-Origin-Opener-Policy(COOP) [^1] [^2]。

To prevent other websites from gaining arbitrary window references to a page, applications can deploy Cross-Origin-Opener-Policy (COOP) [^1] [^2]. 

COOP 头有三个可能的值：

There are three possible values for the COOP header:

* `unsafe-none` - 这是默认值，如果没有设置任何值，网站就会这样做。
* `same-origin` - 这是最严格的值。如果你设置了 `same-origin`，那么跨源网站就不能通过打开新窗口来访问你的 `window` 对象。如果你的应用程序依赖使用 `window.open` 来打开另一个网站并与之通信，这将被 `same-origin` 阻止。要解决这个问题，可以用 `same-origin-allow-popups` 来代替。
* `same-origin-allow-popups` - 这个值允许你的网站使用 `window.open` 打开其他网站，但不允许其他网站使用 `window.open` 打开你的网站。
---
* `unsafe-none` – This is the default value and is how websites behave if no value is set. 
* `same-origin` – This is the strictest value. If you set `same-origin`, then cross-origin websites cannot get access to your `window` object through opening new windows. If your application relies on using `window.open` to open another website and communicate with it, this will be blocked by `same-origin`. If this is an issue, set `same-origin-allow-popups` instead. 
* `same-origin-allow-popups` – This value allows your website to use `window.open`, but does not allow other websites to use `window.open` against your application. 

如果可能的话，建议设置 `same-origin`。如果你设置了 `same-origin-allow-popups`，一定要检查你用 `window.open` 打开的网站，确保它们是可信的。

If possible, it is recommended to set `same-origin`. If you set `same-origin-allow-popups`, be sure to review what websites you open with `window.open` and ensure that they are trusted. 

## 需要考虑的因素

由于 COOP 是一个 opt-in 机制，而且是一个非常新的机制，它很容易被开发者和安全工程师所忽视。尽管如此，我们还是要强调这个防御机制的重要性，因为它是防止攻击者利用 XS-Leaks 的唯一方法，而 XS-Leaks 是利用 `window.open` 等 API 来返回 window 引用（除非 `Strict` 模式的 SameSite Cookies 可以广泛部署）。

Since COOP is an opt-in mechanism and a very recent one, it can easily be overlooked by developers and security engineers. Nonetheless, it’s important to highlight the importance of this defense mechanism as it is the only way to prevent attackers from exploiting XS-Leaks which make use of window references returned by APIs like `window.open` (unless SameSite Cookies in the `Strict` mode can be widely deployed).

## 部署
请看这篇文章 [web.dev](https://web.dev/why-coop-coep/) 来了解更多关于这种保护的优点和如何部署它。

Check out this [web.dev](https://web.dev/why-coop-coep/) article to learn more about the advantages of this protection and how to deploy it.

## 参考资料

[^1]: Cross-Origin-Opener-Policy response header (also known as COOP), [link](https://gist.github.com/annevk/6f2dd8c79c77123f39797f6bdac43f3e)
[^2]: Cross-Origin-Opener-Policy, [link](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy)
