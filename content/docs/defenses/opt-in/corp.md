+++
title = "Cross-Origin-Resource-Policy"
description = ""
date = "2020-10-01"
category = [
    "Defense",
]
menu = "main"
+++

跨源资源策略（CORP）是一个 Web 平台的安全功能，网站可以通过这个功能阻止其他源加载某些资源。这种保护是对 CORB 的补充，因为它是一种 opt-in 的防御，而 CORB 默认会阻止一些跨源读取行为。CORP 的设计是为了防止推测型攻击和 XS-Leaks，开发人员可以借此确保敏感资源不会进入到攻击者控制的进程中。与 CORB 不同的是，CORP 保护只有在应用程序选择进行保护时才会在浏览器中执行。应用程序可以只允许特定的一组来源（"same-site"、"same-origin"、"cross-site"）读取资源。

Cross-Origin Resource Policy (CORP) is a web platform security feature that allows websites to prevent certain resources from being loaded by other origins. This protection complements CORB since it is an opt-in defense, whereas CORB blocks some cross-origin reads by default. CORP is designed to protect against both speculative execution attacks and XS-Leaks by allowing developers to ensure that sensitive resources cannot end up in attacker-controlled processes. Unlike CORB, this protection is enforced in the browser only if an application opts in to the protection. Applications can define which groups of origins ('same-site', 'same-origin', 'cross-site') are allowed to read their resources.

如果一个应用程序将某个资源的 CORP 头设置为 "same-site "或 "same-origin"，攻击者就无法读取该资源。这是一个非常强大的、非常值得肯定的保护措施。

If an application sets a certain resource CORP header as 'same-site' or 'same-origin', an attacker is incapable of reading that resource. This is a very strong and highly encouraged protection. 

在使用 CORP 时，要注意：

When using CORP, be aware of the following facts:

* CORP 不对 navigate 请求进行保护。这意味着在不支持 out-of-process iframe 的浏览器中，如果不使用 [framing protections]({{< ref "../opt-in/xfo.md" >}})，受 CORP 保护的资源仍然可能出现在另一个源的进程里。
* 使用 CORP 引入了[一个新的 XS-Leak]({{< ref "../../attacks/browser-features/corp.md" >}})，它允许攻击者检测在某个请求中是否执行了 CORP。
---
* CORP does not protect against navigational requests. This means that in browsers that do not support out-of-process iframes, a CORP-protected resource may still end up in another origin's process if [framing protections]({{< ref "../opt-in/xfo.md" >}}) are not used. 
* The use of CORP introduces [a new XS-Leak]({{< ref "../../attacks/browser-features/corp.md" >}}), which allows attackers to detect whether CORP was enforced in a certain request.

## 参考资料

[^1]: Cross-Origin Resource Policy (CORP), [link](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cross-Origin_Resource_Policy_(CORP))
