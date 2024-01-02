<template>
  <v-layout wrap>
    <v-flex xs12 class="mb-3">
      <div id="printDiv">
        <span>
          <h1>{{ myDate }}</h1>
        </span>
        <v-flex sm4 xs12>
          <v-btn @click="$refs.calendar.prev()">
            <v-icon dark left>
              keyboard_arrow_left
            </v-icon>
            Prev
          </v-btn>
          <v-btn class="no-print" @click="printDiv('printDiv')" color="primary">Print</v-btn>
          <v-btn @click="$refs.calendar.next()">
            Next
            <v-icon right dark>
              keyboard_arrow_right
            </v-icon>
          </v-btn>
        </v-flex>
        <v-sheet height="500">
          <v-calendar ref="calendar" v-model="today" type="month" color="primary">
            <template v-slot:day="{ date }">
              <template v-for="event in eventsMap[date]">
                <v-menu :key="event.itimid" v-model="event.open" :close-on-content-click="false" full-width offset-x>
                  <template v-slot:activator="{ on }">
                    <div
                      :class="event.trdsts == 'START' ? 'my-event' : event.trdsts == 'WORK COMPLETE' ? 'my-event1' : 'my-event2'"
                      v-if="!event.time" v-ripple v-on="on">{{ event.client }}</div>
                  </template>
                  <v-card color="grey lighten-4" min-width="250px" max-width="350px" flat>
                    <v-toolbar color="primary" dark>
                      <v-toolbar-title>{{ event.title }}</v-toolbar-title>
                      <v-spacer></v-spacer>
                    </v-toolbar>
                    <v-card-title primary-title>
                      <v-flex xs12>
                        <p>
                          <span style="color:blue;font-weight:bold">Customer:</span>
                          {{ ' ' + event.customer }}
                        </p>
                      </v-flex>
                      <v-flex xs12 v-show="event.itiobj">
                        <p>
                          <span style="color:blue;font-weight:bold">Objective:</span>
                          {{ ' ' + event.itiobj }}
                        </p>
                      </v-flex>
                      <v-flex xs12>
                        <a :href="'https://www.google.com/maps?q=' + lat + ',' + long" target="_blank" color="success"><i>
                            <h5>Verify your location.</h5>
                          </i></a>
                      </v-flex>
                      <v-btn v-show="event.itists == '1'" @click="EndTravelValidation(event)" :disabled="enableStart"
                        color="primary">START</v-btn>
                      <v-btn color="primary" v-show="event.itists != '1'" @click="goToCustomer(event.accmid)">View</v-btn>
                      <v-progress-circular v-show="progValue" indeterminate color="primary"></v-progress-circular>
                    </v-card-title>
                    <v-card-actions>
                    </v-card-actions>
                  </v-card>
                </v-menu>
              </template>
            </template>
          </v-calendar>
        </v-sheet>
      </div>
    </v-flex>
    <v-speed-dial bottom right fixed transition="slide-x-reverse-transition" direction="top" class="mb-6 mr-0">
      <template v-slot:activator>
        <v-btn color="primary" dark fab>
          <v-icon>add</v-icon>
        </v-btn>
      </template>
      <itinerary-dialog></itinerary-dialog>
      <itinerary-travel v-show="CurUserDetails.CNTMST.CNTMGP == '1'"></itinerary-travel>
    </v-speed-dial>
  </v-layout>
</template>
<script>
import { mapActions, mapState, mapMutations } from "vuex";
import moment from "moment";
import ItineraryDialog from "../components/MRItineraryDialog.vue";
import ItineraryTravel from "../components/MedRepTravel.vue";
export default {
  components: {
    ItineraryDialog,
    ItineraryTravel,
  },
  data: () => ({
    menuOpenCLose: false,
    menu: false,
    today: moment(new Date()).format("YYYY-MM-DD"),
    lat: "",
    long: "",
    dialog: false,
    enableStart: false,
    progValue: false,
  }),
  computed: {
    ...mapState(["CurITIMSTList", "CurUserDetails", "CurClientDetails"]),
    eventsMap() {
      const map = {};
      this.CurITIMSTList.forEach((e) =>
        (map[e.date] = map[e.date] || []).push(e)
      );
      return map;
    },
    myDate() {
      return moment(this.today).format("MMMM YYYY");
    },
  },
  mounted() {
    this.dataReload();
    this.GetMyCoordinates();
  },
  methods: {
    ...mapActions([
      "getITIMSTPerCNT",
      "getTRDMST",
      "getITIMSTTRDValidation",
      "getTRLMSTOnGoing",
    ]),
    ...mapMutations(["upCurITIMSTList"]),
    open(event) {
      alert(event.title);
    },
    printDiv(divName) {
      var printContents = document.getElementById(divName).innerHTML;
      var originalContents = document.body.innerHTML;

      document.body.innerHTML = printContents;

      window.print();
      document.body.innerHTML = originalContents;
      location.reload();
    },
    dataReload() {
      this.getITIMSTPerCNT(this.CurUserDetails.USRDTL.USRDCI).then((res) => {
        this.upCurITIMSTList(res);
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
    goToCustomer(item) {
      this.$router.push({ path: `/customer/${item}` });
    },

    EndTravelValidation(item) {
      let userTemp = this.CurUserDetails.CNTMST;
      if (userTemp.CNTMGP == "1") {
        let dataTemp = JSON.stringify({
          TRLCDT: moment(new Date()).format("YYYY-MM-DD"),
          TRLCNT: this.CurUserDetails.CNTMST.CNTMID,
          TRLSTS: "1",
        });
        this.getTRLMSTOnGoing({ data: dataTemp })
          .then((res) => {
            if (res.status == 200) {
              this.StartItineraryValidation(item);
            } else if (res.status == 204) {
              alert("You Didn't Start your Travel.");
            }
          })
          .error((error) => {
            console.log(error);
          });
      } else {
        this.StartItineraryValidation(item);
      }
    },
    StartItineraryValidation(item) {
      this.progValue = true;
      if (this.lat == "") {
        alert("Location is Required!");
        this.enableStart = false;
      } else {
        let confirmAction = confirm("Start visit?");
        if (confirmAction) {
          this.enableStart = true;
          this.StartTTPItinerary(item);
          this.progValue = false;
        } else {
          alert("Action cancelled");
          this.enableStart = false;
          this.progValue = false;
        }
      }
    },
    StartTTPItinerary(item) {
      let data = JSON.stringify({
        UserID: this.CurUserDetails.USRDTL.USRDCI,
        customerRepID: item.cstmid,
        CustomerID: item.accmid,
        SRFormType: "Visit",
        TRDLOC: this.lat + " " + this.long,
        TRDITI: item.itimid,
        TRDADT: moment(new Date(), "ddd MMM DD YYYY kk:mm:SS").format(
          "YYYY/MM/DD HH:mm"
        ),
      });
      const Opheaders = {
        method: "POST",
        data: data,
        headers: {
          "content-type": "application/json",
        },
        url: "https://sr.mdmpi.com.ph/sr/MedRepItineraryReport/beginmedrepvisit",
      };
      axios(Opheaders)
        .then((res) => {
          if (res.status == 201) {
            this.dataReload();
            this.Sample(item);
            this.enableStart = false;
            this.progValue = false;
          } else if (res.status == 200) {
            if (res.data.message == "PENDING") {
              alert(
                "Your data has a record that is not yet approved or finalized. Please complete it before proceeding."
              );
            } else {
              alert("This Itinerary has already started.");
            }
            this.enableStart = false;
            this.progValue = false;
          }
        })
        .catch((error) => {
          alert(error);
          this.enableStart = false;
          this.progValue = false;
        });
    },
    Sample(item) {
      let dataTwo = JSON.stringify({
        RECEIVER: this.CurUserDetails.CNTMST.CNTTGP,
        SENDER: this.CurUserDetails.CNTMST.CNTMNN,
        MESSAGE: "Visited " + item.customer + " at " + item.client,
      });
      console.log(dataTwo, "sample");
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
};
</script>
<style scoped>
.my-event {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 2px;
  background-color: #1867c0;
  color: #ffffff;
  border: 1px solid #1867c0;
  width: 100%;
  font-size: 12px;
  padding: 3px;
  cursor: pointer;
  margin-bottom: 1px;
  inline-size: 100%;
  overflow-wrap: break-word;
}

.my-event1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 2px;
  background-color: #127509;
  color: #ffffff;
  border: 1px solid #1867c0;
  width: 100%;
  font-size: 12px;
  padding: 3px;
  cursor: pointer;
  margin-bottom: 1px;
  inline-size: 100%;
  overflow-wrap: break-word;
}

.my-event2 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 2px;
  background-color: #df0404;
  color: #ffffff;
  border: 1px solid #1867c0;
  width: 100%;
  font-size: 12px;
  padding: 3px;
  cursor: pointer;
  margin-bottom: 1px;
  inline-size: 100%;
  overflow-wrap: break-word;
}

@media print {
  .no-print {
    display: none;
  }
}
</style>
