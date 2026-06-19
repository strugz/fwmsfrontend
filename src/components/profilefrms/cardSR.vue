<template>
  <v-card light class="sr-card" @click="toDetails(data.TRDMTI)">
    <div class="sr-card__rail" :class="statusClass"></div>
    <div class="sr-card__content">
      <div class="sr-card__header">
        <div class="sr-card__identity">
          <div class="sr-card__badges">
            <span class="sr-card__badge sr-card__badge--section">{{ data.TRDSEC }}</span>
            <span class="sr-card__badge sr-card__badge--type">{{ data.TRDMTY }}</span>
          </div>
          <button class="sr-card__title" type="button">SR: #{{ data.TRDMTT }}</button>
        </div>
        <v-chip label small dark :color="statusColor" class="sr-card__status">
          <v-icon size="15" left>{{ statusIcon }}</v-icon>
          {{ statusText }}
        </v-chip>
      </div>

      <div class="sr-card__meta">
        <span>
          <v-icon size="15">person</v-icon>
          {{ postedBy }}
        </span>
        <span>
          <v-icon size="15">schedule</v-icon>
          {{ getRelativeTime(data.TRDMCD) }}
        </span>
      </div>

      <div class="sr-card__body">
        <div v-if="data.TRDSTS == 'STOP'" class="sr-card__notice"><strong>Pending:</strong> {{ TRDMDE }}</div>
        <template v-else>
          <div v-if="ITIOBJ" class="sr-card__field">
            <span>Customer</span>
            <p>{{ TRDMDE }}</p>
          </div>
          <div v-if="ITIOBJ" class="sr-card__field">
            <span>Objective</span>
            <p>{{ ITIOBJ }}</p>
          </div>
          <div v-if="!ITIOBJ && data.TRDSEC != 'COLLECT'" class="sr-card__description">
            {{ TRDMDE }}
          </div>
          <div v-if="!ITIOBJ && data.TRDSEC != 'TTP'" class="sr-card__field">
            <span>Purpose of Visits</span>
            <p>{{ POVDetails || 'No purpose listed' }}</p>
          </div>
          <div v-if="data.TRDSEC == 'TTP'" class="sr-card__field">
            <span>Concern</span>
            <p>{{ data.TRDCRN }}</p>
          </div>
          <div v-if="data.TRDSEC == 'InHouse' && data.TRDMTY == 'PA Service Report'" class="sr-card__field">
            <span>Concern</span>
            <p>{{ data.TRD }}</p>
          </div>
        </template>
        <image-report
          v-if="data.TRDSTS === 'WORK COMPLETE' && data.TRDMUI.CNTDPT.substring(0, 3) == 'TSG'"
          :CurThread="data"
          @click.stop
        ></image-report>
      </div>

      <div class="sr-card__footer">
        <div>
          <v-icon small class="mr-1">chat_bubble</v-icon>
          <strong>{{ data.TRDCNT }}</strong>
          <span>comments</span>
        </div>
        <div v-if="data.TRDUBY !== undefined">
          Updated by <strong>{{ data.TRDUBY.CNTMNN }}</strong> on {{ getRelativeTime(data.TRDUPD) }}
        </div>
      </div>
    </div>
  </v-card>
</template>

<script>
import moment from 'moment'
import { mapActions } from 'vuex'
import imageReport from '../SRImageViewer.vue'
export default {
  data() {
    return {
      TRDMDE: '',
      ITIOBJ: '',
      POVDetails: '',
    }
  },
  components: {
    imageReport,
  },
  created() {
    this.getMMRCust(this.data.TRDMDE)
  },
  methods: {
    ...mapActions(['getCSTMSTPerCust', 'getITIMST']),
    getRelativeTime(date) {
      let time = moment().from(date, true)
      if (time.endsWith('days')) {
        return moment(date).format('MMMM Do YYYY, hh:mm a')
      } else {
        return moment(date).format('MMMM Do YYYY, hh:mm a')
      }
    },
    getMMRCust(cstmid) {
      if (this.data.TRDSEC == 'Itinerary') {
        this.getCSTMSTPerCust(cstmid).then(res => {
          let tempData = res.data
          this.TRDMDE = tempData.CSTNME
        })
        this.getITIMST(this.data.TRDITI).then(res => {
          this.ITIOBJ = res.itiobj
        })
      } else {
        this.TRDMDE = cstmid
        this.data.purposeOfVisits.forEach(x => {
          if (x.pvRemarks == '') {
            this.POVDetails = this.POVDetails == '' ? x.pvDescription : this.POVDetails + '\r\n ' + x.pvDescription
          } else {
            this.POVDetails =
              this.POVDetails == ''
                ? x.pvDescription + ': ' + x.pvRemarks
                : this.POVDetails + '\r\n ' + x.pvDescription + ': ' + x.pvRemarks
          }
        })
      }
    },

    toDetails(srid) {
      if (this.data.TRDSEC == 'TTP') {
        this.$router.push({ name: 'ttp', params: { TRDMTI: srid } })
      } else if (this.data.TRDSEC == 'Itinerary') {
        this.$router.push({ name: 'itinerary', params: { TRDMTI: srid } })
      } else if (this.data.TRDSEC == 'COLLECT') {
        this.$router.push({ name: 'clt', params: { TRDMTI: srid } })
      } else {
        if (
          this.data.TRDMTY == 'Service Report' &&
          this.data.TRDSTS == 'WORK COMPLETE' &&
          this.data.TRDSEC != 'InHouse'
        ) {
          this.$router.push({ name: 'fieldreport', params: { ClientID: this.data.TRDMAC, SRID: this.data.TRDMTT } })
        } else {
          this.$router.push({ name: 'sr', params: { TRDMTI: srid } })
        }
      }
    },
  },
  computed: {
    postedBy() {
      return this.data.TRDMUI ? this.data.TRDMUI.CNTMCN : 'Unknown user'
    },
    statusText() {
      const labels = {
        START: 'Ongoing',
        STOP: 'On hold',
        DONE: 'Finalizing',
        'WORK COMPLETE': 'Work complete',
      }
      return labels[this.data.TRDSTS] || this.data.TRDSTS || 'Open'
    },
    statusIcon() {
      const icons = {
        START: 'cached',
        STOP: 'pause_circle_filled',
        DONE: 'info',
        'WORK COMPLETE': 'done_all',
      }
      return icons[this.data.TRDSTS] || 'fiber_manual_record'
    },
    statusColor() {
      const colors = {
        START: 'green darken-1',
        STOP: 'red darken-1',
        DONE: 'orange darken-2',
        'WORK COMPLETE': 'indigo darken-1',
      }
      return colors[this.data.TRDSTS] || 'blue-grey'
    },
    statusClass() {
      const classes = {
        START: 'sr-card__rail--start',
        STOP: 'sr-card__rail--stop',
        DONE: 'sr-card__rail--done',
        'WORK COMPLETE': 'sr-card__rail--complete',
      }
      return classes[this.data.TRDSTS] || 'sr-card__rail--default'
    },
  },
  props: {
    data: {
      type: Object,
    },
  },
}
</script>

<style>
.sr-card {
  border: 1px solid rgba(15, 76, 76, 0.1);
  border-radius: 12px;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.07) !important;
  cursor: pointer;
  display: flex;
  overflow: hidden;
  transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
}

.sr-card:hover {
  border-color: rgba(15, 118, 110, 0.35);
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.11) !important;
  transform: translateY(-1px);
}

.sr-card__rail {
  flex: 0 0 6px;
}

.sr-card__rail--start {
  background: #43a047;
}

.sr-card__rail--stop {
  background: #e53935;
}

.sr-card__rail--done {
  background: #fb8c00;
}

.sr-card__rail--complete {
  background: #3949ab;
}

.sr-card__rail--default {
  background: #607d8b;
}

.sr-card__content {
  flex: 1;
  min-width: 0;
  padding: 18px 20px 0;
}

.sr-card__header {
  align-items: flex-start;
  display: flex;
  gap: 16px;
  justify-content: space-between;
}

.sr-card__identity {
  min-width: 0;
}

.sr-card__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 6px;
}

.sr-card__badge {
  border-radius: 5px;
  color: white;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.03em;
  line-height: 1;
  padding: 5px 7px;
  text-transform: uppercase;
}

.sr-card__badge--section {
  background: #3949ab;
}

.sr-card__badge--type {
  background: #e53935;
}

.sr-card__title {
  background: none;
  border: 0;
  color: #0f172a;
  cursor: pointer;
  font-size: 1.12rem;
  font-weight: 800;
  padding: 0;
  text-align: left;
}

.sr-card__title:hover {
  color: #0f766e;
}

.sr-card__status {
  flex: 0 0 auto;
  font-weight: 700;
}

.sr-card__meta {
  color: #64748b;
  display: flex;
  flex-wrap: wrap;
  font-size: 0.78rem;
  gap: 16px;
  margin-top: 10px;
  text-transform: uppercase;
}

.sr-card__meta span {
  align-items: center;
  display: inline-flex;
  gap: 5px;
}

.sr-card__body {
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.5;
  padding: 18px 0 16px;
}

.sr-card__description {
  color: #334155;
  font-size: 1rem;
  margin-bottom: 10px;
  white-space: pre-line;
}

.sr-card__field {
  margin-top: 10px;
}

.sr-card__field span {
  color: #64748b;
  display: block;
  font-size: 0.78rem;
  font-weight: 800;
  margin-bottom: 2px;
  text-transform: uppercase;
}

.sr-card__field p {
  color: #475569;
  margin: 0;
  white-space: pre-line;
}

.sr-card__notice {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #991b1b;
  padding: 10px 12px;
  white-space: pre-line;
}

.sr-card__footer {
  align-items: center;
  border-top: 1px solid rgba(15, 76, 76, 0.1);
  color: #64748b;
  display: flex;
  flex-wrap: wrap;
  font-size: 0.78rem;
  gap: 10px 20px;
  justify-content: space-between;
  margin: 0 -20px;
  padding: 10px 20px;
}

.sr-card__footer > div {
  align-items: center;
  display: flex;
}

@media (max-width: 700px) {
  .sr-card__header,
  .sr-card__footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
