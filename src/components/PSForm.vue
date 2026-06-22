<template>
  <div class="iframe-dialog-launcher">
    <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
      <template v-slot:activator="{ on }">
        <v-btn small rounded dark color="teal" class="iframe-dialog-launcher__button" v-on="on"> PS Report </v-btn>
      </template>

      <v-card class="iframe-dialog">
        <v-toolbar dark flat height="72" class="iframe-dialog__toolbar">
          <div class="iframe-dialog__brand">
            <div class="iframe-dialog__icon">
              <v-icon color="white">assignment</v-icon>
            </div>
            <div class="iframe-dialog__title">
              <span>PS Report Form</span>
              <small>{{ activeClientName }}</small>
            </div>
          </div>

          <v-spacer></v-spacer>

          <v-btn icon color="white" @click="threadReload">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>

        <div class="iframe-dialog__body">
          <div v-if="iframeLoading" class="iframe-dialog__loading">
            <v-progress-circular indeterminate color="teal darken-2"></v-progress-circular>
            <span>Loading PS report form...</span>
          </div>

          <iframe
            v-if="dialog"
            class="iframe-dialog__frame"
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
  mounted() {
    // this.GetMyCoordinates();
  },
  methods: {
    ...mapActions(['getAcc', 'getThreadByAccountId']),
    ...mapMutations(['upClient', 'upCurThreads', 'upCurClientMID', 'upTotalPages']),
    clientClick(id) {
      this.getAcc(id).then(
        res => {
          this.upClient(res.data)
        },
        error => {
          console.error(error)
        }
      )
      // this.$router.push({ path: `/customer/${id}` });
    },
    threadReload() {
      this.upCurThreads([])
      const accID = this.$route.params.ACCMID ? this.$route.params.ACCMID : ''
      this.getThreadByAccountId({
        cntdpt: this.CurUserDetails.CNTMST.CNTDPT,
        accID: accID,
        pageNumber: this.PageNumber,
      }).then(
        res => {
          this.upCurClientMID(this.$route.params.ACCMID)
          this.upCurThreads(res.data.data.threads)
          this.upTotalPages({ totPages: res.data.totalPages })
        },
        error => {
          console.error(error)
        }
      )
      this.dialog = false
    },
  },
  computed: {
    ...mapState(['CurClientDetails', 'CurUserDetails', 'PageNumber']),
    activeClientName() {
      return this.CurClientDetails.ACCMSC || this.CurClientDetails.ACCMNM || 'Customer'
    },
    srFormURL() {
      // return `http://localhost:8081/#/psstartservice/${this.CurClientDetails.ACCMID}/${this.CurClientDetails.ACCMNM}/${this.CurUserDetails.CNTMST.CNTMID}`;
      const base = process.env.VUE_APP_SR_URL_2
      return `${base}psstartservice/${this.CurClientDetails.ACCMID}/${this.CurClientDetails.ACCMNM}/${this.CurUserDetails.CNTMST.CNTMID}`
    },
  },
}
</script>

<style scoped>
.iframe-dialog-launcher,
.iframe-dialog-launcher__button {
  width: 100%;
}

.iframe-dialog-launcher__button {
  font-weight: 800;
  letter-spacing: 0;
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
