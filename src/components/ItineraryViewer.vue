<template>
  <v-container fluid class="itinerary-viewer-page">
    <div id="printDiv" class="itinerary-viewer">
      <section class="itinerary-viewer__hero">
        <div>
          <p class="itinerary-viewer__eyebrow">Marsman Drysdale Medical Product Inc.</p>
          <h1>Itinerary Viewer</h1>
          <p class="itinerary-viewer__subtitle">Review medical representative itinerary progress and visit status.</p>
        </div>

        <div class="itinerary-viewer__month">
          <span>{{ myDate }}</span>
          <small>{{ viewerName }}</small>
        </div>
      </section>

      <section class="itinerary-viewer__stats no-print">
        <div class="itinerary-viewer__stat">
          <span>{{ itineraryCount }}</span>
          <small>Total items</small>
        </div>
        <div class="itinerary-viewer__stat">
          <span>{{ startedCount }}</span>
          <small>Started</small>
        </div>
        <div class="itinerary-viewer__stat">
          <span>{{ completedCount }}</span>
          <small>Completed</small>
        </div>
        <div class="itinerary-viewer__stat">
          <span>{{ leaveCount }}</span>
          <small>Leave</small>
        </div>
      </section>

      <v-card class="itinerary-viewer__calendar-card" flat>
        <div class="itinerary-viewer__calendar-head">
          <div>
            <h2>{{ myDate }}</h2>
            <p>Click an itinerary item to view customer, objective, and visit status.</p>
          </div>
          <div class="itinerary-viewer__actions no-print">
            <v-btn depressed color="teal darken-2" dark @click="dataReload">
              <v-icon left small>refresh</v-icon>
              Reload
            </v-btn>
            <v-btn depressed color="grey lighten-3" class="itinerary-viewer__nav-btn" @click="$refs.calendar.prev()">
              <v-icon left small>keyboard_arrow_left</v-icon>
              Prev
            </v-btn>
            <v-btn depressed color="grey lighten-3" class="itinerary-viewer__nav-btn" @click="$refs.calendar.next()">
              Next
              <v-icon right small>keyboard_arrow_right</v-icon>
            </v-btn>
            <v-btn depressed color="indigo" dark @click="printDiv('printDiv')">
              <v-icon left small>print</v-icon>
              Print
            </v-btn>
          </div>
        </div>

        <v-sheet class="itinerary-viewer__sheet">
          <v-calendar ref="calendar" v-model="today" type="month" color="teal darken-2">
            <template v-slot:day="{ date }">
              <template v-for="event in eventsMap[date]">
                <v-menu
                  :key="event.itimid || event.trdmti || event.title + date"
                  v-model="event.open"
                  :close-on-content-click="false"
                  max-width="380"
                  offset-y
                >
                  <template v-slot:activator="{ on }">
                    <div v-if="!event.time" class="itinerary-event mb-1" :class="eventClass(event)" v-ripple v-on="on">
                      <div class="itinerary-event__top">
                        <span>{{ eventTitleLine(event) }}</span>
                        <small v-if="eventStatusLabel(event)">{{ eventStatusLabel(event) }}</small>
                      </div>
                      <p v-if="event.itiobj">{{ event.itiobj }}</p>
                    </div>
                  </template>
                  <v-card
                    v-show="!isLeaveEvent(event)"
                    class="itinerary-menu-card"
                    min-width="320px"
                    max-width="380px"
                    flat
                  >
                    <v-toolbar dark flat height="56" class="itinerary-menu-card__toolbar">
                      <v-toolbar-title>{{ event.title }}</v-toolbar-title>
                      <v-spacer></v-spacer>
                    </v-toolbar>
                    <v-card-text>
                      <div v-if="event.customer" class="itinerary-menu-card__meta">
                        <strong>Customer</strong>
                        <span>{{ event.customer }}</span>
                      </div>
                      <div v-if="event.client" class="itinerary-menu-card__meta">
                        <strong>Client</strong>
                        <span>{{ event.client }}</span>
                      </div>
                      <div v-if="event.itiobj" class="itinerary-menu-card__meta">
                        <strong>Objective</strong>
                        <span>{{ event.itiobj }}</span>
                      </div>
                      <div class="itinerary-menu-card__meta">
                        <strong>Status</strong>
                        <span>{{ eventStatusLabel(event) }}</span>
                      </div>
                    </v-card-text>
                    <v-card-actions class="itinerary-menu-card__actions">
                      <v-chip v-show="event.itists == '1'" small color="orange lighten-5" text-color="orange darken-3">
                        Not Yet Visited
                      </v-chip>
                      <v-chip v-show="event.itists != '1'" small color="green lighten-5" text-color="green darken-3">
                        Visited
                      </v-chip>
                    </v-card-actions>
                  </v-card>
                </v-menu>
              </template>
            </template>
          </v-calendar>
        </v-sheet>
      </v-card>
    </div>
  </v-container>
</template>
<script>
import { mapActions, mapState, mapMutations } from 'vuex'
import moment from 'moment'
import ItineraryDialog from '../components/MRItineraryDialog.vue'
export default {
  components: {
    ItineraryDialog,
  },
  data: () => ({
    menuOpenCLose: false,
    menu: false,
    today: moment(new Date()).format('YYYY-MM-DD'),
    // myDate: moment(new Date()).format("MMMM YYYY"),
    lat: '',
    long: '',
    dialog: false,
    enableStart: false,
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
    viewerName() {
      if (this.CurUserDetails.CNTMST) {
        return this.CurUserDetails.CNTMST.CNTMCN
      }
      if (this.CurUserDetails.USRDTL) {
        return this.CurUserDetails.USRDTL.USRDCI
      }
      return 'Itinerary'
    },
    itineraryCount() {
      return this.CurITIMSTList.length
    },
    startedCount() {
      return this.CurITIMSTList.filter(event => event.trdsts == 'START').length
    },
    completedCount() {
      return this.CurITIMSTList.filter(event => event.trdsts == 'WORK COMPLETE' || event.itists != '1').length
    },
    leaveCount() {
      return this.CurITIMSTList.filter(event => this.isLeaveEvent(event)).length
    },
  },
  mounted() {
    this.dataReload()
    this.GetMyCoordinates()
    console.log(moment(this.today).format('MMMM YYYY'))
  },
  methods: {
    ...mapActions(['getITIMSTPerCNT', 'getTRDMST', 'getITIMSTTRDValidation']),
    ...mapMutations(['upCurITIMSTList']),
    eventClass(event) {
      const classes = []
      if (this.isScheduledEvent(event)) {
        classes.push('calendar-event--print-hidden')
      }

      if (this.isLeaveEvent(event)) {
        classes.push('itinerary-event--leave')
        return classes
      }
      if (event.trdsts == 'WORK COMPLETE') {
        classes.push('itinerary-event--complete')
        return classes
      }
      if (event.trdsts == 'START') {
        classes.push('itinerary-event--start')
        return classes
      }
      classes.push('itinerary-event--pending')
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
      if (event.trdsts) {
        return event.trdsts
      }
      return event.itists == '1' ? 'NOT YET VISITED' : 'VISITED'
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
      this.getITIMSTPerCNT(this.$route.params.CNTMID).then(res => {
        this.upCurITIMSTList(res)
      })
    },
    GetMyCoordinates() {
      navigator.geolocation.getCurrentPosition(
        position => {
          this.lat = position.coords.latitude
          this.long = position.coords.longitude
          console.log(this.lat, this.long)
        },
        error => {
          alert(error.message)
        }
      )
    },
    goToCustomer(item) {
      this.$router.push({ path: `/customer/${item}` })
    },
    StartItineraryValidation(item) {
      if (this.lat == '') {
        alert('Location is Required!')
        this.enableStart = false
      } else {
        let confirmAction = confirm('Start visit?')
        if (confirmAction) {
          let myValidation = JSON.stringify({
            itimid: item.itimid,
          })
          this.getITIMSTTRDValidation({ data: myValidation })
            .then(res => {
              if (res.data == 0) {
                this.enableStart = true
                this.StartTTPItinerary(item)
              } else {
                alert('Your itinerary is already started.')
              }
            })
            .catch(error => {
              console.log(error)
              this.enableStart = false
            })
        } else {
          alert('Action cancelled')
          this.enableStart = false
        }
      }
    },
    StartTTPItinerary(item) {
      let data = JSON.stringify({
        UserID: this.CurUserDetails.USRDTL.USRDCI,
        customerRepID: item.cstmid,
        CustomerID: item.accmid,
        SRFormType: 'Visit',
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
            const iData = res.data
            this.StartItinerary(iData.srid, item)
            this.enableStart = false
          }
        })
        .catch(error => {
          alert(error)
          this.enableStart = false
        })
    },
    StartItinerary(srid, item) {
      this.GetMyCoordinates()

      let data = JSON.stringify({
        TRDADT: moment(new Date(), 'ddd MMM DD YYYY kk:mm:SS').format('YYYY/MM/DD HH:mm'),
        TRDCNT: '0',
        TRDMAC: item.accmid,
        TRDMCL: 'N/A',
        TRDMDE: item.cstmid,
        TRDMMC: '',
        TRDMST: 'true',
        TRDMTT: srid,
        TRDMTY: 'MedRep Visit',
        TRDMUI: this.CurUserDetails.USRDTL.USRDCI,
        TRDSEC: 'Itinerary',
        TRDSTS: 'START',
        TRDCRN: '',
        TRDLOC: this.lat + ' ' + this.long,
        TRDITI: item.itimid,
      })
      setTimeout(function () {
        console.log(data)
      }, 1000)

      this.getTRDMST({ data: data }).then(res => {
        this.dataReload()
        this.Sample(res.data, item)
      })
    },

    Sample(data, item) {
      console.log(data)
      let dataTwo = JSON.stringify({
        RECEIVER: this.CurUserDetails.CNTMST.CNTTGP,
        SENDER: this.CurUserDetails.CNTMST.CNTMNN,
        MESSAGE: 'Visited ' + item.customer + ' at ' + item.client,
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
      axios(OpheadersTwo).then(res => {
        if (res.status == 200) {
          this.dialog = false
        }
      })
    },
  },
}
</script>
<style scoped>
.itinerary-viewer-page {
  min-height: 100vh;
  padding: 24px;
  background: linear-gradient(180deg, #f7fbfc 0%, #eef5f7 100%);
}

.itinerary-viewer {
  max-width: 1440px;
  margin: 0 auto;
}

.itinerary-viewer__hero {
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

.itinerary-viewer__eyebrow {
  margin: 0 0 8px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.itinerary-viewer__hero h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 900;
  letter-spacing: 0;
}

.itinerary-viewer__subtitle {
  max-width: 620px;
  margin: 8px 0 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 14px;
}

.itinerary-viewer__month {
  display: flex;
  min-width: 220px;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.itinerary-viewer__month span {
  font-size: 24px;
  font-weight: 900;
}

.itinerary-viewer__month small {
  max-width: 280px;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.78);
  font-size: 12px;
  font-weight: 600;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.itinerary-viewer__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.itinerary-viewer__stat {
  padding: 14px 16px;
  border: 1px solid #dbe7ec;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
}

.itinerary-viewer__stat span {
  display: block;
  color: #102a43;
  font-size: 24px;
  font-weight: 900;
}

.itinerary-viewer__stat small {
  color: #62748a;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.itinerary-viewer__calendar-card {
  margin-top: 16px;
  overflow: hidden;
  border: 1px solid #dbe7ec;
  border-radius: 8px;
  background: #fff;
}

.itinerary-viewer__calendar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  border-bottom: 1px solid #e4edf1;
}

.itinerary-viewer__calendar-head h2 {
  margin: 0;
  color: #102a43;
  font-size: 20px;
  font-weight: 900;
}

.itinerary-viewer__calendar-head p {
  margin: 4px 0 0;
  color: #62748a;
  font-size: 13px;
}

.itinerary-viewer__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.itinerary-viewer__nav-btn {
  color: #344054;
}

.itinerary-viewer__sheet {
  height: 1180px;
  padding: 12px;
  background: #fff;
}

.itinerary-viewer__sheet ::v-deep .v-calendar-weekly__day {
  overflow: hidden auto;
  min-width: 0;
  contain: paint;
}

.itinerary-viewer__sheet ::v-deep .v-calendar-weekly__day::-webkit-scrollbar {
  width: 4px;
}

.itinerary-viewer__sheet ::v-deep .v-calendar-weekly__day::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: #c7d5dd;
}

.itinerary-event {
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  padding: 3px 5px;
  overflow: hidden;
  border-left: 3px solid #df0404;
  border-radius: 4px;
  background: #fff1f1;
  color: #102a43;
  cursor: pointer;
  font-size: 9px;
  line-height: 1.15;
}

.itinerary-event__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 4px;
  min-width: 0;
}

.itinerary-event__top span {
  min-width: 0;
  overflow: hidden;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.itinerary-event__top small {
  flex: 0 0 auto;
  color: #52606d;
  font-size: 7px;
  font-weight: 900;
}

.itinerary-event p {
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

.itinerary-event--start {
  border-left-color: #1976d2;
  background: #eff6ff;
}

.itinerary-event--complete,
.itinerary-event--leave {
  border-left-color: #2e7d32;
  background: #e9f6eb;
}

.itinerary-event--pending {
  border-left-color: #df0404;
  background: #fff1f1;
}

.itinerary-menu-card {
  overflow: hidden;
  border: 1px solid #dbe7ec;
  border-radius: 8px;
}

.itinerary-menu-card__toolbar {
  background: linear-gradient(135deg, #00695c 0%, #1976d2 100%) !important;
}

.itinerary-menu-card__toolbar .v-toolbar__title {
  overflow: hidden;
  font-size: 15px;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.itinerary-menu-card__meta {
  display: grid;
  grid-template-columns: 90px minmax(0, 1fr);
  gap: 8px;
  margin-bottom: 10px;
  color: #344054;
  font-size: 13px;
}

.itinerary-menu-card__meta strong {
  color: #102a43;
}

.itinerary-menu-card__actions {
  border-top: 1px solid #e4edf1;
}

@media (max-width: 960px) {
  .itinerary-viewer-page {
    padding: 12px;
  }

  .itinerary-viewer__hero,
  .itinerary-viewer__calendar-head {
    flex-direction: column;
    align-items: stretch;
  }

  .itinerary-viewer__month {
    align-items: flex-start;
  }

  .itinerary-viewer__month small {
    text-align: left;
  }

  .itinerary-viewer__actions {
    justify-content: flex-start;
  }

  .itinerary-viewer__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .itinerary-viewer__sheet {
    height: 980px;
  }
}

@media (max-width: 600px) {
  .itinerary-viewer__hero {
    padding: 18px;
  }

  .itinerary-viewer__hero h1 {
    font-size: 26px;
  }

  .itinerary-viewer__stats {
    grid-template-columns: 1fr;
  }

  .itinerary-viewer__sheet {
    height: 860px;
    padding: 6px;
  }

  .itinerary-event {
    padding: 3px 4px;
    font-size: 8px;
  }
}

@media print {
  .itinerary-viewer-page {
    padding: 0;
    background: #fff;
  }

  .itinerary-viewer {
    max-width: none;
  }

  .no-print {
    display: none;
  }

  .itinerary-viewer__hero,
  .itinerary-viewer__calendar-card {
    box-shadow: none;
  }

  .itinerary-viewer__sheet {
    height: auto;
    padding: 0;
  }

  .itinerary-event__top small {
    display: none;
  }

  .calendar-event--print-hidden {
    display: none !important;
  }
}
</style>
