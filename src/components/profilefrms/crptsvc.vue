<template>
  <v-container fluid class="thread-detail-page">
    <div class="thread-detail-shell">
      <v-card class="thread-detail-header" elevation="0">
        <div class="thread-detail-header__main">
          <div class="thread-detail-badges">
            <span v-if="CurThreadDetails.TRDSEC" class="thread-detail-badge thread-detail-badge--field">
              {{ CurThreadDetails.TRDSEC }}
            </span>
            <span v-if="CurThreadDetails.TRDMTY" class="thread-detail-badge thread-detail-badge--type">
              {{ CurThreadDetails.TRDMTY }}
            </span>
          </div>
          <h1>{{ CurThreadDetails.TRDMTT || 'Thread details' }}</h1>
          <p>{{ CurThreadDetails.TRDMDE || 'Customer thread conversation' }}</p>
        </div>

        <v-btn
          v-if="canToggleThread"
          class="thread-detail-lock"
          icon
          text
          :color="CurThreadDetails.TRDMST == false ? 'red lighten-1' : 'teal darken-2'"
          @click="openDialogStatus"
        >
          <v-icon small>{{ CurThreadDetails.TRDMST == false ? 'fa-lock' : 'fa-lock-open' }}</v-icon>
        </v-btn>
      </v-card>

      <v-card class="thread-detail-summary" elevation="0">
        <div v-if="postedBy" class="thread-detail-summary__item">
          <span>Posted by</span>
          <strong>{{ postedBy }}</strong>
        </div>
        <div v-if="datePosted" class="thread-detail-summary__item">
          <span>Date posted</span>
          <strong>{{ datePosted }}</strong>
        </div>
        <div v-if="actionDate" class="thread-detail-summary__item">
          <span>Action date</span>
          <strong>{{ actionDate }}</strong>
        </div>
        <div class="thread-detail-summary__item">
          <span>Comments</span>
          <strong>{{ threadComments.length }}</strong>
        </div>
      </v-card>

      <v-card class="thread-detail-comments" elevation="0">
        <div class="thread-detail-comments__header">
          <div>
            <h2>Comments</h2>
            <p>Conversation history for this customer thread.</p>
          </div>
          <v-chip
            small
            :color="CurThreadDetails.TRDMST == false ? 'red lighten-5' : 'teal lighten-5'"
            text-color="blue-grey darken-3"
          >
            {{ CurThreadDetails.TRDMST == false ? 'Closed' : 'Open' }}
          </v-chip>
        </div>

        <v-divider></v-divider>

        <div v-if="spnr" class="thread-detail-comments__state">
          <v-progress-circular :size="72" :width="6" color="teal darken-2" indeterminate></v-progress-circular>
        </div>

        <div v-else class="thread-detail-comments__body">
          <template v-if="threadComments.length">
            <com-card
              v-for="(comment, index) in threadComments"
              :key="comment.TRDCID || index"
              :curUser="commentFromUser(comment)"
              :value="comment"
              track-by="$index"
            ></com-card>
          </template>

          <div v-else class="thread-detail-comments__empty">
            <v-icon size="42" color="blue-grey lighten-1">forum</v-icon>
            <strong>No comments yet</strong>
            <span>New comments will appear here once the thread starts moving.</span>
          </div>

          <div v-if="!CurThreadDetails.TRDMST" class="thread-detail-comments__disabled">Comments are disabled</div>
        </div>
      </v-card>

      <com-footer></com-footer>

      <v-dialog v-model="dialog" persistent max-width="360">
        <v-card class="thread-status-dialog">
          <v-card-title>{{ CurThreadDetails.TRDMST ? 'Close Thread?' : 'Open Thread?' }}</v-card-title>
          <v-card-text>
            {{
              CurThreadDetails.TRDMST
                ? 'Closing the thread means comments will be disabled.'
                : 'Opening the thread means comments will be enabled.'
            }}
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue-grey darken-1" text @click="dialog = false">Cancel</v-btn>
            <v-btn color="teal darken-2" text @click="changeStatus">
              {{ CurThreadDetails.TRDMST == false ? 'Open' : 'Turn off' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import moment from 'moment'
import ComFooter from '@/components/comFooter'
import ComCard from '@/components/comCard'

export default {
  components: {
    ComCard,
    ComFooter,
  },
  data() {
    return {
      spnr: true,
      detail: {},
      dialog: false,
    }
  },
  computed: {
    ...mapState(['CurThreadDetails', 'CurUserDetails', 'CurClientDetails']),
    threadComments() {
      const comments = this.CurThreadDetails.TRDCMM
      return Array.isArray(comments) ? comments.slice().reverse() : []
    },
    postedBy() {
      return this.CurThreadDetails.TRDMUI ? this.CurThreadDetails.TRDMUI.CNTMCN : ''
    },
    datePosted() {
      return this.getRelativeTime(this.CurThreadDetails.TRDMCD)
    },
    actionDate() {
      return this.getRelativeTime(this.CurThreadDetails.TRDADT)
    },
    canToggleThread() {
      return (
        this.CurThreadDetails &&
        this.CurUserDetails &&
        this.CurUserDetails.USRDTL &&
        this.CurThreadDetails.TRDUBY == this.CurUserDetails.USRDTL.USRDCI
      )
    },
  },
  created() {
    this.loadThread()
  },
  methods: {
    ...mapActions(['getThreadDetailsById', 'getAcc', 'updateThreadByID']),
    ...mapMutations(['upClient', 'upTrdDetails']),
    openDialogStatus() {
      this.dialog = true
    },
    changeStatus() {
      const data = {
        id: this.CurThreadDetails.TRDMTI,
        val: {
          TRDMST: !this.CurThreadDetails.TRDMST,
          TRDUPD: moment().format(),
        },
      }

      this.updateThreadByID(data).then(
        () => {
          this.CurThreadDetails.TRDMST = !this.CurThreadDetails.TRDMST
          this.dialog = false
        },
        error => {
          console.error(error)
        }
      )
    },
    getRelativeTime(date) {
      if (!date) return ''
      const time = moment().from(date, true)
      return time.endsWith('days') ? moment(date).format('MMMM Do YYYY, hh:mm a') : `${time} ago`
    },
    commentFromUser(comment) {
      return (
        comment &&
        comment.TRDCUI &&
        this.CurUserDetails &&
        this.CurUserDetails.CNTMST &&
        comment.TRDCUI.CNTMID == this.CurUserDetails.CNTMST.CNTMID
      )
    },
    loadThread() {
      this.spnr = true
      this.getThreadDetailsById(this.$route.params.TRDMTI).then(
        res => {
          if (this.CurClientDetails.ACCMID !== this.CurThreadDetails.TRDMAC) {
            this.getAcc(res.TRDMAC).then(
              acc => {
                this.upClient(acc.data)
              },
              error => {
                console.error(error)
              }
            )
          }
          this.spnr = false
        },
        error => {
          console.error(error)
          this.spnr = false
        }
      )
    },
  },
}
</script>

<style scoped>
.thread-detail-page {
  min-height: calc(100vh - 92px);
  padding: 28px 16px 96px;
}

.thread-detail-shell {
  margin: 0 auto;
  max-width: 980px;
  width: 100%;
}

.thread-detail-header,
.thread-detail-summary,
.thread-detail-comments {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08) !important;
}

.thread-detail-header {
  align-items: flex-start;
  display: flex;
  gap: 18px;
  justify-content: space-between;
  padding: 26px 28px;
}

.thread-detail-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.thread-detail-badge {
  border-radius: 999px;
  color: white;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  padding: 5px 10px;
  text-transform: uppercase;
}

.thread-detail-badge--field {
  background: #0f766e;
}

.thread-detail-badge--type {
  background: #1976d2;
}

.thread-detail-header h1 {
  color: #0f172a;
  font-size: 1.55rem;
  margin: 0 0 5px;
}

.thread-detail-header p {
  color: #64748b;
  margin: 0;
  white-space: pre-line;
}

.thread-detail-summary {
  display: grid;
  gap: 1px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: 16px;
  overflow: hidden;
}

.thread-detail-summary__item {
  background: rgba(248, 250, 252, 0.86);
  padding: 16px 18px;
}

.thread-detail-summary__item span {
  color: #64748b;
  display: block;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.thread-detail-summary__item strong {
  color: #0f172a;
  display: block;
  margin-top: 4px;
}

.thread-detail-comments {
  margin-top: 16px;
  overflow: hidden;
}

.thread-detail-comments__header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 20px 24px;
}

.thread-detail-comments__header h2 {
  color: #0f172a;
  font-size: 1.15rem;
  margin: 0;
}

.thread-detail-comments__header p {
  color: #64748b;
  margin: 3px 0 0;
}

.thread-detail-comments__state,
.thread-detail-comments__empty {
  align-items: center;
  color: #64748b;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 180px;
  padding: 28px;
  text-align: center;
}

.thread-detail-comments__empty strong {
  color: #334155;
  margin-top: 10px;
}

.thread-detail-comments__body {
  padding: 16px;
}

.thread-detail-comments__disabled {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #991b1b;
  font-weight: 800;
  margin-top: 14px;
  padding: 14px;
  text-align: center;
}

.thread-status-dialog {
  border-radius: 10px;
}

@media (max-width: 760px) {
  .thread-detail-header {
    flex-direction: column;
  }

  .thread-detail-summary {
    grid-template-columns: 1fr;
  }
}
</style>
