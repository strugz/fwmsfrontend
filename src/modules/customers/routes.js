import cservice from '@/components/profilefrms/cservice.vue'
import accmanager from '@/components/accmanager.vue'

export default [
  {
    path: '/accmanager',
    component: accmanager,
  },
  {
    name: 'customer',
    path: '/customer/:ACCMID',
    component: cservice,
  },
]
