+++
title = "子资源防护"
description = "Subresources Protections"
date = "2020-10-01"
category = [
    "Defense",
]
menu = "main"
+++

为子资源设计保护措施的基本思想是，如果攻击者不能使子资源返回任何用户数据，那么子资源就不能成为 XS-Leaks 的目标。如果实现得当，这种方法可以成为一种非常强大的防御手段，尽管实现起来可能比较困难，而且可能对用户体验产生负面的影响。

The fundamental idea behind designing protections for subresources is that subresources cannot be targeted by XS-Leaks if the attacker cannot make them return any user data. If implemented correctly, this approach can be a very strong defense, though it is likely to be tough to implement and could negatively impact the user experience.

{{< hint tip >}}
在给那些对 XS-Leaks 特别敏感的资源上部署这种防护是非常有效的。但由于大范围部署这种保护措施是具有较大挑战的，所以我们鼓励应用程序部署[opt-in Web 平台安全功能]({{< ref "./_index.md" >}})作为默认的实施方案。

It can be very effective to deploy this approach on any specific resources that are known to be especially sensitive to XS-Leaks. But, due to the challenges of deploying this protection universally, applications are encouraged to deploy [opt-in web platform security features]({{< ref "../_index.md" >}}) as the default approach.
{{< /hint >}}

## 基于 token 的防护

对子资源的强大保护可以通过在每个请求中包含一个用户特定的 token 来实现。如果实现得当，这可以防止大多数的 XS-Leak。这个思路是，如果想验证一个资源的请求是否合法，那请求就必须包含一个 token。需要住的是，这个 token 提供给客户端时，必须保证攻击者无法在他们自己的请求中包含这个 token 。

A strong protection for subresources can be achieved by including a user-specific token in every request. This protects against most XS-Leak techniques if implemented correctly. The idea is that in order to verify a request for a resource as being legitimate, a token must be included. This token must be provided to the client in a way that prevents an attacker from including it in their own requests.

{{< hint example >}}
假设在一个应用程序中有一个搜索栏。

Suppose there is a search bar in an application.

1. 当用户加载主页面时，服务器在页面 body 的某个地方包含一个安全 token。
2. 当用户搜索某些东西时，会向 `/search?query=<QUERY>&token=<SECURE_TOKEN>` 发出请求。
3. 后台验证所提供的 token 对当前用户是有效的。
4. 如果无效，拒绝请求。
---
1. When the user loads the main page, the server includes a secure token somewhere in the body of the page.
2. When the user searches for something, a request is made to `/search?query=<QUERY>&token=<SECURE_TOKEN>`.
3. The backend verifies that the provided token is valid for the current user.
4. If it is not valid, the request is rejected.

在这种情况下，攻击者没有办法触发对端点的任何请求，因为他们无法获得特定用户的有效 token。请注意，这有赖于攻击者不可能为其他用户获得或伪造 token。如果他们可以这样做，这种方法是无效的。

In this scenario, there is no way for an attacker to trigger any requests to the endpoint because they cannot obtain a valid token for a given user. Note that this relies on it not being possible for an attacker to obtain or forge a token for other users. If they can do so, this approach is not effective.
{{< /hint >}}

这种保护方式可以适用于：

This style of protection can be applied to:

- 已有认证的子资源，如 API endpoints 或常规认证的 URL。虽然在这种情况下可以使用 token，但像 [Same-Site Cookies]({{< ref "../opt-in/same-site-cookies.md" >}}) 这样的安全缓解措施更容易大规模地部署。
- 未有认证的子资源（如图片）可以使用这种保护来防止某些类型的[缓存探测攻击]({{< ref "../../attacks/cache-probing.md" >}})。虽然这个防护确实有效，但还是建议参阅[缓存保护]({{< ref "./cache-protections.md" >}})来了解防御缓存探测攻击的其他策略。
---
- Authenticated subresources such as API endpoints or regular authenticated URLs. While tokens can be used in this case, security mitigations like [Same-Site Cookies]({{< ref "../opt-in/same-site-cookies.md" >}}) may be easier to deploy at scale.
- Unauthenticated subresources such as images can use this protection to prevent some types of [Cache Probing Attacks]({{< ref "../../attacks/cache-probing.md" >}}). While this does work, see [Cache Protections]({{< ref "./cache-protections.md" >}}) for other strategies to defend against cache probing attacks.

{{< hint warning >}}
实施基于 token 的保护可能会破坏用户保存或分享链接（如书签）的能力。

Implementing token-based protections might break the ability of users to save or share links (e.g. bookmarks).
{{< /hint >}}

## 用户确认机制
另一个强有力的防御措施是在返回任何敏感数据之前要求用户互动。这可以确保敏感的 endpoints 不能通过 `script` 或 `img` 标签包含。例如，Facebook 要求用户在查看搜索结果或私人信息之前进行确认。由于攻击者无法模拟这种用户互动，他们就无法泄露搜索结果的内容。

Another strong defense is to require user interaction before returning any sensitive data. This ensures that sensitive endpoints cannot be included via `script` or `img` tags. For example, Facebook requires user confirmation before viewing search results or private messages. Since attackers cannot simulate this user interaction, they are unable to leak the contents of the search results.

这可能是保护特别敏感的 endpoints 的一个非常有用的方法，但要再次注意，这个方案实现起来可能会很耗费时间。

This can be a very useful way of protecting especially sensitive endpoints, but note once again that this is likely to be time-consuming to implement.
