+++
title = "Cross-Origin Read Blocking"
description = ""
date = "2020-10-01"
category = "Defense"
menu = "main"
+++

Cross-Origin Read Blocking（CORB）是一种安全机制，可以防止攻击者加载某些跨源资源[^1]。这种保护机制是为了防御 Spectre 等取巧的旁路攻击，这种攻击允许攻击者读取两个跨站页面（如 *attacker.com* 和 *sensitive.com*）所嵌入的进程的内存。CORB 旨在防止攻击者将某些敏感的跨源资源加载到攻击者控制的进程中。例如，CORB 可以阻止攻击者试图将跨源的 HTML、XML 或 JSON加载到 `img` 标签中。有了 CORB，在这个场景下就像服务器没有返回数据一样。

Cross-Origin Read Blocking (CORB) is a security mechanism that prevents attackers from loading certain cross-origin resources [^1]. This protection was created to defend against speculative side-channel attacks such as Spectre that allow attackers to read the memory of the process that both cross-site pages (e.g. *attacker.com* and *sensitive.com*) were embedded into. CORB aims to prevent attackers from loading certain sensitive cross-origin resources into an attacker-controlled process. For example, if an attacker tries to load cross-origin HTML, XML, or JSON into an `img` tag, CORB prevents this from happening. With CORB, the scenario is treated as though the server returned no data.

为了对资源进行分类，CORB 使用 `Content-Type` 头、`nosniff` 头和各种其他启发式方法。

To classify resources, CORB uses the `Content-Type` header, the `nosniff` header, and a variety of other heuristics.

{{< hint info >}}
[Cross-Origin Resource Policy (CORP)]({{< ref "../opt-in/corp.md" >}}) 是一种执行和扩展 CORB 的 opt-in 保护措施。

[Cross-Origin Resource Policy (CORP)]({{< ref "../opt-in/corp.md" >}}) is an opt-in protection which enforces and extends CORB.
{{< /hint >}}

在使用 CORB 时，要注意以下事项：

When using CORB, be aware of the following facts:

* 目前，只有基于 Chromium 的浏览器支持 CORB。
* CORB 并不保护 navigational 请求。这意味着在不支持 out-of-process iframe 的浏览器中，如果不使用 [framing protections]({{< ref "../opt-in/xfo.md" >}})，受 CORB 保护的资源仍然可能进入到另一个源的进程中。
* CORB 引入了[新的 XS-Leak]({{< ref "../../attacks/browser-features/corb.md" >}}) 技术，因为攻击者可以观察到 CORB 的结果。这可能导致各种信息泄露。然而，在大多数情况下，这些信息泄露的影响比起通过巧妙执行攻击导致的泄露数据，影响要小。
---
* Currently, only Chromium-based browsers support CORB.
* CORB does not protect against navigational requests. This means that in browsers that do not support out-of-process iframes, a CORB-protected resource may still end up in another origin's process if [framing protections]({{< ref "../opt-in/xfo.md" >}}) are not used.
* CORB introduces a [new XS-Leak]({{< ref "../../attacks/browser-features/corb.md" >}}) technique since attackers may be able to observe the results of CORB. This can lead to a variety of information leaks. However, in most cases, these information leaks have a lower impact than the data that could be leaked via speculative execution attacks.


## 参考资料

[^1]: Cross-Origin Read Blocking for Web Developers, [link](https://chromium.googlesource.com/chromium/src/+/master/services/network/cross_origin_read_blocking_explainer.md)
