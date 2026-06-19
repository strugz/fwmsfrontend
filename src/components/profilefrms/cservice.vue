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
    <v-speed-dial bottom right fixed transition="slide-x-reverse-transition" direction="top" class="mb-5 mr-5">
      <template v-slot:activator>
        <v-btn color="blue darken-2" dark fab>
          <v-icon>add</v-icon>
          <v-icon>close</v-icon>
        </v-btn>
      </template>
      <my-TTP v-show="CurUserDetails.CNTMST.CNTSEC != 'TSR' && CurUserDetails.CNTMST.CNTSEC != 'COLLECTOR'"></my-TTP>
      <new-sreport v-if="showSR && CurUserDetails.CNTMST.CNTSEC == 'TSG'"></new-sreport>
      <new-sreport v-if="showSR && CurUserDetails.CNTMST.CNTSEC == 'IMS'"></new-sreport>
      <new-sreport v-if="showSR && CurUserDetails.CNTMST.CNTSEC == 'TSR/ENGINEER'"></new-sreport>
      <checkInOut
        v-if="CurUserDetails.CNTMST.CNTSEC != 'TSR' && CurUserDetails.CNTMST.CNTSEC != 'COLLECTOR'"
      ></checkInOut>
      <ps-form v-if="showSR && CurUserDetails.CNTMST.CNTSEC == 'PS'"></ps-form>
      <ps-form v-if="showSR && CurUserDetails.CNTMST.CNTSEC == 'IMG'"></ps-form>
      <ps-form v-if="showSR && CurUserDetails.CNTMST.CNTSEC == 'TSR/PS'"></ps-form>
      <collection-visit class="mb-2" v-if="CurUserDetails.CNTMST.CNTSEC == 'COLLECTOR'"></collection-visit>
    </v-speed-dial>
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
</style>
