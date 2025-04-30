<template>
  <div class="top-panel">
    <el-card>
      <el-form :model="searchForm" label-width="70px" label-position="right">
        <el-row>
          <el-col :span="5">
            <el-form-item label="UID" label-width="40px">
              <el-input
                v-model="searchForm.userId"
                class="password-input"
                clearable
                @keyup.native="loadDataList"
              >
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="昵称">
              <el-input
                v-model="searchForm.nickNameFuzzy"
                class="password-input"
                clearable
                placeholder="支持模糊搜索"
                @keyup.native="loadDataList"
              >
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4" :style="{ paddingLeft: '10px' }">
            <el-button type="success" @click="loadDataList()">查询</el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
  <el-card class="table-data-card">
    <TableX
      :columns="columns"
      :fetch="loadDataList"
      :data-source="tableData"
      :option="tableOptions"
    >
      <template #slotAvatar="{ index, row }">
        <AvatarBase :user-id="row.userId" :width="50" part-type="avatar"></AvatarBase>
      </template>
      <template #slotNickName="{ index, row }"
        >{{ row.nickName }} ({{ row.userId }})
        <span v-if="row.sex === 0" class="iconfont icon-woman"></span>
        <span v-if="row.sex === 1" class="iconfont icon-man"></span>
      </template>

      <template #slotOnline="{ index, row }">
        <span v-if="row.onlineType === 1" style="color: green">在线</span>
        <span v-else style="color: #8a8a8a">离线</span>
      </template>
      <template #slotStatus="{ index, row }">
        <span v-if="row.status === 0" style="color: red">禁用</span>
        <span v-else style="color: green">启用</span>
      </template>
      <template #slotOperation="{ index, row }">
        <el-dropdown v-if="userInfo.userId !== row.userId" placement="bottom-end" trigger="click">
          <span class="iconfont icon-more"></span>
          <template #dropdown>
            <el-dropdown-item @click="changeAccountStatus(row)"
              >{{ row.status === 0 ? '启用' : '禁用' }}
            </el-dropdown-item>
            <el-dropdown-item v-if="row.onlineType === 1" @click="force0ffLine(row)"
              >强制下线
            </el-dropdown-item>
          </template>
        </el-dropdown>
        <div v-else>管理员</div>
      </template>
    </TableX>
  </el-card>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import TableX from '@/components/Table.vue'
import AvatarBase from '@/components/AvatarBase.vue'
import Request from '@/utils/Request'
import Api from '@/utils/Api'
import Confirm from '@/utils/Confirm'
import Message from '@/plugin/Message'

const router = useRouter()
const route = useRoute()

const tableData = ref([])
const tableOptions = {}
const columns = [
  {
    label: '头像',
    prop: 'userId',
    width: 70,
    scopedSlots: 'slotAvatar'
  },
  {
    label: '昵称',
    prop: 'nickName ',
    scopedSlots: 'slotNickName'
  },
  {
    label: '邮箱',
    prop: 'email',
    width: 260
  },
  {
    label: '加入时间',
    prop: 'createTime',
    width: 280
  },
  {
    label: '地区',
    prop: 'areaName',
    width: 180
  },
  {
    label: '最后登录',
    prop: 'lastLoginTime',
    width: 280
  },
  {
    label: '在线状态',
    prop: 'onlineType',
    width: 100,
    scopedSlots: 'slotOnline'
  },
  {
    label: '用户状态',
    prop: 'status',
    width: 100,
    scopedSlots: 'slotStatus'
  },
  {
    label: '操作',
    prop: 'operation',
    width: 100,
    scopedSlots: 'slotOperation'
  }
]

const searchForm = ref({})

const loadDataList = async () => {
  let params = {
    pageNo: tableData.value.pageNo,
    pageSize: tableData.value.pageSize
  }
  Object.assign(params, searchForm.value)
  let result = await Request({
    url: Api.loadAdminAccount,
    params: params
  })
  if (!result) {
    return
  }
  Object.assign(tableData.value, result.data)
}

/**
 * 启用禁用账户
 */
const changeAccountStatus = async (data) => {
  let status = data.status === 0 ? 1 : 0
  let info = status === 0 ? '禁用' : '启用'
  Confirm({
    message: `确认要${info}${data.nickName}吗？`,
    okfun: async () => {
      let result = await Request({
        url: Api.updateUserStatus,
        params: {
          userId: data.userId,
          status: status
        }
      })
      if (!result) {
        return
      }
      Message.success('操作成功')
      await loadDataList()
    }
  })
}

/**
 * 强制下线
 */
const force0ffLine = async (data) => {
  Confirm({
    message: `确认要强制下线${data.nickName}吗？`,
    okfun: async () => {
      let result = await Request({
        url: Api.forceOffLine,
        params: {
          userId: data.userId,
        }
      })
      if (!result) {
        return
      }
      Message.success('操作成功')
      await loadDataList()
    }
  })
}

/**
 * 获取所有用户
 */
const userInfo = ref({})
const getLoginUserInfo = async () => {
  let result = await Request({
    url: Api.getUserInfo
  })
  if (!result) {
    return
  }
  userInfo.value = result.data
}

const jumpToDetail = (row) => {}
onMounted(() => {
  getLoginUserInfo()
})
</script>

<style scoped lang="less">
.icon-man {
  color: #2cb6fe;
}

.icon-woman {
  color: #fb7373;
}
</style>
