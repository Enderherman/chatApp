<template>
  <Layout>
    <template #left-content>
      <!--1.拖拽框-->
      <div class="drag-panel drag"></div>
      <!--2.搜索框-->
      <div class="top-search">
        <el-input v-model="searchKey" clearable placeholder="搜索" size="small" @click="search">
          <template #suffix>
            <span class="iconfont icon-search"></span>
          </template>
        </el-input>
      </div>
      <!--3.群聊联系人框-->
      <div class="contact-list">
        <template v-for="item in partList" :key="item.id">
          <div class="part-title">{{ item.partName }}</div>
          <div class="part-list">
            <div
              v-for="sub in item.children"
              :key="sub.id"
              :class="['part-item', sub.path === route.path ? 'active' : '']"
              @click="partJump(sub)"
            >
              <div :class="['iconfont', sub.icon]" :style="{ background: sub.iconBgColor }"></div>
              <div class="text">{{ sub.name }}</div>
            </div>
            <template v-for="contact in item.contactData" :key="contact.id">
              <div
                :class="[
                  'part-item',
                  contact[item.contactId] === route.query.contactId ? 'active' : ''
                ]"
                @click="getContactDetail(contact, item)"
              >
                <Avatar :user-id="contact[item.contactId]" :width="35"></Avatar>
                <div class="text">
                  {{ contact[item.contactName] }}
                </div>
              </div>
            </template>
            <template v-if="item.contactData && item.contactData.length === 0">
              <div class="no-data">{{ item.emptyMsg }}</div>
            </template>
          </div>
        </template>
      </div>
    </template>
    <template #right-content>
      <div class="title-panel drag">{{ rightTitle }}</div>
      <router-view v-slot="{ Component }">
        <component :is="Component" ref="componentRef"></component>
      </router-view>
    </template>
  </Layout>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Request from '@/utils/Request'
import Api from '@/utils/Api'
import { useContactStateStore } from '@/stores/ContactStateStore'

const contactStateStore = useContactStateStore()
const router = useRouter()
const route = useRoute()

/**
 * 联系人中四个大类列表
 */
const partList = ref([
  {
    partName: '新朋友',
    children: [
      {
        name: '添加好友',
        icon: 'icon-search',
        iconBgColor: '#fa9d3b',
        showTitle: true,
        path: '/contact/search'
      },
      {
        name: '新的朋友',
        icon: 'icon-plane',
        iconBgColor: '#08bf61',
        path: '/contact/contactNotice',
        showTitle: true,
        countKey: 'contactApplyCount'
      }
    ]
  },
  {
    partName: '我的群聊',
    children: [
      {
        name: '新建群聊',
        icon: 'icon-add-group',
        iconBgColor: '#1485ee',
        showTitle: true,
        path: '/contact/createGroup'
      }
    ],
    contactId: 'groupId',
    contactName: 'groupName',
    showTitle: true,
    contactData: [],
    contactPath: '/contact/groupDetail'
  },
  {
    partName: '我加入的群聊',
    contactId: 'contactId',
    contactName: 'contactName',
    showTitle: true,
    contactData: [],
    contactPath: '/contact/groupDetail',
    emptyMsg: '暂未加入群聊'
  },
  {
    partName: '我的好友',
    children: [],
    contactId: 'contactId',
    contactName: 'contactName',
    contactData: [],
    contactPath: '/contact/userDetail',
    emptyMsg: '暂无好友'
  }
])

const search = () => {}
const searchKey = ref()
const rightTitle = ref()
const partJump = (data) => {
  if (data.showTitle) {
    rightTitle.value = data.name
  } else {
    rightTitle.value = null
  }
  //TODO 处理联系人好友申请已读
  router.push(data.path)
}

//加载联系人列表
const loadContact = async (contactType) => {
  let result = await Request({
    url: Api.loadContact,
    params: {
      contactType
    }
  })
  if (!result) {
    return
  }
  if (contactType === 'GROUP') {
    partList.value[2].contactData = result.data
  } else if (contactType === 'USER') {
    partList.value[3].contactData = result.data
  }
}

const loadMyGroup = async () => {
  let result = await Request({
    url: Api.loadMyGroup,
    params: {},
    showLoading: false
  })
  if (!result) {
    return
  }
  partList.value[1].contactData = result.data
}

loadContact('USER')
loadContact('GROUP')
loadMyGroup()

const getContactDetail = (contact, part) => {
  if (part.showTitle) {
    if (part.contactPath === '/contact/groupDetail') {
      // 群聊，右上角显示：群聊名（人数）
      rightTitle.value = `${contact[part.contactName]} (${contact.memberCount || 0})`
    } else {
      // 不是群聊，直接显示名称
      rightTitle.value = contact[part.contactName]
    }
  } else {
    rightTitle.value = null
  }
  router.push({
    path: part.contactPath,
    query: {
      contactId: contact[part.contactId]
    }
  })
}

watch(
  () => contactStateStore.contactReload,
  (newVal, oldVal) => {
    if (!newVal) {
      return
    }
    switch (newVal) {
      case 'MY_GROUP':
        loadMyGroup()
        break
      case 'USER':
      case 'GROUP':
        loadContact(newVal)
        break
      case 'REMOVE_USER':
        loadContact('USER')
        router.push('/contact/blank')
        rightTitle.value = null
        break
      case 'DISSOLUTION_GROUP':
        loadMyGroup()
        router.push('/contact/blank')
        rightTitle.value = null
        break
      case 'LEAVE_GROUP':
        loadContact('GROUP')
        router.push('/contact/blank')
        rightTitle.value = null
    }
    contactStateStore.setContactReload(null)
  },
  { immediate: true, deep: true }
)
</script>

<style scoped lang="less">
.drag-panel {
  height: 25px;
  background: #f7f7f7;
}

.top-search {
  padding: 0 10px 11px 10px;
  background: #f7f7f7;
  display: flex;
  align-items: center;

  .iconfont {
    font-size: 18px;
  }
}

.contact-list {
  border-top: 1px solid #ddd;
  height: calc(100vh - 62px);
  overflow: hidden;

  &:hover {
    overflow: auto;
  }

  .part-title {
    color: #515151;
    padding-left: 10px;
    margin-top: 10px;
  }

  .part-list {
    border-bottom: 1px solid #d6d6d6;

    .part-item {
      display: flex;
      align-items: center;
      padding: 10px 10px;
      position: relative;

      &:hover {
        cursor: pointer;
        background: #d6d6d7;
      }

      .iconfont {
        width: 35px;
        height: 35px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        color: #fff;
      }

      .text {
        flex: 1;
        color: #000000;
        margin-left: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .no-data {
      text-align: center;
      font-size: 12px;
      color: #9d9d9d;
      line-height: 30px;
    }

    .active {
      background: #c4c4c4;

      &:hover {
        background-color: #c4c4c4;
      }
    }
  }
}

.title-panel {
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  padding-left: 10px;
  font-size: 18px;
  color: #000000;
}
</style>
