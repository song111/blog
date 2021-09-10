1、如何实现单页面路由变化页面切换？
2、如何进行页面跳转前的询问？
3、history 如何与 react 进行结合？

在之前研究使用 react-router 自定义 confirm 的时候研究了下 react-router 的源码，现在把自己对 react-router 实现原理的理解记录下来。
在看源码之前我是带着问题看的，这些问题是：

- 1、如何实现单页面路由变化页面切换？
- 2、怎样进行路由匹配？
- 3、如何进行页面跳转前的询问？
- 4、history 如何与 react 进行结合？
- 5、history的location是怎么样进行构造的？

带着这些问题我去查看了react-router 的源码，




参考：
- [react-router原理之路径匹配](https://juejin.cn/post/6844903609411305479)
- [history源码解析-管理会话历史记录](https://juejin.cn/post/6844903729611669511)