<template>
  <v-container fluid class="ps-calendar-page">
    <div id="printDiv" class="ps-calendar">
      <section class="ps-calendar__hero">
        <div>
          <p class="ps-calendar__eyebrow">Marsman Drysdale Medical Product Inc.</p>
          <h1>Calendar Planner</h1>
          <p class="ps-calendar__subtitle">
            Review planned PS activities, scheduled work, started items, and leave entries.
          </p>
        </div>

        <div class="ps-calendar__month">
          <span>{{ myDate }}</span>
          <small>{{ selectedUserName }}</small>
        </div>
      </section>

      <v-card class="ps-calendar__controls no-print" flat>
        <v-row align="center" dense>
          <v-col cols="12" md="3">
            <v-combobox
              v-model="selectedItemDepartment"
              :items="departmentList"
              item-text="DPTNME"
              item-value="DPTNME"
              label="Select Department"
              outlined
              dense
              hide-details
              prepend-inner-icon="business"
            ></v-combobox>
          </v-col>
          <v-col cols="12" md="3">
            <v-combobox
              v-model="selectedItemUser"
              :items="userList"
              item-text="CNTMNN"
              item-value="CNTMID"
              label="Select User"
              outlined
              dense
              hide-details
              prepend-inner-icon="person"
            ></v-combobox>
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-text-field v-model="datefrom" type="date" label="From" outlined dense hide-details></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-text-field v-model="dateto" type="date" label="To" outlined dense hide-details></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <div class="ps-calendar__actions">
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
                color="red lighten-5"
                class="red--text text--darken-2"
                :disabled="calendarLoading"
                @click="removeCalendarData"
              >
                Reset
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card>

      <section class="ps-calendar__stats no-print">
        <div class="ps-calendar__stat">
          <span>{{ calendarCount }}</span>
          <small>Total items</small>
        </div>
        <div class="ps-calendar__stat">
          <span>{{ scheduledCount }}</span>
          <small>Scheduled</small>
        </div>
        <div class="ps-calendar__stat">
          <span>{{ startedCount }}</span>
          <small>Started</small>
        </div>
        <div class="ps-calendar__stat">
          <span>{{ leaveCount }}</span>
          <small>Leave</small>
        </div>
      </section>

      <v-card class="ps-calendar__calendar-card" flat>
        <v-overlay absolute :value="calendarLoading" opacity="0.08" color="#0f766e">
          <div class="ps-calendar__loading">
            <v-progress-circular indeterminate color="teal darken-2" size="42"></v-progress-circular>
            <strong>Loading calendar</strong>
            <span>Fetching records for the selected user...</span>
          </div>
        </v-overlay>

        <div class="ps-calendar__calendar-head">
          <div>
            <h2>{{ myDate }}</h2>
            <p>Click a calendar item to review instruments, status, and activity details.</p>
          </div>
          <div class="ps-calendar__month-actions no-print">
            <v-btn
              depressed
              color="grey lighten-3"
              class="ps-calendar__nav-btn"
              :disabled="calendarLoading"
              @click="$refs.calendar.prev()"
            >
              <v-icon left small>keyboard_arrow_left</v-icon>
              Prev
            </v-btn>
            <v-btn
              depressed
              color="grey lighten-3"
              class="ps-calendar__nav-btn"
              :disabled="calendarLoading"
              @click="$refs.calendar.next()"
            >
              Next
              <v-icon right small>keyboard_arrow_right</v-icon>
            </v-btn>
          </div>
        </div>

        <v-sheet class="ps-calendar__sheet">
          <v-calendar ref="calendar" v-model="today" type="month" color="teal darken-2">
            <template v-slot:day="{ date }">
              <template v-for="event in eventsMap[date]">
                <v-menu
                  :key="event.trdmti || event.title + date"
                  v-model="event.open"
                  :close-on-content-click="false"
                  offset-y
                >
                  <template v-slot:activator="{ on }">
                    <div class="ps-calendar-event mb-1" :class="eventClass(event)" v-ripple v-on="on">
                      <div class="ps-calendar-event__top">
                        <span>{{ eventTitleLine(event) }}</span>
                        <small v-if="eventStatusLabel(event)">{{ eventStatusLabel(event) }}</small>
                      </div>
                      <p v-if="eventSubtitle(event)">
                        {{ eventSubtitle(event) }}
                      </p>
                    </div>
                  </template>

                  <v-card class="ps-calendar-menu-card" min-width="320px" max-width="420px" flat>
                    <v-toolbar dark flat height="56" class="ps-calendar-menu-card__toolbar">
                      <v-toolbar-title>{{ event.title || event.client || 'Calendar item' }}</v-toolbar-title>
                      <v-spacer></v-spacer>
                    </v-toolbar>
                    <v-card-text>
                      <div v-if="event.client" class="ps-calendar-menu-card__meta">
                        <strong>Client</strong>
                        <span>{{ event.client }}</span>
                      </div>
                      <div v-if="event.itiobj" class="ps-calendar-menu-card__meta">
                        <strong>Objective</strong>
                        <span>{{ event.itiobj }}</span>
                      </div>
                      <div v-if="event.itiins" class="ps-calendar-menu-card__meta">
                        <strong>Instrument</strong>
                        <span>{{ event.itiins }}</span>
                      </div>
                      <div v-if="event.trdmde" class="ps-calendar-menu-card__meta">
                        <strong>Details</strong>
                        <span>{{ event.trdmde }}</span>
                      </div>
                      <div class="ps-calendar-menu-card__meta">
                        <strong>Status</strong>
                        <span>{{ eventStatusLabel(event) || 'Calendar item' }}</span>
                      </div>
                    </v-card-text>
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
import { mapActions, mapMutations, mapState } from 'vuex'
import moment from 'moment'

export default {
  data: () => ({
    menu: false,
    today: moment(new Date()).format('YYYY-MM-DD'),
    datefrom: '',
    dateto: '',
    client: '',
    departmentList: [],
    userList: [],
    selectedItemUser: null,
    selectedItemDepartment: null,
    calendarLoading: false,
  }),
  watch: {
    selectedItemDepartment() {
      if (!this.selectedItemDepartment || !this.selectedItemDepartment.DPTNME) {
        this.userList = []
        return
      }

      this.getUserByDepartment(this.selectedItemDepartment.DPTNME)
        .then(res => {
          this.userList = res.data
        })
        .catch(error => {
          console.log(error)
        })
    },
  },
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
    selectedUserName() {
      return this.selectedItemUser ? this.selectedItemUser.CNTMCN || this.selectedItemUser.CNTMNN : 'Select a user'
    },
    selectedMonthEvents() {
      const selectedMonth = moment(this.today).format('YYYY-MM')
      return this.CurServiceCalendar.filter(event => moment(event.date).format('YYYY-MM') === selectedMonth)
    },
    calendarCount() {
      return this.selectedMonthEvents.length
    },
    scheduledCount() {
      return this.selectedMonthEvents.filter(event => event.trdsts == 'SCHEDULED').length
    },
    startedCount() {
      return this.selectedMonthEvents.filter(event => event.trdsts == 'START').length
    },
    leaveCount() {
      return this.selectedMonthEvents.filter(event => event.trdsts == 'LEAVE').length
    },
  },
  mounted() {
    if (this.CurUserDetails.CNTMST.CNTDPT == 'PMDLUZON') {
      this.departmentList.push({ DPTNME: 'PASLUZON' }, { DPTNME: 'PASVISMIN' })
    }

    if (this.CurUserDetails.CNTMST.CNTDPT == 'IMG') {
      this.departmentList.push({ DPTNME: 'IMG' })
    }

    if (this.CurUserDetails.CNTMST.CNTDPT == 'POCT') {
      this.departmentList.push({ DPTNME: 'POCT' })
    }

    if (localStorage.mydata != undefined) {
      this.upCurServiceCalendar(JSON.parse(localStorage.mydata).myCalendar)
      this.datefrom = JSON.parse(localStorage.mydata).myCalendarDateFrom
      this.dateto = JSON.parse(localStorage.mydata).myCalendarDateTo
    }
  },
  methods: {
    ...mapActions(['getServiceCalendar', 'getUserByDepartment']),
    ...mapMutations(['upCurServiceCalendar']),
    eventClass(event) {
      if (event.trdsts == 'LEAVE') return 'ps-calendar-event--leave'
      if (event.trdsts == 'START') return 'ps-calendar-event--start'
      if (event.trdsts == 'SCHEDULED') return 'ps-calendar-event--scheduled'
      return 'ps-calendar-event--default'
    },
    eventTitleLine(event) {
      return event.trdsts == 'LEAVE' ? event.title : event.client || event.title || 'Calendar item'
    },
    eventStatusLabel(event) {
      if (event.trdsts == 'LEAVE') return 'LEAVE'
      return event.trdsts || ''
    },
    eventSubtitle(event) {
      if (event.trdsts == 'LEAVE') return ''
      if (event.trdmde && event.trdsts != 'SCHEDULED') return event.trdmde
      if (event.itiobj || event.itiins) return [event.itiobj, event.itiins].filter(Boolean).join(' - ')
      return ''
    },
    open(event) {
      alert(event.title)
    },
    dataReload() {
      if (!this.selectedItemUser || !this.selectedItemUser.CNTMID) {
        alert('Please select a user first.')
        return
      }

      this.calendarLoading = true
      return this.getServiceCalendar({
        cntmid: this.selectedItemUser.CNTMID,
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
        })
        .finally(() => {
          this.calendarLoading = false
        })
    },
    removeCalendarData() {
      localStorage.removeItem('mydata')
      location.reload()
    },
  },
}
</script>

<style scoped>
.ps-calendar-page {
  min-height: calc(100vh - 92px);
  padding: 24px 12px 40px;
}

.ps-calendar {
  margin: 0 auto;
  max-width: 1240px;
}

.ps-calendar__hero {
  align-items: flex-end;
  background: linear-gradient(135deg, #0f766e, #1976d2);
  border-radius: 8px;
  color: white;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 24px 28px;
}

.ps-calendar__eyebrow {
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  margin: 0 0 12px;
  text-transform: uppercase;
}

.ps-calendar__hero h1 {
  font-size: 2rem;
  margin: 0 0 8px;
}

.ps-calendar__subtitle {
  margin: 0;
}

.ps-calendar__month {
  text-align: right;
}

.ps-calendar__month span {
  display: block;
  font-size: 1.45rem;
  font-weight: 800;
}

.ps-calendar__month small {
  color: rgba(255, 255, 255, 0.82);
  font-weight: 700;
}

.ps-calendar__controls,
.ps-calendar__calendar-card,
.ps-calendar__stat {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 8px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08) !important;
}

.ps-calendar__controls {
  margin-top: 16px;
  padding: 16px;
}

.ps-calendar__actions,
.ps-calendar__month-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.ps-calendar__stats {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 16px 0;
}

.ps-calendar__stat {
  padding: 18px;
}

.ps-calendar__stat span {
  color: #0f172a;
  display: block;
  font-size: 1.45rem;
  font-weight: 900;
}

.ps-calendar__stat small {
  color: #475569;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.ps-calendar__calendar-card {
  overflow: hidden;
  position: relative;
}

.ps-calendar__loading {
  align-items: center;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(15, 118, 110, 0.14);
  border-radius: 8px;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.12);
  color: #0f172a;
  display: grid;
  gap: 8px;
  justify-items: center;
  min-width: 250px;
  padding: 22px;
  text-align: center;
}

.ps-calendar__loading span {
  color: #64748b;
  font-size: 13px;
}

.ps-calendar__calendar-head {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px;
}

.ps-calendar__calendar-head h2 {
  color: #0f172a;
  margin: 0 0 4px;
}

.ps-calendar__calendar-head p {
  color: #64748b;
  margin: 0;
}

.ps-calendar__sheet {
  border-top: 1px solid rgba(15, 23, 42, 0.08);
  height: 760px;
}

.ps-calendar__sheet ::v-deep .v-calendar-weekly__day {
  contain: paint;
  min-width: 0;
  overflow: hidden auto;
}

.ps-calendar__sheet ::v-deep .v-calendar-weekly__day::-webkit-scrollbar {
  width: 4px;
}

.ps-calendar__sheet ::v-deep .v-calendar-weekly__day::-webkit-scrollbar-thumb {
  background: #c7d5dd;
  border-radius: 999px;
}

.ps-calendar-event {
  border-left: 4px solid #1976d2;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.72rem;
  overflow: hidden;
  padding: 5px 6px;
}

.ps-calendar-event__top {
  align-items: center;
  display: flex;
  gap: 6px;
  justify-content: space-between;
}

.ps-calendar-event__top span {
  color: #0f172a;
  font-weight: 800;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ps-calendar-event__top small {
  color: #475569;
  flex: 0 0 auto;
  font-size: 0.56rem;
  font-weight: 900;
}

.ps-calendar-event p {
  color: #475569;
  font-size: 0.66rem;
  margin: 2px 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ps-calendar-event--scheduled {
  background: #eff6ff;
  border-color: #1976d2;
}

.ps-calendar-event--start {
  background: #fef3c7;
  border-color: #f59e0b;
}

.ps-calendar-event--leave {
  background: #dcfce7;
  border-color: #16a34a;
}

.ps-calendar-event--default {
  background: #f8fafc;
  border-color: #64748b;
}

.ps-calendar-menu-card__toolbar {
  background: linear-gradient(135deg, #0f766e, #1976d2) !important;
}

.ps-calendar-menu-card__toolbar .v-toolbar__title {
  font-size: 0.95rem;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ps-calendar-menu-card__meta {
  display: grid;
  gap: 4px;
  margin-bottom: 12px;
}

.ps-calendar-menu-card__meta strong {
  color: #64748b;
  font-size: 0.68rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

@media (max-width: 760px) {
  .ps-calendar__hero,
  .ps-calendar__calendar-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .ps-calendar__month {
    text-align: left;
  }

  .ps-calendar__actions,
  .ps-calendar__month-actions {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .ps-calendar__stats {
    grid-template-columns: 1fr;
  }

  .ps-calendar__sheet {
    height: 660px;
  }
}

@media print {
  .no-print {
    display: none;
  }
}
</style>
