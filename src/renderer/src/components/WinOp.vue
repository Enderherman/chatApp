<template>
  <div class="win-op no-drag">
    <!--置顶-->
    <div
      v-if="showSetTop"
      :class="['iconfont icon-top', isTop ? 'win-top' : '']"
      :title="isTop ? '取消置顶' : '置顶'"
      @click="top"
    ></div>
    <!--最小化-->
    <div v-if="showMin" class="iconfont icon-min" title="最小化" @click="minimize"></div>
    <!--最大化-->
    <div
      v-if="showMax"
      :class="['iconfont', isMax ? 'icon-maximize' : 'icon-max']"
      :title="isMax ? '向下还原' : '最小化'"
      @click="maximize"
    ></div>
    <!--关闭-->
    <div v-if="showClose" class="iconfont icon-close" title="关闭" @click="close"></div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps({
  showSetTop: {
    type: Boolean,
    default: true
  },
  showMin: {
    type: Boolean,
    default: true
  },
  showMax: {
    type: Boolean,
    default: true
  },
  showClose: {
    type: Boolean,
    default: true
  },
  //关闭类型 0:关闭 1隐藏
  closeType: {
    type: Number,
    default: 1
  }
})

const isMax = ref(false)
const isTop = ref(false)

onMounted(() => {
  isMax.value = false
  isTop.value = false
})

//主进程交互
const winOp = (action, data) => {
  window.ipcRenderer.send('winTitleOp', { action, data })
}

const emit = defineEmits(['closeCallback'])
const close = () => {
  winOp('close', { closeType: props.closeType })
  emit('closeCallback')
}

const minimize = () => {
  winOp('minimize')
}

const maximize = () => {
  if (isMax.value) {
    winOp('unmaximize')
    isMax.value = false
  } else {
    winOp('maximize')
    isMax.value = true
  }
}

const top = () => {
  isTop.value = !isTop.value
  winOp('top', { top: isTop.value })
}
</script>

<style scoped lang="less">
.win-op {
  top: 0;
  right: 0;
  position: absolute;
  z-index: 1;
  overflow: hidden;
  border-radius: 0 3px 0 0;

  .iconfont {
    float: left;
    font-size: 12px;
    color: #101010;
    text-align: center;
    display: flex;
    justify-content: center;
    cursor: pointer;
    height: 25px;
    align-items: center;
    padding: 0 10px;

    &:hover {
      background-color: #fb7373;
    }
  }

  .icon-close {
    &:hover {
      background-color: #ddd;
      color: #ffffff;
    }
  }

  .win-top {
    background: #dddddd;
    color: #07c160;
  }
}
</style>
