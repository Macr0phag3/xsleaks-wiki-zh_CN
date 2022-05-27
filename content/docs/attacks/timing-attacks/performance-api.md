+++
title = "性能相关 API"
description = ""
date = "2020-10-01"
category = [
    "Attack",
]
abuse = [
    "window.performance",
]
defenses = [
    "SameSite Cookies",
    "CORB",
]
menu = "main"
weight = 2
+++
## 性能相关 API
通过 [`Performance API`](https://developer.mozilla.org/en-US/docs/Web/API/Performance) 可以获取性能相关信息。通过 [`Resource Timing API`](https://developer.mozilla.org/en-US/docs/Web/API/Resource_Timing_API) 可以获取网络请求时间的相关信息，例如持续时间，若有一个 `Timing-Allow-Origin: *` 头时，还可以获取服务器传输数据的大小和域名查询的时间。

The [`Performance API`](https://developer.mozilla.org/en-US/docs/Web/API/Performance) provides access to performance-related information enhanced by the data from the [`Resource Timing API`](https://developer.mozilla.org/en-US/docs/Web/API/Resource_Timing_API) which provides the timings of network requests such as the duration but when there’s a `Timing-Allow-Origin: *` header sent by the server the transfer size and domain lookup time is also provided.

这些数据可以通过使用 [`performance.getEntries`](https://developer.mozilla.org/en-US/docs/Web/API/Performance/getEntries) 或 [`performance.getEntriesByName`](https://developer.mozilla.org/en-US/docs/Web/API/Performance/getEntriesByName) 来获取。

This data can be accessed by using [`performance.getEntries`](https://developer.mozilla.org/en-US/docs/Web/API/Performance/getEntries) or [`performance.getEntriesByName`](https://developer.mozilla.org/en-US/docs/Web/API/Performance/getEntriesByName).

也可以使用 [`performance.now()`](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now) 的差值来获得执行花费的时间，但是这对于 chrome 来说似乎不太精确，因为它只提供毫秒数。

It can also be used to get the execution time using the difference of [`performance.now()`](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now) however this seems to be less precise for a chrome fetch because it only provides the milliseconds.

## 网络链路耗时
从 `performance` API 中获取一个请求的网络链路耗时是可行的。

It is possible to retrieve the network duration of a request from the `performance` API.

下面的片段发起了一个网络请求，然后在 200ms 后从 `performance` 对象中获得消耗的时间。

The below snippet performs a network request then after 200ms it gets the duration from the `performance` object. 

```javascript
async function getNetworkDuration(url) {
    let href = new URL(url).href;
    // 使用图像而不是 fetch()，因为一些请求持续的时间为 0
    // Using an image instead of fetch() as some requests had duration = 0
    let image = new Image().src = href;
    // 等待请求被添加到 performance.getEntriesByName() 中
    // Wait for request to be added to performance.getEntriesByName();
    await new Promise(r => setTimeout(r, 200));
    // 获取最后添加的请求的持续时间
    // Get last added timings
    let res = performance.getEntriesByName(href).pop();
    console.log("Request duration: " + res.duration);
    return res.duration
}

await getNetworkDuration('https://example.org');
```
{{< hint info >}}
与其他浏览器不同的是，Firefox 提供了以毫秒为单位的测量结果。

Unlike other browsers, Firefox provides the measurements in milliseconds.
{{< /hint >}}

## 检测 X-Frame-Options
在 embed 展示一个页面时，如果有 `X-Frame-Options`头时，它不会被添加到 Chrome 的 `performance` 对象中。

If displaying a page inside an embed (e.g. because of the `X-Frame-Options` header) it will not be added to the `performance` object in Chrome.
```javascript
async function isFrameBlocked(url) {
    let href = new URL(url).href;
    // 在该函数运行之前，可能有对该网址的请求。
    // There may be requests for this url before the function was run.
    let start_count = performance.getEntriesByName(href).length;
    let embed = document.createElement('embed');
    embed.setAttribute("hidden", true);
    embed.src = href;
    document.body.appendChild(embed);
    // 等待请求被添加到 performance.getEntriesByName() 中。
    // Wait for request to be added to performance.getEntriesByName();
    await new Promise(r => setTimeout(r, 1000));
    // 移除测试的 embed
    // Remove test embed
    document.body.removeChild(embed)
    return performance.getEntriesByName(href).length === start_count;
}

await isFrameBlocked('https://example.org');
```
{{< hint note >}}
这种技术似乎只在基于 Chromium 的浏览器中有效。

This technique does seem to only work in Chromium based browsers
{{< /hint >}}

## 检测缓存的资源
通过 `performance` API，有可能可以检测一个资源是否被缓存。

With the `performance` API it is possible to detect whether a resource was cached or not.

资源在检查过程中会被缓存，除非触发了 [Cross-Origin Read Blocking]({{< ref "../../defenses/secure-defaults/corb.md" >}})（资源为 html）

Unless [Cross-Origin Read Blocking]({{< ref "../../defenses/secure-defaults/corb.md" >}}) is triggered (resource is html) the resource will get cached in the processs of the check.  
```javascript
async function ifCached2(url) {
    let href = new URL(url).href;
    await fetch(href, {mode: "no-cors", credentials: "include"});
    // 等待请求被添加到 performance.getEntriesByName() 中。
    // Wait for request to be added to performance.getEntriesByName();
    await new Promise(r => setTimeout(r, 200));
    // 获取最后添加的请求的持续时间
    // Get last added timings
    let res = performance.getEntriesByName(href).pop();
    console.log("Request duration: " + res.duration);
    // 检查是不是 304
    // Check if is 304
    if (res.encodedBodySize > 0 && res.transferSize > 0 && res.transferSize < res.encodedBodySize) return true
    if (res.transferSize > 0) return false;
    if (res.decodedBodySize > 0) return true;
    // 如果没有 Timing-Allow-Origin 头，就会使用 duration
    // Use duration if theirs no Timing-Allow-Origin header
    return res.duration < 10;
}
```

## 测量连接速度

还可以对连接的速度进行测量。

It is possible to measure the speed of the connection in octets.
```javascript
async function getSpeed(count = 10) {
    var total = 0;
    // 发起多个请求，取平均值
    // Make multiple requests for average
    for (let i = 0; i < count; i++) {
        // 绕过缓存，向当前源发出请求
        // Make request to the current origin bypassing cache
        await fetch(location.href, {cache: "no-store"});
        // 等待添加计时结果
        // Wait for timings to get added
        await new Promise(r => setTimeout(r, 200));
        // 获取 location 的最后一次计时的
        // Get latest timing for location
        let page = window.performance.getEntriesByName(location.href).pop();
        // 响应时间除以传输数据的大小
        // Get response time divided by transferSize
        total += (page.responseEnd - page.responseStart) / page.transferSize;
    }
    // 获取请求的平均响应时间
    // Get average response time for requests
    return total/count
}

await averageSpeed = getSpeed();
```
