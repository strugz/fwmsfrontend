<template>
  <v-layout mt-0 row justify-center>
    <v-dialog v-model="dialog" width="500" persistent transition="dialog-bottom-transition">
      <template v-slot:activator="{ on }">
        <v-btn v-if="type == 'icon'" small icon flat round dark color="teal" v-on="on">
          <v-icon color="white lighten-1">timer_off</v-icon>
        </v-btn>
        <v-btn v-else small round dark color="teal" v-on="on">
          Visit
        </v-btn>
      </template>
      <v-flex xs12>
        <v-card color="grey lighten-4" min-width="350px" flat class="mt-0">
          <v-toolbar color="primary" dark>
            <v-toolbar-title>Itinerary</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
          <v-card-title primary-title>
            <v-flex xs12>
              <v-combobox v-model="clientSelected" label="Client" :items="CurClientList" item-text="ACCMNM"
                item-value="ACCMID" hide-details @change="getCustomer"></v-combobox>
            </v-flex>
            <v-flex xs12>
              <v-combobox v-model="customerSelected" :items="CurCSTMSTList" item-text="CSTNME" item-value="CSTMID"
                hide-details label="Customer"></v-combobox>
            </v-flex>
            <v-flex xs12>
              <v-select v-model="TSRObjectiveSelected" :items="TSRObjectiveList" item-text="ObjectiveName"
                item-value="ObjectiveName" hide-details multiple no-data-text label="Objective"
                @change="ObjectiveSelectedItems"></v-select>
            </v-flex>
            <v-flex xs12 v-if="TSRObjectiveSelected.includes('Others')">
              <v-text-field v-model="TSRObjectiveSelectOthers" label="Please specify Others"></v-text-field>
            </v-flex>
            <v-flex xs12 lg6>
              <v-menu ref="menu1" v-model="menu1" :close-on-content-click="false" :nudge-right="40" lazy
                transition="scale-transition" offset-y full-width max-width="290px" min-width="290px">
                <template v-slot:activator="{ on }">
                  <v-text-field v-model="dateFormatted" label="Visit Date" hint="MM/DD/YYYY format" persistent-hint
                    prepend-icon="event" @blur="date = parseDate(dateFormatted)" v-on="on"></v-text-field>
                </template>
                <v-date-picker v-model="date" no-title @input="menu1 = false"></v-date-picker>
              </v-menu>
            </v-flex>
          </v-card-title>
          <v-card-actions>
            <v-btn color="primary" :disabled="enableStart" @click="SaveItineraryValidation">Save</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="dialog = false">
              Cancel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-dialog>
  </v-layout>
</template>
<script>
import { stringify } from "querystring";
import { mapActions, mapMutations, mapState } from "vuex";
export default {
  data() {
    return {
      dialog: false,
      clientSelected: [],
      customerSelected: [],
      date: new Date().toISOString().substr(0, 10),
      dateFormatted: this.formatDate(new Date().toISOString().substr(0, 10)),
      menu1: false,
      TSRObjectiveSelectOthers: "",
      TSRObjectiveSelected: [],
      TSRObjectiveList: [
        { ID: 1, ObjectiveName: "Prospecting" },
        { ID: 2, ObjectiveName: "OCC" },
        { ID: 3, ObjectiveName: "Quotation" },
        { ID: 4, ObjectiveName: "Pre-Procurement" },
        { ID: 5, ObjectiveName: "Pre-Bid" },
        { ID: 6, ObjectiveName: "Pre-Qualification Demo" },
        { ID: 7, ObjectiveName: "Product Presentation" },
        { ID: 8, ObjectiveName: "Demo – Evaluation" },
        { ID: 9, ObjectiveName: "Bidding" },
        { ID: 10, ObjectiveName: "Negotiation" },
        { ID: 11, ObjectiveName: "Post-Qualification Demo" },
        { ID: 12, ObjectiveName: "Contract Signing" },
        { ID: 13, ObjectiveName: "NOA" },
        { ID: 14, ObjectiveName: "NTP/WON" },
        { ID: 15, ObjectiveName: "Contract Signed" },
        { ID: 16, ObjectiveName: "Installation" },
        { ID: 17, ObjectiveName: "P.O." },
        { ID: 18, ObjectiveName: "Others" },
      ],
      enableStart: false,
    };
  },
  mounted() {
    this.getCSTMSTcntacc({ cntmid: this.CurUserDetails.USRDTL.USRDCI }).then(
      (res) => {
        this.upAllClient(res.data);
      }
    );
  },
  watch: {
    date(val) {
      this.dateFormatted = this.formatDate(this.date);
    },
  },
  computed: {
    ...mapState([
      "CurClientList",
      "CurCSTMSTList",
      "CurUserDetails",
      "CurITIMSTList",
    ]),
    computedDateFormatted() {
      return this.formatDate(this.date);
    },
  },
  methods: {
    ...mapActions([
      "getAllAcc",
      "getCSTMSTPerAcc",
      "insertITIMST",
      "getCSTMSTcntacc",
      "getITIMSTValidation",
    ]),
    ...mapMutations(["upAllClient", "upCSTMSTList", "upCurITIMSTListUpdate"]),
    getCustomer(item) {
      this.upCSTMSTList([]);
      this.customerSelected = [];
      this.getCSTMSTPerAcc({
        accmid: item.ACCMID,
        cntmid: this.CurUserDetails.USRDTL.USRDCI,
      }).then((res) => {
        this.upCSTMSTList(res.data);
      });
    },
    ObjectiveSelectedItems(item) {
      console.log(item);
    },
    SaveItineraryValidation() {
      if (this.customerSelected.CSTMID == undefined) {
        alert("Missing Customer.");
      } else if (this.clientSelected.ACCMID == undefined) {
        alert("Missing Client.");
      } else if (
        this.TSRObjectiveSelected.includes("OTHERS") &&
        this.TSRObjectiveSelectOthers == ""
      ) {
        alert("Missing Others.");
      } else {
        var ObjectiveTemp = "";
        this.TSRObjectiveSelected.forEach((x) => {
          if (ObjectiveTemp == "") {
            ObjectiveTemp = x;
          } else {
            ObjectiveTemp = ObjectiveTemp + "," + x;
          }
        });
        if (this.TSRObjectiveSelectOthers != "") {
          ObjectiveTemp = ObjectiveTemp + "," + this.TSRObjectiveSelectOthers;
        }
        let myValidation = JSON.stringify({
          itidte: this.date,
          iticst: this.customerSelected.CSTMID,
          iticnt: this.CurUserDetails.USRDTL.USRDCI,
          itiacc: this.clientSelected.ACCMID,
          itiobj: ObjectiveTemp,
        });
        this.getITIMSTValidation({ data: myValidation })
          .then((res) => {
            if (res.data == 0) {
              this.enableStart = true;
              this.SaveItinerary(ObjectiveTemp);
            } else {
              alert("The data is already in the database.");
            }
          })
          .catch((error) => {
            console.log(error);
            this.enableStart = false;
          });
      }
    },
    SaveItinerary(ObjectiveTemp) {
      let data = JSON.stringify({
        itidte: this.date,
        iticst: this.customerSelected.CSTMID,
        iticnt: this.CurUserDetails.USRDTL.USRDCI,
        itiacc: this.clientSelected.ACCMID,
        itiexp: this.date,
        itiobj: ObjectiveTemp,
      });
      this.insertITIMST({ data: data })
        .then((res) => {
          if (res.status == 200) {
            this.clientSelected = [];
            this.customerSelected = [];
            this.upCurITIMSTListUpdate(res.data);
            alert("Itinerary Save.");
            this.enableStart = false;
          }
        })
        .catch((error) => {
          console.log(error);
          this.enableStart = false;
        });
    },
    formatDate(date) {
      if (!date) return null;

      const [year, month, day] = date.split("-");
      return `${month}/${day}/${year}`;
    },
    parseDate(date) {
      if (!date) return null;

      const [month, day, year] = date.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
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
  