<template>
  <v-container grid-list-md pa-2>
    <v-layout v-if="render == true" align-start justify-center row wrap>
      <v-flex md8 xs12>
        <v-layout wrap column>
          <v-flex>
            <v-card>
              <v-toolbar flat dense light color="white">
                <template class="caption">
                  <span class="indigo darken-1 pa-1 caption white--text mr-1">
                    {{ CurThreadDetails.TRDSEC }}
                  </span>
                  <span class="red darken-1 pa-1 caption white--text ">Collection Visit</span>
                  <span class="ml-1 font-weight-medium">SR: #{{ CurThreadDetails.TRDMTT }} </span>
                </template>
                <v-spacer></v-spacer>
                <app-form v-if="CurThreadDetails.TRDSTS != 'WORK COMPLETE'"></app-form>
              </v-toolbar>
            </v-card>
            <v-card-text class="grey lighten-3">
              <template v-if="CurSRDetails.header">
                <v-flex>
                  <app-label header="Date and Time of Visit:" :detail="CurThreadDetails.TRDMCD"></app-label>
                </v-flex>
              </template>
              <template>
                <v-flex>
                  <app-label header="Purpose of Visit:" :detail="toString(CurSRDetails.purposeOfVisits)"></app-label>
                </v-flex>
              </template>
              <template>
                <v-flex>
                  <app-label header="Bank:"
                    :detail="collectorDetails.bank == '' ? '' : collectorDetails.bank"></app-label>
                </v-flex>
              </template>
              <template>
                <v-flex>
                  <app-label header="Check No:" :detail="collectorDetails.checkno == '' ? '' : collectorDetails.checkno"></app-label>
                </v-flex>
              </template>
              <template>
                <v-flex>
                  <app-label header="Check Date:" :detail="collectorDetails.checkdate.substring(0, 10) == '' ? '' : collectorDetails.checkdate.substring(0, 10)"></app-label>
                </v-flex>
              </template>
              <template>
                <v-flex>
                  <app-label header="Amount Collected:"
                    :detail="collectorDetails.amountcollected == '' ? '' : collectorDetails.amountcollected"></app-label>
                </v-flex>
              </template>
              <template>
                <v-flex>
                  <app-label header="Sales Invoice Reference for Payment:"
                    :detail="collectorDetails.salesinvoicereference == '' ? '' : collectorDetails.salesinvoicereference"></app-label>
                </v-flex>
              </template>
              <template>
                <v-flex>
                  <app-label header="Summary of Visit:"
                    :detail="CurSRDetails.remarks == null ? '' : CurSRDetails.remarks.srRemarks"></app-label>
                </v-flex>
              </template>
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
import AppForm from "@/components/CollectorForm";
import moment from "moment";

export default {
  components: {
    AppLabel,
    AppForm,
  },
  data() {
    return {
      render: false,
      spnr: true,
    };
  },
  computed: {
    ...mapState([
      "CurThreadDetails",
      "CurClientDetails",
      "CurUserDetails",
      "CurSRDetails",
      "collectorDetails"
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
        this.getCollectorDetails(res.TRDMTT).then(res2 => {
          this.upcollectorDetails(res2.data);
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
    ...mapActions(["getSRDetailsById", "getThreadDetailsById", "getAcc", "getCollectorDetails"]),
    ...mapMutations(["upClient", "upTrdDetails", "upcollectorDetails"]),
    getRelativeTime(date) {
      let time = moment().from(date, true);
      console.log(date);
      if (time.endsWith("days")) {
        return moment(date).format("MMMM Do YYYY, hh:mm a");
      } else {
        return time + " ago";
      }
    },
    toString(data) {
      let myString = "";
      data.forEach(x => {
        myString = myString == "" ? x.pvDescription : myString + "/" + x.pvDescription;
      });
      return myString;
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
  