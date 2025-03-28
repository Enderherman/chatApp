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
import Request from '@/utils/Request'
import Message from '@/plugin/Message'
import Api from '@/utils/Api'

console.log('当前环境变量：', import.meta.env)
console.log('BASE_URL:', import.meta.env.BASE_URL)

const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.use(Pinia.createPinia())
app.config.globalProperties.Utils = Utils
app.config.globalProperties.Verify = Verify
app.config.globalProperties.Request = Request
app.config.globalProperties.Message = Message
app.config.globalProperties.Api = Api
app.mount('#app')
