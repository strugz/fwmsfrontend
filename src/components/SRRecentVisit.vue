<template>
  <v-container fluid class="recent-page">
    <v-row justify="center">
      <v-col cols="12" md="9" lg="7" xl="5">
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
                <v-list-item-subtitle class="recent-list__subtitle">
                  Last visited {{ item.RCTCDT }}
                </v-list-item-subtitle>
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

          <v-card-actions v-if="showItineraryButton" class="recent-actions">
            <v-spacer></v-spacer>
            <v-btn color="teal darken-2" dark depressed rounded @click="ValidationItinerary">
              Go To Itinerary
              <v-icon right>event_note</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { mapState, mapMutations, mapActions } from 'vuex'
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
    showItineraryButton() {
      const section = this.CurUserDetails && this.CurUserDetails.CNTMST && this.CurUserDetails.CNTMST.CNTSEC
      return section === 'TSR/PS' || section === 'TSR/ENGINEER'
    },
  },
  mounted() {
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
      console.log(this.today)
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
        params: { CNTMID: this.CurUserDetails.USRDTL.USRDCI },
      })
    },
  },
}
</script>
<style>
.recent-page {
  padding-bottom: 32px;
  padding-top: 8px;
}

.recent-card {
  border: 1px solid rgba(15, 76, 76, 0.1);
  border-radius: 12px;
  overflow: hidden;
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

.recent-actions {
  border-top: 1px solid rgba(15, 76, 76, 0.08);
  padding: 16px 24px 20px;
}
</style>
