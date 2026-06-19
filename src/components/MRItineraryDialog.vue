<template>
  <v-layout mt-0 row justify-center>
    <v-dialog v-model="dialog" width="500" persistent transition="dialog-bottom-transition">
      <template v-slot:activator="{ on }">
        <v-btn v-if="type == 'icon'" small icon text rounded dark color="teal" v-on="on">
          <v-icon color="white lighten-1">timer_off</v-icon>
        </v-btn>
        <v-btn v-else small rounded dark color="teal" v-on="on"> Visit </v-btn>
      </template>
      <v-toolbar color="primary" dark class="fixed-toolbar">
        <v-toolbar-title>Itinerary</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-card color="grey lighten-4" text>
        <v-container fluid>
          <v-flex xs12 class="mt-2">
            <v-card color="grey lighten-4" text class="mt-0">
              <v-flex xs12>
                <v-text-field v-model="searchQuery" label="Search Client"></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-card color="grey lighten-4" class="mt-3 mb-3">
                  <v-card-title class="custom-card-title">Client</v-card-title>
                  <v-card-text style="max-height: 150px; overflow-y: auto">
                    <v-radio-group v-model="clientSelected" column @change="getCustomer">
                      <v-radio
                        v-for="item in filteredClients"
                        :key="item.ACCMID"
                        :label="item.ACCMNM"
                        :value="item.ACCMID"
                      ></v-radio>
                    </v-radio-group>
                  </v-card-text>
                </v-card>
              </v-flex>
            </v-card>
          </v-flex>
          <v-flex xs12>
            <v-card color="grey lighten-4" class="mt-3 mb-3">
              <v-card-title class="custom-card-title">
                <b>Customer</b>
              </v-card-title>
              <v-card-text style="max-height: 150px; overflow-y: auto">
                <v-radio-group v-model="customerSelected" column>
                  <v-radio
                    v-for="item in customerList"
                    :key="item.CSTMID"
                    :label="item.CSTNME"
                    :value="item.CSTMID"
                  ></v-radio>
                </v-radio-group>
              </v-card-text>
            </v-card>
          </v-flex>
          <v-flex xs12>
            <v-card color="grey lighten-4" class="mt-1 mb-1">
              <v-card-title class="custom-card-title">
                <b>Objective</b>
              </v-card-title>
              <v-card-text style="max-height: 150px; overflow-y: auto">
                <div v-for="item in TSRObjectiveList" :key="item.ObjectiveName" class="custom-checkbox">
                  <v-checkbox
                    :label="item.ObjectiveName"
                    :value="item.ObjectiveName"
                    v-model="TSRObjectiveSelected"
                  ></v-checkbox>
                </div>
              </v-card-text>
            </v-card>
          </v-flex>
          <v-flex xs12 v-if="TSRObjectiveSelected.includes('Others')">
            <v-text-field v-model="TSRObjectiveSelectOthers" label="Please specify Others"></v-text-field>
          </v-flex>
          <v-flex xs12 lg6>
            <v-menu
              ref="menu1"
              v-model="menu1"
              :close-on-content-click="false"
              :nudge-right="40"
              lazy
              transition="scale-transition"
              offset-y
              full-width
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-model="dateFormatted"
                  label="Visit Date"
                  hint="MM/DD/YYYY format"
                  persistent-hint
                  prepend-icon="event"
                  @blur="date = parseDate(dateFormatted)"
                  v-on="on"
                  readonly
                ></v-text-field>
              </template>
              <v-date-picker v-model="date" no-title @input="menu1 = false"></v-date-picker>
            </v-menu>
          </v-flex>
          <v-card-actions>
            <v-btn color="primary" :disabled="enableStart" @click="SaveItineraryValidation">Save</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="dialog = false"> Cancel </v-btn>
          </v-card-actions>
        </v-container>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
<script>
import { mapActions, mapMutations, mapState } from 'vuex'
export default {
  data() {
    return {
      dialog: false,
      clientSelected: [],
      searchQuery: '',
      filteredClients: [],
      customerSelected: '',
      customerList: [],
      date: new Date().toISOString().substr(0, 10),
      dateFormatted: this.formatDate(new Date().toISOString().substr(0, 10)),
      menu1: false,
      TSRObjectiveSelectOthers: '',
      TSRObjectiveSelected: [],
      TSRObjectiveList: [
        { ID: 1, ObjectiveName: 'Prospecting' },
        { ID: 2, ObjectiveName: 'OCC' },
        { ID: 3, ObjectiveName: 'Quotation' },
        { ID: 4, ObjectiveName: 'Pre-Procurement' },
        { ID: 5, ObjectiveName: 'Pre-Bid' },
        { ID: 6, ObjectiveName: 'Pre-Qualification Demo' },
        { ID: 7, ObjectiveName: 'Product Presentation' },
        { ID: 8, ObjectiveName: 'Demo – Evaluation' },
        { ID: 9, ObjectiveName: 'Bidding' },
        { ID: 10, ObjectiveName: 'Negotiation' },
        { ID: 11, ObjectiveName: 'Post-Qualification Demo' },
        { ID: 12, ObjectiveName: 'Contract Signing' },
        { ID: 13, ObjectiveName: 'NOA' },
        { ID: 14, ObjectiveName: 'NTP/WON' },
        { ID: 15, ObjectiveName: 'Contract Signed' },
        { ID: 16, ObjectiveName: 'Installation' },
        { ID: 17, ObjectiveName: 'P.O.' },
        { ID: 18, ObjectiveName: 'Others' },
        { ID: 19, ObjectiveName: 'Collection' },
      ],
      enableStart: false,
    }
  },
  mounted() {
    this.getCSTMSTcntacc({ cntmid: this.CurUserDetails.USRDTL.USRDCI }).then(res => {
      this.upAllClient(res.data)
      this.filteredClients = res.data
    })
  },
  watch: {
    date(val) {
      this.dateFormatted = this.formatDate(this.date)
    },
    searchQuery(val) {
      this.filterClients(val)
    },
  },
  computed: {
    ...mapState(['CurClientList', 'CurCSTMSTList', 'CurUserDetails', 'CurITIMSTList']),
    computedDateFormatted() {
      return this.formatDate(this.date)
    },
  },
  methods: {
    ...mapActions(['getAllAcc', 'getCSTMSTPerAcc', 'insertITIMST', 'getCSTMSTcntacc', 'getITIMSTValidation']),
    ...mapMutations(['upAllClient', 'upCSTMSTList', 'upCurITIMSTListUpdate']),
    getCustomer(item) {
      this.upCSTMSTList([])
      this.customerSelected = ''
      this.getCSTMSTPerAcc({
        accmid: item,
        cntmid: this.CurUserDetails.USRDTL.USRDCI,
      }).then(res => {
        this.customerList = res.data
      })
    },
    filterClients() {
      const query = this.searchQuery.toLowerCase()
      this.filteredClients = this.CurClientList.filter(client => client.ACCMNM.toLowerCase().includes(query))
    },
    SaveItineraryValidation() {
      if (this.customerSelected == '') {
        alert('Missing Customer.')
      } else if (this.clientSelected == undefined) {
        alert('Missing Client.')
      } else if (this.TSRObjectiveSelected == 'Others' && this.TSRObjectiveSelectOthers == '') {
        alert('Missing Others.')
      } else {
        if (this.TSRObjectiveSelected != '') {
          var ObjectiveTemp = ''
          this.TSRObjectiveSelected.forEach(x => {
            if (ObjectiveTemp == '') {
              ObjectiveTemp = x
            } else {
              ObjectiveTemp = ObjectiveTemp + ',' + x
            }
          })
          if (this.TSRObjectiveSelectOthers != '') {
            ObjectiveTemp = ObjectiveTemp + ',' + this.TSRObjectiveSelectOthers
          }
          let myValidation = JSON.stringify({
            itidte: this.date,
            iticst: this.customerSelected,
            iticnt: this.CurUserDetails.USRDTL.USRDCI,
            itiacc: this.clientSelected,
            itiobj: ObjectiveTemp,
          })

          this.getITIMSTValidation({ data: myValidation })
            .then(res => {
              if (res.data == 0) {
                this.enableStart = true
                this.SaveItinerary(ObjectiveTemp)
              } else {
                alert('The data is already in the database.')
              }
            })
            .catch(error => {
              console.log(error)
              this.enableStart = false
            })
        } else {
          alert('Insert Objective!')
        }
      }
    },
    SaveItinerary(ObjectiveTemp) {
      let data = JSON.stringify({
        itidte: this.date,
        iticst: this.customerSelected,
        iticnt: this.CurUserDetails.USRDTL.USRDCI,
        itiacc: this.clientSelected,
        itiexp: this.date,
        itiobj: ObjectiveTemp,
      })
      this.insertITIMST({ data: data })
        .then(res => {
          if (res.status == 200) {
            this.upCSTMSTList([])
            this.clientSelected = ''
            this.customerSelected = ''
            this.upCurITIMSTListUpdate(res.data)
            alert('Itinerary Save.')
            this.enableStart = false
          }
        })
        .catch(error => {
          console.log(error)
          this.enableStart = false
        })
    },
    formatDate(date) {
      if (!date) return null

      const [year, month, day] = date.split('-')
      return `${month}/${day}/${year}`
    },
    parseDate(date) {
      if (!date) return null

      const [month, day, year] = date.split('/')
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    },
  },
  props: {
    type: {
      type: String,
      default: '',
    },
  },
}
</script>
<style scoped>
.custom-checkbox {
  margin-bottom: 1px;
  /* Adjust this value to change the spacing */
}

.custom-card-title {
  padding: 0px 16px;
  /* Remove any default margin */
}

.fixed-toolbar {
  position: fixed;
  top: 0;
  width: 87.5%;
  /* This line was missing the property */
  z-index: 1000;
}
</style>
