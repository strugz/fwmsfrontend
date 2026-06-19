<template>
  <div class="thread-filter">
    <div class="thread-filter__body">
      <v-icon color="teal darken-2" class="mr-2">search</v-icon>
      <v-text-field
        v-model="textSearch"
        label="Filter by instrument model or SR number"
        placeholder="Filter by instrument model or SR number"
        class="thread-filter__input"
        dense
        flat
        hide-details
        single-line
      ></v-text-field>
    </div>
    <v-btn depressed color="teal darken-2" dark class="thread-filter__btn" @click="upThreads()">Search</v-btn>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
export default {
  data() {
    return {
      textSearch: '',
    }
  },
  mounted() {
    const storedTextSearch = localStorage.getItem('searchText')
    if (storedTextSearch) {
      this.textSearch = storedTextSearch
      this.upThreads()
    }
  },
  watch: {
    PageNumber() {
      if (this.textSearch != '') {
        this.upThreads()
      }
      console.log(this.PageNumber)
    },
    textSearch() {
      if (this.textSearch == '') {
        this.upPageNumber({ pageNumber: 1 })
        localStorage.setItem('searchText', this.textSearch)
      }
    },
  },
  computed: {
    ...mapState(['CurClientDetails', 'PageNumber', 'CurUserDetails']),
    sections() {
      let itms = []
      for (const i in this.CurClientDetails.ACCDTL) {
        itms.push(this.CurClientDetails.ACCDTL[i].ACCDDN)
      }
      return itms
    },
  },
  methods: {
    ...mapActions(['getThreadByAccountIdWithFilter']),
    ...mapMutations(['upCurThreads', 'upTotalPages', 'upTextFilter', 'upPageNumber']),
    upThreads() {
      const data = {
        cntdpt: this.CurUserDetails.CNTMST.CNTDPT,
        accmid: this.$route.params.ACCMID,
        tosearch: this.textSearch,
        pageNumber: this.PageNumber,
      }
      this.upTextFilter({ textSearch: this.textSearch })
      this.upCurThreads([])
      if (this.textSearch != '') {
        this.getThreadByAccountIdWithFilter(data).then(
          res => {
            this.upCurThreads(res.data.data.threads)
            this.upTotalPages({
              totPages: res.data.totalPages,
            })
          },
          error => {
            text - field
            console.error(error)
          }
        )
      }
      localStorage.setItem('searchText', this.textSearch)
    },
  },
}
</script>

<style>
.thread-filter {
  align-items: center;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(15, 76, 76, 0.1);
  border-radius: 12px;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.08);
  display: flex;
  gap: 12px;
  padding: 12px 14px;
}

.thread-filter__body {
  align-items: center;
  display: flex;
  flex: 1;
  min-width: 0;
}

.thread-filter__input .v-input__slot {
  margin-bottom: 0 !important;
}

.thread-filter__btn {
  border-radius: 8px;
  font-weight: 700;
  letter-spacing: 0.03em;
  min-width: 96px;
}

@media (max-width: 600px) {
  .thread-filter {
    align-items: stretch;
    flex-direction: column;
  }

  .thread-filter__btn {
    width: 100%;
  }
}
</style>
