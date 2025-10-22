<template>
  <v-breadcrumbs>
    <v-breadcrumbs-item :to="home">Home</v-breadcrumbs-item>

    <v-breadcrumbs-item v-if="client && client.href" :to="client.href">
      <h5>{{ client.text }}</h5>
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
      if (this.CurClientDetails && this.CurClientDetails.ACCMID) {
        // Prefer ACCMNM for display name, fall back to ACCMSC if available
        const name = this.CurClientDetails.ACCMNM || this.CurClientDetails.ACCMSC || 'Client'
        return {
          text: `${name}`,
          href: `/customer/${this.CurClientDetails.ACCMID}`,
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
          href: `/${routeName}/${this.CurThreadDetails.TRDMTI}`,
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
          href: `/sr/${srid}`,
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

<style></style>
