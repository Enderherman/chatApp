<template>
  <div>
    <div class="form-panel">
      <el-card>
        <el-form :model="searchForm" label-width="70px" label-position="right">
          <el-row>
            <el-col :span="5">
              <el-form-item label="发布日期" label-width="70px">
                <el-date-picker
                  v-model="searchFormData.createTimeRange"
                  type="daterange"
                  range-separator="~"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-NM-DD"
                  change="loadDataList"
                ></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="4" :style="{ paddingLeft: '10px' }">
              <el-button type="success" @click="loadDataList()">查询</el-button>
              <el-button type="primary" @click="showEdit()">发布版本</el-button>
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
        :options="tableOptions"
      >
        <template #slotUpdateDesc="{ row }">
          <div v-for="(item, num) in row.updateDescArray">{{ num + 1 }}.{{ item }}</div>
        </template>
        <template #fileTypeSlot="{ row }">
          <div v-if="row.fileType === 0">本地文件</div>
          <div v-if="row.fileType === 1">外部链接:&nbsp;{{ row.outerLink }}</div>
        </template>
        <template #slotStatus="{ row }">
          <div v-if="row.status === 0" style="color: #f56c6c">未发布</div>
          <div v-if="row.status === 1" style="color: #f7ba2a">灰度发布</div>
          <div v-if="row.status === 2" style="color: #529b2e">全网发布</div>
        </template>
        <template #slotOperation="{ row }">
          <el-dropdown placement="bottom-end" trigger="click">
            <span class="iconfont icon-more"></span>
            <template #dropdown>
              <el-dropdown-item v-if="row.status === 0" @click="showEdit(row)"
                >修改
              </el-dropdown-item>
              <el-dropdown-item @click="updatePost(row)">发布</el-dropdown-item>
              <el-dropdown-item v-if="row.status === 0" @click="del(row)">删除</el-dropdown-item>
            </template>
          </el-dropdown>
        </template>
      </TableX>
    </el-card>
    <UpdateEdit ref="updateEditRef" @reload="loadDataList"></UpdateEdit>
    <UpdatePost ref="updatePostRef" @reload="loadDataList"></UpdatePost>
  </div>
</template>

<script setup>
import UpdateEdit from '@/views/admin/UpdateEdit.vue'

import { onMounted, ref } from 'vue'
import Request from '@/utils/Request'
import Api from '@/utils/Api'
import UpdatePost from '@/views/admin/UpdatePost.vue'
import Confirm from '@/utils/Confirm'
import Message from '@/plugin/Message'

const tableData = ref([])
const tableOptions = {}
const columns = [
  {
    label: '版本',
    prop: 'version',
    width: 120
  },
  {
    label: '更新内容',
    prop: 'updateDesc',
    scopedSlots: 'slotUpdateDesc',
    width: 200
  },
  {
    label: '发布时间',
    prop: 'createTime',
    width: 180
  },
  {
    label: '文件类型',
    prop: 'fileType',
    scopedSlots: 'fileTypeSlot'
  },
  {
    label: '状态',
    prop: 'status',
    scopedSlots: 'slotStatus',
    width: 80
  },
  {
    label: '操作',
    prop: 'operation',
    scopedSlots: 'slotOperation',
    width: 80
  }
]

const searchFormData = ref([])
const searchForm = ref({})

const loadDataList = async () => {
  let params = {
    pageNo: tableData.value.pageNo,
    pageSize: tableData.value.pageSize
  }
  if (searchFormData.value.createTimeRange) {
    params.createTimeStart = searchFormData.value.createTimeRange[0]
    params.createTimeEnd = searchFormData.value.createTimeRange[1]
  }
  delete params.createTimeRange
  Object.assign(params, searchForm.value)
  let result = await Request({
    url: Api.loadUpdateDatalist,
    params: params
  })
  if (!result) {
    return
  }
  Object.assign(tableData.value, result.data)
}

const updateEditRef = ref()
const showEdit = (row) => {
  updateEditRef.value.showEdit(row)
}

const updatePostRef = ref()
const updatePost = (row) => {
  updatePostRef.value.showEdit(row)
}

const del = async (row) => {
  Confirm({
    message: '确认要删除本次更新吗？',
    showCancelBtn: true,
    okfun: async () => {
      let result = await Request({
        url: Api.delUpdate,
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

onMounted(() => {})
</script>

<style scoped lang="less"></style>
