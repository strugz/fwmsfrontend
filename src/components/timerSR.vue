<template>
  <div class="timer-sr-launcher">
    <v-dialog v-model="SRTimerDialog" fullscreen hide-overlay transition="dialog-bottom-transition">
      <template v-slot:activator="{ on }">
        <v-btn
          @click="upSRTimerDialog(true)"
          small
          text
          icon
          color="indigo"
          class="ma-0 timer-sr-launcher__button"
          v-on="on"
        >
          <v-icon>timer</v-icon>
        </v-btn>
      </template>

      <v-card class="timer-sr-dialog">
        <v-toolbar dark flat height="72" class="timer-sr-dialog__toolbar">
          <div class="timer-sr-dialog__brand">
            <div class="timer-sr-dialog__icon">
              <v-icon color="white">timer</v-icon>
            </div>
            <div class="timer-sr-dialog__title">
              <span>Active Service Report</span>
              <small>{{ reportSubtitle }}</small>
            </div>
          </div>

          <v-spacer></v-spacer>

          <v-btn icon color="white" @click="threadReload">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>

        <div class="timer-sr-dialog__body">
          <div v-if="iframeLoading" class="timer-sr-dialog__loading">
            <v-progress-circular indeterminate color="teal darken-2"></v-progress-circular>
            <span>Loading active service report...</span>
          </div>

          <iframe
            v-if="SRTimerDialog"
            class="timer-sr-dialog__frame"
            allow="geolocation; camera"
            :src="srFormURL"
            @load="iframeLoading = false"
          ></iframe>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import { mapState, mapActions, mapMutations } from 'vuex'
export default {
  data() {
    return {
      iframeLoading: false,
    }
  },
  watch: {
    SRTimerDialog(val) {
      if (val) {
        this.iframeLoading = true
      }
    },
  },
  methods: {
    ...mapActions(['getAcc', 'getThreadByAccountId', 'getThreadDetailsById']),
    ...mapMutations(['upClient', 'upCurThreads', 'upCurClientMID', 'upTotalPages', 'upSRTimerDialog']),
    threadReload() {
      this.upCurThreads([])
      this.getThreadDetailsById(this.$route.params.TRDMTI).then(
        res => {
          this.upCurClientMID(this.CurClientDetails.ACCMID)
          if (res.TRDMTY == 'Service Report' && res.TRDSTS == 'WORK COMPLETE') {
            this.$router.push({ name: 'fieldreport', params: { ClientID: res.TRDMAC, SRID: res.TRDMTT } })
          }
        },
        error => {
          console.error(error)
        }
      )
      this.upSRTimerDialog(!this.SRTimerDialog)
    },
  },
  computed: {
    ...mapState(['CurClientDetails', 'CurUserDetails', 'CurThreadDetails', 'SRTimerDialog', 'PageNumber']),
    reportSubtitle() {
      const client = this.CurClientDetails.ACCMSC || this.CurClientDetails.ACCMNM || 'Customer'
      const report = this.CurThreadDetails.TRDMTT || 'Service report'
      return `${report} - ${client}`
    },
    srFormURL() {
      if (this.CurThreadDetails.TRDMTY == 'Service Report') {
        // return `http://localhost:8080/#/startedservice/${this.CurClientDetails.ACCMID}/
        // ${this.CurClientDetails.ACCMNM}/${this.CurUserDetails.CNTMST.CNTMID}/
        // ${this.CurThreadDetails.TRDMTT}/${this.CurThreadDetails.TRDMTI}`;

        const base = process.env.VUE_APP_SR_URL

        return `${base}startedservice/${this.CurClientDetails.ACCMID}/
        ${this.CurClientDetails.ACCMNM}/${this.CurUserDetails.CNTMST.CNTMID}/
        ${this.CurThreadDetails.TRDMTT}/${this.CurThreadDetails.TRDMTI}`
      } else {
        return `${process.env.VUE_APP_SR_URL_2}psstartedservice/${this.CurClientDetails.ACCMID}/
      ${this.CurClientDetails.ACCMNM}/${this.CurUserDetails.CNTMST.CNTMID}/
      ${this.CurThreadDetails.TRDMTT}/${this.CurThreadDetails.TRDMTI}`
      }
    },
  },
}
</script>

<style scoped>
.timer-sr-launcher {
  display: inline-flex;
}

.timer-sr-launcher__button {
  border-radius: 8px;
}

.timer-sr-dialog {
  display: flex;
  height: 100vh;
  flex-direction: column;
  overflow: hidden;
  background: #f6fafb;
}

.timer-sr-dialog__toolbar {
  flex: 0 0 auto;
  padding: 0 18px;
  background: linear-gradient(135deg, #00695c 0%, #1976d2 100%);
  box-shadow: 0 6px 22px rgba(15, 23, 42, 0.2);
}

.timer-sr-dialog__brand {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
}

.timer-sr-dialog__icon {
  display: inline-flex;
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.14);
}

.timer-sr-dialog__title {
  display: flex;
  min-width: 0;
  flex-direction: column;
  line-height: 1.2;
}

.timer-sr-dialog__title span {
  color: #fff;
  font-size: 18px;
  font-weight: 900;
}

.timer-sr-dialog__title small {
  max-width: 70vw;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.84);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.timer-sr-dialog__body {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  background: #fff;
}

.timer-sr-dialog__frame {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

.timer-sr-dialog__loading {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #52606d;
  font-size: 14px;
  background: #f7fafc;
}
</style>
