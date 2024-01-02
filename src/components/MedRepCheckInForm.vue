<template>
  <v-layout
    mt-0
    row
    justify-center
  >
    <v-dialog
      width="500"
      v-model="dialog"
      hide-overlay
      persistent
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
          Create MedRep Visit
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
          <v-toolbar-title>Start Itinerary</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
            icon
            @click="dialog = !dialog"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-layout
            row
            justify-center
          >
            <v-flex xs6>
              <v-combobox
                :items="customerRepItems"
                v-model="customerRepSelected"
                item-text="CSTNME"
                item-value="CSTMID"
                label="Customer Representative"
                class="mt-5"
              ></v-combobox>
            </v-flex>
          </v-layout>
          <v-layout
            row
            justify-center
          >
            <v-flex
              xs6
              text-xs-center
            >
              <v-btn @click="StartTTPItinerary">Start Visit</v-btn>
            </v-flex>
          </v-layout>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
<script>
import { mapActions, mapMutations, mapState } from "vuex";
import moment from "moment";
export default {
  data() {
    return {
      dialog: false,
      customerRepItems: [],
      customerRepSelected: "",
      lat: "",
      long: "",
    };
  },
  created() {
    this.GetMyCoordinates();
    this.getCSTMSTPerAcc({ accmid: this.$route.params.ACCMID, cntmid: this.CurUserDetails.USRDTL.USRDCI }).then((res) => {
      this.customerRepItems = res.data;
    });
    console.log(this.CurClientDetails.ACCMNM);
  },
  watch: {
    dialog() {
      if (this.dialog == false) {
        this.$router.push({
          path: `/customer/${this.CurClientDetails.ACCMID}`,
        });
      }
    },
  },
  computed: {
    ...mapState(["CurUserDetails", "CurClientDetails", "CurThreads"]),
  },
  methods: {
    ...mapActions(["getCSTMSTPerAcc", "getTRDMST", "msgListener"]),
    ...mapMutations(["pushCurThreads"]),
    GetMyCoordinates() {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.lat = position.coords.latitude;
          this.long = position.coords.longitude;
          console.log(this.lat, this.long);
        },
        (error) => {
          console.log(error.message);
        }
      );
    },

    StartTTPItinerary() {
      let data = JSON.stringify({
        UserID: this.CurUserDetails.USRDTL.USRDCI,
        customerRepID: this.customerRepSelected.CSTMID,
        CustomerID: this.$route.params.ACCMID,
        SRFormType: "Visit",
      });
      const Opheaders = {
        method: "POST",
        data: data,
        headers: {
          "content-type": "application/json",
        },
        url: "https://sr.mdmpi.com.ph/sr/MedRepItineraryReport/beginmedrepvisit",
        // url: "https://sr.mdmpi.com.ph/sr/medrepitineraryreport/beginmedrepvisit",
      };

      axios(Opheaders)
        .then((res) => {
          if (res.status == 201) {
            const iData = res.data;
            this.StartItinerary(iData.srid);
          }
        })
        .catch((error) => {
          alert(error);
        });
    },
    StartItinerary(srid) {
      this.GetMyCoordinates();

      let data = JSON.stringify({
        TRDADT: moment(new Date(), "ddd MMM DD YYYY kk:mm:SS").format(
          "YYYY/MM/DD HH:mm"
        ),
        TRDCNT: "0",
        TRDMAC: this.$route.params.ACCMID,
        TRDMCL: "N/A",
        TRDMDE: this.customerRepSelected.CSTMID,
        TRDMMC: "",
        TRDMST: "true",
        TRDMTT: srid,
        TRDMTY: "MedRep Visit",
        TRDMUI: this.CurUserDetails.USRDTL.USRDCI,
        TRDSEC: "Itinerary",
        TRDSTS: "START",
        TRDCRN: "",
        TRDLOC: this.lat + " " + this.long,
      });
      setTimeout(function () {
        console.log(data);
      }, 1000);

      this.getTRDMST({ data: data }).then((res) => {
        this.Sample(res.data);
      });
    },
    Sample(data) {
      let dataTwo = JSON.stringify({
        RECEIVER: this.CurUserDetails.CNTMST.CNTTGP,
        SENDER: this.CurUserDetails.CNTMST.CNTMNN,
        MESSAGE:
          "Visited " +
          this.customerRepSelected.CSTNME +
          " at " +
          this.CurClientDetails.ACCMNM,
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
          this.pushCurThreads(data);
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
