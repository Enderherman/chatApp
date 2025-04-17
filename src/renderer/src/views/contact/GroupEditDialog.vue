<template>
  <DialogX
    :show="dialogConfig.show"
    :title="dialogConfig.title"
    :buttons="dialogConfig.buttons"
    width="400px"
    :show-cancel="false"
    @close="dialogConfig.show = false"
  >
    <GroupEditForm ref="groupEditRef" @edit-back="editBack"></GroupEditForm>
  </DialogX>
</template>

<script setup>
import GroupEditForm from '@/views/contact/GroupEditForm.vue'
import { nextTick, ref } from 'vue'
const dialogConfig = ref({
  show: false,
  title: '修改群组',
  buttons: []
})
const groupEditRef = ref()
const show = (data) => {
  dialogConfig.value.show = true
  nextTick(() => {
    groupEditRef.value.show(data)
  })
}

const emit = defineEmits(['reloadGroupInfo'])
const editBack = () => {
  dialogConfig.value.show = false
  emit('reloadGroupInfo')
}

defineExpose({
  show
})
</script>

<style scoped lang="less"></style>
