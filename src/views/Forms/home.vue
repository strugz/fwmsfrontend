<template>
  <v-main v-if="hasUserDetails" app class="home-main">
    <v-app-bar app flat height="72" extension-height="38" class="home-app-bar">
      <div class="home-brand" @click="backToHomePage">
        <v-avatar size="36" color="teal darken-3" class="mr-3">
          <v-icon color="white">forum</v-icon>
        </v-avatar>
        <div>
          <div class="home-brand__title">FWMS</div>
          <div class="home-brand__subtitle hidden-sm-and-down">Field Workforce Management</div>
        </div>
      </div>

      <div class="home-search">
        <client-search></client-search>
      </div>

      <v-spacer></v-spacer>
      <v-menu v-if="isAdmin" transition="slide-y-transition" bottom offset-y>
        <template v-slot:activator="{ on }">
          <v-btn icon color="teal darken-2" class="home-icon-btn" v-on="on">
            <v-icon>settings</v-icon>
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item>
            <span class="v-list-item__title body-1">{{ 'Client Manager' }}</span>
          </v-list-item>
          <v-list-item>
            <acc-manager></acc-manager>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-menu transition="slide-y-transition" bottom offset-y>
        <template v-slot:activator="{ on }">
          <v-btn icon color="teal darken-2" class="home-icon-btn" v-on="on">
            <v-icon>account_circle</v-icon>
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item>
            <change-pass></change-pass>
          </v-list-item>
          <v-list-item v-if="CurUserDetails.CNTMST.CNTLDR == 'TL' && CurUserDetails.CNTMST.CNTDPT != 'IMG'">
            <back-track></back-track>
          </v-list-item>
          <v-list-item v-if="CurUserDetails.CNTMST.CNTLDR == 'ADMIN'">
            <user-manager></user-manager>
          </v-list-item>
          <v-list-item v-if="CurUserDetails.CNTMST.CNTLDR == 'ADMIN'">
            <customer-manager></customer-manager>
          </v-list-item>
          <v-list-item
            v-if="
              CurUserDetails.CNTMST.CNTDPT.substring(0, 3) == 'TSG' ||
              CurUserDetails.CNTMST.CNTDPT.substring(0, 3) == 'PMD' ||
              CurUserDetails.CNTMST.CNTSEC.includes('PS') ||
              CurUserDetails.CNTMST.CNTSEC.includes('IMS')
            "
          >
            <span @click="goTo">Service Calendar</span>
          </v-list-item>
          <v-list-item v-if="CurUserDetails.CNTMST.CNTDPT == 'COLLECTOR'">
            <span @click="goTo">Service Calendar</span>
          </v-list-item>
          <v-list-item v-if="CurUserDetails.CNTMST.CNTLDR == 'HEAD' && CurUserDetails.CNTMST.CNTDPT == 'BUVISMIN'">
            <span @click="goToViewer">Itinerary Viewer</span>
          </v-list-item>
          <v-list-item v-if="CurUserDetails.CNTMST.CNTLDR == 'HEAD' && CurUserDetails.CNTMST.CNTDPT == 'TSRVISMIN'">
            <span @click="goToViewer">Itinerary Viewer</span>
          </v-list-item>
          <v-list-item v-if="CurUserDetails.CNTMST.CNTLDR == 'HEAD' && CurUserDetails.CNTMST.CNTDPT == 'AHBU'">
            <span @click="goToViewer">Itinerary Viewer</span>
          </v-list-item>
          <v-list-item v-if="CurUserDetails.CNTMST.CNTLDR == 'HEAD' && CurUserDetails.CNTMST.CNTDPT == 'POCT'">
            <span @click="goToViewer">Itinerary Viewer</span>
          </v-list-item>
          <v-list-item v-if="CurUserDetails.CNTMST.CNTLDR == 'HEAD' && CurUserDetails.CNTMST.CNTDPT == 'POCT'">
            <span @click="goToPSCalendarViewer">PS Viewer</span>
          </v-list-item>
          <v-list-item v-if="CurUserDetails.CNTMST.CNTLDR == 'HEAD' && CurUserDetails.CNTMST.CNTDPT == 'TSGLUZON'">
            <span @click="goToServiceCalendarViewer">Calendar Viewer</span>
          </v-list-item>
          <v-list-item v-if="CurUserDetails.CNTMST.CNTLDR == 'HEAD' && CurUserDetails.CNTMST.CNTDPT == 'IMS'">
            <span @click="goToServiceCalendarViewer">Calendar Viewer</span>
          </v-list-item>
          <v-list-item v-if="CurUserDetails.CNTMST.CNTLDR == 'HEAD' && CurUserDetails.CNTMST.CNTDPT == 'COLLECTOR'">
            <span @click="goToServiceCalendarViewer">Calendar Viewer</span>
          </v-list-item>
          <v-list-item v-if="CurUserDetails.CNTMST.CNTLDR == 'HEAD' && CurUserDetails.CNTMST.CNTDPT == 'PMDLUZON'">
            <span @click="goToPSCalendarViewer">PS Viewer</span>
          </v-list-item>
          <v-list-item v-if="CurUserDetails.CNTMST.CNTLDR == 'HEAD' && CurUserDetails.CNTMST.CNTDPT == 'IMG'">
            <span @click="goToViewer">Itinerary Viewer</span>
          </v-list-item>
          <v-list-item v-if="CurUserDetails.CNTMST.CNTDPT && CurUserDetails.CNTMST.CNTDPT.includes('TSG')">
            <span @click="gotoSROutbox">Outbox</span>
          </v-list-item>
          <v-list-item v-if="CurUserDetails.CNTMST.CNTDPT && CurUserDetails.CNTMST.CNTDPT.includes('IMS')">
            <span @click="gotoSROutbox">Outbox</span>
          </v-list-item>
          <!-- <v-list-item>
            <service-card></service-card>
          </v-list-item> -->
          <v-list-item @click="logout()">
            <span class="v-list-item__title body-1">{{ 'Logout' }}</span>
          </v-list-item>
        </v-list>
      </v-menu>
      <template v-slot:extension>
        <div class="home-breadcrumbs">
          <bread-crumb></bread-crumb>
        </div>
      </template>
    </v-app-bar>
    <div id="helloElement"></div>
    <!-- <app-drawer v-model="drawer"></app-drawer> -->
    <div class="home-content">
      <router-view :key="$route.fullPath" />
    </div>
  </v-main>
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
import ItineraryForms from "@/components/ItineraryForms";

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
    ServiceCard,
    ItineraryForms
  },
  computed: {
    ...mapState(["CurClientDetails", "CurUserDetails"]),
    hasUserDetails() {
      return Boolean(this.CurUserDetails && this.CurUserDetails.USRDTL && this.CurUserDetails.CNTMST);
    },
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
    if (!this.hasUserDetails) return;

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
    if (!this.hasUserDetails) {
      this.getCurUserDetails();
    }
    if (!this.hasUserDetails) {
      this.logout();
      return;
    }

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
    ...mapActions(["getCurCheckInAcc", "getRecentVisit", "userGetPrivacy", "getCurUserDetails"]),
    ...mapMutations(["upCheckInAcc", "upRecentVisit"]),
    logout() {
      Cookies.remove("token", { path: "/" });
      Cookies.remove("user_details", { path: "/" });
      this.$router.replace({ name: "Login" });
    },
    goTo() {
      this.$router.push({ path: `/servicecalendar/${this.CurUserDetails.USRDTL.USRDCI}` });
    },
    goToViewer() {
      this.$router.push({ path: `/itineraryviewer` });
    },
    goToServiceCalendarViewer() {
      this.$router.push({ path: `/servicecalendarviewer` });
    },
    goToPSCalendarViewer() {
      this.$router.push({ path: `/pscalendarviewer` });
    },
    gotoSROutbox() {
      this.$router.push({ name: 'sroutbox' });
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
<style>
.home-main {
  min-height: 100vh;
}

.home-app-bar {
  border-bottom: 1px solid rgba(15, 76, 76, 0.1) !important;
  background: rgba(255, 255, 255, 0.94) !important;
  backdrop-filter: blur(12px);
}

.home-brand {
  align-items: center;
  cursor: pointer;
  display: flex;
  min-width: 150px;
}

.home-brand__title {
  color: #0f172a;
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.1;
}

.home-brand__subtitle {
  color: #64748b;
  font-size: 0.74rem;
  line-height: 1.2;
}

.home-search {
  flex: 1 1 640px;
  max-width: 760px;
  padding: 0 24px;
}

.home-icon-btn {
  background: rgba(15, 118, 110, 0.08);
  margin-left: 8px;
}

.home-breadcrumbs {
  align-items: center;
  display: flex;
  min-height: 38px;
  padding-left: 20px;
  width: 100%;
}

.home-content {
  min-height: calc(100vh - 110px);
  padding: 24px;
}

@media (max-width: 960px) {
  .home-search {
    max-width: none;
    padding: 0 12px;
  }
}

@media (max-width: 600px) {
  .home-app-bar {
    height: auto !important;
  }

  .home-brand {
    min-width: 0;
  }

  .home-search {
    flex-basis: 100%;
    order: 3;
    padding: 8px 0 0;
  }

  .home-content {
    padding: 16px;
  }
}
</style>
