"use strict";

/**
 * Expose compositor.
 */

module.exports = compose;

/**
 * Compose `middleware` returning
 * a fully valid middleware comprised
 * of all those which are passed.
 *
 * @param {Array} middleware
 * @return {Function}
 * @api public
 */

function compose(middleware) {
  if (!Array.isArray(middleware))
    throw new TypeError("Middleware stack must be an array!");
  for (const fn of middleware) {
    if (typeof fn !== "function")
      throw new TypeError("Middleware must be composed of functions!");
  }

  /**
   * @param {Object} context
   * @return {Promise}
   * @api public
   */

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

      if (i === middleware.length) fn = next;  // 注意： 这里的目的是当当前中间件栈执行完成以后会调用next（即下个中间件） 把执行权交给下个执行环境 （主要作用切换中间件执行栈）
      if (!fn) return Promise.resolve();
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));   // 递归的方式调用所有中间件
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };
}
