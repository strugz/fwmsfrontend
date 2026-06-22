<template>
  <div class="ttp-launcher">
    <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
      <template v-slot:activator="{ on }">
        <v-btn v-if="type == 'icon'" small icon text rounded dark color="teal" class="ttp-launcher__icon" v-on="on">
          <v-icon color="white">timer_off</v-icon>
        </v-btn>
        <v-btn v-else small rounded dark color="teal" class="ttp-launcher__button" v-on="on"> Create TTP </v-btn>
      </template>
      <v-card class="ttp-dialog">
        <v-toolbar dark flat height="72" class="ttp-dialog__toolbar">
          <div class="ttp-dialog__brand">
            <div class="ttp-dialog__icon">
              <v-icon color="white">timer_off</v-icon>
            </div>
            <div class="ttp-dialog__title">
              <span>Begin TTP</span>
              <small>{{ activeClientName }}</small>
            </div>
          </div>
          <v-spacer></v-spacer>
          <v-btn icon color="white" @click="dialog = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>

        <div class="ttp-dialog__body">
          <div v-if="iframeLoading" class="ttp-dialog__loading">
            <v-progress-circular indeterminate color="teal darken-2"></v-progress-circular>
            <span>Loading TTP form...</span>
          </div>
          <iframe v-if="dialog" class="ttp-dialog__frame" :src="srFormURL" @load="iframeLoading = false"></iframe>
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
  props: {
    type: {
      type: String,
      default: '',
    },
  },
  computed: {
    ...mapState(['CurClientDetails', 'CurUserDetails']),
    activeClientName() {
      return this.CurClientDetails.ACCMSC || this.CurClientDetails.ACCMNM || 'Customer'
    },
    srFormURL() {
      const base = process.env.VUE_APP_SR_URL
      return `${base}ttpstart/${this.CurClientDetails.ACCMID}/${this.CurClientDetails.ACCMNM}/${this.CurUserDetails.CNTMST.CNTMID}`
    },
  },
}
</script>

<style scoped>
.ttp-launcher,
.ttp-launcher__button {
  width: 100%;
}

.ttp-launcher__button {
  font-weight: 800;
  letter-spacing: 0;
}

.ttp-launcher__icon {
  width: auto;
}

.ttp-dialog {
  display: flex;
  height: 100vh;
  flex-direction: column;
  overflow: hidden;
  background: #f7fafc;
}

.ttp-dialog__toolbar {
  flex: 0 0 auto;
  padding: 0 18px;
  background: linear-gradient(135deg, #00695c 0%, #1976d2 100%);
  box-shadow: 0 6px 22px rgba(15, 23, 42, 0.2);
}

.ttp-dialog__brand {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
}

.ttp-dialog__icon {
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

.ttp-dialog__title {
  display: flex;
  min-width: 0;
  flex-direction: column;
  line-height: 1.2;
}

.ttp-dialog__title span {
  color: #fff;
  font-size: 18px;
  font-weight: 900;
}

.ttp-dialog__title small {
  max-width: 70vw;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.82);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ttp-dialog__body {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  background: #fff;
}

.ttp-dialog__frame {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

.ttp-dialog__loading {
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
