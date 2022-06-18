import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import element from '@/element/element.js'
import 'element-ui/lib/theme-chalk/index.css'
// 引入iconfont
import '@/assets/font/iconfont.css'
// 引入axios
import axios from 'axios'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 请求超时
const instance = axios.create()
instance.defaults.timeout = 5000
// 配置默认路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  NProgress.start()
  const token = window.sessionStorage.getItem('token')
  config.headers.Authorization = token
  return config
})

axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})

Vue.config.productionTip = false
Vue.use(element)
Vue.use(axios)
Vue.prototype.$axios = axios

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
