<template>
  <div>
    <el-cascader
      ref="areaSelectRef"
      v-model="modelValue.areaCode"
      :options="AreaData"
      clearable
      @change="change"
    ></el-cascader>
  </div>
</template>

<script setup>
import AreaData from '@/components/AreaData'
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: {}
  }
})

const emit = defineEmits(['update:modelValue'])
const areaSelectRef = ref()
const change = (e) => {
  const areaData = {
    areaName: [],
    areaCode: []
  }
  const checkedNodes = areaSelectRef.value.getCheckedNodes()[0]
  if (!checkedNodes) {
    emit('update:modelValue', areaData)
    return
  }
  areaData.areaCode = checkedNodes.pathValues
  areaData.areaName = checkedNodes.pathLabels
  emit('update:modelValue', areaData)
}
</script>

<style scoped lang="less"></style>
