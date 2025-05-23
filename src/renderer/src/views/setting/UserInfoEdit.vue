<template>
  <div>
    <el-form ref="formDataRef" :model="formData" :rules="rules" label-width="80px" @submit.prevent>
      <el-form-item label="头像" prop="avatarFile">
        <AvatarUpload v-model="formData.avatarFile" @cover-file="saveCover"></AvatarUpload>
      </el-form-item>
      <el-form-item label="昵称" prop="nickName">
        <el-input
          v-model.trim="formData.nickName"
          maxlength="150"
          clearable
          placeholder="请输入昵称"
        >
        </el-input>
      </el-form-item>
      <el-form-item label="性别" prop="sex">
        <el-radio-group v-model="formData.sex">
          <el-radio :label="1">男</el-radio>
          <el-radio :label="0">女</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="朋友权限" prop="joinType">
        <el-switch v-model="formData.joinType" :active-value="1" :inactive-value="0" />
        <div class="info">加我为好友时需要验证</div>
      </el-form-item>
      <el-form-item label="地区" prop="area">
        <AreaSelect v-model="formData.area"></AreaSelect>
      </el-form-item>
      <el-form-item label="个性签名" prop="personalSignature">
        <el-input
          v-model.trim="formData.personalSignature"
          clearable
          placeholder="请输入个性签名"
          type="textarea"
          :rows="5"
          maxlength="30"
          :show-word-limit="true"
          resize="none"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveUserInfo">保存个人信息</el-button>
        <el-button link @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import Request from '@/utils/Request'
import Api from '@/utils/Api'
import AreaSelect from '@/components/AreaSelect.vue'
import { computed, ref } from 'vue'
import Message from '@/plugin/Message'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import { useAvatarInfoStore } from '@/stores/AvatarUploadStore'

const userInfoStore = useUserInfoStore()
const avatarInfoStore = useAvatarInfoStore()
const props = defineProps({
  data: {
    type: Object
  }
})

const formData = computed(() => {
  const userInfo = props.data
  userInfo.avatarFile = userInfo.userId
  userInfo.area = {
    areaCode: userInfo.areaCode ? userInfo.areaCode.split(',') : [],
    areaName: userInfo.areaName ? userInfo.areaName.split(',') : []
  }

  return userInfo
})
const formDataRef = ref()
const rules = {
  // avatarFile: [{ required: true, message: '请选择头像' }],
  nickName: [{ required: true, message: '请输入昵称' }]
}

//保存头像
const saveCover = ({ avatarFile, coverFile }) => {
  formData.value.avatarFile = avatarFile

  formData.value.coverFile = coverFile
}

//保存用户信息
const emit = defineEmits(['editBack'])
const saveUserInfo = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    let params = {}
    Object.assign(params, formData.value)

    params.areaName = ''
    params.areaCode = ''
    if (params.area) {
      params.areaCode = params.area.areaCode.join(',')
      params.areaName = params.area.areaName.join(',')
      delete params.area
    }
    //刷新头像
    avatarInfoStore.setForceReload(userInfoStore.getInfo().userId, false)
    let result = await Request({
      url: Api.saveUserInfo,
      params: params
    })
    if (!result) {
      return
    }
    Message.success('保存成功')
    userInfoStore.setInfo(result.data)
    //刷新头像
    avatarInfoStore.setForceReload(userInfoStore.getInfo().userId, true)
    emit('editBack')
  })
}

//取消更新
const cancel = () => {
  emit('editBack')
}
</script>

<style scoped lang="less">
.info {
  margin-left: 5px;
  color: #949494;
  font-size: 12px;
}
</style>
