/**
 * 渲染进程的存储
 */

import { defineStore } from 'pinia'

export const useUserInfoStore = defineStore('userInfo', {
  state: () => {
    return {
      usrInfo: {}
    }
  },
  actions: {
    setInfo(userInfo) {
      this.userInfo = userInfo
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    },
    getInfo() {
      return this.userInfo
    }
  }
})
