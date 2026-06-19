import crptsvc from '@/components/profilefrms/crptsvc.vue'
import recentvisit from '@/components/SRRecentVisit.vue'

export default [
  {
    name: 'thread',
    path: '/thread/:TRDMTI',
    component: crptsvc,
  },
  {
    name: 'recentvisit',
    path: '/recentvisit/:RCTCNT',
    component: recentvisit,
  },
]
