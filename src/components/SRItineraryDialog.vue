<template>
  <v-layout mt-0 row justify-center>
    <v-dialog v-model="dialog" width="500" persistent transition="dialog-bottom-transition">
      <template v-slot:activator="{ on }">
        <v-btn class="no-print" v-on="on" small rounded dark color="teal"> Add Itinerary </v-btn>
      </template>
      <v-flex xs12>
        <v-card color="grey lighten-4" min-width="350px" text class="mt-0">
          <v-toolbar color="primary" dark>
            <v-toolbar-title>Itinerary</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
          <v-card-title primary-title>
            <v-flex xs12>
              <v-combobox
                v-model="fieldSearch"
                label="Client"
                :items="ClientSearch"
                item-text="ACCMNM"
                item-value="ACCMID"
                prepend-inner-icon="search"
                placeholder="Search by: Client name or Initial"
                @focus="$event.target.select()"
              ></v-combobox>
            </v-flex>
            <v-flex xs12>
              <v-combobox
                v-model="customerSelected"
                :items="ClientInstrument"
                item-text="DESCRIPTION"
                item-value="SERIAL_NO"
                label="Instrument"
                @change="setInstrumentSerialNumber"
              ></v-combobox>
              <v-text-field
                label="Serial Number"
                v-model="TextFieldSerialNumber"
                :disabled="enableSerialNumber"
              ></v-text-field>
            </v-flex>
            <v-flex xs12>
              <v-combobox
                v-model="TSRPurposeOfVisit"
                :items="
                  CurUserDetails.CNTMST.CNTDPT.substring(0, 3) == 'TSG' ? TSRPurposeOfVisitList : PSPurposeOfVisitList
                "
                item-text="PVDescription"
                item-value="PVID"
                hide-details
                multiple
                no-data-text
                label="Purpose of Visit"
              ></v-combobox>
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
                  ></v-text-field>
                </template>
                <v-date-picker v-model="date" no-title @input="menu1 = false"></v-date-picker>
              </v-menu>
            </v-flex>
          </v-card-title>
          <v-card-actions>
            <v-btn color="primary" :disabled="enableStart" @click="SaveItineraryValidation">Save</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="dialog = false"> Cancel </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-dialog>
  </v-layout>
</template>
<script>
//   import { stringify } from "querystring";
import { mapActions, mapMutations, mapState } from 'vuex'
export default {
  data() {
    return {
      dialog: false,
      clientSelected: [],
      customerSelected: [],
      date: new Date().toISOString().substr(0, 10),
      dateFormatted: this.formatDate(new Date().toISOString().substr(0, 10)),
      menu1: false,
      TSRObjectiveSelectOthers: '',
      TSRPurposeOfVisit: [],
      //CREATE A POV
      TSRPurposeOfVisitList: [
        {
          PVID: 5,
          PVDescription: 'Monthly Maintenance',
          PVRemarks: '',
        },
        {
          PVID: 6,
          PVDescription: 'Preventive Maintenance',
          PVRemarks: '',
        },
      ],
      PSPurposeOfVisitList: [
        {
          PVID: 1,
          PVDescription: 'Demo',
          PVRemarks: '',
        },
        {
          PVID: 2,
          PVDescription: 'Training',
          PVRemarks: '',
        },
        {
          PVID: 3,
          PVDescription: 'Monitoring',
          PVRemarks: '',
        },
        {
          PVID: 4,
          PVDescription: 'Troubleshooting',
          PVRemarks: '',
        },
        {
          PVID: 5,
          PVDescription: 'Application',
          PVRemarks: '',
        },
        {
          PVID: 6,
          PVDescription: 'Maintenance',
          PVRemarks: '',
        },
        {
          PVID: 7,
          PVDescription: 'QC Running',
          PVRemarks: '',
        },
        {
          PVID: 8,
          PVDescription: 'Calibration Running',
          PVRemarks: '',
        },
        {
          PVID: 9,
          PVDescription: 'Reagent Concerns',
          PVRemarks: '',
        },
        {
          PVID: 10,
          PVDescription: 'Admin Concerns',
          PVRemarks: '',
        },
      ],
      enableStart: false,
      fieldSearch: '' ? [] : '',
      ClientSearch: [],
      ClientCurDetails: [],
      ClientInstrument: [],
      ClientCurInstrument: [],
      SerialNumber: '',
      TextFieldSerialNumber: '',
      TextFieldInstrumentModel: '',
      enableSerialNumber: false,
    }
  },
  mounted() {
    this.getCSTMSTcntacc({ cntmid: this.CurUserDetails.USRDTL.USRDCI }).then(res => {
      this.upAllClient(res.data)
    })
  },
  watch: {
    date(val) {
      this.dateFormatted = this.formatDate(this.date)
    },
    fieldSearch() {
      this.verifier()
    },
  },
  computed: {
    ...mapState(['CurUserDetails']),
    computedDateFormatted() {
      return this.formatDate(this.date)
    },
  },
  methods: {
    ...mapActions([
      'insertITIMSTTSG',
      'getCSTMSTcntacc',
      'getAccItinerary',
      'filterAcctItinerary',
      'getInstrumentByAccId',
    ]),
    ...mapMutations(['upAllClient', 'upCurServiceCalendarUpdate']),
    getClientInstruments() {
      this.getInstrumentByAccId(this.ClientCurDetails.ACCMID).then(res => {
        this.ClientInstrument = res.data.tbinstruments
      })
    },
    setInstrumentSerialNumber(item) {
      if (item.SERIAL_NO == undefined) {
        this.TextFieldInstrumentModel = item
      } else {
        this.TextFieldInstrumentModel = item.ITEM_CODE
        this.TextFieldSerialNumber = item.SERIAL_NO
      }
      this.enableStart = false
    },
    verifier() {
      if (this.fieldSearch != null) {
        if (this.fieldSearch != '') {
          if (this.fieldSearch.ACCMNM != undefined) {
            this.getFilteredAcct(this.fieldSearch.ACCMNM)
          } else {
            this.getFilteredAcct(this.fieldSearch)
          }
        }
      }
    },
    getFilteredAcct(e) {
      console.log(1)
      console.time()
      this.filterAcctItinerary(e).then(
        res => {
          res.forEach(element => {
            this.ClientSearch.unshift(element)
          })
          this.clientClick(this.fieldSearch.ACCMID)
        },
        error => {
          console.error(error)
        }
      )
      console.timeEnd()
    },
    clientClick(id) {
      if (id != undefined) {
        this.getAccItinerary(id).then(
          res => {
            this.ClientCurDetails = res.data
            this.getClientInstruments()
          },
          error => {
            console.error(error)
          }
        )
      }
    },
    //You are here
    SaveItineraryValidation() {
      var ObjectiveTemp = ''
      this.TSRPurposeOfVisit.forEach(x => {
        if (ObjectiveTemp == '') {
          ObjectiveTemp = x.PVDescription
        } else {
          ObjectiveTemp = ObjectiveTemp + ',' + x.PVDescription
        }
      })
      this.enableStart = true
      this.SaveItinerary(ObjectiveTemp)
    },
    SaveItinerary(ObjectiveTemp) {
      let strModel = ''
      let serialModel = ''
      strModel = this.TextFieldSerialNumber
      serialModel = this.TextFieldInstrumentModel + ' - (SN: ' + strModel + ')'
      let data = JSON.stringify({
        itidte: this.date,
        iticnt: this.CurUserDetails.USRDTL.USRDCI,
        itiacc: this.ClientCurDetails.ACCMID,
        itiexp: this.date,
        itiobj: ObjectiveTemp,
        itiins: serialModel,
      })
      this.insertITIMSTTSG({ data: data })
        .then(res => {
          console.log(res.status)
          if (res.status == 200) {
            this.ClientCurDetails = []
            this.upCurServiceCalendarUpdate(res.data)
            alert('Itinerary Save.')
            this.enableStart = false
          }
          if (res.status == 400) {
            alert('Please re-select the Client!')
          }
          if (res.status == 204) {
            this.ClientCurDetails = []
            this.upCurServiceCalendarUpdate(res.data)
            alert('Itinerary Save.')
            this.enableStart = false
          }
        })
        .catch(error => {
          alert('Please re-select the Client!', error)
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
