---
title: "隔离策略"
weight: 3
---

# 隔离策略
本节描述了针对不同类型的跨网站交互的推荐的防御措施，以 _隔离策略_ 的形式来描述。

This section describes proposed defenses against different kinds of cross-site interactions, presented in the form of _isolation policies_:

* 要用 [Fetch Metadata]({{< ref "../opt-in/fetch-metadata.md">}})来防御对普通资源（如脚本、图像、fetch）的跨站请求，请参考 [Resource Isolation Policy]({{< ref "./resource-isolation.md" >}})。
* 为防止使用 [Fetch Metadata]({{< ref "../opt-in/fetch-metadata.md">}}) 的 framing，请参考 [Framing Isolation Policy]({{< ref "./framing-isolation.md" >}})。
* 要防止使用 [Fetch Metadata]({{< ref "../opt-in/fetch-metadata.md">}}) 的 navigational requests，请参考 [Navigation Isolation Policy]({{< ref "./navigation-isolation.md" >}})。
* 要防止所有与 [Fetch Metadata]({{< ref "../opt-in/fetch-metadata.md">}})、[SameSite cookies]({{< ref "../opt-in/same-site-cookies">}}) 或 Referer 头的跨站交互，请参考 [Strict Isolation Policy]({{< ref "./strict-isolation.md" >}})。
---
* To defend against cross-site requests for common resources (e.g. scripts, images, fetch) with [Fetch Metadata]({{< ref "../opt-in/fetch-metadata.md">}}), check [Resource Isolation Policy]({{< ref "./resource-isolation.md" >}}).
* To defend against cross-site framing with [Fetch Metadata]({{< ref "../opt-in/fetch-metadata.md">}}), check [Framing Isolation Policy]({{< ref "./framing-isolation.md" >}}).
* To defend against cross-site navigational requests with [Fetch Metadata]({{< ref "../opt-in/fetch-metadata.md">}}), check [Navigation Isolation Policy]({{< ref "./navigation-isolation.md" >}}).
* To defend against all cross-site interactions with either [Fetch Metadata]({{< ref "../opt-in/fetch-metadata.md">}}), [SameSite cookies]({{< ref "../opt-in/same-site-cookies">}}), or the Referer header, check [Strict Isolation Policy]({{< ref "./strict-isolation.md" >}}).

