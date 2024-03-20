<template>
  <v-container fill-height>
    <v-layout justify-center>
      <v-flex xs12 xl4 md5>
        <v-card class="myCard">
          <v-toolbar class="toolbarStyle" color="grey lighten-4">
            <v-toolbar-title>
              <span class="mySpan">Recent Visit</span>
            </v-toolbar-title>
          </v-toolbar>
          <v-list one-line>
            <v-list-tile class="myList" v-for="item in CurRecentVisit" :key="item.RCTCDT" @click="GoTo(item.RCTACC)">
              <v-list-tile-content class="myvlist">
                <v-list-tile-title>
                  <span class="blue lighten-4">{{ item.ACCMNM }}</span>
                </v-list-tile-title>
                <v-list-tile-sub-title>{{ item.RCTCDT }}</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
          <v-flex xs12 v-if="CurUserDetails.CNTMST.CNTSEC == 'TSR/PS'">
            <v-btn class="primary" @click="ValidationItinerary">Go To Itinerary</v-btn>
          </v-flex>
          <v-flex xs12 v-if="CurUserDetails.CNTMST.CNTSEC == 'TSR/ENGINEER'">
            <v-btn class="primary" @click="ValidationItinerary">Go To Itinerary</v-btn>
          </v-flex>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import { mapState, mapMutations, mapActions } from "vuex";
import moment from "moment";
export default {
  data() {
    return {
      currentDate: new Date().toJSON().slice(0, 10).replace(/-/g, "/"),
      today: "",
      yesterday: "",
      weekAgo: "",
    };
  },
  computed: {
    ...mapState(["CurRecentVisit", "CurUserDetails"]),
  },
  mounted() {
    this.getYesterdayDate();
    this.getTodayDate();
  },
  methods: {
    ...mapActions(["getAcc"]),
    ...mapMutations(["upClient"]),
    getYesterdayDate() {
      var date = new Date();
      date.setDate(date.getDate() - 1);
      date = date.toJSON().slice(0, 10).replace(/-/g, "/");
      this.yesterday = moment(date).format("MM/DD/YYYY");
    },
    getTodayDate() {
      var date = new Date();
      date = date.toJSON().slice(0, 10).replace(/-/g, "/");
      this.today = moment(date).format("MM/DD/YYYY");
      console.log(this.today);
    },
    GoTo(accmid) {

      this.getAcc(accmid).then(
        (res) => {
          this.upClient(res.data);
        },
        (error) => {
          console.error(error);
        }
      );
      this.$router.push({ path: `/customer/${accmid}` });
    },
    ValidationItinerary() {
      this.$router.push({
        name: "mritinerary",
        params: { CNTMID: this.CurUserDetails.USRDTL.USRDCI },
      });
    },
  },
};
</script>
<style>
.toolbarStyle {
  background-image: -webkit-linear-gradient(green, lightgrey);
}

.myCard {
  border-end-start-radius: 10%;
  border-end-end-radius: 10%;
  height: 100%;
  width: 100%;
}

.tile-title {
  border-radius: 50%;
}


.myList {
  display: flex;
  justify-content: center;
}

.myList:hover {
  transition: all 300ms;
  transform: scale(1.3);
}
</style>
