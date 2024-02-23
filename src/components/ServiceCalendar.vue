<template>
  <v-container>
    <v-layout app wrap id="printDiv">
      <v-flex xs12 class="ml-3 mr-3 mt-3">
        <span>
          <h4>MARSMAN DRYSDALE MEDICAL PRODUCT INC.</h4>
          <h4>EXPENSE REPORT</h4>
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
          <v-flex sm1 md1 xs12>
            <v-btn class="primary no-print" @click="dialogOpen">Add Data</v-btn>
          </v-flex>
          <v-flex sm1 md1 xs12>
            <v-btn class="primary no-print" @click="workWithDialogOpen">Work With</v-btn>
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
                    <div v-show="event.trdmde != ''" class="my-event2" v-if="!event.time" v-ripple v-on="on"
                      v-for="(text, index) in event.trdmde.split('|')" :key="index">
                      {{ text }}
                    </div>
                  </template>
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
export default {
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
    }
  },
  methods: {
    ...mapActions(["getServiceCalendar", "getThreadDetailsByTRDMID"]),
    ...mapMutations(["upCurServiceCalendar"]),
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
      this.getServiceCalendar({
        cntmid: this.$route.params.CNTMID,
        data: {
          itidteFrom: this.datefrom,
          itidteTo: this.dateto,
        },
      }).then((res) => {
        this.upCurServiceCalendar(res);
      });
    },
    dialogOpen() {
      this.DataDialog = true;
      localStorage.removeItem("mydata");
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
    