<template>
  <v-layout mt-0 row justify-center>
    <v-dialog v-model="DataDialog" width="500">
      <template v-slot:activator="{ on }">
        <v-btn small rounded dark color="teal" v-on="on"> Add Data </v-btn>
      </template>
      <v-toolbar class="primary" dark>
        <v-toolbar-title>Add Data</v-toolbar-title>
      </v-toolbar>
      <v-card>
        <v-card-text>
          <v-flex xs12>
            <v-text-field v-model="mDate" type="date">Date</v-text-field>
            <v-text-field v-model="client">Text</v-text-field>
          </v-flex>
          <v-flex xs12>
            <v-btn class="primary" dark text @click="SaveAdditionalItinerary">Add</v-btn>
          </v-flex>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
<script>
import { mapActions, mapState, mapMutations } from 'vuex'
import moment from 'moment'
export default {
  data() {
    return {
      mDate: '',
      client: '',
      DataDialog: false,
      date: new Date().toISOString().substr(0, 10),
    }
  },
  computed: {
    ...mapState(['CurServiceCalendar', 'CurUserDetails']),
  },
  methods: {
    ...mapActions(['getThreadDetailsByTRDMID', 'insertLVEMST']),
    ...mapMutations(['upCurServiceCalendarUpdate']),
    addData() {
      this.upCurServiceCalendarUpdate({
        accmid: moment(new Date()).format('YYYYMMDDHHmmss'),
        agenda: '',
        client: this.client,
        cstmid: '',
        customer: '',
        date: moment(new Date(this.mDate)).format('YYYY-MM-DD'),
        itimid: '',
        itiobj: '',
        itists: '',
        open: false,
        title: 'Service',
        trdmde: '',
        trdmti: '',
        trdsts: '',
      })
      let calendar = JSON.stringify({
        myCalendar: this.CurServiceCalendar,
        myCalendarDateFrom: this.datefrom,
        myCalendarDateTo: this.dateto,
      })
      localStorage.mydata = calendar
    },
    SaveAdditionalItinerary() {
      let myValidation = JSON.stringify({
        LVEDSC: this.client,
        LVECNT: this.CurUserDetails.USRDTL.USRDCI,
        LVEDTE: moment(new Date(this.mDate)).format('YYYY-MM-DD'),
      })
      this.insertLVEMST({ data: myValidation })
        .then(res => {
          if (res.status == 200) {
            console.log(res.data)
            this.upCurServiceCalendarUpdate(res.data[0])
          }
        })
        .catch(error => {
          console.log(error)
        })
    },
  },
}
</script>
