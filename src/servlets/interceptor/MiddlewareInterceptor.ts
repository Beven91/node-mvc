/**
 * @module MiddlewareInterceptor
 * @description 描述
 */

import { Middleware } from "../../interface/declare";
import InterruptModel from "../models/InterruptModel";
import Middlewares from "../models/Middlewares";
import HandlerInterceptorAdapter from "./HandlerInterceptorAdapter";

export default class MiddlewareInterceptor extends HandlerInterceptorAdapter {

  private middlewares: Array<Middleware>

  constructor(...middlewares: Array<Middleware>) {
    super();
    this.middlewares = middlewares || [];
  }

  /**
  * 在处理action前，进行请求预处理，通常可以用于编码、安全控制、权限校验
  * @param { HttpRequest } request 当前请求对象
  * @param { HttpResponse } response 当前响应对象
  * @param { ControllerContext } handler  当前拦截待执行的函数相关信息
  * @returns { boolean }
  *   返回值：true表示继续流程（如调用下一个拦截器或处理器）；false表示流程中断（如登录检查失败），不会继续调用其他的拦截器或处理器，此时我们需要通过response来产生响应；
  */
  preHandle(request, response, handler): Promise<boolean> | boolean {
    if (this.middlewares.length < 1) {
      return true;
    }
    const invoker = new Middlewares(this.middlewares);
    return invoker.execute(request, response).then((res) => {
      // 如果返回结果，不是interrup 则标识中间件已经处理了返回，这里需要返回 false
      return res instanceof InterruptModel;
    })
  }
}