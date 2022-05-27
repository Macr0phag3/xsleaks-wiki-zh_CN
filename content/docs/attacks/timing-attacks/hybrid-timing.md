+++
title = "混合计时"
description = ""
date = "2020-10-01"
category = "Attack"
abuse = [
    "iframes",
]
defenses = [
    "Fetch Metadata",
    "SameSite Cookies",
    "COOP",
]
menu = "main"
weight = 3
+++

混合计时攻击允许攻击者测量影响最终计时结果的一组因素的总和。这些因素包括：

Hybrid Timing Attacks allow attackers to measure the sum of a group of factors that influence the final timing measurement. These factors include:

- [网络延迟]({{< ref "network-timing.md" >}})
- 文件解析
- 检索和处理子资源
- [代码执行]({{< ref "execution-timing.md" >}})
---
- [Network delays]({{< ref "network-timing.md" >}})
- Document parsing
- Retrieval and processing of subresources
- [Code execution]({{< ref "execution-timing.md" >}})

这些因素的价值因应用而异。例如，[网络计时]({{< ref "network-timing.md" >}})对于有更多后台处理的页面可能更重要，而[运行期间计时]({{< ref "execution-timing.md" >}})对于在浏览器中处理和显示数据的应用可能更重要。攻击者也可以消除其中的一些因素，来获得更精确的测量结果。例如，攻击者可以在页面嵌入 `iframe` 让浏览器预先加载所有的子资源（这样就可以强迫浏览器缓存这些资源），然后进行第二次测量，这样就可以排除加载这些子资源所带来的任何延迟。

Some of the factors differ in value depending on the application. This means that [Network Timing]({{< ref "network-timing.md" >}}) might be more significant for pages with more backend processing, while [Execution Timing]({{< ref "execution-timing.md" >}}) can be more significant in applications processing and displaying data within the browser. Attackers can also eliminate some of these factors to obtain more precise measurements. For example, an attacker could preload all of the subresources by embedding the page as an `iframe` (forcing the browser to cache the subresources) and then perform a second measurement, which excludes any delay introduced by the retrieval of those subresources.

## Frame 计时攻击 (混合型)
如果页面没有设置 [Framing Protections]({{< ref "../../defenses/opt-in/xfo.md" >}})，攻击者可以获得包含所有因素的混合测量结果。这种攻击类似于[基于网络的攻击]({{< ref "network-timing.md#frame-timing-attacks-network" >}})，但是当资源被检索时，页面由浏览器渲染和执行（取走子资源、执行 JavaScript）。在这种情况下，只有当页面完全加载（包括子资源和执行脚本）时才会触发 `onload` 事件。

If a page does not set [Framing Protections]({{< ref "../../defenses/opt-in/xfo.md" >}}), an attacker can obtain a hybrid measurement that considers all of the factors. This attack is similar to a [Network-based Attack]({{< ref "network-timing.md#frame-timing-attacks-network" >}}), but when the resource is retrieved, the page is rendered and executed by the browser (subresources fetched and JavaScript executed). In this scenario, the `onload` event only triggers once the page fully loads (including subresources and script execution).

```javascript
var iframe = document.createElement('iframe');
// 设置目标网站的 URL
// Set the URL of the destination website
iframe.src = "https://example.org";
document.body.appendChild(iframe);

// 记录发起请求之前的时间
// Measure the time before the request was initiated
var start = performance.now();

iframe.onload = () => {
  // 当 iframe 加载时，计算出时间差
  // When iframe loads, calculate the time difference
  var time = performance.now() - start;
  console.log("The iframe and subresources took %d ms to load.", time)
}
```

## 防御

|  攻击类型   | [SameSite Cookies (Lax)]({{< ref "/docs/defenses/opt-in/same-site-cookies.md" >}}) | [COOP]({{< ref "/docs/defenses/opt-in/coop.md" >}}) | [Framing Protections]({{< ref "/docs/defenses/opt-in/xfo.md" >}}) |  [Isolation Policies]({{< ref "/docs/defenses/isolation-policies" >}})   |
| :-------------------: | :--------------------------------------------------------------------------------: | :-------------------------------------------------: | :---------------------------------------------------------------: | :----------------------------------------------------------------------: |
| Frame Timing (Hybrid) |                                         ✔️                                          |                          ❌                          |                                 ✔️                                 | [FIP]({{< ref "/docs/defenses/isolation-policies/framing-isolation" >}}) |
