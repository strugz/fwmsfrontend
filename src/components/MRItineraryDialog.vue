<template>
  <div class="mr-visit">
    <v-dialog v-model="dialog" max-width="720" persistent transition="dialog-bottom-transition">
      <template v-slot:activator="{ on }">
        <v-btn v-if="type == 'icon'" small icon text rounded dark color="teal" v-on="on">
          <v-icon color="white lighten-1">timer_off</v-icon>
        </v-btn>
        <v-btn v-else small rounded dark color="teal" v-on="on">
          <v-icon left small>add_location_alt</v-icon>
          Visit
        </v-btn>
      </template>

      <v-card class="mr-visit__card" flat>
        <div class="mr-visit__header">
          <div>
            <p class="mr-visit__eyebrow">New Itinerary</p>
            <h2>Schedule Visit</h2>
            <span>Select a client, customer, objective, and visit date.</span>
          </div>
          <v-btn icon text color="white" @click="dialog = false">
            <v-icon>close</v-icon>
          </v-btn>
        </div>

        <v-card-text class="mr-visit__body">
          <section class="mr-visit__section">
            <div class="mr-visit__section-head">
              <v-icon color="teal darken-2">business</v-icon>
              <div>
                <h3>Client</h3>
                <p>Search and choose the account for this visit.</p>
              </div>
            </div>

            <v-text-field
              v-model="searchQuery"
              label="Search client"
              outlined
              dense
              hide-details
              prepend-inner-icon="search"
            ></v-text-field>

            <div class="mr-visit__choice-panel">
              <v-radio-group v-model="clientSelected" column hide-details @change="getCustomer">
                <v-radio
                  v-for="item in filteredClients"
                  :key="item.ACCMID"
                  :label="item.ACCMNM"
                  :value="item.ACCMID"
                ></v-radio>
              </v-radio-group>
            </div>
          </section>

          <section class="mr-visit__section">
            <div class="mr-visit__section-head">
              <v-icon color="teal darken-2">person</v-icon>
              <div>
                <h3>Customer</h3>
                <p>Choose the contact linked to the selected client.</p>
              </div>
            </div>

            <div class="mr-visit__choice-panel">
              <v-radio-group v-model="customerSelected" column hide-details>
                <v-radio
                  v-for="item in customerList"
                  :key="item.CSTMID"
                  :label="item.CSTNME"
                  :value="item.CSTMID"
                ></v-radio>
              </v-radio-group>
            </div>
          </section>

          <section class="mr-visit__section">
            <div class="mr-visit__section-head">
              <v-icon color="teal darken-2">flag</v-icon>
              <div>
                <h3>Objective</h3>
                <p>Select one or more visit objectives.</p>
              </div>
            </div>

            <div class="mr-visit__objective-grid">
              <v-checkbox
                v-for="item in TSRObjectiveList"
                :key="item.ObjectiveName"
                :label="item.ObjectiveName"
                :value="item.ObjectiveName"
                v-model="TSRObjectiveSelected"
                hide-details
                dense
              ></v-checkbox>
            </div>

            <v-text-field
              v-if="TSRObjectiveSelected.includes('Others')"
              v-model="TSRObjectiveSelectOthers"
              label="Please specify others"
              outlined
              dense
              hide-details="auto"
              prepend-inner-icon="edit_note"
            ></v-text-field>
          </section>

          <section class="mr-visit__section mr-visit__section--date">
            <div class="mr-visit__section-head">
              <v-icon color="teal darken-2">event</v-icon>
              <div>
                <h3>Visit Date</h3>
                <p>Pick the itinerary schedule date.</p>
              </div>
            </div>

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
                  label="Visit date"
                  hint="MM/DD/YYYY format"
                  persistent-hint
                  outlined
                  dense
                  prepend-inner-icon="event"
                  @blur="date = parseDate(dateFormatted)"
                  v-on="on"
                  readonly
                ></v-text-field>
              </template>
              <v-date-picker v-model="date" no-title @input="menu1 = false"></v-date-picker>
            </v-menu>
          </section>
        </v-card-text>

        <v-card-actions class="mr-visit__actions">
          <v-btn text color="blue-grey darken-1" @click="dialog = false">Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="teal darken-2" dark depressed :disabled="enableStart" @click="SaveItineraryValidation">
            Save Visit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
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
.mr-visit__card {
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  max-height: 88vh;
  overflow: hidden;
}

.mr-visit__header {
  align-items: flex-start;
  background: linear-gradient(135deg, #0f766e, #1976d2);
  color: white;
  display: flex;
  justify-content: space-between;
  padding: 22px 24px;
}

.mr-visit__eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin: 0 0 6px;
  text-transform: uppercase;
}

.mr-visit__header h2 {
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0 0 4px;
}

.mr-visit__header span {
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.9rem;
}

.mr-visit__body {
  display: grid;
  gap: 14px;
  overflow-y: auto;
  padding: 20px 24px;
}

.mr-visit__section {
  border: 1px solid rgba(15, 76, 76, 0.12);
  border-radius: 10px;
  display: grid;
  gap: 12px;
  padding: 16px;
}

.mr-visit__section--date {
  max-width: 360px;
}

.mr-visit__section-head {
  align-items: flex-start;
  display: flex;
  gap: 10px;
}

.mr-visit__section-head h3 {
  color: #0f172a;
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 2px;
}

.mr-visit__section-head p {
  color: #64748b;
  font-size: 0.84rem;
  margin: 0;
}

.mr-visit__choice-panel {
  border: 1px solid rgba(100, 116, 139, 0.16);
  border-radius: 8px;
  max-height: 150px;
  overflow-y: auto;
  padding: 4px 10px;
}

.mr-visit__objective-grid {
  display: grid;
  gap: 2px 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.mr-visit__actions {
  border-top: 1px solid rgba(15, 76, 76, 0.1);
  padding: 14px 24px 18px;
}

@media (max-width: 600px) {
  .mr-visit__objective-grid {
    grid-template-columns: 1fr;
  }

  .mr-visit__section--date {
    max-width: none;
  }
}
</style>
