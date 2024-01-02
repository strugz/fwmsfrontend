<template>
  <v-layout
    mt-0
    row
    justify-center
  >
    <v-dialog
      v-model="dialog"
      width="500"
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
          Travel
        </v-btn>
      </template>
      <v-flex xs12>
        <v-card
          color="grey lighten-4"
          min-width="350px"
          flat
          class="mt-0"
          justify-center
        >
          <v-toolbar
            color="primary"
            dark
          >
            <v-toolbar-title>Travel</v-toolbar-title>
          </v-toolbar>
          <v-card-actions class="justify-center">
            <a
              :href="'https://www.google.com/maps?q=' + lat + ',' + long"
              target="_blank"
              color="success"
            ><i>
                <h5>Verify your location.</h5>
              </i></a>
          </v-card-actions>
          <v-card-actions class="justify-center">
            <v-btn
              color="primary"
              class="text-center"
              @click="startTravel"
            >Start Travel</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-dialog>
  </v-layout>
</template>
    <script>
import moment from "moment";
import { mapActions, mapState } from "vuex";
export default {
  data() {
    return {
      dialog: false,
      datetime: moment(new Date()).format("YYYY-MM-DD"),
      lat: "",
      long: "",
    };
  },
  mounted() {
    this.GetMyCoordinates();
  },
  computed: {
    ...mapState(["CurUserDetails"]),
  },
  methods: {
    ...mapActions(["getTRLMSTOnGoing", "InsertTRLMST"]),
    startTravel() {
      let dataTemp = JSON.stringify({
        TRLCDT: moment(new Date()).format("YYYY-MM-DD"),
        TRLCNT: this.CurUserDetails.CNTMST.CNTMID,
        TRLSTS: "1",
      });
      this.getTRLMSTOnGoing({ data: dataTemp })
        .then((res) => {
          if (res.status == 204) {
            let tempData = JSON.stringify({
              TRLLOC: this.lat + " " + this.long,
              TRLCNT: this.CurUserDetails.CNTMST.CNTMID,
            });
            this.InsertTRLMST({ data: tempData })
              .then((res) => {
                if (res.status == 200) {
                  this.dialog = false;
                }
              })
              .error((error) => {
                alert(error);
              });
          } else if (res.status == 200) {
            alert("Already Started the Travel.");
          }
        })
        .error((error) => {
          alert(error);
        });
    },
    GetMyCoordinates() {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.lat = position.coords.latitude;
          this.long = position.coords.longitude;
        },
        (error) => {
          alert(error.message);
        }
      );
    },
  },
  props: {
    type: {
      type: String,
      default: "",
    },
  },
};
</script>
<style scoped>
.align-center {
  justify-content: center;
  align-items: center;
}
</style>
