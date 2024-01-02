<template>
  <v-app id="app">
    <div class="BG1">
      <v-layout
        wrap
        class="bg-2"
      >
        <router-view />
      </v-layout>
    </div>
  </v-app>
</template>
<script>
import { mapState, mapMutations, mapActions } from "vuex";
export default {
  name: "App",
  computed: {
    ...mapState(["CurUserDetails", "CurThreadDetails", "Notifications"]),
  },
  methods: {
    ...mapActions(["getCurUserDetails", "getAcc", "getNotifications"]),
    ...mapMutations(["upClient"]),
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
