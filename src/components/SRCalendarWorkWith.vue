<template>
  <v-layout mt-0 row justify-center>
    <v-dialog v-model="WorkWithDialog" width="500">
      <template v-slot:activator="{ on }">
        <v-btn small rounded dark color="teal" v-on="on"> Work With </v-btn>
      </template>
      <v-toolbar class="primary" dark>
        <v-toolbar-title>Add Work With</v-toolbar-title>
      </v-toolbar>
      <v-card>
        <v-card-text>
          <v-flex xs12>
            <v-text-field v-model="SRNumber" label="Service Number"></v-text-field>
          </v-flex>
          <v-flex xs12>
            <v-btn class="primary" dark text @click="addDataWorkWith">Add</v-btn>
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
      SRNumber: '',
      WorkWithDialog: false,
    }
  },
  computed: {
    ...mapState(['CurServiceCalendar']),
  },
  methods: {
    ...mapActions(['getThreadDetailsByTRDMID']),
    ...mapMutations(['upCurServiceCalendarUpdate']),
    addDataWorkWith() {
      this.getThreadDetailsByTRDMID(this.SRNumber).then(res => {
        if (res.status == 200) {
          this.upCurServiceCalendarUpdate({
            accmid: res.data.TRDMAC,
            agenda: '',
            client: res.data.trdmacid.ACCMSC,
            cstmid: '',
            customer: '',
            date: moment(new Date(res.data.TRDADT)).format('YYYY-MM-DD'),
            itimid: '',
            itiobj: '',
            itists: '',
            open: false,
            title: 'Service',
            trdmde: 'SR# ' + res.data.TRDMTT + ' ' + res.data.TRDMCD + '-' + res.data.TRDUPD + ' ' + res.data.TRDMDE,
            trdmti: '',
            trdsts: '',
          })
          let calendar = JSON.stringify({
            myCalendar: this.CurServiceCalendar,
            myCalendarDateFrom: this.datefrom,
            myCalendarDateTo: this.dateto,
          })
          localStorage.mydata = calendar
        }
      })
    },
  },
}
</script>
