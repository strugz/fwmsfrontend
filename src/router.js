import Vue from 'vue'
import Router from 'vue-router'

// import regContact from './views/Forms/regContact.vue'
import Login from './views/Forms/Login.vue'
import home from './views/Forms/home.vue'

import cservice from '@/components/profilefrms/cservice.vue'
import crptsvc from '@/components/profilefrms/crptsvc.vue'
import detailsSR from '@/components/profilefrms/detailsSR.vue'
import detailsTTP from '@/components/profilefrms/detailsTTP.vue'
import detailsCollection from '@/components/profilefrms/detailsCollection.vue'
import medRepVisit from '@/components/profilefrms/detailsItinerary.vue'
// import cardOcc from '@/components/profilefrms/cardOcc.vue'
import accmanager from '@/components/accmanager.vue'
import recentvisit from '@/components/SRRecentVisit.vue'
import mritinerary from './components/MRItinerary.vue'
import itineraryViewer from './components/ItineraryViewer.vue'
import servicecalendar from './components/ServiceCalendar.vue'
import itineraryheadviewer from './components/MRItineraryHeadViewer.vue'
import servicecalendarviewer from './components/ServiceCalendarViewer.vue'
import pscalendarviewer from './components/PSCalendarViewer.vue'
import p404 from './views/404.vue'
import SROutbox from '@/components/SROutbox.vue'
import FieldReportIframe from '@/components/FieldReportIframe.vue'

import Cookies from 'js-cookie'
import jwt from 'jsonwebtoken'

Vue.use(Router)

const ifNotAuthenticated = (to, from, next) => {
  jwt.verify(Cookies.get('token'), process.env.VUE_APP_PRIVATE_KEY, (err, decoded) => {
    if (decoded) {
      next('/')
      return
    }
  })
  next()
}

const ifAuthenticated = (to, from, next) => {
  jwt.verify(Cookies.get('token'), process.env.VUE_APP_PRIVATE_KEY, err => {
    if (err) {
      next('/login')
      return
    }
  })
  next()
}

export default new Router({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    // new Design
    {
      path: '/Login',
      name: 'Login',
      component: Login,
      beforeEnter: ifNotAuthenticated,
    },
    {
      path: '*',
      name: '404',
      component: p404,
    },
    {
      path: '/accmanager',
      component: accmanager,
    },
    {
      path: '/',
      name: 'home',
      component: home,
      beforeEnter: ifAuthenticated,
      children: [
        {
          name: 'sroutbox',
          path: 'sroutbox',
          component: SROutbox,
          props: route => ({
            iframeUrl: route.query.url || 'http://localhost:8081/#/outbox',
            title: route.query.title || 'Service Report Outbox',
          }),
        },
        {
          name: 'fieldreport',
          path: 'fieldreport/:ClientID/:SRID',
          component: FieldReportIframe,
          props: route => {
            // allow explicit url override via query
            if (route.query.url) {
              return {
                iframeUrl: route.query.url,
                title: route.query.title || 'Field Report',
              }
            }

            const SRID = route.params.SRID
            const ClientID = route.params.ClientID
            const iframeUrl = `http://localhost:8081/#/field-report/${ClientID}/${SRID}`
            // const iframeUrl = `https://sr.mdmpi.com.ph/#/field-report/${ClientID}/${SRID}`
            return {
              iframeUrl,
              title: route.query.title || 'Field Report',
            }
          },
        },
        {
          name: 'customer',
          path: '/customer/:ACCMID',
          component: cservice,
        },
        {
          name: 'thread',
          path: '/thread/:TRDMTI',
          component: crptsvc,
        },
        {
          name: 'sr',
          path: '/sr/:TRDMTI',
          component: detailsSR,
        },
        {
          name: 'ttp',
          path: '/ttp/:TRDMTI',
          component: detailsTTP,
        },
        {
          name: 'clt',
          path: 'clt/:TRDMTI',
          component: detailsCollection,
        },
        {
          name: 'itinerary',
          path: '/itinerary/:TRDMTI',
          component: medRepVisit,
        },
        {
          name: 'recentvisit',
          path: '/recentvisit/:RCTCNT',
          component: recentvisit,
        },
        {
          name: 'mritinerary',
          path: '/mritinerary/:CNTMID',
          component: mritinerary,
        },
        {
          name: 'itineraryviewer',
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
      ],
    },
  ],
})
