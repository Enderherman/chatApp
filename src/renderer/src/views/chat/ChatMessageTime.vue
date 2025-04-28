<template>
  <div class="message-time">
    {{ Utils.formatDate(data.sendTime) }}
  </div>
</template>
<script setup>
import Utils from '../../utils/Utils'

const props = defineProps({
  data: {
    type: Object,
    default: {}
  }
})
</script>

<style scoped lang="less">
.message-time {
  background: #dadada;
  display: inline-block;
  color: #fff;
  font-size: 12px;
  padding: 2px 5px;
  border-radius: 3px;
  margin: 10px 0;
}
</style>
