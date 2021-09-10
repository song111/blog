## koa-compose 中间件实现原理

koa-compose 是 koa 中间件模型的主要实现方案，其以简洁的代码量实现了一套优雅高效的中间件顺序调度执行的方式，其源码是非常值得去研究的,源码如下；

```js
function compose(middleware) {
  // 此处删除了边界条件判断等多余代码...

  return function (context, next) {
    // last called middleware #
    let index = -1;
    return dispatch(0);

    /**  中间件的本质是把每个中间件嵌套组合起来形成一个函数，知识嵌套的方式是利用了promises实现
     * 1. dispatch 返回的一个promise实例将作为下一个中间件的next使用
     * 2. next 始终作为一个promise实例调用不管在普通函数还是在async 函数中
     * 3. 在next 的时候会调用下一个中间件，而造成当前中间件内部向下执行的中断，是形成洋葱模型主要机制
     * */

    function dispatch(i) {
      if (i <= index)
        return Promise.reject(new Error("next() called multiple times"));
      index = i;

      let fn = middleware[i];

      // 注意： 这里的目的是当当前中间件栈执行完成以后会调用next（即下个中间件） 把执行权交给下个执行环境 （主要作用切换中间件执行栈）
      if (i === middleware.length) fn = next;

      if (!fn) return Promise.resolve();

      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1))); // 递归的方式调用所有中间件
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };
}
```

下面根据一个示例来解释下 koa-compose 的工作原理

```js
const compose = require("koa-compose");
const Koa = require("koa");
const app = (module.exports = new Koa());

async function mid1(cxt, next) {
  console.log("start", 1);
  await next();
  console.log("end", 1);
}

async function mid2(cxt, next) {
  console.log("start", 2);
  await next();
  console.log("end", 2);
}

async function mid3(cxt, next) {
  console.log("start", 3);
  await next();
  console.log("end", 3);
}

async function m1d4(ctx, next) {
  console.log("start", 4);
  await next();
  console.log("end", 4);
}

// 先合并 mid1, mid2, mid3 中间件为一个中间件

const all = compose([mid1, mid2, mid3]);

app.use(all);

app.use(m1d4);

// koa 内部将会再次把app.use 执行的中间件搜集到 middleware 内再次进行合并

if (!module.parent) app.listen(3000);

// start 1
// start 2
// start 3
// start 4
// end 4
// end 3
// end 2
// end 1
```

可以看到中间件的执行顺序会严格按照合并顺序执行，并且完全遵循洋葱圈模型，下面介绍下其实现原理

**递归调用**
首先看下执行 compose 函数会发生？

1.  直接执行 compose 会返回一个闭包匿名函数，该匿名函数将作为一个中间件被调用,匿名函数执行也会产生一个闭包函数（dispatch）的执行结果（promise 实例）**注意：**其next 参数来自于跟匿名函数同级的下一个dispatch执行结果 ；
2.  匿名函数函数作为中间件执行会返回一个 promise 实例，该实例有三种结果，当前；
