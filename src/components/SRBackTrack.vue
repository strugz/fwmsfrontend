<template>
  <v-layout>
    <v-dialog
      class="dialog"
      v-model="dialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <template v-slot:activator="{ on }">
        <span v-on="on">Back Track</span>
      </template>
      <v-card>
        <v-toolbar
          color="primary"
          dense
          dark
          fixed
        >
          <v-toolbar-title>Service Report Back Track</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
            icon
            @click="dialog = !dialog"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-container fluid>
          <v-layout
            align-center
            justify-center
            row
            class="mt-5"
            v-show="loading == true"
          >
            <v-card flat>
              <v-flex xs12>
                <v-progress-circular
                  :size="70"
                  :width="7"
                  color="black"
                  indeterminate
                ></v-progress-circular>
              </v-flex>
              <v-flex xs12>
                <span>Loading...</span>
              </v-flex>
            </v-card>
          </v-layout>
          <v-flex>
            <v-layout
              row
              wrap
            >
              <v-flex
                v-for="(thread, key) in CurThreads"
                :key="key"
                xs12
                class="mt-5"
              >
                <v-badge
                  color="red"
                  left
                  overlap
                  style="width: 100%;"
                >
                  <card-sr :data="thread"></card-sr>
                </v-badge>
              </v-flex>
            </v-layout>
          </v-flex>
          <!-- <div
            id="requestform"
            class="scroll-y pt-2"
            style="max-height: 100%;"
            ref="section"
          >

          </div> -->
        </v-container>
      </v-card>
      <v-card-text class="fixed">
        <div class="text-xs-center">
          <v-pagination
            v-model="pageNumber"
            :length="TotalPages"
            circle
          ></v-pagination>
        </div>
      </v-card-text>
    </v-dialog>
  </v-layout>
</template>
  <script>
import { mapState, mapMutations, mapActions } from "vuex";
import AppFilterThread from "@/components/threadFilter.vue";
import CardThread from "../components/profilefrms/cardThread";
import CardSr from "../components/profilefrms/cardSRBackTrack";

export default {
  data() {
    return {
      pageNumber: 1,
      totalPages: 1,
      dialog: false,
      loading: false
    };
  },
  mounted() {
    if (this.CurThreads.length == 0) {
      this.loading = true;
    } else {
      this.loading = false;
    }
    this.LoadClientTransaction();
  },
  watch: {
    pageNumber() {
      this.CurThreads = [];
      this.loading = true;
      this.LoadClientTransaction();
      this.upPageNumber({ pageNumber: this.pageNumber });
    },
    TotalPages() {
      this.totalPages = this.TotalPages;
    },
  },
  computed: {
    ...mapState([
      "CurThreads",
      "CurClientDetails",
      "PageNumber",
      "TextFilter",
      "TotalPages",
      "CurUserDetails",
    ]),
  },
  methods: {
    ...mapActions(["getThreadForBackTrack"]),
    ...mapMutations(["upCurThreads", "upPageNumber", "upTotalPages"]),
    LoadClientTransaction() {
      this.getThreadForBackTrack({
        cntare: this.CurUserDetails.CNTMST.CNTARE,
        pageNumber: this.pageNumber,
      }).then(
        (res) => {
          this.loading = false;
          this.upCurThreads(res.data.data.threads);
          this.upTotalPages({ totPages: res.data.totalPages });
        },
        (error) => {
          console.error(error);
        }
      );
    },
  },
  components: {
    AppFilterThread,
    CardThread,
    CardSr,
  },
};
</script>
<style>
.hoverClick:hover {
  text-decoration: underline;
  color: steelblue;
  cursor: pointer;
}
.card {
  height: 100%;
}

.fixed {
  position: fixed;
  bottom: 0;
}
</style>
