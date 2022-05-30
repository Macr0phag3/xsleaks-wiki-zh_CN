+++
title = "缓存保护"
description = "Cache Protection"
date = "2020-10-16"
category = [
    "Defense",
]
menu = "main"
+++

有许多不同的方法，应用程序可以用来抵御基于缓存探测的 XS-Leaks。这些方法将在下面的章节中解释。

There are a number of different approaches applications can use to defend against cache probing-based XS-Leaks. These approaches are explained in the following sections.

# 通过 `Cache-Control` 头进行缓存保护

如果可以接受禁用缓存，那么就可以有效地抵御缓存探测攻击。禁用缓存意味着每次有人加载资源时，必须再次获取该资源。要禁用缓存，请在你希望保护的每一个响应上设置一个 `Cache-Control: no-store` 头。

If it is acceptable to disable caching, doing so provides a strong defense against cache probing attacks. Disabling caching means that every time someone loads a resource, the resource has to be fetched again. To disable caching, set a `Cache-Control: no-store` header on every single response that you wish to protect.

优点：
* 所有主流的浏览器都支持

Advantages:
* Supported by all major browsers

缺点：
* 对网站性能有负面影响

Disadvantages:
* Negatively impacts site performance

# 通过随机 Tokens 进行缓存保护
应用程序可以在 URL 中包含额外的数据，而不是禁用缓存，以防御缓存探测攻击。这可以通过在你引用的每个子资源的 URL 中包含一个随机标记来实现。如果攻击者不能猜到这个随机标记，那么攻击者就不能通过任何直接的技术来确定 items 是否在缓存中。

Rather than disabling caching, applications can include additional data in URLs in order to defend against cache probing attacks. This can be achieved by including a random token in the URL of every subresource that you reference. If an attacker cannot guess this random token, then the attacker cannot determine whether items are in the cache via any straightforward techniques.

{{< hint example >}}
假设你的应用程序在每个页面中都加载了用户的个人资料照片：`/user/<USERNAME>.png`。攻击者可以通过探测缓存中的 `/user/john.png`、`/user/jane.png` 等来探测登录的是哪个用户。

Suppose that every page on your application loads the user's profile photo: `/user/<USERNAME>.png`. An attacker could check which user is signed in by probing the cache for `/user/john.png`, `/user/jane.png`, and so on.

这就是随机 token 可以发挥作用的地方。如果实施了的话，应用程序在每次加载时从 `/user/<USERNAME>.png?cache_buster=<RANDOM_TOKEN>` 中获取用户的个人资料照片。服务器不需要对这个随机 token 做任何事情。它的存在纯粹是为了确保攻击者没有办法在不知道随机 token 的情况下探测缓存。

This is where a random token can come into play. If implemented, the application takes the user's profile photo from `/user/<USERNAME>.png?cache_buster=<RANDOM_TOKEN>` on every load. The server does not need to do anything with this random token. It is there purely to ensure that there is no way for an attacker to probe the cache without knowing the random token.
{{< /hint >}}

应用程序甚至可以实现基于用户信息生成的随机 token，可在加载页面时重复使用。这仍允许子资源被缓存，因为对于一个特定的用户来说，URL 是保持不变的。

If implemented carefully, an application could even have a user-specific random token that is reused across page loads. This would allow subresources to still be cached since the URL would remain constant for a given user.

优势：
* 每个主流的浏览器都支持
* 不会破坏缓存

Advantages:
* Supported by every major browser
* Does not break caching

缺点：
* 实现起来比较困难

Disadvantages:
* Difficult to implement

# 通过 Fetch Metadata 进行缓存保护

[Fetch-Metadata]({{< ref "../opt-in/fetch-metadata.md" >}}) 是为了让服务器确定客户端发起请求的原因以及方式。其中可以获得的信息之一是 [`Sec-Fetch-Site`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Sec-Fetch-Site) 头，它指定了一个请求是来自同一源还是不同源。这可以与 [`Vary`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Vary) 头结合起来，迫使浏览器根据请求是否来自同一源来隔离缓存。

[Fetch-Metadata]({{< ref "../opt-in/fetch-metadata.md" >}}) is meant to allow servers to determine how and why a request was initiated on the client side. One piece of information that is exposed is the [`Sec-Fetch-Site`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Sec-Fetch-Site) header which specifies whether a request is coming from the same origin or a different origin. This can be combined with the [`Vary`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Vary) header in order to force the browser to segment the cache based on whether a request is made from the same origin or a different origin.

通过设置 `Vary: Sec-Fetch-Site` 即可指定你想保护的资源。

This is done by setting `Vary: Sec-Fetch-Site` on all resources you wish to protect.

{{< hint example >}}
假设我们有一个资源 `cdn.example.com/image.png`，我们希望保护它不受缓存探测攻击。如果我们设置了 `Vary: Sec-Fetch-Site`，浏览器将出现以下行为：

Assume we have the resource `cdn.example.com/image.png` that we wish to protect from cache probing attacks. If we set `Vary: Sec-Fetch-Site` on it, this leads to the following behavior:

1. 如果 `example.com` 试图加载该资源，该请求是由同一站点发起的，因此它被缓存在 `(SFS: same-site, resource_url)` 下。
2. 如果 `cdn.example.com` 试图加载该资源，该请求是由同一源发起的，所以它被缓存在 `(SFS: same-origin, resource_url)` 下。
3. 如果 `evil.com` 试图加载该资源，该请求是由不同的站点发起的，所以它被缓存在 `(SFS: cross-site, resource_url)` 下。
---
1. If `example.com` tries to load the resource, the request is initiated by the same site so it is cached under `(SFS: same-site, resource_url)`
2. If `cdn.example.com` tries to load the resource, the request is initiated by the same origin so it is cached under `(SFS: same-origin, resource_url)`
3. If `evil.com` tries to load the resource, the request is initiated by a different site so it is cached under `(SFS: cross-site, resource_url)`

注意，这意味着跨站请求与同站、同源请求是分开的。

Note that this means cross-site requests are separated from same-site and same-origin requests.
{{< /hint >}}


优点：
* 不会破坏缓存

Advantages:
* Does not break caching

缺点：
* Fetch metadata 是一个新的标准，目前只在基于 Chromium 的浏览器中支持（例如 Chrome 和 Edge）。
* 页面上加载的跨站子资源不受保护（例如来自 CDN 的子资源）。
* 如果第三方尝试加载资源，他们不会受到保护

Disadvantages:
* Fetch metadata is a new standard that is currently only supported in Chromium-based browsers (e.g. Chrome and Edge)
* Cross-site subresources loaded on the page are not protected (e.g. subresources from CDNs)
* If third parties load the resource, they are not protected
