<template>
  <v-breadcrumbs class="app-breadcrumbs">
    <v-breadcrumbs-item :to="home">Home</v-breadcrumbs-item>

    <v-breadcrumbs-item v-if="client && client.href" :to="client.href">
      <span>{{ client.text }}</span>
    </v-breadcrumbs-item>

    <v-breadcrumbs-item
      v-if="thread"
      :to="thread.href"
      :disabled="!thread.href || $route.name === 'thread' || $route.name === 'sr'"
    >
      {{ thread.text }}
    </v-breadcrumbs-item>

    <template v-slot:divider>
      <v-icon color="teal darken-2">chevron_right</v-icon>
    </template>
  </v-breadcrumbs>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
  data() {
    return {
      BreadCrumbItems: [
        {
          text: 'Home',
          href: '/',
        },
      ],
      homeValidation: '',
    }
  },
  created() {},
  computed: {
    ...mapState(['CurClientDetails', 'CurThreadDetails', 'CurUserDetails']),
    client() {
      // 1) Prefer Vuex CurClientDetails when available
      if (this.CurClientDetails && this.CurClientDetails.ACCMID) {
        const name = this.CurClientDetails.ACCMSC || this.CurClientDetails.ACCMNM || 'Client'
        return {
          text: `${name}`,
          href: `/customer/${this.CurClientDetails.ACCMID}`,
        }
      }

      // 2) Fallback: try to restore from sessionStorage (persisted by the store mutation)
      try {
        const raw = sessionStorage.getItem('CurClientDetails')
        if (raw) {
          const saved = JSON.parse(raw)
          if (saved && (saved.ACCMSC || saved.ACCMNM)) {
            const name = saved.ACCMSC || saved.ACCMNM || 'Client'
            const id = saved.ACCMID || this.$route.params.ClientID || this.$route.params.ACCMID
            return {
              text: `${name}`,
              href: id ? `/customer/${id}` : null,
            }
          }
        }
      } catch (e) {
        // ignore parse errors
      }

      // 3) Fallback: try to use route params directly (some routes use ClientID, others ACCMID)
      const routeName = this.$route && this.$route.params
      const routeId = routeName && (routeName.ClientID || routeName.ACCMID)
      if (routeId) {
        // We don't have the text (ACCMSC) in params typically; try to use a param called ClientName if present
        const clientName = this.$route.params.ClientName || this.$route.query.clientName || null
        return {
          text: clientName || `Client #${routeId}`,
          href: `/customer/${routeId}`,
        }
      }

      return null
    },
    thread() {
      // If thread details available in store, use them
      if (this.CurThreadDetails && this.CurThreadDetails.TRDMTI) {
        const prefix = this.CurThreadDetails.TRDMTY === 'Service Report' ? 'SR: #' : ''
        const routeName = this.CurThreadDetails.TRDMTY === 'Service Report' ? 'sr' : 'thread'
        return {
          text: `${prefix}${this.CurThreadDetails.TRDMTT}`,
          href: null,
        }
      }

      // Fallback: when navigating to fieldreport route we may only have SRID in route params
      const srid = this.$route && (this.$route.params.SRID || this.$route.params.TRDMTI)
      if (srid) {
        // If the route is specifically fieldreport, show 'SR: #<SRID>' text without href
        if (this.$route && this.$route.name === 'fieldreport') {
          return {
            text: `SR: #${srid}`,
            href: null,
          }
        }
        // For other routes, build a default link
        return {
          text: `SR: #${srid}`,
          href: null,
        }
      }

      return null
    },
    home() {
      // Guard for missing CurUserDetails
      if (!this.CurUserDetails || !this.CurUserDetails.USRDTL) return '/'

      const role = this.CurUserDetails.CNTMST && this.CurUserDetails.CNTMST.CNTSEC
      // if user has either role, go to mritinerary, otherwise recentvisit
      if (role === 'TSR/ENGINEER' || role === 'TSR/PS') {
        return '/mritinerary/' + this.CurUserDetails.USRDTL.USRDCI
      }
      return '/recentvisit/' + this.CurUserDetails.USRDTL.USRDCI
    },
  },
  methods: {
    ...mapMutations(['upClient', 'upTrdDetails']),
  },
  watch: {
    client(val) {
      if (val !== '') {
        this.BreadCrumbItems[1] = val
      }
    },
    thread(val) {
      if (val !== '') {
        this.BreadCrumbItems[2] = val
      }
    },
    $route(to) {
      if (to.path == '/recentvisit/' + this.CurUserDetails.USRDTL.USRDCI) {
        this.upClient({})
        this.upTrdDetails([])
        this.BreadCrumbItems = [
          {
            text: 'Home',
            disabled: false,
            href: '/',
          },
        ]
      } else if (to.name == 'customer') {
        this.upTrdDetails([])
      }
    },
  },
}
</script>

<style>
.app-breadcrumbs {
  padding: 0;
}

.app-breadcrumbs a,
.app-breadcrumbs .v-breadcrumbs__item {
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 600;
}

.app-breadcrumbs .v-breadcrumbs__item--disabled {
  color: #0f766e !important;
}
</style>
