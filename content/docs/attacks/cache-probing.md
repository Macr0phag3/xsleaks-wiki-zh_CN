+++
title = "缓存探测"
description = ""
category = "Attack"
abuse = [
    "window.open",
    "Error Events",
    "Cache",
    "iframes",
    "AbortController"
]
defenses = [
    "SameSite Cookies",
    "Vary: Sec-Fetch-Site",
    "Subresource Protections",
]
menu = "main"
weight = 2
+++

缓存探测的原理是检测一个资源是否被浏览器缓存。这个概念从网络诞生之初就已经广为人知[^4]，最初是通过检测计时结果的差异来实现的。

The principle of Cache Probing consists of detecting whether a resource was cached by the browser. The concept has been known since the beginning of the web [^4] and initially relied on detecting timing differences.

当用户访问一个网站时，取走一些资源例（如图像、脚本和 HTML 内容）之后，在某些条件下会被浏览器缓存。这种优化使得未来的访问速度更快，因为浏览器直接从磁盘上提供这些资源，而不是再次通过网络请求它们。如果攻击者能够检测到哪些资源被缓存，这些信息就会泄露用户出是否访问过某个特定页面。

When a user visits a website, some resources such as images, scripts, and HTML content are fetched and later cached by the browser (under certain conditions). This optimization  makes future navigations faster as the browser serves those resources from disk instead of requesting them again. If an attacker can detect which resources are cached, this information can be enough to leak whether a user accessed a specific page in the past.

缓存探测的一个变种是利用[报错事件]({{< ref "../attacks/error-events.md" >}})来进行更准确和强力的攻击。

A variation of Cache Probing abuses [Error Events]({{< ref "../attacks/error-events.md" >}}) to perform more accurate and impactful attacks.

## 攻击原理

攻击者想知道一个用户是否访问过某个社交网络：

An attacker wants to know whether a user visited a certain social network:

1. 当用户访问社交网络时，一些子资源会被缓存起来。
2. 用户访问一个被攻击者控制的页面，该页面会去获取一些资源，这些资源通常是从社交网络那里获取的。
3. 使用 [Network Timing XS-Leak]({{< ref "../attacks/timing-attacks/network-timing.md" >}})，攻击者页面可以检测到来自缓存（步骤 1 发生）或来自网络（步骤 1 没有发生）的响应之间的差异：如果请求的结果是直接从缓存中返回的，延迟会明显降低。
---
1. When the user visits the social network some of the subresources are cached.
2. The user visits an attacker-controlled page which fetches a resource that is usually fetched by the social network.
3. Using a [Network Timing XS-Leak]({{< ref "../attacks/timing-attacks/network-timing.md" >}}), the attacker page can detect the difference between a response coming from the cache (i.e. step 1 occurred) or coming from the network (i.e. step 1 did not occur): the delay is significantly lower if a request is served from the cache.

## 结合报错的缓存探测

使用[报错事件]({{< ref "../attacks/error-events.md" >}})的缓存探测[^2]可以进行更精确的攻击。这种方法不依靠计时，而是利用[报错事件]({{< ref "../attacks/error-events.md" >}})和一些服务器端的行为来检测资源是否被缓存。该攻击需要以下步骤：

Cache Probing with [Error Events]({{< ref "../attacks/error-events.md" >}}) [^2] allows more accurate attacks. Instead of relying on timing measurements, this approach leverages [Error Events]({{< ref "../attacks/error-events.md" >}}) and some server-side behavior to detect whether a resource was cached. The attack requires the following steps:

1. 在浏览器缓存中，[使资源无效]({{< ref "#invalidating-the-cache" >}})。这一步是必须的，这可以避免攻击被另一次访问中缓存的资源所影响。
2. 发起一个特殊的请求，这个请求会使得浏览器根据用户的状态，缓存不同的内容。例如，只有在用户已登录之后才会加载一个包含特定图片的页面。这个请求可以通过使用 `<link rel=prerender.` 来 navigate 到目标网站、在`iframe`中嵌入网站、或者使用 `window.open`打开一个新窗口来触发。
3. 触发一个会被服务器拒绝的请求。例如，包含一个[超长 referer 头](https://lists.archive.carbon60.com/apache/users/316239)，使服务器拒绝这次请求。如果资源在步骤 2 中被缓存过了，这个请求就会成功，而不是触发一个报错事件。
---
1. [Invalidating the resource]({{< ref "#invalidating-the-cache" >}}) from the browser cache. This step is required to make sure the attack does not consider a resource previously cached in another visit.
2. Performing a request that causes different items to be cached depending on the user's state. For example, loading a page that includes a specific image only if the user is logged in. This request can be triggered by navigating to the target website with `<link rel=prerender..`, embedding the website in an `iframe`, or opening a new window with `window.open`.
3. Triggering a request that causes the server to reject the request. For example, including an [overlong referer header](https://lists.archive.carbon60.com/apache/users/316239) that  makes the server reject the request. If the resource was cached in step 2, this request succeeds instead of triggering an error event.

### 使缓存失效

为了使缓存中的资源失效，攻击者必须使服务器在获取该子资源时返回一个错误。有几种方法可以实现这一点：

To invalidate a resource from the cache, the attacker must force the server to return an error when fetching that subresource. There are a couple of ways to achieve this:

- 发起一个带有 `cache:'reload'`选项的请求。这种请求在浏览器初始化请求之后，会在收到响应之前，被[`AbortController.abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort)中止。
- 发起一个带有[超长 referer 头](https://lists.archive.carbon60.com/apache/users/316239)和`'cache':'reload'` 的请求。这不一定有效，因为浏览器 [限制了](https://github.com/whatwg/fetch/issues/903) referer 的最大长度来防止出现这种情况。
- 发起一个 `POST` 请求，带有 `fetch` 的 `no-cors`。有时候即使在没有返回错误的情况下，浏览器也会让缓存失效。
- 指定请求头，如 `Content-Type`、`Accept`、`Accept-Language` 等，可能会导致服务器失败（取决于应用程序）。
- 其他请求属性。
---
- A fetch request with a `cache:'reload'`option that is aborted with [`AbortController.abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) before new content has been received, but after the request was initiated by the browser.
- A request with an [overlong referer header](https://lists.archive.carbon60.com/apache/users/316239) and `'cache':'reload'`. This might not work as browsers [capped](https://github.com/whatwg/fetch/issues/903) the length of the referrer to prevent this.
- A `POST` request with a `fetch` `no-cors`. Sometimes, even in cases where an error is not returned, the browser invalidates the cache.
- Request headers such as Content-Type, Accept, Accept-Language, etc. that may cause the server to fail (more application dependent).
- Other request properties.

上面有些方法可能通常会被认为是浏览器的一个 bug（例如，[这个 bug](https://bugs.chromium.org/p/chromium/issues/detail?id=959789#c9)）。

Often, some of these methods might be considered a bug in the browser (e.g. [this bug](https://bugs.chromium.org/p/chromium/issues/detail?id=959789#c9)).

## CORS 错误 中的 Origin Reflection 配置错误

配置 Origin Reflection 之后，全局可访问的资源都会被打上一个 [Access-Control-Allow-Orign (ACAO)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin) 头，这个值表示初始请求的源。这算是 CORS 的配置错误[^5]，它可以用来检测资源是否存在于浏览器的缓存中。

Origin reflection is a behavior in which a globally accessible resource is provided with a [Access-Control-Allow-Orign (ACAO)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin) header whose value reflects the origin that initialized the request. This can be considered as CORS misconfiguration [^5] and can be used to detect whether the resource exists in the browser cache.

{{< hint info >}} 
例如，Flask 框架[推广](https://flask-cors.readthedocs.io/en/latest/api.htm) 了默认带有 origin reflection 的配置。

For example, Flask framework [promotes](https://flask-cors.readthedocs.io/en/latest/api.htm) origin reflection as the default behavior.
{{< /hint >}}

如果从 `target.com` 请求 `server.com`上的资源，那么源会反馈在响应头中，如。`Access-Control-Allow-Origin: target.com`。如果资源被缓存，该信息将与资源一起存储在浏览器的缓存中。因此，如果 `attacker.com` 试图获取相同的资源，有两种可能的情况：

If a resource hosted on `server.com` is requested from `target.com` then the origin could be reflected in the response headers as: `Access-Control-Allow-Origin: target.com`. If the resource is cached, this information is stored together with the resource in the browser cache. With that, if `attacker.com` tries to fetch the same resource there are two possible scenarios:

- 该资源不在缓存中：该资源可以与 `Access-Control-Allow-Origin: attacker.com` 头一起获取和存储。
- 该资源已经在缓存中：请求将尝试从缓存中获取资源，但由于 ACAO 头值与请求来源不匹配，它会产生一个 CORS 错误（预期源是 `target.com`，但提供的是 `attacker.com`）。下面提供了一个示例代码，可以推断出 被攻击者 浏览器的缓存状态。
---
- The resource is not in cache: the resource could be fetched and stored together with the `Access-Control-Allow-Origin: attacker.com` header.
- The resource was already in cache: fetch attempt will try to fetch the resource from the cache but it will also generate a CORS error due to the ACAO header value mismatch with the requesting origin (`target.com` origin was expected but `attacker.com` was provided). Here below is provided an example code snippet epxloting this vulnerability to infer the cache status of the victim's browser.
```javascript
// 这个函数接收一个 url，然后通过 CORS mode 访问
// The function simply takes a url and fetches it in CORS mode.

// 如果请求抛出异常，就会是 CORS 错误，
// If the fetch raises an error, it will be a CORS error due to the 

// 因为 attacker.com 和 被攻击者 IP 的源不匹配
// origin mismatch between attacker.com and victim's IP.
function ifCached(url) {
    // 请求失败，返回一个值被解析为 true 的 promise，请求成功，返回 false
    // returns a promise that resolves to true on fetch error 
    // and to false on success
    return fetch(url, {
        mode: "cors"
    })
    .then(() => false)
    .catch(() => true);
}

// 只有攻击者已经知道 server.com 存在 origin reflection CORS 错误配置的时候，才有这种攻击场景
// This makes sense only if the attacker already knows that
// server.com suffers from origin reflection CORS misconfiguration.
var resource_url = "server.com/reflected_origin_resource.html"
var verdict = await ifCached(resource_url)
console.log("Resource was cached: " + verdict)
```

{{< hint tip >}}
防御这种攻击最好的方法是，全局的访问需要和获取未经认证的资源，都要避免 origin reflection，并使用 `Access-Control-Allow-Origin: *` 头。

The best way to mitigate this is to avoid origin reflection and use the header `Access-Control-Allow-Origin: *` for globally accessible and unauthenticated resources.
{{< /hint >}}

## 通过 AbortController 请求
下面的片段展示了如何把 [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) 接口与 *fetch* 和 *setTimeout* 结合起来，既可以探测资源是否被缓存，又可以从浏览器缓存中删除特定的资源。这种技术的一个优点是在探测的过程中不会缓存新的内容。

The below snippet shows how the [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) interface could be combined with *fetch* and *setTimeout* to both detect whether the resource is cached and to evict a specific resource from the browser cache. A nice feature of this technique is that the probing occurs without caching new content in the process.
```javascript
async function ifCached(url, purge = false) {
    var controller = new AbortController();
    var signal = controller.signal;
    // 9ms 后，丢弃请求（发生在请求完成之前）
    // After 9ms, abort the request (before the request was finished).

    // 为了确保攻击成功，timeout 值可能需要调整
    // The timeout might need to be adjusted for the attack to work properly.

    // 清除内容花费的时间似乎比探测花费的时间略少。
    // Purging content seems to take slightly less time than probing
    var wait_time = (purge) ? 3 : 9;
    var timeout = await setTimeout(() => {
        controller.abort();
    }, wait_time);
    try {
        // 火狐浏览器需要 credentials 参数
        // credentials option is needed for Firefox
        let options = {
            mode: "no-cors",
            credentials: "include",
            signal: signal
        };
        // 如果提供了 "cache: reload" 参数，那么浏览器就会
        // If the option "cache: reload" is set, the browser will purge

        // 从浏览器缓存中清除资源
        // the resource from the browser cache
        if(purge) options.cache = "reload";

        await fetch(url, options);
    } catch (err) {
        // 调用 controller.abort() 的时候，请求会抛出一个异常
        // When controller.abort() is called, the fetch will throw an Exception
        if(purge) console.log("The resource was purged from the cache");
        else console.log("The resource is not cached");
        return false
    }
    // clearTimeout 只会在 wait_time 内，执行到这一行时候调用，这时说明资源一定是从缓存中获取的
    // clearTimeout will only be called if this line was reached in less than
    // wait_time which means that the resource must have arrived from the cache
    clearTimeout(timeout);
    console.log("The resource is cached");

    return true;
}

// 清除 https://example.org 的缓存
// purge https://example.org from the cache
await ifCached('https://example.org', true);

// https://example.org 放入缓存
// Put https://example.org into the cache

// 跳过这一步，可模拟 example.org 没有被缓存的情况
// Skip this step to simulate a case where example.org is not cached
open('https://example.org');

// 等待 1s（直到 example.org 加载完成）
// wait 1 second (until example.org loads)
await new Promise(resolve => setTimeout(resolve, 1000));

// 检查 https://example.org 是否在缓存里
// Check if https://example.org is in the cache
await ifCached('https://example.org');
```

## 防御

目前，还没有很好的防御机制可以让网站完全抵御缓存探测攻击。尽管如此，网站可以通过部署[缓存保护]({{< ref "cache-protections.md" >}})来减少攻击面，例如。

Currently, there are no good defense mechanisms that would allow websites to fully protect against Cache Probing attacks. Nonetheless, a website can mitigate the attack surface by deploying [Cache Protections]({{< ref "cache-protections.md" >}}) such as:

- 使用 [Cache-control headers]({{< ref "cache-protections.md#cache-protection-via-cache-control-headers" >}}) 防止资源被缓存。
- 使用 [Random Tokens]({{< ref "cache-protections.md#cache-protection-via-random-tokens" >}}) 让使攻击者无法预测 URL。
- 使用 [Vary: Sec-Fetch-Site]({{< ref "cache-protections.md#cache-protection-via-fetch-metadata" >}}) 让缓存按源进行分组隔离。
- 能够触发网络请求的用户内容，应该使用单独的域名或公共后缀列表（如果适用），在自己的 eTLD+1 上，来实现进行分区缓存。
---
- [Cache-control headers]({{< ref "cache-protections.md#cache-protection-via-cache-control-headers" >}})  used to prevent the resource from caching.
- [Random Tokens]({{< ref "cache-protections.md#cache-protection-via-random-tokens" >}}) used to make the URLs unpredictable for attackers.
- [Vary: Sec-Fetch-Site]({{< ref "cache-protections.md#cache-protection-via-fetch-metadata" >}}) used to segregate the cache by a group of origins.
- User content that is capable of making networks requests should be on its own eTLD+1 by using a separate domain or the public suffix list (if applicable) to allow for partitioned caches.

针对缓存探测攻击的一个有希望的防御措施是[划分 HTTP 缓存]({{< ref "../defenses/secure-defaults/partitioned-cache.md" >}})，由请求的源负责。这种浏览器提供的保护可以防止攻击者的源干扰其他源的缓存资源。

A promising defense against Cache Probing attacks is [partitioning the HTTP cache]({{< ref "../defenses/secure-defaults/partitioned-cache.md" >}}) by the requesting origin. This browser-provided protection prevents an attacker's origin from interfering with cached resources of other origins.

{{< hint info>}}
从 2021 年 9 月起，大多数浏览器都可以使用分区缓存，按 eTLD+1 进行分组缓存，但是应用还不能依赖它们。
这种保护对于来自子域和[窗口 navigation]({{< ref "../attacks/navigations.md#partitioned-http-cache-bypass" >}})的请求是无效的。

As of September 2021, Partitioned Caches is available in most browsers to split the cache by eTLD+1, however applications cannot rely on them.
The protection is ineffective for requests from subdomains and [window navigations]({{< ref "../attacks/navigations.md#partitioned-http-cache-bypass" >}})
{{< /hint >}}

## 真实案例
这是一个使用[报错事件的缓存探测]({{< ref "#cache-probing-with-error-events" >}})，攻击者可以通过检查视频缩略图是否出现在浏览器缓存中[^3]来检测用户是否观看了一个特定的 YouTube 视频。

An attacker using [Error Events Cache Probing]({{< ref "#cache-probing-with-error-events" >}}) was able to detect whether a user watched a specific YouTube Video by checking if the video thumbnail ended up in browser cache [^3].

## 参考文献

[^1]: Abusing HTTP Status Codes to Expose Private Information, [link](https://www.grepular.com/Abusing_HTTP_Status_Codes_to_Expose_Private_Information)
[^2]: HTTP Cache Cross-Site Leaks, [link](http://sirdarckcat.blogspot.com/2019/03/http-cache-cross-site-leaks.html)
[^3]: Mass XS-Search using Cache Attack, [link](https://terjanq.github.io/Bug-Bounty/Google/cache-attack-06jd2d2mz2r0/index.html#VIII-YouTube-watching-history)
[^4]: Timing Attacks on Web Privacy, [link](http://www.cs.jhu.edu/~fabian/courses/CS600.424/course_papers/webtiming.pdf)
[^5]: CORS misconfiguration, [link](https://web-in-security.blogspot.com/2017/07/cors-misconfigurations-on-large-scale.html)
