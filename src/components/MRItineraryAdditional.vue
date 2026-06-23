<template>
  <div class="mr-extra">
    <v-dialog v-model="dialog" max-width="520" persistent transition="dialog-bottom-transition">
      <template v-slot:activator="{ on }">
        <v-btn v-if="showActivator && type == 'icon'" small icon text rounded dark color="teal" v-on="on">
          <v-icon color="white lighten-1">timer_off</v-icon>
        </v-btn>
        <v-btn v-else-if="showActivator" small rounded dark color="teal" v-on="on">
          <v-icon left small>event_busy</v-icon>
          Other Act.
        </v-btn>
      </template>

      <v-card class="mr-extra__card" flat>
        <div class="mr-extra__header">
          <div>
            <p class="mr-extra__eyebrow">Calendar Entry</p>
            <h2>Leave Details</h2>
            <span>Record leave, holiday, office work, or other activities.</span>
          </div>
          <v-btn icon text color="white" @click="dialog = false">
            <v-icon>close</v-icon>
          </v-btn>
        </div>

        <v-card-text class="mr-extra__body">
          <v-select
            v-model="TSRObjectiveSelected"
            :items="TSRObjectiveList"
            item-text="ObjectiveName"
            item-value="ObjectiveName"
            clearable
            hide-details="auto"
            no-data-text
            outlined
            dense
            label="Activity type"
            prepend-inner-icon="event_busy"
          ></v-select>

          <v-text-field
            v-model="details"
            label="Other details"
            outlined
            dense
            hide-details="auto"
            prepend-inner-icon="notes"
          ></v-text-field>

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
                label="Activity date"
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
        </v-card-text>

        <v-card-actions class="mr-extra__actions">
          <v-btn text color="blue-grey darken-1" @click="dialog = false">Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="teal darken-2" dark depressed :disabled="enableStart" @click="SaveAdditionalItinerary">
            Save Entry
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
      date: new Date().toISOString().substr(0, 10),
      dateFormatted: this.formatDate(new Date().toISOString().substr(0, 10)),
      menu1: false,
      enableStart: false,
      details: '',
      TSRObjectiveSelected: [],
      TSRObjectiveList: [
        { ID: 1, ObjectiveName: 'VL' },
        { ID: 2, ObjectiveName: 'SL' },
        { ID: 3, ObjectiveName: 'Holiday' },
        { ID: 4, ObjectiveName: 'Convention' },
        { ID: 5, ObjectiveName: 'MDMPI Office' },
        { ID: 6, ObjectiveName: 'EnRoute' },
      ],
    }
  },
  watch: {
    date(val) {
      this.dateFormatted = this.formatDate(this.date)
    },
  },
  computed: {
    computedDateFormatted() {
      return this.formatDate(this.date)
    },
    ...mapState(['CurUserDetails']),
  },
  methods: {
    ...mapActions(['insertLVEMST']),
    ...mapMutations(['upCurITIMSTList']),
    open() {
      this.dialog = true
    },
    SaveAdditionalItinerary() {
      if (this.TSRObjectiveSelected == '' && this.details == '') {
        alert('Details not provided.')
      } else {
        if (this.TSRObjectiveSelected != '' && this.details != '') {
          alert('Please select only One Details.')
        } else {
          let myValidation = JSON.stringify({
            LVEDSC: this.details == '' ? this.TSRObjectiveSelected : this.details,
            LVECNT: this.CurUserDetails.USRDTL.USRDCI,
            LVEDTE: this.date,
          })
          this.insertLVEMST({ data: myValidation })
            .then(res => {
              if (res.status == 200) {
                this.details = ''
                this.upCurITIMSTList(res.data)
                alert('Save Successfully')
              }
            })
            .catch(error => {
              console.log(error)
            })
        }
      }
    },
    ObjectiveSelectedItems(item) {
      console.log(item)
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
    showActivator: {
      type: Boolean,
      default: true,
    },
  },
}
</script>
<style scoped>
.mr-extra__card {
  border-radius: 12px;
  overflow: hidden;
}

.mr-extra__header {
  align-items: flex-start;
  background: linear-gradient(135deg, #0f766e, #1976d2);
  color: white;
  display: flex;
  justify-content: space-between;
  padding: 22px 24px;
}

.mr-extra__eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin: 0 0 6px;
  text-transform: uppercase;
}

.mr-extra__header h2 {
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0 0 4px;
}

.mr-extra__header span {
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.9rem;
}

.mr-extra__body {
  display: grid;
  gap: 14px;
  padding: 22px 24px 10px;
}

.mr-extra__actions {
  border-top: 1px solid rgba(15, 76, 76, 0.1);
  padding: 14px 24px 18px;
}
</style>
