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
            <v-btn class="no-print primary" @click="dataReload">Load</v-btn>
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex sm3 md3 xs12>
            <v-btn class="red no-print" @click="removeCalendarData">Reset Data</v-btn>
          </v-flex>
          <v-flex sm3 md3 xs12>
            <v-btn class="no-print" @click="$refs.calendar.prev()">
              <v-icon dark left>
                keyboard_arrow_left
              </v-icon>
              Prev
            </v-btn>
          </v-flex>
          <v-flex sm3 md3 xs12>
            <v-btn class="no-print" @click="$refs.calendar.next()">
              Next
              <v-icon right dark>
                keyboard_arrow_right
              </v-icon>
            </v-btn>
          </v-flex>
          <v-flex sm3 md3 xs12>
            <v-btn class="no-print" @click="printDiv('printDiv')" color="primary">Print</v-btn>
          </v-flex>
        </v-layout>
        <v-sheet height="800" class="my-event3">
          <v-calendar ref="calendar" v-model="today" type="month" color="primary">
            <template v-slot:day="{ date }">
              <template v-for="event in eventsMap[date]">
                <v-menu :key="event.trdmti" v-model="event.open" :close-on-content-click="false" full-width offset-x>
                  <template v-slot:activator="{ on }">
                    <div class="my-event1 mb-1" v-ripple v-on="on" v-show="event.trdsts != 'LEAVE'">
                      <div v-if="!event.time && event.trdmde != '' && event.trdsts != ''">
                        {{ event.client }}
                      </div>
                      <div v-if="event.trdmde == '' && event.trdsts == 'SCHEDULED'" v-ripple>
                        {{ event.client }}
                      </div>
                      <div v-show="event.trdsts == ''">
                        {{ event.client }}
                      </div>
                    </div>
                    <div
                      v-show="event.trdsts != '' && event.trdsts != 'LEAVE'"
                      class="my-event2 mb-1"
                      v-ripple
                      v-on="on"
                      v-for="(text, index) in event.trdmde.split('|')"
                      :key="index"
                    >
                      <div v-show="event.trdmde != '' && event.trdsts != 'SCHEDULED'">
                        {{ text }}
                      </div>
                      <div v-show="(event.trdmde == '' && event.trdsts == 'SCHEDULED') || event.trdsts == 'START'">
                        {{ event.trdsts + ':' }}
                        {{ event.itiobj + ' - ' }} {{ event.itiins }}
                      </div>
                    </div>
                    <div
                      v-show="event.trdmde != '' && event.trdsts == '' && event.trdsts != 'LEAVE'"
                      class="my-event2 mb-1"
                      v-ripple
                    >
                      {{ event.trdmde }}
                    </div>
                    <div v-show="event.trdsts == 'LEAVE'" class="my-event4" v-ripple v-on="on">
                      {{ event.title }}
                    </div>
                  </template>
                  <v-layout wrap row>
                    <v-card
                      v-show="event.trdsts == 'START' || event.trdsts == 'SCHEDULED'"
                      color="grey lighten-4"
                      min-width="250px"
                      max-width="350px"
                      flat
                    >
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
                          <a :href="'https://www.google.com/maps?q=' + lat + ',' + long" target="_blank" color="success"
                            ><i>
                              <h5>Verify your location.</h5>
                            </i></a
                          >
                        </v-flex>
                        <v-btn
                          v-show="event.itists == '1'"
                          @click="InsertCheckInStartServiceValidation(event)"
                          :disabled="enableStart"
                          color="primary"
                          >START</v-btn
                        >
                        <v-btn
                          v-show="event.itists == '1'"
                          :disabled="enableStart"
                          color="primary"
                          @click="InsertServiceLocationLogs(event)"
                          >CHECK-IN</v-btn
                        >
                        <v-btn color="primary" @click="cancelItinerary(event)">Cancel</v-btn>
                      </v-card-title>
                      <v-card-actions> </v-card-actions>
                    </v-card>
                    <v-card
                      v-show="event.trdsts == 'LEAVE'"
                      color="grey lighten-4"
                      min-width="250px"
                      max-width="350px"
                      flat
                    >
                      <v-toolbar color="primary" dark>
                        <v-toolbar-title>{{ event.title }}</v-toolbar-title>
                        <v-spacer></v-spacer>
                      </v-toolbar>
                      <v-card-title>
                        <v-btn color="primary" @click="CancelAddedData(event)">Cancel Added Data</v-btn>
                      </v-card-title>
                      <v-card-actions> </v-card-actions>
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
          <h4>PREPARED BY{{ ': ' + CurUserDetails.CNTMST.CNTMCN }}</h4>
        </span>
        <v-spacer></v-spacer>
        <h4>Noted By:</h4>
        <h4>{{ CurUserDetails.CNTMST.CNTMSF }} ___________________</h4>
        <h4>{{ CurUserDetails.CNTMST.CNTMBD }} ___________________</h4>
      </v-footer>
      <v-speed-dial
        bottom
        right
        fixed
        transition="slide-x-reverse-transition"
        direction="top"
        class="mb-5 mr-3 no-print"
      >
        <template v-slot:activator>
          <v-btn color="primary" dark fab>
            <v-icon>add</v-icon>
          </v-btn>
        </template>
        <itinerary-dialog v-show="CurUserDetails.CNTMST.CNTDPT != 'COLLECTOR'"></itinerary-dialog>
        <!-- <work-with v-show="CurUserDetails.CNTMST.CNTDPT != 'COLLECTOR'"></work-with> -->
        <add-data></add-data>
      </v-speed-dial>
    </v-layout>
  </v-container>
</template>
<script>
import { mapActions, mapState, mapMutations } from 'vuex'
import moment from 'moment'
import ItineraryDialog from '../components/SRItineraryDialog.vue'
import WorkWith from '../components/SRCalendarWorkWith.vue'
import AddData from '../components/SRCalendarAddData.vue'

export default {
  components: {
    ItineraryDialog,
    WorkWith,
    AddData,
  },
  data: () => ({
    menuOpenCLose: false,
    menu: false,
    today: moment(new Date()).format('YYYY-MM-DD'),
    lat: '',
    long: '',
    dialog: false,
    enableStart: false,
    datefrom: '',
    dateto: '',
    DataDialog: false,
    client: '',
    mDate: '',
    WorkWithDialog: false,
    SRNumber: '',
    lat: '',
    long: '',
    serialNumber: '',
    textGroup: '',
    userInitial: '',
    serviceLocLogID: '',
  }),
  computed: {
    ...mapState(['CurServiceCalendar', 'CurUserDetails']),
    eventsMap() {
      const map = {}
      this.CurServiceCalendar.forEach(e => (map[e.date] = map[e.date] || []).push(e))
      return map
    },
    myDate() {
      return moment(this.today).format('MMMM YYYY')
    },
  },
  mounted() {
    if (localStorage.mydata != undefined) {
      this.upCurServiceCalendar(JSON.parse(localStorage.mydata).myCalendar)
      this.datefrom = JSON.parse(localStorage.mydata).myCalendarDateFrom
      this.dateto = JSON.parse(localStorage.mydata).myCalendarDateTo
    }
    this.GetMyCoordinates()
  },
  methods: {
    ...mapActions([
      'deleteSRCalendarAdditional',
      'getServiceCalendar',
      'getThreadDetailsByTRDMID',
      'cancelMyItinerary',
    ]),
    ...mapMutations(['upCurServiceCalendar', 'upCurServiceCalendarDeleteItem']),
    CancelAddedData(item) {
      this.deleteSRCalendarAdditional({
        lvecnt: this.CurUserDetails.CNTMST.CNTMID,
        lvedte: item.date,
        lvedsc: item.title,
      })
        .then(res => {
          if (res.status == 200) {
            this.upCurServiceCalendarDeleteItem(item)
            let calendar = JSON.stringify({
              myCalendar: this.CurServiceCalendar,
              myCalendarDateFrom: this.datefrom,
              myCalendarDateTo: this.dateto,
            })
            localStorage.mydata = calendar
          }
        })
        .catch(error => {
          console.log(error)
        })
    },
    cancelItinerary(item) {
      this.cancelMyItinerary({ itimid: item.itimid })
        .then(res => {
          if (res.status == 200) {
            alert('Itinerary Cancelled!')
            this.removeCalendarData()
            this.dataReload()
          }
        })
        .catch(error => {
          alert(error)
        })
    },
    InsertServiceLocationLogs(event) {
      let data = JSON.stringify({
        ServiceLocLogAction: 'CheckIn',
        CustomerID: event.accmid,
        UserID: this.CurUserDetails.CNTMST.CNTMID,
      })
      const Opheaders = {
        method: 'POST',
        data: data,
        headers: {
          'content-type': 'application/json',
        },
        url: 'https://sr.mdmpi.com.ph/sr/servicelocationlog/login',
      }
      axios(Opheaders)
        .then(res => {
          if (res.status == 201) {
            let d = res.data
            this.Sample(event.client)
            alert('Checked - In at ' + event.client + ' on ' + d.serviceLocLogDateTime)
            this.serviceLocLogID = d.serviceLocLogID
          }
          if (res.status == 200) {
            alert('Already Check-In')
          }
        })
        .catch(error => {
          alert(error)
        })
    },
    Sample(client) {
      let userInit = this.CurUserDetails.CNTMST
      this.userInitial = userInit.CNTMNN
      this.textGroup = userInit.CNTTGP
      if (this.textGroup == 'IMS') {
        this.textGroup = 'IMST'
      }
      let dataTwo = JSON.stringify({
        RECEIVER: this.textGroup,
        SENDER: this.userInitial,
        MESSAGE: 'Check-In at ' + client,
      })
      const OpheadersTwo = {
        method: 'POST',
        data: dataTwo,
        headers: {
          'content-type': 'application/json',
          accept: '*/*',
          'accept-Encoding': 'gzip, deflate, br',
          connection: 'keep-alive',
          'sec-fetch-mode': 'no-cors',
        },
        url: 'https://mdmpi.com.ph/lasius/api_sendsms',
      }
      axios(OpheadersTwo).then(res => {
        if (res.status == 200) {
          console.log(res)
        }
      })
    },
    InsertCheckInStartServiceValidation(event) {
      const str = event.itiins
      const regex = /\(SN: ([A-Z\d\/]+)\)/
      const match = str.match(regex)
      if (match) {
        this.serialNumber = match[1]
        this.InsertCheckInStartService(event)
      } else {
        alert('Serial number not found')
      }
    },
    InsertCheckInStartService(event) {
      let itemPOVSelectTemp = []
      if (event.itiobj.includes('Monthly Maintenance')) {
        itemPOVSelectTemp.push({
          PVID: 5,
          PVDescription: 'Monthly Maintenance',
          PVRemarks: '',
        })
      }
      if (event.itiobj.includes('Preventive Maintenance')) {
        itemPOVSelectTemp.push({
          PVID: 6,
          PVDescription: 'Preventive Maintenance',
          PVRemarks: '',
        })
      }
      if (event.itiobj.includes('Demo')) {
        itemPOVSelectTemp.push({
          PVID: 1,
          PVDescription: 'Demo',
          PVRemarks: '',
        })
      }
      if (event.itiobj.includes('Training')) {
        itemPOVSelectTemp.push({
          PVID: 2,
          PVDescription: 'Training',
          PVRemarks: '',
        })
      }
      if (event.itiobj.includes('Monitoring')) {
        itemPOVSelectTemp.push({
          PVID: 3,
          PVDescription: 'Monitoring',
          PVRemarks: '',
        })
      }
      if (event.itiobj.includes('Troubleshooting')) {
        itemPOVSelectTemp.push({
          PVID: 4,
          PVDescription: 'Troubleshooting',
          PVRemarks: '',
        })
      }
      if (event.itiobj.includes('Application')) {
        itemPOVSelectTemp.push({
          PVID: 5,
          PVDescription: 'Application',
          PVRemarks: '',
        })
      }
      if (event.itiobj.includes('Maintenance')) {
        itemPOVSelectTemp.push({
          PVID: 6,
          PVDescription: 'Maintenance',
          PVRemarks: '',
        })
      }
      if (event.itiobj.includes('QC Running')) {
        itemPOVSelectTemp.push({
          PVID: 7,
          PVDescription: 'QC Running',
          PVRemarks: '',
        })
      }
      if (event.itiobj.includes('Calibration Running')) {
        itemPOVSelectTemp.push({
          PVID: 8,
          PVDescription: 'Calibration Running',
          PVRemarks: '',
        })
      }
      if (event.itiobj.includes('Reagent Concerns')) {
        itemPOVSelectTemp.push({
          PVID: 9,
          PVDescription: 'Reagent Concerns',
          PVRemarks: '',
        })
      }
      if (event.itiobj.includes('Admin Concerns')) {
        itemPOVSelectTemp.push({
          PVID: 10,
          PVDescription: 'Admin Concerns',
          PVRemarks: '',
        })
      }

      let data =
        this.CurUserDetails.CNTMST.CNTDPT.substring(0, 3) == 'TSG'
          ? JSON.stringify({
              UserID: this.CurUserDetails.CNTMST.CNTMID,
              InstrumentModelID: event.itiins,
              InstrumentSerialNumber: this.serialNumber,
              CustomerID: event.accmid,
              SRFormType: 'Field',
              SRTImerAction: 'Start',
              SRTRemarks: '',
              serviceLocLogID: '<EDIT>',
              TRDADT: moment(new Date(), 'ddd MMM DD YYYY kk:mm:SS').format('YYYY/MM/DD HH:mm'),
              TRDLOC: this.lat + ' ' + this.long,
              POV: itemPOVSelectTemp,
              TRDMTY: 'Service Report',
              TRDITISVC: event.itimid,
            })
          : JSON.stringify({
              UserID: this.CurUserDetails.CNTMST.CNTMID,
              InstrumentModelID: event.itiins,
              InstrumentSerialNumber: this.serialNumber,
              CustomerID: event.accmid,
              SRFormType: 'Field',
              SRTImerAction: 'Start',
              SRTRemarks: '',
              serviceLocLogID: '<EDIT>',
              TRDADT: moment(new Date(), 'ddd MMM DD YYYY kk:mm:SS').format('YYYY/MM/DD HH:mm'),
              TRDLOC: this.lat + ' ' + this.long,
              POV: itemPOVSelectTemp,
              TRDMTY: 'PA Service Report',
              TRDITISVC: event.itimid,
            })
      const Opheaders = {
        method: 'POST',
        data: data,
        headers: {
          'content-type': 'application/json',
        },
        url: 'https://sr.mdmpi.com.ph/sr/srtimer/beginservice',
      }
      axios(Opheaders)
        .then(res => {
          if (res.status == 201) {
            this.enableStart = true
            this.dataReload()
          }
          if (res.data.message == 'NOTCHECKIN or ALREADY START SERVICE') {
            alert('NOTCHECKIN or ALREADY START SERVICE')
          }
        })
        .catch(error => {
          alert(error)
        })
    },
    GetMyCoordinates() {
      navigator.geolocation.getCurrentPosition(
        position => {
          this.lat = position.coords.latitude
          this.long = position.coords.longitude
        },
        error => {
          alert(error.message)
        }
      )
    },
    open(event) {
      alert(event.title)
    },
    printDiv(divName) {
      let calendar = JSON.stringify({
        myCalendar: this.CurServiceCalendar,
        myCalendarDateFrom: this.datefrom,
        myCalendarDateTo: this.dateto,
      })
      localStorage.mydata = calendar

      var printContents = document.getElementById(divName).innerHTML
      var originalContents = document.body.innerHTML

      document.body.innerHTML = printContents

      window.print()
      document.body.innerHTML = originalContents
      location.reload()
    },
    dataReload() {
      this.getServiceCalendar({
        cntmid: this.$route.params.CNTMID,
        data: {
          itidteFrom: this.datefrom,
          itidteTo: this.dateto,
        },
      })
        .then(res => {
          if (res != '') {
            this.upCurServiceCalendar(res)
            let calendar = JSON.stringify({
              myCalendar: res,
              myCalendarDateFrom: this.datefrom,
              myCalendarDateTo: this.dateto,
            })
            localStorage.mydata = calendar
          } else {
            alert('No Data Found!')
          }
        })
        .catch(error => {
          alert('Please re-select the Client!', error)
          this.enableStart = false
        })
    },
    dialogOpen() {
      this.DataDialog = true
    },
    removeCalendarData() {
      localStorage.removeItem('mydata')
      location.reload()
    },
  },
}
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

.my-event4 {
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
