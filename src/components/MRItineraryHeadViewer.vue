<template>
  <v-container fluid class="itinerary-viewer-page">
    <div id="printDiv" class="itinerary-viewer">
      <section class="itinerary-viewer__hero">
        <div>
          <p class="itinerary-viewer__eyebrow">Marsman Drysdale Medical Product Inc.</p>
          <h1>Itinerary Viewer</h1>
          <p class="itinerary-viewer__subtitle">Review team itineraries, visit status, and pending approvals.</p>
        </div>

        <div class="itinerary-viewer__month">
          <span>{{ myDate }}</span>
          <small>{{ selectedUserName }}</small>
        </div>
      </section>

      <v-card class="itinerary-viewer__controls no-print" flat>
        <v-row align="center" dense>
          <v-col cols="12" md="4">
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
          <v-col cols="12" md="4">
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
              @change="dataReload"
            ></v-combobox>
          </v-col>
          <v-col cols="12" md="4">
            <div class="itinerary-viewer__actions">
              <v-btn depressed color="teal darken-2" dark @click="dataReload">
                <v-icon left small>refresh</v-icon>
                Load
              </v-btn>
              <v-btn depressed color="grey lighten-3" class="itinerary-viewer__nav-btn" @click="$refs.calendar.prev()">
                <v-icon left small>keyboard_arrow_left</v-icon>
                Prev
              </v-btn>
              <v-btn depressed color="grey lighten-3" class="itinerary-viewer__nav-btn" @click="$refs.calendar.next()">
                Next
                <v-icon right small>keyboard_arrow_right</v-icon>
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card>

      <section class="itinerary-viewer__stats no-print">
        <div class="itinerary-viewer__stat">
          <span>{{ itineraryCount }}</span>
          <small>Total items</small>
        </div>
        <div class="itinerary-viewer__stat">
          <span>{{ pendingApprovalCount }}</span>
          <small>Pending approval</small>
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
            <p>Click an itinerary item to view details or approve pending items.</p>
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
                  max-width="420"
                  offset-y
                >
                  <template v-slot:activator="{ on }">
                    <div v-if="!event.time" class="itinerary-event mb-1" :class="eventClass(event)" v-ripple v-on="on">
                      <div class="itinerary-event__top">
                        <span>{{ eventTitleLine(event) }}</span>
                        <small v-if="eventStatusLabel(event)">{{ eventStatusLabel(event) }}</small>
                      </div>
                      <p v-if="event.trdsts == 'WORK COMPLETE'">{{ completedTimeRange(event) }}</p>
                      <p v-else-if="event.itiobj">{{ event.itiobj }}</p>
                    </div>
                  </template>
                  <v-card
                    v-show="!isLeaveEvent(event)"
                    class="itinerary-menu-card"
                    min-width="340px"
                    max-width="420px"
                    flat
                  >
                    <v-toolbar dark flat height="56" class="itinerary-menu-card__toolbar">
                      <v-toolbar-title>{{ event.title }}</v-toolbar-title>
                      <v-spacer></v-spacer>
                    </v-toolbar>
                    <v-card-text>
                      <div v-if="event.client" class="itinerary-menu-card__meta">
                        <strong>Client</strong>
                        <span>{{ event.client }}</span>
                      </div>
                      <div v-if="event.customer" class="itinerary-menu-card__meta">
                        <strong>Customer</strong>
                        <span>{{ event.customer }}</span>
                      </div>
                      <div v-if="event.cstpos" class="itinerary-menu-card__meta">
                        <strong>Position</strong>
                        <span>{{ event.cstpos }}</span>
                      </div>
                      <div v-if="event.itiobj" class="itinerary-menu-card__meta">
                        <strong>Objective</strong>
                        <span>{{ event.itiobj }}</span>
                      </div>
                      <div v-if="event.trdsts == 'WORK COMPLETE'" class="itinerary-menu-card__meta">
                        <strong>Remarks</strong>
                        <span>{{ event.remarks }}</span>
                      </div>
                      <div class="itinerary-menu-card__meta">
                        <strong>Status</strong>
                        <span>{{ eventStatusLabel(event) }}</span>
                      </div>
                    </v-card-text>
                    <v-card-actions class="itinerary-menu-card__actions">
                      <v-chip
                        v-if="event.validation == 'NOT APPROVE'"
                        small
                        color="red lighten-5"
                        text-color="red darken-3"
                      >
                        Pending approval
                      </v-chip>
                      <v-spacer></v-spacer>
                      <v-btn
                        v-show="
                          event.validation == 'NOT APPROVE' &&
                          CurUserDetails.CNTMST.CNTMNN != 'AMM' &&
                          CurUserDetails.CNTMST.CNTMNN != 'MBB'
                        "
                        @click="approveItem(event)"
                        :disabled="enableStart"
                        color="primary"
                        depressed
                        small
                        dark
                      >
                        Approve
                      </v-btn>
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
export default {
  data: () => ({
    menu: false,
    today: moment(new Date()).format('YYYY-MM-DD'),
    departmentList: [],
    selectedItemUser: null,
    selectedItemDepartment: null,
    userList: [],
    enableStart: false,
  }),
  watch: {
    selectedItemDepartment() {
      if (this.selectedItemDepartment && this.selectedItemDepartment.DPTNME) {
        this.getUserByDepartment(this.selectedItemDepartment.DPTNME)
          .then(res => {
            this.userList = res.data
            if (this.CurUserDetails.CNTMST.CNTMNN == 'AMM') {
              this.remoteUser(['MBB', 'TAM', 'AMM'])
            } else if (this.CurUserDetails.CNTMST.CNTMNN == 'JSP') {
              this.remoteUser(['MJH', 'KDS', 'RPP', 'KVR'])
            } else if (this.CurUserDetails.CNTMST.CNTMNN == 'MBB') {
              this.remoteUser(['MBB', 'AMM', 'MBB', 'TAS', 'JLD', 'AMC'])
            }
          })
          .catch(error => {
            console.log(error)
          })
      } else {
        console.log(this.selectedItemDepartment)
        this.userList = []
      }
    },
  },
  mounted() {
    if (this.CurUserDetails.CNTMST.CNTDPT == 'IMG') {
      this.departmentList.push({ DPTNME: 'IMG' })
    } else if (this.CurUserDetails.CNTMST.CNTDPT == 'AHBU') {
      this.departmentList.push({ DPTNME: 'AHBU' })
    } else if (this.CurUserDetails.CNTMST.CNTDPT == 'TSRVISMIN') {
      this.departmentList.push({ DPTNME: 'TSRVISMIN' })
    } else if (this.CurUserDetails.CNTMST.CNTDPT == 'POCT') {
      this.departmentList.push({ DPTNME: 'POCT' })
    } else {
      if (this.CurUserDetails.CNTMST.CNTMNN == 'JSP') {
        this.departmentList.push({ DPTNME: 'TSRLUZON' })
      } else {
        this.departmentList.push({ DPTNME: 'TSRLUZON' }, { DPTNME: 'TSRVISMIN' })
      }
    }
  },
  computed: {
    ...mapState(['CurITIMSTList', 'CurUserDetails']),
    eventsMap() {
      const map = {}
      this.CurITIMSTList.forEach(e => (map[e.date] = map[e.date] || []).push(e))
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
      return this.CurITIMSTList.filter(event => moment(event.date).format('YYYY-MM') === selectedMonth)
    },
    itineraryCount() {
      return this.selectedMonthEvents.length
    },
    pendingApprovalCount() {
      return this.selectedMonthEvents.filter(event => event.validation == 'NOT APPROVE').length
    },
    completedCount() {
      return this.selectedMonthEvents.filter(event => event.trdsts == 'WORK COMPLETE').length
    },
    leaveCount() {
      return this.selectedMonthEvents.filter(event => this.isLeaveEvent(event)).length
    },
  },
  methods: {
    ...mapActions(['getITIMSTPerCNT', 'getUserByDepartment', 'updateForApproval']),
    ...mapMutations(['upCurITIMSTList']),
    eventClass(event) {
      const classes = []
      if (this.isScheduledEvent(event)) {
        classes.push('calendar-event--print-hidden')
      }

      if (event.validation == 'NOT APPROVE') {
        classes.push('itinerary-event--approval')
        return classes
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
    open(event) {
      alert(event.title)
    },
    remoteUser(items) {
      this.userList = this.userList.filter(user => !items.includes(user.CNTMNN))
    },
    dataReload() {
      if (!this.selectedItemUser || !this.selectedItemUser.CNTMID) {
        alert('Please select a user first.')
        return
      }

      this.getITIMSTPerCNT(this.selectedItemUser.CNTMID).then(res => {
        this.upCurITIMSTList(res)
      })
    },
    approveItem(selectedEvent) {
      this.updateForApproval(selectedEvent.itimid)
        .then(res => {
          if (res.status == 200) {
            selectedEvent.validation = 'APPROVE'
            alert('Done.')
          } else {
            alert('Please try Again!')
          }
        })
        .catch(error => {
          alert('Please try Again!', error)
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

.itinerary-viewer__controls {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid #dbe7ec;
  border-radius: 8px;
  background: #fff;
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
  border-left: 3px solid #f0a202;
  border-radius: 4px;
  background: #fff8e6;
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

.itinerary-event--approval {
  border-left-color: #df0404;
  background: #fff1f1;
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
  border-left-color: #f0a202;
  background: #fff8e6;
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
