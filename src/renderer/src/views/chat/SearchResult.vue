<template>
  <div class="search-item">
    <Avatar :user-id="data.contactId" :showi-detail="false"></Avatar>
    <div class="contact-info">
      <div class="contact-name" v-html="data.searchContactName"></div>
      <div class="last-message" v-html="data.searchLastMessage"></div>
    </div>
  </div>
</template>

<script setup>
const propos = defineProps({
  data: {
    type: Object,
    default: {}
  }
})
</script>

<style scoped lang="less">
.search-item {
  padding: 10px;
  display: flex;
  align-items: center;

  .contact-info {
    margin-left: 10px;

    :deep(.highlight) {
      color: red;
    }

    .last-message {
      color: #999999;
    }
  }

  &:hover {
    background: #ededed;
  }
}
</style>
