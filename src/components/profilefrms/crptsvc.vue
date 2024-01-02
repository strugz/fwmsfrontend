<template>
  <v-container pa-3>
    <v-layout
      align-space-around
      justify-start
      column
      fill-height
    >
      <v-flex>
        <v-card>
          <v-card-text class="pt-0">
            <v-card-title class="subheading">
              <v-layout
                column
                wrap
              >
                <v-flex
                  class="subheader font-weight-medium"
                  xs9
                >
                  <span class="indigo darken-1 pa-1 caption white--text mr-1">{{ CurThreadDetails.TRDSEC }}</span>
                  <span class="red darken-1 pa-1 caption white--text">{{ CurThreadDetails.TRDMTY }}</span>
                  {{ CurThreadDetails.TRDMTT }}
                  <template v-if="CurThreadDetails.TRDUBY == CurUserDetails.USRDTL.USRDCI">
                    <v-btn
                      v-if="CurThreadDetails.TRDMST == false"
                      @click="openDialogStatus()"
                      class="absolute top right ma-0"
                      flat
                      icon
                      color="red lighten-1"
                    >
                      <v-icon small>fa-lock</v-icon>
                    </v-btn>
                    <v-btn
                      v-else
                      @click="openDialogStatus()"
                      class="absolute top right ma-0"
                      flat
                      icon
                      color="indigo lighten-1"
                    >
                      <v-icon small>fa-lock-open</v-icon>
                    </v-btn>
                  </template>
                </v-flex>
                <v-flex mt-2>
                  <v-layout
                    class="caption font-weight-regular text-uppercase"
                    align-start
                    justify-center
                    column
                    fill-height
                  >
                    <v-flex>
                      Posted by:
                      <template v-if="CurThreadDetails.TRDMUI">
                        <span class="font-weight-medium">
                          {{ CurThreadDetails.TRDMUI.CNTMCN }}
                        </span>
                      </template>
                    </v-flex>
                    <v-flex>
                      Date posted:
                      <span class="font-weight-medium">{{ getRelativeTime(CurThreadDetails.TRDMCD) }}</span>
                    </v-flex>
                    <v-flex>
                      Action date:
                      <span class="font-weight-medium">{{ getRelativeTime(CurThreadDetails.TRDADT) }}</span>
                    </v-flex>
                  </v-layout>
                </v-flex>
              </v-layout>
            </v-card-title>
            {{ CurThreadDetails.TRDMDE }}
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex pt-2>
        <v-card>
          <v-card-title class="subheading font-weight-medium pb-2">Comments</v-card-title>
          <v-divider></v-divider>
          <v-card-text v-if="spnr">
            <v-layout
              align-center
              justify-center
            >
              <v-progress-circular
                :size="80"
                :width="7"
                color="primary"
                indeterminate
              ></v-progress-circular>
            </v-layout>
          </v-card-text>
          <v-card-text v-else>
            <com-card
              v-for="(comment, index) in trd_comments"
              :curUser="comFromUser(index)"
              :value="comment"
              track-by="$index"
              :key="index"
            ></com-card>
            <v-layout
              v-if="!CurThreadDetails.TRDMST"
              align-center
              justify-center
              row
              fill-height
            >
              <v-flex xs12>
                <v-divider></v-divider>
                <v-card-text class="title font-weight-medium text-xs-center">
                  ( Comments are disabled )
                </v-card-text>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <com-footer></com-footer>

    <v-dialog
      v-model="dialog"
      persistent
      max-width="290"
    >
      <v-card>
        <template v-if="CurThreadDetails.TRDMST">
          <v-card-title class="headline">Close Thread?</v-card-title>
          <v-card-text>Closing the thread means the comments will be disabled.</v-card-text>
        </template>
        <template v-else>
          <v-card-title class="headline">Open Thread?</v-card-title>
          <v-card-text>Opening the thread means the comments will be enabled.</v-card-text>
        </template>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            flat
            @click="dialog = false"
          >Cancel</v-btn>
          <v-btn
            color="green darken-1"
            flat
            @click="changeStatus()"
          >{{
            CurThreadDetails.TRDMST == false ? 'Open' : 'Turn off'
          }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapActions, mapState, mapMutations } from "vuex";
import moment from "moment";
import ComFooter from "@/components/comFooter";
import ComCard from "@/components/comCard";

export default {
  data() {
    return {
      spnr: true,
      detail: {},
      dialog: false,
    };
  },
  components: {
    ComCard,
    ComFooter,
  },
  computed: {
    ...mapState(["CurThreadDetails", "CurUserDetails", "CurClientDetails"]),
    trd_comments() {
      const cmnt = this.CurThreadDetails.TRDCMM;
      // console.log(cmnt)
      if (cmnt !== undefined) {
        return cmnt.reverse();
      } else {
        return cmnt;
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        this.spnr = false;
      }, 200);
    });
  },
  methods: {
    ...mapActions(["getThreadDetailsById", "getAcc", "updateThreadByID"]),
    ...mapMutations(["upClient", "upTrdDetails"]),
    openDialogStatus() {
      this.dialog = true;
    },
    changeStatus() {
      const data = {
        id: this.CurThreadDetails.TRDMTI,
        val: {
          TRDMST: !this.CurThreadDetails.TRDMST,
          TRDUPD: moment().format(),
        },
      };

      this.updateThreadByID(data).then(
        () => {
          this.CurThreadDetails.TRDMST = !this.CurThreadDetails.TRDMST;
          this.dialog = false;
        },
        (error) => {
          console.error(error);
        }
      );
    },
    getRelativeTime(date) {
      let time = moment().from(date, true);
      if (time.endsWith("days")) {
        return moment(date).format("MMMM Do YYYY, hh:mm a");
      } else {
        return time + " ago";
      }
    },
    comFromUser(i) {
      return (
        this.CurThreadDetails.TRDCMM[i].TRDCUI.CNTMID ==
        this.CurUserDetails.CNTMST.CNTMID
      );
    },
  },
  created() {
    this.getThreadDetailsById(this.$route.params.TRDMTI).then(
      (res) => {
        if (this.CurClientDetails.ACCMID !== this.CurThreadDetails.TRDMAC) {
          // if (Object.keys(this.CurClientDetails).length == 0) {
          this.getAcc(res.TRDMAC).then(
            (acc) => {
              this.upClient(acc.data);
            },
            (error) => {
              console.error(error);
            }
          );
        }
      },
      (error) => {
        console.error(error);
      }
    );
  },
};
</script>

<style>
html {
  overflow-y: auto;
}
</style>
