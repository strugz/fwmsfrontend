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
                  <span class="red darken-1 pa-1 caption white--text ">TTP</span>
                  <span class="ml-1 font-weight-medium">SR: #{{ CurThreadDetails.TRDMTT }} </span>
                </template>
                <v-spacer></v-spacer>
                <app-form v-if="CurThreadDetails.TRDSTS != 'WORK COMPLETE'"></app-form>
                <!-- <timer-sr v-if="ownTRD && CurThreadDetails.TRDSTS !== 'WORK COMPLETE'"></timer-sr>
                <service-report v-if="CurThreadDetails.TRDSTS === 'WORK COMPLETE'"></service-report> -->
                <service-report v-if="CurThreadDetails.TRDSTS === 'WORK COMPLETE'"></service-report>
              </v-toolbar>
            </v-card>
            <v-card-text class="grey lighten-3">
              <template v-if="CurSRDetails.header">
                <v-flex v-if="CurThreadDetails.TRDSEC == 'TTP'">
                  <app-label
                    header="TTP Date and Time:"
                    :detail="getRelativeTime(CurThreadDetails.TRDMCD)"
                  ></app-label>
                </v-flex>
              </template>
              <template>
                <v-flex>
                  <app-label
                    header="Service Type:"
                    :detail="concatinate(CurSRDetails.serviceTypes, 'srTypeDescription')"
                  ></app-label>
                </v-flex>
              </template>
              <template>
                <v-flex>
                  <app-label
                    header="Instrument:"
                    :detail="CurSRDetails.header.instrumentModelID"
                  ></app-label>
                </v-flex>
              </template>
              <template>
                <v-flex>
                  <app-label
                    header="Concern:"
                    :detail="CurThreadDetails.TRDCRN"
                  ></app-label>
                </v-flex>
              </template>
              <template>
                <v-flex
                  v-for="(chrg, key) in CurSRDetails.charges"
                  :key="key"
                >
                  <app-label
                    :header="chrg.srChargesDescription"
                    :detail="chrg.srChargesRemarks"
                  ></app-label>
                </v-flex>
              </template>
              <template>
                <v-flex>
                  <app-label
                    style="white-space: pre-line"
                    header="Significant Remarks:"
                    :detail="CurSRDetails.remarks ? CurSRDetails.remarks.srRemarks : ''"
                  ></app-label>
                </v-flex>
              </template>
              <template>
                <v-flex>
                  <app-label
                    header="Laboratory Representative"
                    :detail="CurSRDetails.footer ? CurSRDetails.footer.customerUserID : ''"
                  ></app-label>
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
import AppForm from "@/components/TTPForm";
import moment from "moment";
import serviceReport from "../SRFormView";

export default {
  components: {
    AppLabel,
    AppForm,
    serviceReport
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
    ]),
    ownTRD() {
      return (
        this.CurUserDetails.USRDTL.USRDCI == this.CurThreadDetails.TRDMUI.CNTMID
      );
    },
  },
  mounted() {
    console.log(this.CurSRDetails);
    this.$nextTick(() => {
      setTimeout(() => {
        this.spnr = false;
      }, 200);
    });
    this.getThreadDetailsById(this.$route.params.TRDMTI).then(
      (res) => {
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
    console.log(this.CurThreadDetails.TRDMCD);
  },
  methods: {
    ...mapActions(["getSRDetailsById", "getThreadDetailsById", "getAcc"]),
    ...mapMutations(["upClient", "upTrdDetails"]),
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
