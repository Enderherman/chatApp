<template>
  <div>
    <el-form ref="formDataRef" :model="formData" :rules="rules" label-width="80px" @submit.prevent>
      <el-form-item label="新密码" prop="password">
        <el-input
          v-model.trim="formData.password"
          type="password"
          clearable
          placeholder="请输入新密码"
          show-password
        ></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="rePassword">
        <el-input
          v-model.trim="formData.rePassword"
          type="password"
          clearable
          placeholder="请再次输入密码"
          show-password
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveUserInfo">修改密码</el-button>
        <el-button link @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Request from '@/utils/Request'
import Api from '@/utils/Api'
import Message from '@/plugin/Message'
import Confirm from '@/utils/Confirm'
import Verify from '@/utils/Verify'

const props = defineProps({})
const formData = ref({})
const formDataRef = ref()

const validateRePassword = (rule, value, callback) => {
  if (value !== formData.value.password) {
    callback(new Error(rule.message))
  } else {
    callback()
  }
}

const rules = {
  password: [
    { required: true, message: '请输入密码' },
    { validator: Verify.password, message: '密码只能是数字, 字母和特殊字符, 8-18位' }
  ],
  rePassword: [
    { required: true, message: '请再次输入密码' },
    {
      validator: validateRePassword,
      message: '两次输入密码不一致'
    }
  ]
}

const emit = defineEmits(['editBack'])

const saveUserInfo = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    Confirm({
      message: '密码修改成功将退出登录',
      okfun: async () => {
        let params = {}
        Object.assign(params, formData.value)
        let result = await Request({
          url: Api.updatePassword,
          params
        })
        if (!result) {
          return
        }
        Message.success('修改密码成功', () => {
          window.ipcRenderer.send('reLogin')
        })
      }
    })
  })
}

//取消更新
const cancel = () => {
  emit('editBack')
}
</script>

<style scoped lang="less"></style>
