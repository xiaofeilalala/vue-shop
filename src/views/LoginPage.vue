<template>
  <div class="login-wrapper">
    <div class="login-main">
      <!-- 商城名称 -->
      <div class="header-login">
        <h1>{{headtitle}}</h1>
        <h3>{{esHeadTitle}}</h3>
      </div>
      <!-- 登录表单 -->
      <div class="form-mian">
        <el-form :model="loginForm" ref="loginFormRef" :rules="loginFormRules">
          <el-form-item prop="username">
            <el-input
              prefix-icon="iconfont icon-icon-user"
              v-model="loginForm.username"
              placeholder="请输入用户名"
              clearable>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              prefix-icon="iconfont icon-lock"
              v-model="loginForm.password"
              placeholder="请输入密码"
              show-password>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button @click="login">登录</el-button>
            <el-button @click="resetLoginForm">重置</el-button>
          </el-form-item>
          </el-form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      headtitle: '商城后台管理平台',
      esHeadTitle: 'shangchenghoutaiguanlipingtai',
      // 登录用户名与对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetLoginForm () {
      // 表单实例
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      // validate 表单验证
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$axios.post('login', this.loginForm)
        // 登录成功失败判断
        if (res.meta.status !== 200) {
          this.$notify({
            title: '失败',
            message: res.meta.msg,
            type: 'error'
          })
        } else {
          this.$notify({
            title: '成功',
            type: 'success',
            message: res.meta.msg
          })
        }
        // 保存token 保存到sessionStrong
        window.sessionStorage.setItem('token', res.data.token)
        // 路由跳转
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.login-wrapper {
  position: relative;
  width: 100%;
  min-height: 937px;
  background-image: url('@/assets/login-wrapper.png');
  background-size: 100% 100%;
  min-width: 1800px;
}
.login-main {
  position: absolute;
  right: 12%;
  bottom: 55%;
  width: 420px;
  border-radius: 20px;
  transform: translate(0, 50%);
  background-color:#fff;
  box-shadow: 17px 17px 70px #cccccc,
              -17px -17px 70px #ffffff;
  padding: 20px 30px;
  .header-login {
    margin: 20px 0;
    h1 {
      color: #536dfe;
      letter-spacing: 2px;
    }
    h3 {
      margin-top: 10px;
      color: #8c8c8d;
      font-size: 16px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
  }
}
</style>
