import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import * as Pinia from 'pinia'
import 'element-plus/dist/index.css'
import '@/assets/cust-elementplus.scss'
import '@/assets/icon/iconfont.css'
import '@/assets/base.scss'
import router from '@/router'
import Utils from '@/utils/Utils'
import Verify from '@/utils/Verify'
import Message from '@/plugin/Message'
import Api from '@/utils/Api'
import Confirm from '@/utils/Confirm'
import Request from '@/utils/Request'

import WinOp from '@/components/WinOp.vue'
import Layout from '@/components/Layout.vue'
import ContentPanel from '@/components/ContentPanel.vue'
import ShowLocalImage from '@/components/ShowLocalImage.vue'
import UserBaseInfo from '@/components/UserBaseInfo.vue'
import Dialog from '@/components/Dialog.vue'
import Avatar from '@/components/Avatar.vue'
import AvatarUpload from '@/components/AvatarUpload.vue'
import Badge from '@/components/Badge.vue'

const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.use(Pinia.createPinia())

app.component('Badge', Badge)
app.component('AvatarUpload', AvatarUpload)
app.component('Avatar', Avatar)
app.component('DialogX', Dialog)
app.component('UserBaseInfo', UserBaseInfo)
app.component('ShowLocalImage', ShowLocalImage)
app.component('Layout', Layout)
app.component('WinOp', WinOp)
app.component('ContentPanel', ContentPanel)

app.config.globalProperties.Utils = Utils
app.config.globalProperties.Verify = Verify
app.config.globalProperties.Message = Message
app.config.globalProperties.Api = Api
app.config.globalProperties.Request = Request
app.config.globalProperties.Confirm = Confirm
app.mount('#app')
