/**
 * @module ExceptionHandler
 * @description 异常处理注解
 */
import Target from "./Target";
import RuntimeAnnotation from "./annotation/RuntimeAnnotation";

@Target
export class ExceptionHandlerAnnotation {

  handleException: Function

  constructor(meta: RuntimeAnnotation) {
    this.handleException = meta.method;
  }
}

/**
 * 标注指定类为一个rest 风格的controller
 */
export default Target.install<typeof ExceptionHandlerAnnotation, ExceptionHandlerAnnotation>(ExceptionHandlerAnnotation);