# XS-Leaks Wiki

Fork from https://github.com/xsleaks/wiki

由于本人翻译水平有限，所以本翻译保留了原文，方便进行对照。

## 进度 67%
<details>
<summary>34/49 点击展开进度详情</summary>

- [x] `README.md`
- [x] `_index.md`
- [x] `attacks/_index.md`
- [x] `attacks/xs-search.md`
- [x] `attacks/window-references.md`
- [x] `attacks/navigations.md`
- [x] `attacks/css-tricks.md`
- [x] `attacks/frame-counting.md`
- [x] `attacks/error-events.md`
- [x] `attacks/cache-probing.md`
- [x] `attacks/element-leaks.md`
- [x] `attacks/id-attribute.md`
- [x] `attacks/postmessage-broadcasts.md`
- [x] `attacks/browser-features/_index.md`
- [x] `attacks/browser-features/corb.md`
- [x] `attacks/browser-features/corp.md`
- [x] `attacks/timing-attacks/_index.md`
- [x] `attacks/timing-attacks/clocks.md`
- [x] `attacks/timing-attacks/connection-pool.md`
- [x] `attacks/timing-attacks/execution-timing.md`
- [x] `attacks/timing-attacks/hybrid-timing.md`
- [x] `attacks/timing-attacks/network-timing.md`
- [x] `attacks/timing-attacks/performance-api.md`
- [x] `attacks/experiments/_index.md`
- [x] `attacks/experiments/portals.md`
- [x] `attacks/experiments/scroll-to-text-fragment.md`
- [x] `attacks/css-injection.md`
- [x] `attacks/historical/_index.md`
- [x] `attacks/historical/content-type.md`
- [x] `attacks/historical/stateful-browser-features.md`
- [x] `defenses/_index.md`
- [x] `defenses/opt-in/_index.md`
- [x] `defenses/opt-in/coop.md`
- [x] `defenses/opt-in/corp.md`
- [x] `defenses/opt-in/document-policies.md`
- [ ] `defenses/opt-in/fetch-metadata.md`

</details>

## Demo
demo 文件夹中是我根据 wiki 以及一些已有代码，尝试写的 poc/exp，仅供参考。


## 部署流程

### 在本地部署

1. 安装 [Hugo 框架](https://gohugo.io/getting-started/installing/) **补充** 版本需要 > 0.68
2. 克隆本仓库
3. 在根目录中运行 `hugo server --minify`
4. 访问 http://localhost:1313 (或者按照 hugo 的输出来访问)

### 生成静态文件

1. 执行 `hugo --buildDrafts`

## 自动化部署【暂停使用】

~~本仓库的每次 Pull Request 都会触发 [Github Actions](https://github.com/features/actions) 进行自动化部署与推送 XS-Leaks Wiki。为了将 Github Actions 用在 Github Pages 中，我们用到了 [actions-gh-pages](https://github.com/peaceiris/actions-gh-pages)。为了通过 Hugo Framework 来自动化化部署网站，我们还用到了 [actions-hugo](https://github.com/peaceiris/actions-hugo)。~~

~~为了让 workflow 有权限访问本仓库，我们用到了 [deploy_key](https://github.com/peaceiris/actions-gh-pages#%EF%B8%8F-set-ssh-private-key-deploy_key)，它属于本仓库的私有设置。~~
