<template>
  <Layout>
    <template #left-content>
      <!--1.拖拽框-->
      <div class="drag-panel drag"></div>
      <!--2.搜索框-->
      <div class="top-search">
        <el-input v-model="searchKey" clearable placeholder="搜索" size="small" @keyup="search">
          <template #suffix>
            <span class="iconfont icon-search"></span>
          </template>
        </el-input>
      </div>
      <div v-if="!searchKey" class="chat-session-list">
        <template v-for="chatSession in chatSessionList" :key="chatSession.contactId">
          <ChatSession
            :data="chatSession"
            :current-session="currentChatSession.contactId === chatSession.contactId"
            @contextmenu.stop="onContextMenu(chatSession, $event)"
            @click="chatSessionClickHandler(chatSession)"
          ></ChatSession>
        </template>
      </div>
      <div v-show="searchKey" class="session-list">
        <SearchResult
          v-for="item in searchList"
          :data="item"
          @click="searchClickHandler(item)"
        ></SearchResult>
      </div>
    </template>
    <template #right-content>
      <div v-if="Object.keys(currentChatSession).length > 0" class="title-panel drag">
        <div class="title">
          <span>{{ currentChatSession.contactName }}</span>
          <span v-if="currentChatSession.contactType === 1"
            >({{ currentChatSession.memberCount }})</span
          >
        </div>
      </div>
      <span
        v-if="currentChatSession.contactType === 1"
        class="iconfont icon-more no-drag"
        @click="showGroupDetail"
      ></span>
      <div v-show="Object.keys(currentChatSession).length > 0" class="chat-panel">
        <!--信息框-->
        <div id="message-panel" class="message-panel">
          <div
            v-for="(data, index) in messageList"
            :id="'message' + data.messageId"
            class="message-item"
          >
            <!--展示时间-->
            <template
              v-if="
                index > 1 &&
                data.sendTime - messageList[index - 1].sendTime >= 300000 &&
                (data.messageType === 2 || data.messageType === 5)
              "
            >
              <ChatMessageTime :data="data" />
            </template>
            <!--系统消息-->
            <template
              v-if="
                data.messageType === 1 ||
                data.messageType === 3 ||
                data.messageType === 8 ||
                data.messageType === 9 ||
                data.messageType === 11 ||
                data.messageType === 12
              "
            >
              <ChatMessageSysMsg :data="data"></ChatMessageSysMsg>
            </template>
            <template
              v-if="data.messageType === 1 || data.messageType === 2 || data.messageType === 5"
            >
              <ChatMessage
                :data="data"
                :current-chat-session="currentChatSession"
                @show-media-detail="showMediaDetailHandler"
              ></ChatMessage>
            </template>
          </div>
        </div>
        <!--输入框-->
        <MessageSend
          :current-chat-session="currentChatSession"
          @send-message4-local="sendMessage4LocalHandler"
        ></MessageSend>
      </div>
      <div v-show="Object.keys(currentChatSession).length === 0" class="chat-blank">
        <Blank></Blank>
      </div>
    </template>
  </Layout>
  <ChatGroupDetail
    ref="chatGroupDetailRef"
    @delete-chat-session-callback="deleteChatSession"
  ></ChatGroupDetail>
</template>

<script>
export default {
  name: 'chat'
}
</script>
<script setup>
import ChatMessageTime from '@/views/chat/ChatMessageTime.vue'
import ChatMessage from '@/views/chat/ChatMessage.vue'
import ChatSession from '@/views/chat/ChatSession.vue'
import MessageSend from '@/views/chat/MessageSend.vue'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import ContextMenu from '@imengyu/vue3-context-menu'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import Confirm from '@/utils/Confirm'
import Blank from '@/components/Blank.vue'
import ChatMessageSysMsg from '@/views/chat/ChatMessageSysMsg.vue'
import ChatGroupDetail from '@/views/chat/ChatGroupDetail.vue'
//消息数
import { useMessageCountStore } from '@/stores/MessageCountStore'
import { useRoute } from 'vue-router'
import SearchResult from '@/views/chat/SearchResult.vue'

const route = useRoute()
const messageCountStore = useMessageCountStore()

const chatSessionList = ref([])

/**
 * 初始化会话消息的请求
 */
const loadChatSession = () => {
  window.ipcRenderer.send('loadChatSession')
}

/**
 * 会话排序
 */
const sortChatSession = (dataList) => {
  dataList.sort((a, b) => {
    const topTypeResult = b['topType'] - a['topType']
    if (topTypeResult === 0) {
      return b['lastReceiveTime'] - a['lastReceiveTime']
    }
    return topTypeResult
  })
}

/**
 * 删除会话
 */
const deleteChatSessionFromList = (contactId) => {
  setTimeout(() => {
    chatSessionList.value = chatSessionList.value.filter((item) => {
      return item.contactId !== contactId
    })
  }, 100)
}
//是否滚动到底部
let distanceToBottom = 0
//当前选中会话
const currentChatSession = ref({})
//消息列表
const messageList = ref([])
//消息分页信息
const messagePageInfo = {
  totalPage: 0,
  pageNo: 0,
  //游标分页
  maxMessageId: null,
  noData: false
}
/**
 * 会话点击处理
 */
const chatSessionClickHandler = (item) => {
  distanceToBottom = 0
  currentChatSession.value = Object.assign({}, item)
  //清空消息记录数
  messageCountStore.setCount('chatCount', -item.noReadCount, false)
  item.noReadCount = 0
  //获取数据
  messageList.value = []
  // 重置分页信息
  messagePageInfo.pageNo = 0
  messagePageInfo.totalPage = 1
  messagePageInfo.maxMessageId = null
  messagePageInfo.noData = false

  // console.log('点击聊天会话', item)
  loadChatMessage()
  //设置选中session
  setSessionSelect({
    contactId: item.contactId,
    sessionId: item.sessionId
  })
}
/**
 * 更新当前Session信息
 */
const setSessionSelect = ({ contactId, sessionId }) => {
  window.ipcRenderer.send('setSessionSelect', { contactId, sessionId })
}

/**
 * 分页查询消息记录
 */
const loadChatMessage = () => {
  if (messagePageInfo.noData) {
    return
  }
  messagePageInfo.pageNo++
  window.ipcRenderer.send('loadChatMessage', {
    sessionId: currentChatSession.value.sessionId,
    pageNo: messagePageInfo.pageNo,
    maxMessageId: messagePageInfo.maxMessageId
  })
}

/**
 * 接受服务器发来消息
 */
const onReceiveMessage = () => {
  window.ipcRenderer.on('receiveMessage', (event, message) => {
    console.log('收到消息', message)
    //好友申请信息处理
    if (message.messageType === 4) {
      loadContactApply()
      return
    }
    //媒体消息处理
    if (message.messageType === 6) {
      const localMessage = messageList.value.find((item) => {
        return item.messageId === message.messageId
      })
      if (localMessage !== null) {
        localMessage.status = 1
      }
      return
    }
    //强制下线
    if (message.messageType === 7) {
      Confirm({
        message: '您已经被强制下线',
        okfun: () => {
          setTimeout(() => {
            window.ipcRenderer.send('reLogin')
          }, 200)
        },
        showCancelBtn: false
      })
      return
    }
    //更新群昵称
    if (message.messageType === 10) {
      const chatSession = chatSessionList.value.find((item) => {
        return item.contactId === message.contactId
      })
      chatSession.contactName = message.extentData
      return
    }
    let currentSession = chatSessionList.value.find((item) => {
      return item.sessionId === message.sessionId
    })
    if (currentSession === null || currentSession === undefined) {
      chatSessionList.value.push(message.extentData)
    } else {
      Object.assign(currentSession, message.extentData)
    }
    sortChatSession(chatSessionList.value)
    if (message.sessionId !== currentChatSession.value.sessionId) {
      messageCountStore.setCount('chatCount', 1, false)
    } else {
      Object.assign(currentChatSession.value, message.extentData)
      messageList.value.push(message)
      scrollToBottom()
    }
  })
}

/**
 * 接受会话信息
 */
const onLoadChatSession = () => {
  window.ipcRenderer.on('loadChatSessionCallback', (event, data) => {
    let noReadCount = 0
    data.forEach((item) => {
      noReadCount = noReadCount + item.noReadCount
    })
    messageCountStore.setCount('chatCount', noReadCount, true)
    sortChatSession(data)
    chatSessionList.value = data
    //console.log(chatSessionList.value)
  })
}

/**
 * 接受记录信息
 */
const onLoadChatMessage = () => {
  window.ipcRenderer.on('loadChatMessageCallback', (event, { dataList, pageTotal, pageNo }) => {
    if (pageNo === pageTotal) {
      messagePageInfo.noData = true
    }
    dataList.sort((a, b) => {
      return a.messageId - b.messageId
    })
    const lastMessage = messageList.value[0]
    messageList.value = dataList.concat(messageList.value)
    messagePageInfo.pageNo = pageNo
    messagePageInfo.pageTotal = pageTotal
    if (pageNo === 1) {
      messagePageInfo.maxMessageId =
        dataList.length > 0 ? dataList[dataList.length - 1].messageId : null
      //滚动条滚动到最下面
      scrollToBottom()
    } else {
      nextTick(() => {
        document.querySelector('#message' + lastMessage.messageId).scrollIntoView()
      })
    }
    //更新完信息console.log(messageList.value)
  })
}

const onAddChatMessage = () => {
  window.ipcRenderer.on('addChatMessageCallback', (event, { status, messageId }) => {
    const findMessage = messageList.value.find((item) => {
      return item.messageId === messageId
    })
    if (findMessage) {
      findMessage.status = status
    }
  })
}

/**
 * 处理发送消息 接收到了信息
 */
const sendMessage4LocalHandler = (messageObj) => {
  messageList.value.push(messageObj)
  const chatSession = chatSessionList.value.find((item) => {
    return item.sessionId === messageObj.sessionId
  })
  if (chatSession) {
    chatSession.lastMessage = messageObj.lastMessage
    chatSession.lastReceiveTime = messageObj.sendTime
  }
  sortChatSession(chatSessionList.value)
  scrollToBottom()
}

/**
 * 滚动到底部
 */
const scrollToBottom = () => {
  nextTick(() => {
    //距离底部超过200就不滚动
    if (distanceToBottom > 200) {
      return
    }
    const item = document.querySelectorAll('.message-item')
    if (item.length > 0) {
      setTimeout(() => {
        item[item.length - 1].scrollIntoView()
      }, 170)
    }
  })
}

const loadContactApply = () => {
  window.ipcRenderer.send('loadContactApply')
}

const onLoadContactApply = () => {
  window.ipcRenderer.on('loadContactApplyCallback', (e, contactNoRead) => {
    //console.log('未读好友申请数量:', contactNoRead)
    messageCountStore.setCount('contactApplyCount', contactNoRead, true)
  })
}

const onReloadChatSession = () => {
  window.ipcRenderer.on('reloadChatSessionCallback', (e, { contactId, chatSessions }) => {
    sortChatSession(chatSessions)
    chatSessionList.value = chatSessions
    sendMessage(contactId)
  })
}

onMounted(() => {
  onLoadContactApply()

  onReceiveMessage()

  onLoadChatSession()

  onLoadChatMessage()

  loadChatSession()

  onAddChatMessage()

  scrollToBottom()

  //初始化获取消息未读数
  loadContactApply()

  nextTick(() => {
    const messagePanel = document.querySelector('#message-panel')
    messagePanel.addEventListener('scroll', (e) => {
      const scrollTop = e.target.scrollTop
      //计算滚动距离底 部距离
      distanceToBottom = e.target.scrollHeight - e.target.clientHeight - scrollTop
      if (scrollTop === 0 && messageList.value.length > 0) {
        loadChatMessage()
      }
    })
  })

  setSessionSelect({})

  onReloadChatSession()
})

onUnmounted(() => {
  window.ipcRenderer.removeAllListeners('receiveMessage')
  window.ipcRenderer.removeAllListeners('loadChatSessionCallback')
  window.ipcRenderer.removeAllListeners('loadChatMessageCallback')
  window.ipcRenderer.removeAllListeners('addChatMessageCallback')
  window.ipcRenderer.removeAllListeners('loadContactApplyCallback')
  window.ipcRenderer.removeAllListeners('reloadChatSessionCallback')
})

//置顶
const setTop = (data) => {
  data.topType = data.topType === 0 ? 1 : 0
  sortChatSession(chatSessionList.value)
  window.ipcRenderer.send('topChatSession', { contactId: data.contactId, topType: data.topType })
}

//删除会话
const deleteChatSession = (contactId) => {
  deleteChatSessionFromList(contactId)
  setSessionSelect({})
  currentChatSession.value = {}
  window.ipcRenderer.send('deleteChatSession', contactId)
}

//右键菜单
const onContextMenu = (data, e) => {
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    items: [
      {
        label: data.topType === 0 ? '置顶' : '取消置顶',
        onClick: () => {
          setTop(data)
        }
      },
      {
        label: '删除聊天',
        onClick: () => {
          Confirm({
            message: `确定要删除聊天[${data.contactName}]?`,
            okfun: () => {
              deleteChatSession(data.contactId)
            }
          })
        }
      }
    ]
  })
}
const showMediaDetailHandler = (messageId) => {
  let showFileList = messageList.value.filter((item) => {
    return item.messageType === 5
  })
  showFileList = showFileList.map((item) => {
    return {
      partType: 'chat',
      fileId: item.messageId,
      fileType: item.fileType,
      fileName: item.fileName,
      fileSize: item.fileSize,
      forceGet: false
    }
  })
  window.ipcRenderer.send('newWindow', {
    windowId: 'media',
    title: '图片查看',
    path: '/showMedia',
    data: {
      currentFileId: messageId,
      fileList: showFileList
    }
  })
}
/**
 * 群详情
 */
const chatGroupDetailRef = ref()
const showGroupDetail = () => {
  chatGroupDetailRef.value.show(currentChatSession.value.contactId)
}

/**
 * 跳转到发送信息的处理
 */
const sendMessage = (contactId) => {
  let chatSession = chatSessionList.value.find((item) => {
    return item.contactId === contactId
  })
  if (!chatSession) {
    window.ipcRenderer.send('reloadChatSession', { contactId })
    return
  } else {
    chatSessionClickHandler(chatSession)
  }
}

/**
 * 置顶栏搜索的视线
 */
const searchKey = ref()
const searchList = ref([])
const search = () => {
  if (!searchKey.value) {
    return
  }
  searchList.value = []
  const regex = new RegExp('(' + searchKey.value + ')', 'gi')
  chatSessionList.value.forEach((item) => {
    if (item.contactName.includes(searchKey.value) || item.lastMessage.includes(searchKey.value)) {
      let newData = Object.assign({}, item)
      newData.searchContactName = newData.contactName.replace(
        regex,
        "<span class='highlight'>$1</span>"
      )
      newData.searchLastMessage = newData.lastMessage.replace(
        regex,
        "<span class='highlight'>$1</span>"
      )
      searchList.value.push(newData)
    }
  })
}

const searchClickHandler = (item) => {
  searchKey.value = null
  chatSessionClickHandler(item)
}

/**
 * 监听跳转联系人
 */
watch(
  () => route.query.timestamp,
  (newVal, oldVal) => {
    if (newVal && route.query.chatId) {
      sendMessage(route.query.chatId)
    }
  },
  { immediate: true, deep: true }
)
</script>

<style scoped lang="less">
.drag-panel {
  height: 25px;
  background: #f7f7f7;
}

.top-search {
  padding: 0 10px 9px 10px;
  background: #f7f7f7;
  display: flex;
  align-items: center;

  .iconfont {
    font-size: 12px;
  }
}

.chat-session-list {
  height: calc(100vh - 62px);
  overflow: hidden;
  border-top: 1px solid #ddd;

  &:hover {
    overflow: auto;
  }
}

.search-list {
  height: calc(100vh - 62px);
  background: #f7f7f7;
  overflow: hidden;

  &:hover {
    overflow: auto;
  }
}

.title-panel {
  display: flex;
  align-items: center;

  .title {
    height: 60px;
    line-height: 60px;
    padding-left: 10px;
    font-size: 18px;
    color: #000000;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.icon-more {
  position: absolute;
  z-index: 1;
  top: 30px;
  right: 3px;
  width: 20px;
  font-size: 20px;
  margin-right: 5px;
  cursor: pointer;
}

.chat-panel {
  border-top: 1px solid #ddd;
  background: #f5f5f5;

  .message-panel {
    padding: 10px 30px 0 30px;
    height: calc(100vh - 200px - 62px);
    overflow-y: auto;

    .message-item {
      margin-bottom: 15px;
      text-align: center;
    }
  }
}
</style>
