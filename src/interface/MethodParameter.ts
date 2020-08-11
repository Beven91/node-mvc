/**
 * @module MethodParameter
 * @description 请求参数配置类
 */

import RuntimeAnnotation from "../servlets/annotations/annotation/RuntimeAnnotation"
import { AnnotationFunction } from "../servlets/annotations/Target"

export class MethodParameterOptions {
  /**
   * 需要从请求中提取的参数名称
   */
  public value?: string

  /**
   * 所在的参数名称
   */
  public name?: string

  /**
   * 当前参数的描述信息
   */
  public desc?: string

  /**
  * 参数是否必须传递 默认值为 true
  */
  public required?: boolean

  /**
   * 参数默认值,如果设置了默认值，则会忽略 required = true
   */
  public defaultValue?: any

  /**
   * 参数的数据类型
   */
  public dataType?: Function

  /**
   * 参数传入类型 可选的值有path, query, body, header or form
   */
  public paramType?: string
}

export default class MethodParameter extends MethodParameterOptions {

  /**
   * 注解
   */
  private annotation: RuntimeAnnotation

  /**
   * 参数传入类型 可选的值有path, query, body, header or form
   */
  public paramType?: string

  public get ctor() {
    return this.annotation.ctor;
  }

  /**
   * 判断当前参数是否存在指定注解
   */
  public hasParameterAnnotation(annotation: AnnotationFunction<any>): boolean {
    // const annotations = RuntimeAnnotation.getMethodAnnotations(this.target,this.method);
    const ctor = annotation.Annotation || annotation;
    return this.annotation && this.annotation.nativeAnnotation instanceof ctor;
    // return !!annotations.find((a) => a.nativeAnnotation instanceof ctor);
  }

  /**
   * 
   * @param options 
   * @param paramType 
   */

  constructor(options, paramType?: string, annotation?: RuntimeAnnotation) {
    super();
    if (options instanceof MethodParameter) {
      return options;
    } else if (typeof options === 'string') {
      this.value = options;
    } else if (options) {
      this.value = options.value;
      this.desc = options.desc;
      this.required = options.required;
      this.name = options.name;
      this.dataType = options.dataType;
      this.defaultValue = options.defaultValue;
      this.paramType = options.paramType;
    }
    this.annotation = annotation;
    this.paramType = this.paramType || paramType;
  }
}