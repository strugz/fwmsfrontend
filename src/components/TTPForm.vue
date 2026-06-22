<template>
  <div class="iframe-dialog-launcher">
    <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
      <template v-slot:activator="{ on }">
        <v-btn small text icon color="indigo" class="ma-0" dark v-on="on">
          <v-icon small> edit </v-icon>
        </v-btn>
      </template>

      <v-card class="iframe-dialog">
        <v-toolbar dark flat height="72" class="iframe-dialog__toolbar">
          <div class="iframe-dialog__brand">
            <div class="iframe-dialog__icon">
              <v-icon color="white">timer_off</v-icon>
            </div>
            <div class="iframe-dialog__title">
              <span>TTP Form</span>
              <small>{{ activeClientName }}</small>
            </div>
          </div>

          <v-spacer></v-spacer>

          <v-btn icon color="white" @click="dialog = !dialog">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>

        <div class="iframe-dialog__body">
          <div v-if="iframeLoading" class="iframe-dialog__loading">
            <v-progress-circular indeterminate color="teal darken-2"></v-progress-circular>
            <span>Loading TTP form...</span>
          </div>

          <iframe v-if="dialog" class="iframe-dialog__frame" :src="srFormURL" @load="iframeLoading = false"></iframe>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import { mapState } from 'vuex'
export default {
  data() {
    return {
      dialog: false,
      iframeLoading: false,
    }
  },
  watch: {
    dialog: function (val) {
      if (val) {
        this.iframeLoading = true
      } else {
        this.clientClick(this.CurClientDetails.ACCMID)
      }
    },
  },
  methods: {
    clientClick(id) {
      console.log(id)
      this.$router.push({ path: `/customer/${id}` })
    },
  },
  computed: {
    ...mapState(['CurClientDetails', 'CurUserDetails', 'CurThreadDetails']),
    activeClientName() {
      return this.CurClientDetails.ACCMSC || this.CurClientDetails.ACCMNM || 'Customer'
    },
    srFormURL() {
      const base = process.env.VUE_APP_SR_URL
      return `${base}ttp/${this.CurClientDetails.ACCMID}/
      ${this.CurClientDetails.ACCMNM}/${this.CurUserDetails.CNTMST.CNTMID}/
      ${this.CurThreadDetails.TRDMTI}/${this.CurThreadDetails.TRDMTT}`
    },
  },
}
</script>

<style scoped>
.iframe-dialog-launcher {
  display: inline-flex;
}

.iframe-dialog {
  display: flex;
  height: 100vh;
  flex-direction: column;
  overflow: hidden;
  background: #f6fafb;
}

.iframe-dialog__toolbar {
  flex: 0 0 auto;
  padding: 0 18px;
  background: linear-gradient(135deg, #00695c 0%, #1976d2 100%);
  box-shadow: 0 6px 22px rgba(15, 23, 42, 0.2);
}

.iframe-dialog__brand {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
}

.iframe-dialog__icon {
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

.iframe-dialog__title {
  display: flex;
  min-width: 0;
  flex-direction: column;
  line-height: 1.2;
}

.iframe-dialog__title span {
  color: #fff;
  font-size: 18px;
  font-weight: 900;
}

.iframe-dialog__title small {
  max-width: 70vw;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.84);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.iframe-dialog__body {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  background: #fff;
}

.iframe-dialog__frame {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

.iframe-dialog__loading {
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
