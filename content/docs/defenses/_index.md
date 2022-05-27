---
weight: 20
bookFlatSection: true
title: "防御机制"
---

# 防御机制
防御所有可能的 [XS-Leaks 攻击向量]({{< ref "../attacks/" >}})并不是一件容易的任务。每个攻击向量都会影响到不同的网络和浏览器组件，并有其怪异的地方。一些 bug 赏金计划，如谷歌 VRP，甚至停止了给新的 XS-Leaks 报告支付赏金，因为他们专注于庞大的系统性升级来防御 XS-Leaks [^1]。谷歌和许多其他公司认为，修复 XS-Leaks 的正确方法是将时间和工程力量投入到[新的大规模缓解措施和网络平台的升级]({{< relref "_index.md#opt-in-mechanisms" >}})，这样应用程序可以借此来防御所有类型的 XS-Leaks。

Defending against all possible [XS-Leaks Attack Vectors]({{< ref "../attacks/" >}}) is not a trivial task. Each one of the attack vectors affects different web and browser components and has its quirks. Some bug bounty programs, such as Google VRP, even stopped paying for new XS-Leaks reports as they are focusing on large systemic changes to defend against XS-Leaks [^1]. Google and many other companies believe that the right approach to fixing XS-Leaks is to invest time and engineering power into [new large scale mitigations and changes to the web platform]({{< relref "_index.md#opt-in-mechanisms" >}}) that applications can use to mitigate entire categories of XS-Leaks.

浏览器现在提供了一些有用的选择机制，可以用来减轻 XS-Leaks 的影响。虽然这些机制提供了强有力的保护，但缺点是并非所有浏览器都很好地支持了这些机制。有效防御 XS-Leaks 需要混合使用不同的技术，下文将详细介绍每一种技术。

Browsers now provide a number of useful opt-in mechanisms that can be used to mitigate XS-Leaks. While these provide strong protections, the disadvantage is that they are not yet well supported by every browser. Defending against XS-Leaks effectively requires a mixture of different techniques, each of which is described in detail below.

## Opt-in 机制

这些[防御机制]({{< ref "opt-in/_index.md" >}})可以让应用程序同时解决一组相似类型的 XS-Leaks。这些保护措施可以让应用改变浏览器的行为，或者提供额外的信息，让应用程序可以用来改变自己的行为。

These [defense mechanisms]({{< ref "opt-in/_index.md" >}}) allow applications to address classes of similar XS-Leaks at the same time. These protections can either allow applications to change the behavior of the browser or provide additional information that applications can use to change their own behavior.

{{< hint tip >}}
部署一个组合式的 opt-in 防御机制应该是默认的策略。它们不仅能防止 XS-Leaks，还能防止其他漏洞，如 XSSI、Clickjacking、CSRF 等。

Deploying a combination of opt-in defense mechanisms should be the default strategy. Not only do they protect against XS-Leaks, but also against other vulnerabilities such as XSSI, Clickjacking, CSRF, etc.
{{< /hint >}}

{{< hint important >}}
当使用依赖浏览器支持的防御措施时，一定要检查你客户的浏览器是否支持这些措施。例如，`fetch metadata` 头是一个很好的工具，但目前只有基于 Chromium 的浏览器可以支持。查阅 [MDN](https://developer.mozilla.org/en-US/)可以了解不同标准的浏览器支持情况的最新信息。

When using any mitigations that rely on browser support, be sure to check that they are well supported by your customers' browsers. For example, `fetch metadata` headers are a great tool, but are currently only supported in Chromium-based browsers. Check [MDN](https://developer.mozilla.org/en-US/) for up-to-date information on browser support for different standards.
{{< /hint >}}

## 应用程序设计
应用设计[技术]({{< ref "design-protections/_index.md" >}})专注于如何精心设计应用程序来防止 XS-Leaks。当立即启用更强的全局保护措施不现实时，这是一个非常有用的方法。另一个很大的优势是，即使在不支持最新浏览器标准的旧版浏览器上，精心设计的应用程序也能阻止 XS-Leaks。

Application design [techniques]({{< ref "design-protections/_index.md" >}}) are focused on carefully designing the application in a way that prevents XS-Leaks. This is a very useful approach when it is not practical to enable stronger global protections immediately. The other big advantage is that careful application design can stop XS-Leaks even on older browsers that don't support the newest browser standards.

{{< hint note >}}
使用应用设计技术来阻止整个应用中的每一个 XS-Leak 技术是非常困难的。虽然应用设计技术可以有效地阻止严重的泄漏，但浏览器提供的 [opt-in 机制]({{< relref "_index.md#opt-in-mechanisms" >}})是更好的整体解决方案。

It is very difficult to use application design techniques to block every XS-Leak technique across an entire application. While application design techniques are effective at stopping severe leaks, [opt-in mechanisms]({{< relref "_index.md#opt-in-mechanisms" >}}) provided by the browser are a better overall solution.
{{< /hint >}}

## 默认安全
浏览器供应商正在积极改变[默认行为]({{<ref "secure-defaults/_index.md" >}})，来帮助缓解本 wiki 中提到的一些 XS-Leaks 问题。改变默认行为是在提高安全性和保持向后兼容性之间的平衡艺术。

Browser vendors are actively working on changing [default behaviors]({{< ref "secure-defaults/_index.md" >}}) to help mitigate some of the XS-Leaks mentioned in this wiki. Changing default behaviors is a balancing act between improving security and preserving backwards compatibility.

{{< hint important >}}
默认安全有惊人的价值！它们可以协助保护应用程序和用户，而不需要开发者做任何额外的工作。但请注意，它们不太可能完全防止 XS-Leaks。

Secure defaults are amazing! They can help protect applications and users without any additional effort from developers. But note that they're unlikely to completely prevent XS-Leaks.
{{< /hint >}}

## 参考文献

[^1]: Google Bughunter University - XSLeaks and XS-Search, [link](https://sites.google.com/site/bughunteruniversity/nonvuln/xsleaks)
