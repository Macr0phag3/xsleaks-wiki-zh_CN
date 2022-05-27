+++
title = "Scroll to Text Fragment"
description = ""
date = "2020-10-01"
category = "Experiments"
abuse = [
    "onblur",
    "focus",
    "iframes",
]
defenses = [ "Document Policies" ]
menu = "main"
+++

Scroll to Text Fragment（STTF）是一个新的 Web 平台功能，允许用户链接到网页的任意文本上。fragment `#:~:text=` 包含一个文本片段，会浏览器高亮显示出来，且页面会滚动到高亮的部分。如果攻击者能够检测出这一行为是否发生，就会引入一个新的 XS-Leak。这个问题与 [Scroll to CSS Selector](https://docs.google.com/document/d/15HVLD6nddA0OaI8Dd0ayBP2jlGw5JpRD-njAyY1oNZo/edit#heading=h.wds2qckm3kh5) 的 XS-Leak 非常相似。

Scroll to Text Fragment (STTF) is a new web platform feature that allows users to create a link to any part of a web page text. The fragment `#:~:text=` carries a text snippet that is highlighted and brought into the viewport by the browser. This feature can introduce a new XS-Leak if attackers are able to detect when this behavior occurs. This issue is very similar to the [Scroll to CSS Selector](https://docs.google.com/document/d/15HVLD6nddA0OaI8Dd0ayBP2jlGw5JpRD-njAyY1oNZo/edit#heading=h.wds2qckm3kh5) XS-Leak.

## 预期内的、已讨论过的问题
在早期关于该功能规范的讨论中，已经发现了几个 XS-Leaks 可以容易地实现[^1]。该规范考虑了各种攻击情况[^3]，谷歌的研究也是如此[^4]。浏览器在实现该功能时需要注意的一个可能的 XS-Leak 是：

In early discussions regarding the specification of this feature it was shown that several XS-Leaks could be introduced with a naïve implementation [^1]. The specification considers various attack scenarios [^3], as does research from Google [^4]. One possible XS-Leak browsers need to be aware of when implementing this feature is:

- 攻击者可以用 `iframe` 嵌入一个页面，通过监听父 document 的 `onblur` 事件来检测该页面是否滚动到了文本。这种方法类似于 [ID Attribute XS-Leak]({{< ref "id-attribute.md" >}})。在 Chrome 的实现中缓解了这种问题[^5]，因为它只允许在顶层 navigate 中出现 fragment navigation。
---
- An attacker can, by embedding a page as an `iframe`, detect whether the page scrolled to the text by listening to the `onblur` event of the parent document. This approach is similar to the [ID Attribute XS-Leak]({{< ref "id-attribute.md" >}}). This scenario is mitigated in the Chrome implementation [^5], as it only allows fragment navigation to occur in top-level navigations.

## 当前问题

{{< hint warning >}}

这些 XS-Leaks 需要在目标页面上注入某种类型的标记。

These XS-Leaks require some type of markup injection on the target page.
{{< /hint >}}

在 STTF 的开发过程中，发现了新的攻击和检测 fragment navigation 的技巧。其中一些仍然有效：

During the development process of STTF, new attacks and tricks to detect fragment navigation were found. Some of them still work:

- 嵌入攻击者可控的 `iframe` 的网页可能允许攻击者确定是否发生了滚动事件（特指滚动到特定的文本位置）。这可以使用 [`IntersectionObserver`](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) API [^2] [^3] [^4] 来实现。
- 如果一个页面包含有 [Lazy Loading](https://web.dev/native-lazy-loading/) 的图片，攻击者可以通过检查图片是否被[缓存在浏览器中]({{< ref "../cache-probing.md" >}}) 来检测是否发生了包含图片的 fragment navigation。这是因为 [Lazy Loading](https://web.dev/native-lazy-loading/) 的图片只有在要展示出来时才会被获取（和缓存）。
---
- A web page that embeds an attacker-controlled `iframe` might allow the attacker to determine whether a scroll to the text has occurred. This can be done using the [`IntersectionObserver`](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) API [^2] [^3] [^4].
- If a page contains images with [Lazy Loading](https://web.dev/native-lazy-loading/), an attacker can detect if fragment navigation that included an image occurred by checking whether the image was [cached in the browser]({{< ref "../cache-probing.md" >}}). This works because [Lazy Loading](https://web.dev/native-lazy-loading/) images are only fetched (and cached) when they appear in the viewport.

{{< hint important >}}
Scroll to Text Fragment 只在 Chrome 中可用。其[草案](https://wicg.github.io/scroll-to-text-fragment/)规范正在讨论中。

Scroll to Text Fragment is only available in Chrome. Its [draft](https://wicg.github.io/scroll-to-text-fragment/) specification is under active discussion.
{{< /hint >}}

{{< hint info >}}
Scroll to Text Fragment XS-Leaks 允许攻击者一次提取 1 位信息，因为它只能观察到页面上是否存在一个单词，而且只有在用户与页面进行某种互动（如鼠标点击）时，才可以实现。

Scroll to Text Fragment XS-Leaks allow attackers to extract 1 bit of information at a time, as it's only possible to observe whether a single word exists on the page and only when a user performed some kind of interaction with the page (e.g. a mouse click).
{{< /hint >}}

## 为什么这是个问题呢？

攻击者可以滥用 STTF 来泄露显示在网页上的用户的私人信息。

Attackers can abuse STTF to leak private information about the user that is displayed on a web page.

### 设想场景
一个用户登录到他们的国家卫生系统网站，在那里可以获得该用户历史的疾病和健康问题的信息。攻击者可以将用户引诱到某个攻击者可控的页面，并使用 STTF 来可能推断出用户的健康信息。例如，如果攻击者在指定某种疾病的名称时检测到页面滚动，就会发现受害者患有该疾病。

A user is logged in to their National Health System website, where it is possible to access information about the user's past diseases and health problems. An attacker can lure the user to one of their pages and use STTF to possibly infer the user's health details. For example, an attacker would find out that the victim suffers from a disease if they detect a page scroll when searching for that disease's name.

## 防御

| [Document Policies]({{< ref "/docs/defenses/opt-in/document-policies.md" >}}) | [SameSite Cookies (Lax)]({{< ref "/docs/defenses/opt-in/same-site-cookies.md" >}}) | [COOP]({{< ref "/docs/defenses/opt-in/coop.md" >}}) | [Framing Protections]({{< ref "/docs/defenses/opt-in/xfo.md" >}}) |                                          [Isolation Policies]({{< ref "/docs/defenses/isolation-policies" >}})                                          |
| :--------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------: | :-------------------------------------------------: | :---------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------: |
|                                         ✔️                                          |                                         ✔️                                          |                          ❌                          |                                 ✔️                                 | [RIP]({{< ref "/docs/defenses/isolation-policies/resource-isolation" >}}) 🔗 [NIP]({{< ref "/docs/defenses/isolation-policies/navigation-isolation" >}}) |

## 参考文献

[^1]: Privacy concerns with proposal through inducing network requests, [link](https://github.com/WICG/scroll-to-text-fragment/issues/76)
[^2]: Possible side-channel information leak using IntersectionObserver, [link](https://github.com/WICG/scroll-to-text-fragment/issues/79)
[^3]: Text Fragments - Security and Privacy, [link](https://wicg.github.io/scroll-to-text-fragment/#security-and-privacy)
[^4]: Scroll-to-text Fragment Navigation - Security Issues, [link](https://docs.google.com/document/d/1YHcl1-vE_ZnZ0kL2almeikAj2gkwCq8_5xwIae7PVik/edit#)
[^5]: Boldly link where no one has linked before: Text Fragments, [link](https://web.dev/text-fragments/#privacy)
