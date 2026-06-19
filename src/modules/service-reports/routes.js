import detailsSR from '@/components/profilefrms/detailsSR.vue'
import detailsTTP from '@/components/profilefrms/detailsTTP.vue'
import detailsCollection from '@/components/profilefrms/detailsCollection.vue'
import SROutbox from '@/components/SROutbox.vue'
import FieldReportIframe from '@/components/FieldReportIframe.vue'

const SR_BASE = process.env.VUE_APP_SR_URL

export default [
  {
    name: 'sroutbox',
    path: 'sroutbox',
    component: SROutbox,
    props: route => ({
      iframeUrl: route.query.url || `${SR_BASE}/#/outbox`,
      title: route.query.title || 'Service Report Outbox',
    }),
  },
  {
    name: 'fieldreport',
    path: 'fieldreport/:ClientID/:SRID',
    component: FieldReportIframe,
    props: route => {
      if (route.query.url) {
        return {
          iframeUrl: route.query.url,
          title: route.query.title || 'Field Report',
        }
      }

      const SRID = route.params.SRID
      const ClientID = route.params.ClientID
      return {
        iframeUrl: `${SR_BASE}/#/field-report/${ClientID}/${SRID}`,
        title: route.query.title || 'Field Report',
      }
    },
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
]
