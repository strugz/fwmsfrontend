import home from '@/views/Forms/home.vue'
import customerRoutes from '@/modules/customers/routes'
import threadRoutes from '@/modules/threads/routes'
import serviceReportRoutes from '@/modules/service-reports/routes'
import itineraryCalendarRoutes from '@/modules/itinerary-calendar/routes'
import { ifAuthenticated } from '@/modules/auth/guards'

export default [
  {
    path: '/',
    name: 'home',
    component: home,
    beforeEnter: ifAuthenticated,
    children: [
      ...serviceReportRoutes,
      ...customerRoutes.filter(route => route.path !== '/accmanager'),
      ...threadRoutes,
      ...itineraryCalendarRoutes,
    ],
  },
]
