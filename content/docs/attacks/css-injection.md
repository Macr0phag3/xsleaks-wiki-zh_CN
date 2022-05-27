+++
title = "CSS 注入"
category = [
    "Attack"
]
abuse = [
    "CSS"
]
menu = "main"
weight = 11
+++

## CSS 注入

{{< hint warning >}}
这类 XS-Leaks 需要能够在目标页面上注入 CSS。

This group of XS-Leaks requires a CSS injection on the target page.
{{< /hint >}}

在不同的 CSS 注入的 payload 中，最引人注目的是对 CSS 选择器的利用。它们可以作为一个表达式来匹配和选择某些 HTML 元素。例如，选择器 `input[value^="a"]` 如果 `input` 标签的值以字符 `a` 开头，就可以匹配到。因此，为了判断一个 CSS 选择器是否与表达式相匹配，攻击者可以使用某些属性如 `background`、`@import` 等[^1] [^2] 触发回调到他们的一个网站。通过暴力破解每一个字符，就可以获得完整的敏感信息字符串。

Among the different CSS injection vectors, the most noticeable one is the abuse of CSS Selectors. They can be used as an expression to match and select certain HTML elements. For example, the selector `input[value^="a"]` is matched if the value of an `input` tag starts with the character "a". So, to detect if a CSS Selector matches the expression, attackers can trigger a callback to one of their websites using certain properties like `background`, `@import`, etc. [^1] [^2]. The matching process can easily be brute-forced, and extended to the full string.

诸如 JavaScript 等页面内容可以通过滥用 Font [ligatures](https://wikipedia.org/wiki/Ligature_(writing)) 泄露，因为一串连续的字符可以有自己的表现形式。

Page content such as JavaScript can be leaked by abusing Font [ligatures](https://wikipedia.org/wiki/Ligature_(writing)) as a sequence of characters can have its own representation.

一些通常被隐藏的 HTML 标签，如样式和脚本，可以通过应用 `* { display: block; }` 样式来以文本的形式展示。因此，它们的内容也有可能泄露。

Some HTML tags that are normally hidden such as style and script can be rendered as text by applying a style like `* { display: block; }`. Hence, their content could be potentially leaked as well. 

出现较长的文本时，页面就会显示会滚动条。这个滚动条可以有一个自定义的样式，如 `background: url()`，这样它在显示时就会向攻击者控制的服务器发出请求。[^3]

Larger text dimensions can result in the scroll bar being shown. This scroll bar can have a custom style such as `background: url()` so that it makes a request to an attacker-controlled server when shown. [^3]

## 防御
- 通过使用带有 srcdoc 属性的 iframe，可以将攻击者控制的内容放在它自己的 document 中。还可以使用 sandbox 属性，将内容隔离到它自己的源中。
- 使用 CSS inliner，转换全局样式。
---
- Put attacker controled content in its own document this can be done using a iframe with the srcdoc attrbute.
Optionaly include the sandbox attbute to isolate the content into its own origin.
- Use a CSS inliner so global styles get converted.

| [SameSite Cookies (Lax)]({{< ref "/docs/defenses/opt-in/same-site-cookies.md" >}}) | [COOP]({{< ref "/docs/defenses/opt-in/coop.md" >}}) | [Framing Protections]({{< ref "/docs/defenses/opt-in/xfo.md" >}}) |                  [Isolation Policies]({{< ref "/docs/defenses/isolation-policies" >}})                   |
| :--------------------------------------------------------------------------------: | :-------------------------------------------------: | :---------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------: |
|                                         ❌                                          |                          ❌                          |                                 ❌                                 | ❌  |
## 参考文献
[^1]: CSS Injection Primitives, [link](https://x-c3ll.github.io/posts/CSS-Injection-Primitives/)
[^2]: HTTPLeaks, [link](https://github.com/cure53/HTTPLeaks/)
[^3]: Font ligatures, [link](https://sekurak.pl/wykradanie-danych-w-swietnym-stylu-czyli-jak-wykorzystac-css-y-do-atakow-na-webaplikacje/)
