---
weight: 1000
bookFlatSection: true
title: "贡献"
---

# 贡献

本页解释了如何为 XS-Leaks wiki 做出贡献，并对已贡献内容的用户表示感谢。

This page explains how you can contribute to the XS-Leaks wiki and acknowledges the users who have contributed content.

## 贡献指南

文章的源文件位于 [wiki 资源库](https://github.com/xsleaks/wiki/tree/master/content)的 `/content` 目录下。

The article source files reside in the `/content` directory in the [wiki repository](https://github.com/xsleaks/wiki/tree/master/content).

你可以通过各种方式对文章进行修改：

You can make changes to articles in various ways:

### Pull requests

为了提交一个 pull request：

In order to submit a pull request:

1. Fork 仓库。
2. 进行修改，并把它们放到 pull request 中。
3. 将该分支的 pull request 提交到主文件夹中的 master。
---
1. Fork the repository.
2. Make changes there and place them into a pull request.
3. Submit the pull request of the branch to master in the main folder.

如果你不确定文件夹结构，你可以查一下其他文章是怎么写的。

If you are not sure about the folder structure, you can look up how other articles were written.

### 直接编辑
在每篇文章下面，都有一个 `Edit this article` 锚定符，它可以直接将你重定向到 GitHub 编辑器。

Under every article, there is an `Edit this article` anchor which redirects you straight to the GitHub editor.

### Github issues
如果以上两种方法都不适合你，我们希望你能在主 wiki 中创建一个[新 issue](https://github.com/xsleaks/wiki/issues/new)，在那里你可以解释你对当前版本的 wiki 的改进、问题或任何其他意见。

If neither of the above options work for you, we'd appreciate if you created a [new issue](https://github.com/xsleaks/wiki/issues/new) in the main wiki repository where you can explain the improvement, issue, or any other comment you have regarding the current version of the wiki.

## 本地部署
The wiki is built using the [Hugo framework](https://gohugo.io/getting-started/installing/).

You can run a local environment by following these steps:

1. Install the [Hugo Framework](https://gohugo.io/getting-started/installing/), **extended** version > 0.68.
2. Clone this repo.
3. Run `hugo server --minify` in the root directory.
4. Open your browser and go to http://localhost:1313 (or as indicated by the Hugo output).

## Wiki theme

We use the [Hugo Book Theme](https://themes.gohugo.io/hugo-book/) with custom modifications.

### Custom hint shortcode
We modified the default [Hints](https://themes.gohugo.io/theme/hugo-book/docs/shortcodes/hints/) used by the theme; the modified boxes are listed below:

{{< hint info >}}
This is an *Info* box for the `{{</* hint info */>}}` shortcode.
{{< /hint >}}

{{< hint note >}}
This is a *Note* box for the `{{</* hint note */>}}` shortcode.
{{< /hint >}}

{{< hint example >}}
This is an *Example* box for the `{{</* hint example */>}}` shortcode.
{{< /hint >}}

{{< hint tip >}}
This is a *Tip* box for the `{{</* hint tip */>}}` shortcode.
{{< /hint >}}

{{< hint important >}}
This is an *Important* box for the `{{</* hint important */>}}` shortcode.
{{< /hint >}}

{{< hint warning >}}
This is a *Warning* box for the `{{</* hint warning */>}}` shortcode.
{{< /hint >}}

### Original style
The original hint style can be used by adding a third parameter, `noTitle`, to the shortcode, e.g.:

{{< hint example noTitle>}}

`{{</* hint example noTitle */>}}`

{{< /hint >}}

## 鸣谢

We would like to thank the following users who [contributed](https://github.com/xsleaks/wiki/graphs/contributors) to this XS-Leaks wiki:

[Manuel Sousa](https://github.com/manuelvsousa), [terjanq](https://github.com/terjanq),
[Roberto Clapis](https://github.com/empijei), [David Dworken](https://github.com/ddworken),
[NDevTK](https://github.com/NDevTK), [1lastBr3ath](https://twitter.com/1lastBr3ath),
[Brasco](https://github.com/Brasco/), [rick.titor](https://github.com/riccardomerlano),
[Chris Fredrickson](https://github.com/cfredric/), [jub0bs](https://github.com/jub0bs)

In addition, we would also like to acknowledge the users who [contributed](https://github.com/xsleaks/xsleaks/wiki/Browser-Side-Channels/_history) to the predecessor of the current XS-Leaks wiki:

[Eduardo' Vela" \<Nava> (sirdarckcat)](https://github.com/sirdarckcat), [Ron Masas](https://github.com/masasron),
[Luan Herrera](https://github.com/lbherrera), [Sigurd](https://github.com/DonSheddow),
[larson reever](https://github.com/larsonreever), [Frederik Braun](https://github.com/mozfreddyb)
[Masato Kinugawa](https://github.com/masatokinugawa), [sroettger](https://github.com/sroettger)

最后，我们感谢所有参与分享和探索 XS-Leaks 深处的其他了不起的研究人员!

And finally, our thanks go to all other amazing researchers that participate in sharing and exploring the depths of XS-Leaks!
