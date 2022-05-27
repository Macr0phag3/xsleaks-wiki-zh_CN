+++
title = "Frame 计数"
description = ""
date = "2020-10-01"
category = [
    "Attack",
]
abuse = [
    "iframes",
]
defenses = [
    "Fetch Metadata",
    "SameSite Cookies",
    "COOP",
    "Framing Protections",
]
menu = "main"
weight = 2
+++

window 引用对象允许跨源页面访问其他页面的一些属性。当使用或允许 `iframe` 和 `window.open` 时，就可以使用这些引用对象。这些引用对象能提供的关于 window 的信息是有限的，因为它们仍然需要遵守同源策略。

Window references allow cross-origin pages to get access to some of the attributes of other pages. These references become available when using or allowing `iframe` and `window.open`. The references provide (limited) information about the window as they still respect the same-origin policy.

其中一个可访问的属性是 `window.length`，它代表的是 window 中 frame 数量。这个属性可以为攻击者提供有关页面的有价值的信息。

One of the accessible attributes is `window.length` which provides the number of frames in the window. This attribute can provide valuable information about a page to an attacker.

网站往往会用到 frame（或 `iframe`），这并不意味着存在安全问题。但是在一些情况下，网站可能会根据用户信息来改变页面上的 frame 的数量。如果一个网站会根据 `GET` 参数和 被攻击者 的数据来改变页面的布局，攻击者就有可能通过检测不同页面上的 `window.length` 的值来推断出 被攻击者 的信息。

Websites commonly use frames (or `iframes`) and this choice doesn't necessarily imply security issues. There are, however, cases where a website might change the number of frames on a page depending on some user information. For example, this could happen on a page that changes its layout depending on the `GET` parameters and the victim's data. It might be possible for an attacker to infer information about the victim by measuring the value of `window.length` on different pages.

## 代码片段
下面的片段演示了如何获取一个跨站页面中 frame 的数量。

The below snippet demonstrates how to access the information about the number of frames on a cross-site page:
```javascript
// 获取 window 的引用对象
var win = window.open('https://example.org');

// 等待页面加载
setTimeout(() => {
  // 获取已加载的 iframes 数量
  console.log("%d iframes detected", win.length);
}, 2000);
```

## 攻击的替代方案

在某些情况下，不同的应用程序状态具有相同的 frames 数量，这会使得攻击者无法区别出来。但是，在页面加载时连续记录 frame，可能可以分析出一种特征，这或许会向攻击者泄露信息。

In some cases, different application states have the same number of `frames`, preventing attackers from being able to distinguish them. However, continuously recording the frame count while the page is loading may show a pattern that might leak information to an attacker:

```javascript
// 获取 window 引用对象
var win = window.open("https://example.org");
var pattern = [];

// 在一个循环中，每 60ms 的获取一次 iframes 的数量。
var recorder = setInterval(() => {
  pattern.push(win.length)
}, 60);

// 6 秒之后跳出循环
setTimeout(() => {
   clearInterval(recorder);
   console.log("The pattern is: %s", pattern.join(', '));
}, 6 * 1000);
```

## 设想场景


一些 frame 计数攻击的例子：

Some examples of frame counting attacks are:

- 一个网站允许用户搜索用户信息。如果页面结构根据用户查询是否有结果而有不同数量的 `iframe`，攻击者就可以使用 [XS-Search]({{< ref "xs-search.md" >}}) 来泄露这些秘密信息。
- 一个网站根据性别或其他 PII 以不同的方式生成用户资料页面。攻击者在加载页面之后，统计 frame 数量就可以轻易地获取这些信息。

---
- A website lets a user search for user information in a search engine. If the page structure has a different number of `iframes` depending on whether there are results to the user query, an attacker could use the [XS-Search]({{< ref "xs-search.md" >}}) technique to leak those secrets.
- A website structures the user profile page differently based on gender or other PII. An attacker can easily leak this information by opening the page and counting frames.

## 防御

| 攻击方式 | [SameSite Cookies (Lax)]({{< ref "/docs/defenses/opt-in/same-site-cookies.md" >}}) | [COOP]({{< ref "/docs/defenses/opt-in/coop.md" >}}) | [Framing Protections]({{< ref "/docs/defenses/opt-in/xfo.md" >}}) |    [Isolation Policies]({{< ref "/docs/defenses/isolation-policies" >}})    |
| :----------------: | :--------------------------------------------------------------------------------: | :-------------------------------------------------: | :---------------------------------------------------------------: | :-------------------------------------------------------------------------: |
|      iframes       |                                         ✔️                                          |                          ❌                          |                                 ✔️                                 |  [FIP]({{< ref "/docs/defenses/isolation-policies/framing-isolation" >}})   |
|      windows       |                                         ❌                                          |                          ✔️                          |                                 ❌                                 | [NIP]({{< ref "/docs/defenses/isolation-policies/navigation-isolation" >}}) |

## 真实案例

一个报告给 Facebook 的漏洞利用这一技术泄露了用户的相关信息，例如帖子中包含的特定内容、朋友们的宗教信息或照片的地理位置[^1]。

A vulnerability reported to Facebook used this technique to leak user-related information such as specific content published in posts, religious information about friends, or photo locations[^1].

## 参考文献

[^1]: Patched Facebook Vulnerability Could Have Exposed Private Information About You and Your Friends. [link](https://www.imperva.com/blog/facebook-privacy-bug/)
