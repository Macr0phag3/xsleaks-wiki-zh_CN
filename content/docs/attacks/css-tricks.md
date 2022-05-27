+++
title = "CSS 技巧"
description = ""
date = "2020-10-01"
category = [
    "Attack"
]
abuse = [
    "CSS"
]
defenses = [
    "Framing Protections"
]
menu = "main"
weight = 2
+++

## CSS Tricks
CSS 可以通过更改受 embed 影响的画面，来欺骗用户暴露诸如嵌入像素值之类的信息。

CSS can be used to trick a user into exposing information such as embedded pixel values by making visual changes that are affected by the embed.

## 历史记录泄露
使用 CSS [`:visited`](https://developer.mozilla.org/en-US/docs/Web/CSS/:visited) 选择器，可以为被访问过的 URL 应用不同的样式。

Using the CSS [`:visited`](https://developer.mozilla.org/en-US/docs/Web/CSS/:visited) selector, it’s possible to apply a different style for URLs that have been visited. 

在以前，我们可以使用 [`getComputedStyle()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle) 来检测这种差异，但现在的浏览器为了预防这种攻击，会返回固定的值，这个值看起来就像链接被访问过一样，并且浏览器还限制了可使用选择器的样式。[^changes-1］

Previously it was possible to use [`getComputedStyle()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle) to detect this difference but now browsers prevent this by always returing values as if the link was visted and limiting what styles can be applyed using the selector. [^changes-1]

因此，这就需要欺骗用户点击受 CSS 影响的区域，这可以用 [`mix-blend-mode`](https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode) 来完成。[^blend-mode]

So, it may be needed to trick the user into clicking an area that the CSS has affected this can be done using [`mix-blend-mode`](https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode). [^blend-mode]

也有一些方法可以在没有用户交互的情况下做到这一点，比如通过利用渲染时间，这个方法很有效，因为将链接涂成不同的颜色需要时间。[^render-timings]

There are also ways to do it without user interaction such as by abusing render timings this works because it takes time to paint links a different color. [^render-timings]

在 chromium 的一份报告上提出了一个PoC，可以通过使用多个链接来增加时间差。[^render-timings-bug] 。

A PoC was provided on a chromium report that works by using multiple links to increase the time difference. [^render-timings-bug]

{{< hint info >}}
[^leak-1] 展示了这种攻击的一个例子，用打地鼠游戏来欺骗用户点击页面的特定区域，这个 issue 中报告了多个 bug：[^bug-1](https://bugs.chromium.org/p/chromium/issues/detail?id=712246), [^bug-2](https://bugs.chromium.org/p/chromium/issues/detail?id=713521), [^bug-3](https://bugzilla.mozilla.org/show_bug.cgi?id=147777)

[^leak-1] shows an example of this attack using a whack a mole game to trick the user into clicking areas of the page, multiple bugs were reported about this issue: [^bug-1](https://bugs.chromium.org/p/chromium/issues/detail?id=712246), [^bug-2](https://bugs.chromium.org/p/chromium/issues/detail?id=713521), [^bug-3](https://bugzilla.mozilla.org/show_bug.cgi?id=147777)
{{< /hint >}}

## 恶意的验证码
通过 CSS，可以使得一个嵌入式内容，嵌入到上一层的上下文中。

Using CSS, it’s possible to take an embed out of context.

例如伪装成一个验证码，正如在 [^leak-2] 中展示的那样。

An example of this is pretending it’s a captcha as seen in [^leak-2]  

这个手法的原理是，通过指定嵌入式内容的宽度和高度，让它只显示特定的字符，还可以使用多个嵌入式内容来改变字符的显示顺序，使用户更难发现这里泄露的信息是什么。

This works by setting the width and hight of an embed so that only the target characters are shown, this may use multiple embeds to change the order of the characters being displayed so that its harder for a user to know what infomation there providing.

## 利用自动填充
如果一个网站用到了文本输入框，并且没有通过 ```autocomplete="off"``` 关闭 [autocomplete](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete)，就有可能泄露电子邮件地址等数据。通过欺骗用户按下按键来触发自动填充的 ui，这样就可以获得一个以拥有 javascript 焦点的文本输入框。

If a website uses text inputs and does not opt-out of [autocomplete](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete) using ```autocomplete="off"``` it may be possible to leak data such as email addresses. By tricking the user into pressing the keys to navigate the autocomplete ui for a javascript focused text input.

对于 chrome 来说，这需要诱使用户按下向上或向下的方向键，打开对话框并选择一个值，然后按下 Enter 或 Tab 键，该值就会插入到页面中。

For chrome this requires the user to be tricked into pressing the Up or Down arrow key which opens the dialog and selects a value then by pressing Enter or Tab the value gets inserted into the page.
```javascript
let input = document.createElement("input");
input.type = "email";
input.autocomplete = "email";
input.name = "email";
input.size = "1";
input.style = "position:absolute;right:-500px;bottom:-21.9px";
input.onkeypress = e => {
    e.preventDefault();
}
window.onmousedown = e => {
    // 忽略鼠标点击事件
    e.preventDefault();
}
input.onchange = e => {
    alert(e.srcElement.value);
    e.srcElement.value = "";
}
document.body.appendChild(input);
setInterval(() => {
    input.focus({preventScroll: true});
}, 1000);
```

## 自定义光标
这个手法可能不能直接获取泄露的数据，但它可以用于欺骗用户，因为一个大光标可以覆盖自动填充对话框和其他原生的 ui。

Might not leak data directly but it may help trick the user, as a large cursor may overlay the autocomplete dialog and other native ui.
```html
<style>
:root {
  cursor: url('https://www.google.com/favicon.ico'), auto;
}
</style>
```

## 防御
XFO 可以保护嵌入式内容免受攻击，因为内容不会被显示出来，所以没有视觉上的差异。*历史记录泄露*的攻击只能由用户来防御。可以通过禁用浏览器的历史记录来实现，如果在 Firefox 上，可以在 `about:config` 面板上将 `layout.css.visited_links_enabled` 选项设置为 `false`。 

XFO prevents embeds from being attacked because theres no visual difference as the content does not get shown, The *Retrieving user's history* attack can be only prevented by the user. It can be done by disabling the browser history, or if on Firefox, by setting the option `layout.css.visited_links_enabled` to `false` in `about:config` panel.  

| [SameSite Cookies (Lax)]({{< ref "/docs/defenses/opt-in/same-site-cookies.md" >}}) | [COOP]({{< ref "/docs/defenses/opt-in/coop.md" >}}) | [Framing Protections]({{< ref "/docs/defenses/opt-in/xfo.md" >}}) |                  [Isolation Policies]({{< ref "/docs/defenses/isolation-policies" >}})                   |
| :--------------------------------------------------------------------------------: | :-------------------------------------------------: | :---------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------: |
|                                         ❌                                          |                          ❌                          |                                 ✔️                                 | ❌  |
## 参考文献
[^leak-1]: Whack a mole game, [link](https://lcamtuf.coredump.cx/whack/)  
[^changes-1]: Privacy and the :visited selector, [link](https://developer.mozilla.org/en-US/docs/Web/CSS/Privacy_and_the_:visited_selector)  
[^blend-mode]: CSS mix-blend-mode is bad for your browsing history, [link](https://lcamtuf.blogspot.com/2016/08/css-mix-blend-mode-is-bad-for-keeping.html)  
[^render-timings]: Pixel Perfect Timing Attacks with HTML5, [link](https://go.contextis.com/rs/140-OCV-459/images/Pixel_Perfect_Timing_Attacks_with_HTML5_Whitepaper%20%281%29.pdf)  
[^render-timings-bug]: Visited links can be detected via redraw timing, [link](https://bugs.chromium.org/p/chromium/issues/detail?id=252165)
[^leak-2]: The Human Side Channel, [link](https://ronmasas.com/posts/the-human-side-channel)  
