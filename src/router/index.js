import Vue from 'vue'
import VueRouter from 'vue-router'

// 路由懒加载
const LoginPage = () => import('@/views/LoginPage.vue')
const HomePage = () => import('@/views/HomePage.vue')
const IndexPage = () => import('@/components/home/IndexPage.vue')
const UserList = () => import('@/components/user/UserList.vue')
const RoleList = () => import('@/components/power/RoleList.vue')
const PowerList = () => import('@/components/power/PowerList.vue')
const GoodList = () => import('@/components/good/GoodList.vue')
const SortParams = () => import('@/components/good/SortParams.vue')
const GoodSort = () => import('@/components/good/GoodSort.vue')
const OrderList = () => import('@/components/order/OrderList.vue')
const ReportForms = () => import('@/components/info/ReportForms.vue')
const AddGood = () => import('@/components/good/AddGood.vue')
const EditGood = () => import('@/components/good/EditGood.vue')

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginPage, name: 'LoginPage' },
  {
    path: '/home',
    component: HomePage,
    name: 'HomePage',
    redirect: '/index',
    meta: { title: '首页' },
    children: [
      { path: '/index', component: IndexPage, name: 'IndexPage', meta: { title: '首页' } },
      { path: '/users', component: UserList, name: 'UserList', meta: { title: '用户列表' } },
      { path: '/roles', component: RoleList, name: 'RoleList', meta: { title: '角色列表' } },
      { path: '/rights', component: PowerList, name: 'PowerList', meta: { title: '权限列表' } },
      { path: '/goods', component: GoodList, name: 'GoodList', meta: { title: '商品列表' } },
      { path: '/params', component: SortParams, name: 'SortParams', meta: { title: '分类参数' } },
      { path: '/categories', component: GoodSort, name: 'GoodSort', meta: { title: '商品分类' } },
      { path: '/orders', component: OrderList, name: 'OrderList', meta: { title: '订单列表' } },
      { path: '/reports', component: ReportForms, name: 'ReportForms', meta: { title: '数据报表' } },
      { path: '/goods/add', component: AddGood, name: 'AddGood', meta: { title: '添加商品' } },
      { path: '/goods/edit/:id', component: EditGood, name: 'EditGood', meta: { title: '编辑商品' } }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 导航守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  // 获取token
  const token = window.sessionStorage.getItem('token')
  if (!token) return next('/login')
  next()
})

export default router
