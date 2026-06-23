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
import { canViewRecentVisits, shouldOpenItinerary } from '@/modules/auth/sections'

export default {
  computed: {
    ...mapState(['CurClientDetails', 'CurThreadDetails', 'CurUserDetails']),
    currentUserId() {
      return this.CurUserDetails && this.CurUserDetails.USRDTL && this.CurUserDetails.USRDTL.USRDCI
    },
    client() {
      if (this.CurClientDetails && this.CurClientDetails.ACCMID) {
        const name = this.CurClientDetails.ACCMSC || this.CurClientDetails.ACCMNM || 'Client'
        return {
          text: `${name}`,
          href: `/customer/${this.CurClientDetails.ACCMID}`,
        }
      }

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

      const routeParams = this.$route && this.$route.params
      const routeId = routeParams && (routeParams.ClientID || routeParams.ACCMID)
      if (routeId) {
        const clientName = this.$route.params.ClientName || this.$route.query.clientName || null
        return {
          text: clientName || `Client #${routeId}`,
          href: `/customer/${routeId}`,
        }
      }

      return null
    },
    thread() {
      if (this.CurThreadDetails && this.CurThreadDetails.TRDMTI) {
        const prefix = this.CurThreadDetails.TRDMTY === 'Service Report' ? 'SR: #' : ''
        return {
          text: `${prefix}${this.CurThreadDetails.TRDMTT}`,
          href: null,
        }
      }

      const srid = this.$route && (this.$route.params.SRID || this.$route.params.TRDMTI)
      if (srid) {
        if (this.$route && this.$route.name === 'fieldreport') {
          return {
            text: `SR: #${srid}`,
            href: null,
          }
        }
        return {
          text: `SR: #${srid}`,
          href: null,
        }
      }

      return null
    },
    home() {
      if (!this.CurUserDetails || !this.CurUserDetails.USRDTL) return '/'

      const section = this.CurUserDetails.CNTMST && this.CurUserDetails.CNTMST.CNTSEC
      if (shouldOpenItinerary(section)) {
        return '/mritinerary/' + this.CurUserDetails.USRDTL.USRDCI
      }
      if (canViewRecentVisits(section)) {
        return '/recentvisit/' + this.CurUserDetails.USRDTL.USRDCI
      }
      return '/'
    },
  },
  methods: {
    ...mapMutations(['upClient', 'upTrdDetails']),
  },
  watch: {
    $route(to) {
      if (this.currentUserId && to.path == '/recentvisit/' + this.currentUserId) {
        this.upClient({})
        this.upTrdDetails([])
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
