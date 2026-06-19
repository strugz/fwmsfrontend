<template>
  <v-container fluid class="ttp-detail-page">
    <div class="ttp-detail-shell">
      <v-card v-if="spnr" class="ttp-state-card" elevation="0">
        <v-progress-circular indeterminate color="teal darken-2"></v-progress-circular>
        <div class="ttp-state-card__title">Loading TTP details...</div>
      </v-card>

      <v-card v-else-if="loadError || !hasRequiredDetails" class="ttp-state-card" elevation="0">
        <v-icon size="44" color="blue-grey lighten-1">assignment_late</v-icon>
        <div class="ttp-state-card__title">TTP details unavailable</div>
        <div class="ttp-state-card__text">Refresh the page or open this TTP again from the customer thread.</div>
      </v-card>

      <template v-else>
        <v-card class="ttp-detail-header" elevation="0">
          <div class="ttp-detail-header__main">
            <div class="ttp-detail-badges">
              <span class="ttp-detail-badge ttp-detail-badge--field">{{ CurThreadDetails.TRDSEC }}</span>
              <span class="ttp-detail-badge ttp-detail-badge--report">TTP</span>
            </div>
            <h1>TTP: #{{ CurThreadDetails.TRDMTT }}</h1>
            <p>{{ clientName }}</p>
          </div>

          <div class="ttp-detail-actions">
            <div v-if="CurThreadDetails.TRDSTS !== 'WORK COMPLETE'" class="ttp-detail-action">
              <app-form></app-form>
            </div>
            <div v-else class="ttp-detail-action">
              <service-report></service-report>
            </div>
          </div>
        </v-card>

        <v-card class="ttp-detail-summary" elevation="0">
          <div v-if="ttpDate" class="ttp-detail-summary__item">
            <span>TTP date and time</span>
            <strong>{{ ttpDate }}</strong>
          </div>
          <div v-if="postedBy" class="ttp-detail-summary__item">
            <span>Posted by</span>
            <strong>{{ postedBy }}</strong>
          </div>
          <div v-if="status" class="ttp-detail-summary__item">
            <span>Status</span>
            <strong>{{ status }}</strong>
          </div>
          <div v-if="serviceType" class="ttp-detail-summary__item">
            <span>Service type</span>
            <strong>{{ serviceType }}</strong>
          </div>
          <div v-if="instrumentModel" class="ttp-detail-summary__item">
            <span>Instrument</span>
            <strong>{{ instrumentModel }}</strong>
          </div>
        </v-card>

        <div class="ttp-detail-grid">
          <v-card v-if="concern" class="ttp-detail-section" elevation="0">
            <div class="ttp-detail-section__title">Concern</div>
            <p class="ttp-detail-section__body">{{ concern }}</p>
          </v-card>

          <v-card v-if="hasItems(CurSRDetails.purposeOfVisits)" class="ttp-detail-section" elevation="0">
            <div class="ttp-detail-section__title">Purpose of Visit</div>
            <div class="ttp-detail-table ttp-detail-table--two">
              <div class="ttp-detail-table__head">
                <span>Description</span>
                <span>Remarks</span>
              </div>
              <div v-for="(item, key) in CurSRDetails.purposeOfVisits" :key="key" class="ttp-detail-table__row">
                <span>{{ item.pvDescription || '-' }}</span>
                <span>{{ item.pvRemarks || '-' }}</span>
              </div>
            </div>
          </v-card>

          <v-card v-if="hasItems(CurSRDetails.charges)" class="ttp-detail-section" elevation="0">
            <div class="ttp-detail-section__title">Charges</div>
            <div class="ttp-detail-pills">
              <div v-for="(charge, key) in CurSRDetails.charges" :key="key" class="ttp-detail-pill">
                <span>{{ charge.srChargesDescription || 'Charge' }}</span>
                <strong>{{ charge.srChargesRemarks || '-' }}</strong>
              </div>
            </div>
          </v-card>

          <v-card v-if="remarks" class="ttp-detail-section" elevation="0">
            <div class="ttp-detail-section__title">Significant Remarks</div>
            <p class="ttp-detail-section__body">{{ remarks }}</p>
          </v-card>

          <v-card v-if="CurSRDetails.footer" class="ttp-detail-section" elevation="0">
            <div class="ttp-detail-section__title">Customer Acceptance</div>
            <div class="ttp-detail-summary ttp-detail-summary--nested">
              <div class="ttp-detail-summary__item">
                <span>Laboratory representative</span>
                <strong>{{ CurSRDetails.footer.customerUserID || '-' }}</strong>
              </div>
              <div class="ttp-detail-summary__item">
                <span>Date time in</span>
                <strong>{{ CurSRDetails.footer.srfDateTimeIn || '-' }}</strong>
              </div>
              <div class="ttp-detail-summary__item">
                <span>Date time out</span>
                <strong>{{ CurSRDetails.footer.srfDateTimeOut || '-' }}</strong>
              </div>
            </div>
          </v-card>

          <v-card v-if="!hasVisibleSections" class="ttp-state-card ttp-state-card--inline" elevation="0">
            <v-icon size="40" color="blue-grey lighten-1">assignment</v-icon>
            <div class="ttp-state-card__title">No TTP sections to show</div>
          </v-card>
        </div>
      </template>
    </div>
  </v-container>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import moment from 'moment'
import AppForm from '@/components/TTPForm'
import serviceReport from '../SRFormView'

export default {
  components: {
    AppForm,
    serviceReport,
  },
  data() {
    return {
      render: false,
      spnr: true,
      loadError: false,
    }
  },
  computed: {
    ...mapState(['CurThreadDetails', 'CurClientDetails', 'CurUserDetails', 'CurSRDetails']),
    hasRequiredDetails() {
      return this.render && this.CurThreadDetails && this.CurThreadDetails.TRDMTT
    },
    clientName() {
      return this.CurClientDetails.ACCMNM || this.CurClientDetails.ACCMSC || 'TTP details'
    },
    ttpDate() {
      return this.getRelativeTime(this.CurThreadDetails.TRDMCD)
    },
    postedBy() {
      return this.CurThreadDetails.TRDMUI ? this.CurThreadDetails.TRDMUI.CNTMCN : ''
    },
    status() {
      return this.CurThreadDetails.TRDSTS || ''
    },
    serviceType() {
      return this.concatinate(this.CurSRDetails.serviceTypes || [], 'srTypeDescription')
    },
    instrumentModel() {
      return (
        this.CurThreadDetails.TRDMDE || (this.CurSRDetails.header && this.CurSRDetails.header.instrumentModelID) || ''
      )
    },
    concern() {
      return this.CurThreadDetails.TRDCRN || ''
    },
    remarks() {
      return this.CurSRDetails.remarks ? this.CurSRDetails.remarks.srRemarks : ''
    },
    hasVisibleSections() {
      return (
        Boolean(this.concern) ||
        this.hasItems(this.CurSRDetails.purposeOfVisits) ||
        this.hasItems(this.CurSRDetails.charges) ||
        Boolean(this.remarks) ||
        Boolean(this.CurSRDetails.footer)
      )
    },
  },
  async mounted() {
    await this.loadDetails()
  },
  methods: {
    ...mapActions(['getSRDetailsById', 'getThreadDetailsById', 'getAcc']),
    ...mapMutations(['upClient']),
    async loadDetails() {
      this.spnr = true
      this.render = false
      this.loadError = false

      try {
        const thread = await this.getThreadDetailsById(this.$route.params.TRDMTI)
        if (!thread || !thread.TRDMTT) {
          throw new Error('Thread details did not include a TTP id.')
        }

        await this.getSRDetailsById(thread.TRDMTT)

        if (this.CurClientDetails.ACCMID !== thread.TRDMAC) {
          const acc = await this.getAcc(thread.TRDMAC)
          this.upClient(acc.data)
        }

        this.render = true
      } catch (error) {
        this.loadError = true
        console.error(error)
      } finally {
        this.spnr = false
      }
    },
    getRelativeTime(date) {
      if (!date) return ''
      try {
        return moment(date).format('MMMM Do YYYY, hh:mm a')
      } catch (e) {
        return ''
      }
    },
    concatinate(data, key) {
      if (!Array.isArray(data) || data.length === 0) return ''
      try {
        return data
          .map(item => item[key])
          .filter(Boolean)
          .join(' / ')
      } catch (e) {
        return ''
      }
    },
    hasItems(data) {
      return Array.isArray(data) && data.length > 0
    },
  },
}
</script>

<style scoped>
.ttp-detail-page {
  min-height: calc(100vh - 92px);
  padding: 28px 16px 40px;
}

.ttp-detail-shell {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
}

.ttp-detail-header,
.ttp-detail-summary,
.ttp-detail-section,
.ttp-state-card {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08) !important;
}

.ttp-detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 24px;
}

.ttp-detail-header__main {
  min-width: 0;
}

.ttp-detail-header h1 {
  margin: 8px 0 4px;
  color: #102a43;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.25;
}

.ttp-detail-header p {
  margin: 0;
  color: #62748a;
  font-size: 14px;
}

.ttp-detail-badges,
.ttp-detail-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.ttp-detail-badge {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 4px 8px;
  border-radius: 4px;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.ttp-detail-badge--field {
  background: #3949ab;
}

.ttp-detail-badge--report {
  background: #e53935;
}

.ttp-detail-actions {
  justify-content: flex-end;
  flex: 0 0 auto;
}

.ttp-detail-action {
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
}

.ttp-detail-actions .layout {
  display: inline-flex !important;
  width: auto !important;
  flex: 0 0 auto !important;
}

.ttp-detail-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin-top: 16px;
  padding: 18px 20px;
}

.ttp-detail-summary--nested {
  margin-top: 0;
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none !important;
}

.ttp-detail-summary__item span {
  display: block;
  margin-bottom: 4px;
  color: #7b8794;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.ttp-detail-summary__item strong {
  display: block;
  color: #243b53;
  font-size: 14px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.ttp-detail-grid {
  display: grid;
  gap: 16px;
  margin-top: 16px;
}

.ttp-detail-section {
  padding: 18px 20px;
}

.ttp-detail-section__title {
  margin-bottom: 14px;
  color: #102a43;
  font-size: 15px;
  font-weight: 800;
}

.ttp-detail-section__body {
  margin: 0;
  color: #334e68;
  font-size: 14px;
  line-height: 1.65;
  white-space: pre-line;
}

.ttp-detail-table {
  display: grid;
  gap: 0;
  overflow: hidden;
  border: 1px solid #e4e7eb;
  border-radius: 8px;
}

.ttp-detail-table__head,
.ttp-detail-table__row {
  display: grid;
  gap: 12px;
  align-items: start;
  padding: 12px 14px;
}

.ttp-detail-table--two .ttp-detail-table__head,
.ttp-detail-table--two .ttp-detail-table__row {
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
}

.ttp-detail-table__head {
  background: #f7f9fb;
  color: #52606d;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.ttp-detail-table__row {
  color: #334e68;
  font-size: 14px;
  border-top: 1px solid #e4e7eb;
}

.ttp-detail-table__row span {
  min-width: 0;
  overflow-wrap: anywhere;
}

.ttp-detail-pills {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
}

.ttp-detail-pill {
  padding: 12px 14px;
  border: 1px solid #e4e7eb;
  border-radius: 8px;
  background: #f8fafc;
}

.ttp-detail-pill span {
  display: block;
  margin-bottom: 4px;
  color: #7b8794;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.ttp-detail-pill strong {
  color: #243b53;
  font-size: 14px;
}

.ttp-state-card {
  display: flex;
  min-height: 220px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 28px;
  text-align: center;
}

.ttp-state-card--inline {
  min-height: 180px;
}

.ttp-state-card__title {
  color: #243b53;
  font-size: 17px;
  font-weight: 800;
}

.ttp-state-card__text {
  max-width: 420px;
  color: #62748a;
  font-size: 14px;
}

@media (max-width: 760px) {
  .ttp-detail-page {
    padding: 16px 10px 28px;
  }

  .ttp-detail-header {
    flex-direction: column;
    padding: 16px;
  }

  .ttp-detail-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .ttp-detail-table--two .ttp-detail-table__head,
  .ttp-detail-table--two .ttp-detail-table__row {
    grid-template-columns: 1fr;
  }

  .ttp-detail-table__head {
    display: none;
  }
}
</style>
