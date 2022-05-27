+++
title = "执行时间计时"
description = ""
date = "2020-10-01"
category = "Attack"
abuse = [
    "Event Loop",
    "Service Workers",
    "Site Isolation",
    "CSS Injections",
    "Regex Injections",
    "iframes",
]
defenses = [
    "Fetch Metadata",
    "SameSite Cookies",
    "COOP",
    "Framing Protections",
]
menu = "main"
weight = 3
+++

攻击者可以通过测量浏览器中 JavaScript 的执行时间来得知某些事件何时被触发，以及一些操作需要多长时间。

Measuring the time of JavaScript execution in a browser can give attackers information on when certain events are triggered, and how long some operations take.

## 事件循环计时
JavaScript 的并发模型是基于一个[单线程事件循环](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop)，这意味着它一次只能运行一个任务。例如，如果某个耗时的任务阻塞了事件循环，用户就会发现页面被冻结了，因为 UI 线程被卡住了，其他任务必须等待，直到阻塞的任务完成。每个浏览器都实现了不同的[进程模型](https://www.chromium.org/developers/design-documents/process-models)，这意味着一些网站可能根据它们之间关系在不同的线程（和事件循环）中运行。

JavaScript's concurrency model is based on a [single-threaded event loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop) which means it can only run one task at a time. If, for example, some time-consuming task blocks the event loop, the user can perceive a freeze on a page as a result of the UI thread being starved. Other tasks must wait until the blocking task finishes. Each browser implements different [process models](https://www.chromium.org/developers/design-documents/process-models), which means some web sites might run in different threads (and event loops) depending on their relations.

一些技术可以利用这种模式来窃取跨源页面的秘密：

Some techniques can exploit this model to steal secrets from a cross-origin page:

- 通过测量事件池中下一步的运行时间，来推断来自不同来源的代码运行时需要花费多长时间 [^1] [^2]。攻击者不断向事件循环发送具有固定属性的事件，如果池是空的，这些事件就会被执行。其他源会将事件指派到相同的池中，这时攻击者可以通过检测其指派的某个任务是否发生延迟来得到时间差。
- 如果攻击者可以对比自己可控的字符串和秘密信息，那么就可以从跨源页中窃取该秘密信息。这是通过逐字符的字符串比较[^2]的事件循环中的时间差（使用上述技术）来完成的。在没有[进程隔离](https://www.chromium.org/Home/chromium-security/site-isolation)的浏览器中，不同源之间的跨窗口通信是在同一个线程中运行的，因此它们共享一个事件循环。
---
- Inferring how long code from a different origin takes to run by measuring how long it takes to run next in the event pool [^1] [^2]. The attacker keeps sending events to the event loop with fixed properties, which will eventually be dispatched if the pool is empty. Other origins dispatch events to the same pool, and this is where an attacker infers the time difference by detecting if a delay occurred with one of its tasks.
- Stealing a secret from a cross-origin page if the said secret is being compared by an attacker-controlled string. The leak is a result of comparing time differences in the event loop of a char-by-char string comparison [^2] (using the previous technique). In browsers without [process isolation](https://www.chromium.org/Home/chromium-security/site-isolation), cross-window communications between different origins run in the same thread, thus sharing the same event loop.

{{< hint important >}}
第二种攻击在有进程隔离机制的浏览器中已不可行。这种机制目前只存在于基于 Chromium 的浏览器的[站点隔离](https://www.chromium.org/Home/chromium-security/site-isolation)中；它们很快就会以[项目裂变](https://wiki.mozilla.org/Project_Fission)的名称应用到 Firefox 中。

The latter attack is no longer possible in browsers with process isolation mechanisms in place. Such mechanisms are currently only present in Chromium-based browsers with [Site Isolation](https://www.chromium.org/Home/chromium-security/site-isolation); they are coming to Firefox *soon* under the name [Project Fission](https://wiki.mozilla.org/Project_Fission).
{{< /hint >}}

## Busy Event Loop
另一种用于测量 JavaScript 执行情况的技术是，先阻断线程的事件循环，然后计时测量经过多久对事件循环可再次使用。这种技术的主要优点之一是它能够规避网站隔离，因为攻击者的源可以影响另一个源的执行。该攻击的工作原理如下：

Another technique used to measure JavaScript execution consists of blocking the event loop of a thread and timing how long it takes for the event loop to become available again. One of the main advantages of this technique is its ability to circumvent Site Isolation, as an attacker origin can influence the execution of another origin. The attack works as follows:

1. 用 `window.open` 在一个单独的窗口中访问目标网站，或者在一个 `iframe` 内访问（如果[Framing Protections]({{< ref "../../defenses/opt-in/xfo.md" >}}) 没有开启的话）。
2. 等待漫长的计算启动。
3. 在 `iframe` 内加载任何同网站的页面，无需考虑 [Framing Protections]({{< ref "../../defenses/opt-in/xfo.md" >}})。
---
1. Navigate the target website in a separate window with `window.open` or inside an `iframe` (if [Framing Protections]({{< ref "../../defenses/opt-in/xfo.md" >}}) are not in place).
2. Wait for the long computation to start.
3. Load any same-site page inside an `iframe`, regardless of any [Framing Protections]({{< ref "../../defenses/opt-in/xfo.md" >}}).

攻击者可以通过对 `iframe`（在步骤 3 中）触发 `onload` 事件的时间进行计时，来检测目标网站的执行时间（步骤 3 的 [Network Timing]({{< ref "network-timing.md" >}}) 应该是最小的）。由于两个请求都发生在同一个上下文中，而且它们是同站的，所以它们在同一个线程中运行，并共享同一个事件循环（它们可以互相阻塞）。

An attacker can detect how long the target website is executed by timing how long it took for the `iframe` (in step 3) to trigger the `onload` event ([Network Timing]({{< ref "network-timing.md" >}}) of step 3 should be minimal). Since both navigations occurred within the same context and they are same-site, they run in the same thread and share the same event loop (they can block each other).

```javascript
// 打开一个新的窗口，对窗口阻塞网站 example.org 的事件循环的时间进行计时
// Open a new window to measure how long the window blocks the event loop
// for the site example.org
window.open('https://example.org/expensive');

// TODO: 等待 expensive 窗口加载，然后创建一个同站的 iframe
// TODO: Wait for the expensive window to load, e.g. via timeout
// then create an iframe to the same site
var ifr = document.createElement('iframe');
ifr.src = "https://example.org";
document.body.appendChild(ifr);

// 测量初始时间
// Measure the initial time
var start = performance.now();

ifr.onload = () => {
    // 当 iframe 加载时，计算出时间差
    // When the iframe loads calculate the time difference
    var time = performance.now() - start;
    console.log('It took %d ms to load the window', time);
}
```

## Service Workers
[Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) 可用于为网络应用程序提供离线场景下的解决方案，但它们可能被攻击者利用来测量 JavaScript 执行的时间[^4]。它们作为浏览器和网络之间的代理，允许应用程序拦截主线程（document）的任何网络请求。

[Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) can be used to offer offline solutions to web applications, but they can be abused by attackers to measure the timing of JavaScript execution[^4]. They serve as a proxy between the browser and the network and allow applications to intercept any network requests made by the main thread (document).

为了进行计时，攻击者可以执行以下步骤：

To make a timing measurement, an attacker can perform the following steps:

1. 攻击者在他们的一个域（attacker.com）中注册了一个 service worker。
2. 在 main document 中，攻击者向目标网站发出一个请求（window.open），并让 service worker 启动定时器。
3. 当新窗口开始加载时，攻击者将步骤 2 中获得的引用对象 navigate 到由 service worker 处理的页面。
4. 当步骤 3 中执行的请求到达 service worker 时，它返回一个 204（无内容）的响应，从而中止了 navigate。
5. 此时，Service Worker 可以通过步骤 2 中启动的计时器中获取测量值。该测量值受 JavaScript 阻塞导航时间影响。
---
1. The attacker registers a service worker in one of their domains (attacker.com).
2. In the main document, the attacker issues a navigation (window.open) to the target website and instructs the Service Worker to start a timer.
3. When the new window starts loading, the attacker navigates the reference obtained in step 2 to a page handled by the Service Worker.
4. When the request performed in step 3 arrives at the service worker, it returns a 204 (No Content) response, which aborts the navigation.
5. At this point, the Service Worker collects a measurement from the timer started in step 2. This measurement is affected by how long JavaScript blocked the navigation.

由于实际上并没有真正地进行 navigate，所以可以重复步骤 3 到 5，来获得更多关于 JavaScript 执行时间的测量。

Since no navigation actually occurs, steps 3 to 5 can be repeated to obtain more measurements on successive JavaScript execution timings.

### jQuery, CSS 选择器 & 短路计时
攻击者可以利用 CSS 选择器的另一个有趣的行为，这就是表达式的 `短路运算`。该表达式在 `URL` hash 中获取，并在页面执行 `jQuery(location.hash)` 时进行运算 [^3]。

Attackers can abuse another interesting behavior of CSS selectors which is `short-circuit` evaluation of expressions. This expression is received in a `URL` hash and evaluated if the page executes `jQuery(location.hash)` [^3].

计时攻击是可行的，因为表达式是从右向左比较的，所以如果选择器 `main[id='site-main']` 没有匹配到，无法进行运算，那么选择器的其他部分（`*:has(*:has(*:has(*))))`），会被忽略（和 `and` 操作符类似，但表达式优先级的方向相反），然后可能被忽略的这一部分，被攻击者设置为需要更长的执行时间来执行。

A timing attack is possible because the expression is compared from right to left, so if the selector `main[id='site-main']` does not match and fails to evaluate, the other parts of the selector (`*:has(*:has(*:has(*))))`), which take longer to execute, are ignored (just like the `and` operator, but backwards).

```javascript
$("*:has(*:has(*:has(*)) *:has(*:has(*:has(*))) *:has(*:has(*:has(*)))) main[id='site-main']")
```  

{{< hint tip >}}
在具有进程隔离机制的浏览器中，可以利用 [Service Workers]({{< ref "execution-timing.md#service-workers" >}}) 对执行时间进行计时，或者像 [Busy Event Loop tricks]({{< ref "#busy-event-loop" >}}) 这样的技巧可以用来规避站点隔离。

In browsers with process isolation mechanisms, [Service Workers]({{< ref "execution-timing.md#service-workers" >}}) can be abused to obtain the execution timing measurement or tricks like [Busy Event Loop tricks]({{< ref "#busy-event-loop" >}}) can be used to circumvent Site Isolation.
{{< /hint >}}

## ReDoS

{{< hint warning >}}
要用到这类 XS-Leaks 需要能够在目标页面上注入 Regex 表达式。

This group of XS-Leaks requires an injection of Regex Expressions on the target page.
{{< /hint >}}

正则表达式拒绝服务（ReDoS）是一种在允许用户输入正则表达式的应用程序中导致拒绝服务的技术[^2] [^5]。恶意构造的正则表达式在运行时可以耗费指数级的时间。如果注入的正则表达式根据页面上数据的不同会有不同的运行时间，这就可以作为一个 XS-Leak 的载体。这可能发生在客户端或服务器端。

Regular Expression Denial of Service (ReDoS) is a technique which results in a Denial of Service in applications that allow regex as user input [^2] [^5]. Maliciously crafted regular expressions can be made to run in exponential time. This can be used as an XS-Leak vector if a regex can be injected that has a different runtime depending on the data on the page. This could happen on the client-side or the server-side.


## 防御

| 攻击类型 | [SameSite Cookies (Lax)]({{< ref "/docs/defenses/opt-in/same-site-cookies.md" >}}) | [COOP]({{< ref "/docs/defenses/opt-in/coop.md" >}}) | [Framing Protections]({{< ref "/docs/defenses/opt-in/xfo.md" >}}) |    [Isolation Policies]({{< ref "/docs/defenses/isolation-policies" >}})    |
| :----------------: | :--------------------------------------------------------------------------------: | :-------------------------------------------------: | :---------------------------------------------------------------: | :-------------------------------------------------------------------------: |
|   T. Event Loop    |                                         ❌                                          |                          ❓                          |                                 ❌                                 | [NIP]({{< ref "/docs/defenses/isolation-policies/navigation-isolation" >}}) |
|  Service Workers   |                                         ✔️                                          |                          ✔️                          |                                 ❌                                 | [NIP]({{< ref "/docs/defenses/isolation-policies/navigation-isolation" >}}) |
|       jQuery       |                                         ✔️                                          |                          ❌                          |                                 ❌                                 | [NIP]({{< ref "/docs/defenses/isolation-policies/navigation-isolation" >}}) |
|       ReDoS        |                                         ✔️                                          |                          ❌                          |                                 ❌                                 | [NIP]({{< ref "/docs/defenses/isolation-policies/navigation-isolation" >}}) |
|  Busy Event Loop   |                                         ✔️                                          |                          ✔️                          |                                 ❌                                 | [NIP]({{< ref "/docs/defenses/isolation-policies/navigation-isolation" >}}) |


## 参考文献

[^1]: Loophole: Timing Attacks on Shared Event Loops in Chrome, [link](https://www.usenix.org/system/files/conference/usenixsecurity17/sec17-vila.pdf)
[^2]: Matryoshka - Web Application Timing Attacks (or.. Timing Attacks against JavaScript Applications in Browsers), [link](https://sirdarckcat.blogspot.com/2014/05/matryoshka-web-application-timing.html)
[^3]: A timing attack with CSS selectors and Javascript, [link](https://blog.sheddow.xyz/css-timing-attack/)
[^4]: Security: XS-Search + XSS Auditor = Not Cool, [link](https://bugs.chromium.org/p/chromium/issues/detail?id=922829)
[^5]: A Rough Idea of Blind Regular Expression Injection Attack, [link](https://diary.shift-js.info/blind-regular-expression-injection/)
