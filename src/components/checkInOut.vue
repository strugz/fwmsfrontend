<template>
  <div class="checkin-launcher">
    <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
      <template v-slot:activator="{ on }">
        <v-btn v-if="type == 'icon'" small icon text rounded dark color="teal" class="checkin-launcher__icon" v-on="on">
          <v-icon color="white">timer_off</v-icon>
        </v-btn>
        <v-btn v-else small rounded dark color="teal" class="checkin-launcher__button" v-on="on">
          {{ actionLabel }}
        </v-btn>
      </template>
      <v-card class="checkin-dialog">
        <v-toolbar dark flat height="72" class="checkin-dialog__toolbar">
          <div class="checkin-dialog__brand">
            <div class="checkin-dialog__icon">
              <v-icon color="white">place</v-icon>
            </div>
            <div class="checkin-dialog__title">
              <span>{{ dialogTitle }}</span>
              <small>{{ activeClientName }}</small>
            </div>
          </div>
          <v-spacer></v-spacer>
          <v-btn icon color="white" @click="dialog = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>

        <div class="checkin-dialog__body">
          <div v-if="iframeLoading" class="checkin-dialog__loading">
            <v-progress-circular indeterminate color="teal darken-2"></v-progress-circular>
            <span>Loading {{ actionLabel.toLowerCase() }} page...</span>
          </div>
          <iframe
            v-if="dialog"
            class="checkin-dialog__frame"
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
import { mapState, mapActions } from 'vuex'
export default {
  data() {
    return {
      dialog: false,
      InOut: '',
      iframeLoading: false,
    }
  },
  methods: {
    ...mapActions(['getCurCheckInAcc']),
    checkCurInAcc() {
      if (
        this.CurCheckInAcc.hasOwnProperty('serviceLocLogAction') &&
        this.CurCheckInAcc.serviceLocLogAction == 'CheckIn'
      ) {
        this.InOut = 'checkout'
      } else {
        this.InOut = 'checkin'
      }
    },
  },
  props: {
    type: {
      type: String,
      default: '',
    },
  },
  watch: {
    CurCheckInAcc() {
      this.checkCurInAcc()
    },
    dialog(val) {
      if (val) {
        this.iframeLoading = true
      } else {
        this.getCurCheckInAcc(this.CurUserDetails.CNTMST.CNTMID)
      }
    },
  },
  created() {
    this.checkCurInAcc()
  },
  computed: {
    ...mapState(['CurClientDetails', 'CurUserDetails', 'CurCheckInAcc']),
    actionLabel() {
      return this.InOut == 'checkout' ? 'Check out' : 'Check in'
    },
    dialogTitle() {
      return this.InOut == 'checkout' ? 'Service Report Check-Out' : 'Service Report Check-In'
    },
    activeClientName() {
      if (this.InOut == 'checkout' && this.CurCheckInAcc.customerID) {
        return this.CurCheckInAcc.customerID.ACCMSC || this.CurCheckInAcc.customerID.ACCMNM || ''
      }
      return this.CurClientDetails.ACCMSC || this.CurClientDetails.ACCMNM || ''
    },
    srFormURL() {
      const base = process.env.VUE_APP_SR_URL
      return `${base}${this.InOut}/${this.CurUserDetails.CNTMST.CNTMID}/${
        this.InOut == 'checkin' ? this.CurClientDetails.ACCMID : this.CurCheckInAcc.customerID.ACCMID
      }`
    },
  },
}
</script>
<style scoped>
.checkin-launcher,
.checkin-launcher__button {
  width: 100%;
}

.checkin-launcher__button {
  font-weight: 800;
  letter-spacing: 0;
}

.checkin-launcher__icon {
  width: auto;
}

.checkin-dialog {
  display: flex;
  height: 100vh;
  flex-direction: column;
  overflow: hidden;
  background: #f7fafc;
}

.checkin-dialog__toolbar {
  flex: 0 0 auto;
  padding: 0 18px;
  background: linear-gradient(135deg, #00695c 0%, #1976d2 100%);
  box-shadow: 0 6px 22px rgba(15, 23, 42, 0.2);
}

.checkin-dialog__brand {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
}

.checkin-dialog__icon {
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

.checkin-dialog__title {
  display: flex;
  min-width: 0;
  flex-direction: column;
  line-height: 1.2;
}

.checkin-dialog__title span {
  color: #fff;
  font-size: 18px;
  font-weight: 900;
}

.checkin-dialog__title small {
  max-width: 70vw;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.82);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.checkin-dialog__body {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  background: #fff;
}

.checkin-dialog__frame {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

.checkin-dialog__loading {
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
