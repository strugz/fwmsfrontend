<template>
  <div class="text-xs-center">
    <v-dialog v-model="dialog" max-width="950" persistent>
      <template v-if="isEdit" v-slot:activator="{ on }">
        <v-btn class="mt-5 mr-2" flat icon color="teal darken-2" small absolute top right v-on="on">
          <v-icon>edit</v-icon>
        </v-btn>
      </template>
      <template v-else v-slot:activator="{ on }">
        <v-btn class="teal darken-2" dark fab fixed bottom right v-on="on">
          <v-icon>add</v-icon>
        </v-btn>
      </template>

      <v-card>
        <v-card-title class="subheading font-weight-bold" primary-title>
          New Thread for {{ CurClientDetails.ACCMSC }}
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-container pa-1 grid-list-md text-xs-start>
            <v-layout column>
              <v-flex>
                <v-layout row wrap>
                  <v-flex xs12 lg6>
                    <v-text-field
                      v-model="TRDMTT"
                      label="Subject"
                      color="grey"
                      box
                      :error-messages="TRDMTT_error"
                      @input="$v.TRDMTT.$touch()"
                      @blur="$v.TRDMTT.$touch()"
                    ></v-text-field>
                  </v-flex>
                  <template v-if="CurClientDetails.ACCMSC == 'MDMPI'">
                    <v-flex xs12 lg3>
                      <v-select
                        v-model="TRDSEC"
                        label="Department / Section"
                        box
                        :items="sections.name"
                        :error-messages="TRDSEC_error"
                        @input="$v.TRDSEC.$touch()"
                        @blur="$v.TRDSEC.$touch()"
                      ></v-select>
                    </v-flex>
                    <v-flex xs12 lg3>
                      <v-select
                        :disabled="transType_status"
                        v-model="TRDMTY"
                        :items="transType"
                        label="Action Type"
                        box
                        color="grey"
                        :error-messages="TRDMTY_error"
                        @input="$v.TRDMTY.$touch()"
                        @blur="$v.TRDMTY.$touch()"
                      ></v-select>
                    </v-flex>
                  </template>
                  <template v-else>
                    <v-flex xs12 lg3>
                      <v-select
                        v-model="TRDSEC"
                        label="Department / Section"
                        box
                        :items="SECTION"
                        :error-messages="TRDSEC_error"
                        @input="$v.TRDSEC.$touch()"
                        @blur="$v.TRDSEC.$touch()"
                      ></v-select>
                    </v-flex>
                    <v-flex xs12 lg3>
                      <v-select
                        :disabled="transType_status"
                        v-model="TRDMTY"
                        :items="tType"
                        label="Action Type"
                        box
                        color="grey"
                        :error-messages="TRDMTY_error"
                        @input="$v.TRDMTY.$touch()"
                        @blur="$v.TRDMTY.$touch()"
                      ></v-select>
                    </v-flex>
                  </template>
                </v-layout>
              </v-flex>
              <v-flex>
                <v-layout row wrap>
                  <v-flex xs12 lg6>
                    <!-- <v-text-field v-model="data.TRDMMC" label="Instrument Name" outline></v-text-field> -->
                    <v-autocomplete
                      v-model="data.TRDMMC"
                      :items="instruments"
                      label="Instrument Name"
                      clearable
                      box
                    ></v-autocomplete>
                  </v-flex>
                  <v-flex xs12 lg3>
                    <v-select
                      v-if="CurClientDetails.ACCMSC == 'MDMPI'"
                      v-model="TRDMCL"
                      :items="transClass"
                      label="Class"
                      box
                      :error-messages="TRDMCL_error"
                      @input="$v.TRDMCL.$touch()"
                      @blur="$v.TRDMCL.$touch()"
                    ></v-select>
                    <v-select
                      v-else
                      v-model="TRDMCL"
                      :items="tClass"
                      label="Class"
                      box
                      :error-messages="TRDMCL_error"
                      @input="$v.TRDMCL.$touch()"
                      @blur="$v.TRDMCL.$touch()"
                    ></v-select>
                  </v-flex>
                  <v-flex xs12 lg3>
                    <v-menu
                      v-model="datepicker"
                      :close-on-content-click="false"
                      :nudge-right="40"
                      lazy
                      transition="scale-transition"
                      offset-y
                      full-width
                      min-width="290px"
                    >
                      <template v-slot:activator="{ on }">
                        <v-text-field
                          v-model="TRDADT"
                          label="Action Date"
                          append-icon="date_range"
                          readonly
                          box
                          clearable
                          v-on="on"
                          :error-messages="TRDADT_error"
                          @input="$v.TRDADT.$touch()"
                          @blur="$v.TRDADT.$touch()"
                        ></v-text-field>
                      </template>
                      <v-date-picker v-model="TRDADT" @input="datepicker = false"></v-date-picker>
                    </v-menu>
                  </v-flex>
                </v-layout>
              </v-flex>
              <v-flex>
                <v-layout column wrap>
                  <v-flex pb-0>
                    <v-switch
                      class="mt-3"
                      v-model="data.TRDMST"
                      :label="`Enable Comments? ${TRDMST}`"
                      hide-details
                    ></v-switch>
                  </v-flex>
                  <v-flex>
                    <v-textarea
                      box
                      label="Remarks"
                      auto-grow
                      v-model="TRDMDE"
                      :error-messages="TRDMDE_error"
                      @input="$v.TRDMDE.$touch()"
                      @blur="$v.TRDMDE.$touch()"
                    ></v-textarea>
                  </v-flex>
                </v-layout>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="warning" flat @click="closeDialog()">Cancel</v-btn>
          <v-btn color="primary" flat @click="savePost()">Post</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'
export default {
  mixins: [validationMixin],
  validations: {
    TRDMTY: { required },
    TRDMCL: { required },
    TRDMTT: { required },
    TRDMDE: { required },
    TRDSEC: { required },
    TRDADT: { required },
  },
  data() {
    return {
      SECTION: ['Hematology', 'Coagulation', 'Chemistry', 'Immunology', 'Microscopy', 'Microbiology', 'Reception'],
      tClass: ['ASAP', 'Scheduled', 'Unscheduled', 'N/A'],
      tType: [
        'Service Report',
        'Host PC Installation',
        'Server Installation',
        'TTP',
        'LIS Install/Config',
        'Troubleshooting',
        'Software Update',
        'Report Modification',
        'Range Modification',
        'Test Modification',
        'Backup DB LIS/HOST',
        'Printer Installation',
        'For Pull-Out',
        'Others',
        'Remote',
      ],
      TRDMTY: '', //Trans Type
      TRDMCL: '', //Class
      TRDMTT: '', //Title
      TRDMDE: '', //Details/Remarks
      TRDSEC: '', //Section
      TRDADT: '', //Action Date
      data: {
        TRDMAC: '', //client.ID
        TRDMMC: '', //Instrument Name
        TRDMUI: '', //UserID
        TRDMST: true,
        TRDCNT: 0,
      },
      datepicker: false,
      // instruments: ['ACL 200', 'HMX', 'DXH 800', 'STKS Analyzer'],
      instruments: [
        '24 Placer Clinical Centrifuge',
        'Access 2 (OUS) Refurbis',
        'Access 2 Analyzer',
        'Access 2 Immuno Assy Analyzer',
        'Access Analyzer',
        'ACL 100 ANALYZER P. ID 220/240 ENG',
        'ACL 200 ANALYZER',
        'ACL 6000 ANALYZER',
        'ACL 7000 5ML TRAY  220/240 V ENG.',
        'ACL 7000 Ref ITA',
        'ACL 9000 5ML TRAY 220/240 V ENG.',
        'ACL Couagulation Analyzer',
        'ACL ELite Pro Analyzer',
        'ACL Top 300 Cts',
        'ACL Top 350 CTS',
        'ACL Top 350 CTS System Analyzer',
        'ACL Top 500 Cts w/ accessories',
        'ACL7000 ANALYZER',
        'ACT 10 ANALYZER',
        'Act 5 Diff Hematology Analyzer',
        'Allegra X5 Centrifuge',
        'Aris 2X',
        'AU 480 w/ ISE Automated Chem Analyzer',
        'AU400 Chemistry Analyzer',
        'AU481-10E, Chemistry Analyzer AU480 with ISE',
        'AU680 Chemistry Analyzer',
        'Automate 800',
        'BC Robo-8000RFID',
        'Beckman LX20 Pro Chemistry Analyzer',
        'Beckman Unicel DXC800 Pro Analyzer',
        'CL Analyzer',
        'Coulter AcT diff Hematology Analyzer',
        'CX 3 Chemistry System Analyzer',
        'CX 9 Chemistry System Analyzer',
        'CX3 Chemistry System Analyzer',
        'CX4 CE REF COMPLETE  ACCESSORIES',
        'CX5 Delta Analyzer (Cat. No. 468242)',
        'CX5 REF COMPLETE ACCESSORIES',
        'Dirui CS 130B Close System Analyzer',
        'DR-7000D Semi-Automated Chemistry Analyzer',
        'DX i800 Analyzer Refurbished',
        'DxC 600 PRO (R) Analyzer',
        'DxC 800 PRO',
        'DxC 800 PRO, Reconditioned, Basic Assy, Pkg Analyz...',
        'DxC700 AU with ISE Instrument',
        'DxH 500 Analyzer',
        'DxH 520 Hematology Analyzer',
        'DXH 900 Hematology System with Floor Stand',
        'DxI 800 Access Immunoassy w/ Spot B Analyzer',
        'Dxi 800 Analyzer',
        'FC500 with UPS ®',
        'Frontline Focus Anaesthesia',
        'FUS-100 Urine Sediment Analyzer',
        'FUS-200 Urine Sediment Analyzer',
        'GEM 3000 PREMIER 220V',
        'Gem OPL System',
        'Gem PCL Plus',
        'Gem Premier 3500 Instrument 110/220',
        'Gem Premier 4000 Instrument',
        'Gem Premier 40000 Instrument',
        'Gem Premier 5000 Analyzer',
        'H-100 Urine Analyzer',
        'H-500 Urine Analyzer',
        'H-800 Urine Analyzer',
        'HMX Autoloader Hematology Analyzer',
        'IL ACL Elite PRO Coag Analyzer',
        'Ilab 300 Plus w/ ISE',
        'Ilab 300 Plus w/o ISE',
        'Ilab Aries w/o ISE',
        'Ilab Aries w/o ISE with Reagent and Sample BRC Ana...',
        'Ilyte NA/K/Ca/Ph 220V',
        'Ilyte NA/K/CL 220V',
        'Immage 800',
        'Immage 800 Analyzer, Reconditioned',
        'Immage 800 Final Assy Pkgd Analyzer',
        'Immage System 240V',
        'Immunofluorescence Immune Analyzer',
        'IRICELL 2000 (IQ200 Elite + 2.5 ICHEM Velocity)',
        'IRICELL 3000 PRO INTL',
        'IRICELL2000 Pro Analyzer',
        'LH SlideMaker',
        'LH SlideStainer',
        'LH500 SALESGROUP (198-242V)',
        'LH750 Analytical Station',
        'LH750 Hematology Analyzer',
        'LH780 (R) Analytical Station',
        'LH780 ANALYTICAL STATION',
        'LX 20 Pro Chemistry System',
        'Lx20 analyzer w/o Cap',
        'LX20 PRO',
        'LX20 PRO (Reconditioned)',
        'LX20 PRO (Refurbished)',
        'LXi-725 Analyzer',
        'Power Processor Basic Track',
        'Power Processor Track',
        'Prince SP400 POCT Analyzer',
        'Randox Molecular Evidence Investigator Package',
        'SG, HMX AL (EUROPE) 240 V',
        'SG, HMX AL (EUROPE) 240V',
        'SLGP, Immage 800 - English 240V',
        'SLGP, LxI 725 English Int Analyzer',
        'Spinchron DLX Centrifuge',
        'STKS Hematology analyzer',
        'Synchron CX3 Delta Analyzer',
        'Synchron CX4 Clinical System',
        'Synchron CX5 Analyzer',
        'Synchron CX5 Delta Analyzer',
        'Synchron CX7 Clinical System',
        'T 540 HEMATOLOGY ANALYZER',
        'TN, LH 500 (198-242/48-62) Analyzer',
        'TN, LH750 Slide Maker Analyzer',
        'TQ-Prep Workstation',
        'Unicel DXC 600i Analyzer',
        'UniCel DxC 800 PRO',
        'UniCel DxC 800 Pro Analyzer',
        'UniCel DxC 800 PRO, Pkg Analyzer',
        'UniCel DxC 860i Analyzer(UTCA+DXC800+DxI600)',
        'UniCel DXC600 Pro Analyzer',
        'Unicel DXH 800 Benchtop Analyzer',
        'Unicel DXH 800 Hematology Analyzer',
        'UniCel DxH 800 Hematology System Analyzer',
        'Unicel DXH SMS Analyzer',
        'UniCel DXI 600 Immuno Analyzer',
        'UniCel DXi 800 Immuno Analyzer',
        'Unicel DXi600 Analyzer (A45868)-Salesgroup',
        'VersaTrek 240 W/6 DR/Ctrl MOD, 220V',
        'Vision ESR Analyzer',
        'WA40 Plus Generic',
      ],
      dialog: false,
      transType_status: true,
      transClass: ['ASAP', 'Scheduled', 'Unscheduled', 'N/A'],
      transType: [],
    }
  },
  props: {
    isEdit: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState(['CurClientDetails', 'CurUserDetails']),
    sections() {
      let items = {
        id: [],
        name: [],
      }
      for (const key in this.CurClientDetails.ACCDTL) {
        items.id.push(this.CurClientDetails.ACCDTL[key].ACCDDI)
        items.name.push(this.CurClientDetails.ACCDTL[key].ACCDDN)
      }
      return items
    },
    TRDMUI() {
      // userID
      return this.CurUserDetails.CNTMST.CNTMID
    },
    TRDMAC() {
      // clientID
      return this.CurClientDetails.ACCMID
    },
    DeptID() {
      // transTypeID
      return this.sections.id[this.sections.name.indexOf(this.TRDSEC)]
    },
    TRDMST() {
      return this.data.TRDMST == false ? 'off' : 'on'
    },
    //error messages
    TRDMTY_error() {
      const errors = []
      if (!this.$v.TRDMTY.$dirty) return errors
      !this.$v.TRDMTY.required && errors.push('Action Type is required.')
      return errors
    },
    TRDMCL_error() {
      const errors = []
      if (!this.$v.TRDMCL.$dirty) return errors
      !this.$v.TRDMCL.required && errors.push('Class is required.')
      return errors
    },
    TRDMTT_error() {
      const errors = []
      if (!this.$v.TRDMTT.$dirty) return errors
      !this.$v.TRDMTT.required && errors.push('Subject is required.')
      return errors
    },
    TRDSEC_error() {
      const errors = []
      if (!this.$v.TRDSEC.$dirty) return errors
      !this.$v.TRDSEC.required && errors.push('Dept/Section is required.')
      return errors
    },
    TRDADT_error() {
      const errors = []
      if (!this.$v.TRDADT.$dirty) return errors
      !this.$v.TRDADT.required && errors.push('Action Date is required.')
      return errors
    },
    TRDMDE_error() {
      const errors = []
      if (!this.$v.TRDMDE.$dirty) return errors
      !this.$v.TRDMDE.required && errors.push('Details is required.')
      return errors
    },
  },
  watch: {
    TRDSEC(val) {
      if (val == '') return false
      this.transType_status = false
      if (this.CurClientDetails.ACCMSC == 'MDMPI') this.TransType()
    },
  },
  methods: {
    ...mapActions(['postThread', 'getTransType', 'getAcc']),
    ...mapMutations(['upClient']),
    savePost() {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.data.TRDMAC = this.TRDMAC
        this.data.TRDMUI = this.TRDMUI
        this.data.TRDMTY = this.TRDMTY
        this.data.TRDMCL = this.TRDMCL
        this.data.TRDMTT = this.TRDMTT
        this.data.TRDMDE = this.TRDMDE
        this.data.TRDSEC = this.TRDSEC
        this.data.TRDADT = this.TRDADT
        this.postThread(this.data).then(
          () => {
            this.closeDialog()
          },
          error => {
            console.error(error)
          }
        )
      }
    },
    TransType() {
      this.getTransType(this.DeptID).then(
        res => {
          let items = []
          for (const key in res.data.ACCTFD) {
            items.push(res.data.ACCTFD[key].ACCTNM)
          }
          this.transType = items
          this.transType_status = false
        },
        error => {
          console.error(error)
        }
      )
    },
    closeDialog() {
      this.dialog = false
      this.transType = []
      this.TRDMTY = ''
      this.TRDMCL = ''
      this.TRDMTT = ''
      this.TRDMDE = ''
      this.TRDSEC = ''
      for (const i in this.data) {
        if (i == 'TRDMST') this.data[i] = true
        else this.data[i] = ''
      }
      this.$v.$reset()
    },
  },
}
</script>
