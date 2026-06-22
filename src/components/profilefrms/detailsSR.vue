<template>
  <v-container fluid class="sr-detail-page">
    <div class="sr-detail-shell">
      <v-card v-if="spnr" class="sr-state-card" elevation="0">
        <v-progress-circular indeterminate color="teal darken-2"></v-progress-circular>
        <div class="sr-state-card__title">Loading service report...</div>
      </v-card>

      <v-card v-else-if="loadError || !hasRequiredDetails" class="sr-state-card" elevation="0">
        <v-icon size="44" color="blue-grey lighten-1">assignment_late</v-icon>
        <div class="sr-state-card__title">Service report details unavailable</div>
        <div class="sr-state-card__text">Refresh the page or open this report again from the customer thread.</div>
      </v-card>

      <template v-else>
        <v-card class="sr-detail-header" elevation="0">
          <div class="sr-detail-header__main">
            <div class="sr-detail-badges">
              <span class="sr-detail-badge sr-detail-badge--field">{{ CurThreadDetails.TRDSEC }}</span>
              <span class="sr-detail-badge sr-detail-badge--report">Service Report</span>
            </div>
            <h1>SR: #{{ CurThreadDetails.TRDMTT }}</h1>
            <p>{{ clientName }}</p>
          </div>

          <div class="sr-detail-actions">
            <div v-if="ownTRD && CurThreadDetails.TRDSTS !== 'WORK COMPLETE'" class="sr-detail-action">
              <timer-sr></timer-sr>
            </div>

            <div v-if="canViewImages" class="sr-detail-action">
              <image-report :CurThread="CurThreadDetails"></image-report>
            </div>

            <div v-if="CurThreadDetails.TRDSTS === 'WORK COMPLETE'" class="sr-detail-action">
              <service-report></service-report>
            </div>
          </div>
        </v-card>

        <v-card class="sr-detail-summary" elevation="0">
          <div v-if="postedBy" class="sr-detail-summary__item">
            <span>Posted by</span>
            <strong>{{ postedBy }}</strong>
          </div>
          <div v-if="serviceTime" class="sr-detail-summary__item">
            <span>Service time</span>
            <strong>{{ serviceTime }}</strong>
          </div>
          <div v-if="workWith" class="sr-detail-summary__item">
            <span>Work with</span>
            <strong>{{ workWith }}</strong>
          </div>
          <div v-if="instrumentModel" class="sr-detail-summary__item">
            <span>Instrument model</span>
            <strong>{{ instrumentModel }}</strong>
          </div>
          <div v-if="serviceType" class="sr-detail-summary__item">
            <span>Service type</span>
            <strong>{{ serviceType }}</strong>
          </div>
        </v-card>

        <div class="sr-detail-grid">
          <v-card v-if="hasItems(CurSRDetails.purposeOfVisits)" class="sr-detail-section" elevation="0">
            <div class="sr-detail-section__title">Purpose of Visit</div>
            <div class="sr-detail-table sr-detail-table--two">
              <div class="sr-detail-table__head">
                <span>Description</span>
                <span>Remarks</span>
              </div>
              <div v-for="(itm, key) in CurSRDetails.purposeOfVisits" :key="key" class="sr-detail-table__row">
                <span>{{ itm.pvDescription || '-' }}</span>
                <span>{{ itm.pvRemarks || '-' }}</span>
              </div>
            </div>
          </v-card>

          <v-card v-if="hasItems(CurSRDetails.actionTakens)" class="sr-detail-section" elevation="0">
            <div class="sr-detail-section__title">Action Taken</div>
            <div class="sr-detail-table sr-detail-table--two">
              <div class="sr-detail-table__head">
                <span>Description</span>
                <span>Remarks</span>
              </div>
              <div v-for="(itm, key) in CurSRDetails.actionTakens" :key="key" class="sr-detail-table__row">
                <span>{{ itm.atDescription || '-' }}</span>
                <span>{{ itm.atRemarks || '-' }}</span>
              </div>
            </div>
          </v-card>

          <v-card v-if="hasItems(CurSRDetails.partsUsed)" class="sr-detail-section" elevation="0">
            <div class="sr-detail-section__title">Parts Used</div>
            <div class="sr-detail-table sr-detail-table--parts">
              <div class="sr-detail-table__head">
                <span>Quantity</span>
                <span>Part number</span>
                <span>Description</span>
                <span>Serial number</span>
              </div>
              <div v-for="(itm, key) in CurSRDetails.partsUsed" :key="key" class="sr-detail-table__row">
                <span>{{ itm.puqty || '-' }}</span>
                <span>{{ itm.puPartNo || '-' }}</span>
                <span>{{ itm.puDescription || '-' }}</span>
                <span>{{ itm.puSerialNo || '-' }}</span>
              </div>
            </div>
          </v-card>

          <v-card v-if="remarks" class="sr-detail-section" elevation="0">
            <div class="sr-detail-section__title">Remarks</div>
            <p class="sr-detail-section__body">{{ remarks }}</p>
          </v-card>

          <v-card v-if="hasItems(CurSRDetails.charges)" class="sr-detail-section" elevation="0">
            <div class="sr-detail-section__title">Charges</div>
            <div class="sr-detail-pills">
              <div v-for="(chrg, key) in CurSRDetails.charges" :key="key" class="sr-detail-pill">
                <span>{{ chrg.srChargesDescription || 'Charge' }}</span>
                <strong>{{ chrg.srChargesRemarks || '-' }}</strong>
              </div>
            </div>
          </v-card>

          <v-card v-if="CurSRDetails.footer" class="sr-detail-section" elevation="0">
            <div class="sr-detail-section__title">Customer Acceptance</div>
            <div class="sr-detail-summary sr-detail-summary--nested">
              <div class="sr-detail-summary__item">
                <span>Laboratory representative</span>
                <strong>{{ CurSRDetails.footer.customerUserID || '-' }}</strong>
              </div>
              <div class="sr-detail-summary__item">
                <span>Date time in</span>
                <strong>{{ CurSRDetails.footer.srfDateTimeIn || '-' }}</strong>
              </div>
              <div class="sr-detail-summary__item">
                <span>Date time out</span>
                <strong>{{ CurSRDetails.footer.srfDateTimeOut || '-' }}</strong>
              </div>
            </div>
          </v-card>

          <v-card v-if="CurSRDetails.footerSignature" class="sr-detail-section" elevation="0">
            <div class="sr-detail-section__title">Acceptance Signature</div>
            <v-img
              class="sr-detail-signature"
              contain
              max-height="180"
              max-width="360"
              :src="CurSRDetails.footerSignature.srFooterAcceptance"
            ></v-img>
          </v-card>

          <v-card v-if="!hasVisibleSections" class="sr-state-card sr-state-card--inline" elevation="0">
            <v-icon size="40" color="blue-grey lighten-1">assignment</v-icon>
            <div class="sr-state-card__title">No service report sections to show</div>
          </v-card>
        </div>
      </template>
    </div>
  </v-container>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import moment from 'moment'
import timerSr from '@/components/timerSR'
import serviceReport from '../SRFormView'
import imageReport from '../SRImageViewer.vue'
import reportViewer from '@/reports/engineer/field/fieldReports.vue'

export default {
  components: {
    timerSr,
    serviceReport,
    imageReport,
    reportViewer,
  },
  data() {
    return {
      spnr: true,
      render: false,
      loadError: false,
    }
  },
  computed: {
    ...mapState(['CurSRDetails', 'CurThreadDetails', 'CurUserDetails', 'CurClientDetails']),
    hasRequiredDetails() {
      return this.render && this.CurThreadDetails && this.CurThreadDetails.TRDMTT
    },
    clientName() {
      return this.CurClientDetails.ACCMNM || this.CurClientDetails.ACCMSC || 'Service report details'
    },
    postedBy() {
      return this.CurThreadDetails.TRDMUI ? this.CurThreadDetails.TRDMUI.CNTMCN : ''
    },
    serviceTime() {
      if (!this.CurSRDetails.header || this.CurThreadDetails.TRDSEC === 'InHouse') return ''
      return this.getRelativeTime(this.CurSRDetails.header.dateTimeCreated)
    },
    workWith() {
      if (!this.hasItems(this.CurSRDetails.workWith)) return ''
      if (this.CurSRDetails.workWith[0].userInitials === '1') return ''
      return this.concatinate(this.CurSRDetails.workWith, 'userInitials')
    },
    instrumentModel() {
      return (
        this.CurThreadDetails.TRDMDE || (this.CurSRDetails.header && this.CurSRDetails.header.instrumentModelID) || ''
      )
    },
    serviceType() {
      return this.concatinate(this.CurSRDetails.serviceTypes || [], 'srTypeDescription')
    },
    remarks() {
      return this.CurSRDetails.remarks ? this.CurSRDetails.remarks.srRemarks : ''
    },
    ownTRD() {
      try {
        return (
          this.CurUserDetails &&
          this.CurUserDetails.USRDTL &&
          this.CurThreadDetails &&
          this.CurThreadDetails.TRDMUI &&
          this.CurUserDetails.USRDTL.USRDCI == this.CurThreadDetails.TRDMUI.CNTMID
        )
      } catch (e) {
        return false
      }
    },
    canViewImages() {
      const department = this.CurUserDetails.CNTMST && this.CurUserDetails.CNTMST.CNTDPT
      return (
        this.CurThreadDetails.TRDSTS === 'WORK COMPLETE' &&
        typeof department === 'string' &&
        department.substring(0, 3) === 'TSG'
      )
    },
    hasVisibleSections() {
      return (
        this.hasItems(this.CurSRDetails.purposeOfVisits) ||
        this.hasItems(this.CurSRDetails.actionTakens) ||
        this.hasItems(this.CurSRDetails.partsUsed) ||
        this.hasItems(this.CurSRDetails.charges) ||
        Boolean(this.remarks) ||
        Boolean(this.CurSRDetails.footer) ||
        Boolean(this.CurSRDetails.footerSignature)
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
          throw new Error('Thread details did not include a service report id.')
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
    loadCurSrDetails() {
      return this.getSRDetailsById(this.CurThreadDetails.TRDMTT).catch(err => {
        console.error(err)
      })
    },
    concatinate(data, key) {
      if (!Array.isArray(data) || data.length === 0) return ''
      try {
        return data
          .map(elm => elm[key])
          .filter(Boolean)
          .join(' / ')
      } catch (e) {
        return ''
      }
    },
    hasItems(data) {
      return Array.isArray(data) && data.length > 0
    },
    getRelativeTime(date) {
      if (!date) return ''
      try {
        return moment(date).format('MMMM Do YYYY, hh:mm a')
      } catch (e) {
        return ''
      }
    },
  },
}
</script>

<style scoped>
.sr-detail-page {
  min-height: calc(100vh - 92px);
  padding: 28px 16px 40px;
}

.sr-detail-shell {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
}

.sr-detail-header,
.sr-detail-summary,
.sr-detail-section,
.sr-state-card {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08) !important;
}

.sr-detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 24px;
}

.sr-detail-header__main {
  min-width: 0;
}

.sr-detail-header h1 {
  margin: 8px 0 4px;
  color: #102a43;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.25;
}

.sr-detail-header p {
  margin: 0;
  color: #62748a;
  font-size: 14px;
}

.sr-detail-badges,
.sr-detail-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.sr-detail-badge {
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

.sr-detail-badge--field {
  background: #3949ab;
}

.sr-detail-badge--report {
  background: #e53935;
}

.sr-detail-actions {
  justify-content: flex-end;
  flex: 0 0 auto;
}

.sr-detail-action {
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
}

.sr-detail-actions .layout {
  display: inline-flex !important;
  width: auto !important;
  flex: 0 0 auto !important;
}

.sr-detail-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin-top: 16px;
  padding: 18px 20px;
}

.sr-detail-summary--nested {
  margin-top: 0;
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none !important;
}

.sr-detail-summary__item span {
  display: block;
  margin-bottom: 4px;
  color: #7b8794;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.sr-detail-summary__item strong {
  display: block;
  color: #243b53;
  font-size: 14px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.sr-detail-grid {
  display: grid;
  gap: 16px;
  margin-top: 16px;
}

.sr-detail-section {
  padding: 18px 20px;
}

.sr-detail-section__title {
  margin-bottom: 14px;
  color: #102a43;
  font-size: 15px;
  font-weight: 800;
}

.sr-detail-section__body {
  margin: 0;
  color: #334e68;
  font-size: 14px;
  line-height: 1.65;
  white-space: pre-line;
}

.sr-detail-table {
  display: grid;
  gap: 0;
  overflow: hidden;
  border: 1px solid #e4e7eb;
  border-radius: 8px;
}

.sr-detail-table__head,
.sr-detail-table__row {
  display: grid;
  gap: 12px;
  align-items: start;
  padding: 12px 14px;
}

.sr-detail-table--two .sr-detail-table__head,
.sr-detail-table--two .sr-detail-table__row {
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
}

.sr-detail-table--parts .sr-detail-table__head,
.sr-detail-table--parts .sr-detail-table__row {
  grid-template-columns: 100px minmax(120px, 0.8fr) minmax(180px, 1.2fr) minmax(120px, 0.8fr);
}

.sr-detail-table__head {
  background: #f7f9fb;
  color: #52606d;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.sr-detail-table__row {
  color: #334e68;
  font-size: 14px;
  border-top: 1px solid #e4e7eb;
}

.sr-detail-table__row span {
  min-width: 0;
  overflow-wrap: anywhere;
}

.sr-detail-pills {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
}

.sr-detail-pill {
  padding: 12px 14px;
  border: 1px solid #e4e7eb;
  border-radius: 8px;
  background: #f8fafc;
}

.sr-detail-pill span {
  display: block;
  margin-bottom: 4px;
  color: #7b8794;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.sr-detail-pill strong {
  color: #243b53;
  font-size: 14px;
}

.sr-detail-signature {
  border: 1px solid #e4e7eb;
  border-radius: 8px;
  background: #fff;
}

.sr-state-card {
  display: flex;
  min-height: 220px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 28px;
  text-align: center;
}

.sr-state-card--inline {
  min-height: 180px;
}

.sr-state-card__title {
  color: #243b53;
  font-size: 17px;
  font-weight: 800;
}

.sr-state-card__text {
  max-width: 420px;
  color: #62748a;
  font-size: 14px;
}

.sr-detail-report-dialog {
  min-height: 80vh;
}

@media (max-width: 760px) {
  .sr-detail-page {
    padding: 16px 10px 28px;
  }

  .sr-detail-header {
    flex-direction: column;
    padding: 16px;
  }

  .sr-detail-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .sr-detail-table--two .sr-detail-table__head,
  .sr-detail-table--two .sr-detail-table__row,
  .sr-detail-table--parts .sr-detail-table__head,
  .sr-detail-table--parts .sr-detail-table__row {
    grid-template-columns: 1fr;
  }

  .sr-detail-table__head {
    display: none;
  }
}
</style>
