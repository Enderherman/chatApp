<template>
  <ChatMessageTime :data="data"></ChatMessageTime>
  <div class="sys-message">{{ dataMessage.messageContent }}</div>
</template>
<script setup>
import ChatMessageTime from '@/views/chat/ChatMessageTime.vue'
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    default: {}
  }
})

const dataMessage = computed(() => {
  const data = { ...props.data }
  if (data.messageType === 1) {
    data.messageContent = '已添加为好友 以下是打招呼信息'
  }
  return data
})
</script>

<style scoped lang="less">
.sys-message {
  text-align: center;
  font-size: 14px;
  color: #999;
  margin-bottom: 20px;
}
</style>
