# Demo

注：
1. 这里大多数是 poc 或者很弱的 exp，仅做示例，不考虑实用性
1. 不考虑浏览器兼容，操作系统兼容，显示器大小兼容，移动 PC 端兼容
1. demo 均不会收集任何信息，可以审计代码 :)

## demo

### 恶意验证码.html
目的：获取用户手机号

使用步骤：
1. 打开 Chrome
1. 登录百度账号（需要绑定过手机号）：https://www.baidu.com/my/index
1. 用 Chrome 打开 `恶意验证码.html`，按照提示输入验证码
1. surprise!

经过测试，macOS 的 Chrome 是可以完美复现的。

## ctf
### susctf-2022-ez_note
这道题有 2 份代码，一份是 challenge，搭建环境的话，直接 `docker-compose up` 即可。另一份是 report，估计是因为有一些机器人敏感配置的原因，出题人没有给源码。所以我写了一个 `bot.py` 用来简单模拟一下 bot，直接 `python bot.py` 即可。另外还有用来接收 flag 的 `server.py`，同样直接运行即可。

这道是 2022 susctf 的 web 题，按照当时的解题情况来看，仅有 8 解。其实如果知道是 xsleaks 的话，应该是不难的。因为根据题目提供的附件代码来看，直接用 nodejs 操作浏览器访问网站，除了可能是 xss 之外，大概率就是 xsleaks 了。

思路如下：
1. 测试功能可以发现，搜索到正确的关键字时，会自动进行跳转，那么就可以通过 `history.length` 来判断是否跳转。打开搜索页面，length 为 1，点击搜索跳转到搜索结果页，length 为 2；若搜到文章，则继续跳转，length 为 3 说明 flag 页面中存在搜索的关键字
1. 由比赛公告可知，flag 格式为 `SUSCTF{[a-z0-9_]*}`，所以初始的关键字就可以是 `SUSCTF{`
1. 通过遍历 flag 的每下一位，判断是否命中关键字，即可不断猜解出全部 flag
1. 触发 bot 访问时的相关逻辑可以由题目附件 `ez_note/visit.js` 审计得到，其中有一个很重要的地方是，访问的地址是通过 `url = new URL(path, site)` 得到的，而根据[这个文档](https://nodejs.org/api/url.html#new-urlinput-base)，它有一个特性是，如果 path 的值是完整的 url，那么 site 值会被直接忽略。所以我们提交 `http://127.0.0.1:5000/` 时访问的是 `http://127.0.0.1:5000/` 而不是 `http://localhost:10001/` 下的某个路径。

poc 见 `poc.html`，触发 bot 访问的方式为：`http://127.0.0.1:8088/visit?path=http://127.0.0.1:5000/`，每次触发可以猜解出一个字符。当然，也可以写一份完整的 js 来一次性获取全部的字符。
