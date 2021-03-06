/**
 * @module ServletContext
 * @description 请求上下文
 */
import { IncomingMessage } from 'http';
import HttpServletRequest from './HttpServletRequest';
import HttpServletResponse from './HttpServletResponse';
import WebMvcConfigurationSupport from '../config/WebMvcConfigurationSupport';
import HandlerExecutionChain from '../interceptor/HandlerExecutionChain';

export default abstract class ServletContext {

  private releaseQueues = new Array<Function>();

  /**
   * 是否next函数被调用
   */
  public isNextInvoked: boolean

  /**
   * forward栈
   */
  public forwardStacks: Array<string>

  /**
   * 当前网站的全局配置
   */
  public readonly configurer: WebMvcConfigurationSupport;

  /**
   * 当前正在处理的请求实例
   */
  public request: HttpServletRequest;

  /**
   * 当前正在处理的请求的返回实例
   */
  public response: HttpServletResponse;

  /**
   * 当前匹配的处理器执行链
   */
  public chain: HandlerExecutionChain

  private params: Map<any, any>

  /**
   * 跳转到下一个请求处理器
   */
  public readonly next: (error?) => void;

  public requestDefinitionInstances;

  /**
   * 设置属性值
   * @param name 属性名
   * @param value 属性值
   */
  public setAttribute(name: any, value: any) {
    this.params.set(name, value);
  }

  /**
   * 获取属性值
   * @param name 属性名称 
   */
  public getAttrigute(name) {
    return this.params.get(name);
  }

  /**
   * 构造一个上下文实例
   * @param request 当前正在处理的请求实例
   * @param response 当前正在处理的请求的返回实例
   * @param next 跳转到下一个请求处理器
   */
  constructor(configurer: WebMvcConfigurationSupport, request: IncomingMessage, response, next) {
    this.request = new HttpServletRequest(request, this);
    this.response = new HttpServletResponse(response, this);
    this.params = new Map<any, any>();
    this.configurer = configurer;
    this.next = (...params) => {
      if (!this.response.nativeResponse.writableFinished) {
        next(...params);
      }
      this.isNextInvoked = true;
    };
    this.forwardStacks = [];
    this.requestDefinitionInstances = {};
  }

  /**
   * 添加一个资源销毁操作
   * @param handler 当前销毁函数会在请求结束后执行（无论请求执行成功还是失败)
   */
  addReleaseQueue(handler) {
    this.releaseQueues.push(handler);
  }

  /**
   * 执行资源释放队列
   */
  doReleaseQueues() {
    this.releaseQueues.forEach((handler) => {
      new Promise((resolve: any) => {
        handler()
        resolve();
      })
    });
    this.releaseQueues.length = 0;
  }

  /**
   * 用于接入要实现的目标平台的启动入口，主要用于
   * 返回一个启动中间件函数，通过返回的来获取到 request response next
   * 然后调用 callback(request,response,next) 即可
   * @param callback 
   */
  static launch(callback: Function): (request, response, next) => any {
    return (request, response, next) => callback(request, response, next);
  }
}