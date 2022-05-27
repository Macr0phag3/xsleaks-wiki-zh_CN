+++
title = "portal"
description = ""
date = "2020-10-01"
category = "Experiments"
menu = "main"
+++

[portal](https://web.dev/hands-on-portals/)是 web 的一个新功能，与 `iframe` 相似，但更强调速度和用户体验。[`portal`](https://web.dev/hands-on-portals/) 元素仅在基于 Chromium 的浏览器上通过一个偏好标志可用。相应的[规范](https://wicg.github.io/portals/)仍在积极讨论中。

[portal](https://web.dev/hands-on-portals/) are a new feature of the web which is similar to `iframes`, but with more emphasis on speed and user experience. The [`portal`](https://web.dev/hands-on-portals/) element is only available on Chromium-based browsers under a preference flag. The corresponding [specification](https://wicg.github.io/portals/) is still under active discussion. 

不幸的是，通过研究这个新功能发现了一些关键问题，包括新的 XS-Leaks [^2]。

Unfortunately, research of this new feature has discovered some critical issues, including new XS-Leaks [^2].

## ID Leaks
portal 可以当做 [ID Attribute XS-Leak]({{< ref "../id-attribute.md" >}}) 的替代方案。如果网站设置了 [framing protections]({{< ref "../../defenses/opt-in/xfo.md" >}})，也可以用 `portal` 这一相似的技术来代替[^1]。

Portals can be abused as an alternative to the [ID Attribute XS-Leak]({{< ref "../id-attribute.md" >}}). If a website sets [framing protections]({{< ref "../../defenses/opt-in/xfo.md" >}}), the same technique can be applied using the `portal` element instead [^1].

## 参考文献

[^1]: Detecting IDs using Portal, [link](https://portswigger.net/research/xs-leak-detecting-ids-using-portal)
[^2]: Security analysis of \<portal\> element, [link](https://research.securitum.com/security-analysis-of-portal-element/)
