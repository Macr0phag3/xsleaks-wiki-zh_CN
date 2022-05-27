+++
title = "Content-Type"
description = ""
date = "2020-10-01"
category = "Historical"
abuse = [
    "typeMustMatch",
    "iframes",
    "Content-Type",
    "Status Code",
]
defenses = [
    "Deprecation"
]
menu = "main"
+++

泄露请求的 Content-Type 会为攻击者提供一种区分两个请求的新方法。

Leaking the Content-Type of a request would provide attackers with a new way of distinguishing two requests from each other.

## typeMustMatch
[`typeMustMatch`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLObjectElement/typeMustMatch) 是一个布尔值，反映了 `object` 元素的 `typeMustMatch` 属性。它通过验证资源的 `Content-Type` 是否与对象中提供的类型相同，确保在加载对象时必须执行某种 MIME 类型。不幸的是，这种执行逻辑也给攻击者泄露了网站返回的 `Content-Type` 和 Status Codes [^1]。

[`typeMustMatch`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLObjectElement/typeMustMatch) is a Boolean that reflects the `typeMustMatch` attribute of the `object` element. It ensures that a certain MIME type must be enforced when loading an object, by verifying if the `Content-Type` of the resource is the same as the one provided in the object. Unfortunately, this enforcement also allowed attackers to leak the `Content-Type` and Status Codes returned by a website [^1].

### 根本原因
如下面的代码片段所示，如果返回的 `Content-Type` 与 `type` 不匹配，或者服务器返回的状态码不为 `200`，`not_loaded` 就会被展示出来。

Considering the snippet below, `not_loaded` would be rendered if the returned `Content-Type` of `https://target/api` did not match the one in `type`, or if the server returned a status different than `200`.

```html
<object type="application/json"
        data="https://example.org"
        typemustmatch>
not_loaded </object>
```

#### 问题
当[所有条件]({{< ref "#根本原因" >}})满足时，攻击者可以通过检测对象是否渲染来泄露网站的 `Content-Type` 和状态代码。攻击者可以检查 `clientHeight` 和 `clientWidth` 的值，当对象被渲染（并返回状态码 `200` ）之后，这两个值大概率不等于 0。由于 `typeMustMatch` 加载资源时要求服务器返回 `200` 状态码，因此可以检测到错误页面，类似于 [Error Events]({{< ref "../error-events.md" >}}) XS-Leaks。

An attacker could leak the `Content-Type` and Status Codes of a website by detecting whether the object rendered, which happens when [all conditions]({{< ref "#root-cause" >}}) are met. The attacker could check the values of `clientHeight` and `clientWidth` which are likely to be different than 0 when the object renders (and returns status `200`). Since `typeMustMatch` requires the server to return status `200` to load a resource, it would be possible to detect error pages, similar to [Error Events]({{< ref "../error-events.md" >}}) XS-Leaks.

下面的例子展示了如何通过在一个 `iframe` 中嵌入一个对象，并在 `iframe` 触发 `onload` 事件时检查 `clientHeight` 和 `clientWidth` 的值来检测这种行为。

The example below shows how this behavior could be detected by embedding an object inside an `iframe` and checking the values of `clientHeight` and `clientWidth` when the `iframe` triggers the `onload` event.


```javascript
// 设置目标 URL
// Set the destination URL
var url = 'https://example.org';
// 我们要检查的 content type
// The content type we want to check for
var mime = 'application/json';
var ifr = document.createElement('iframe');
// 在 iframe 内加载一个对象，因为对象不会触发 onload 事件
// Load an object inside iframe since object does not trigger onload event
ifr.srcdoc = `
  <object id="obj" type="${mime}" data="${url}" typemustmatch>
    error
  </object>`;
document.body.appendChild(ifr);

// 当 iframe 加载时，读取该对象的高度。如果它是一行文本的高度，那么资源的内容类型就不是 `application/json`。如果是不同的高度，那么它就是 `application/json`。
// When the iframe loads, read the height of the object. If it is the height 
// of a single line of text, then the content type of the resource was not 
// `application/json`. If it is a different height, then it was `application/json`. 
ifr.onload = () => {
    console.log(ifr.contentWindow.obj.clientHeight)
};
```

### 修复
火狐是唯一支持 `typeMustMatch` 属性的浏览器[^2]，由于没有其他浏览器提供支持，第 68 版和 HTML 生态标准中删除了该属性。

Firefox was the only browser that supported the `typeMustMatch` attribute [^2], and since no other browsers offered support, it was removed in version 68 and from the HTML Living Standard.

## 参考文献

[^1]: Cross-Site Content and Status Types Leakage, [link](https://medium.com/bugbountywriteup/cross-site-content-and-status-types-leakage-ef2dab0a492)
[^2]: Remove support for typemustmatch, [link](https://bugzilla.mozilla.org/show_bug.cgi?id=1548773)
