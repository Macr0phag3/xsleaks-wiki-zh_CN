+++
title = "XS-Search"
description = ""
date = "2020-10-01"
category = [
    "Attack",
    "Attack Principle",
]
defenses = [
    "Fetch Metadata",
    "SameSite Cookies",
]
menu = "main"
weight = 1
+++

跨站搜索（XS-Search）是 XS-Leaks 家族中的一个重要攻击原理。这种类型的攻击利用的是基于查询的搜索系统，通过攻击者的源泄露用户信息[^1] [^2]。最初的攻击使用基于时间的测量来检测搜索系统是否返回结果，其工作原理如下：

Cross-site search (XS-Search) is an important attack principle in the family of XS-Leaks. This type of attack abuses Query-Based Search Systems to leak user information from an attacker origin [^1] [^2]. The original attack uses timing measurements to detect whether or not a search system returns results and works as follows:

1. 建立一个请求返回响应所需时间的基线（命中），以及一个没有结果的请求所需时间的基线（没命中）。
2. 开始对搜索系统进行[timing attack]({{< ref "./timing-attacks/network-timing.md" >}})，对第一个字符（`?q=r`）进行暴力破解。
3. 如果测量结果在命中基线以下，则再新增一个字符(`?q=ra`)；否则尝试其他字符(`?q=s`)。
4. 最后，一个完整的敏感信息(`?q=secret`)就会泄露出来。
---
1. Establish a baseline of the time needed for a request to return results (hit), and a baseline for the time needed by a request with no results (miss).
2. Start a [timing attack]({{< ref "./timing-attacks/network-timing.md" >}}) on the request to the search endpoint, brute-forcing the first character (`?q=r`).
3. If the measurement is under the hit baseline, then add one more character (`?q=ra`); otherwise try a new one (`?q=s`).
4. In the end, a full secret (`?q=secret`) can be leaked.

这种攻击需要进行多次计时才会准确，这一点可以通过膨胀技术和统计分析来改进。此外，攻击者可以通过搜索特定的单词或句子来尝试泄露特定的内容，而不是逐个字母地进行暴力破解。

This attack requires multiple timing measurements to be accurate, something which can be improved with inflation techniques and statistical analysis. Furthermore, instead of brute-forcing letter by letter, attackers can search specific words or sentences to leak only the occurrence of results.

这种攻击最重要的部分是它的原理，因为它可以应用于一些不同的 XS-Leaks。

The most important part of this attack is its principle, as it can be applied to a number of different XS-Leaks.

## 膨胀技术

XS-Search 的膨胀技术可以用来提高攻击的准确性，使两种响应类型（命中或未命中）更容易区分。以下两种机制使攻击者能够进行更好地进行测量：

The inflation techniques of XS-Search are used to increase the accuracy of the attack to make the two response types (hit or miss) easier to distinguish. The following two mechanisms  allow attackers to make better measurements:

- 如果一个搜索系统在返回结果时将某些 GET 参数添加在响应中，响应的大小就会增加。这会使得这个请求更加独特，因为准备这种响应并通过网络发送它的时间会大幅增长。
- 迫使服务器在返回响应之前进行更多的计算工作。这种方法可以应用于提供更多表达式查询语言的搜索系统（例如，在 Gmail 中，如果有排除词，需要处理结果中的每一个字符）。

- If a search system reflects certain GET parameters into the response when returning results, the size of the response increases. This makes the request more distinguishable because the time to prepare the response and send it over the network grows substantially.
- Force the server to perform more computation work before returning a response. This approach can be applied in search systems offering more expressive query languages (e.g. exclude terms in Gmail needs to process every character in the results).

## 扩展原理

虽然一开始围绕 XS-Search 的研究是集中在利用计时攻击完成的，但 XS-Search 攻击的原理也延伸到了其他 XS-Leaks。攻击者可以利用其他 XS-Leaks 来提取相同的信息，而不是依赖这种不可靠的计时。

While the original research around XS-Search focused on timing attacks, the principle of the attack extends to other XS-Leaks. Instead of relying on timing measurements, which are unreliable, attackers can use other XS-Leaks to extract the same information.

在一个基于查询的搜索系统中，用户提交查询并获得与这些查询相关的回应。这一行动可能导致两种不同的结果：

In a Query-Based Search System, a user submits queries and gets responses associated with those queries. This action can result in two different outcomes:

1. 系统显示结果，页面以特定的方式展示（第一种状态）。
2. 系统不显示结果，页面的行为与步骤 1 不同（第二种状态）。
---
1. The system shows results and the page behaves in a specific way (first state).
2. The system does not show results and the page behaves in a different way than in step 1 (second state).

如果上述两种行为都可以通过比计时更可靠的 XS-Leak 来区分，那么攻击者就可以进行更有效的 XS-Search 攻击。例如，如果页面上的 frame 数会根据搜索结果而变化（步骤 1 和 2 就可以区分了），这个攻击原理可以用[Frame Counting]({{< ref "frame-counting.md" >}}) XS-Leak，这可能会比利用计时时长来区分更准确。

If both behaviors above can be distinguished by a more reliable XS-Leak than timing, then an attacker could perform a more efficient XS-Search attack. For example, if the number of frames on a page varies based on search results (step 1 and 2 are distinguishable), this attack principle can be applied with a [Frame Counting]({{< ref "frame-counting.md" >}}) XS-Leak which could be more accurate than one using timing measurements.


## 防御

| 攻击方式 | [SameSite Cookies (Lax)]({{< ref "/docs/defenses/opt-in/same-site-cookies.md" >}}) | [COOP]({{< ref "/docs/defenses/opt-in/coop.md" >}}) | [Framing Protections]({{< ref "/docs/defenses/opt-in/xfo.md" >}}) |                                          [Isolation Policies]({{< ref "/docs/defenses/isolation-policies" >}})                                          |
| :----------------: | :--------------------------------------------------------------------------------: | :-------------------------------------------------: | :---------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------: |
| XS-Search (timing) |                                         ✔️                                          |                          ❌                          |                                 ❌                                 | [RIP]({{< ref "/docs/defenses/isolation-policies/resource-isolation" >}}) 🔗 [NIP]({{< ref "/docs/defenses/isolation-policies/navigation-isolation" >}}) |

🔗 – 防御机制必须结合起来才能有效地应对不同的情况。

## 参考文献

[^1]: Cross-Site Search Attacks, [link](https://446h.cybersec.fun/xssearch.pdf)
[^2]: Cross-Site Search (XS-Search) Attacks - Hemi Leibowitz, OWASP AppSec IL 2015, [link](https://owasp.org/www-pdf-archive/AppSecIL2015_Cross-Site-Search-Attacks_HemiLeibowitz.pdf)
