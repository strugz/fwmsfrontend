import Vue from 'vue'
import Router from 'vue-router'

import authRoutes from '@/modules/auth/routes'
import layoutRoutes from '@/modules/layout/routes'
import customerRoutes from '@/modules/customers/routes'
import p404 from '@/views/404.vue'

Vue.use(Router)

export default new Router({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    ...authRoutes,
    ...customerRoutes.filter(route => route.path === '/accmanager'),
    ...layoutRoutes,
    {
      path: '*',
      name: '404',
      component: p404,
    },
  ],
})
