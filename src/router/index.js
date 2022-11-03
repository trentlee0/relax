import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/views/Home.vue'
import Setting from '@/views/Setting.vue'
import Statistic from '@/views/Statistic'
import Help from '@/views/Help'
import hotkeys from 'hotkeys-js'

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
  },
  {
    path: '/help',
    name: 'Help',
    component: Help
  }
]

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes
})

const VueRouterPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(to) {
  return VueRouterPush.call(this, to).catch(err => err)
}

router.beforeEach((to, from, next) => {
  if (from.meta.disable) return

  switch (to.name) {
    case 'Home':
      window.document.documentElement.style.overflowY = 'hidden'
      hotkeys.setScope('home')
      break
    case 'Setting':
      window.document.documentElement.style.overflowY = 'auto'
      hotkeys.setScope('setting')
      break
    case 'Statistic':
      window.document.documentElement.style.overflowY = 'overlay'
      hotkeys.setScope('statistic')
      break
    case 'Help':
      window.document.documentElement.style.overflowY = 'overlay'
      hotkeys.setScope('help')
      break
  }
  next()
})

router.afterEach(() => {
  window.scrollTo(0, 0)
})

export default router
