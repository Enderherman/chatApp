import { defineStore } from 'pinia'

export const useAvatarInfoStore = defineStore('avatarInfo', {
  state: () => {
    return {
      avatarMap: {}, // 原有的 forceReload 标记
      avatarCache: {}, // 新增：存储头像URL缓存
      avatarVersion: {} // 新增：头像版本号，用于触发组件重新渲染
    }
  },
  actions: {
    setForceReload(uid, forceReload) {
      this.avatarMap[uid] = forceReload
    },
    getForceReload(uid) {
      return this.avatarMap[uid]
    },
    // 新增方法：更新头像缓存
    updateAvatarCache(uid, url) {
      this.avatarCache[uid] = {
        url,
        timestamp: Date.now()
      }
      // 更新版本号，触发组件重新渲染
      this.avatarVersion[uid] = (this.avatarVersion[uid] || 0) + 1

      // 更新完缓存后，重置 forceReload 标记
      this.setForceReload(uid, false)
    },// 获取头像URL
    getAvatarUrl(uid) {
      return this.avatarCache[uid]?.url
    },

    // 获取头像版本号
    getAvatarVersion(uid) {
      return this.avatarVersion[uid] || 0
    },

    // 清除缓存，强制从服务器获取
    invalidateAvatar(uid) {
      if (this.avatarCache[uid]) {
        delete this.avatarCache[uid]
      }
      // 增加版本号以触发更新
      this.avatarVersion[uid] = (this.avatarVersion[uid] || 0) + 1
      // 设置 forceReload 标记为 true
      this.setForceReload(uid, true)
    }


  }
})
