<template>
  <DialogX
    :show="dialogConfig.show"
    :title="dialogConfig.title"
    :buttons="dialogConfig.buttons"
    width="400px"
    :show-cancel="false"
    @close="dialogConfig.show = false"
  >
    <el-form ref="formDataRef" :model="formData" :rules="rules" @submit.prevent>
      <!--input输入-->
      <el-form-item label="" prop="">
        <el-input
          type="textarea"
          :rows="5"
          clearable
          placeholder="请输入申请信息,更容易通过"
          v-model.trim="formData.applyInfo"
          resize="none"
          show-word-limit
          maxlength="200"
        ></el-input>
      </el-form-item>
    </el-form>
  </DialogX>
</template>

<script setup>
import { nextTick, ref } from 'vue'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import Request from '@/utils/Request'
import Api from '@/utils/Api'
import Message from '@/plugin/Message'

const userInfoStore = useUserInfoStore()
const dialogConfig = ref({
  show: false,
  title: '提交申请',
  buttons: [
    {
      type: 'primary',
      text: '确定',
      click: (e) => {
        submitApply()
      }
    }
  ]
})

const formData = ref({
  applyInfo: ''
})
const formDataRef = ref()
const rules = {
  title: [{ required: true, message: '请输入内容' }]
}

const emit = defineEmits(['reload'])
const submitApply = async () => {
  const { contactId, contactType, applyInfo } = formData.value
  let result = await Request({
    url: Api.applyAdd,
    params: {
      contactId,
      contactType,
      applyInfo
    }
  })
  if (!result) {
    return
  }

  if (result.data === 0) {
    Message.success('添加成功')
  } else {
    Message.success('申请成功, 等待审核')
  }
  dialogConfig.value.show = false
  emit('reload')
}

const show = (data) => {
  dialogConfig.value.show = true
  nextTick(() => {
    formDataRef.value.resetFields()
    formData.value = Object.assign({}, data)
    formData.value.applyInfo = '我是' + userInfoStore.getInfo().nickName
  })
}

defineExpose({
  show
})
</script>

<style scoped lang="less"></style>
