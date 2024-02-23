<template>
  <!-- <v-content> -->
  <v-container fill-height>
    <v-layout justify-start>
      <v-flex xs12>
        <v-card>
          <v-toolbar color="grey lighten-4">
            <v-toolbar-title>Engineer of the Month</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout justify-center>
      <v-flex xs6>
        <v-card color="transparent" class="elevation-1">
          <v-toolbar color="grey lighten-4">
            <v-toolbar-title>Recent Visit</v-toolbar-title>
          </v-toolbar>
          <v-list one-line>
            <v-list-tile v-for="item in CurRecentVisit" :key="item.RCTCDT" @click="GoTo(item.RCTACC)">
              <v-list-tile-content>
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
        <v-alert type="error" icon="warning" transition="scale-transition">
        </v-alert>
      </v-flex>
    </v-layout>
  </v-container>
  <!-- </v-content> -->
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
