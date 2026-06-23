<template>
  <div class="recent-page">
    <v-card class="recent-card" elevation="0">
      <div class="recent-card__header">
        <div>
          <div class="recent-eyebrow">Workspace</div>
          <h2 class="recent-title">Recent Visits</h2>
          <p class="recent-subtitle">Resume the latest customer threads and field work.</p>
        </div>
        <v-chip small color="teal darken-2" text-color="white"> {{ CurRecentVisit.length }} visits </v-chip>
      </div>

      <v-list v-if="CurRecentVisit.length" class="recent-list" two-line>
        <v-list-item
          class="recent-list__item"
          v-for="item in CurRecentVisit"
          :key="item.RCTACC + '-' + item.RCTCDT"
          @click="GoTo(item.RCTACC)"
        >
          <v-list-item-avatar color="teal lighten-5" size="42">
            <v-icon color="teal darken-2">business</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="recent-list__title">
              {{ item.ACCMNM }}
            </v-list-item-title>
            <v-list-item-subtitle class="recent-list__subtitle"> Last visited {{ item.RCTCDT }} </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-icon color="blue-grey lighten-1">chevron_right</v-icon>
          </v-list-item-action>
        </v-list-item>
      </v-list>

      <div v-else class="recent-empty">
        <v-icon size="42" color="blue-grey lighten-2">history</v-icon>
        <div class="recent-empty__title">No recent visits yet</div>
        <div class="recent-empty__text">Search for a client above to start a new visit thread.</div>
      </div>
    </v-card>
  </div>
</template>
<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import { canViewRecentVisits, shouldOpenItinerary } from '@/modules/auth/sections'
import moment from 'moment'
export default {
  data() {
    return {
      currentDate: new Date().toJSON().slice(0, 10).replace(/-/g, '/'),
      today: '',
      yesterday: '',
      weekAgo: '',
    }
  },
  computed: {
    ...mapState(['CurRecentVisit', 'CurUserDetails']),
    currentUserId() {
      return this.CurUserDetails && this.CurUserDetails.USRDTL && this.CurUserDetails.USRDTL.USRDCI
    },
    section() {
      return (this.CurUserDetails && this.CurUserDetails.CNTMST && this.CurUserDetails.CNTMST.CNTSEC) || ''
    },
    canViewRecentVisits() {
      return canViewRecentVisits(this.section)
    },
  },
  created() {
    if (!this.ensureRecentVisitAccess()) return

    this.getYesterdayDate()
    this.getTodayDate()
  },
  methods: {
    ...mapActions(['getAcc']),
    ...mapMutations(['upClient']),
    getYesterdayDate() {
      var date = new Date()
      date.setDate(date.getDate() - 1)
      date = date.toJSON().slice(0, 10).replace(/-/g, '/')
      this.yesterday = moment(date).format('MM/DD/YYYY')
    },
    getTodayDate() {
      var date = new Date()
      date = date.toJSON().slice(0, 10).replace(/-/g, '/')
      this.today = moment(date).format('MM/DD/YYYY')
    },
    ensureRecentVisitAccess() {
      if (this.canViewRecentVisits) return true

      if (shouldOpenItinerary(this.section)) {
        this.ValidationItinerary()
      } else {
        this.$router.replace({ path: '/' })
      }
      return false
    },
    GoTo(accmid) {
      this.getAcc(accmid).then(
        res => {
          this.upClient(res.data)
        },
        error => {
          console.error(error)
        }
      )
      this.$router.push({ path: `/customer/${accmid}` })
    },
    ValidationItinerary() {
      this.$router.push({
        name: 'mritinerary',
        params: { CNTMID: this.currentUserId },
      })
    },
  },
}
</script>
<style>
.recent-page {
  display: flex;
  justify-content: center;
  padding-bottom: 32px;
  padding-top: 8px;
  width: 100%;
}

.recent-card {
  border: 1px solid rgba(15, 76, 76, 0.1);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 170px);
  overflow: hidden;
  width: min(100%, 720px);
}

.recent-card__header {
  align-items: flex-start;
  background: linear-gradient(135deg, #ecfdf5, #f8fafc);
  border-bottom: 1px solid rgba(15, 76, 76, 0.1);
  display: flex;
  justify-content: space-between;
  padding: 24px 24px 18px;
}

.recent-eyebrow {
  color: #0f766e;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.recent-title {
  color: #0f172a;
  font-size: 1.45rem;
  font-weight: 700;
  margin: 3px 0 4px;
}

.recent-subtitle {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
}

.recent-list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 8px;
}

.recent-list__item {
  border-radius: 10px;
  margin: 2px 0;
  transition: background 150ms ease, transform 150ms ease;
}

.recent-list__item:hover {
  background: #f1f5f9;
  transform: translateX(2px);
}

.recent-list__title {
  color: #0f172a;
  font-weight: 650;
}

.recent-list__subtitle {
  color: #64748b !important;
}

.recent-empty {
  color: #64748b;
  padding: 48px 24px;
  text-align: center;
}

.recent-empty__title {
  color: #334155;
  font-size: 1rem;
  font-weight: 700;
  margin-top: 12px;
}

.recent-empty__text {
  font-size: 0.9rem;
  margin-top: 4px;
}

@media (max-width: 600px) {
  .recent-card {
    max-height: calc(100vh - 140px);
  }

  .recent-card__header {
    gap: 12px;
    padding: 20px 18px 16px;
  }
}
</style>
