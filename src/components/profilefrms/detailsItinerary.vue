<template>
  <v-container fluid class="itinerary-detail-page">
    <div class="itinerary-detail-shell">
      <v-card v-if="spnr" class="itinerary-state-card" elevation="0">
        <v-progress-circular indeterminate color="teal darken-2"></v-progress-circular>
        <div class="itinerary-state-card__title">Loading itinerary details...</div>
      </v-card>

      <v-card v-else-if="loadError || !hasRequiredDetails" class="itinerary-state-card" elevation="0">
        <v-icon size="44" color="blue-grey lighten-1">assignment_late</v-icon>
        <div class="itinerary-state-card__title">Itinerary details unavailable</div>
        <div class="itinerary-state-card__text">
          Refresh the page or open this itinerary again from the customer thread.
        </div>
      </v-card>

      <template v-else>
        <v-card class="itinerary-detail-header" elevation="0">
          <div class="itinerary-detail-header__main">
            <div class="itinerary-detail-badges">
              <span class="itinerary-detail-badge itinerary-detail-badge--field">{{ CurThreadDetails.TRDSEC }}</span>
              <span class="itinerary-detail-badge itinerary-detail-badge--report">MedRep Visit</span>
            </div>
            <h1>SR: #{{ CurThreadDetails.TRDMTT }}</h1>
            <p>{{ clientName }}</p>
          </div>

          <div v-if="ownTRD && CurThreadDetails.TRDSTS !== 'WORK COMPLETE'" class="itinerary-detail-action">
            <meditinerary></meditinerary>
          </div>
        </v-card>

        <v-card class="itinerary-detail-summary" elevation="0">
          <div v-if="visitDate" class="itinerary-detail-summary__item">
            <span>Date and time visited</span>
            <strong>{{ visitDate }}</strong>
          </div>
          <div v-if="postedBy" class="itinerary-detail-summary__item">
            <span>Visited by</span>
            <strong>{{ postedBy }}</strong>
          </div>
          <div v-if="customerName" class="itinerary-detail-summary__item">
            <span>Customer</span>
            <strong>{{ customerName }}</strong>
          </div>
          <div v-if="customerPosition" class="itinerary-detail-summary__item">
            <span>Specialty / Position</span>
            <strong>{{ customerPosition }}</strong>
          </div>
          <div v-if="customerStatus" class="itinerary-detail-summary__item">
            <span>User / Non-user</span>
            <strong>{{ customerStatus }}</strong>
          </div>
          <div v-if="customerClass" class="itinerary-detail-summary__item">
            <span>Classification</span>
            <strong>{{ customerClass }}</strong>
          </div>
          <div v-if="targetProduct" class="itinerary-detail-summary__item">
            <span>Target product</span>
            <strong>{{ targetProduct }}</strong>
          </div>
        </v-card>

        <div class="itinerary-detail-grid">
          <v-card v-if="hasLocation" class="itinerary-detail-section" elevation="0">
            <div class="itinerary-detail-section__title">Med Rep Location</div>
            <a
              class="itinerary-location-link"
              :href="'https://www.google.com/maps?q=' + lat + ',' + long"
              target="_blank"
            >
              <v-icon small color="teal darken-2">place</v-icon>
              Open Google Maps
            </a>
          </v-card>

          <v-card v-if="remarks" class="itinerary-detail-section" elevation="0">
            <div class="itinerary-detail-section__title">Summary of the Itinerary</div>
            <p class="itinerary-detail-section__body">{{ remarks }}</p>
          </v-card>

          <v-card v-if="CurSRDetails.footerSignature" class="itinerary-detail-section" elevation="0">
            <div class="itinerary-detail-section__title">Acceptance Signature</div>
            <v-img
              class="itinerary-detail-signature"
              contain
              max-height="180"
              max-width="360"
              :src="CurSRDetails.footerSignature.srFooterAcceptance"
            ></v-img>
          </v-card>

          <v-card v-if="!hasVisibleSections" class="itinerary-state-card itinerary-state-card--inline" elevation="0">
            <v-icon size="40" color="blue-grey lighten-1">assignment</v-icon>
            <div class="itinerary-state-card__title">No itinerary sections to show</div>
          </v-card>
        </div>
      </template>
    </div>
  </v-container>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import moment from 'moment'
import meditinerary from '../MedRepItinerary'

export default {
  components: {
    meditinerary,
  },
  data() {
    return {
      render: false,
      spnr: true,
      loadError: false,
      lat: '',
      long: '',
    }
  },
  computed: {
    ...mapState(['CurThreadDetails', 'CurClientDetails', 'CurUserDetails', 'CurSRDetails', 'CurCSTMST']),
    hasRequiredDetails() {
      return this.render && this.CurThreadDetails && this.CurThreadDetails.TRDMTT
    },
    clientName() {
      return this.CurClientDetails.ACCMNM || this.CurClientDetails.ACCMSC || 'Itinerary details'
    },
    visitDate() {
      return this.getFormattedDate(this.CurThreadDetails.TRDMCD)
    },
    postedBy() {
      return this.CurThreadDetails.TRDMUI ? this.CurThreadDetails.TRDMUI.CNTMCN : ''
    },
    customerName() {
      return this.CurCSTMST.CSTNME || ''
    },
    customerPosition() {
      return this.CurCSTMST.CSTPOS || ''
    },
    customerStatus() {
      return this.CurCSTMST.CSTSTS || ''
    },
    customerClass() {
      return this.CurCSTMST.CSTCLS || ''
    },
    targetProduct() {
      return this.CurCSTMST.CSTTPR || ''
    },
    remarks() {
      return this.CurSRDetails.remarks ? this.CurSRDetails.remarks.srRemarks : ''
    },
    hasLocation() {
      return Boolean(this.lat && this.long)
    },
    hasVisibleSections() {
      return Boolean(this.hasLocation || this.remarks || this.CurSRDetails.footerSignature)
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
    ...mapActions(['getSRDetailsById', 'getThreadDetailsById', 'getAcc', 'getCSTMSTPerCust']),
    ...mapMutations(['upClient', 'upTrdDetails', 'upCurCSTMST']),
    async loadDetails() {
      this.spnr = true
      this.render = false
      this.loadError = false

      try {
        const thread = await this.getThreadDetailsById(this.$route.params.TRDMTI)
        if (!thread || !thread.TRDMTT) {
          throw new Error('Thread details did not include an itinerary id.')
        }

        this.setCoordinates(thread.TRDLOC)

        if (thread.TRDMDE) {
          const customer = await this.getCSTMSTPerCust(thread.TRDMDE)
          this.upCurCSTMST(customer.data)
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
    setCoordinates(location) {
      const parts = String(location || '').split(' ')
      this.lat = parts[0] || ''
      this.long = parts[1] || ''
    },
    getFormattedDate(date) {
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
.itinerary-detail-page {
  min-height: calc(100vh - 92px);
  padding: 28px 16px 40px;
}

.itinerary-detail-shell {
  margin: 0 auto;
  max-width: 1120px;
  width: 100%;
}

.itinerary-detail-header,
.itinerary-detail-summary,
.itinerary-detail-section,
.itinerary-state-card {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08) !important;
}

.itinerary-detail-header {
  align-items: flex-start;
  display: flex;
  gap: 24px;
  justify-content: space-between;
  padding: 26px 28px;
}

.itinerary-detail-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.itinerary-detail-badge {
  border-radius: 999px;
  color: white;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  padding: 5px 10px;
  text-transform: uppercase;
}

.itinerary-detail-badge--field {
  background: #0f766e;
}

.itinerary-detail-badge--report {
  background: #1976d2;
}

.itinerary-detail-header h1 {
  color: #0f172a;
  font-size: 1.7rem;
  margin: 0 0 5px;
}

.itinerary-detail-header p {
  color: #64748b;
  margin: 0;
}

.itinerary-detail-summary {
  display: grid;
  gap: 1px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 16px;
  overflow: hidden;
}

.itinerary-detail-summary__item {
  background: rgba(248, 250, 252, 0.86);
  padding: 16px 18px;
}

.itinerary-detail-summary__item span {
  color: #64748b;
  display: block;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.itinerary-detail-summary__item strong {
  color: #0f172a;
  display: block;
  margin-top: 4px;
}

.itinerary-detail-grid {
  display: grid;
  gap: 16px;
  margin-top: 16px;
}

.itinerary-detail-section {
  padding: 22px 24px;
}

.itinerary-detail-section__title {
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
  margin-bottom: 12px;
}

.itinerary-detail-section__body {
  color: #334155;
  line-height: 1.7;
  margin: 0;
  white-space: pre-line;
}

.itinerary-location-link {
  align-items: center;
  color: #0f766e;
  display: inline-flex;
  font-weight: 800;
  gap: 6px;
  text-decoration: none;
}

.itinerary-detail-signature {
  background: #f8fafc;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 8px;
}

.itinerary-state-card {
  align-items: center;
  color: #64748b;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 240px;
  padding: 32px;
  text-align: center;
}

.itinerary-state-card--inline {
  min-height: 180px;
}

.itinerary-state-card__title {
  color: #334155;
  font-size: 1rem;
  font-weight: 800;
  margin-top: 12px;
}

.itinerary-state-card__text {
  margin-top: 5px;
}

@media (max-width: 760px) {
  .itinerary-detail-header {
    flex-direction: column;
  }

  .itinerary-detail-summary {
    grid-template-columns: 1fr;
  }
}
</style>
