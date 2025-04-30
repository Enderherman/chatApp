<template>
  <div>
    <div class="top-panel">
      <el-card>
        <el-form :model="searchForm" label-width="80px" label-position="right">
          <el-row>
            <el-col :span="5">
              <el-form-item label="群组ID" label-width="55px">
                <el-input
                  v-model="searchForm.groupId"
                  class="password-input"
                  clearable
                  @keyup="loadDataList"
                >
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="群名称">
                <el-input
                  v-model="searchForm.groupNameFuzzy"
                  class="password-input"
                  clearable
                  placeholder="支持模糊搜索"
                  @keyup="loadDataList"
                >
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="群主UID">
                <el-input
                  v-model="searchForm.groupOwnerId"
                  class="password-input"
                  clearable
                  @keyup="loadDataList"
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
    <el-card class="table-data-card" style="margin-top: 10px">
      <TableX
        :columns="columns"
        :fetch="loadDataList"
        :data-source="tableData"
        :options="tableOptions"
      >
        <template #slotAvatar="{ row }">
          <AvatarBase :width="50" :user-id="row.groupId" part-type="avatar"></AvatarBase>
        </template>
        <template #slotGroupName="{ row }">{{ row.groupName }}({{ row.groupId }})</template>
        <template #slotGroupOwnerNickName="{ row }"
          >{{ row.groupOwnerNickName }}({{ row.groupOwnId }})
        </template>
        <template #slotJoinType="{ row }">
          <div>{{ row.joinType === 0 ? '直接加入' : '管理员同意后加入' }}</div>
        </template>
        <template #slotStatus="{ row }">
          <div>
            <span v-if="row.status === 0" style="color: red">已解散</span>
            <span v-if="row.status === 1" style="color: green">正常</span>
          </div>
        </template>
        <template #slotOperation="{ row }">
          <div class="row-op-panel">
            <a v-if="row.status === 1" href="javascript:void(0)" @click="dissolutionGroup(row)"
              >解散</a
            >
          </div>
        </template>
      </TableX>
    </el-card>
  </div>
</template>

<script setup>
import TableX from '@/components/Table.vue'
import AvatarBase from '@/components/AvatarBase.vue'
import { onMounted, ref } from 'vue'

import Request from '@/utils/Request'
import Api from '@/utils/Api'
import Confirm from '@/utils/Confirm'
import Message from '@/plugin/Message'

const tableData = ref([])
const tableOptions = {}
const columns = [
  {
    label: '头像',
    prop: 'groupId',
    width: 70,
    scopedSlots: 'slotAvatar'
  },
  {
    label: '群名称',
    prop: 'groupName',
    scopedSlots: 'slotGroupName'
  },
  {
    label: '群主',
    prop: 'groupOwnerNickName',
    scopedSlots: 'slotGroupOwnerNickName'
  },
  {
    label: '群员数',
    prop: 'memberCount',
    width: 200
  },
  {
    label: '创建时间',
    prop: 'createTime',
    width: 200
  },
  {
    label: '加入方式',
    prop: 'joinType',
    width: 150,
    scopedSlots: 'slotJoinType'
  },
  {
    label: '状态',
    prop: 'status',
    width: 150,
    scopedSlots: 'slotStatus'
  },
  {
    label: '操作',
    prop: 'operation',
    width: 80,
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
    url: Api.loadGroup,
    params: params
  })
  if (!result) {
    return
  }
  Object.assign(tableData.value, result.data)
}

const dissolutionGroup = (data) => {
  Confirm({
    message: `确认要解散群组【${data.groupName}】吗?`,
    okfun: async () => {
      let result = await Request({
        url: Api.adminDissolutionGroup,
        params: {
          groupId: data.groupId
        }
      })
      if (!result) {
        return
      }
      Message.success('解散成功')
      await loadDataList()
    }
  })
}

onMounted(() => {
  loadDataList()
})
</script>

<style scoped lang="less"></style>
