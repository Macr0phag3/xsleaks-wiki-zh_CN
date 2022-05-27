+++
title = "Navigations"
description = ""
date = "2020-10-01"
category = [
    "Attack",
]
abuse = [
    "Downloads",
    "History",
    "CSP Violations",
    "Redirects",
    "window.open",
    "window.stop",
    "iframes",
]
defenses = [
    "Fetch Metadata",
    "SameSite Cookies",
    "COOP",
    "Framing Protections",
]
menu = "main"
weight = 2
+++

如果可以检测一个跨站页面是否触发了 navigation，那么这个手段对于攻击者来说是很有用的。例如，一个网站可能会在某个地方触发 navigation [取决于用户的状态]({{< ref "#case-scenarios" >}})。

Detecting if a cross-site page triggered a navigation (or didn't) can be useful to an attacker. For example, a website may trigger a navigation in a certain endpoint [depending on the status of the user]({{< ref "#case-scenarios" >}}).

为了检测是否发生任何形式的 navigation，攻击者可以：

To detect if any kind of navigation occurred, an attacker can:

- 使用 `iframe`，并计算 `onload` 事件被触发的次数。
- 检查 `history.length` 的值，它可以通过任何 windows reference 来获取。它提供了 被攻击者 的历史记录中，被 `history.pushState` 改变或被常规 navigation 改变的条目数量。为了获得 `history.length` 的值，攻击者可以将 windows reference 的地址改为目标网站，然后改回同源地址，最后再读取该值。
---
- Use an `iframe` and count the number of times the `onload` event is triggered.
- Check the value of `history.length`, which is accessible through any window reference. This provides the number of entries in the history of a victim that were either changed by `history.pushState` or by regular navigations. To get the value of `history.length`, an attacker changes the location of the window reference to the target website, then changes back to same-origin, and finally reads the value.

## 下载触发器
当一个地址设置了 [`Content-Disposition: attachment`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition) 头时，它会引导浏览器以附件的形式下载返回的响应，而不是跳转到它。如果这个行为取决于 被攻击者 的账号状态，那么攻击者通过检测是否发生了这种行为，可能可以得到 被攻击者 的私人信息。

When an endpoint sets the [`Content-Disposition: attachment`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition) header, it instructs the browser to download the response as an attachment instead of navigating to it. Detecting if this behavior occurred might allow attackers to leak private information if the outcome depends on the state of the victim's account.

### 下载栏

在基于 Chromium 的浏览器中，在下载一个文件时，下载过程的预览窗口会出现在底部的一个栏中，它是集成在浏览器窗口中的。通过检测窗口的高度，攻击者可以感知到 “下载栏” 是否打开。

In Chromium-based browsers, when a file is downloaded, a preview of the download process appears in a bar at the bottom, integrated into the browser window. By monitoring the window height, attackers can detect whether the "download bar" opened:


```javascript
//  获取当前 window 的高度
// Read the current height of the window
var screenHeight = window.innerHeight;
// 加载页面，它可能触发一次下载事件
// Load the page that may or may not trigger the download
window.open('https://example.org');
// 等待标签页加载
// Wait for the tab to load
setTimeout(() => {
    // 如果出现下载栏，那么所有标签页的高度都会变小
    // If the download bar appears, the height of all tabs will be smaller
    if (window.innerHeight < screenHeight) {
      console.log('Download bar detected');
    } else {
      console.log('Download bar not detected');
    }
}, 2000);
```

{{< hint important >}}
这种攻击只会在基于 Chromium 的浏览器中存在，且需要启用自动下载功能。此外，该攻击是不能重复进行的，因为用户需要关闭下载栏，才能再次进行高度差判断。

This attack is only possible in Chromium-based browsers with automatic downloads enabled. In addition, the attack can't be repeated since the user needs to close the download bar for it to be measurable again.
{{< /hint >}}

### 下载的 Navigation（通过 iframe 检测）

另一种测试 [`Content-Disposition: attachment`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition) 头的方法是检查是否发生了 navigation。如果页面加载之后触发了下载事件，则不会触发 navigation，窗口的源会保持不变。

Another way to test for the [`Content-Disposition: attachment`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition) header is to check if a navigation occurred. If a page load causes a download, it does not trigger a navigation and the window stays within the same origin.

下面的片段可以用来判断是否发生了这样的 navigation，可以用于检测出是否发生了下载事件：

The following snippet can be used to detect whether such a navigation has occurred and therefore detect a download attempt:

```javascript
// 指定要测试是否进行了下载的 URL
// Set the destination URL to test for the download attempt
var url = 'https://example.org/';
// 新建一个 outer iframe 来检测下载事件
// Create an outer iframe to measure onload event
var iframe = document.createElement('iframe');
document.body.appendChild(iframe);
// 新建一个 inner iframe 来检测是否尝试过进行下载
// Create an inner iframe to test for the download attempt
iframe.srcdoc = `<iframe src="${url}" ></iframe>`;
iframe.onload = () => {
      try {
          // 如果发生了 navigation，那么 iframe 会变成跨源
          // 那么获取 inner.origin 时就会报错
          // If a navigation occurs, the iframe will be cross-origin,
          // so accessing "inner.origin" will throw an exception
          iframe.contentWindow.frames[0].origin;
          console.log('Download attempt detected');
      } catch(e) {
          console.log('No download attempt detected');
      }
}
```

{{< hint info >}}
当 `iframe` 内没有由下载尝试引起的 navigation 时，`iframe` 不会直接触发 `onload` 事件。由于这个原因，在上面的例子中，使用了一个 outer `iframe`，它会监听一个 `onload` 事件，当子资源（包括 `iframe`）完成加载时就会触发该事件。

When there is no navigation inside an `iframe` caused by a download attempt, the `iframe` does not trigger an `onload` event directly. For this reason, in the example above, an outer `iframe` was used instead, which listens for an `onload` event which triggers when subresources finish loading, including `iframe`s.
{{< /hint >}}

{{< hint important >}}
这种攻击不受任何 [Framing Protections]({{< ref "xfo" >}}) 的影响，因为一旦指定了 `Content-Disposition: attachment` 头，那么 `X-Frame-Options` 和 `Content-Security-Policy` 头都会被忽略。

This attack works regardless of any [Framing Protections]({{< ref "xfo" >}}), because the `X-Frame-Options` and `Content-Security-Policy` headers are ignored if `Content-Disposition: attachment` is specified.
{{< /hint >}}

### 下载的 Navigation（不通过 iframe 检测）

作为上一节介绍的技术的一个变种，我们也可以使用 `window` 对象来进行高效的测试：

A variation of the technique presented in the previous section can also be effectively tested using `window` objects:

```javascript
// 设置目标 URL
// Set the destination URL
var url = 'https://example.org';
// 获取 window reference
// Get a window reference
var win = window.open(url);
// 等待 window 加载
// Wait for the window to load.
setTimeout(() => {
      try {
          // 如果发生 navigation，iframe 就是跨源的
          // 那么获取 "win.origin" 的时候就会报错
          // If a navigation occurs, the iframe will be cross-origin,
          // so accessing "win.origin" will throw an exception
          win.origin;
          parent.console.log('Download attempt detected');
      } catch(e) {
          parent.console.log('No download attempt detected');
      }
}, 2000);
```

## 服务器端重定向

### 膨胀技术
只要可以增加要访问的 URL 的长度，并可以在里面包含攻击者可控的输入（通常是请求参数或路径），那么就可以从跨源页面中检测出是否触发了服务器端重定向。下面的技术依赖于一个现实情况：大多数服务器在接收到一个巨大的请求参数或路径时，都可能触发一次报错。由于重定向的 URL 变长，那么就可以通过发送一个正好比服务器的最大容量少一个字符的请求来检测。这样一来，一旦请求的大小增加，服务器就会回应一个可以从跨源页面检测到的错误（例如通过错误事件来检测）。

A server-side redirect can be detected from a cross-origin page if the destination URL increases in size and contains an attacker-controlled input (either in the form of a query string parameter or a path). The following technique relies on the fact that it is possible to induce an error in most web-servers by generating large request parameters/paths. Since the redirect increases the size of the URL, it can be detected by sending exactly one character less than the server's maximum capacity. That way, if the size increases, the server will respond with an error that can be detected from a cross-origin page (e.g. via Error Events).

{{< hint example >}}
这种攻击的例子可见[这里](https://xsleaks.github.io/xsleaks/examples/redirect/)。

An example of this attack can be seen [here](https://xsleaks.github.io/xsleaks/examples/redirect/).
{{< /hint >}}
## 跨源重定向

### 违反 CSP 

[Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) (CSP) 是一种针对 XSS 和数据注入攻击的底层防御机制。当违反 CSP 时，会抛出一个 `SecurityPolicyViolationEvent`。攻击者可以使用 [`connect-src` 指令](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/connect-src) 来设置一个 CSP，每当 `fetch` 跟随重定向访问一个未在 CSP 指令中设置的 URL 时，就会触发 `Violation` 事件。攻击者可以利用这个特征来检测页面是否重定向到了另一个源 [^2] [^3]。

[Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) (CSP) is an in-depth defense mechanism against XSS and data injection attacks. When a CSP is violated, a `SecurityPolicyViolationEvent` is thrown. An attacker can set up a CSP using the [`connect-src` directive](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/connect-src) which triggers a `Violation` event every time a `fetch` follows an URL not set in the CSP directive. This allows an attacker to detect if a redirect to another origin occurred [^2] [^3].

在下面的例子中，如果 fetch API 中设置的网站（第 6 行）重定向到 `https://example.org` 以外的网站，就会触发 `SecurityPolicyViolationEvent`：

The example below triggers a `SecurityPolicyViolationEvent` if the website set in the fetch API (line 6) redirects to a website other than `https://example.org`:

{{< highlight html "linenos=table,linenostart=1" >}}
<!-- 设置只允许 example.org 的 Content-Security-Policy -->
<!-- Set the Content-Security-Policy to only allow example.org -->
<meta http-equiv="Content-Security-Policy"
      content="connect-src https://example.org">
<script>
// 监听违反 CSP 的事件
// Listen for a CSP violation event
document.addEventListener('securitypolicyviolation', () => {
  console.log("Detected a redirect to somewhere other than example.org");
});
// 尝试访问 example.org。如果重定向到了跨域的网站
// 它就会触发一个 违反 CSP 的事件
// Try to fetch example.org. If it redirects to another cross-site website
// it will trigger a CSP violation event
fetch('https://example.org/might_redirect', {
  mode: 'no-cors',
  credentials: 'include'
});
</script>
{{< / highlight >}}

当攻击目标的重定向是跨站点的，且攻击目标存在属性为 `SameSite=Lax` 的 cookie 时，上述方法将不起作用，因为 `fetch` 不算是一个顶层 navigation。在这种情况下，攻击者可以使用另一个 CSP 指令，[`form-action`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/form-action)，并利用使用 `GET` 方法提交 HTML，这个行为属于顶层 navigation。

When the redirect of interest is cross-site and conditioned on the presence of a cookie marked `SameSite=Lax`, the approach outlined above won't work, because `fetch` doesn't count as a top-level navigation. In a case like this, the attacker can use another CSP directive, [`form-action`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/form-action), and leverage the fact that submitting a HTML form using `GET` as its method does count as a top-level navigation.

下面的例子中，如果表单的动作（第 3 行）重定向到 `https://example.org` 以外的网站，就会触发一个 `SecurityPolicyViolationEvent`。

The example below triggers a `SecurityPolicyViolationEvent` if the form's action (line 3) redirects to a website other than `https://example.org`:

{{< highlight html "linenos=table,linenostart=1" >}}
<!-- 设置只允许 example.org 的 Content-Security-Policy -->
<!-- Set the Content-Security-Policy to only allow example.org -->
<meta http-equiv="Content-Security-Policy"
      content="form-action https://example.org">
<form action="https://example.org/might_redirect"></form>
<script>
// 监听违反 CSP 的事件
// Listen for a CSP violation event
document.addEventListener('securitypolicyviolation', () => {
  console.log("Detected a redirect to somewhere other than example.org");
});
// 尝试访问 example.org。如果重定向到了跨域的网站
// 它就会触发一个 违反 CSP 的事件
// Try to get example.org via a form. If it redirects to another cross-site website
// it will trigger a CSP violation event
document.forms[0].submit();
</script>
{{< / highlight >}}

请注意，这种方法在 Firefox 中是不可行的（与基于 Chromium 的浏览器相反），因为 `form-action` 在该浏览器中不会阻止表单提交后的重定向。

Note that this approach is unviable in Firefox (contrary to Chromium-based browsers) because `form-action` doesn't block redirects after a form submission in that browser.

## 设想场景

一家网上银行决定将有钱的用户重定向到一个地址，这个地址上有一些很有吸引力的投资股票机会，当这些用户查询他们的账户余额时，会触发一个 navigation 到网站上的一个隐藏的地址。如果这个只针对特定的用户群才会触发，攻击者就有可能通过这部分泄露的信息，判断出用户的 “客户身份”。

An online bank decides to redirect wealthy users to attractive stock opportunities by triggering a navigation to a reserved space on the website when these users consult their account balance. If this is only done for a specific group of users, it becomes possible for an attacker to leak the "client status" of the user.

## 分区 HTTP 缓存绕过

如果一个网站 `example.com` 包涵一个来自 `*.example.com/resource` 的资源，那么该资源的缓存键与通过顶层 navigation 直接请求该资源的缓存键相同。这是因为缓存键是由顶层 *eTLD+1* 和 frame *eTLD+1* 组成的。[^cache-bypass]

If a site `example.com` includes a resource from `*.example.com/resource` then that resource will have the same caching key as if the resource was directly requested through top-level navigation. That is because the caching key is consisted of top-level *eTLD+1* and frame *eTLD+1*. [^cache-bypass]


由于窗口可以通过 `window.stop()` 来防止 navigate 到不同的源，而且设备上的缓存比网络上的快，所以通过检查在运行 `stop()` 之前，源是否发生改变，就可以检测出资源是否被缓存。

Because a window can prevent a navigation to a different origin with `window.stop()` and the on-device cache is faster than the network, it can detect if a resource is cached by checking if the origin changed before the `stop()` could be run. 

```javascript
async function ifCached_window(url) {
  return new Promise(resolve => {
    checker.location = url;

    // 仅缓存
    setTimeout(() => {
      checker.stop();
    }, 20);

    // 获取结果
    setTimeout(() => {
      try {
        let origin = checker.origin;
        // 超时之前，源未改变
        resolve(false);
      } catch {
        // 源改变了
        resolve(true);
        checker.location = "about:blank";
      }
    }, 50);
  });
}
```
创建窗口（使得检查成功后可返回）。

Create window (makes it possible to go back after a successful check)
```javascript
let checker = window.open("about:blank");
```
Usage
```javascript
await ifCached_window("https://example.org");
```
{{< hint info >}}
分区的 HTTP 缓存绕过这个手法，可以通过使用头 `Vary: Sec-Fetch-Site` 来防御，因为它是按照 initiator 隔离缓存，见 [Cache Protections]({{< ref "/docs/defenses/design-protections/cache-protections.md" >}})。防御之所以有效的因为是，这种攻击只适用于来自同一网站的资源，因此 `Sec-Fetch-Site` 头对攻击者来说是 `cross-site`，而对网站来说是 `same-site` 或 `same-origin`。

Partitioned HTTP Cache Bypass can be prevented using the header `Vary: Sec-Fetch-Site` as that splits the cache by its initiator, see [Cache Protections]({{< ref "/docs/defenses/design-protections/cache-protections.md" >}}). It works because the attack only applies for the resources from the same site, hence `Sec-Fetch-Site` header will be `cross-site` for the attacker compared to `same-site` or `same-origin` for the website.
{{< /hint >}}

## 防御

|       攻击方式        | [SameSite Cookies (Lax)]({{< ref "/docs/defenses/opt-in/same-site-cookies.md" >}}) | [COOP]({{< ref "/docs/defenses/opt-in/coop.md" >}}) | [Framing Protections]({{< ref "/docs/defenses/opt-in/xfo.md" >}}) |                                          [Isolation Policies]({{< ref "/docs/defenses/isolation-policies" >}})                                          |
| :-----------------------------: | :--------------------------------------------------------------------------------: | :-------------------------------------------------: | :---------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------: |
|   *history.length* (iframes)    |                                         ✔️                                          |                          ❌                          |                                 ✔️                                 |                                        [FIP]({{< ref "/docs/defenses/isolation-policies/framing-isolation" >}})                                         |
|   *history.length* (windows)    |                                         ❌                                          |                          ✔️                          |                                 ❌                                 |                                       [NIP]({{< ref "/docs/defenses/isolation-policies/navigation-isolation" >}})                                       |
| iframe 内部的 *onload* 事件  |                                         ✔️                                          |                          ❌                          |                                 ✔️                                 |                                        [FIP]({{< ref "/docs/defenses/isolation-policies/framing-isolation" >}})                                         |
|          下载栏           |                                         ✔️                                          |                          ❌                          |                  ❌{{< katex>}}^{1}{{< /katex >}}                  |                                       [NIP]({{< ref "/docs/defenses/isolation-policies/navigation-isolation" >}})                                       |
|  下载 Navigation (iframes)  |                                         ✔️                                          |                          ❌                          |                  ❌{{< katex>}}^{1}{{< /katex >}}                  |                                        [FIP]({{< ref "/docs/defenses/isolation-policies/framing-isolation" >}})                                         |
|  下载 Navigation (windows)  |                                         ❌                                          |           ❌{{< katex>}}^{1}{{< /katex >}}           |                                 ❌                                 |                                       [NIP]({{< ref "/docs/defenses/isolation-policies/navigation-isolation" >}})                                       |
|            膨胀技术            |                                         ✔️                                          |                          ❌                          |                                 ❌                                 |                                        [RIP]({{< ref "/docs/defenses/isolation-policies/resource-isolation" >}})                                        |
|         违反 CSP          |            ❌{{< katex>}}^{2}{{< /katex >}}                                        |                          ❌                          |                                 ❌                                 | [RIP]({{< ref "/docs/defenses/isolation-policies/resource-isolation" >}}) 🔗 [NIP]({{< ref "/docs/defenses/isolation-policies/navigation-isolation" >}}) |

🔗 – 防御机制必须结合起来才能有效地应对不同的情况。

____

1. 无论是 [COOP]({{< ref "/docs/defenses/opt-in/coop.md" >}}) 还是 [Framing Protections]({{< ref "/docs/defenses/opt-in/xfo.md" >}}) 都无法缓解重定向泄漏，因为当头 `Content-Disposition` 存在时，其他头会被忽略。
2. Lax 模式下的 SameSite cookies 可以保护网站不被 iframe 嵌入，但无法保护 window references 或服务器端重定向相关的泄漏，这与 Strict 模式是相反的。
---
1. Neither [COOP]({{< ref "/docs/defenses/opt-in/coop.md" >}}) nor [Framing Protections]({{< ref "/docs/defenses/opt-in/xfo.md" >}}) helps with the mitigation of the redirect leaks because when the header `Content-Disposition` is present, other headers are being ignored.
2. SameSite cookies in Lax mode could protect against iframing a website, but won't help with the leaks through window references or involving server-side redirects, in contrast to Strict mode.

## 真实案例

一个报告给 Twitter 的漏洞就使用了这种技术，利用 [XS-Search]({{< ref "../attacks/xs-search.md" >}}) 成功获取了私密推文的内容。这一攻击可行是因为只有当用户查询有结果时，该页面才会触发 navigation[^1]。

A vulnerability reported to Twitter used this technique to leak the contents of private tweets using [XS-Search]({{< ref "../attacks/xs-search.md" >}}). This attack was possible because the page would only trigger a navigation if there were results to the user query [^1].

## 参考文献

[^1]: Protected tweets exposure through the url, [link](https://hackerone.com/reports/491473)
[^2]: Disclose domain of redirect destination taking advantage of CSP, [link](https://bugs.chromium.org/p/chromium/issues/detail?id=313737)
[^3]: Using Content-Security-Policy for Evil, [link](http://homakov.blogspot.com/2014/01/using-content-security-policy-for-evil.html)
[^cache-bypass]: [github.com/xsleaks/wiki/pull/106](https://github.com/xsleaks/wiki/pull/106)
