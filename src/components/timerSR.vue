<template>
  <v-layout mt-0 row justify-end>
    <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
      <template v-slot:activator="{ on }">
        <v-btn small flat icon color="indigo" class="ma-0" dark v-on="on">
          <v-icon>timer</v-icon>
        </v-btn>
      </template>
      <v-card class="hide-overflow" style="position: relative;">
        <v-toolbar absolute color="primary" dense dark scroll-off-screen scroll-target="#scrolling-techniques">
          <v-toolbar-title>Service Report Form</v-toolbar-title>
          <!-- <span>{{ srFormURL }}</span> -->
          <v-spacer></v-spacer>
          <v-btn icon @click="threadReload">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <div id="scrolling-techniques" class="scroll-y my-4" style="max-height: 600px;">
          <iframe allow="camera" v-if="dialog" :src="srFormURL"></iframe>
        </div>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import { mapState, mapActions, mapMutations } from "vuex";
export default {
  data() {
    return {
      dialog: false,
    };
  },
  watch: {
    dialog: function() {
      if (this.dialog == false) {
        this.clientClick(this.CurClientDetails.ACCMID);
      }
    },
  },
  methods: {
    ...mapActions(["getAcc", "getThreadByAccountId"]),
    ...mapMutations([
      "upClient",
      "upCurThreads",
      "upCurClientMID",
      "upTotalPages",
    ]),
    clientClick(id) {
      this.getAcc(id).then(
        (res) => {
          this.upClient(res.data);
        },
        (error) => {
          console.error(error);
        }
      );
      // this.$router.push({ path: `/customer/${id}` });
    },
    threadReload() {
      this.upCurThreads([]);
      const accID = this.$route.params.ACCMID ? this.$route.params.ACCMID : "";
      this.getThreadByAccountId({
        cntdpt: this.CurUserDetails.CNTMST.CNTDPT,
        accID: accID,
        pageNumber: this.PageNumber,
      }).then(
        (res) => {
          this.upCurClientMID(this.$route.params.ACCMID);
          this.upCurThreads(res.data.data.threads);
          this.upTotalPages({ totPages: res.data.totalPages });
        },
        (error) => {
          console.error(error);
        }
      );
      this.dialog = false;
    },
  },
  computed: {
    ...mapState(["CurClientDetails", "CurUserDetails", "CurThreadDetails"]),
    srFormURL() {
      if (this.CurThreadDetails.TRDMTY == "Service Report") {
        return `https://sr.mdmpi.com.ph/#/startedservice/${this.CurClientDetails.ACCMID}/
      ${this.CurClientDetails.ACCMNM}/${this.CurUserDetails.CNTMST.CNTMID}/
      ${this.CurThreadDetails.TRDMTT}/${this.CurThreadDetails.TRDMTI}`;
      } else {
        return `https://sr.mdmpi.com.ph/#/psstartedservice/${this.CurClientDetails.ACCMID}/
      ${this.CurClientDetails.ACCMNM}/${this.CurUserDetails.CNTMST.CNTMID}/
      ${this.CurThreadDetails.TRDMTT}/${this.CurThreadDetails.TRDMTI}`;
      }
    },
  },
};
</script>

<style>
</style> 
