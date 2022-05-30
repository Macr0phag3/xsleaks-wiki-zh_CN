+++
title = "分区 HTTP 缓存"
description = ""
date = "2020-10-01"
category = [
    "Defense",
]
menu = "main"
+++

为了防御缓存探测攻击，浏览器开发者正积极致力于实现分区的 HTTP 缓存功能，这将在本质上确保每个网站都有一个独立的缓存。由于缓存探测依赖的是：浏览器的 HTTP 缓存在每个网站上都是共享的，所以分区的 HTTP 缓存可以抵御许多缓存探测技术。这是通过使用元组（要么像 firefox[^6]那样的 `(top-frame-site, resource-url)`，要么像 chromium/chrome[^5] 那样的 `(top-frame-site, framing-site, resource-url)`）作为缓存密钥来确保缓存根据请求的网站进行分区。这使得攻击者获取不同网站的缓存内容变得具有更大的挑战性 [^1] [^2] [^3]。Safari 目前提供了一个分区的缓存[^4]。

In order to defend against cache probing attacks, browser developers are actively working on implementing a partitioned HTTP cache functionality that would in essence ensure each website has a distinct cache. Since cache probing relies on the fact that a browser's HTTP cache is shared across every website, a partitioned HTTP cache can defend against many cache probing techniques. This is done by using tuples (either `(top-frame-site, resource-url)` like firefox [^6] or `(top-frame-site, framing-site, resource-url)`) like chromium/chrome [^5] as the cache keys to ensure the cache is partitioned by the requesting site. This makes it more challenging for attackers to interact with the cached contents of different sites [^1] [^2] [^3]. Safari currently ships a partitioned cache [^4].

{{< hint tip >}}
对于不使用分区缓存的浏览器，有一些[其他的防御措施]({{< ref "../design-protections/cache-protections.md" >}})，应用程序可以用来防御缓存探测攻击。页面也可以被[设计]({{< ref "../design-protections/subresource-protections.md" >}})成带有某种程度的用户交互，从而防御缓存探测攻击。

For browsers that don't use partitioned caches, there are [other defenses]({{< ref "../design-protections/cache-protections.md" >}}) that applications can deploy to defend against cache probing techniques. Pages can also be [designed]({{< ref "../design-protections/subresource-protections.md" >}}) to require some level of user interaction in order to defend against cache probing attacks.
{{< /hint >}}

## 其他相关项目

### WebKit 跟踪预防技术

Safari使用 `(top-frame-site, resource URL)` 作为缓存密钥实现了一个分区的 HTTP 缓存。这是 WebKit 更大项目（[跟踪预防](https://webkit.org/tracking-prevention/)）的一部分。

Safari implements a partitioned HTTP cache using `(top-frame-site, resource URL)` as the cache key. This is part of WebKit's larger [Tracking Prevention](https://webkit.org/tracking-prevention/) project.

### Firefox First Party Isolation

First Party Isolation 是火狐浏览器的一个[浏览器扩展](https://addons.mozilla.org/en-US/firefox/addon/first-party-isolation/)，它限制每个域对 cookies 和持久性数据（如缓存）的访问。这个是用户可选的。

First Party Isolation is a [browser extension](https://addons.mozilla.org/en-US/firefox/addon/first-party-isolation/) for Firefox which restricts access to cookies and persistent data (e.g. cache) per domain. This requires an opt-in on the part of the user.

## 权衡
分区的 HTTP 缓存是一个很有前途的安全功能，最终会在所有的浏览器中实现。这些分区策略将缓解大部分利用浏览器缓存的 XS-Leak 技术。在未来，分区缓存可能会扩展到其他浏览器资源，这将有助于缓解其他 XS-Leak 技术，如 [Socket Exhaustion XS-Leak]({{< ref "../../attacks/timing-attacks/connection-pool.md" >}})。

Partitioned HTTP caches are a promising security feature that will eventually land in all browsers. These partitioning strategies will mitigate most of the XS-Leak techniques that leverage browser caches. In the future, partitioned caches might be extended to other browser resources, which could help mitigate other XS-Leak techniques like the [Socket Exhaustion XS-Leak]({{< ref "../../attacks/timing-attacks/connection-pool.md" >}}).

## 参考资料

[^1]: Double-keyed HTTP cache, [link](https://github.com/whatwg/fetch/issues/904)
[^2]: Explainer - Partition the HTTP Cache, [link](https://github.com/shivanigithub/http-cache-partitioning)
[^3]: Client-Side Storage Partitioning, [link](https://privacycg.github.io/storage-partitioning/)
[^4]: Optionally partition cache to prevent using cache for tracking (Webkit), [link](https://bugs.webkit.org/show_bug.cgi?id=110269)
[^5]: Split Disk Cache Meta Bug (Blink), [link](https://bugs.chromium.org/p/chromium/issues/detail?id=910708)
[^6]: Top-level site partitioning (Gecko), [link](https://bugzilla.mozilla.org/show_bug.cgi?id=1590107)
