<template>
  <v-app id="app">
    <div class="BG1">
      <v-layout wrap class="bg-2">
        <router-view />
      </v-layout>
    </div>
  </v-app>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'

// import kprofile from "./components/Keys/kprofile";

export default {
  name: 'App',
  components: {},
  computed: {
    ...mapState(['CurUserDetails', 'CurThreadDetails', 'Notifications']),
  },
  methods: {
    ...mapActions(['getCurUserDetails', 'getAcc', 'msgListener', 'getNotifications']),
    ...mapMutations(['upClient']),
    alertNotif(notif) {
      if (this.CurUserDetails.CNTMST.CNTMID == notif.NTFFRM.CNTMID) return false
      this.$notify({
        title: `${notif.NTFAID.ACCMSC} - ${notif.NTFTRD.TRDMTT}`,
        text: notif.NTFCMM !== undefined ? notif.NTFCMM.TRDCCM : notif.NTFTRD.TRDMDE,
        data: {
          from: `(${notif.NTFFRM.CNTMNN}) ${notif.NTFFRM.CNTMCN}`,
          icon: notif.NTFTYP == 'comment' ? 'chat' : 'forum',
          img: notif.NTFAID.ACCMSC,
          usr_id: this.CurUserDetails.CNTMST.CNTMID,
          notif_id: notif._id,
          notif_index: this.Notifications.indexOf(notif),
        },
        duration: 8000,
      })
    },
  },
  created() {
    this.getCurUserDetails()
    this.getNotifications()
    if (this.$route.params.ACCMID !== undefined) {
      this.getAcc(this.$route.params.ACCMID).then(
        res => {
          this.upClient(res.data)
        },
        error => {
          console.error(error)
        }
      )
    }
    // this.$options.sockets.onmessage = msg => this.msgListener(msg)
  },
  mounted() {
    this.$options.sockets.message = data => {
      const msg = JSON.parse(data)
      // console.log(msg)
      this.msgListener(msg)
      this.alertNotif(msg.notif)
    }
  },
}
</script>

<style>
.BG1 {
  background-image: url(./assets/minimal.jpg);

  width: 100%;
  height: 100vh;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  background-attachment: fixed;
  /* position: absolute; */
}
.bg-2 {
  /* background-color: rgba(112, 5, 5, 0.199); */
  background: linear-gradient(1turn, #ffffff, #ffffffe1, #ffffff);
  width: 100%;
  height: 100vh;
  position: absolute;
}
</style>
