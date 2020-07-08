/**
 * @module HotReload
 */
import path from 'path';
import fs from 'fs';
import HotModule from './HotModule';
import Module from 'module';

export declare class NodeHotModule extends Module {
  hot: HotModule
}

export declare class HotOptions {
  /**
   * 热更新监听目录
   */
  cwd: string
  /**
   * 热更新执行频率，单位：毫秒
   */
  reloadTimeout?: number
}

class HotReload {
  /**
   * 热更新配置
   */
  options: HotOptions

  /**
   * 当前所有热更新模块
   */
  private hotModules: Map<string, HotModule>

  /**
   * 热更新执行频率单位：毫秒
   */
  private reloadTimeout: number

  constructor() {
    this.hotModules = new Map<string, HotModule>();
  }

  /**
   * 创建指定id的热更新模块，如果模块已存在，则直接返回
   * @param {Module} mod 模块对象 
   */
  public create(mod): HotModule {
    const id = mod.id;
    if (!this.hotModules.get(id)) {
      mod.hot = new HotModule(id);
      this.hotModules.set(id, mod.hot);
    }
    return this.hotModules.get(id);
  }

  /**
   * 监听文件改动
   */
  watch(cwd) {
    const runtime = { timerId: null }
    fs.watch(cwd, { recursive: true }, (type, filename) => {
      const id = path.join(cwd, filename);
      clearTimeout(runtime.timerId);
      runtime.timerId = setTimeout(() => this.handleReload(id), this.reloadTimeout);
    });
  }

  /**
   * 文件改动时，处理热更新
   * @param id 
   */
  handleReload(id) {
    if (!require.cache[id]) {
      // 如果模块已删除，则直接掠过
      return;
    }
    this.buildDependencies();
    const start = Date.now();
    this.reload(id, {});
    const end = new Date();
    this.buildDependencies();
    console.log(`Time: ${end.getTime() - start}ms`);
    console.log(`Built at: ${end.toLocaleDateString()} ${end.toLocaleTimeString()}`);
    console.log(`Hot reload successfully`);
  }

  /**
   * 重载模块
   */
  reload(id, reloadeds) {
    if (reloadeds[id] || !require.cache[id]) {
      return;
    }
    reloadeds[id] = true;
    console.log(`Hot reload: ${id} ...`);
    // 获取旧的模块实例
    const old = require.cache[id] as NodeHotModule;
    const hot = old.hot as HotModule;
    // 执行hooks.pre
    hot.invokeHook('pre', {}, old);
    // 执行hooks.preend
    hot.invokeHook('preend', {}, old);
    // 将hot对象从旧的模块实例上分离
    delete old.hot;
    // 删除缓存
    delete require.cache[id];
    // 重新载入模块
    require(id);
    // 获取当前更新后的模块实例
    const now = require.cache[id];
    // 从子依赖中删除掉刚刚引入的模块，防止出现错误的依赖关系
    const index = module.children.indexOf(now);
    index > -1 ? module.children.splice(index, 1) : undefined;
    // 执行hooks.accept
    const reasons = hot.reasons;
    reasons.forEach((reason) => {
      if (reason.hooks.accept) {
        // 如果父模块定义了accept 
        reason.hooks.accept(now);
      } else {
        // 如果父模块没有定义accept 则重新载入父模块
        this.reload(reason.id, reloadeds);
      }
    })
    // 还原父依赖
    if (old.parent) {
      now.parent = require.cache[old.parent.id];
    }
  }

  /**
   * 改写require,给需要热更的模块添加
   */
  hotWrap() {
    const extensions = require.extensions;
    Object.keys(extensions).forEach((ext) => {
      const handler = extensions[ext];
      extensions[ext] = (mod, id, ...others) => {
        if (!HotModule.isInclude(id)) {
          return handler(mod, id, ...others);
        }
        const anyModule = mod as any;
        const parent = this.create(mod.parent);
        const hot = this.create(mod);
        // 附加 hot对象
        anyModule.hot = hot;
        if (module !== mod.parent) {
          hot.addReason(parent);
        }
        // 执行模块初始化
        handler(mod, id, ...others);
        // 返回热更新模块的exports
        return mod.exports;
      }
    });
  }

  /**
   * 项目启动后，初始化构建热更新模块
   */
  buildDependencies() {
    const cache = require.cache;
    Object.keys(cache).map((k) => {
      const mod = cache[k];
      if (HotModule.isInclude(k)) {
        const hotModule = this.create(mod);
        mod.children.forEach((m) => {
          this.create(m).addReason(hotModule)
        });
      }
    });
  }

  /**
   * 监听改变
   */
  run(options: HotOptions) {
    this.options = options;
    this.reloadTimeout = options.reloadTimeout || 300;
    this.hotWrap();
    // 监听文件改动
    this.watch(options.cwd);
  }
}

export default new HotReload();