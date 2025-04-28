import { BrowserWindow, ipcMain, shell } from 'electron'

import store from './store'
import { closeWs, initWs } from './wsClient'
import {
  addUserSetting, loadLocalUser,
  selectSettingInfo,
  updateContactApplyNoReadCount
} from './database/UserSettingModel'
import {
  deleteChatSessionUser,
  readAll,
  selectChatSessionUser,
  topChatSessionUser,
  updateChatSessionByChatMessage,
  updateChatSessionStatus
} from './database/ChatSessionUserModel'
import { saveMessage, selectChatMessage, updateMessage } from './database/ChatMessageModel'
import {
  changeLocalFolder,
  closeLocalServer,
  createCover,
  downloadUpdate,
  openLocalFolder,
  saveAs,
  saveClipBoardFile,
  saveFileToLocal
} from './fileOperation'
import { deleteWindow, getWindow, saveWindow } from './windowProxy'
import icon from '../../resources/icon.png?asset'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { download } from 'node-gyp/lib/download'

const NODE_ENV = process.env.NODE_ENV

const onLoginOrRegister = (callback) => {
  ipcMain.on('loginOrRegister', (e, isLogin) => {
    callback(isLogin)
  })
}

const onLoginSuccess = (callback) => {
  ipcMain.on('openChat', (e, config) => {
    //存储用户id
    store.initUserId(config.userId)
    store.setUserData('token', config.token)
    addUserSetting(config.userId, config.email)
    callback(config)
    initWs(config, e.sender)
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

    console.log('六百六十六', store.getData(key))
  })
}

const onGetLocalStore = () => {
  ipcMain.on('getLocalStore', (e, key) => {
    console.log('获取渲染进程的获取事件key:', key)
    e.sender.send('getLocalStoreCallback', store.getData(key))
  })
}

/**
 * 查询chatSession
 */
const onLoadChatSession = () => {
  ipcMain.on('loadChatSession', async (e) => {
    const data = await selectChatSessionUser()
    e.sender.send('loadChatSessionCallback', data)
  })
}

/**
 * 从列表中删除会话
 */
const onDeleteChatSession = () => {
  ipcMain.on('deleteChatSession', (e, contactId) => {
    deleteChatSessionUser(contactId)
  })
}

/**
 * 置顶会话
 */
const onTopChatSession = () => {
  ipcMain.on('topChatSession', (e, { contactId, topType }) => {
    topChatSessionUser(contactId, topType)
  })
}

/**
 * 获取聊天
 */
const onLoadChatMessage = () => {
  ipcMain.on('loadChatMessage', async (e, data) => {
    const result = await selectChatMessage(data)
    e.sender.send('loadChatMessageCallback', result)
  })
}

/**
 * 更新当前会话信息
 */
const onSetSessionSelect = () => {
  ipcMain.on('setSessionSelect', (e, { contactId, sessionId }) => {
    if (sessionId) {
      store.setUserData('currentSessionId', sessionId)
      readAll(contactId)
    } else {
      store.deleteUserData('currentSessionId')
    }
  })
}

/**
 * 更新单条信息
 */
const onAddChatMessage = () => {
  ipcMain.on('addChatMessage', async (e, data) => {
    console.log('addChatMessage', data)
    //存储消息
    await saveMessage(data)
    //保存文件
    if (data.messageType === 5) {
      console.log('我去存本地了啊:', data.messageId, data.filePath, data.fileType)
      await saveFileToLocal(data.messageId, data.filePath, data.fileType)

      const updateInfo = { status: 1 }
      await updateMessage(updateInfo, { messageId: data.messageId })
    }

    // 更新session
    data.lastReceiveTime = data.sendTime
    //更新会话
    console.log('database,before update:', data, '\ncurTime:', new Date().getTime())
    await updateChatSessionByChatMessage(store.getUserData('currentSessionId'), data)
    //文件消息操作
    e.sender.send('addChatMessageCallback', { status: 1, messageId: data.messageId })
  })
}

/**
 * 创建缩略图
 */
const onCreateCover = () => {
  ipcMain.on('createCover', async (e, localFilePath) => {
    const stream = await createCover(localFilePath)
    e.sender.send('createCoverCallback', stream)
  })
}

/**
 * 打开新窗口
 */
const onOpenNewWindow = () => {
  ipcMain.on('newWindow', (e, config) => {
    openWindow(config)
  })
}

const openWindow = ({ windowId, title = 'WeTalk', path, width = 960, height = 720, data }) => {
  data.localServerPort = store.getUserData('localServerPort')
  let newWindow = getWindow(windowId)
  if (!newWindow) {
    newWindow = new BrowserWindow({
      title: '原梦通讯',
      width: width,
      height: height,
      fullscreenable: false,
      fullscreen: false,
      maximizable: false,
      autoHideMenuBar: true,
      titleBarStyle: 'hidden',
      resizable: false,
      frame: true,
      transparent: true,
      hasShadow: false,
      ...(process.platform === 'linux' ? { icon } : { icon }),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        contextIsolation: false
      }
    })
    saveWindow(windowId, newWindow)
    newWindow.setMinimumSize(600, 484)
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      newWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/index.html#${path}`)
    } else {
      newWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: `#${path}` })
    }

    if (NODE_ENV === 'development') {
      newWindow.webContents.openDevTools()
    }
    newWindow.on('ready-to-show', () => {
      newWindow.setTitle(title)
      newWindow.show()
    })
    newWindow.once('show', () => {
      setTimeout(() => {
        newWindow.webContents.send('pageInitData', data)
      }, 100)
    })
    newWindow.on('closed', () => {
      deleteWindow(windowId)
    })
  } else {
    newWindow.show()
    newWindow.setSkipTaskbar(false)
    newWindow.webContents.send('pageInitData', data)
  }
}

/**
 * 保存到本地把文件
 */
const onSaveAs = () => {
  ipcMain.on('saveAs', (e, data) => {
    saveAs(data)
  })
}

/**
 * 保存剪切板上的文件
 */
const onSaveClipBoardFile = () => {
  ipcMain.on('saveClipBoardFile', async (e, data) => {
    console.log('copy that')
    const result = await saveClipBoardFile(data)
    console.log('copy that result', result)
    e.sender.send('saveClipBoardFileCallback', result)
  })
}

/**
 * 加载好友申请数
 */
const onLoadContactApply = () => {
  ipcMain.on('loadContactApply', async (e) => {
    const userId = store.getUserId()
    let result = await selectSettingInfo(userId)
    let contactNoRead = 0
    if (result) {
      contactNoRead = result.contactNoRead
    }
    e.sender.send('loadContactApplyCallback', contactNoRead)
  })
}

/**
 * 清楚好友申请
 */
const onClearContactApplyCount = () => {
  ipcMain.on('clearMessageCount', async () => {
    await updateContactApplyNoReadCount()
  })
}

/**
 * 退出登录
 */
const onLoginOut = (callback) => {
  ipcMain.on('reLogin', async (e) => {
    callback()
    e.sender.send('reLogin')
    //关闭ws链接
    closeWs()
    //关闭本地媒体服务器
    closeLocalServer()
  })
}

/**
 * 打开本地存储目录
 */
const onOpenLocalFolder = () => {
  ipcMain.on('openLocalFolder', async () => {
    await openLocalFolder()
  })
}

/**
 * 获取本地存储目录
 */
const onGetSysSetting = () => {
  ipcMain.on('getSysSetting', async (e) => {
    let result = await selectSettingInfo()
    let sysSetting = result.sysSetting
    e.sender.send('getSysSettingCallback', sysSetting)
  })
}

/**
 * 获取本地存储目录
 */
const onChangeLocalFolder = () => {
  ipcMain.on('changeLocalFolder', async (e) => {
    await changeLocalFolder()
  })
}

/**
 * 获取本地ChatSession
 */
const onReloadChatSession = () => {
  ipcMain.on('reloadChatSession', async (e, { contactId }) => {
    await updateChatSessionStatus(contactId)
    const chatSessions = await selectChatSessionUser()
    e.sender.send('reloadChatSessionCallback', { contactId, chatSessions })
  })
}

/**
 * 打开外部链接
 */
const onOpenUrl = () => {
  ipcMain.on('openUrl', async (e, { url }) => {
    await shell.openExternal(url)
  })
}

/**
 * 开始下载
 */
const onDownloadUpdate = () => {
  ipcMain.on('downloadUpdate', async (e, { id, fileName }) => {
    await downloadUpdate(id, fileName)
  })
}

/**
 * 加载本地用户
 */
const onLoadLocalUser = () => {
  ipcMain.on('loadLocalUser', async (e) => {
    let userList = await loadLocalUser()
    e.sender.send('loadLocalUserCallback', userList)
  })
}
export {
  onLoadChatSession,
  onLoginOrRegister,
  onLoginSuccess,
  winTitleOp,
  onSetLocalStore,
  onGetLocalStore,
  onDeleteChatSession,
  onTopChatSession,
  onLoadChatMessage,
  onAddChatMessage,
  onSetSessionSelect,
  onCreateCover,
  onOpenNewWindow,
  onSaveAs,
  onSaveClipBoardFile,
  onLoadContactApply,
  onClearContactApplyCount,
  onLoginOut,
  onOpenLocalFolder,
  onGetSysSetting,
  onChangeLocalFolder,
  onReloadChatSession,
  onOpenUrl,
  onDownloadUpdate,
  onLoadLocalUser
}
