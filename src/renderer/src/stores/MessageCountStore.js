import { defineStore } from 'pinia'

export const useMessageCountStore = defineStore('messageCount', {
  state: () => {
    return {
      messageCount: {
        chatCount: 0,
        contactApplyCount: 0
      }
    }
  },
  actions: {
    setCount(key, value, forceUpdate) {
      //console.log('强制更新: ', forceUpdate, 'key: ', key, 'value: ', value)
      if (forceUpdate) {
        //console.log('强制更新')
        this.messageCount[key] = value
      } else {
        //console.log('累加更新')
        let curCount = this.messageCount[key]
        this.messageCount[key] = curCount + value
      }
    },
    getCount(key) {
      return this.messageCount[key]
    }
  }
})
