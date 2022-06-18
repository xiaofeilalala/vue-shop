<template>
  <el-container class="home-container">
    <el-aside
      :width="isCollapse ? '64px' : '300px'"
      class="aside-box"
      :class="[isCollapse ? 'launch' : 'stow']">
      <div class="logo-container">
        <img src="@/assets/logo.png" alt="">
        <h1>商城后台管理平台</h1>
      </div>
      <div class="aside-container">
        <el-menu
          class="menu-box"
          background-color="#333"
          text-color="#fff"
          active-text-color="#3496db"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activepath">
          <el-submenu :index="'/' + item.path" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <!-- 一级菜单图标 -->
              <i :class="iconMenu[item.id]" class="aside-icon"></i>
              <!-- 一级菜单名称 -->
              <span>{{item.authName}}</span>
            </template>

            <el-menu-item @click="saveMenuState('/' + subItem.path)" :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id">
              <template slot="title">
                <!-- 二级菜单图标 -->
                <i :class="iconMenu[subItem.id]" class="aside-icon"></i>
                <!-- 二级菜单名称 -->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </div>
    </el-aside>
    <el-container>
      <el-header class="header-box">
        <div class="left-box">
          <!-- button按钮 -->
          <div class="aside-btn" @click="toggleMeun">
            <i class="iconfont icon-shouqicebianlan2x"></i>
          </div>
        <!-- 面包屑导航 -->
        </div>
        <!-- 用户信息 -->
        <div class="info-box">
          <div class="img-box">
            <img src="@/assets/zhuang.jpg" alt="">
          </div>
          <!-- 下拉菜单 -->
          <el-dropdown :hide-on-click="false" class="drop-box" @command="handleCommand">
            <span class="el-dropdown-link">
              <span>admin</span>
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="userInfo">个人信息</el-dropdown-item>
              <el-dropdown-item command="outLogin">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-box">
        <!-- 路由 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      // 左侧菜单数据
      menuList: [],
      // 配置图标
      iconMenu: {
        125: 'iconfont icon-yonghuguanli',
        110: 'iconfont icon-yonghuliebiao',
        103: 'iconfont icon-quanxianguanli',
        111: 'iconfont icon-quanxian',
        112: 'iconfont icon-quanxianziyuanguanli',
        101: 'iconfont icon--shangpinguanli',
        104: 'iconfont icon-shangpinguanli',
        115: 'iconfont icon-canshuxinxi',
        121: 'iconfont icon-fenjifenlei',
        102: 'iconfont icon-dingdanjihe',
        107: 'iconfont icon-dingdan',
        145: 'iconfont icon-data-view',
        146: 'iconfont icon-tubiao'
      },
      // 菜单展开收起
      isCollapse: false,
      // 激活的导航链接地址
      activepath: '',
      // 面包屑导航路径
      breadList: []
    }
  },
  created () {
    this.getMenuList()
    this.activepath = window.sessionStorage.getItem('path')
  },
  methods: {
    handleCommand (command) {
      if (command === 'userInfo') {
        this.$router.push('/userinfo')
      }
      if (command === 'outLogin') {
        window.sessionStorage.clear()
        this.$router.push('/login')
      }
    },
    async getMenuList () {
      const { data: res } = await this.$axios.get('/menus')
      if (!res.meta.status) {
        this.$message.error(res.meta.msg)
      }
      this.menuList = res.data
    },
    toggleMeun () {
      this.isCollapse = !this.isCollapse
    },
    saveMenuState (path) {
      window.sessionStorage.setItem('path', path)
      this.activepath = path
    }
  }
}
</script>

<style lang="scss" scoped>
.home-container {
  height: 100%;
}
.aside-box {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
  background-color: #333;
  .logo-container {
    width: 100%;
    height: 60px;
    padding: 0 20px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      width: 36px;
    }
    h1 {
      font-size: 22px;
      color: #fff;
      margin: 0 10px;
      height: 60px;
      line-height: 60px;
    }
  }
  .aside-container {
    flex: 1;
    width: 100%;
    .menu-box {
      border: none
    }
  }
}
.header-box {
  border-bottom: 1px solid #f1f1f1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .left-box {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    .aside-btn {
      cursor: pointer;
      .iconfont {
        font-size: 24px;
      }
    }
  }
  .info-box {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 0 20px;
    .img-box {
      display: block;
      width: 30px;
      height: 30px;
      overflow: hidden;
      border-radius: 50%;
      margin-right: 10px;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .drop-box {
      cursor: pointer;
    }
  }
}
.aside-icon {
  color: #fff;
  font-size: 18px;
  margin-right: 8px;
}

.aside-box.launch .logo-container h1 {
  display: none;
}

.aside-box.stow .logo-container h1 {
  display: block;
}
</style>
