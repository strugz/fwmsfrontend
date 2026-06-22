<template>
  <div class="sr-form-launcher">
    <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
      <template v-slot:activator="{ on }">
        <v-btn small rounded dark color="teal" class="sr-form-launcher__button" v-on="on"> Service Report </v-btn>
      </template>

      <v-card class="sr-form-dialog">
        <v-toolbar dark flat height="72" class="sr-form-dialog__toolbar">
          <div class="sr-form-dialog__brand">
            <div class="sr-form-dialog__icon">
              <v-icon color="white">assignment</v-icon>
            </div>
            <div class="sr-form-dialog__title">
              <span>Service Report Form</span>
              <small>{{ activeClientName }}</small>
            </div>
          </div>

          <v-spacer></v-spacer>

          <v-btn icon color="white" @click="threadReload">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>

        <div class="sr-form-dialog__body">
          <div v-if="iframeLoading" class="sr-form-dialog__loading">
            <v-progress-circular indeterminate color="teal darken-2"></v-progress-circular>
            <span>Loading service report form...</span>
          </div>

          <iframe
            v-if="dialog"
            class="sr-form-dialog__frame"
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
  methods: {
    ...mapActions(['getAcc', 'getThreadByAccountId']),
    ...mapMutations(['upClient', 'upCurThreads', 'upCurClientMID', 'upCurThreads', 'upTotalPages']),
    clientClick(id) {
      this.getAcc(id).then(
        res => {
          this.upClient(res.data)
        },
        error => {
          console.error(error)
        }
      )
      this.$router.push({ path: `/customer/${id}` })
      location.reload()
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
      // return `http://localhost:8081/#/startservice/${this.CurClientDetails.ACCMID}/${this.CurClientDetails.ACCMNM}/${this.CurUserDetails.CNTMST.CNTMID
      const base = process.env.VUE_APP_SR_URL
      return `${base}startservice/${this.CurClientDetails.ACCMID}/${this.CurClientDetails.ACCMNM}/${this.CurUserDetails.CNTMST.CNTMID}`
    },
  },
}
</script>

<style scoped>
.sr-form-launcher,
.sr-form-launcher__button {
  width: 100%;
}

.sr-form-launcher__button {
  font-weight: 800;
  letter-spacing: 0;
}

.sr-form-dialog {
  display: flex;
  height: 100vh;
  flex-direction: column;
  overflow: hidden;
  background: #f6fafb;
}

.sr-form-dialog__toolbar {
  flex: 0 0 auto;
  padding: 0 18px;
  background: linear-gradient(135deg, #00695c 0%, #1976d2 100%);
  box-shadow: 0 6px 22px rgba(15, 23, 42, 0.2);
}

.sr-form-dialog__brand {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
}

.sr-form-dialog__icon {
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

.sr-form-dialog__title {
  display: flex;
  min-width: 0;
  flex-direction: column;
  line-height: 1.2;
}

.sr-form-dialog__title span {
  color: #fff;
  font-size: 18px;
  font-weight: 900;
}

.sr-form-dialog__title small {
  max-width: 70vw;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.84);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sr-form-dialog__body {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  background: #fff;
}

.sr-form-dialog__frame {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

.sr-form-dialog__loading {
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
