<template>
  <v-toolbar>
    <v-text-field v-model="textSearch" label="Filter by: Instrument Model/SR #"
      placeholder="Filter by: Instrument Model/SR #" class="pt-4" autowidth dense></v-text-field>
    <v-btn small color="primary" @click="upThreads()">Search</v-btn>
  </v-toolbar>
</template>

<script>
import { mapState, mapActions, mapMutations } from "vuex";
export default {
  data() {
    return {
      textSearch: "",
    };
  },
  mounted() {
    const storedTextSearch = localStorage.getItem('searchText');
    if (storedTextSearch) {
      this.textSearch = storedTextSearch;
      this.upThreads();
    }
  },
  watch: {
    PageNumber() {
      if (this.textSearch != "") {
        this.upThreads();
      }
      console.log(this.PageNumber);
    },
    textSearch() {
      if (this.textSearch == "") {
        this.upPageNumber({ pageNumber: 1 });
        localStorage.setItem('searchText', this.textSearch);
      }
    },
  },
  computed: {
    ...mapState(["CurClientDetails", "PageNumber", "CurUserDetails"]),
    sections() {
      let itms = [];
      for (const i in this.CurClientDetails.ACCDTL) {
        itms.push(this.CurClientDetails.ACCDTL[i].ACCDDN);
      }
      return itms;
    },
  },
  methods: {
    ...mapActions(["getThreadByAccountIdWithFilter"]),
    ...mapMutations([
      "upCurThreads",
      "upTotalPages",
      "upTextFilter",
      "upPageNumber",
    ]),
    upThreads() {
      const data = {
        cntdpt: this.CurUserDetails.CNTMST.CNTDPT,
        accmid: this.$route.params.ACCMID,
        tosearch: this.textSearch,
        pageNumber: this.PageNumber,
      };
      this.upTextFilter({ textSearch: this.textSearch });
      this.upCurThreads([]);
      if (this.textSearch != "") {
        this.getThreadByAccountIdWithFilter(data).then(
          (res) => {
            this.upCurThreads(res.data.data.threads);
            this.upTotalPages({
              totPages: res.data.totalPages,
            });
          },
          (error) => {
            text - field;
            console.error(error);
          }
        );
      }
      localStorage.setItem('searchText', this.textSearch);
    },
  },
};
</script>
