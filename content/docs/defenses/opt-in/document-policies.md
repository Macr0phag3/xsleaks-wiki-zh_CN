+++
title = "Document Policies"
category = [
    "Defense",
]
menu = "main"
+++

`Document-Policy` 是一个实验型的机制，类似于另一个实验型的功能策略[^2]，用于修改 document 的特性，或者从 document 或 frame 中移除一些特性（sandboxing）。[^1] 例如，它可以在响应头中设置，如下面的例子所示。

`Document-Policy` is an experimental mechanism, similar to another experimental Feature Policy [^2], used to cover features which are more about configuring a document, or removing features (sandboxing) from a document or a frame. [^1] It can be for example set in a header response as shown in the example below.

{{< hint example >}}
Document-Policy: unsized-media=?0, document-write=?0, max-image-bpp=2.0, frame-loading=lazy
{{< /hint >}}

# ForceLoadAtTop
ForceLoadAtTop 功能为对隐私较为敏感的网站提供了对 [Scroll To Text]({{< ref "/docs/attacks/experiments/scroll-to-text-fragment.md" >}})（和其他滚动加载行为）的 opt-out。该功能允许网站声明它们应该总是在页面的顶层加载，阻止任何 scroll-on-load 行为，包括文本片段和元素片段。它可以通过 `Document-Policy: force-load-at-top` 响应头来设置。

The ForceLoadAtTop feature provides an opt-out for [Scroll To Text]({{< ref "/docs/attacks/experiments/scroll-to-text-fragment.md" >}}) (and other load-on-scroll behaviors) for privacy sensitive sites. The feature allows sites to indicate that they should always be loaded at the top of the page, blocking any scroll-on-load behaviors including text fragments and element fragments. It can be set via `Document-Policy: force-load-at-top` response header. 

该功能在防止 [ID 属性]({{< ref "/docs/attacks/id-attribute.md" >}})或[滚动到文本片段]({{< ref "/docs/attacks/experiments/scroll-to-text-fragment.md" >}})等攻击时可能会很有用。

The feature could be useful in preventing attacks such as [ID Attribute]({{< ref "/docs/attacks/id-attribute.md" >}}) or [Scroll to Text Fragment]({{< ref "/docs/attacks/experiments/scroll-to-text-fragment.md" >}}).

# 参考资料
[^1]: Feature Policy, [link](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy)
[^2]: Document-Policy proposal, [link](https://github.com/wicg/document-policy/blob/main/document-policy-explainer.md)
[^3]: Document-Policy: force-load-at-top, [link](https://www.chromestatus.com/feature/5744681033924608)
