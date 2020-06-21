/**
 * @module ServletKoaContext
 * @description koa框架接入上下文实现
 */
import ServletContext from '../http/ServletContext';

export default class ServletKoaContext extends ServletContext {
  /**
   * 用于接入要实现的目标平台的启动入口，主要用于
   * 返回一个启动中间件函数，通过返回的来获取到 request response next
   * 然后调用 callback(request,response,next) 即可
   * @param callback 
   */
  static launch(callback) {
    return function (context, next) {
      callback(context.request, context.response, next);
    }
  }
}