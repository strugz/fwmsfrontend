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
          v-if="type == 'icon'"
          small
          icon
          flat
          round
          dark
          color="teal"
          v-on="on"
        >
          <v-icon color="white lighten-1">timer_off</v-icon>
        </v-btn>
        <v-btn
          v-else
          small
          round
          dark
          color="teal"
          v-on="on"
        >
          Create TTP
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
          <v-toolbar-title>Begin TTP</v-toolbar-title>
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
  props: {
    type: {
      type: String,
      default: "",
    },
  },
  computed: {
    ...mapState(["CurClientDetails", "CurUserDetails"]),
    srFormURL() {
      return `https://sr.mdmpi.com.ph/#/ttpstart/${this.CurClientDetails.ACCMID}/${this.CurClientDetails.ACCMNM}/${this.CurUserDetails.CNTMST.CNTMID}`;
    },
  },
};
</script>
