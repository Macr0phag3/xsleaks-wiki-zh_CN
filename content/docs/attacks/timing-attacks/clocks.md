+++
title = "时钟"
description = ""
date = "2020-10-01"
category = "Instrument"
menu = "main"
weight = 1
+++

我们可以划分两种类型的时钟 —— 显式和隐式。开发者可以用来显式时钟直接测量时间，这种类型的机制是由浏览器明确提供的。相比之下，隐式时钟是利用特定的网络功能（本来不是用来计时的）来创建的时钟，可以测量时间的相对流逝。

We can distinguish two types of clocks – explicit and implicit. Explicit clocks are used by developers to get direct timing measurements, mechanisms of this type are offered explicitly by the browser. In contrast, implicit clocks utilize particular web features to create unintended clocks that allow measuring the relative passage of time.


## 显式时钟

### performance.now API
开发者可以通过 [performance.now()](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now) API 来进行高精度的时间测量。

The [performance.now()](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now) API allows developers to get high-resolution timing measurements.

{{< hint info >}}
为了缓解某些类型的 XS-Leaks，`performance.now()` 的精度在所有现代浏览器中从纳秒级降至微秒级[^1] [^2] [^3]。

In order to mitigate some types of XS-Leaks, `performance.now()`'s accuracy was reduced from a range of nanoseconds to microsecond precision in all modern browsers [^1] [^2] [^3].
<!-- TODO: "to mitigate some" means Size XS-Leaks that were fixed -->

[^1]: Reduce resolution of performance.now (Webkit). [link](https://bugs.webkit.org/show_bug.cgi?id=146531)
[^2]: Reduce precision of performance.now() to 20us (Gecko). [link](https://bugzilla.mozilla.org/show_bug.cgi?id=1427870)
[^3]: Reduce resolution of performance.now to prevent timing attacks (Blink). [link](https://bugs.chromium.org/p/chromium/issues/detail?id=506723)
{{< /hint >}}

### Date API
[Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) API 是浏览器中存在的最古老的 API，可以用来测量时间。它允许开发人员获得日期，还可以通过 `Date.now()` 来获得 Unix 时间戳。用这个 API 来测量时间的精度比用 [performance.now()](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now) 的精度要低得多。在引入更新的 API 之前，计时攻击通常使用的是这个 API[^3]。

The [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) API is the oldest API present in browsers which can be used to obtain timing measurements. It allows developers to get dates, and get Unix timestamps with `Date.now()`. These measurements are much less precise than [performance.now()](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now). Before the introduction of newer APIs, attacks used to leverage this API [^3].

## 隐式时钟

### SharedArrayBuffer and Web Workers
随着 `Web Workers` 的引入，一个可以在线程之间交换数据的新机制就被创建出来了[^1]。其中一个机制是 `SharedArrayBuffer`，它在主线程和工作线程之间提供内存共享。恶意网站可以通过加载一个运行无限循环的 worker 来创建一个隐式时钟，让缓冲区中的一个数字增加。然后，主线程可以在任何时候获取这个值，来判断执行了多少次加法运算。

With the introduction of `Web Workers`, new mechanisms to exchange data between threads were created [^1]. One of those mechanisms is `SharedArrayBuffer` which provides memory sharing between the main thread and a worker thread. A malicious website can create an implicit clock by loading a worker running an infinite loop that increments a number in the buffer. This value can then be accessed by the main thread at any time to read how many incrementations were performed.

{{< hint info >}}

随着 [Spectre](https://spectreattack.com/)的出现，`SharedArrayBuffer` 被浏览器移除。它在 2020 年晚些时候被重新引入，要求文档在[安全上下文](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer)中才能使用该 API。由于安全上下文中不能引用任何未明确选择访问的跨源内容，这意味着 SharedArrayBuffers 不再能被用作某些 XS-Leaks 的时钟。

`SharedArrayBuffer` was removed from browsers with the publication of [Spectre](https://spectreattack.com/). It was reintroduced later in 2020, requiring documents to be in a [secure context](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) to make use of the API. Since secure contexts cannot reference any cross-origin content that has not explicitly opted in to being accessed, this means SharedArrayBuffers cannot be used as clocks for some XS-Leaks.

为了在现代浏览器中使用 `SharedArrayBuffer`，应用需要通过设置以下头来明确选择加入 [COOP]({{< ref "../../defenses/opt-in/coop.md" >}}) 和 [COEP](https://web.dev/coop-coep/)：

To make use of `SharedArrayBuffer` in modern browsers, an application needs to explicitly opt in to [COOP]({{< ref "../../defenses/opt-in/coop.md" >}}) and [COEP](https://web.dev/coop-coep/) by setting the following headers:

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```
{{< /hint >}}


```javascript
// 定义一个在 WebWorker 内部运行的函数
// Define a function to be ran inside a WebWorker
function worker_function() {
  self.onmessage = function (event) {
    const sharedBuffer = event.data;
    const sharedArray = new Uint32Array(sharedBuffer);
    // 无限增大这个 uint32 数字
    // Infinitely increase the uint32 number
    while (true) Atomics.add(sharedArray, 0, 1);
  };
}

// 从 JS 函数中创建 WebWorker 并调用它
// Create the WebWorker from the JS function and invoke it
const worker = new Worker(
  URL.createObjectURL(
    new Blob([`(${worker_function})()`], {
      type: "text/javascript"
    }))
);

// 在 WebWorker 和 document 之间创建一个共享缓冲区
// Create a Shared buffer between the WebWorker and a document
const sharedBuffer = new SharedArrayBuffer(Uint32Array.BYTES_PER_ELEMENT);
const sharedArray = new Uint32Array(sharedBuffer);
worker.postMessage(sharedBuffer);
```

{{< hint tip >}}
为了获取主线程中的相对时间，你可以使用 [Atomics API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics)。

To get the relative time in a main thread, you can use the [Atomics API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics).

```javascript
Atomics.load(sharedArray, 0);
```

{{< /hint >}}


### 其他时钟
有相当多的 API 可以被攻击者利用来创建一个隐式时钟：[Broadcast Channel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API)、[Message Channel API](https://developer.mozilla.org/en-US/docs/Web/API/MessageChannel)、[requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)、[setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout)、CSS 动画，以及其他[^2] [^4] 。

There are a considerable number of APIs attackers can abuse to create implicit clocks: [Broadcast Channel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API), [Message Channel API](https://developer.mozilla.org/en-US/docs/Web/API/MessageChannel), [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame), [setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout), CSS animations, and others [^2] [^4].

## 参考文献

[^1]: Shared memory: Side-channel information leaks, [link](https://github.com/tc39/ecmascript_sharedmem/blob/master/issues/TimingAttack.md)
[^2]: Fantastic Timers and Where to Find Them: High-Resolution Microarchitectural Attacks in JavaScript, [link](https://gruss.cc/files/fantastictimers.pdf)
[^3]: Exposing Private Information by Timing Web Applications, [link](http://crypto.stanford.edu/~dabo/papers/webtiming.pdf)
[^4]: Trusted Browsers for Uncertain Times, [link](https://www.usenix.org/system/files/conference/usenixsecurity16/sec16_paper_kohlbrenner.pdf)
