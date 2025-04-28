<template>
  <el-form ref="formDataRef" :model="formData" :rules="rules" label-width="80px" @submit.prevent>
    <el-form-item label="群名称" prop="groupName">
      <el-input
        v-model="formData.groupName"
        maxlength="150"
        clearable
        placeholder="请输入群昵称"
      ></el-input>
    </el-form-item>
    <el-form-item label="群头像" prop="avatarFile">
      <AvatarUpload
        ref="avatarUploadRef"
        v-model="formData.avatarFile"
        @cover-file="saveCover"
      ></AvatarUpload>
    </el-form-item>
    <el-form-item label="加入方式" prop="joinType">
      <el-radio-group v-model="formData.joinType">
        <el-radio :value="1">管理员同意后加入</el-radio>
        <el-radio :value="0">无需同意直接加入</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="公告" prop="groupNotice">
      <el-input
        v-model="formData.groupNotice"
        clearable
        placeholder="请输入群公告"
        type="textarea"
        :rows="5"
        maxlength="300"
        :show-word-limit="true"
        resize="none"
      ></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">
        {{ formData.groupId ? '修改信息' : '创建群组' }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref } from 'vue'
import Message from '@/plugin/Message'
import Request from '@/utils/Request'
import Api from '@/utils/Api'
import { useContactStateStore } from '@/stores/ContactStateStore'
import { useAvatarInfoStore } from '@/stores/AvatarUploadStore'

const contactStateStore = useContactStateStore()
const avatarInfoStore = useAvatarInfoStore()

const formData = ref({})
const formDataRef = ref()
const rules = {
  groupName: [{ required: true, message: '请输入群名称' }],
  joinType: [{ required: true, message: '请选择加入权限' }],
  avatarFile: [{ required: true, message: '请选择头像' }]
}

const emit = defineEmits(['editBack'])

//保存头像
const saveCover = ({ avatarFile, coverFile }) => {
  console.log('avatar:::::::::', avatarFile)
  formData.value.avatarFile = avatarFile
  console.log('cover:::::::::', coverFile)
  formData.value.coverFile = coverFile
}

//提交
const submit = async () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }

    let params = {}

    Object.assign(params, formData.value)
    //头像相关重新加载
    if (params.groupId) {
      avatarInfoStore.setForceReload(params.groupId, false)
    }
    let result = await Request({
      url: Api.saveGroup,
      params
    })
    if (!result) {
      return
    }
    // 重新加载头像
    if (params.groupId) {
      avatarInfoStore.setForceReload(params.groupId, true)
    }
    if (params.groupId && params.groupId !== '') {
      Message.success('群组修改成功')
      emit('editBack')
    } else {
      Message.success('群组创建成功')
    }
    formDataRef.value.resetFields()
    contactStateStore.setContactReload('MY_GROUP')

  })
}


//展示信息
const show = (data) => {
  formDataRef.value.resetFields()
  formData.value = Object.assign({}, data)
  formData.value.avatarFile = data.groupId
}

defineExpose({
  show
})
</script>

<style scoped lang="less"></style>
