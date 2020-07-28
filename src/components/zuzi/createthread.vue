<template>
  <div class="text-xs-center">
    <v-dialog v-model="dialog" max-width="950" persistent>
      <template v-if="isEdit" v-slot:activator="{ on }">
        <v-btn class="mt-5 mr-2" flat icon color="teal darken-2" small absolute top rightv-on="on">
          <v-icon>edit</v-icon>
        </v-btn>
      </template>
      <template v-else v-slot:activator="{ on }">
        <v-btn small round dark color="teal" v-on="on">
          Create Thread
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
                      v-model="tmp_TRDMMC"
                      :items="instruments"
                      label="Instrument Name"
                      clearable
                      box
                      item-value="SERIAL_NO"
                      dont-fill-mask-blanks
                    >
                      <template v-slot:selection="data">
                        {{ `${data.item.ITEM_CODE} - (SN: ${data.item.SERIAL_NO})` }}
                      </template>
                      <template v-slot:item="data">
                        <v-list-tile-content class="py-1">
                          <v-list-tile-title class="body-2" v-html="data.item.ITEM_CODE"></v-list-tile-title>
                          <v-list-tile-sub-title
                            class="caption font-weight-light"
                            v-html="'SN:' + data.item.SERIAL_NO"
                          ></v-list-tile-sub-title>
                        </v-list-tile-content>
                      </template>
                    </v-autocomplete>
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
      tmp_TRDMMC: '',
      SECTION: [
        'Coagulation',
        'Chemistry',
        'Hematology',
        'Immunology',
        'Microscopy',
        'Microbiology',
        'Pulmonary',
        'Reception',
        'Others',
      ],
      tClass: ['ASAP', 'Scheduled', 'Unscheduled', 'N/A'],
      tType: [
        'Activation Code',
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
      instruments: [],
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
    tmp_TRDMMC(val) {
      if (val == undefined) {
        this.data.TRDMMC = ''
      } else {
        const item = this.instruments.filter(itm => {
          return itm.SERIAL_NO == val
        })
        this.data.TRDMMC = `${item[0].ITEM_CODE} - (SN: ${item[0].SERIAL_NO})`
      }
    },
    TRDSEC(val) {
      if (val == '') return false
      this.transType_status = false
      if (this.CurClientDetails.ACCMSC == 'MDMPI') this.TransType()
    },
    dialog(val) {
      if (val) {
        this.getInstrumentByAccId(this.$route.params.ACCMID).then(
          res => {
            this.instruments = res.data.tbinstruments
          },
          error => {
            console.error(error)
          }
        )
      }
    },
  },
  methods: {
    ...mapActions(['postThread', 'getTransType', 'getAcc', 'getInstrumentByAccId']),
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
