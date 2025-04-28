<template>
  <ShowLocalImage
    :file-id="data.messageId"
    part-type="chat"
    :file-type="data.fileType"

  ></ShowLocalImage>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Object,
    default: {}
  }
})
</script>

<style scoped lang="less"></style>
