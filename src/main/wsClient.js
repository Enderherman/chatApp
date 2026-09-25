import WebSocket from 'ws'

const NODE_ENV = process.env.NODE_ENV

import store from './store'
import {
  saveOrUpdateChatSessionByMessage,
  saveOrUpdateChatSessionUserBatch4Init,
  selectUserSessionByContactId,
  updateGroupName
} from './database/ChatSessionUserModel'
import { saveMessage, saveMessageBatch, updateMessage } from './database/ChatMessageModel'
import { updateContactApplyNoReadCount } from './database/UserSettingModel'

let ws = null
let maxReconnectTimes = 5
let lockReconnect = false
let wsUrl = null
let sender = null
let needReconnect = null

// 在Electron环境中添加适当的选项
const wsOptions =
  NODE_ENV !== 'development'
    ? {} // 生产环境选项
    : { rejectUnauthorized: false } // 开发环境可以禁用证书验证

const initWs = (config, _sender) => {
  wsUrl = `${NODE_ENV !== 'development' ? store.getData('prodWsDomain') : store.getData('devWsDomain')}?token=${config.token}`
  sender = _sender
  needReconnect = true
  maxReconnectTimes = 5
  createWs()
}

const createWs = () => {
  if (wsUrl === null) {
    return
  }

  ws = new WebSocket(wsUrl, wsOptions)
  ws.onopen = function () {
    console.log('客户端连接服务器成功')
    ws.send('heart beat')
    maxReconnectTimes = 5
  }
  //从服务器接收到信息回调函数
  ws.onmessage = async function (e) {
    const message = JSON.parse(e.data)
    const leaveGroupUserId = message.extentData
    const messageType = message.messageType
    // 预先声明变量，避免 case 块中的词法声明错误
    let sessionInfo = {}
    let dbSessionInfo

    switch (messageType) {
      case 0:
        //保存会话消息
        await saveOrUpdateChatSessionUserBatch4Init(message.extentData.chatSessionList)
        //保存消息
        await saveMessageBatch(message.extentData.chatMessageList)
        //更新联系人申请数量
        await updateContactApplyNoReadCount(message.extentData.applyCount)
        //发送消息给渲染进程
        sender.send('receiveMessage', { messageType: message.messageType })
        break
      case 6: //文件上传完成
        setTimeout(async () => {
          await updateMessage({ status: message.status }, { messageId: message.messageId })
        }, 100)

        sender.send('receiveMessage', message)
        break
      case 4:
        //好友申请消息
        //更新联系人申请数量
        await updateContactApplyNoReadCount(1)
        //发送消息给渲染进程
        sender.send('receiveMessage', { messageType: message.messageType })
        break
      case 10: //修改群昵称
        await updateGroupName(message.contactId, message.extentData)
        sender.send('receiveMessage', message)
        break
      case 7: //强制下线
        sender.send('receiveMessage', message)
        closeWs()
        break
      case 1: //添加好友成功
      case 3: //群创建成功
      case 2: //文本消息
      case 5: //媒体消息
      case 8: //解散群聊
      case 9: //好友加入群组
      case 11: //退出群聊
      case 12: //踢出群聊
      case 14: //ai消息初始化
      case 15: //流式消息
      case 16: //最终保存
        if (message.sendUserId === store.getUserId() && message.contactType === 1) {
          break
        }
        sessionInfo = {}
        if (message.extentData && typeof message.extentData === 'object') {
          Object.assign(sessionInfo, message.extentData)
        } else {
          Object.assign(sessionInfo, message)
          if (message.messageType === 0 && messageType !== 1) {
            sessionInfo.contactName = message.sendUserNickName
          }
          sessionInfo.lastReceiveTime = message.sendTime
        }
        //群聊人数处理
        if (message.messageType === 9 || message.messageType === 11 || message.messageType === 12) {
          sessionInfo.memberCount = message.memberCount
        }
        //写入本地消息
        if (messageType !== 15 && messageType !== 16) {
          if (messageType === 14) {
            setTimeout(async () => {
              message.messageType = 2
              await saveMessage(message)
            }, 550)
          } else {
            setTimeout(async () => {
              message.messageType = 2
              await saveMessage(message)
            }, 150)
          }
        } else {
          setTimeout(async () => {
            await updateMessage(
              { messageContent: message.messageContent },
              { messageId: message.messageId }
            )
          }, 100)
        }

        //群聊发送人处理
        // console.log(
        //   '666666 sessionInfo.sendUserId',
        //   sessionInfo.sendUserId,
        //   'store.getUserId()',
        //   store.getUserId(),
        //   "sessionInfo.contactId.startsWith('G')",
        //   sessionInfo.contactId.startsWith('G')
        // )
        if (
          sessionInfo.sendUserId &&
          sessionInfo.sendUserId !== store.getUserId() &&
          sessionInfo.contactId.startsWith('G')
        ) {
          sessionInfo.lastMessage = sessionInfo.sendUserNickName + ': ' + sessionInfo.lastMessage
        }
        //更新session
        await saveOrUpdateChatSessionByMessage(store.getUserData('currentSessionId'), sessionInfo)

        dbSessionInfo = await selectUserSessionByContactId(message.contactId)
        message.extentData = dbSessionInfo
        //退出群聊 当前用户不受到信息
        if (messageType === 11 && leaveGroupUserId === store.getUserId()) break
        sender.send('receiveMessage', message)
    }
  }

  ws.onclose = function () {
    console.log('关闭客户端准备冲连')
    reconnect()
  }

  ws.onerror = function () {
    console.log('连接失败重连')
    reconnect()
  }
  //重新连接
  const reconnect = () => {
    if (!needReconnect) {
      console.log('连接断开无需重连')
      return
    }
    if (ws != null) {
      ws.close()
    }
    if (lockReconnect) {
      return
    }
    lockReconnect = true
    if (maxReconnectTimes > 0) {
      console.log('准备重连，剩余重连次数:' + maxReconnectTimes)
      maxReconnectTimes--
      setTimeout(() => {
        createWs()
        lockReconnect = false
      }, 5000)
    } else {
      console.log('连接超时')
    }
  }

  setInterval(() => {
    if (ws != null && ws.readyState === 1) {
      //console.log('发送心跳')
      ws.send('heart beat')
    }
  }, 5000)
}

const closeWs = () => {
  needReconnect = false

  ws.close()
}

export { initWs, closeWs }
