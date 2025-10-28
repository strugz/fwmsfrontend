<template>
  <v-layout mt-0 row justify-end>
    <v-dialog v-model="SRTimerDialog" fullscreen hide-overlay transition="dialog-bottom-transition">
      <template v-slot:activator="{ on }">
        <v-btn @click="upSRTimerDialog(true)" small flat icon color="indigo" class="ma-0" dark v-on="on">
          <v-icon>timer</v-icon>
        </v-btn>
      </template>
      <v-card class="hide-overflow" style="position: relative;">
        <v-toolbar absolute color="primary" dense dark scroll-off-screen scroll-target="#scrolling-techniques">
          <v-toolbar-title>Service Report Form</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="threadReload">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <div id="scrolling-techniques" class="scroll-y my-4" style="max-height: 600px;">
          <iframe allow="geolocation; camera" v-if="SRTimerDialog" :src="srFormURL"></iframe>
        </div>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
<script>
import { mapState, mapActions, mapMutations } from 'vuex'
export default {
  data() {
    return {}
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
      this.upSRTimerDialog(!this.SRTimerDialog);
    },
  },
  computed: {
    ...mapState(['CurClientDetails', 'CurUserDetails', 'CurThreadDetails', 'SRTimerDialog', 'PageNumber']),
    srFormURL() {
      if (this.CurThreadDetails.TRDMTY == 'Service Report') {
        // return `http://localhost:8081/#/startedservice/${this.CurClientDetails.ACCMID}/
        // ${this.CurClientDetails.ACCMNM}/${this.CurUserDetails.CNTMST.CNTMID}/
        // ${this.CurThreadDetails.TRDMTT}/${this.CurThreadDetails.TRDMTI}`;
        return `https://crm.mdmpi.com.ph/#/startedservice/${this.CurClientDetails.ACCMID}/
        ${this.CurClientDetails.ACCMNM}/${this.CurUserDetails.CNTMST.CNTMID}/
        ${this.CurThreadDetails.TRDMTT}/${this.CurThreadDetails.TRDMTI}`;
      } else {
        return `https://sr.mdmpi.com.ph/#/psstartedservice/${this.CurClientDetails.ACCMID}/
      ${this.CurClientDetails.ACCMNM}/${this.CurUserDetails.CNTMST.CNTMID}/
      ${this.CurThreadDetails.TRDMTT}/${this.CurThreadDetails.TRDMTI}`
      }
    },
  },
}
</script>

<style></style>
