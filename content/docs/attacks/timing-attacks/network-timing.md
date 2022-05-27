+++
title = "网络计时"
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

自网络诞生以来，网络计时的侧信道就一直存在[^1] [^4]。这些攻击随着时间的推移产生了不同程度的影响，当浏览器开始提供像 [performance.now()]({{< ref "clocks.md#performancenow" >}}) 这样的高精度定时器时，这种攻击方式重新引起了人们的关注。

Network Timing side-channels have been present on the web since its inception [^1] [^4]. These attacks have had different levels of impact over time, gaining new attention when browsers started shipping high-precision timers like [performance.now()]({{< ref "clocks.md#performancenow" >}}).

为了获得计时的结果，攻击者必须使用[时钟]({{< ref "clocks.md" >}})，无论是隐式还是显式。就 XS-Leaks 而言，这些时钟通常是可以互换的，只是在精度和可用性上有所不同。为简单起见，本文假设使用 `performance.now()` API，这是所有现代浏览器中的显性时钟。

To obtain timing measurements, attackers must use a [clock]({{< ref "clocks.md" >}}), either an implicit or an explicit one. These clocks are usually interchangeable for the purposes of XS-Leaks and only vary in accuracy and availability. For simplicity, this article assumes the use of the `performance.now()` API, an explicit clock present in all modern browsers.

这个侧信道允许攻击者根据完成该请求所需的时间，来推断出跨站请求的信息[^2]。网络计时测量可能会根据用户状态而变化，它通常与这些相关：

This side-channel allows attackers to infer information from a cross-site request based on how much time it takes to complete that request [^2]. The network timing measurement may vary based on the user state and it's usually connected to the:

- 资源规模。
- 后台的计算时间。
- 子资源的数量和大小。
- [缓存状态]({{< ref "../cache-probing.md" >}})。

---
- Resource size.
- Computation time in the backend.
- Number and size of sub-resources.
- [Cache status]({{< ref "../cache-probing.md" >}}).

{{< hint tip >}}
在 [“时钟” 一文]({{< ref "clocks.md" >}})中了解更多关于不同类型时钟的信息。

Learn more about the different types of clocks in the [Clocks article]({{< ref "clocks.md" >}}).
{{< /hint >}}

## 现代网络计时攻击
[performance.now()]({{< ref "clocks.md#performancenow" >}}) API 可以用来测量执行一个请求所需的时间。

The [performance.now()]({{< ref "clocks.md#performancenow" >}}) API can be used to measure how much time it takes to perform a request:

```javascript
// 启动时钟
// Start the clock
var start = performance.now()

// 测量完成请求所需的时间
// Measure how long it takes to complete the fetch requests
fetch('https://example.org', {
  mode: 'no-cors',
  credentials: 'include'
}).then(() => {
  // 当请求完成的时候，计算时间差
  // When fetch finishes, calculate the difference
  var time = performance.now() - start;
  console.log("The request took %d ms.", time);
});
```
## Onload 事件
与上面流程类似，通过监控 `onload` 事件，也可以用来测量获取资源所需的时间

A similar process can be used to measure how long it takes to fetch a resource by simply watching for an `onload` event:

```javascript
// 创建一个脚本元素指向我们要计时的页面
// Create a script element pointing to the page we want to time
var script = document.createElement('script');
script.src = "https://example.org";
document.body.appendChild(script);

// 启动时钟
// Start the clock
var start = performance.now();

// 脚本加载时，计算完成请求所需的时间
// When script loads, caculate the time it took to finish the request
script.onload = () => {
  var time = performance.now() - start;
  console.log("The request took %d ms.", time)
}
```

{{< hint tip >}}
上述技术也可用于其他 HTML 元素，如 `<img>`、`<link>` 或 `<iframe>`。例如，假设 [Fetch Metadata]({{< ref "/docs/defenses/opt-in/fetch-metadata.md">}}) 阻止将资源加载到脚本标签，那它可能允许将其加载到图像标签。

A similar technique can be used for other HTML elements, e.g. `<img>`, `<link>`, or `<iframe>`, which could be used in scenarios where other techniques fail. For example, if [Fetch Metadata]({{< ref "/docs/defenses/opt-in/fetch-metadata.md">}}) blocks loading a resource into a script tag, it may allow loading it into an image tag.
{{< /hint >}}

{{< hint tip >}}
另一种方法是使用 `image.complete` 属性。更多信息在[这里](https://riccardomerlano.github.io/xs-leaks/cache-probing-through-image.complete-property/)。

An alternative way could be to use `image.complete` property. More information [here](https://riccardomerlano.github.io/xs-leaks/cache-probing-through-image.complete-property/).
{{< /hint >}}

## 跨窗口计时攻击
攻击者也可以通过用 `window.open` 打开一个新窗口并等待 `window` 开始加载，来测量页面的网络时间。下面的片段显示了如何进行这种测量。

An attacker can also measure the network timing of a page by opening a new window with `window.open` and waiting for the `window` to start loading. The snippet below shows how to make this measurement:

```javascript
// 打开一个新窗口，测量 iframe 开始加载的时间。
// Open a new window to measure when the iframe starts loading
var win = window.open('https://example.org');
// 记录初始时间
// Measure the initial time
var start = performance.now();
// 定义循环函数
// Define the loop
function measure(){
  try{
    // 如果页面已经加载，那么它将在一个不同的源上，所以 `win.orign 将会抛出一个异常`
    // If the page has loaded, then it will be on a different origin
    // so `win.origin` will throw an exception
    win.origin;
    // 如果窗口仍然是同源的，立即重复循环，但不阻塞事件循环。
    // If the window is still same-origin, immediately repeat the loop but
    // without blocking the event loop
    setTimeout(measure, 0);
  }catch(e){
    // 一旦窗口加载完毕，计算出时间差
    // Once the window has loaded, calculate the time difference
    var time = performance.now() - start;
    console.log('It took %d ms to load the window', time);
  }
}
// 启动循环，当窗口切换源时，就会中断。
// Initiate the loop that breaks when the window switches origins
measure();
```
{{< hint note >}}
请注意，这个 POC 使用 `setTimeout` 来创建一个大致相当于 `while(true)` 的循环，这么做是为了避免阻塞 JS 的事件循环。

Note that this POC uses `setTimeout` in order to create the rough equivalent of a `while(true)` loop. It is necessary to implement it in this way in order to avoid blocking the JS event loop.
{{< /hint >}}

{{< hint tip >}}
这项技术也可以通过[使事件循环繁忙]来测量一个页面的执行时间（{{< ref "execution-timing.md#busy-event-loop" >}}）。

This technique can also be adapted to measure the Execution Timing of a page by [making the event loop busy]({{< ref "execution-timing.md#busy-event-loop" >}}).
{{< /hint >}}

## Unload 事件
[`unload`](https://developer.mozilla.org/en-US/docs/Web/API/Window/unload_event) 和 [`beforeunload`](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event) 事件可以用来测量获取资源所需的时间。这是因为 `beforeunload` 是在浏览器准备发起一个新的请求时触发的，而 `unload` 是在该请求真实发生时触发的。由于存在这种行为上的差异，我们就可以通过计算这两个事件之间的时间差，测量出浏览器完成获取资源的时间。

The [`unload`](https://developer.mozilla.org/en-US/docs/Web/API/Window/unload_event) and [`beforeunload`](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event) events can be used to measure the time it takes to fetch a resource. This works because `beforeunload` is triggered when the browser requests a new navigation request, while `unload` is triggered when that navigation actually occurs. Because of this behaviour, it is possible to calculate the time difference between these two events and measure the time it took the browser to complete fetching the resource. 

{{< hint info >}}
`unload` 和 `beforeunload `之间的时间差不受 `x-frame-options`（XFO）头的影响，因为这两个事件是在浏览器接收到到响应头之前触发的。

The time difference between `unload` and `beforeunload` is not affected by the `x-frame-options` (XFO) header, because the event is triggered before the browser learns about the response headers. 
{{< /hint >}}

下面的片段利用了 [SharedArrayBuffer 时钟]({{< ref "clocks.md#sharedarraybuffer and-web-workers" >}})，它在运行该片段之前需要初始化。

The below snippet makes use of the [SharedArrayBuffer clock]({{< ref "clocks.md#sharedarraybuffer-and-web-workers" >}}) which needs to be initiated before the snippet is ran:
```javascript
// 创建一个供 WebWorker 使用的 Shared buffer
// Create a Shared buffer to be used by a WebWorker
var sharedBuffer = new SharedArrayBuffer(Uint32Array.BYTES_PER_ELEMENT);
var sharedArray = new Uint32Array(sharedBuffer);

// 按照初始化 WebWorker 的步骤执行完毕后，再调用
// Follow the steps of initiating the WebWorker and then call
worker.postMessage(sharedBuffer);

var start;
iframe.contentWindow.onbeforeunload = () => {
  // 在 navigate 期间获取 "time" 
  // Get the "time" during the navigation
  start = Atomics.load(sharedArray, 0);
}
iframe.contentWindow.onpagehide = () => {
  // 在 navigate 完成之后获取 "time" 
  var end = Atomics.load(sharedArray, 0);
  console.log('The difference between events was %d iterations', end - start);
};
```

{{< hint tip >}}
[SharedArrayBuffer 时钟]({{< ref "clocks.md#sharedarraybuffer-and-web-workers" >}})被用来创建一个高精度的计时器。然而，iframes 的 `beforeunload` 和 `unload`事件之间的时间差也可以用其他时钟测量，例如 *performance.now()*。

The [SharedArrayBuffer clock]({{< ref "clocks.md#sharedarraybuffer-and-web-workers" >}}) was used to create a high-resolution timer. However, the time difference between the `beforeunload` and `unload` events of iframes can be measured with other clocks as well, e.g. *performance.now()*.
{{< /hint >}}

{{< hint tip >}}
之前介绍的代码片段利用的是 iframe 来进行测量。这种攻击的一个变种是使用窗口引用对象，这种类型的攻击更加难防范。

The presented snippet makes use of iframes to make the measurement. A variation of this attack can also use window references, which is harder to protect against.

{{< /hint >}}

## 沙箱化的 Frame 计时攻击

如果一个页面没有使用任何 [Framing Protections]({{< ref "../../defenses/opt-in/xfo.md" >}})，攻击者可以计算出页面和所有子资源通过网络加载所需的时间。默认情况下，iframe 的 `onload` 函数是在所有资源加载完毕、所有 JavaScript 执行完毕后调用的。但是，攻击者可以通过在 `<iframe>` 中加入 [`sandbox`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe) 属性来消除执行脚本引入的“噪音”。设置这个属性会禁用很多功能，包括 JavaScript 的执行。所以这可以实现一个非常纯粹的网络测量。

If a page doesn't have any [Framing Protections]({{< ref "../../defenses/opt-in/xfo.md" >}}) implemented, an attacker can time how long it takes for the page and all subresources to load over the network. By default, the `onload` handler for an iframe is invoked after all the resources have been loaded and all JavaScript has finished executing. But, an attacker can eliminate the noise of script execution by including the [`sandbox`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe) attribute in the `<iframe>`. This attribute blocks a lot of features including JavaScript execution, which results in almost pure network measurement.

```javascript
var iframe = document.createElement('iframe');
// 设置目标网站的URL
// Set the URL of the destination website
iframe.src = "https://example.org";
// 设置 sandbox 属性来禁止脚本执行
iframe.sandbox = "";
document.body.appendChild(iframe);

// 记录请求发起前的时间
// Measure the time before the request was initiated
var start = performance.now();

iframe.onload = () => {
  // 当 iframe 加载时，计算出时间差
  // When iframe loads, calculate the time difference
  var time = performance.now() - start;
  console.log("The iframe and subresources took %d ms to load.", time)
}
```

## 不计时的计时攻击
其他类型的攻击可以不用“时间”这一概念来进行定时攻击[^3]。这种定时攻击包含将两个 `HTTP` 请求（基线请求和攻击请求），将它们装入一个数据包来保证它们可以同时到达服务器。服务器*将*同时处理这些请求，并尽快返回响应（执行时间的不同，返回响应所需的时长也不同）。两个请求中的一个将先到达，允许攻击者通过对比请求到达的顺序来推断时间差。

Other types of attacks do not consider the notion of time to perform a timing attack [^3]. Timeless attacks consist of fitting two `HTTP` requests (the baseline and the attacked request) in a single packet, to guarantee they arrive to the server at the same time. The server *will* process the requests concurrently, and return a response based on their execution time as soon as possible. One of the two requests will arrive first, allowing the attacker to infer the time difference by comparing the order in which the requests arrived.

这项技术的优势在于不受网络抖动和未知延迟的影响，而这一点在其他技术中始终存在。

The advantage of this technique is the independence from network jitter and uncertain delays, something that is always present in the remaining techniques.

{{< hint important >}}
这种攻击仅限于 HTTP 的特定版本和特殊场景。它做出了某些假设，并对服务器行为有要求。

This attack is limited to specific versions of HTTP and joint scenarios. It makes certain assumptions and has requirements regarding server behavior.
{{< /hint >}}

## 防御

|   攻击类型   | [SameSite Cookies (Lax)]({{< ref "/docs/defenses/opt-in/same-site-cookies.md" >}}) | [COOP]({{< ref "/docs/defenses/opt-in/coop.md" >}}) | [Framing Protections]({{< ref "/docs/defenses/opt-in/xfo.md" >}}) |                                          [Isolation Policies]({{< ref "/docs/defenses/isolation-policies" >}})                                          |
| :--------------------: | :--------------------------------------------------------------------------------: | :-------------------------------------------------: | :---------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------: |
| 现代定时攻击  |                                         ✔️                                          |                          ❌                          |                                 ❌                                 | [RIP]({{< ref "/docs/defenses/isolation-policies/resource-isolation" >}}) 🔗 [NIP]({{< ref "/docs/defenses/isolation-policies/navigation-isolation" >}}) |
| Frame 计时攻击（网络） |                                         ✔️                                          |                          ❌                          |                                 ❌                                 |                                        [FIP]({{< ref "/docs/defenses/isolation-policies/framing-isolation" >}})                                         |
| Frame 计时攻击（沙箱） |                                         ✔️                                          |                          ❌                          |                                 ❌                                 |                                        [FIP]({{< ref "/docs/defenses/isolation-policies/framing-isolation" >}})                                         |
|  跨窗口计时攻击   |                                         ❌                                          |                          ✔️                          |                                 ❌                                 |                                       [NIP]({{< ref "/docs/defenses/isolation-policies/navigation-isolation" >}})                                       |
|    不计时的计时攻击     |                                         ✔️                                          |                          ✔️                          |                                 ❌                                 |                                                                            ❓                                                                            |

🔗 – 防御机制必须结合起来才能有效地应对不同的情况。


## 参考文献

[^1]: Exposing Private Information by Timing Web Applications, [link](https://crypto.stanford.edu/~dabo/papers/webtiming.pdf)
[^2]: The Clock is Still Ticking: Timing Attacks in the Modern Web - Section 4.3.3, [link](https://tom.vg/papers/timing-attacks_ccs2015.pdf)
[^3]: Timeless Timing Attacks: Exploiting Concurrency to Leak Secrets over Remote Connections, [link](https://www.usenix.org/system/files/sec20-van_goethem.pdf)
[^4]: Cross-domain search timing, [link](https://scarybeastsecurity.blogspot.com/2009/12/cross-domain-search-timing.html)
