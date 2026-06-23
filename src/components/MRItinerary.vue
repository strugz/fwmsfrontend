<template>
  <v-container fluid class="mr-itinerary-page">
    <div id="printDiv" class="mr-itinerary">
      <section class="mr-itinerary__hero">
        <div>
          <p class="mr-itinerary__eyebrow">Marsman Drysdale Medical Product Inc.</p>
          <h1>MR Itinerary</h1>
          <p class="mr-itinerary__subtitle">Plan, start, and manage your medical representative visits.</p>
        </div>

        <div class="mr-itinerary__month">
          <span>{{ myDate }}</span>
          <small>{{ ownerName }}</small>
        </div>
      </section>

      <section class="mr-itinerary__stats no-print">
        <div class="mr-itinerary__stat">
          <span>{{ itineraryCount }}</span>
          <small>Total items</small>
        </div>
        <div class="mr-itinerary__stat">
          <span>{{ pendingApprovalCount }}</span>
          <small>Pending approval</small>
        </div>
        <div class="mr-itinerary__stat">
          <span>{{ startedCount }}</span>
          <small>Started</small>
        </div>
        <div class="mr-itinerary__stat">
          <span>{{ completedCount }}</span>
          <small>Completed</small>
        </div>
      </section>

      <v-card class="mr-itinerary__calendar-card" flat>
        <v-overlay absolute :value="calendarLoading" opacity="0.08" color="#0f766e">
          <div class="mr-itinerary__loading">
            <v-progress-circular indeterminate color="teal darken-2" size="42"></v-progress-circular>
            <strong>Loading itinerary</strong>
            <span>Fetching the latest calendar records...</span>
          </div>
        </v-overlay>

        <div class="mr-itinerary__calendar-head">
          <div>
            <h2>{{ myDate }}</h2>
            <p>Click an itinerary item to start, view, delete, or manage leave entries.</p>
          </div>
          <div class="mr-itinerary__actions no-print">
            <v-btn
              depressed
              color="teal darken-2"
              dark
              :loading="calendarLoading"
              :disabled="calendarLoading"
              @click="dataReload"
            >
              <v-icon left small>refresh</v-icon>
              Reload
            </v-btn>
            <v-btn
              depressed
              color="grey lighten-3"
              class="mr-itinerary__nav-btn"
              :disabled="calendarLoading"
              @click="$refs.calendar.prev()"
            >
              <v-icon left small>keyboard_arrow_left</v-icon>
              Prev
            </v-btn>
            <v-btn depressed color="indigo" dark :disabled="calendarLoading" @click="printDiv('printDiv')">
              <v-icon left small>print</v-icon>
              Print
            </v-btn>
            <v-btn
              depressed
              color="grey lighten-3"
              class="mr-itinerary__nav-btn"
              :disabled="calendarLoading"
              @click="$refs.calendar.next()"
            >
              Next
              <v-icon right small>keyboard_arrow_right</v-icon>
            </v-btn>
          </div>
        </div>

        <v-sheet class="mr-itinerary__sheet">
          <v-calendar ref="calendar" v-model="today" type="month" color="teal darken-2">
            <template v-slot:day="{ date }">
              <template v-for="event in eventsMap[date]">
                <v-menu
                  :key="event.itimid || event.trdmti || event.title + date"
                  v-model="event.open"
                  :close-on-content-click="false"
                  max-width="420"
                  offset-y
                >
                  <template v-slot:activator="{ on }">
                    <div
                      v-if="!event.time"
                      class="mr-itinerary-event mb-1"
                      :class="eventClass(event)"
                      v-ripple
                      v-on="on"
                    >
                      <div class="mr-itinerary-event__top">
                        <span>{{ eventTitleLine(event) }}</span>
                        <small v-if="eventStatusLabel(event)">{{ eventStatusLabel(event) }}</small>
                      </div>
                      <p v-if="event.trdsts == 'WORK COMPLETE'">
                        {{ completedTimeRange(event) }}
                      </p>
                      <p v-else-if="event.itiobj">{{ event.itiobj }}</p>
                    </div>
                  </template>
                  <v-row no-gutters>
                    <v-card
                      v-show="!isLeaveEvent(event)"
                      class="mr-itinerary-menu-card"
                      min-width="340px"
                      max-width="420px"
                      flat
                    >
                      <v-toolbar dark flat height="56" class="mr-itinerary-menu-card__toolbar">
                        <v-toolbar-title>{{ event.title }}</v-toolbar-title>
                        <v-spacer></v-spacer>
                      </v-toolbar>
                      <v-card-text>
                        <div v-if="event.client" class="mr-itinerary-menu-card__meta">
                          <strong>Client</strong>
                          <span>{{ event.client }}</span>
                        </div>
                        <div v-if="event.customer" class="mr-itinerary-menu-card__meta">
                          <strong>Customer</strong>
                          <span>{{ event.customer }}</span>
                        </div>
                        <div v-if="event.itiobj" class="mr-itinerary-menu-card__meta">
                          <strong>Objective</strong>
                          <span>{{ event.itiobj }}</span>
                        </div>
                        <div v-if="event.trdsts == 'WORK COMPLETE'" class="mr-itinerary-menu-card__meta">
                          <strong>Time</strong>
                          <span>{{ completedTimeRange(event) }}</span>
                        </div>
                        <div class="mr-itinerary-menu-card__meta">
                          <strong>Status</strong>
                          <span>{{ eventStatusLabel(event) }}</span>
                        </div>
                        <div v-if="event.validation != 'NOT APPROVE'" class="mr-itinerary-menu-card__location">
                          <a :href="'https://www.google.com/maps?q=' + lat + ',' + long" target="_blank" color="success"
                            ><v-icon small color="teal darken-2">place</v-icon> Verify your location</a
                          >
                        </div>
                      </v-card-text>
                      <v-card-actions class="mr-itinerary-menu-card__actions">
                        <v-chip
                          v-if="event.validation == 'NOT APPROVE'"
                          small
                          color="red lighten-5"
                          text-color="red darken-3"
                        >
                          Pending approval
                        </v-chip>
                        <v-spacer></v-spacer>
                        <template v-if="event.validation != 'NOT APPROVE'">
                          <v-btn
                            v-show="event.itists == '1'"
                            @click="EndTravelValidation(event)"
                            :disabled="enableStart"
                            color="teal darken-2"
                            dark
                            depressed
                            small
                          >
                            START
                          </v-btn>
                        </template>
                        <v-btn
                          color="indigo"
                          dark
                          depressed
                          small
                          v-show="event.itists != '1'"
                          @click="goToCustomer(event.accmid)"
                        >
                          View
                        </v-btn>
                        <v-btn
                          v-show="event.trdsts != 'WORK COMPLETE' && event.trdsts != 'START'"
                          color="red darken-1"
                          text
                          small
                          @click="cancelItineraryTSR(event)"
                        >
                          Delete
                        </v-btn>
                        <v-progress-circular v-show="progValue" indeterminate color="primary"></v-progress-circular>
                      </v-card-actions>
                    </v-card>
                    <v-card
                      v-show="isLeaveEvent(event)"
                      class="mr-itinerary-menu-card"
                      min-width="340px"
                      max-width="420px"
                      flat
                    >
                      <v-toolbar dark flat height="56" class="mr-itinerary-menu-card__toolbar">
                        <v-toolbar-title>{{ event.title }}</v-toolbar-title>
                        <v-spacer></v-spacer>
                      </v-toolbar>
                      <v-card-text>
                        <p class="mb-0">This day is marked as leave or additional calendar data.</p>
                      </v-card-text>
                      <v-card-actions class="mr-itinerary-menu-card__actions">
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
    </div>

    <v-speed-dial bottom right fixed transition="slide-x-reverse-transition" direction="top" class="mb-6 mr-0 no-print">
      <template v-slot:activator>
        <v-btn color="teal darken-2" dark fab :disabled="calendarLoading">
          <v-icon>add</v-icon>
        </v-btn>
      </template>
      <v-btn small rounded dark color="teal" :disabled="calendarLoading" @click="openVisitDialog">
        <v-icon left small>add_location_alt</v-icon>
        Visit
      </v-btn>
      <v-btn
        v-show="CurUserDetails.CNTMST.CNTMGP == '1'"
        small
        rounded
        dark
        color="teal"
        :disabled="calendarLoading"
        @click="openTravelDialog"
      >
        <v-icon left small>near_me</v-icon>
        Travel
      </v-btn>
      <v-btn small rounded dark color="teal" :disabled="calendarLoading" @click="openAdditionalDialog">
        <v-icon left small>event_busy</v-icon>
        Other Act.
      </v-btn>
    </v-speed-dial>
    <itinerary-dialog ref="visitDialog" :show-activator="false"></itinerary-dialog>
    <itinerary-travel ref="travelDialog" :show-activator="false"></itinerary-travel>
    <additional-dialog ref="additionalDialog" :show-activator="false"></additional-dialog>
  </v-container>
</template>
<script>
import { mapActions, mapState, mapMutations } from 'vuex'
import moment from 'moment'
import ItineraryDialog from '../components/MRItineraryDialog.vue'
import AdditionalDialog from '../components/MRItineraryAdditional.vue'
import ItineraryTravel from '../components/MedRepTravel.vue'
export default {
  components: {
    ItineraryDialog,
    ItineraryTravel,
    AdditionalDialog,
  },
  data: () => ({
    menuOpenCLose: false,
    menu: false,
    today: moment(new Date()).format('YYYY-MM-DD'),
    lat: '',
    long: '',
    dialog: false,
    enableStart: false,
    progValue: false,
    calendarLoading: false,
  }),
  computed: {
    ...mapState(['CurITIMSTList', 'CurUserDetails', 'CurClientDetails']),
    eventsMap() {
      const map = {}
      this.CurITIMSTList.forEach(e => (map[e.date] = map[e.date] || []).push(e))
      return map
    },
    myDate() {
      return moment(this.today).format('MMMM YYYY')
    },
    ownerName() {
      return this.CurUserDetails.CNTMST ? this.CurUserDetails.CNTMST.CNTMCN : 'Itinerary'
    },
    selectedMonthEvents() {
      const selectedMonth = moment(this.today).format('YYYY-MM')
      return this.CurITIMSTList.filter(event => moment(event.date).format('YYYY-MM') === selectedMonth)
    },
    itineraryCount() {
      return this.selectedMonthEvents.length
    },
    pendingApprovalCount() {
      return this.selectedMonthEvents.filter(event => event.validation == 'NOT APPROVE').length
    },
    startedCount() {
      return this.selectedMonthEvents.filter(event => event.trdsts == 'START').length
    },
    completedCount() {
      return this.selectedMonthEvents.filter(event => event.trdsts == 'WORK COMPLETE').length
    },
  },
  mounted() {
    this.dataReload()
    this.GetMyCoordinates()
  },
  methods: {
    ...mapActions([
      'getITIMSTPerCNT',
      'getTRDMST',
      'getITIMSTTRDValidation',
      'getTRLMSTOnGoing',
      'deleteITITSR',
      'deleteLVETSR',
    ]),
    ...mapMutations(['upCurITIMSTList', 'upCurServiceCalendarDeleteItem']),
    eventClass(event) {
      const classes = []
      if (this.isScheduledEvent(event)) {
        classes.push('calendar-event--print-hidden')
      }

      if (event.validation == 'NOT APPROVE') {
        classes.push('mr-itinerary-event--approval')
        return classes
      }
      if (this.isLeaveEvent(event)) {
        classes.push('mr-itinerary-event--leave')
        return classes
      }
      if (event.trdsts == 'WORK COMPLETE') {
        classes.push('mr-itinerary-event--complete')
        return classes
      }
      if (event.trdsts == 'START') {
        classes.push('mr-itinerary-event--start')
        return classes
      }
      classes.push('mr-itinerary-event--pending')
      return classes
    },
    eventTitleLine(event) {
      return this.isLeaveEvent(event) ? event.title : event.client || event.customer || event.title || 'Itinerary item'
    },
    eventStatusLabel(event) {
      if (this.isLeaveEvent(event)) {
        return 'LEAVE'
      }
      if (event.trdsts == 'LEAVE') {
        return ''
      }
      if (event.validation == 'NOT APPROVE') {
        return 'PENDING'
      }
      if (event.trdsts) {
        return event.trdsts
      }
      return 'ITINERARY'
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
    completedTimeRange(event) {
      if (!event.trdmcd || !event.trdupd) {
        return ''
      }

      const started = new Date(event.trdmcd).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      const ended = new Date(event.trdupd).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })

      return `${started} to ${ended}`
    },
    cancelItineraryTSR(item) {
      this.deleteITITSR({ itimid: item.itimid })
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
    removeCalendarData() {
      localStorage.removeItem('mydata')
      location.reload()
    },
    CancelAddedData(item) {
      this.deleteLVETSR({
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
            this.removeCalendarData()
            this.dataReload()
          }
        })
        .catch(error => {
          console.log(error)
        })
    },
    open(event) {
      alert(event.title)
    },
    printDiv(divName) {
      var printContents = document.getElementById(divName).innerHTML
      var originalContents = document.body.innerHTML

      document.body.innerHTML = printContents

      window.print()
      document.body.innerHTML = originalContents
      location.reload()
    },
    dataReload() {
      this.calendarLoading = true
      return this.getITIMSTPerCNT(this.CurUserDetails.USRDTL.USRDCI)
        .then(res => {
          this.upCurITIMSTList(res)
        })
        .catch(error => {
          alert(error)
        })
        .finally(() => {
          this.calendarLoading = false
        })
    },
    openVisitDialog() {
      this.$refs.visitDialog.open()
    },
    openTravelDialog() {
      this.$refs.travelDialog.open()
    },
    openAdditionalDialog() {
      this.$refs.additionalDialog.open()
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
    goToCustomer(item) {
      this.$router.push({ path: `/customer/${item}` })
    },

    EndTravelValidation(item) {
      let userTemp = this.CurUserDetails.CNTMST
      if (userTemp.CNTMGP == '1') {
        let dataTemp = JSON.stringify({
          TRLCDT: moment(new Date()).format('YYYY-MM-DD'),
          TRLCNT: this.CurUserDetails.CNTMST.CNTMID,
          TRLSTS: '1',
        })
        this.getTRLMSTOnGoing({ data: dataTemp })
          .then(res => {
            if (res.status == 200) {
              this.StartItineraryValidation(item)
            } else if (res.status == 204) {
              alert("You Didn't Start your Travel.")
            }
          })
          .error(error => {
            console.log(error)
          })
      } else {
        this.StartItineraryValidation(item)
      }
    },
    StartItineraryValidation(item) {
      if (this.lat == '') {
        alert('Location is Required!')
        this.enableStart = false
      } else {
        let confirmAction = confirm('Start visit?')
        if (confirmAction) {
          this.progValue = true
          this.enableStart = true
          this.StartTTPItinerary(item)
          this.progValue = false
        } else {
          alert('Action cancelled')
          this.enableStart = false
          this.progValue = false
        }
      }
    },
    StartTTPItinerary(item) {
      let data = JSON.stringify({
        UserID: this.CurUserDetails.USRDTL.USRDCI,
        customerRepID: item.cstmid,
        CustomerID: item.accmid,
        SRFormType: 'Visit',
        TRDLOC: this.lat + ' ' + this.long,
        TRDITI: item.itimid,
        TRDADT: moment(new Date(), 'ddd MMM DD YYYY kk:mm:SS').format('YYYY/MM/DD HH:mm'),
      })
      const Opheaders = {
        method: 'POST',
        data: data,
        headers: {
          'content-type': 'application/json',
        },
        url: 'https://sr.mdmpi.com.ph/sr/MedRepItineraryReport/beginmedrepvisit',
      }
      axios(Opheaders)
        .then(res => {
          if (res.status == 201) {
            this.dataReload()
            this.Sample(item)
            this.enableStart = false
            this.progValue = false
          } else if (res.status == 200) {
            if (res.data.message == 'PENDING') {
              alert(
                'Your data has a record that is not yet approved or finalized. Please complete it before proceeding.'
              )
            } else {
              alert('This Itinerary has already started.')
            }
            this.enableStart = false
            this.progValue = false
          }
          this.enableStart = false
          this.progValue = false
        })
        .catch(error => {
          alert(error)
          this.enableStart = false
          this.progValue = false
        })
    },
    Sample(item) {
      console.log(item)
      let dataTwo = JSON.stringify({
        RECEIVER: this.CurUserDetails.CNTMST.CNTTGP,
        SENDER: this.CurUserDetails.CNTMST.CNTMNN,
        MESSAGE: 'Visited ' + item.customer + ' at ' + item.client + ' Objective: ' + item.itiobj,
      })
      console.log(dataTwo, 'sample')
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
      axios(OpheadersTwo)
        .then(res => {
          if (res.status == 200) {
            this.dialog = false
          }
          this.dialog = false
        })
        .catch(error => {
          console.log(error)
          this.dialog = false
        })
    },
  },
}
</script>
<style scoped>
.mr-itinerary-page {
  min-height: 100vh;
  padding: 24px;
  background: linear-gradient(180deg, #f7fbfc 0%, #eef5f7 100%);
}

.mr-itinerary {
  max-width: 1440px;
  margin: 0 auto;
}

.mr-itinerary__hero {
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

.mr-itinerary__eyebrow {
  margin: 0 0 8px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.mr-itinerary__hero h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 900;
  letter-spacing: 0;
}

.mr-itinerary__subtitle {
  max-width: 620px;
  margin: 8px 0 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 14px;
}

.mr-itinerary__month {
  display: flex;
  min-width: 220px;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.mr-itinerary__month span {
  font-size: 24px;
  font-weight: 900;
}

.mr-itinerary__month small {
  max-width: 280px;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.78);
  font-size: 12px;
  font-weight: 600;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mr-itinerary__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.mr-itinerary__stat {
  padding: 14px 16px;
  border: 1px solid #dbe7ec;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
}

.mr-itinerary__stat span {
  display: block;
  color: #102a43;
  font-size: 24px;
  font-weight: 900;
}

.mr-itinerary__stat small {
  color: #62748a;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.mr-itinerary__calendar-card {
  margin-top: 16px;
  overflow: hidden;
  border: 1px solid #dbe7ec;
  border-radius: 8px;
  background: #fff;
  position: relative;
}

.mr-itinerary__loading {
  align-items: center;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(15, 118, 110, 0.14);
  border-radius: 8px;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.12);
  color: #0f172a;
  display: grid;
  gap: 8px;
  justify-items: center;
  min-width: 240px;
  padding: 22px;
  text-align: center;
}

.mr-itinerary__loading span {
  color: #64748b;
  font-size: 13px;
}

.mr-itinerary__calendar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  border-bottom: 1px solid #e4edf1;
}

.mr-itinerary__calendar-head h2 {
  margin: 0;
  color: #102a43;
  font-size: 20px;
  font-weight: 900;
}

.mr-itinerary__calendar-head p {
  margin: 4px 0 0;
  color: #62748a;
  font-size: 13px;
}

.mr-itinerary__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.mr-itinerary__nav-btn {
  color: #344054;
}

.mr-itinerary__sheet {
  height: 1180px;
  padding: 12px;
  background: #fff;
}

.mr-itinerary__sheet ::v-deep .v-calendar-weekly__day {
  overflow: hidden auto;
  min-width: 0;
  contain: paint;
}

.mr-itinerary__sheet ::v-deep .v-calendar-weekly__day::-webkit-scrollbar {
  width: 4px;
}

.mr-itinerary__sheet ::v-deep .v-calendar-weekly__day::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: #c7d5dd;
}

.mr-itinerary-event {
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  padding: 3px 5px;
  overflow: hidden;
  border-left: 3px solid #f0a202;
  border-radius: 4px;
  background: #fff8e6;
  color: #102a43;
  cursor: pointer;
  font-size: 9px;
  line-height: 1.15;
}

.mr-itinerary-event__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 4px;
  min-width: 0;
}

.mr-itinerary-event__top span {
  min-width: 0;
  overflow: hidden;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mr-itinerary-event__top small {
  flex: 0 0 auto;
  color: #52606d;
  font-size: 7px;
  font-weight: 900;
}

.mr-itinerary-event p {
  display: -webkit-box;
  margin: 1px 0 0;
  overflow: hidden;
  color: #52606d;
  font-size: 8px;
  line-height: 1.15;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.mr-itinerary-event--approval {
  border-left-color: #df0404;
  background: #fff1f1;
}

.mr-itinerary-event--start {
  border-left-color: #1976d2;
  background: #eff6ff;
}

.mr-itinerary-event--complete,
.mr-itinerary-event--leave {
  border-left-color: #2e7d32;
  background: #e9f6eb;
}

.mr-itinerary-event--pending {
  border-left-color: #f0a202;
  background: #fff8e6;
}

.mr-itinerary-menu-card {
  overflow: hidden;
  border: 1px solid #dbe7ec;
  border-radius: 8px;
}

.mr-itinerary-menu-card__toolbar {
  background: linear-gradient(135deg, #00695c 0%, #1976d2 100%) !important;
}

.mr-itinerary-menu-card__toolbar .v-toolbar__title {
  overflow: hidden;
  font-size: 15px;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mr-itinerary-menu-card__meta {
  display: grid;
  grid-template-columns: 90px minmax(0, 1fr);
  gap: 8px;
  margin-bottom: 10px;
  color: #344054;
  font-size: 13px;
}

.mr-itinerary-menu-card__meta strong {
  color: #102a43;
}

.mr-itinerary-menu-card__location a {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #00695c;
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
}

.mr-itinerary-menu-card__actions {
  border-top: 1px solid #e4edf1;
}

@media (max-width: 960px) {
  .mr-itinerary-page {
    padding: 12px;
  }

  .mr-itinerary__hero,
  .mr-itinerary__calendar-head {
    flex-direction: column;
    align-items: stretch;
  }

  .mr-itinerary__month {
    align-items: flex-start;
  }

  .mr-itinerary__month small {
    text-align: left;
  }

  .mr-itinerary__actions {
    justify-content: flex-start;
  }

  .mr-itinerary__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .mr-itinerary__sheet {
    height: 980px;
  }
}

@media (max-width: 600px) {
  .mr-itinerary__hero {
    padding: 18px;
  }

  .mr-itinerary__hero h1 {
    font-size: 26px;
  }

  .mr-itinerary__stats {
    grid-template-columns: 1fr;
  }

  .mr-itinerary__sheet {
    height: 860px;
    padding: 6px;
  }

  .mr-itinerary-event {
    padding: 3px 4px;
    font-size: 8px;
  }
}

@media print {
  .mr-itinerary-page {
    padding: 0;
    background: #fff;
  }

  .mr-itinerary {
    max-width: none;
  }

  .no-print {
    display: none;
  }

  .mr-itinerary__hero,
  .mr-itinerary__calendar-card {
    box-shadow: none;
  }

  .mr-itinerary__sheet {
    height: auto;
    padding: 0;
  }

  .mr-itinerary-event__top small {
    display: none;
  }

  .calendar-event--print-hidden {
    display: none !important;
  }
}
</style>
