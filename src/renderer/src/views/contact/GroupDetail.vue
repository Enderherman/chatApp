<template>
  <ContentPanel>
    <el-card shadow="hover" class="group-info-card">
      <div class="group-info-item group-header-row">
        <div class="label">群封面</div>
        <div class="content group-header-content">
          <Avatar :user-id="groupInfo.groupId" />
          <el-dropdown placement="bottom-end" trigger="click">
            <span class="el-dropdown-link">
              <el-icon><i class="iconfont icon-more" /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu v-if="groupInfo.groupOwnId === userInfoStore.getInfo().userId">
                <el-dropdown-item @click="editGroupInfo">修改群信息</el-dropdown-item>
                <el-dropdown-item @click="dissolutionGroup">解散群聊</el-dropdown-item>
              </el-dropdown-menu>
              <el-dropdown-menu v-else>
                <el-dropdown-item @click="leaveGroup">退出群聊</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <el-divider></el-divider>
      <div class="group-info-body">
        <div class="group-info-item">
          <div class="label">群名称&nbsp;</div>
          <div class="content">{{ groupInfo.groupName }}</div>
        </div>
        <div class="group-info-item">
          <div class="label">群 ID&nbsp;</div>
          <div class="content">{{ groupInfo.groupId }}</div>
        </div>
        <div class="group-info-item">
          <div class="label">群成员&nbsp;</div>
          <div class="content">{{ groupInfo.memberCount }}</div>
        </div>
        <div class="group-info-item">
          <div class="label">加入方式&nbsp;</div>
          <div class="content">
            {{ groupInfo.joinType === 0 ? '直接加入' : '管理员同意后加入' }}
          </div>
        </div>
        <div class="group-info-item notice">
          <div class="label">公告&nbsp;</div>
          <div class="content">{{ groupInfo.groupNotice || '-' }}</div>
        </div>
      </div>
      <el-divider></el-divider>
      <div class="group-info-footer">
        <el-button type="primary" size="default" @click="sendMessage">发消息</el-button>
      </div>
    </el-card>
  </ContentPanel>
  <GroupEditDialog ref="groupEditDialogRef" @reload-group-info="getGroupInfo"></GroupEditDialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Confirm from '@/utils/Confirm'
import Request from '@/utils/Request'
import Api from '@/utils/Api'
import Message from '@/plugin/Message'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import { useContactStateStore } from '@/stores/ContactStateStore'
import GroupEditDialog from '@/views/contact/GroupEditDialog.vue'

const contactStateStore = useContactStateStore()
const userInfoStore = useUserInfoStore()

const router = useRouter()
const route = useRoute()
const groupInfo = ref({})
const groupId = ref()

//获取群聊信息
const getGroupInfo = async () => {
  let result = await Request({
    url: Api.getGroupInfo,
    params: {
      groupId: groupId.value
    },
    showLoading: false
  })
  if (!result) {
    return
  }
  if (result.code !== 200) {
    Message.error(result.msg)
  }
  groupInfo.value = result.data
}

//修改群信息
const groupEditDialogRef = ref()
const editGroupInfo = async () => {
  groupEditDialogRef.value.show(groupInfo.value)
}
//解散群聊
const dissolutionGroup = async () => {
  Confirm({
    message: '确认解散群组吗？无法恢复',
    okfun: async () => {
      let result = await Request({
        url: Api.dissolutionGroup,
        params: {
          groupId: groupId.value
        }
      })
      if (!result) {
        return
      }
      Message.success('解散成功')
      contactStateStore.setContactReload('DISSOLUTION_GROUP')
    }
  })
}
//退出群聊
const leaveGroup = async () => {
  Confirm({
    message: '确认退出群组吗?',
    okfun: async () => {
      let result = await Request({
        url: Api.leaveGroup,
        params: {
          groupId: groupId.value
        }
      })
      if (!result) {
        return
      }
      Message.success('退出群组')
      contactStateStore.setContactReload('LEAVE_GROUP')
    }
  })
}
//发送群信息
const sendMessage = () => {
  router.push({
    path: '/chat',
    query: {
      chatId: groupInfo.value.groupId,
      timestamp: Date.now()
    }
  })
}

//监听
watch(
  () => route.query.contactId,
  (newVal, oldVal) => {
    if (newVal) {
      groupId.value = newVal
      getGroupInfo()
    }
  },
  {
    immediate: true,
    deep: true
  }
)
</script>

<style scoped lang="less">
.group-info-card {
  border-radius: 8px;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  }
}

.group-info-item {
  display: flex;
  align-items: center; // 居中对齐
  margin: 16px 0;
  height: 28px; // 固定统一高度

  .label {
    width: 80px;
    text-align: right;
    font-weight: 500;
    color: #606266;
    padding-right: 12px;
    position: relative;
    font-size: 14px; // 统一字体大小
    height: 100%; // 确保高度一致
    display: flex;
    align-items: center;
    justify-content: flex-end; // 保证文字靠右对齐

    &::after {
      content: '：';
      position: absolute;
      right: 0;
    }
  }

  .content {
    flex: 1;
    color: #303133;
    display: flex;
    align-items: center;
    transition: all 0.2s;
    font-weight: 500;
    font-size: 14px; // 统一字体大小
    height: 100%; // 确保高度一致
  }
}

.group-header-row {
  margin: 20px 0;
  height: 60px; // 群封面行高度可能需要特殊处理，因为有头像
}

.group-header-content {
  justify-content: space-between;
  width: 100%;
}

.el-dropdown-link {
  cursor: pointer;
  font-size: 18px;
  color: #909399;
  transition: all 0.2s;

  &:hover {
    color: #409eff;
  }
}

// 公告项特殊处理
.notice {
  height: auto; // 公告可能是多行，不限制高度
  min-height: 60px; // 但是设置最小高度
  align-items: flex-start; // 顶部对齐

  .label {
    padding-top: 10px; // 顶部对齐时，label 稍微下移
    height: auto; // 不限制高度
  }

  .content {
    padding: 10px 0;
    //line-height: 1.6;
    height: auto; // 不限制高度
  }
}

.group-info-footer {
  display: flex;
  justify-content: center;
  margin: 20px 0 10px;

  .el-button {
    padding: 10px 24px;
    border-radius: 20px;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
    }
  }
}
</style>
