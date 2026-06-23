<template>
  <v-container fluid class="collection-detail-page">
    <div class="collection-detail-shell">
      <v-card v-if="spnr" class="collection-state-card" elevation="0">
        <v-progress-circular indeterminate color="teal darken-2"></v-progress-circular>
        <div class="collection-state-card__title">Loading collection visit...</div>
      </v-card>

      <v-card v-else-if="loadError || !hasRequiredDetails" class="collection-state-card" elevation="0">
        <v-icon size="44" color="blue-grey lighten-1">assignment_late</v-icon>
        <div class="collection-state-card__title">Collection visit unavailable</div>
        <div class="collection-state-card__text">
          Refresh the page or open this visit again from the customer thread.
        </div>
      </v-card>

      <template v-else>
        <v-card class="collection-detail-header" elevation="0">
          <div class="collection-detail-header__main">
            <div class="collection-detail-badges">
              <span class="collection-detail-badge collection-detail-badge--field">{{ CurThreadDetails.TRDSEC }}</span>
              <span class="collection-detail-badge collection-detail-badge--report">Collection Visit</span>
            </div>
            <h1>SR: #{{ CurThreadDetails.TRDMTT }}</h1>
            <p>{{ clientName }}</p>
          </div>

          <div v-if="CurThreadDetails.TRDSTS !== 'WORK COMPLETE'" class="collection-detail-action">
            <app-form></app-form>
          </div>
        </v-card>

        <v-card class="collection-detail-summary" elevation="0">
          <div v-if="visitDate" class="collection-detail-summary__item">
            <span>Date and time of visit</span>
            <strong>{{ visitDate }}</strong>
          </div>
          <div v-if="purposeOfVisit" class="collection-detail-summary__item">
            <span>Purpose of visit</span>
            <strong>{{ purposeOfVisit }}</strong>
          </div>
          <div v-if="bank" class="collection-detail-summary__item">
            <span>Bank</span>
            <strong>{{ bank }}</strong>
          </div>
          <div v-if="checkNo" class="collection-detail-summary__item">
            <span>Check no.</span>
            <strong>{{ checkNo }}</strong>
          </div>
          <div v-if="checkDate" class="collection-detail-summary__item">
            <span>Check date</span>
            <strong>{{ checkDate }}</strong>
          </div>
          <div v-if="amountCollected" class="collection-detail-summary__item">
            <span>Amount collected</span>
            <strong>{{ amountCollected }}</strong>
          </div>
          <div v-if="salesInvoiceReference" class="collection-detail-summary__item">
            <span>Sales invoice reference</span>
            <strong>{{ salesInvoiceReference }}</strong>
          </div>
        </v-card>

        <div class="collection-detail-grid">
          <v-card v-if="remarks" class="collection-detail-section" elevation="0">
            <div class="collection-detail-section__title">Summary of Visit</div>
            <p class="collection-detail-section__body">{{ remarks }}</p>
          </v-card>

          <v-card v-if="!remarks" class="collection-state-card collection-state-card--inline" elevation="0">
            <v-icon size="40" color="blue-grey lighten-1">assignment</v-icon>
            <div class="collection-state-card__title">No collection summary to show</div>
          </v-card>
        </div>
      </template>
    </div>
  </v-container>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import moment from 'moment'
import AppForm from '@/components/CollectorForm'

export default {
  components: {
    AppForm,
  },
  data() {
    return {
      render: false,
      spnr: true,
      loadError: false,
    }
  },
  computed: {
    ...mapState(['CurThreadDetails', 'CurClientDetails', 'CurUserDetails', 'CurSRDetails', 'collectorDetails']),
    hasRequiredDetails() {
      return this.render && this.CurThreadDetails && this.CurThreadDetails.TRDMTT
    },
    clientName() {
      return this.CurClientDetails.ACCMNM || this.CurClientDetails.ACCMSC || 'Collection visit details'
    },
    visitDate() {
      return this.getFormattedDate(this.CurThreadDetails.TRDMCD)
    },
    purposeOfVisit() {
      return this.toString(this.CurSRDetails.purposeOfVisits || [])
    },
    bank() {
      return this.collectorDetails.bank || ''
    },
    checkNo() {
      return this.collectorDetails.checkno || ''
    },
    checkDate() {
      return this.collectorDetails.checkdate ? String(this.collectorDetails.checkdate).substring(0, 10) : ''
    },
    amountCollected() {
      return this.collectorDetails.amountcollected || ''
    },
    salesInvoiceReference() {
      return this.collectorDetails.salesinvoicereference || ''
    },
    remarks() {
      return this.CurSRDetails.remarks ? this.CurSRDetails.remarks.srRemarks : ''
    },
    ownTRD() {
      return (
        this.CurUserDetails &&
        this.CurUserDetails.USRDTL &&
        this.CurThreadDetails &&
        this.CurThreadDetails.TRDMUI &&
        this.CurUserDetails.USRDTL.USRDCI == this.CurThreadDetails.TRDMUI.CNTMID
      )
    },
  },
  async mounted() {
    await this.loadDetails()
  },
  methods: {
    ...mapActions(['getSRDetailsById', 'getThreadDetailsById', 'getAcc', 'getCollectorDetails']),
    ...mapMutations(['upClient', 'upTrdDetails', 'upcollectorDetails']),
    async loadDetails() {
      this.spnr = true
      this.render = false
      this.loadError = false

      try {
        const thread = await this.getThreadDetailsById(this.$route.params.TRDMTI)
        if (!thread || !thread.TRDMTT) {
          throw new Error('Thread details did not include a collection visit id.')
        }

        const collection = await this.getCollectorDetails(thread.TRDMTT)
        this.upcollectorDetails(collection.data)

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
    getFormattedDate(date) {
      if (!date) return ''
      try {
        return moment(date).format('MMMM Do YYYY, hh:mm a')
      } catch (e) {
        return ''
      }
    },
    toString(data) {
      if (!Array.isArray(data)) return ''
      return data
        .map(item => item.pvDescription)
        .filter(Boolean)
        .join(' / ')
    },
  },
}
</script>

<style scoped>
.collection-detail-page {
  min-height: calc(100vh - 92px);
  padding: 28px 16px 40px;
}

.collection-detail-shell {
  margin: 0 auto;
  max-width: 1120px;
  width: 100%;
}

.collection-detail-header,
.collection-detail-summary,
.collection-detail-section,
.collection-state-card {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08) !important;
}

.collection-detail-header {
  align-items: flex-start;
  display: flex;
  gap: 24px;
  justify-content: space-between;
  padding: 26px 28px;
}

.collection-detail-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.collection-detail-badge {
  border-radius: 999px;
  color: white;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  padding: 5px 10px;
  text-transform: uppercase;
}

.collection-detail-badge--field {
  background: #0f766e;
}

.collection-detail-badge--report {
  background: #1976d2;
}

.collection-detail-header h1 {
  color: #0f172a;
  font-size: 1.7rem;
  margin: 0 0 5px;
}

.collection-detail-header p {
  color: #64748b;
  margin: 0;
}

.collection-detail-summary {
  display: grid;
  gap: 1px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 16px;
  overflow: hidden;
}

.collection-detail-summary__item {
  background: rgba(248, 250, 252, 0.86);
  padding: 16px 18px;
}

.collection-detail-summary__item span {
  color: #64748b;
  display: block;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.collection-detail-summary__item strong {
  color: #0f172a;
  display: block;
  margin-top: 4px;
}

.collection-detail-grid {
  display: grid;
  gap: 16px;
  margin-top: 16px;
}

.collection-detail-section {
  padding: 22px 24px;
}

.collection-detail-section__title {
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
  margin-bottom: 12px;
}

.collection-detail-section__body {
  color: #334155;
  line-height: 1.7;
  margin: 0;
  white-space: pre-line;
}

.collection-state-card {
  align-items: center;
  color: #64748b;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 240px;
  padding: 32px;
  text-align: center;
}

.collection-state-card--inline {
  min-height: 180px;
}

.collection-state-card__title {
  color: #334155;
  font-size: 1rem;
  font-weight: 800;
  margin-top: 12px;
}

.collection-state-card__text {
  margin-top: 5px;
}

@media (max-width: 760px) {
  .collection-detail-header {
    flex-direction: column;
  }

  .collection-detail-summary {
    grid-template-columns: 1fr;
  }
}
</style>
