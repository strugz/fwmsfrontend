<template>
  <v-layout
    mt-0
    row
    justify-center
  >
    <v-dialog
      v-model="dialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <template v-slot:activator="{ on }">
        <v-btn
          small
          round
          dark
          color="teal"
          v-on="on"
        >
          Service Report
        </v-btn>
      </template>
      <v-card
        class="hide-overflow"
        style="position: relative;"
      >
        <v-toolbar
          absolute
          color="primary"
          dense
          dark
          scroll-off-screen
          scroll-target="#scrolling-techniques"
        >
          <v-toolbar-title>Service Report Form</v-toolbar-title>
          <!-- <span>{{ srFormURL }}</span> -->
          <v-spacer></v-spacer>
          <v-btn
            icon
            @click="threadReload"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <div
          id="scrolling-techniques"
          class="scroll-y my-4"
          style="max-height: 600px;"
        >
          <iframe
            allow="geolocation https://sr.mdmpi.com.ph"
            v-if="dialog"
            :src="srFormURL"
          ></iframe>
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
    dialog: function () {
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
      "upCurThreads",
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
      this.$router.push({ path: `/customer/${id}` });
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
    ...mapState(["CurClientDetails", "CurUserDetails", "PageNumber"]),
    srFormURL() {
      return `https://sr.mdmpi.com.ph/#/startservice/${this.CurClientDetails.ACCMID}/${this.CurClientDetails.ACCMNM}/${this.CurUserDetails.CNTMST.CNTMID}`;
    },
  },
};
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
