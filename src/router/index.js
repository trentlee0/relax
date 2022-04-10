import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Setting from '../views/Setting.vue'
import Statistic from '@/views/Statistic'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/setting',
    name: 'Setting',
    component: Setting
  },
  {
    path: '/statistic',
    name: 'Statistic',
    component: Statistic
  }
]

const router = new VueRouter({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
