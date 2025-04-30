<template>
  <div class="form-panel">
    <el-form :model="formData" :rules="rules" ref="formDataRef" label-width="160px" @submit.prevent>
      <el-form-item label="最多可创建群组数" prop="maxGroupCount">
        <el-input
          v-model.trim="formData.maxGroupCount"
          clearable
          placeholder="请输入每人最多可创建群组数"
        >
        </el-input>
      </el-form-item>
      <el-form-item label="群组最大成员数" prop="maxGroupMemberCount">
        <el-input
          v-model.trim="formData.maxGroupMemberCount"
          clearable
          placeholder="“请输入每个群组最大成员数”"
        >
        </el-input>
      </el-form-item>
      <!--input输入-->
      <el-form-item label="图片大小" prop="maxImageSize">
        <el-input
          v-model.trim="formData.maxImageSize"
          clearable
          placeholder="请输入允许上传的图片大小"
        >
          <template #append>MB</template>
        </el-input> </el-form-item
      ><!--textarea输入-->
      <el-form-item label="视频大小" prop="maxVideoSize">
        <el-input
          v-model.trim="formData.maxVideoSize"
          cleanable
          placeholder="请输入允许上传的视频大小"
        >
          <template #append>MB</template>
        </el-input>
      </el-form-item>
      <el-form-item label="其他文件大小" prop="maxFilesize">
        <el-input
          v-model.trim="formData.maxFileSize"
          clearable
          placeholder="请输入允许上传的文件大小"
        >
          <template #append>MB</template>
        </el-input>
      </el-form-item>
      <el-form-item label="机器人昵称" prop="robotNickName">
        <el-input
          v-model.trim="formData.robotNickName"
          clearable
          placeholder="请输入机器人昵称"
          maxlength="20"
        >
        </el-input> </el-form-item
      ><!--下拉框-->
      <el-form-item label="机器人头像" prop="robotFile">
        <AvatarUpload v-model="formData.robotFile" @cover-file="saveCover"></AvatarUpload>
      </el-form-item>
      <el-form-item label="欢迎消息" prop="robotWelcome">
        <el-input
          v-model="formData.robotWelcome"
          clearable
          placeholder="请输入新用户注册机器人欢迎消息"
          type="textarea"
          :rows="5"
          maxlength="300"
          :show-word-limit="true"
          resize="none"
        ></el-input>
      </el-form-item>
      <el-form-item label="">
        <el-button type="primary" @click="saveSysSetting">保存设置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import Verify from '@/utils/Verify'
import AvatarUpload from '@/components/AvatarUpload.vue'
import { onMounted, ref } from 'vue'
import Request from '@/utils/Request'
import Api from '@/utils/Api'
import Message from '@/plugin/Message'

const formData = ref({})
const formDataRef = ref()

const rules = {
  maxGroupCount: [
    { required: true, message: '请输入每人最多可创建群组数' },
    { validator: Verify.number, message: '只能是数字' }
  ],
  maxGroupMemberCount: [
    {
      required: true,
      message: '请输入每个群组最大成员数'
    },
    { validator: Verify.number, message: '只能是数字' }
  ],
  maxImageSize: [
    { required: true, message: '请输入允许上传的图片大小' },
    { validator: Verify.number, message: '只能是数字' }
  ],
  maxVideoSize: [
    { required: true, message: '请输入允许上传的视频大小' },
    {
      validator: Verify.number,
      message: '只能是数字'
    }
  ],
  maxFilesize: [
    { required: true, message: '请输入允许上传的文件大小' },
    {
      validator: Verify.number,
      message: '只能是数字'
    }
  ],
  robotNickName: [
    {
      required: true,
      message: '请输入机器人昵称'
    }
  ],
  robotFile: [
    {
      required: true,
      message: '请选择机器人头像'
    }
  ],
  robotWelcome: [
    {
      required: true,
      message: '请输入新用户注册机器人欢迎消息'
    }
  ]
}

//设置封面
const saveCover = ({ avatarFile, coverFile }) => {
  formData.value.robotFile = avatarFile
  formData.value.robotCover = coverFile
}

const getSysSetting = async () => {
  let result = await Request({
    url: Api.getSysSetting4Admin
  })
  if (!result) {
    return
  }
  console.log(result.data)
  formData.value = result.data
  formData.value.robotFile = result.data.robotUid
}

const saveSysSetting = async () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    let params = {}
    Object.assign(params, formData.value)
    let result = await Request({
      url: Api.saveSysSetting,
      params
    })
    if (!result) {
      return
    }
    Message.success('修改系统信息成功')
  })
}

onMounted(() => {
  getSysSetting()
})
</script>

<style scoped lang="less"></style>
