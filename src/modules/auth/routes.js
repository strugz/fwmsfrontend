import Login from '@/views/Forms/Login.vue'
import { ifNotAuthenticated } from './guards'

export default [
  {
    path: '/Login',
    name: 'Login',
    component: Login,
    alias: '/login',
    beforeEnter: ifNotAuthenticated,
  },
]
