<template>
  <v-breadcrumbs>
    <v-breadcrumbs-item :to="home">{{ 'Home' }}</v-breadcrumbs-item>

    <v-breadcrumbs-item
      v-if="client.hasOwnProperty('href')"
      :to="client.href"
    >
      <h5>
        {{ client.text }}
      </h5>
    </v-breadcrumbs-item>

    <v-breadcrumbs-item
      v-if="thread.hasOwnProperty('href')"
      :to="thread.href"
      :disabled="true"
    >{{
      thread.text 
    }}</v-breadcrumbs-item>

    <template v-slot:divider>
      <v-icon color="teal darken-2">chevron_right</v-icon>
    </template>
  </v-breadcrumbs>
</template>

<script>
import { mapState, mapMutations } from "vuex";

export default {
  data() {
    return {
      BreadCrumbItems: [
        {
          text: "Home",
          href: "/",
        },
      ],
      homeValidation: "",
    };
  },
  created() {},
  computed: {
    ...mapState(["CurClientDetails", "CurThreadDetails", "CurUserDetails"]),
    client() {
      if (this.CurClientDetails.hasOwnProperty("ACCMNM")) {
        return {
          text: `${this.CurClientDetails.ACCMSC}`,
          href: `/customer/${this.CurClientDetails.ACCMID}`,
        };
      } else return "";
    },
    thread() {
      if (this.CurThreadDetails.hasOwnProperty("TRDMTT")) {
        return {
          text: `${
            this.CurThreadDetails.TRDMTY == "Service Report" ? "SR: #" : ""
          }${this.CurThreadDetails.TRDMTT}`,
          href: `/${
            this.CurThreadDetails.TRDMTY == "Service Report" ? "sr" : "thread"
          }/${this.CurClientDetails.ACCMID}`,
        };
      } else return "";
    },
    home() {
      if (
        this.CurUserDetails.CNTMST.CNTSEC == "TSR/ENGINEER" &&
        this.CurUserDetails.CNTMST.CNTSEC == "TSR/PS"
      ) {
        return "/mritinerary/" + this.CurUserDetails.USRDTL.USRDCI;
      } else {
        return "/recentvisit/" + this.CurUserDetails.USRDTL.USRDCI;
      }
    },
  },
  methods: {
    ...mapMutations(["upClient", "upTrdDetails"]),
  },
  watch: {
    client(val) {
      if (val !== "") {
        this.BreadCrumbItems[1] = val;
      }
    },
    thread(val) {
      if (val !== "") {
        this.BreadCrumbItems[2] = val;
      }
    },
    $route(to) {
      if (to.path == "/recentvisit/" + this.CurUserDetails.USRDTL.USRDCI) {
        this.upClient({});
        this.upTrdDetails([]);
        this.BreadCrumbItems = [
          {
            text: "Home",
            disabled: false,
            href: "/",
          },
        ];
      } else if (to.name == "customer") {
        this.upTrdDetails([]);
      }
    },
  },
};
</script>

<style></style>
