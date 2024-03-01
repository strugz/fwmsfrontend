<template>
  <v-content app>
    <v-toolbar
      flat
      prominent
      color="grey lighten-4"
      app
      dense
      :extension-height="32"
    >
      <v-flex
        xs1
        class="hidden-xs-only"
      >

        <v-toolbar-title
          style="cursor: pointer"
          @click="backToHomePage"
        >
          <span class="hidden-sm-and-down">Thread</span>
        </v-toolbar-title>

      </v-flex>
      <v-flex
        xs11
        md6
        sm6
        class="mb-3 mt-3"
      >
        <client-search></client-search>
      </v-flex>
      <v-spacer></v-spacer>
      <v-menu
        v-if="isAdmin"
        transition="slide-y-transition"
        bottom
        offset-y
      >
        <template v-slot:activator="{ on }">
          <v-btn
            small
            flat
            icon
            color="teal lighten-1"
            v-on="on"
          >
            <v-icon>settings</v-icon>
          </v-btn>
        </template>
        <v-list dense>
          <v-list-tile>
            <span class="v-list__tile__title body-1">{{ 'Client Manager' }}</span>
          </v-list-tile>
          <v-list-tile>
            <acc-manager></acc-manager>
          </v-list-tile>
        </v-list>
      </v-menu>
      <v-menu
        transition="slide-y-transition"
        bottom
        offset-y
      >
        <template v-slot:activator="{ on }">
          <v-btn
            small
            flat
            icon
            color="teal lighten-1"
            v-on="on"
          >
            <v-icon>account_circle</v-icon>
          </v-btn>
        </template>
        <v-list dense>
          <v-list-tile>
            <change-pass></change-pass>
          </v-list-tile>
          <v-list-tile v-if="CurUserDetails.CNTMST.CNTLDR == 'TL'">
            <back-track></back-track>
          </v-list-tile>
          <v-list-tile v-if="CurUserDetails.CNTMST.CNTLDR == 'ADMIN'">
            <user-manager></user-manager>
          </v-list-tile>
          <v-list-tile v-if="CurUserDetails.CNTMST.CNTLDR == 'ADMIN'">
            <customer-manager></customer-manager>
          </v-list-tile>
          <v-list-tile v-if="CurUserDetails.CNTMST.CNTDPT.substring(0,3) == 'TSG' || CurUserDetails.CNTMST.CNTDPT.substring(0,3) == 'PMD'">
            <span @click="goTo">Service Calendar</span>
          </v-list-tile>
          <!-- <v-list-tile>
            <service-card></service-card>
          </v-list-tile> -->
          <v-list-tile @click="logout()">
            <span class="v-list__tile__title body-1">{{ 'Logout' }}</span>
          </v-list-tile>
        </v-list>
      </v-menu>
      <template v-slot:extension>
        <bread-crumb></bread-crumb>
      </template>
    </v-toolbar>
    <div id="helloElement"></div>
    <!-- <app-drawer v-model="drawer"></app-drawer> -->
    <router-view :key="$route.fullPath" />
  </v-content>
</template> 
<script>
/* eslint-disable */
import appDrawer from "@/components/drawer";
import clientSearch from "@/components/searchClient";
import changePass from "@/components/changePass";
import accManager from "@/components/accmanager";
import breadCrumb from "@/components/breadCrumbs";
import backTrack from "@/components/SRBackTrack";
import customerManager from "@/components/CustomerManager";
import userManager from "@/components/UserRegistrationManager";
import ServiceCalendar from "@/components/ServiceCalendar";
import ServiceCard from "@/components/profilefrms/cardOcc";
import { mapState, mapActions, mapMutations } from "vuex";
import Cookies from "js-cookie";

export default {
  components: {
    appDrawer,
    breadCrumb,
    changePass,
    accManager,
    clientSearch,
    backTrack,
    customerManager,
    userManager,
    ServiceCalendar,
    ServiceCard
  },
  computed: {
    ...mapState(["CurClientDetails", "CurUserDetails"]),
    isAdmin() {
      if (this.CurUserDetails.USRDTL.hasOwnProperty("USRDRT")) {
        if (this.CurUserDetails.USRDTL.USRDRT.hasOwnProperty("ADMIN")) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    },
  },
  data() {
    return {
      dialog: false,
      clientlist: [],
      drawer: true,
      search_text: "",
      eventDialog: false,
      setDate: new Date("02/20/2023").toDateString(),
      setDateNow: new Date().toDateString(),
      eventValidation: "0",
    };
  },
  mounted() {
    if (this.setDate == this.setDateNow) {
      this.eventValidation = "1";
      this.eventDialog = true;
    } else {
      this.eventValidation = "0";
      this.eventDialog = false;
    }

    this.userGetPrivacy(this.CurUserDetails.USRDTL.USRDCI)
      .then((res) => {
        console.log(res);
      })
      .catch((error) => {
        this.logout();
        console.error(error);
      });
  },
  created() {
    this.getCurCheckInAcc(this.CurUserDetails.USRDTL.USRDCI).then((res) => {
      if (res.serviceLocLogAction != "CheckOut") {
        if (res.customerID != undefined) {
          this.upCheckInAcc({ items: res.customerID });
        }
      }
    });
    this.ValidationItinerary();
  },
  methods: {
    ...mapActions(["getCurCheckInAcc", "getRecentVisit", "userGetPrivacy"]),
    ...mapMutations(["upCheckInAcc", "upRecentVisit"]),
    logout() {
      Cookies.remove("token", { path: "/" });
      Cookies.remove("user_details", { path: "/" });
      this.$router.replace({ name: "Login" });
    },
    goTo() {
      this.$router.push({ path: `/servicecalendar/${this.CurUserDetails.USRDTL.USRDCI}` });
    },
    backToHomePage() {
      this.$router.push({
        name: "recentvisit",
        params: { RCTCNT: this.CurUserDetails.USRDTL.USRDCI },
      });
    },

    ValidationRecentVisit() {
      this.getRecentVisit({ CNTMID: this.CurUserDetails.USRDTL.USRDCI }).then(
        (res) => {
          this.upRecentVisit(res.data);
          if (res.data.length == undefined) {
            this.$router.push("/");
          }
        }
      );
    },
    ValidationItinerary() {
      if (this.CurUserDetails.CNTMST.CNTSEC == "TSR/ENGINEER") {
        this.$router.push({
          name: "mritinerary",
          params: { CNTMID: this.CurUserDetails.USRDTL.USRDCI },
        });
      } else if (this.CurUserDetails.CNTMST.CNTSEC == "TSR/PS") {
        this.$router.push({
          name: "mritinerary",
          params: { CNTMID: this.CurUserDetails.USRDTL.USRDCI },
        });
      } else if (this.CurUserDetails.CNTMST.CNTSEC == "TSR") {
        this.$router.push({
          name: "mritinerary",
          params: { CNTMID: this.CurUserDetails.USRDTL.USRDCI },
        });
      } else {
        this.ValidationRecentVisit();
      }
    },
  },
};
</script>
