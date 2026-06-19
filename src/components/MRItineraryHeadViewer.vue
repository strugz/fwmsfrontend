<template>
  <v-layout wrap>
    <v-flex xs12 class="mb-3">
      <div id="printDiv">
        <span>
          <h1>{{ myDate }}</h1>
        </span>
        <v-layout row wrap>
          <v-flex sm4 md4 lg6 xs12>
            <v-combobox
              outlined
              v-model="selectedItemDepartment"
              :items="departmentList"
              item-text="DPTNME"
              item-value="DPTNME"
              label="Select Department"
            ></v-combobox>
          </v-flex>
          <v-flex sm4 md4 lg6 xs12>
            <v-combobox
              outlined
              v-model="selectedItemUser"
              :items="userList"
              item-text="CNTMNN"
              item-value="CNTMID"
              label="Select User"
              @change="dataReload"
            ></v-combobox>
          </v-flex>
        </v-layout>
        <v-flex sm4 xs12>
          <v-btn @click="$refs.calendar.prev()">
            <v-icon dark left> keyboard_arrow_left </v-icon>
            Prev
          </v-btn>
          <v-btn @click="$refs.calendar.next()">
            Next
            <v-icon right dark> keyboard_arrow_right </v-icon>
          </v-btn>
        </v-flex>
        <v-sheet height="500">
          <v-calendar ref="calendar" v-model="today" type="month" color="primary">
            <template v-slot:day="{ date }">
              <template v-for="event in eventsMap[date]">
                <v-menu :key="event.itimid" v-model="event.open" :close-on-content-click="false" full-width offset-x>
                  <template v-slot:activator="{ on }">
                    <div v-if="event.validation == 'NOT APPROVE'">
                      <div class="my-event3" v-if="!event.time" v-ripple v-on="on">
                        <span v-if="event.trdsts == 'LEAVE'">{{ event.title }}</span>
                        <span v-if="event.trdsts != 'LEAVE'">{{ event.client }}</span>
                      </div>
                    </div>
                    <div v-else>
                      <div v-show="event.trdsts != 'LEAVE'">
                        <div
                          :class="
                            event.trdsts == 'START'
                              ? 'my-event'
                              : event.trdsts == 'WORK COMPLETE'
                              ? 'my-event1'
                              : 'my-event2'
                          "
                          v-if="!event.time"
                          v-ripple
                          v-on="on"
                        >
                          <span v-if="event.trdsts == 'LEAVE'">{{ event.title }}</span>
                          <span v-if="event.trdsts != 'LEAVE'">{{ event.client }}</span>
                          <span v-show="event.trdsts == 'WORK COMPLETE'"
                            >{{ ' - ' }}
                            {{
                              new Date(event.trdmcd).toLocaleTimeString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                              })
                            }}
                            {{ ' to ' }}
                            {{
                              new Date(event.trdupd).toLocaleTimeString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                              })
                            }}</span
                          >
                        </div>
                      </div>
                    </div>
                    <div v-show="event.trdsts == 'LEAVE'" class="my-event1" v-ripple v-on="on">
                      {{ event.title }}
                    </div>
                  </template>
                  <v-card
                    v-show="event.trdsts != 'LEAVE'"
                    color="grey lighten-4"
                    min-width="250px"
                    max-width="350px"
                    max-height="500px"
                    text
                  >
                    <v-toolbar color="primary" dark>
                      <v-toolbar-title>{{ event.title }}</v-toolbar-title>
                      <v-spacer></v-spacer>
                    </v-toolbar>
                    <v-card-title primary-title>
                      <v-flex xs12>
                        <p>
                          <span style="color: blue; font-weight: bold">Client:</span>
                          {{ ' ' + event.client }}
                        </p>
                      </v-flex>
                      <v-flex xs12>
                        <p>
                          <span style="color: blue; font-weight: bold">Customer:</span>
                          {{ ' ' + event.customer }}
                        </p>
                      </v-flex>
                      <v-flex xs12>
                        <p>
                          <span style="color: blue; font-weight: bold">Position:</span>
                          {{ ' ' + event.cstpos }}
                        </p>
                      </v-flex>
                      <v-flex xs12 v-show="event.itiobj">
                        <p>
                          <span style="color: blue; font-weight: bold">Objective:</span>
                          {{ ' ' + event.itiobj }}
                        </p>
                      </v-flex>
                      <v-flex xs12 v-show="event.trdsts == 'WORK COMPLETE'">
                        <p>
                          <span style="color: blue; font-weight: bold">Remarks:</span>
                          {{ ' ' + event.remarks }}
                        </p>
                      </v-flex>
                      <v-btn
                        v-show="
                          event.validation == 'NOT APPROVE' &&
                          CurUserDetails.CNTMST.CNTMNN != 'AMM' &&
                          CurUserDetails.CNTMST.CNTMNN != 'MBB'
                        "
                        @click="approveItem(event)"
                        :disabled="enableStart"
                        color="primary"
                        >Approve</v-btn
                      >
                    </v-card-title>
                    <v-card-actions> </v-card-actions>
                  </v-card>
                </v-menu>
              </template>
            </template>
          </v-calendar>
        </v-sheet>
      </div>
    </v-flex>
  </v-layout>
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
  },
  methods: {
    ...mapActions(['getITIMSTPerCNT', 'getUserByDepartment', 'updateForApproval']),
    ...mapMutations(['upCurITIMSTList']),
    open(event) {
      alert(event.title)
    },
    remoteUser(items) {
      this.userList = this.userList.filter(user => !items.includes(user.CNTMNN))
    },
    dataReload() {
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
.my-event {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 2px;
  background-color: #1867c0;
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

.my-event1 {
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

.my-event2 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 2px;
  background-color: hsl(54, 92%, 52%);
  color: #000000;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 2px;
  background-color: #df0404;
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

@media print {
  .no-print {
    display: none;
  }
}
</style>
