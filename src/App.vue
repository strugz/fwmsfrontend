<template>
  <v-app id="app">
    <div class="BG1">
      <v-layout
        wrap
        class="bg-2"
      >
        <v-btn
          v-if="canInstall"
          color="primary"
          small
          style="position: fixed; right: 16px; bottom: 16px; z-index: 1000;"
          @click="installPWA"
        >
          Install App
        </v-btn>
        <router-view />
      </v-layout>
    </div>
  </v-app>
</template>
<script>
import { mapState, mapMutations, mapActions } from "vuex";
export default {
  name: "App",
  data() {
    return {
      deferredPrompt: null,
      canInstall: false,
    };
  },
  computed: {
    ...mapState(["CurUserDetails", "CurThreadDetails", "Notifications"]),
  },
  methods: {
    ...mapActions(["getCurUserDetails", "getAcc", "getNotifications"]),
    ...mapMutations(["upClient"]),
    installPWA() {
      if (!this.deferredPrompt) return;
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then(() => {
        this.deferredPrompt = null;
        this.canInstall = false;
      });
    },
  },
  created() {
    this.getCurUserDetails();
    if (this.$route.params.ACCMID !== undefined) {
      this.getAcc(this.$route.params.ACCMID).then(
        (res) => {
          this.upClient(res.data);
        },
        (error) => {
          console.error(error);
        }
      );
    }
    // PWA install prompt handling (Android/Chrome)
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.canInstall = true;
    });
    // Hide button if already installed (Chrome)
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.canInstall = false;
    });
    // iOS: Add to Home Screen is via Safari Share; we won't show the button on iOS
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isInStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isIOS || isInStandalone) {
      this.canInstall = false;
    }
  },
};
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
