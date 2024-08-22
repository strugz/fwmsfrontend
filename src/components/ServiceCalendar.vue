<template>
  <v-container>
    <v-layout app wrap id="printDiv">
      <v-flex xs12 class="ml-3 mr-3 mt-3">
        <span>
          <h4>MARSMAN DRYSDALE MEDICAL PRODUCT INC.</h4>
          <h4>CALENDAR PLANNER</h4>
        </span>
        <span>
          <h3>{{ myDate }}</h3>
        </span>
        <v-layout row wrap>
          <v-flex sm2 md2 xs12>
            <v-text-field v-model="datefrom" class="no-print ml-2" type="date" label="From"></v-text-field>
          </v-flex>
          <v-flex sm2 md2 xs12>
            <v-text-field v-model="dateto" class="no-print ml-2" type="date" label="To"></v-text-field>
          </v-flex>
          <v-flex sm1 md1 xs12>
            <v-btn class="no-print primary" @click="dataReload()">Load</v-btn>
          </v-flex>
          <v-flex sm2 md2 xs12>
            <itinerary-dialog></itinerary-dialog>
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex sm1 md1 xs12>
            <v-btn class="primary no-print" @click="dialogOpen">Add Data</v-btn>
          </v-flex>
          <v-flex sm1 md1 xs12 class="ml-2">
            <v-btn class="primary no-print " @click="workWithDialogOpen">Work With</v-btn>
          </v-flex>
          <v-flex sm1 md1 xs12 class="ml-4">
            <v-btn class="red no-print" @click="removeCalendarData">Remove Data</v-btn>
          </v-flex>
        </v-layout>
        <v-flex sm3 md3 xs12>
          <v-btn class="no-print" @click="$refs.calendar.prev()">
            <v-icon dark left>
              keyboard_arrow_left
            </v-icon>
            Prev
          </v-btn>
          <v-btn class="no-print" @click="$refs.calendar.next()">
            Next
            <v-icon right dark>
              keyboard_arrow_right
            </v-icon>
          </v-btn>
          <v-btn class="no-print" @click="printDiv('printDiv')" color="primary">Print</v-btn>
        </v-flex>
        <v-sheet height="800" class="my-event3">
          <v-calendar ref="calendar" v-model="today" type="month" color="primary">
            <template v-slot:day="{ date }">
              <template v-for="event in eventsMap[date]">
                <v-menu :key="event.trdmti" v-model="event.open" :close-on-content-click="false" full-width offset-x>
                  <template v-slot:activator="{ on }">
                    <div class="my-event1" v-if="!event.time" v-ripple v-on="on">
                      {{ event.client }}
                    </div>
                    <div v-show="event.trdmde != '' && event.trdsts != 'SCHEDULED'" class="my-event2" v-if="!event.time"
                      v-ripple v-on="on" v-for="(text, index) in event.trdmde.split('|')" :key="index">
                      {{ text }}
                    </div>
                    <div v-show="event.trdmde == '' && event.trdsts == 'SCHEDULED'" class="my-event2" v-ripple v-on="on">
                      {{ event.trdsts + ":" }}
                      {{ event.itiobj }}
                    </div>
                  </template>
                  <!-- Wrapping UP the END Service -->
                  <v-layout wrap row>
                    <v-card v-show="event.trdsts == 'SCHEDULED'" color="grey lighten-4" min-width="250px"
                      max-width="350px" flat>
                      <v-toolbar color="primary" dark>
                        <v-toolbar-title>{{ event.title }}</v-toolbar-title>
                        <v-spacer></v-spacer>
                      </v-toolbar>
                      <v-card-title primary-title>
                        <v-flex xs12 v-show="event.itiobj">
                          <p>
                            <span style="color:blue;font-weight:bold">Instrument:</span>
                            {{ ' ' + event.itiins }}
                          </p>
                        </v-flex>
                        <v-flex xs12>
                          <a :href="'https://www.google.com/maps?q=' + lat + ',' + long" target="_blank"
                            color="success"><i>
                              <h5>Verify your location.</h5>
                            </i></a>
                        </v-flex>
                        <v-btn v-show="event.itists == '1'" @click="InsertCheckInStartServiceValidation(event)"
                          :disabled="enableStart" color="primary">START</v-btn>
                        <v-btn v-show="event.itists == '1'" :disabled="enableStart" color="primary"
                          @click="InsertServiceLocationLogs(event)">CHECK-IN</v-btn>
                        <v-btn color="primary" v-show="event.itists != '1'"
                          @click="goToCustomer(event.accmid)">View</v-btn>
                      </v-card-title>
                      <v-card-actions>
                      </v-card-actions>
                    </v-card>
                  </v-layout>

                </v-menu>
              </template>
            </template>
          </v-calendar>
        </v-sheet>
      </v-flex>
      <v-footer app fixed class="mb-2 mr-2 ml-2">
        <span>
          <h4>PREPARED BY{{ ": " + CurUserDetails.CNTMST.CNTMCN }}</h4>
        </span>
        <v-spacer></v-spacer>
        <h4>Noted By:</h4>
        <h4>{{ CurUserDetails.CNTMST.CNTMSF }} ___________________</h4>
        <h4>{{ CurUserDetails.CNTMST.CNTMBD }} ___________________</h4>
      </v-footer>
      <v-dialog v-model="DataDialog" width="500">
        <v-toolbar class="primary" dark>
          <v-toolbar-title>Add Data</v-toolbar-title>
        </v-toolbar>
        <v-card>
          <v-card-text>
            <v-flex xs12>
              <v-text-field v-model="mDate" type="date">Date</v-text-field>
              <v-text-field v-model="client">Text</v-text-field>
            </v-flex>
            <v-flex xs12>
              <v-btn class="primary" dark flat @click="addData">Add</v-btn>
            </v-flex>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-dialog v-model="WorkWithDialog" width="500">
        <v-toolbar class="primary" dark>
          <v-toolbar-title>Add Work With</v-toolbar-title>
        </v-toolbar>
        <v-card>
          <v-card-text>
            <v-flex xs12>
              <v-text-field v-model="SRNumber" label="Service Number"></v-text-field>
            </v-flex>
            <v-flex xs12>
              <v-btn class="primary" dark flat @click="addDataWorkWith">Add</v-btn>
            </v-flex>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-layout>
  </v-container>
</template>
<script>
import { mapActions, mapState, mapMutations } from "vuex";
import moment from "moment";
import ItineraryDialog from "../components/SRItineraryDialog.vue";
export default {
  components: {
    ItineraryDialog
  },
  data: () => ({
    menuOpenCLose: false,
    menu: false,
    today: moment(new Date()).format("YYYY-MM-DD"),
    lat: "",
    long: "",
    dialog: false,
    enableStart: false,
    datefrom: "",
    dateto: "",
    DataDialog: false,
    client: "",
    mDate: "",
    WorkWithDialog: false,
    SRNumber: "",
    lat: "",
    long: "",
    serialNumber: "",
    textGroup: "",
    userInitial: "",
    serviceLocLogID: ""
  }),
  computed: {
    ...mapState(["CurServiceCalendar", "CurUserDetails"]),
    eventsMap() {
      const map = {};
      this.CurServiceCalendar.forEach((e) =>
        (map[e.date] = map[e.date] || []).push(e)
      );
      return map;
    },
    myDate() {
      return moment(this.today).format("MMMM YYYY");
    },
  },
  mounted() {
    if (localStorage.mydata != undefined) {
      this.upCurServiceCalendar(JSON.parse(localStorage.mydata).myCalendar);
      this.datefrom = JSON.parse(localStorage.mydata).myCalendarDateFrom;
      this.dateto = JSON.parse(localStorage.mydata).myCalendarDateTo;
    }
    this.GetMyCoordinates();
  },
  methods: {
    ...mapActions(["getServiceCalendar", "getThreadDetailsByTRDMID"]),
    ...mapMutations(["upCurServiceCalendar"]),
    goToCustomer(item) {
      this.$router.push({ path: `/customer/${item}` });
    },
    InsertServiceLocationLogs(event) {
      let data = JSON.stringify({
        ServiceLocLogAction: "CheckIn",
        CustomerID: event.accmid,
        UserID: this.CurUserDetails.CNTMST.CNTMID,
      });
      const Opheaders = {
        method: "POST",
        data: data,
        headers: {
          "content-type": "application/json",
        },
        url: "https://sr.mdmpi.com.ph/sr/servicelocationlog/login",
      };
      axios(Opheaders)
        .then((res) => {
          if (res.status == 201) {
            let d = res.data;
            this.Sample(event.client);
            alert(
              "Checked - In at " +
              event.client +
              " on " +
              d.serviceLocLogDateTime
            );
            this.serviceLocLogID = d.serviceLocLogID;
          }
          if (res.status == 200) {
            alert("Already Check-In");
          }
        })
        .catch((error) => {
          alert(error);
        });
    },
    Sample(client) {
      let userInit = this.CurUserDetails.CNTMST;
      this.userInitial = userInit.CNTMNN;
      this.textGroup = userInit.CNTTGP;
      if (this.textGroup == "IMS") {
        this.textGroup = "IMST";
      }
      let dataTwo = JSON.stringify({
        RECEIVER: this.textGroup,
        SENDER: this.userInitial,
        MESSAGE: "Check-In at " + client,
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
          console.log(res);
        }
      });
    },
    InsertCheckInStartServiceValidation(event) {
      const str = event.itiins;
      const regex = /\(SN: (\d+)\)/;
      const match = str.match(regex);

      if (match) {
        this.serialNumber = match[1];
        this.InsertCheckInStartService(event);
      } else {
        alert("Serial number not found");
      }
    },
    InsertCheckInStartService(event) {
      let itemPOVSelectTemp = [];
      if (event.itiobj.includes("Monthly Maintenance")) {
        itemPOVSelectTemp.push({
          PVID: 5,
          PVDescription: "Monthly Maintenance",
          PVRemarks: ""
        });
      }
      if (event.itiobj.includes("Preventive Maintenance")) {
        itemPOVSelectTemp.push({
          PVID: 6,
          PVDescription: "Preventive Maintenance",
          PVRemarks: ""
        });
      }
      let data = JSON.stringify({
        UserID: this.CurUserDetails.CNTMST.CNTMID,
        InstrumentModelID: event.itiins,
        InstrumentSerialNumber: this.serialNumber,
        CustomerID: event.accmid,
        SRFormType: 'Field',
        SRTImerAction: "Start",
        SRTRemarks: "",
        serviceLocLogID: "<EDIT>",
        TRDADT: moment(new Date(), "ddd MMM DD YYYY kk:mm:SS").format(
          "YYYY/MM/DD HH:mm"
        ),
        TRDLOC: this.lat + " " + this.long,
        POV: itemPOVSelectTemp,
        TRDMTY: "Service Report",
        TRDITISVC: event.itimid
      });
      const Opheaders = {
        method: "POST",
        data: data,
        headers: {
          "content-type": "application/json",
        },
        url: "https://sr.mdmpi.com.ph/sr/srtimer/beginservice",
      };
      axios(Opheaders)
        .then((res) => {
          if (res.status == 201) {
            this.enableStart = true;
            this.dataReload();
          }
          if (res.data.message == "NOTCHECKIN or ALREADY START SERVICE") {
            alert("NOTCHECKIN or ALREADY START SERVICE")
          }
        })
        .catch((error) => {
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
    open(event) {
      alert(event.title);
    },
    printDiv(divName) {
      let calendar = JSON.stringify({
        myCalendar: this.CurServiceCalendar,
        myCalendarDateFrom: this.datefrom,
        myCalendarDateTo: this.dateto
      });
      localStorage.mydata = calendar;

      var printContents = document.getElementById(divName).innerHTML;
      var originalContents = document.body.innerHTML;

      document.body.innerHTML = printContents;

      window.print();
      document.body.innerHTML = originalContents;
      location.reload();
    },
    dataReload() {
      this.getServiceCalendar({
        cntmid: this.$route.params.CNTMID,
        data: {
          itidteFrom: this.datefrom,
          itidteTo: this.dateto,
        },
      }).then((res) => {
        this.upCurServiceCalendar(res);
        let calendar = JSON.stringify({
        myCalendar: res,
        myCalendarDateFrom: this.datefrom,
        myCalendarDateTo: this.dateto
      });
      localStorage.mydata = calendar;
        console.log(res);
      });
    
    },
    dialogOpen() {
      this.DataDialog = true;
    },
    removeCalendarData() {
      localStorage.removeItem("mydata");
      location.reload();
    },
    addData() {
      this.CurServiceCalendar.push({
        accmid: moment(new Date()).format("YYYYMMDDHHmmss"),
        agenda: "",
        client: this.client,
        cstmid: "",
        customer: "",
        date: moment(new Date(this.mDate)).format("YYYY-MM-DD"),
        itimid: "",
        itiobj: "",
        itists: "",
        open: false,
        title: "Service",
        trdmde: "",
        trdmti: "",
        trdsts: "",
      });
      let calendar = JSON.stringify({
        myCalendar: this.CurServiceCalendar,
        myCalendarDateFrom: this.datefrom,
        myCalendarDateTo: this.dateto
      });
      localStorage.mydata = calendar;
    },
    workWithDialogOpen() {
      this.WorkWithDialog = true;
    },
    addDataWorkWith() {
      this.getThreadDetailsByTRDMID(this.SRNumber).then((res) => {
        if (res.status == 200) {
          this.CurServiceCalendar.push({
            accmid: res.data.TRDMAC,
            agenda: "",
            client: res.data.trdmacid.ACCMSC,
            cstmid: "",
            customer: "",
            date: moment(new Date(res.data.TRDADT)).format("YYYY-MM-DD"),
            itimid: "",
            itiobj: "",
            itists: "",
            open: false,
            title: "Service",
            trdmde:
              "SR# " +
              res.data.TRDMTT +
              " " +
              res.data.TRDMCD +
              "-" +
              res.data.TRDUPD +
              " " +
              res.data.TRDMDE,
            trdmti: "",
            trdsts: "",
          });
          let calendar = JSON.stringify({
            myCalendar: this.CurServiceCalendar,
            myCalendarDateFrom: this.datefrom,
            myCalendarDateTo: this.dateto
          });
          localStorage.mydata = calendar;
        }
      });
    },
  },
};
</script>
<style scoped>
.my-event1 {
  border-radius: 2px;
  color: #000000;
  border: 1px solid #1867c0;
  width: 100%;
  font-size: 10px;
}

.my-event2 {
  border-radius: 2px;
  color: #000000;
  border: 1px solid #f1cc52;
  width: 100%;
  font-size: 8px;
}

.my-event3 {
  border-color: red;
  border: 2px solid;
}

@media print {
  .no-print {
    display: none;
  }
}
</style>
    