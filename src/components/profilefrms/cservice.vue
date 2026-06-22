<template>
  <v-container fluid class="thread-workspace">
    <app-filter-thread></app-filter-thread>
    <div class="thread-list">
      <div v-for="(thread, key) in CurThreads" :key="key" class="thread-list__item">
        <card-thread
          v-if="
            thread.TRDMTY !== 'Service Report' &&
            thread.TRDMTY !== 'TTP' &&
            thread.TRDMTY !== 'MedRep Visit' &&
            thread.TRDMTY !== 'PA Service Report' &&
            thread.TRDMTY !== 'Collection Visit'
          "
          :thread="thread"
        ></card-thread>
        <card-sr v-else :data="thread"></card-sr>
      </div>
    </div>
    <div class="thread-actions">
      <div class="thread-actions__header">
        <div class="thread-actions__icon">
          <v-icon size="16" color="teal darken-2">flash_on</v-icon>
        </div>
        <div>
          <div class="thread-actions__label">Quick actions</div>
          <div class="thread-actions__subtext">Start common tasks</div>
        </div>
      </div>
      <div class="thread-actions__list">
        <checkInOut
          v-if="CurUserDetails.CNTMST.CNTSEC != 'TSR' && CurUserDetails.CNTMST.CNTSEC != 'COLLECTOR'"
        ></checkInOut>
        <my-TTP v-if="CurUserDetails.CNTMST.CNTSEC != 'TSR' && CurUserDetails.CNTMST.CNTSEC != 'COLLECTOR'"></my-TTP>
        <new-sreport v-if="showSR && CurUserDetails.CNTMST.CNTSEC == 'TSG'"></new-sreport>
        <new-sreport v-if="showSR && CurUserDetails.CNTMST.CNTSEC == 'IMS'"></new-sreport>
        <new-sreport v-if="showSR && CurUserDetails.CNTMST.CNTSEC == 'TSR/ENGINEER'"></new-sreport>
        <ps-form v-if="showSR && CurUserDetails.CNTMST.CNTSEC == 'PS'"></ps-form>
        <ps-form v-if="showSR && CurUserDetails.CNTMST.CNTSEC == 'IMG'"></ps-form>
        <ps-form v-if="showSR && CurUserDetails.CNTMST.CNTSEC == 'TSR/PS'"></ps-form>
        <collection-visit v-if="CurUserDetails.CNTMST.CNTSEC == 'COLLECTOR'"></collection-visit>
      </div>
    </div>
    <div class="text-center">
      <v-pagination v-model="pageNumber" :length="TotalPages" circle></v-pagination>
    </div>
  </v-container>
</template>
<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import AppFilterThread from '@/components/threadFilter.vue'
import NewThread from '@/components/zuzi/createthread.vue'
import checkInOut from '@/components/checkInOut.vue'
import myTTP from '@/components/TTPStart.vue'
import NewSreport from '@/components/SRForm.vue'
import PsForm from '@/components/PSForm.vue'
import CardThread from './cardThread'
import CardSr from './cardSR'
import CardTicket from './cardTicket.vue'
import CollectionVisit from '@/components/CollectionStart.vue'

export default {
  data() {
    return { pageNumber: 1, totalPages: 1 }
  },
  created() {
    const storedTextSearch = localStorage.getItem('searchText')
    if (storedTextSearch) {
      this.upTextFilter({ textSearch: localStorage.getItem('searchText') })
    }
    // Try to restore last page for this account from sessionStorage so full page refresh
    // doesn't reset pagination to 1. Key is namespaced by account id when available.
    try {
      const accKey =
        this.$route && this.$route.params && this.$route.params.ACCMID ? this.$route.params.ACCMID : 'global'
      const storedPage = sessionStorage.getItem(`threads_page_${accKey}`)
      if (storedPage) {
        this.pageNumber = Number(storedPage)
      } else if (this.PageNumber && Number(this.PageNumber) > 1) {
        // fallback to Vuex stored page if available
        this.pageNumber = Number(this.PageNumber)
      }
    } catch (e) {
      // ignore session storage errors
    }
    if (this.CurClientMID != this.CurClientDetails.ACCMID) {
      this.LoadClientTransaction()
    } else {
      this.LoadClientTransaction()
    }
  },
  watch: {
    pageNumber() {
      // persist the page number for this account so a full page refresh keeps it
      try {
        const accKey =
          this.$route && this.$route.params && this.$route.params.ACCMID ? this.$route.params.ACCMID : 'global'
        sessionStorage.setItem(`threads_page_${accKey}`, String(this.pageNumber))
      } catch (e) {
        // ignore session storage errors
      }

      // always update Vuex with current page number
      this.upPageNumber({ pageNumber: this.pageNumber })

      if (this.TextFilter == '') {
        this.LoadClientTransaction()
      } else {
        // when text filter is active we call filtered API elsewhere; keep behaviour
        this.getThreadByAccountId({
          cntdpt: this.CurUserDetails.CNTMST.CNTDPT,
          accID: this.$route.params.ACCMID ? this.$route.params.ACCMID : '',
          pageNumber: this.pageNumber,
        }).then(
          res => {
            this.upCurClientMID(this.$route.params.ACCMID)
            this.upCurThreads(res.data.data.threads)
            this.upTotalPages({ totPages: res.data.totalPages })
          },
          error => {
            console.error(error)
          }
        )
      }
    },
    TotalPages() {
      this.totalPages = this.TotalPages
    },
    TextFilter() {
      if (this.TextFilter == '') {
        this.pageNumber = 1
        this.LoadClientTransaction()
      }
    },
  },
  computed: {
    ...mapState([
      'CurThreads',
      'CurCheckInAcc',
      'CurClientDetails',
      'PageNumber',
      'TextFilter',
      'TotalPages',
      'CurUserDetails',
      'CurClientMID',
    ]),
    showSR() {
      const val =
        this.CurCheckInAcc.serviceLocLogAction == 'CheckIn' &&
        this.CurCheckInAcc.customerID.ACCMID == this.CurClientDetails.ACCMID
      return val
    },
  },
  methods: {
    ...mapActions(['getThreadByAccountId']),
    ...mapMutations(['upCurThreads', 'upPageNumber', 'upTotalPages', 'upCurClientMID']),
    LoadClientTransaction() {
      this.upCurThreads([])
      const accID = this.$route.params.ACCMID ? this.$route.params.ACCMID : ''
      this.getThreadByAccountId({
        cntdpt: this.CurUserDetails.CNTMST.CNTDPT,
        accID: accID,
        pageNumber: this.pageNumber,
      }).then(
        res => {
          this.upCurClientMID(this.$route.params.ACCMID)
          this.upCurThreads(res.data.data.threads)
          this.upTotalPages({ totPages: res.data.totalPages })
        },
        error => {
          console.error(error)
        }
      )
    },
  },
  components: {
    NewThread,
    NewSreport,
    AppFilterThread,
    CardThread,
    CardSr,
    checkInOut,
    CardTicket,
    myTTP,
    PsForm,
    CollectionVisit,
  },
}
</script>

<style>
.thread-workspace {
  max-width: 1280px;
  padding-top: 20px;
  padding-bottom: 96px;
}

.thread-list {
  display: grid;
  gap: 14px;
  margin-top: 14px;
}

.thread-list__item {
  position: relative;
}

.hoverClick:hover {
  text-decoration: underline;
  color: steelblue;
  cursor: pointer;
}

.thread-actions {
  position: fixed;
  right: 28px;
  bottom: 28px;
  z-index: 8;
  width: 218px;
  padding: 14px;
  border: 1px solid rgba(0, 121, 107, 0.14);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.18);
}

.thread-actions::before {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(0, 137, 123, 0.08), rgba(255, 255, 255, 0));
  content: '';
  pointer-events: none;
}

.thread-actions__header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.thread-actions__icon {
  display: inline-flex;
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #e0f2f1;
}

.thread-actions__label {
  color: #102a43;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.thread-actions__subtext {
  margin-top: 2px;
  color: #62748a;
  font-size: 11px;
  line-height: 1.2;
}

.thread-actions__list {
  position: relative;
  display: grid;
  gap: 9px;
}

.thread-actions .layout {
  display: block !important;
  width: 100% !important;
  margin: 0 !important;
}

.thread-actions .v-btn {
  width: 100%;
  height: 34px !important;
  min-width: 0 !important;
  margin: 0 !important;
  border-radius: 999px !important;
  justify-content: center;
  box-shadow: 0 8px 18px rgba(0, 121, 107, 0.22) !important;
  font-size: 11px !important;
  font-weight: 900 !important;
  letter-spacing: 0.04em !important;
  text-transform: uppercase;
}

.thread-actions .v-btn:hover {
  transform: translateY(-1px);
}

@media (max-width: 760px) {
  .thread-workspace {
    padding-bottom: 132px;
  }

  .thread-actions {
    right: 10px;
    bottom: 10px;
    left: 10px;
    width: auto;
    padding: 12px;
  }

  .thread-actions__list {
    grid-template-columns: repeat(auto-fit, minmax(132px, 1fr));
  }

  .thread-actions__header {
    margin-bottom: 10px;
  }
}
</style>
