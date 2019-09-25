<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog" persistent max-width="900">
      <!-- <template v-slot:activator="{ on }">
        <v-btn color="primary" dark v-on="on">Register Client</v-btn>
      </template> -->
      <template v-slot:activator="{ on }">
        <v-btn class="teal darken-2" dark fab fixed bottom right v-on="on">
          <v-icon>add</v-icon>
        </v-btn>
      </template>
      <v-card>
        <v-toolbar dense flat dark color="teal lighen-1">
          <v-toolbar-title>Client Information</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn dark flat @click="closeDialog()">Cancel</v-btn>
            <v-btn dark flat @click="sendData()">Save</v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-form>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12 pa-0>
                  <v-subheader class="pl-2 subheader-height">Hospital Name</v-subheader>
                </v-flex>
                <v-flex xs12 md9>
                  <v-text-field
                    v-model="ACCMNM"
                    label="Client Name"
                    box
                    color="grey"
                    :error-messages="ACCMNM_error"
                    @input="$v.ACCMNM.$touch()"
                    @blur="$v.ACCMNM.$touch()"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 md3>
                  <v-text-field
                    v-model="ACCMSC"
                    label="Short Code"
                    box
                    color="grey"
                    :error-messages="ACCMSC_error"
                    @input="$v.ACCMSC.$touch()"
                    @blur="$v.ACCMSC.$touch()"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 pa-0>
                  <v-subheader class="pl-2 subheader-height">Address</v-subheader>
                </v-flex>
                <v-flex xs12 md4 pt-0>
                  <v-autocomplete
                    :disabled="false"
                    :items="prov_items"
                    item-text="name"
                    item-value="name"
                    v-model="prov_name"
                    label="Province"
                    box
                  >
                  </v-autocomplete>
                </v-flex>
                <v-flex xs12 md4 pt-0>
                  <v-autocomplete
                    :disabled="!muni_name === ''"
                    :items="muni_items"
                    item-text="name"
                    item-value="name"
                    v-model="muni_name"
                    label="Municipality"
                    box
                  >
                  </v-autocomplete>
                </v-flex>
                <v-flex xs12 md4 pt-0>
                  <v-autocomplete
                    :disabled="!brgy_name === ''"
                    :items="brgy_items"
                    item-text="name"
                    item-value="name"
                    v-model="brgy_name"
                    label="Barangay"
                    :hint="'code: ' + brgy_code"
                    persistent-hint
                    box
                  >
                  </v-autocomplete>
                </v-flex>
                <v-flex xs12>
                  <v-text-field
                    label="Detailed Address"
                    v-model="detailed_add"
                    box
                    color="grey"
                    hint="Unit number, house number, building, street name"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 pa-0>
                  <v-subheader class="pl-2 subheader-height">Contacts</v-subheader>
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field v-model="ACCMPH" label="Phone Number" hide-details box color="grey"></v-text-field>
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field
                    v-model="ACCMEM"
                    label="E-Mail"
                    box
                    color="grey"
                    :error-messages="ACCMEM_error"
                    @input="$v.ACCMEM.$touch()"
                    @blur="$v.ACCMEM.$touch()"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field v-model="ACCMWS" label="Website" hide-details box color="grey"></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import { mapActions } from 'vuex'
import { validationMixin } from 'vuelidate'
import { required, email } from 'vuelidate/lib/validators'

export default {
  mixins: [validationMixin],
  validations: {
    ACCMSC: { required },
    ACCMNM: { required },
    ACCMEM: { email },
  },
  data() {
    return {
      dialog: false,
      detailed_add: '',
      prov_name: '',
      muni_name: '',
      brgy_name: '',
      prov_items: [],
      muni_items: [],
      brgy_items: [],
      ACCMSC: '',
      ACCMNM: '',
      ACCMPH: '',
      ACCMWS: '',
      ACCMEM: '',
    }
  },
  methods: {
    ...mapActions(['getProv', 'getMuni', 'getBRGY', 'postNewAccount']),
    closeDialog() {
      this.brgy_name = ''
      this.muni_name = ''
      this.prov_name = ''
      this.ACCMSC = ''
      this.ACCMNM = ''
      this.ACCMPH = ''
      this.ACCMWS = ''
      this.ACCMEM = ''
      this.dialog = false
      this.$v.$reset()
    },
    sendData() {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        const data = {
          ACCMSC: this.ACCMSC,
          ACCMNM: this.ACCMNM,
          ACCMBC: this.brgy_code,
          ACCMAD: this.ACCMAD,
          ACCMPH: this.ACCMPH,
          ACCMWS: this.ACCMWS,
          ACCMEM: this.ACCMEM,
        }
        this.postNewAccount(data).then(
          res => {
            console.log(res)
            this.dialog = false
          },
          error => {
            console.error(error)
          }
        )
      }
    },
  },
  computed: {
    ACCMNM_error() {
      const errors = []
      if (!this.$v.ACCMNM.$dirty) return errors
      !this.$v.ACCMNM.required && errors.push('This field is required.')
      return errors
    },
    ACCMSC_error() {
      const errors = []
      if (!this.$v.ACCMSC.$dirty) return errors
      !this.$v.ACCMSC.required && errors.push('This field is required.')
      return errors
    },
    ACCMEM_error() {
      const errors = []
      if (!this.$v.ACCMEM.$dirty) return errors
      !this.$v.ACCMEM.email && errors.push('Must be valid e-mail')
      return errors
    },
    ACCMAD() {
      return `${this.detailed_add !== '' ? this.detailed_add + ',' : ''} ${this.brgy_name}, ${this.muni_name}, ${
        this.prov_name
      }`
    },
    prov_code() {
      return this.prov_name === ''
        ? ''
        : this.prov_items.filter(prov => {
            return prov.name == this.prov_name
          })[0].code
    },
    muni_code() {
      return this.muni_name === ''
        ? ''
        : this.muni_items.filter(muni => {
            return muni.name == this.muni_name
          })[0].code
    },
    brgy_code() {
      return this.brgy_name === ''
        ? ''
        : this.brgy_items.filter(brgy => {
            return brgy.name == this.brgy_name
          })[0].code
    },
  },
  watch: {
    prov_name() {
      this.getMuni(this.prov_code).then(
        res => {
          this.brgy_name = ''
          this.brgy_items = []
          this.muni_items = res
        },
        error => {
          console.error(error)
        }
      )
    },
    muni_name() {
      this.getBRGY(this.muni_code).then(
        res => {
          this.brgy_items = res
        },
        error => {
          console.error(error)
        }
      )
    },
  },
  created() {
    this.getProv().then(
      res => {
        this.prov_items = res
      },
      error => {
        console.error(error)
      }
    )
  },
}
</script>

<style scoped>
.subheader-height {
  height: 32px !important;
}
</style>
