import medRepVisit from '@/components/profilefrms/detailsItinerary.vue'
import mritinerary from '@/components/MRItinerary.vue'
import itineraryViewer from '@/components/ItineraryViewer.vue'
import servicecalendar from '@/components/ServiceCalendar.vue'
import itineraryheadviewer from '@/components/MRItineraryHeadViewer.vue'
import servicecalendarviewer from '@/components/ServiceCalendarViewer.vue'
import pscalendarviewer from '@/components/PSCalendarViewer.vue'

export default [
  {
    name: 'itinerary',
    path: '/itinerary/:TRDMTI',
    component: medRepVisit,
  },
  {
    name: 'mritinerary',
    path: '/mritinerary/:CNTMID',
    component: mritinerary,
  },
  {
    name: 'itineraryviewer-user',
    path: '/itineraryviewer/:CNTMID',
    component: itineraryViewer,
  },
  {
    name: 'servicecalendar',
    path: '/servicecalendar/:CNTMID',
    component: servicecalendar,
  },
  {
    name: 'itineraryviewer',
    path: '/itineraryviewer',
    component: itineraryheadviewer,
  },
  {
    name: 'servicecalendarviewer',
    path: '/servicecalendarviewer',
    component: servicecalendarviewer,
  },
  {
    name: 'pscalendarviewer',
    path: '/pscalendarviewer',
    component: pscalendarviewer,
  },
]
