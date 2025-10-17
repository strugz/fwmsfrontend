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
                  <span class="red darken-1 pa-1 caption white--text ">Service Report</span>
                  <span class="ml-1 font-weight-medium">SR: #{{ CurThreadDetails.TRDMTT }} </span>
                </template>
                <v-spacer></v-spacer>
                <timer-sr v-if="ownTRD && CurThreadDetails.TRDSTS !== 'WORK COMPLETE'"></timer-sr>
                <image-report
                  v-if="CurThreadDetails.TRDSTS === 'WORK COMPLETE' && CurUserDetails.CNTMST.CNTDPT.substring(0, 3) == 'TSG'"></image-report>
                <v-dialog>
                  <template v-slot:activator="{ on }">
                    <v-btn small flat icon color="indigo" class="ma-0" dark v-on="on" @click="loadCurSrDetails">
                      <v-icon>print</v-icon>
                    </v-btn>
                  </template>
                  <v-card>
                    <report-viewer></report-viewer>
                  </v-card>
                </v-dialog>
                <service-report v-if="CurThreadDetails.TRDSTS === 'WORK COMPLETE'"></service-report>
              </v-toolbar>
            </v-card>
          </v-flex>
          <v-flex>
            <v-expansion-panel expand>
              <v-expansion-panel-content lazy>
                <template v-slot:header>
                  <v-container pa-1>
                    <v-layout class="caption font-weight-regular text-uppercase" align-center justify-start row
                      fill-height wrap>
                      <v-flex xs12>
                        <v-layout align-start row fill-height wrap>
                          <v-flex>
                            <template v-if="CurThreadDetails.TRDMUI">
                              <app-label header="Posted by:" :detail="CurThreadDetails.TRDMUI.CNTMCN"></app-label>
                            </template>
                          </v-flex>
                          <v-flex>
                            <template v-if="CurSRDetails.header">
                              <v-flex v-if="CurThreadDetails.TRDSEC != 'InHouse'">
                                <app-label header="Service Time:"
                                  :detail="getRelativeTime(CurSRDetails.footer.srfDateTimeIn)"></app-label>
                              </v-flex>
                            </template>
                          </v-flex>
                          <v-flex v-if="CurSRDetails.workWith.length > 0">
                            <app-label header="workWith" :detail="CurSRDetails.workWith[0].userInitials !== '1'
                              ? concatinate(CurSRDetails.workWith, 'userInitials')
                              : ''
                              "></app-label>
                          </v-flex>
                        </v-layout>
                      </v-flex>
                      <v-flex xs12 pb-0 v-if="CurSRDetails.meterReading">
                        <v-layout align-center justify-start row fill-height wrap>
                          <v-flex xs6>
                            <app-label header="Instrument Model:" :detail="CurThreadDetails.TRDMDE"></app-label>
                          </v-flex>
                          <v-flex xs6>
                            <app-label header="Service Type:"
                              :detail="concatinate(CurSRDetails.serviceTypes, 'srTypeDescription')"></app-label>
                          </v-flex>
                          <v-flex></v-flex>
                        </v-layout>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </template>
                <v-container grid-list-lg>
                  <v-layout class="caption font-weight-regular text-uppercase" align-center justify-start row
                    fill-height wrap>
                    <v-flex xs12 pt-0>
                      <v-layout align-start justify-start row fill-height wrap>
                        <v-flex xs12>
                          <span class="font-weight-bold black--text text-xs-left pa-0">
                            Purpose of Visit
                          </span>
                          <v-layout pt-0 wrap>
                            <v-flex xs6 py-1 class="font-weight-medium black--text text-xs-left">Description</v-flex>
                            <v-flex xs6 py-1 class="font-weight-medium black--text text-xs-left">Remarks</v-flex>
                          </v-layout>
                          <v-divider></v-divider>
                          <v-layout wrap pl-3 pt-0 v-for="(itm, key) in CurSRDetails.purposeOfVisits" :key="key">
                            <v-flex xs6 py-1>
                              {{ itm.pvDescription }}
                            </v-flex>
                            <v-flex xs6 py-1>
                              {{ itm.pvRemarks }}
                            </v-flex>
                          </v-layout>
                          <v-divider></v-divider>
                        </v-flex>
                      </v-layout>
                    </v-flex>
                    <v-flex xs12>
                      <v-layout align-start justify-start row fill-height wrap>
                        <v-flex xs12>
                          <span class="font-weight-bold black--text text-xs-left pa-0">
                            Action Taken
                          </span>
                          <v-layout pt-0 wrap>
                            <v-flex xs6 py-1 class="font-weight-medium black--text text-xs-left">Description</v-flex>
                            <v-flex xs6 py-1 class="font-weight-medium black--text text-xs-left">Remarks</v-flex>
                          </v-layout>
                          <v-divider></v-divider>
                          <v-layout pl-3 pt-0 wrap v-for="(itm, key) in CurSRDetails.actionTakens" :key="key">
                            <v-flex xs6 py-1>
                              {{ itm.atDescription }}
                            </v-flex>
                            <v-flex xs6 py-1>
                              {{ itm.atRemarks }}
                            </v-flex>
                          </v-layout>
                          <v-divider></v-divider>
                        </v-flex>
                      </v-layout>
                    </v-flex>
                    <v-flex xs12>
                      <v-layout align-start justify-start row fill-height wrap>
                        <v-flex xs12>
                          <span class="font-weight-bold black--text text-xs-left pa-0">
                            Parts Used
                          </span>
                          <v-layout wrap pt-0>
                            <v-flex py-1 class="font-weight-medium black--text text-xs-left">Quantity</v-flex>
                            <v-flex py-1 class="font-weight-medium black--text text-xs-left">Part Number</v-flex>
                            <v-flex py-1 class="font-weight-medium black--text text-xs-left">Description</v-flex>
                            <v-flex py-1 class="font-weight-medium black--text text-xs-left">Serial Number</v-flex>
                          </v-layout>
                          <v-divider></v-divider>
                          <v-layout pl-3 pt-0 wrap v-for="(itm, key) in CurSRDetails.partsUsed" :key="key">
                            <v-flex py-1>
                              {{ itm.puqty }}
                            </v-flex>
                            <v-flex py-1>
                              {{ itm.puPartNo }}
                            </v-flex>
                            <v-flex py-1>
                              {{ itm.puDescription }}
                            </v-flex>
                            <v-flex py-1>
                              {{ itm.puSerialNo }}
                            </v-flex>
                          </v-layout>
                          <v-divider></v-divider>
                        </v-flex>
                      </v-layout>
                    </v-flex>
                    <v-flex xs12>
                      <v-flex x12 style="font-size: .85em;" class="pb-0 pl-0">
                        Parts Used Signature
                      </v-flex>
                      <v-card width="300" class="ml-2" v-if="CurSRDetails.partsUsedSignature">
                        <v-img :src="`${CurSRDetails.partsUsedSignature.puCustomerAcceptance}`" />
                      </v-card>
                    </v-flex>
                    <v-flex xs12>
                      <app-label style="white-space: pre-line" header="Significant Remarks:"
                        :detail="CurSRDetails.remarks ? CurSRDetails.remarks.srRemarks : ''"></app-label>
                    </v-flex>
                    <v-flex xs12>
                      <span class="font-weight-bold black--text text-xs-left pa-0">
                        Charges
                      </span>
                      <v-layout wrap>
                        <v-flex v-for="(chrg, key) in CurSRDetails.charges" :key="key">
                          <app-label :header="chrg.srChargesDescription" :detail="chrg.srChargesRemarks"></app-label>
                        </v-flex>
                      </v-layout>
                    </v-flex>
                    <v-flex xs12>
                      <span class="font-weight-bold black--text text-xs-left pa-0">
                        Customer Acceptance:
                      </span>
                      <v-layout wrap>
                        <v-flex>
                          <app-label header="Laboratory Representative"
                            :detail="CurSRDetails.footer ? CurSRDetails.footer.customerUserID : ''"></app-label>
                        </v-flex>
                        <v-flex>
                          <app-label header="Date Time In"
                            :detail="CurSRDetails.footer ? CurSRDetails.footer.srfDateTimeIn : ''"></app-label>
                        </v-flex>
                        <v-flex>
                          <app-label header="Date Time Out"
                            :detail="CurSRDetails.footer ? CurSRDetails.footer.srfDateTimeOut : ''"></app-label>
                        </v-flex>
                      </v-layout>
                    </v-flex>
                    <v-flex xs12 v-if="CurSRDetails.footerSignature">
                      <v-flex x12 style="font-size: .85em;" class="pb-0 pl-0">
                        Acceptance Signature
                      </v-flex>
                      <v-card width="300" class="ml-2">
                        <v-img :src="`${CurSRDetails.footerSignature.srFooterAcceptance}`" />
                        </v-card>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapActions, mapState, mapMutations } from "vuex";
import moment from "moment";
import AppLabel from "@/components/appLabel";
import ComFooter from "@/components/comFooter";
import ComCard from "@/components/comCard";
import timerSr from "@/components/timerSR";
import serviceReport from "../SRFormView";
import imageReport from "../SRImageViewer.vue";
import reportViewer from "@/reports/engineer/field/fieldReports.vue";

export default {
  components: {
    AppLabel,
    ComFooter,
    ComCard,
    timerSr,
    serviceReport,
    imageReport,
    reportViewer
  },
  data() {
    return {
      spnr: true,
      render: false,
      detail: {},
      dialog: false,
    };
  },
  computed: {
    ...mapState([
      "CurSRDetails",
      "CurThreadDetails",
      "CurUserDetails",
      "CurClientDetails",
      "SRTimerDialog"
    ]),
    trd_comments() {
      let cmnt = this.CurThreadDetails.TRDCMM;
      console.log(this.CurThreadDetails);
      if (cmnt !== undefined) {
        return cmnt;
      } else {
        return cmnt;
      }
    },
    ownTRD() {
      return (
        this.CurUserDetails.USRDTL.USRDCI == this.CurThreadDetails.TRDMUI.CNTMID
      );
    },
  },
  watch: {
    SRTimerDialog: function() {
      if (this.SRTimerDialog == false) {
        location.reload();
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        this.spnr = false;
      }, 200);
    });
    this.getThreadDetailsById(this.$route.params.TRDMTI).then(
      (res) => {
        this.getSRDetailsById(res.TRDMTT).then(() => {
          this.render = true;
          console.log(this.render);
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
      "updateThreadByID", "getCNTMSTUserID"
    ]),
    ...mapMutations(["upClient", "upTrdDetails"]),
    loadCurSrDetails() {
      this.getSRDetailsById(this.CurThreadDetails.TRDMTT)
        .then(res => {
          console.log(res);
        })
        .catch(err => {
          alert(err);
        });
    },
    concatinate(data, key) {
      var tmp = "";
      data.forEach((elm) => {
        tmp += ` / ${elm[key]}`;
      });
      return tmp.slice(3, tmp.length);
    },
    openDialogStatus() {
      this.dialog = true;
    },
    changeStatus() {
      const data = {
        id: this.CurThreadDetails.TRDMTI,
        val: { TRDMST: !this.CurThreadDetails.TRDMST },
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
        return moment(date).format("MMMM Do YYYY, hh:mm a");
      }
    },
    comFromUser(i) {
      return (
        this.CurThreadDetails.TRDCMM[i].TRDCUI.CNTMID ==
        this.CurUserDetails.CNTMST.CNTMID
      );
    },
  },
};
</script>

<style>
html {
  overflow-y: auto;
}
</style>
