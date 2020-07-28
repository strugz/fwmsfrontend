<template>
  <v-layout mt-0 row justify-center>
    <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
      <template v-slot:activator="{ on }">
        <v-btn v-if="type == 'icon'" small icon flat round dark color="teal" v-on="on">
          <v-icon color="white lighten-1">timer_off</v-icon>
        </v-btn>
        <v-btn v-else small round dark color="teal" v-on="on">
          Check in / out
        </v-btn>
      </template>
      <v-card class="hide-overflow" style="position: relative;">
        <v-toolbar absolute color="primary" dense dark scroll-off-screen scroll-target="#scrolling-techniques">
          <v-toolbar-title>Service Report Check-In</v-toolbar-title>
          <!-- <span>{{ srFormURL }}</span> -->
          <v-spacer></v-spacer>
          <v-btn icon @click="dialog = !dialog">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <div id="scrolling-techniques" class="scroll-y my-4" style="max-height: 600px;">
          <iframe v-if="dialog" :src="srFormURL"></iframe>
        </div>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
<script>
import { mapState, mapActions } from 'vuex'
export default {
  data() {
    return {
      dialog: false,
      InOut: '',
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
    CurCheckInAcc(val) {
      this.checkCurInAcc()
    },
    dialog(val) {
      if (val == false) {
        this.getCurCheckInAcc(this.CurUserDetails.CNTMST.CNTMID)
      }
    },
  },
  created() {
    this.checkCurInAcc()
  },
  computed: {
    ...mapState(['CurClientDetails', 'CurUserDetails', 'CurCheckInAcc']),
    srFormURL() {
      return `https://sr.mdmpi.com.ph/#/${this.InOut}/${this.CurUserDetails.CNTMST.CNTMID}/${
        this.CurClientDetails.ACCMID
      }`
    },
  },
}
</script>

<style>
iframe {
  border: none;
  position: absolute;
  display: block;
  width: 100%;
  height: 100%;
}
</style>
