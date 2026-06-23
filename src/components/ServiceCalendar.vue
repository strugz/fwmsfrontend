<template>
  <v-container fluid class="service-calendar-page">
    <div id="printDiv" class="service-calendar">
      <section class="service-calendar__hero">
        <div>
          <p class="service-calendar__eyebrow">Marsman Drysdale Medical Product Inc.</p>
          <h1>Service Calendar</h1>
          <p class="service-calendar__subtitle">
            Calendar planner for scheduled visits, check-ins, and service starts.
          </p>
        </div>

        <div class="service-calendar__month">
          <span>{{ myDate }}</span>
          <small>{{ CurUserDetails.CNTMST.CNTMCN }}</small>
        </div>
      </section>

      <v-card class="service-calendar__controls no-print" flat>
        <v-row align="center" dense>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="datefrom"
              type="date"
              label="From"
              outlined
              dense
              hide-details
              prepend-inner-icon="event"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="dateto"
              type="date"
              label="To"
              outlined
              dense
              hide-details
              prepend-inner-icon="event"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <div class="service-calendar__actions">
              <v-btn
                depressed
                color="teal darken-2"
                dark
                :loading="calendarLoading"
                :disabled="calendarLoading"
                @click="dataReload"
              >
                <v-icon left small>refresh</v-icon>
                Load
              </v-btn>
              <v-btn
                depressed
                color="grey lighten-3"
                class="service-calendar__nav-btn"
                :disabled="calendarLoading"
                @click="$refs.calendar.prev()"
              >
                <v-icon left small>keyboard_arrow_left</v-icon>
                Prev
              </v-btn>
              <v-btn
                depressed
                color="grey lighten-3"
                class="service-calendar__nav-btn"
                :disabled="calendarLoading"
                @click="$refs.calendar.next()"
              >
                Next
                <v-icon right small>keyboard_arrow_right</v-icon>
              </v-btn>
              <v-btn depressed color="indigo" dark :disabled="calendarLoading" @click="printDiv('printDiv')">
                <v-icon left small>print</v-icon>
                Print
              </v-btn>
              <v-btn depressed color="red lighten-1" dark :disabled="calendarLoading" @click="removeCalendarData">
                <v-icon left small>delete_sweep</v-icon>
                Reset
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card>

      <section class="service-calendar__stats no-print">
        <div class="service-calendar__stat">
          <span>{{ calendarCount }}</span>
          <small>Total items</small>
        </div>
        <div class="service-calendar__stat">
          <span>{{ scheduledCount }}</span>
          <small>Scheduled</small>
        </div>
        <div class="service-calendar__stat">
          <span>{{ startedCount }}</span>
          <small>Started</small>
        </div>
        <div class="service-calendar__stat">
          <span>{{ leaveCount }}</span>
          <small>Leave</small>
        </div>
      </section>

      <v-card class="service-calendar__calendar-card" flat>
        <v-overlay absolute :value="calendarLoading" opacity="0.08" color="#0f766e">
          <div class="service-calendar__loading">
            <v-progress-circular indeterminate color="teal darken-2" size="42"></v-progress-circular>
            <strong>Loading service calendar</strong>
            <span>Fetching the latest schedule records...</span>
          </div>
        </v-overlay>

        <div class="service-calendar__calendar-head">
          <div>
            <h2>{{ myDate }}</h2>
            <p>Click a calendar item to start service, check in, or cancel a scheduled entry.</p>
          </div>
        </div>

        <v-sheet class="service-calendar__sheet">
          <v-calendar ref="calendar" v-model="today" type="month" color="teal darken-2">
            <template v-slot:day="{ date }">
              <template v-for="event in eventsMap[date]">
                <v-menu
                  :key="event.trdmti || event.itimid || event.title + date"
                  v-model="event.open"
                  :close-on-content-click="false"
                  max-width="380"
                  offset-y
                >
                  <template v-slot:activator="{ on }">
                    <div v-ripple class="calendar-event mb-1" :class="eventClass(event)" v-on="on">
                      <div class="calendar-event__top">
                        <span>{{ eventTitleLine(event) }}</span>
                        <small v-if="eventStatusLabel(event)">{{ eventStatusLabel(event) }}</small>
                      </div>
                      <p v-for="(line, index) in eventDetailLines(event)" :key="index">
                        {{ line }}
                      </p>
                    </div>
                  </template>
                  <v-row no-gutters>
                    <v-card
                      v-show="event.trdsts == 'START' || event.trdsts == 'SCHEDULED'"
                      class="calendar-menu-card"
                      min-width="320px"
                      max-width="380px"
                      flat
                    >
                      <v-toolbar dark flat height="56" class="calendar-menu-card__toolbar">
                        <v-toolbar-title>{{ event.title }}</v-toolbar-title>
                        <v-spacer></v-spacer>
                      </v-toolbar>
                      <v-card-text>
                        <div v-if="event.itiobj" class="calendar-menu-card__meta">
                          <strong>Instrument</strong>
                          <span>{{ event.itiins }}</span>
                        </div>
                        <div v-if="event.itiobj" class="calendar-menu-card__meta">
                          <strong>Purpose</strong>
                          <span>{{ event.itiobj }}</span>
                        </div>
                        <a
                          class="calendar-menu-card__location"
                          :href="'https://www.google.com/maps?q=' + lat + ',' + long"
                          target="_blank"
                        >
                          <v-icon small color="teal darken-2">place</v-icon>
                          Verify your location
                        </a>
                      </v-card-text>
                      <v-card-actions class="calendar-menu-card__actions">
                        <v-btn
                          v-show="event.itists == '1'"
                          @click="InsertCheckInStartServiceValidation(event)"
                          :disabled="enableStart"
                          color="teal darken-2"
                          dark
                          depressed
                          small
                        >
                          START
                        </v-btn>
                        <v-btn
                          v-show="event.itists == '1'"
                          :disabled="enableStart"
                          color="teal darken-2"
                          dark
                          depressed
                          small
                          @click="InsertServiceLocationLogs(event)"
                        >
                          CHECK-IN
                        </v-btn>
                        <v-spacer></v-spacer>
                        <v-btn text color="red darken-1" small @click="cancelItinerary(event)">Cancel</v-btn>
                      </v-card-actions>
                    </v-card>
                    <v-card
                      v-show="isLeaveEvent(event)"
                      class="calendar-menu-card"
                      min-width="320px"
                      max-width="380px"
                      flat
                    >
                      <v-toolbar dark flat height="56" class="calendar-menu-card__toolbar">
                        <v-toolbar-title>{{ event.title }}</v-toolbar-title>
                        <v-spacer></v-spacer>
                      </v-toolbar>
                      <v-card-text>
                        <p class="mb-0">This day is marked as leave or additional calendar data.</p>
                      </v-card-text>
                      <v-card-actions class="calendar-menu-card__actions">
                        <v-spacer></v-spacer>
                        <v-btn color="red darken-1" text small @click="CancelAddedData(event)">Cancel Added Data</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-row>
                </v-menu>
              </template>
            </template>
          </v-calendar>
        </v-sheet>
      </v-card>

      <footer class="service-calendar__footer">
        <div>
          <span>Prepared by</span>
          <strong>{{ CurUserDetails.CNTMST.CNTMCN }}</strong>
        </div>
        <div>
          <span>Noted by</span>
          <strong>{{ CurUserDetails.CNTMST.CNTMSF }} ___________________</strong>
          <strong>{{ CurUserDetails.CNTMST.CNTMBD }} ___________________</strong>
        </div>
      </footer>

      <v-speed-dial
        bottom
        right
        fixed
        transition="slide-x-reverse-transition"
        direction="top"
        class="mb-5 mr-3 no-print"
      >
        <template v-slot:activator>
          <v-btn color="primary" dark fab :disabled="calendarLoading">
            <v-icon>add</v-icon>
          </v-btn>
        </template>
        <v-btn
          v-show="CurUserDetails.CNTMST.CNTDPT != 'COLLECTOR'"
          small
          rounded
          dark
          color="teal"
          :disabled="calendarLoading"
          @click="openServiceItineraryDialog"
        >
          <v-icon left small>add_location_alt</v-icon>
          Add Itinerary
        </v-btn>
        <v-btn small rounded dark color="teal" :disabled="calendarLoading" @click="openServiceAddDataDialog">
          <v-icon left small>event_busy</v-icon>
          Add Data
        </v-btn>
      </v-speed-dial>
      <itinerary-dialog ref="serviceItineraryDialog" :show-activator="false"></itinerary-dialog>
      <add-data ref="serviceAddDataDialog" :show-activator="false"></add-data>
    </div>
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
    calendarLoading: false,
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
    calendarCount() {
      return this.CurServiceCalendar.length
    },
    scheduledCount() {
      return this.CurServiceCalendar.filter(event => event.trdsts == 'SCHEDULED').length
    },
    startedCount() {
      return this.CurServiceCalendar.filter(event => event.trdsts == 'START').length
    },
    leaveCount() {
      return this.CurServiceCalendar.filter(event => this.isLeaveEvent(event)).length
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
    eventClass(event) {
      const classes = []
      if (this.isScheduledEvent(event)) {
        classes.push('calendar-event--print-hidden')
      }

      if (this.isLeaveEvent(event)) {
        classes.push('calendar-event--leave')
        return classes
      }
      if (event.trdsts == 'START') {
        classes.push('calendar-event--start')
        return classes
      }
      if (event.trdsts == 'SCHEDULED') {
        classes.push('calendar-event--scheduled')
        return classes
      }
      classes.push('calendar-event--note')
      return classes
    },
    eventTitleLine(event) {
      return this.isLeaveEvent(event) ? event.title : event.client || event.title || 'Calendar item'
    },
    eventDetailLines(event) {
      if (this.isLeaveEvent(event)) {
        return []
      }

      if ((event.trdmde == '' && event.trdsts == 'SCHEDULED') || event.trdsts == 'START') {
        return [`${event.trdsts}: ${event.itiobj || ''} - ${event.itiins || ''}`]
      }

      if (event.trdmde != '') {
        return String(event.trdmde).split('|').filter(Boolean)
      }

      return []
    },
    eventStatusLabel(event) {
      if (this.isLeaveEvent(event)) {
        return 'LEAVE'
      }
      if (event.trdsts == 'LEAVE') {
        return ''
      }
      return event.trdsts || ''
    },
    isLeaveEvent(event) {
      const title = String(event.title || '')
        .trim()
        .toUpperCase()
      return event.trdsts == 'LEAVE' && ['VL', 'SL'].includes(title)
    },
    isScheduledEvent(event) {
      return event.trdsts == 'SCHEDULED'
    },
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
      this.calendarLoading = true
      return this.getServiceCalendar({
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
        .finally(() => {
          this.calendarLoading = false
        })
    },
    openServiceItineraryDialog() {
      this.$refs.serviceItineraryDialog.open()
    },
    openServiceAddDataDialog() {
      this.$refs.serviceAddDataDialog.open()
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
.service-calendar-page {
  min-height: 100vh;
  padding: 24px;
  background: linear-gradient(180deg, #f7fbfc 0%, #eef5f7 100%);
}

.service-calendar {
  max-width: 1440px;
  margin: 0 auto;
}

.service-calendar__hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  padding: 24px;
  border: 1px solid #dbe7ec;
  border-radius: 8px;
  background: linear-gradient(135deg, #00695c 0%, #1976d2 100%);
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.12);
  color: #fff;
}

.service-calendar__eyebrow {
  margin: 0 0 8px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.service-calendar__hero h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 900;
  letter-spacing: 0;
}

.service-calendar__subtitle {
  max-width: 620px;
  margin: 8px 0 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 14px;
}

.service-calendar__month {
  display: flex;
  min-width: 220px;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.service-calendar__month span {
  font-size: 24px;
  font-weight: 900;
}

.service-calendar__month small {
  color: rgba(255, 255, 255, 0.78);
  font-size: 12px;
  font-weight: 600;
  text-align: right;
}

.service-calendar__controls {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid #dbe7ec;
  border-radius: 8px;
  background: #fff;
}

.service-calendar__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.service-calendar__nav-btn {
  color: #344054;
}

.service-calendar__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.service-calendar__stat {
  padding: 14px 16px;
  border: 1px solid #dbe7ec;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
}

.service-calendar__stat span {
  display: block;
  color: #102a43;
  font-size: 24px;
  font-weight: 900;
}

.service-calendar__stat small {
  color: #62748a;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.service-calendar__calendar-card {
  margin-top: 16px;
  overflow: hidden;
  border: 1px solid #dbe7ec;
  border-radius: 8px;
  background: #fff;
  position: relative;
}

.service-calendar__loading {
  align-items: center;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(15, 118, 110, 0.14);
  border-radius: 8px;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.12);
  color: #0f172a;
  display: grid;
  gap: 8px;
  justify-items: center;
  min-width: 260px;
  padding: 22px;
  text-align: center;
}

.service-calendar__loading span {
  color: #64748b;
  font-size: 13px;
}

.service-calendar__calendar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  border-bottom: 1px solid #e4edf1;
}

.service-calendar__calendar-head h2 {
  margin: 0;
  color: #102a43;
  font-size: 20px;
  font-weight: 900;
}

.service-calendar__calendar-head p {
  margin: 4px 0 0;
  color: #62748a;
  font-size: 13px;
}

.service-calendar__sheet {
  height: 780px;
  padding: 12px;
  background: #fff;
}

.service-calendar__sheet ::v-deep .v-calendar-weekly__day {
  overflow: hidden auto;
  min-width: 0;
  contain: paint;
}

.service-calendar__sheet ::v-deep .v-calendar-weekly__day::-webkit-scrollbar {
  width: 4px;
}

.service-calendar__sheet ::v-deep .v-calendar-weekly__day::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: #c7d5dd;
}

.calendar-event {
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  padding: 6px 7px;
  overflow: hidden;
  border-left: 4px solid #1976d2;
  border-radius: 6px;
  background: #eff6ff;
  color: #102a43;
  cursor: pointer;
  font-size: 11px;
  line-height: 1.25;
}

.calendar-event__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 6px;
  min-width: 0;
}

.calendar-event__top span {
  min-width: 0;
  overflow: hidden;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.calendar-event__top small {
  flex: 0 0 auto;
  color: #52606d;
  font-size: 9px;
  font-weight: 900;
}

.calendar-event p {
  display: -webkit-box;
  margin: 3px 0 0;
  overflow: hidden;
  color: #52606d;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.calendar-event--scheduled {
  border-left-color: #1976d2;
  background: #eff6ff;
}

.calendar-event--start {
  border-left-color: #00897b;
  background: #e7f8f4;
}

.calendar-event--leave {
  border-left-color: #2e7d32;
  background: #e9f6eb;
}

.calendar-event--note {
  border-left-color: #f0a202;
  background: #fff8e6;
}

.calendar-menu-card {
  overflow: hidden;
  border: 1px solid #dbe7ec;
  border-radius: 8px;
}

.calendar-menu-card__toolbar {
  background: linear-gradient(135deg, #00695c 0%, #1976d2 100%) !important;
}

.calendar-menu-card__toolbar .v-toolbar__title {
  overflow: hidden;
  font-size: 15px;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.calendar-menu-card__meta {
  display: grid;
  grid-template-columns: 90px minmax(0, 1fr);
  gap: 8px;
  margin-bottom: 10px;
  color: #344054;
  font-size: 13px;
}

.calendar-menu-card__meta strong {
  color: #102a43;
}

.calendar-menu-card__location {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #00695c;
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
}

.calendar-menu-card__actions {
  border-top: 1px solid #e4edf1;
}

.service-calendar__footer {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  margin-top: 18px;
  padding: 18px 20px;
  border: 1px solid #dbe7ec;
  border-radius: 8px;
  background: #fff;
  color: #102a43;
}

.service-calendar__footer div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.service-calendar__footer span {
  color: #62748a;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
}

.service-calendar__footer strong {
  font-size: 13px;
}

@media (max-width: 960px) {
  .service-calendar-page {
    padding: 12px;
  }

  .service-calendar__hero,
  .service-calendar__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .service-calendar__month {
    align-items: flex-start;
  }

  .service-calendar__actions {
    justify-content: flex-start;
  }

  .service-calendar__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .service-calendar__sheet {
    height: 680px;
  }
}

@media (max-width: 600px) {
  .service-calendar__hero {
    padding: 18px;
  }

  .service-calendar__hero h1 {
    font-size: 26px;
  }

  .service-calendar__stats {
    grid-template-columns: 1fr;
  }

  .service-calendar__sheet {
    height: 620px;
    padding: 6px;
  }

  .calendar-event {
    padding: 5px;
    font-size: 10px;
  }
}

@media print {
  .service-calendar-page {
    padding: 0;
    background: #fff;
  }

  .service-calendar {
    max-width: none;
  }

  .no-print {
    display: none;
  }

  .service-calendar__hero,
  .service-calendar__calendar-card,
  .service-calendar__footer {
    box-shadow: none;
  }

  .service-calendar__sheet {
    height: auto;
    padding: 0;
  }

  .calendar-event__top small {
    display: none;
  }

  .calendar-event--print-hidden {
    display: none !important;
  }
}
</style>
