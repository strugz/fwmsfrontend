<template>
  <v-layout
    mt-0
    row
    justify-end
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
          flat
          icon
          color="indigo"
          class="ma-0"
          dark
          v-on="on"
        >
          <v-icon small>
            edit
          </v-icon>
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
          <v-toolbar-title>TTP Form</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
            icon
            @click="dialog = !dialog"
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
            v-if="dialog"
            :src="srFormURL"
          ></iframe>
        </div>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
<script>
import { mapState } from "vuex";
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
    clientClick(id) {
      console.log(id);
      this.$router.push({ path: `/customer/${id}` });
    },
  },
  computed: {
    ...mapState(["CurClientDetails", "CurUserDetails", "CurThreadDetails"]),
    srFormURL() {
      return `https://sr.mdmpi.com.ph/#/ttp/${this.CurClientDetails.ACCMID}/
      ${this.CurClientDetails.ACCMNM}/${this.CurUserDetails.CNTMST.CNTMID}/
      ${this.CurThreadDetails.TRDMTI}/${this.CurThreadDetails.TRDMTT}`;
    },
  },
};
</script>
