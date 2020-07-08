/**
 * @module ApiOperation
 * 用于标注接口参数
 */
import OpenApi from '../openapi/index';
import { ApiModelPropertyOptions } from '../openapi/declare';

/**
 * 用于标注实体类下的指定属性
 * @param {ApiOperationOptions} options 属性配置 
 */
export default function ApiModelProperty(options: ApiModelPropertyOptions): PropertyDecorator {
  return (target, name) => {
    process.nextTick(() => {
      OpenApi.addModelProperty(options, target.constructor, name);
    });
  }
}