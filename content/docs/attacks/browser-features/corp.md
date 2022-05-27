+++
title = "CORP 泄露"
description = ""
date = "2020-10-01"
category = "Attack"
abuse = [
    "Browser Feature",
]
defenses = [
    "Fetch Metadata",
    "SameSite Cookies",
]
menu = "main"
weight = 2
+++

## 解释说明

[Cross-Origin Resource Policy]({{< ref "/docs/defenses/opt-in/corp.md" >}}) (CORP)是一个 Web 平台安全能力，允许网站阻止某些资源被其他源加载。这种保护是对 [CORB]({{< ref "/docs/defenses/secure-defaults/corb.md" >}}) 的补充，因为它是一种选择式防御，而 CORB 默认会阻止一些跨源读取。不幸的是，与 [CORB]({{< ref "corb.md" >}}) 类似，如果应用在使用这种防护的时候配置错误，就会引入新的 XS-Leak。

[Cross-Origin Resource Policy]({{< ref "/docs/defenses/opt-in/corp.md" >}}) (CORP) is a web platform security feature that allows websites to prevent certain resources from being loaded by other origins. This protection complements [CORB]({{< ref "/docs/defenses/secure-defaults/corb.md" >}}) since it is an opt-in defense, whereas CORB blocks some cross-origin reads by default. Unfortunately, similar to [CORB]({{< ref "corb.md" >}}), applications can introduce a new XS-Leak if they misconfigure the use of this protection.

如果`CORP` 是基于用户数据执行的，网页将引入 XS-Leak。如果一个页面搜索功能在显示结果时执行 `CORP` ，但在没有返回结果时不执行，攻击者就能够区分这两种情况。这是因为受 `CORP` 保护的页面/资源，尝试进行跨源获取时将返回一个错误。

A webpage will introduce an XS-Leak if `CORP` is enforced based on user data. If a page search feature enforces `CORP` when showing results, but doesn't do so when returning no results, an attacker will be able to distinguish the two scenarios. This occurs because a page/resource protected by `CORP` will return an error when fetched cross-origin.

## 防御
如果一个应用可以保证所有的应用程序资源/路径中都部署了 `CORP`，就可以避免这种 XS-Leak。此外，可以阻止跨站请求的通用安全机制也将有助于防止这种攻击。

An application can avoid this XS-Leak if it guarantees `CORP` is deployed in all application resources/endpoints. Moreover, generic security mechanisms that allow the invalidation of cross-site requests will also help prevent this attack.

| [SameSite Cookies (Lax)]({{< ref "/docs/defenses/opt-in/same-site-cookies.md" >}}) | [COOP]({{< ref "/docs/defenses/opt-in/coop.md" >}}) | [Framing Protections]({{< ref "/docs/defenses/opt-in/xfo.md" >}}) |                                          [Isolation Policies]({{< ref "/docs/defenses/isolation-policies" >}})                                          |
| :--------------------------------------------------------------------------------: | :-------------------------------------------------: | :---------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------: |
|                                         ✔️                                          |                          ❌                          |                                 ❌                                 | [RIP]({{< ref "/docs/defenses/isolation-policies/resource-isolation" >}}) 🔗 [NIP]({{< ref "/docs/defenses/isolation-policies/navigation-isolation" >}}) |

🔗 – 防御机制必须结合起来才能有效地应对不同的情况。

