+++
title = "postMessage 广播"
description = ""
date = "2020-10-01"
category = [
    "Attack",
]
abuse = [
    "postMessage",
]
defenses = [
    "Application Fix",
]
menu = "main"
weight = 3
+++

应用经常使用 [postMessage 广播](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) 来与其他源头分享信息。使用 `postMessage` 会导致两种类型的 XS-Leaks：

Applications often use [postMessage broadcasts](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) to share information with other origins. Using `postMessage` can lead to two kinds of XS-Leaks:

* 与不信任的来源共享敏感信息
    * `postMessage` API 支持 `targetOrigin` 参数，可以用来限制哪些来源可以接收该消息。如果消息中包含敏感数据，那么就需要使用这个参数。

* 通过内容的不同或广播是否存在，可以泄露出信息
    * 类似其他 XS-Leak 技术，这可以用来组成一个 oracle。例如，假设当一个特定用户名的用户出现时，应用才会发送 postMessage 广播："Page Loaded"，那么这就可以用来泄漏信息。
---
* Sharing sensitive messages with untrusted origins
    * The `postMessage` API supports a `targetOrigin` parameter that can be used to restrict which origins can receive the message. If the message contains any sensitive data, it is important to use this parameter.  

* Leaking information based on varying content or on the presence of a broadcast
    * Similar to other XS-Leak techniques, this could be used to form an oracle. For example, if an application sends a postMessage broadcast saying "Page Loaded" only if a user  with a given username exists, this could be used to leak information. 

## 防御

目前还没有明确的解决方案来缓解这个 XS-Leak，因为它在很大程度上取决于发送 postMessage 广播的目的。应用应该将 postMessage 通信限制在一组已知的源中。若无法实现，那不管是在什么状态下，通信行为都应该表现一致，可防止攻击者根据通信之间的差异推断信息。

There is no clear solution to mitigate this XS-Leak as it depends deeply on the purpose of sending a postMessage broadcast. Applications should limit postMessage communications to a group of known origins. When this is not possible, the communications should behave consistently regardless of the state to prevent attackers from inferring information based on differences between the communications.

## 参考文献

[^1]: Cross-Origin State Inference (COSI) Attacks: Leaking Web Site States through XS-Leaks, [link](https://arxiv.org/pdf/1908.02204.pdf)
