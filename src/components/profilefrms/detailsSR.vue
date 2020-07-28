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
              </v-toolbar>
              <!-- <v-card-title ">
                <v-layout column wrap>
                  <v-flex class="subheader font-weight-medium">
                    <timer-sr class="offset-xs12"></timer-sr>
                  </v-flex>
                </v-layout>
              </v-card-title> -->
            </v-card>
          </v-flex>
          <v-flex>
            <v-expansion-panel expand>
              <v-expansion-panel-content lazy>
                <template v-slot:header>
                  <v-container pa-1>
                    <v-layout
                      class="caption font-weight-regular text-uppercase"
                      align-center
                      justify-start
                      row
                      fill-height
                      wrap
                    >
                      <v-flex xs12>
                        <v-layout align-start row fill-height wrap>
                          <v-flex>
                            <template v-if="CurThreadDetails.TRDMUI">
                              <app-label header="Posted by:" :detail="CurThreadDetails.TRDMUI.CNTMCN"></app-label>
                            </template>
                          </v-flex>
                          <v-flex>
                            <template v-if="CurSRDetails.header">
                              <app-label
                                header="Call Date/Time:"
                                :detail="getRelativeTime(CurSRDetails.header.callDateTime)"
                              ></app-label>
                            </template>
                          </v-flex>
                          <v-flex v-if="CurSRDetails.workWith.length > 0">
                            <app-label
                              header="workWith"
                              :detail="
                                CurSRDetails.workWith[0].userInitials !== '1'
                                  ? concatinate(CurSRDetails.workWith, 'userInitials')
                                  : ''
                              "
                            ></app-label>
                          </v-flex>
                        </v-layout>
                      </v-flex>
                      <v-flex xs12 pb-0 v-if="CurSRDetails.meterReading">
                        <v-layout align-center justify-start row fill-height wrap>
                          <v-flex xs6>
                            <span class="font-weight-bold black--text text-xs-left pa-0">
                              Meter Reading
                            </span>
                            <v-layout style="margin-top: -10px; margin-left: 2px;" justify-start wrap>
                              <v-flex md3 xs6>
                                <app-label header="Arrival:" :detail="CurSRDetails.meterReading.arrival"></app-label>
                              </v-flex>
                              <v-flex md3 xs6>
                                <app-label
                                  header="Departure:"
                                  :detail="CurSRDetails.meterReading.departure"
                                ></app-label>
                              </v-flex>
                            </v-layout>
                          </v-flex>
                          <v-flex xs6>
                            <app-label
                              header="Service Type:"
                              :detail="concatinate(CurSRDetails.serviceTypes, 'srTypeDescription')"
                            ></app-label>
                          </v-flex>
                          <v-flex></v-flex>
                        </v-layout>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </template>
                <v-container grid-list-lg>
                  <v-layout
                    class="caption font-weight-regular text-uppercase"
                    align-center
                    justify-start
                    row
                    fill-height
                    wrap
                  >
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
                        <v-img :src="`${CurSRDetails.partsUsedSignature.puCustomerAcceptance}`" contain />
                      </v-card>
                    </v-flex>
                    <v-flex xs12>
                      <app-label
                        style="white-space: pre-line"
                        header="Significant Remarks:"
                        :detail="CurSRDetails.remarks ? CurSRDetails.remarks.srRemarks : ''"
                      ></app-label>
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
                          <app-label
                            header="Laboratory Representative"
                            :detail="CurSRDetails.footer ? CurSRDetails.footer.customerUserID : ''"
                          ></app-label>
                        </v-flex>
                        <v-flex>
                          <app-label
                            header="Date Time In"
                            :detail="CurSRDetails.footer ? CurSRDetails.footer.srfDateTimeIn : ''"
                          ></app-label>
                        </v-flex>
                        <v-flex>
                          <app-label
                            header="Date Time Out"
                            :detail="CurSRDetails.footer ? CurSRDetails.footer.srfDateTimeOut : ''"
                          ></app-label>
                        </v-flex>
                      </v-layout>
                    </v-flex>
                    <v-flex xs12 v-if="CurSRDetails.footerSignature">
                      <v-flex x12 style="font-size: .85em;" class="pb-0 pl-0">
                        Acceptance Signature
                      </v-flex>
                      <v-card width="300" class="ml-2">
                        <v-img :src="`${CurSRDetails.footerSignature.srFooterAcceptance}`" aspect-ratio="4.3" contain />
                      </v-card>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-flex>
        </v-layout>
      </v-flex>
      <v-flex md4 xs12>
        <v-card class="hide-overflow" style="position: fixed;">
          <v-toolbar
            flat
            dense
            absolute
            color="teal lighten-3"
            dark
            scroll-off-screen
            scroll-target="#scrolling-techniques"
          >
            <v-toolbar-title>Comments</v-toolbar-title>
          </v-toolbar>
          <div id="scrolling-techniques" class="scroll-y" style="height: 540px;">
            <v-card style="min-height: 490px; min-width: 330px; margin-top: 50px">
              <v-card-text v-if="spnr">
                <v-layout align-center justify-center>
                  <v-progress-circular :size="80" :width="7" color="primary" indeterminate></v-progress-circular>
                </v-layout>
              </v-card-text>
              <v-card-text v-else>
                <com-card
                  v-for="(comment, index) in trd_comments"
                  :curUser="comFromUser(index)"
                  :value="comment"
                  :key="index"
                ></com-card>
                <v-layout v-if="!CurThreadDetails.TRDMST" align-center justify-center row fill-height>
                  <v-flex xs12>
                    <v-divider></v-divider>
                    <v-card-text class="title font-weight-medium text-xs-center">
                      ( Comments are disabled )
                    </v-card-text>
                  </v-flex>
                </v-layout>
              </v-card-text>
            </v-card>
          </div>
          <com-footer :app="false" />
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapActions, mapState, mapMutations } from 'vuex'
import moment from 'moment'
import AppLabel from '@/components/appLabel'
import ComFooter from '@/components/comFooter'
import ComCard from '@/components/comCard'
import timerSr from '@/components/timerSR'

export default {
  components: {
    AppLabel,
    ComFooter,
    ComCard,
    timerSr,
  },
  data() {
    return {
      spnr: true,
      render: false,
      detail: {},
      dialog: false,
    }
  },
  computed: {
    ...mapState(['CurSRDetails', 'CurThreadDetails', 'CurUserDetails', 'CurClientDetails']),
    trd_comments() {
      let cmnt = this.CurThreadDetails.TRDCMM
      if (cmnt !== undefined) {
        return cmnt
      } else {
        return cmnt
      }
    },
    ownTRD() {
      return this.CurUserDetails.USRDTL.USRDCI == this.CurThreadDetails.TRDMUI.CNTMID
    },
  },
  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        this.spnr = false
      }, 200)
    })
    this.getThreadDetailsById(this.$route.params.TRDMTI).then(
      res => {
        this.getSRDetailsById(res.TRDMTT).then(() => {
          this.render = true
        })
        if (this.CurClientDetails.ACCMID !== this.CurThreadDetails.TRDMAC) {
          this.getAcc(res.TRDMAC).then(
            acc => {
              this.upClient(acc.data)
            },
            error => {
              console.error(error)
            }
          )
        }
      },
      error => {
        console.error(error)
      }
    )
  },
  methods: {
    ...mapActions(['getSRDetailsById', 'getThreadDetailsById', 'getAcc', 'updateThreadByID']),
    ...mapMutations(['upClient', 'upTrdDetails']),
    concatinate(data, key) {
      var tmp = ''
      data.forEach(elm => {
        tmp += ` / ${elm[key]}`
      })
      return tmp.slice(3, tmp.length)
    },
    openDialogStatus() {
      this.dialog = true
    },
    changeStatus() {
      const data = {
        id: this.CurThreadDetails.TRDMTI,
        val: { TRDMST: !this.CurThreadDetails.TRDMST },
      }

      this.updateThreadByID(data).then(
        () => {
          this.CurThreadDetails.TRDMST = !this.CurThreadDetails.TRDMST
          this.dialog = false
        },
        error => {
          console.error(error)
        }
      )
    },
    getRelativeTime(date) {
      let time = moment().from(date, true)
      if (time.endsWith('days')) {
        return moment(date).format('MMMM Do YYYY, hh:mm a')
      } else {
        return time + ' ago'
      }
    },
    comFromUser(i) {
      return this.CurThreadDetails.TRDCMM[i].TRDCUI.CNTMID == this.CurUserDetails.CNTMST.CNTMID
    },
  },
  created() {},
}
</script>

<style>
html {
  overflow-y: auto;
}
</style>
