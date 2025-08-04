/**
 * 缓存依赖关系配置
 * key: 缓存键名
 * value: 该缓存依赖的属性列表
 */
const CACHE_DEPENDENCIES: Record<string, string[]> = {
  'transform': ['matrix', 'parent'],
  'boundingBox': ['transform', 'width', 'height', 'children'],
  'rotation': ['matrix'],
  'hoverPath': ['width', 'height'],
  'strokeBox': ['boundingBox', 'strokeWidth'],
  'renderBox': ['strokeBox', 'shadow', 'blur'],
};

/**
 * 统一缓存管理器
 * 负责管理节点的各种缓存属性，提供自动失效机制
 */
export class CacheManager {
  private cache = new Map<string, any>();
  private dirtyFlags = new Set<string>();

  /**
   * 获取缓存值，如果缓存失效则重新计算
   * @param key 缓存键
   * @param computer 计算函数
   * @returns 缓存值
   */
  get<T>(key: string, computer: (oldValue?: any) => T): T {
    if (this.isCacheDirty(key)) {
      const value = computer(this.cache.get(key));
      this.cache.set(key, value);
      this.clearDirtyFlag(key);
      return value;
    }
    return this.cache.get(key);
  }

  /**
   * 标记依赖项为脏状态
   * @param dependency 依赖项名称
   */
  markDirty(dependency: string): void {
    this.dirtyFlags.add(dependency);
    
    // 清除依赖此项的所有缓存
    for (const [cacheKey, deps] of Object.entries(CACHE_DEPENDENCIES)) {
      if (deps.includes(dependency)) {
        this.cache.delete(cacheKey);
      }
    }
  }

  /**
   * 清除所有缓存
   */
  clearAll(): void {
    this.cache.clear();
    this.dirtyFlags.clear();
  }

  /**
   * 检查缓存是否需要重新计算
   * @param key 缓存键
   * @returns 是否为脏状态
   */
  private isCacheDirty(key: string): boolean {
    // 如果缓存不存在，需要计算
    if (!this.cache.has(key)) {
      return true;
    }
    
    // 检查依赖项是否有变化
    const deps = CACHE_DEPENDENCIES[key] || [];
    return deps.some(dep => this.dirtyFlags.has(dep));
  }

  /**
   * 清除与指定缓存相关的脏标记
   * @param key 缓存键
   */
  private clearDirtyFlag(key: string): void {
    const deps = CACHE_DEPENDENCIES[key] || [];
    deps.forEach(dep => this.dirtyFlags.delete(dep));
  }

  /**
   * 获取当前缓存状态（调试用）
   */
  getDebugInfo(): { cacheKeys: string[], dirtyFlags: string[] } {
    return {
      cacheKeys: Array.from(this.cache.keys()),
      dirtyFlags: Array.from(this.dirtyFlags)
    };
  }
}