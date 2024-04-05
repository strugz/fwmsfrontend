<template>
  <v-layout mt-0 row justify-center>
    <v-dialog width="500" v-model="dialog" hide-overlay persistent>
      <template v-slot:activator="{ on }">
        <v-btn v-if="type == 'icon'" small icon flat round dark color="teal" v-on="on">
          <v-icon color="white lighten-1">timer_off</v-icon>
        </v-btn>
        <v-btn v-else small round dark color="teal" v-on="on">
          Collection
        </v-btn>
      </template>
      <v-card>
        <v-toolbar absolute color="primary" dense dark scroll-off-screen scroll-target="#scrolling-techniques">
          <v-toolbar-title>Collection Visit</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="dialog = !dialog">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-title>
          <v-flex xs12>
            <v-combobox class="myButton mt-5" v-model="itemPOV" :items="CollectorPOVList" item-value="PVID"
              item-text="PVDescription" label="Purpose of Visit" multiple outlined dense auto-select-first></v-combobox>
          </v-flex>
          <v-flex xs12 class="myButton">
            <a :href="'https://www.google.com/maps?q=' + lat + ',' + long" target="_blank" color="success"><i>
                <h5>Verify your location.</h5>
              </i></a>
          </v-flex>
          <v-flex xs12>
            <v-btn @click="LocationValidation" class="myButton" color="primary">Start</v-btn>
          </v-flex>
        </v-card-title>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
<script>
import { mapActions, mapMutations, mapState } from "vuex";
export default {
  data() {
    return {
      dialog: false,
      itemPOV: [],
      itemPOVTemp: [],
      lat: "",
      long: "",
    };
  },
  created() {
    this.GetCollectorsPOV();
    this.GetMyCoordinates();
  },
  watch: {},
  computed: {
    ...mapState(["CurUserDetails", "CurClientDetails", "CollectorPOVList"])
  },
  methods: {
    ...mapActions(["InsertStartCollection", "getPOV"]),
    ...mapMutations(["upCollectorPOVList"]),
    GetMyCoordinates() {
      this.lat = "";
      this.long = "";
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.lat = position.coords.latitude;
          this.long = position.coords.longitude;
        },
        (error) => {
          alert(error.message);
        }
      );
      console.log(this.lat + " " + this.long);
    },
    LocationValidation() {
      let val = "1";
      if (this.lat == "") {
        val = "0";
        alert("Location is Not Detected!");
      }
      if (this.itemPOV.length == 0) {
        val = "0";
        alert("Purpose of Visit is Empty!")
      }
      if (val == "1") {
        this.StartCollection();
      }
    },
    StartCollection() {
      let Collection = JSON.stringify({
        userID: this.CurUserDetails.CNTMST.CNTMID,
        CustomerID: this.CurClientDetails.ACCMID,
        SRFormType: "COLLECT",
        pov: this.itemPOV
      });
      this.InsertStartCollection({ data: Collection }).then(res => {
        if (res == 201) {
          this.Sample();
        }
      })
        .catch((error) => {
          alert(error);
        });
    },
    GetCollectorsPOV() {
      this.getPOV(this.CurUserDetails.CNTMST.CNTDPT).then(
        res => {
          res.data.forEach(x => {
            this.itemPOVTemp.push({
              PVID: Number(x.drpiid),
              PVDescription: x.drpval,
              PVRemarks: "",
            });
          });
          this.upCollectorPOVList(this.itemPOVTemp);
        }
      )
    },
    Sample() {
      let POV = "";
      this.itemPOV.forEach(x => {
        POV = POV == "" ? x.PVDescription : POV + " and " + x.PVDescription;
      });
      let dataTwo = JSON.stringify({
        RECEIVER: this.CurUserDetails.CNTMST.CNTTGP,
        SENDER: this.CurUserDetails.CNTMST.CNTMNN,
        MESSAGE: "Visiting " + this.CurClientDetails.ACCMNM + " to do " + POV,
      });
      const OpheadersTwo = {
        method: "POST",
        data: dataTwo,
        headers: {
          "content-type": "application/json",
          accept: "*/*",
          "accept-Encoding": "gzip, deflate, br",
          connection: "keep-alive",
          "sec-fetch-mode": "no-cors",
        },
        url: "https://mdmpi.com.ph/lasius/api_sendsms",
      };
      axios(OpheadersTwo).then((res) => {
        if (res.status == 200) {
          this.dialog = false;
        }
      });
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
<style>
.myButton {
  text-align: center;
  margin: 0 auto;
  display: flex;
  justify-content: center;
}
</style>
