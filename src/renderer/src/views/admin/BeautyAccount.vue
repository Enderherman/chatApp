<template>
  <div>
    <div class="top-panel">
      <el-card>
        <el-form :model="searchForm" label-width="70px" label-position="right">
          <el-row>
            <el-col :span="5">
              <el-form-item label="靓号" label-width="40px">
                <el-input
                  v-model="searchForm.userIdFuzzy"
                  class="password-input"
                  clearable
                  placeholder="支持模糊搜索"
                  @keyup="loadDataList"
                >
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="邮箱">
                <el-input
                  v-model="searchForm.emailFuzzy"
                  class="password-input"
                  clearable
                  placeholder="支持模糊搜索"
                  @keyup="loadDataList"
                >
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="4" :style="{ paddingLeft: '10px' }">
              <el-button type="success" @click="loadDataList()">查询</el-button>
              <el-button type="primary" @click="editAccount()">新增靓号</el-button>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </div>
    <el-card class="table-data-card" style="margin-top: 10px">
      <TableX
        :dataSource="tableData"
        :columns="columns"
        :options="tableOptions"
        :fetch="loadDataList"
      >
        <template #slotAvatar="{ index, row }">
          <Avatar :width="50" :user-id="row.userId" part-type="avatar"></Avatar>
        </template>
        <template #slotNickName="{ index, row }">
          {{ row.nickName }}
          <span v-if="row.sex === 0" class="iconfont icon-woman"></span>
          <span v-if="row.sex === 1" class="iconfont icon-man"></span>
        </template>
        <template #slotStatus="{ index, row }">
          <span v-if="row.status === 0" style="color: red">未使用</span>
          <span v-else style="color: green">已使用</span>
        </template>
        <template #slotonline="{ index, row }">
          <span v-if="row.onlineType === 1" style="color: green">在线</span>
          <span v-else style="color: #8a8a8a">离线</span>
        </template>
        <template #slotOperation="{ index, row }">
          <el-dropdown placement="bottom-end" trigger="click">
            <span class="iconfont icon-more"> </span>
            <template #dropdown>
              <el-dropdown-item @click="editAccount(row)" v-if="row.status === 0"
                >修改
              </el-dropdown-item>
              <el-dropdown-item @click="delAccount(row)">删除</el-dropdown-item>
            </template>
          </el-dropdown>
        </template>
      </TableX>
    </el-card>
  </div>
  <BeautyAccountEdit ref="beautyAccountEditRef" @reload="loadDataList"></BeautyAccountEdit>
</template>

<script setup>
import BeautyAccountEdit from '@/views/admin/BeautyAccountEdit.vue'
import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'
import Request from '@/utils/Request'
import Api from '@/utils/Api'
import TableX from '@/components/Table.vue'
import Confirm from '@/utils/Confirm'
import Message from '@/plugin/Message'

const router = useRouter()
const route = useRoute()

const tableData = ref([])
const tableOptions = {}
const columns = [
  {
    label: '邮箱',
    prop: 'email'
  },
  {
    label: '靓号',
    prop: 'userId'
  },
  {
    label: '状态',
    prop: 'status',
    scopedSlots: 'slotStatus'
  },
  {
    label: '操作',
    prop: 'operation',
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
    url: Api.loadBeautyAccount,
    params: params
  })
  if (!result) {
    return
  }
  Object.assign(tableData.value, result.data)
  console.log(tableData.value)
}
const beautyAccountEditRef = ref()
const editAccount = (row) => {
  beautyAccountEditRef.value.showEdit(row)
}

const delAccount = async (row) => {
  Confirm({
    message: `确认要删除邮箱${row.email}对应的靓号吗?`,
    okfun: async () => {
      let result = await Request({
        url: Api.delBeautAccount,
        params: {
          id: row.id
        }
      })
      if (!result) {
        return
      }
      Message.success('删除成功')
      loadDataList()
    }
  })
}
</script>

<style scoped lang="less"></style>
