<template>
  <DialogX
    :title="dialogConfig.title"
    :buttons="dialogConfig.buttons"
    :show="dialogConfig.show"
    :width="'500px'"
    @close="dialogConfig.show = false"
  >
    <el-form ref="formDataRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="版本号">{{ formData.version }}</el-form-item>
      <el-form-item label="发布状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :label="0">取消发布</el-radio>
          <el-radio :label="1">灰度发布</el-radio>
          <el-radio :label="2">全网发布</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="formData.status === 1" label="灰度UID" prop="grayscaleUid">
        <div class="tag-panel">
          <el-tag
            v-for="(tag, index) in formData.grayscaleUid"
            :key="tag"
            closable
            :type="tag.type"
            class="tag"
            @close="closeTag(index)"
          >
            {{ tag }}
          </el-tag>
          <div v-if="showInput" class="tag input">
            <el-input
              v-model.trim="tagInput"
              size="small"
              clearable
              placeholder="请输入UID"
              @blur="addDeviceId"
              @keyup.enter="addDeviceId"
            ></el-input>
          </div>
          <div v-if="!showInput" class="tag">
            <el-button type="primary" size="small" @click="showInputHandler">新增</el-button>
          </div>
        </div>
      </el-form-item>
    </el-form>
  </DialogX>
</template>

<script setup>
import { nextTick, ref } from 'vue'
import Api from '@/utils/Api'
import Request from '@/utils/Request'


const dialogConfig = ref({
  show: false,
  title: '发布更新',
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

const rules = { status: [{ required: true, message: '请选择发布状态' }] }

const emit = defineEmits(['reload'])
const submitForm = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    let params = {}
    Object.assign(params, formData.value)
    params.grayscaleUid = params.grayscaleUid.join(',')
    let result = await Request({
      url: Api.postUpdate,
      params,
      showError: true
    })
    if (!result) {
      return
    }
    dialogConfig.value.show = false
    emit('reload')
  })
}

const formData = ref({})
const formDataRef = ref()
const showEdit = (data) => {
  dialogConfig.value.show = true
  nextTick(() => {
    formDataRef.value.resetFields()
    formData.value = Object.assign({
      id: data.id,
      version: data.version,
      status: data.status,
      grayscaleUid: data.grayscaleUid ? data.grayscaleUid.split(',') : []
    })
  })
}

defineExpose({
  showEdit
})

const showInput = ref(false)
const tagInput = ref()
const addDeviceId = () => {
  if (tagInput.value) {
    formData.value.grayscaleUid.push(tagInput.value)
  }
  tagInput.value = ''
  showInput.value = false
}
const showInputHandler = () => {
  showInput.value = true
}
const closeTag = (index) => {
  formData.value.grayscaleUid.splice(index, 1)
}
</script>

<style scoped lang="less"></style>
