---
title: 介绍
type: docs
bookToc: false
---

# XS-Leaks Wiki
## 概述

跨站泄漏（又称 XS-Leaks，XSLeaks）是一类由 web 平台内置的侧信道[^sid-channel]衍生出来的漏洞。它们利用网络的核心原则 —— 可组合性，即允许网站之间的互动，并滥用合法的机制 [^browser-features] 来推断用户的信息。认识 XS-Leaks 的一种方式是将它们和跨站请求伪造（CSRF [^csrf]）进行对比，主要区别在于 XS-Leaks 不能用来代替网站的其他用户执行操作，而是可以用来推断用户的信息。

Cross-site leaks (aka XS-Leaks, XSLeaks) are a class of vulnerabilities derived from side-channels [^side-channel] built into the web platform. They take advantage of the web's core principle of composability, which allows websites to interact with each other, and abuse legitimate mechanisms [^browser-features] to infer information about the user. One way of looking at XS-Leaks is to highlight their similarity with cross-site request forgery (CSRF [^csrf]) techniques, with the main difference being that instead of allowing other websites to perform actions on behalf of a user, XS-Leaks can be used to infer information about a user. 

浏览器提供了各种各样的功能来支持不同的 web 应用之间进行互动；例如，它们允许一个网站加载子资源、访问或发送消息给另一个 web 应用。虽然这些行为通常受到 web 平台内置的安全机制的限制（例如[同源策略](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)），XS-Leaks 利用的就是网站在互动过程中暴露的一小部分信息。

Browsers provide a wide variety of features to support interactions between different web applications; for example, they permit a website to load subresources, navigate, or send messages to another application. While such behaviors are generally constrained by security mechanisms built into the web platform (e.g. the [same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)), XS-Leaks take advantage of small pieces of information which are exposed during interactions between websites. 

XS-Leak 的原理是利用 web 上的这种侧信道来获取用户的敏感信息，例如他们保存在其他 web 应用中的数据、他们本地环境的细节信息或他们连接的内部网络信息。

The principle of an XS-Leak is to use such side-channels available on the web to reveal sensitive information about users, such as their data in other web applications, details about their local environment, or internal networks they are connected to.


## 跨站 oracles

用于 XS-Leak 的信息通常具有二进制的表达形式，被称为 "oracles"。Oracles 通常会用 *YES* 或 *NO*，通过某种方式来回答问题，这个问题一般是攻击者精心准备的问题，并且攻击者可以知道是通过哪种方式回答。例如，攻击者可以向一个 oracles 提问：

The pieces of information used for an XS-Leak usually have a binary form and are referred to as "oracles". Oracles generally answer with *YES* or *NO* to cleverly prepared questions in a way that is visible to an attacker. For example, an oracle can be asked:

> 在另一个 web 应用中，*secret* 这个词是否出现在用户的搜索结果里？

> Does the word *secret* appear in the user's search results in another web application?

这个问题可能等同于询问：

This question might be equivalent to asking:

> 请求 *?query=secret* 是否返回 *HTTP 200* 状态码？

> Does the query *?query=secret* return an *HTTP 200* status code?

因为通过 [Error Events]({{< ref "./docs/attacks/error-events.md" >}}) 来探测 *HTTP 200* 状态码是可行的，所以这个提问可以等价于：

Since it is possible to detect the *HTTP 200* status code with [Error Events]({{< ref "./docs/attacks/error-events.md" >}}), this has the same effect as asking:

> 在应用中，从 *?query=secret* 加载资源是否会触发 *onload* 事件？

> Does loading a resource from *?query=secret* in the application trigger the *onload* event?

攻击者可以对许多不同的关键词重复使用上述的查询手法，得到的回答可以用来推断用户数据的敏感信息。

The above query could be repeated by an attacker for many different keywords, and as a result the answers could be used to infer sensitive information about the user's data.

浏览器提供了一系列不同的 API，虽然出发点是好的，但终究还是会泄露少量的跨域信息，它们在本 wiki 中都有详细描述。

Browsers provide a wide range of different APIs that, while well-intended, can end up leaking small amounts of cross-origin information. They are described in detail throughout this wiki.

## 例子

网站不允许直接访问其他网站的数据，但它们可以从这些网站加载资源并观察加载的影响。例如，*evil.com*被禁止明确读取 *bank.com* 的响应，但 *evil.com* 可以尝试从 *bank.com* 加载一个脚本，并确定它是否加载成功。

Websites are not allowed to directly access data on other websites, but they can load resources from them and observe the side effects. For example, *evil.com* is forbidden from explicitly reading a response from *bank.com*, but *evil.com* can attempt to load a script from *bank.com* and determine whether or not it successfully loaded.

{{< hint example >}}

假设 *bank.com* 有一个 API，用于返回用户对某一类型交易的收据数据。

Suppose that *bank.com* has an API endpoint that returns data about a user's receipt for a given type of transaction.

1. *evil.com* 可以尝试将 URL *bank.com/my_receipt?q=groceries*作为一个脚本加载。默认情况下，浏览器在加载资源时附加了 cookies，因此对 *bank.com* 的请求将携带用户的凭证。
2. 如果用户最近买了 groceries，脚本就会以 *HTTP 200*状态代码成功加载。如果用户没有买过 groceries，则请求加载失败，出现 *HTTP 404* 状态码，从而触发一个 [错误事件]({{< ref "./docs/attacks/error-events.md" >}})。
3. 通过监听错误事件，并在不同的查询中重复这种手法，攻击者可以推断出此用户关于交易历史的大量信息。
---
1. *evil.com* can attempt to load the URL *bank.com/my_receipt?q=groceries* as a script. By default, the browser attaches cookies when loading resources, so the request to *bank.com* will carry the user's credentials.
2. If the user has recently bought groceries, the script loads successfully with an *HTTP 200* status code. If the user hasn't bought groceries, the request fails to load with an *HTTP 404* status code, which triggers an [Error Event]({{< ref "./docs/attacks/error-events.md" >}}).
3. By listening to the error event and repeating this approach with different queries, the attacker can infer a significant amount of information about the user's transaction history.

{{< /hint >}}

在上面的例子中，两个不同来源的网站（*evil.com* 和 *bank.com*）通过浏览器允许网站使用的 API 进行了互动。这种互动没有利用浏览器或 *bank.com* 的任何漏洞，但它仍然允许 *evil.com* 获得用户在 *bank.com* 的数据信息。

In the example above, two websites of two different origins (*evil.com* and *bank.com*) interacted through an API that browsers allow websites to use.  This interaction didn't exploit any vulnerabilities in the browser or in *bank.com*, but it still allowed *evil.com* to gain information about the user's data on *bank.com*.

## 导致 XS-Leaks 的本质原因

大多数导致 XS-Leaks 的根本原因是来源于 web 平台的设计。很多时候，web 应用在没有做错任何事情的情况下就容易受到一些跨站信息泄露的影响。在浏览器层面修复导致 XS-Leaks 的本质原因是很具有挑战性的，因为在许多情况下，这样做会导致现存的网站出现问题。出于这个原因，浏览器现在正在实施各种[防御机制]({{< ref "defenses" >}})来解决这些问题。其中许多防御措施要求网站选择开启更严格的安全模式，通常是通过使用某些 HTTP 头（例如 *[Cross-Origin-Opener-Policy]({{< ref "./docs/defenses/opt-in/coop.md">}})：same-origin*），这一般需要结合起来使用才能达到预期效果。

The root cause of most XS-Leaks is inherent to the design of the web. Oftentimes applications are vulnerable to some cross-site information leaks without having done anything wrong. It is challenging to fix the root cause of XS-Leaks at the browser level because in many cases doing so would break existing websites. For this reason, browsers are now implementing various [Defense Mechanisms]({{< ref "defenses" >}}) to overcome these difficulties. Many of these defenses require websites to opt in to a more restrictive security model, usually through the use of certain HTTP headers (e.g. *[Cross-Origin-Opener-Policy]({{< ref "./docs/defenses/opt-in/coop.md">}}): same-origin*), which often must be combined to achieve the desired outcome.

我们可以分辨出不同类型的 XS-Leaks，例如：

We can distinguish different sources of XS-Leaks, such as:


1. 浏览器 API (例如 [Frame Counting]({{< ref "frame-counting.md" >}}) 与 [Timing Attacks]({{< ref "timing-attacks.md" >}}))
2. 浏览器的实现细节和 bug (例如 [Connection Pooling]({{< ref "./docs/attacks/timing-attacks/connection-pool.md" >}}) 与 [typeMustMatch]({{< ref "./docs/attacks/historical/content-type.md#typemustmatch" >}}))
3. 硬件 bugs (例如 Speculative Execution Attacks [^spectre])
---
1. Browser APIs (e.g. [Frame Counting]({{< ref "frame-counting.md" >}}) and [Timing Attacks]({{< ref "timing-attacks.md" >}}))
2. Browser implementation details and bugs (e.g. [Connection Pooling]({{< ref "./docs/attacks/timing-attacks/connection-pool.md" >}}) and [typeMustMatch]({{< ref "./docs/attacks/historical/content-type.md#typemustmatch" >}}))
3. Hardware bugs (e.g. Speculative Execution Attacks [^spectre])

## 一小段历史

XS-Leaks 长期以来一直是 web 平台的一部分；[timing attacks]({{< ref "network-timing.md" >}})会泄露用户网络活动，这个手段至少从 [2000 年](https://dl.acm.org/doi/10.1145/352600.352606)就已经广为人知。

XS-Leaks have long been part of the web platform;  [timing attacks]({{< ref "network-timing.md" >}}) to leak information about the user's web activity have been known since at least [2000](https://dl.acm.org/doi/10.1145/352600.352606).

为了增加它的威力，不断有新技术的推出，所以这类问题逐渐吸引了更多的关注 [^old-wiki]。2015 年，Gelernter 和 Herzberg 发表了 "Cross-Site Search Attacks" [^xs-search-first]，其中包括他们利用 timing attacks 对谷歌和微软部署的 Web 应用实施影响较大的 XS-Search 攻击的工作。从那时起，更多的 XS-Leak 技术被人发现和测试。

This class of issues has steadily attracted more attention [^old-wiki] as new techniques were found to increase their impact. In 2015, Gelernter and Herzberg published "Cross-Site Search Attacks" [^xs-search-first] which covered their work on exploiting timing attacks to implement high impact XS-Search attacks against web applications built by Google and Microsoft. Since then, more XS-Leak techniques have been discovered and tested.

最近，浏览器实现了各种新的[防御机制]({{< ref "defenses" >}})，使其更容易保护应用程序免受 XS-Leaks 的影响。

Recently, browsers have implemented a variety of new [defense mechanisms]({{< ref "defenses" >}}) that make it easier to protect applications from XS-Leaks.

## 关于本 wiki

这个 wiki 是为了向读者介绍 XS-Leaks，对于有经验的研究人员可以参考本 wiki 来利用 XS-Leaks。虽然这个 wiki 包含了许多不同技术的信息，但新的技术总是不断出现。无论是添加新的技术还是扩展现有的页面，我们都希望能有更多的改进!

This wiki is meant to both introduce readers to XS-Leaks and serve as a reference guide for experienced researchers exploiting XS-Leaks. While this wiki contains information on many different techniques, new techniques are always emerging. Improvements, whether they add new techniques or expand existing pages, are always appreciated!

在 [Contributions]({{< ref "contributions.md" >}})文章中了解如何为本 wiki 贡献力量，并可以查看贡献者名单。

Find out how you can contribute to this wiki and view the list of contributors in the [Contributions]({{< ref "contributions.md" >}}) article.

## 参考文献
[^side-channel]: Side Channel Vulnerabilities on the Web - Detection and Prevention, [link](https://owasp.org/www-pdf-archive/Side_Channel_Vulnerabilities.pdf)
[^csrf]: Cross Site Request Forgery (CSRF), [link](https://owasp.org/www-community/attacks/csrf)
[^browser-features]: 在某些情况下，维护这些功能是为了保持向后的兼容性。但是在其他情况下，新功能添加到浏览器时，没有考虑它们会带来潜在的跨站泄漏问题（例如 [Scroll to Text Fragment]({{< ref "scroll-to-text-fragment.md" >}})），因为人们认为其好处大于坏处。
[^old-wiki]: Browser Side Channels, [link](https://github.com/xsleaks/xsleaks/wiki/Browser-Side-Channels)
[^xs-search-first]: Cross-Site Search Attacks, [link](https://446h.cybersec.fun/xssearch.pdf)
[^spectre]: Meltdown and Spectre, [link](https://spectreattack.com/)
