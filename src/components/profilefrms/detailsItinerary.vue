<template>
  <v-container
    grid-list-md
    pa-2
  >
    <v-layout
      v-if="render == true"
      align-start
      justify-center
      row
      wrap
    >
      <v-flex
        md8
        xs12
      >
        <v-layout
          wrap
          column
        >
          <v-flex>
            <v-card>
              <v-toolbar
                flat
                dense
                light
                color="white"
              >
                <template class="caption">
                  <span class="indigo darken-1 pa-1 caption white--text mr-1">
                    {{ CurThreadDetails.TRDSEC }}
                  </span>
                  <span class="red darken-1 pa-1 caption white--text ">MedRep Visit</span>
                  <span class="ml-1 font-weight-medium">SR: #{{ CurThreadDetails.TRDMTT }} </span>
                </template>
                <v-spacer></v-spacer>
                <meditinerary v-if="ownTRD & CurThreadDetails.TRDSTS != 'WORK COMPLETE'"></meditinerary>
              </v-toolbar>
            </v-card>
            <v-card-text class="grey lighten-3">
              <template v-if="CurSRDetails.header">
                <v-flex v-if="CurThreadDetails.TRDSEC == 'Itinerary'">
                  <app-label
                    header="Date & Time Visited:"
                    :detail="CurThreadDetails.TRDMCD"
                  ></app-label>
                </v-flex>
              </template>
              <template>
                <v-flex>
                  <app-label
                    header="Visited By:"
                    :detail="this.CurUserDetails.CNTMST.CNTMCN"
                  ></app-label>
                </v-flex>
              </template>
              <template>
                <v-flex>
                  <app-label
                    header="Customer:"
                    :detail="CurCSTMST.CSTNME"
                  ></app-label>
                </v-flex>
              </template>
              <template>
                <v-flex>
                  <app-label
                    header="Specialty/ Position :"
                    :detail="CurCSTMST.CSTPOS"
                  ></app-label>
                </v-flex>
              </template>
              <template>
                <v-flex>
                  <app-label
                    header="User / Non-User:"
                    :detail="CurCSTMST.CSTSTS"
                  ></app-label>
                </v-flex>
              </template>
              <template>
                <v-flex>
                  <app-label
                    header="Classification"
                    :detail="CurCSTMST.CSTCLS"
                  ></app-label>
                </v-flex>
              </template>
              <template>
                <v-flex>
                  <app-label
                    header="Target Product"
                    :detail="CurCSTMST.CSTTPR"
                  ></app-label>
                </v-flex>
              </template>
              <template>
                <v-flex>
                  <span>Med Rep Location</span>
                  <v-btn flat class="primary"
                    :href="'https://www.google.com/maps?q=' + lat + ',' + long"
                    target="_blank"
                  >Open Google Maps</v-btn>
                </v-flex>
              </template>
              <template>
                <v-flex>
                  <app-label
                    style="white-space: pre-line"
                    header="Summary of the Itinerary:"
                    :detail="CurSRDetails.remarks ? CurSRDetails.remarks.srRemarks : ''"
                  ></app-label>
                </v-flex>
              </template>
              <v-flex
                xs12
                v-if="CurSRDetails.footerSignature"
              >
                <v-flex x12>
                  Acceptance Signature
                </v-flex>
                <v-card
                  width="300"
                  class="ml-2"
                >
                  <v-img :src="`${CurSRDetails.footerSignature.srFooterAcceptance}`" />
                </v-card>
              </v-flex>
            </v-card-text>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
  </v-container>
</template>
  <script>
/* eslint-disable */
import { mapActions, mapState, mapMutations } from "vuex";
import AppLabel from "@/components/appLabel";
import AppForm from "@/components/TTPForm";
import moment from "moment";
import meditinerary from "../MedRepItinerary";
import serviceReport from "../SRFormView";

export default {
  components: {
    AppLabel,
    AppForm,
    meditinerary,
    serviceReport,
  },
  data() {
    return {
      render: false,
      spnr: true,
      CSTMST: [],
      lat: "",
      long: "",
    };
  },
  computed: {
    ...mapState([
      "CurThreadDetails",
      "CurClientDetails",
      "CurUserDetails",
      "CurSRDetails",
      "CurCSTMST",
    ]),
    ownTRD() {
      return (
        this.CurUserDetails.USRDTL.USRDCI == this.CurThreadDetails.TRDMUI.CNTMID
      );
    },
  },
  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        this.spnr = false;
      }, 200);
    });
    this.getThreadDetailsById(this.$route.params.TRDMTI).then(
      (res) => {
        console.log(res);
        this.lat = res.TRDLOC.split(" ")[0];
        this.long = res.TRDLOC.split(" ")[1];
        this.getCSTMSTPerCust(res.TRDMDE).then((res) => {
          this.upCurCSTMST(res.data);
        });

        this.getSRDetailsById(res.TRDMTT).then(() => {
          this.render = true;
        });
        if (this.CurClientDetails.ACCMID !== this.CurThreadDetails.TRDMAC) {
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
  methods: {
    ...mapActions([
      "getSRDetailsById",
      "getThreadDetailsById",
      "getAcc",
      "getCSTMSTPerCust",
    ]),
    ...mapMutations(["upClient", "upTrdDetails", "upCurCSTMST"]),
    getRelativeTime(date) {
      // console.log(this.CurSRDetails.header.callDateTime);
      let time = moment().from(date, true);
      console.log(date);
      if (time.endsWith("days")) {
        return moment(date).format("MMMM Do YYYY, hh:mm a");
      } else {
        return time + " ago";
      }
    },
    concatinate(data, key) {
      var tmp = "";
      data.forEach((elm) => {
        tmp += ` / ${elm[key]}`;
      });
      return tmp.slice(3, tmp.length);
    },
  },
};
</script>
  