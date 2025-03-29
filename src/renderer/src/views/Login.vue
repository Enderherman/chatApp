<template>
  <div class="login-panel">
    <div class="title drag">原梦通讯</div>
    <div v-if="showLoading" class="loading-panel">
      <img src="@/assets/img/loading.gif" alt="图片加载" />
    </div>
    <div v-else class="login-form">
      <div class="error-msg">{{ errorMsg }}</div>
      <el-form :model="formData" ref="formDataRef" label-width="" @submit.prevent>
        <!--邮箱-->
        <el-form-item label="" prop="email">
          <el-input
            size="large"
            clearable
            placeholder="请输入邮箱"
            maxLength="30"
            v-model.trim="formData.email"
            @focus="cleanVerify"
          >
            <template #prefix>
              <span class="iconfont icon-email"></span>
            </template>
          </el-input>
        </el-form-item>
        <!--注册邮箱-->
        <el-form-item label="" prop="nickName" v-if="!isLogin">
          <el-input
            size="large"
            clearable
            placeholder="请输入昵称"
            maxLength="15"
            v-model.trim="formData.nickName"
            @focus="cleanVerify"
          >
            <template #prefix>
              <span class="iconfont icon-user-nick"></span>
            </template>
          </el-input>
        </el-form-item>
        <!--密码-->
        <el-form-item label="" prop="password">
          <el-input
            size="large"
            show-password
            clearable
            placeholder="请输入密码"
            v-model.trim="formData.password"
            @focus="cleanVerify"
          >
            <template #prefix>
              <span class="iconfont icon-password"></span>
            </template>
          </el-input>
        </el-form-item>
        <!--注册再次输入密码-->
        <el-form-item label="" prop="password" v-if="!isLogin">
          <el-input
            size="large"
            show-password
            clearable
            placeholder="请再次输入密码"
            v-model.trim="formData.rePassword"
            @focus="cleanVerify"
          >
            <template #prefix>
              <span class="iconfont icon-password"></span>
            </template>
          </el-input>
        </el-form-item>
        <!--验证码-->
        <el-form-item label="" prop="checkCode">
          <div class="check-code-panel">
            <el-input
              size="large"
              clearable
              placeholder="请输入验证码"
              v-model.trim="formData.checkCode"
              @focus="cleanVerify"
            >
              <template #prefix>
                <span class="iconfont icon-checkcode"></span>
              </template>
            </el-input>
            <img :src="checkCodeUrl" class="check-code" alt="验证码" @click="changeCheckCode(0)" />
          </div>
        </el-form-item>
        <!--按钮-->
        <el-form-item>
          <el-button type="primary" class="login-btn" @click="submit"
            >{{ isLogin ? '登录' : '注册' }}
          </el-button>
        </el-form-item>
        <div class="bottom-link">
          <span class="a-link" @click="changeOpType()">
            {{ isLogin ? '没有账号？' : '已有账号？' }}
          </span>
        </div>
      </el-form>
    </div>
  </div>
  <WinOp :showSetTop="false" :showMin="false" :showMax="false" :closeType="0"></WinOp>
</template>

<script setup>
import Api from '@/utils/Api'
import Request from '@/utils/Request'
import Utils from '@/utils/Utils'
import Verify from '@/utils/Verify'
import Message from '@/plugin/Message'
import { ref, reactive, nextTick } from 'vue'
import md5 from 'js-md5'
import { useUserInfoStore } from '@/stores/UserInfoStore'

const userInfoStore = useUserInfoStore()
import { useRouter } from 'vue-router'
import WinOp from '@/components/WinOp.vue'

const router = useRouter()

const formData = ref({})
const formDataRef = ref()

const errorMsg = ref(null)
const isLogin = ref(true)

//加载页面
const showLoading = ref(false)

//切换登录或注册界面
const changeOpType = () => {
  window.ipcRenderer.send('loginOrRegister', !isLogin.value)
  isLogin.value = !isLogin.value
  nextTick(() => {
    formDataRef.value.resetFields()
    formData.value = {}
    cleanVerify()
  })
}

/**
 * 获取验证码
 */
const checkCodeUrl = ref(null)
const changeCheckCode = async () => {
  let result = await Request({
    url: Api.checkCode
  })
  if (!result) {
    return
  }
  checkCodeUrl.value = result.data.check_code
  localStorage.setItem('check_code_key', result.data.check_code_key)
}
changeCheckCode()

/**
 * 校验参数
 */
const checkValue = (type, value, msg) => {
  if (Utils.isEmpty(value)) {
    errorMsg.value = msg
    return false
  }

  if (type && !Verify[type](value)) {
    errorMsg.value = msg
    return false
  }
  return true
}
/**
 * 清空值
 */
const cleanVerify = () => {
  errorMsg.value = null
}

//提交
const submit = async () => {
  cleanVerify()

  if (!checkValue('checkEmail', formData.value.email, '请输入正确的邮箱')) {
    return
  }

  if (!isLogin.value && !checkValue(null, formData.value.nickName, '请输入昵称')) {
    return
  }

  if (
    !checkValue('checkPassword', formData.value.password, '密码只能是数字, 字母和特殊字符8~18位')
  ) {
    return
  }

  if (!isLogin.value && formData.value.password != formData.value.rePassword) {
    errorMsg.value = '两次输入的密码不一致'
    return
  }

  if (!checkValue(null, formData.value.checkCode, '请输入验证码')) {
    return
  }

  if (isLogin.value) {
    showLoading.value = true
  }

  /**
   * 请求统一发送
   */
  let result = await Request({
    url: isLogin.value ? Api.login : Api.register,
    showLoading: !isLogin.value,
    showError: false,
    params: {
      email: formData.value.email,
      password: isLogin.value ? md5(formData.value.password) : formData.value.password,
      checkCode: formData.value.checkCode,
      nickName: isLogin.value ? null : formData.value.nickName,
      checkCodeKey: localStorage.getItem('check_code_key')
      //TODO 增加邮箱验证码功能
    },
    errorCallback: (response) => {
      showLoading.value = false
      //刷新验证码
      changeCheckCode()
      errorMsg.value = response.info
    }
  })
  if (!result) {
    return
  }
  if (isLogin.value) {
    //登录 状态管理用pinia
    console.log('我要登录拉')
    userInfoStore.setInfo(result.data)
    localStorage.setItem('token', result.data.token)
    //跳转
    router.push('/main')

    //主进程交互 传入屏幕高宽
    const screenWidth = window.screen.width
    const screenHeight = window.screen.height
    window.ipcRenderer.send('openChat', {
      email: formData.value.email,
      //用于发送心跳
      token: result.data.token,
      userId: result.data.userId,
      nickName: result.data.nickName,
      admin: result.data.admin,
      screenWidth: screenWidth,
      screenHeight: screenHeight
    })
  } else {
    Message.success('注册成功')
    changeOpType()
  }
}
</script>

<style lang="scss" scoped>
.email-select {
  width: 250px;
}

.loading-panel {
  height: calc(100vh - 32px);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  img {
    width: 300px;
  }
}

.login-panel {
  background: #fff;
  border-radius: 3px;
  border: 1px solid #ddd;

  .title {
    height: 30px;
    padding: 5px 0 0 10px;
  }

  .login-form {
    padding: 0 15px 29px 15px;

    :deep(.el-input_wrapper) {
      box-shadow: none;
      border-radius: 0;
    }

    .el-form-item {
      border-bottom: 1px solid #ddd;
    }

    .email-panel {
      align-items: center;
      width: 100%;
      display: flex;

      .input {
        flex: 1;
      }

      .icon-down {
        margin-left: 3px;
        width: 16px;
        cursor: pointer;
        border: none;
      }
    }

    .error-msg {
      line-height: 30px;
      height: 30px;
      color: #fb7373;
    }

    .check-code-panel {
      display: flex;

      .check-code {
        cursor: pointer;
        width: 120px;
        margin-left: 5px;
      }
    }

    .login-btn {
      margin-top: 20px;
      width: 100%;
      background: #07c160;
      height: 36px;
      font-size: 16px;
    }

    .bottom-link {
      text-align: right;
    }
  }
}
</style>
