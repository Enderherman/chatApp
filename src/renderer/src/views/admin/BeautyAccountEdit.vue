<template>
  <DialogX
    :title="dialogConfig.title"
    :buttons="dialogConfig.buttons"
    :show="dialogConfig.show"
    :width="'400px'"
    @close="dialogConfig.show = false"
  >
    <el-form ref="formDataRef" :model="formData" :rules="rules" labe1-width="60px">
      <el-form-item label="邮箱" prop="email">
        <el-input v-model.trim="formData.email" :max-length="50" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="靓号" prop="userId">
        <el-input v-model.trim="formData.userId" :max-length="11" placeholder="请输入靓号" />
      </el-form-item>
    </el-form>
  </DialogX>
</template>

<script setup>
import { nextTick, ref } from 'vue'
import Verify from '@/utils/Verify'
import Api from '@/utils/Api'
import Request from '@/utils/Request'

const dialogConfig = ref({
  show: false,
  title: '编辑靓号',
  buttons: [
    {
      type: 'primary',
      text: '确定',
      click: () => {
        submitForm()
      }
    }
  ]
})

const formData = ref({
  updateDescList: []
})
const formDataRef = ref()
const rules = {
  email: [
    { required: true, message: '请输入版本号' },
    { validator: Verify.email, message: '请输入正确的邮箱' }
  ],
  userId: [
    { required: true, message: '请输入靓号' },
    { min: 11, max: 11, message: '靓号必须11位' },
    { validator: Verify.number, message: '靓号只能是数字' }
  ]
}

const emit = defineEmits(['reload'])
const submitForm = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    let params = {}
    Object.assign(params, formData.value)
    let result = await Request({
      url: Api.saveBeautAccount,
      params
    })
    if (!result) {
      return
    }
    dialogConfig.value.show = false
    emit('reload')
  })
}

const showEdit = (data = {}) => {
  dialogConfig.value.show = true
  nextTick(() => {
    formDataRef.value.resetFields()
    formData.value = Object.assign({}, data)
  })
}
defineExpose({
  showEdit
})
</script>

<style scoped lang="less"></style>
