import { ipcMain } from 'electron'

import store from './store'

const onLoginOrRegister = (callback) => {
  ipcMain.on('loginOrRegister', (e, isLogin) => {
    callback(isLogin)
  })
}

const onLoginSuccess = (callback) => {
  ipcMain.on('openChat', (e, config) => {
    store.initUserId(config.userId)
    store.setUserData('token', config.token)
    //TODO 增加用户配置
    callback(config)
    //TODO 初始化WS链接
  })
}

/**
 * 调整窗口大小
 */
const winTitleOp = (callback) => {
  ipcMain.on('winTitleOp', (e, data) => {
    callback(e, data)
  })
}

//测试
const onSetLocalStore = () => {
  ipcMain.on('setLocalStore', (e, { key, val }) => {
    store.setData(key, val)

    console.log(store.getData(key))
  })
}

const onGetLocalStore = () => {
  ipcMain.on('getLocalStore', (e, key) => {
    console.log('获取渲染进程的获取事件key:', key)
    e.sender.send('getLocalStoreCallback', '这里是主进程窝' + store.getData(key))
  })
}

export { onLoginOrRegister, onLoginSuccess, winTitleOp, onSetLocalStore, onGetLocalStore }
