<template>
  <div class="text-xs-center">
    <v-dialog v-model="dialog" lazy width="500" persistent>
      <template v-slot:activator="{ on }">
        <span v-on="on"> Change Password </span>
      </template>
      <v-card>
        <v-toolbar dense dark flat color="primary darken-1 text--white">
          <v-toolbar-title class="title">Change Password</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card-text>
          <v-layout row wrap px-3>
            <v-flex xs12>
              <v-text-field
                :append-icon="show1 ? 'visibility' : 'visibility_off'"
                :rules="[rules.required, rules.valid]"
                :type="show1 ? 'text' : 'password'"
                v-model="curpass"
                name="input-10-2"
                label="Current Password"
                hint="your current password"
                class="input-group--focused"
                @click:append="show1 = !show1"
              ></v-text-field>
            </v-flex>
            <v-flex xs12>
              <v-text-field
                :append-icon="show2 ? 'visibility' : 'visibility_off'"
                :rules="[rules.required, rules.min]"
                :type="show2 ? 'text' : 'password'"
                v-model="newpass"
                name="input-10-2"
                label="New Password"
                hint="At least 6 characters"
                class="input-group--focused"
                @click:append="show2 = !show2"
              ></v-text-field>
            </v-flex>
            <v-flex xs12>
              <v-text-field
                :append-icon="show3 ? 'visibility' : 'visibility_off'"
                :rules="[rules.required, rules.match]"
                :type="show3 ? 'text' : 'password'"
                v-model="newpass1"
                name="input-10-2"
                label="Retype New Password"
                hint="At least 6 characters"
                class="input-group--focused"
                @click:append="show3 = !show3"
              ></v-text-field>
            </v-flex>
            <v-flex xs12>
              <v-layout row>
                <v-flex class="row" xs6 sm6 md3>
                  <v-text-field v-model="OTPvalue" hide-details label="OTP" outline></v-text-field>
                </v-flex>
                <v-flex class="row" xs6 sm6 md3>
                  <v-btn :loading="otploading" :disabled="otploading" color="success" @click="sendOTP()">
                    {{ OTPcaption }}
                    <template v-slot:loader>
                      <span>{{ otpcntr }}</span>
                    </template>
                  </v-btn>
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat color="indigo" @click="save()">Save</v-btn>
          <v-btn flat color="orange" @click="close_click()">Cancel</v-btn>
        </v-card-actions>
      </v-card>
      <v-snackbar v-model="snackbar" right :color="color" :timeout="6000">
        {{ message }}
        <v-btn dark flat @click="snackbar = false">
          Close
        </v-btn>
      </v-snackbar>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import bcrypt from 'bcryptjs'
export default {
  data() {
    return {
      OTPhash: '',
      OTPvalue: '',
      OTPcaption: 'Send OTP',
      otpcntr: 60,
      otploading: false,
      message: '',
      color: '',
      snackbar: false,
      dialog: false,
      show1: false,
      show2: false,
      show3: false,
      curpass_valid: true,
      curpass: '',
      newpass: '',
      newpass1: '',
      rules: {
        required: v => !!v || 'Required.',
        min: v => v.length >= 6 || 'Min 6 characters',
        match: () => this.matchpass || 'new password not match',
        valid: () => this.curpass_valid || 'Incorrect Password',
      },
    }
  },
  methods: {
    ...mapActions(['postNewPassword', 'getOTP']),
    sendOTP() {
      this.getOTP({ usr_initial: this.CurUserDetails.CNTMST.CNTMNN })
        .then(hash => {
          this.OTPhash = hash.data
        })
        .catch(error => {
          console.log(error)
        })
      this.otploading = true
      // setTimeout(() => (this.otploading = false), 3000)
      var cnt = setInterval(() => {
        if (this.otpcntr == 1) {
          this.OTPcaption = 'Resend OTP'
          this.otploading = false
          this.otpcntr = 10
          clearInterval(cnt)
        }
        this.otpcntr--
      }, 1000)
    },
    save() {
      bcrypt
        .compare(this.OTPvalue, this.OTPhash)
        .then(success => {
          if (success) {
            this.postNewPassword({
              curpass: this.curpass,
              username: this.CurUserDetails.USRMUI,
              newpassword: this.newpass,
            })
              .then(result => {
                if (result.data.status == 'success') {
                  this.message = result.data.message
                  this.color = 'success'
                  this.snackbar = true
                  setTimeout(() => {
                    this.curpass = ''
                    this.newpass = ''
                    this.newpass1 = ''
                    this.OTPhash = ''
                    this.OTPvalue = ''
                    this.close_click()
                  }, 2000)
                } else if (result.data.status == 'failed') {
                  this.curpass_valid = false
                  this.color = 'error'
                  this.message = result.data.message
                  this.snackbar = true
                }
              })
              .catch(error => {
                console.log(error)
              })
          } else {
            // this.curpass_valid = false
            this.color = 'error'
            this.message = 'Incorrect OTP'
            this.snackbar = true
          }
        })
        .catch(error => {
          console.log(error)
        })
      // CNTMST.CNTMNN
    },
    close_click() {
      this.dialog = false
      this.show1 = false
      this.show2 = false
      this.show3 = false
      this.curpass = ''
      this.newpass = ''
      this.newpass1 = ''
    },
  },
  props: {
    value: {
      default: false,
      type: Boolean,
    },
  },
  computed: {
    ...mapState(['CurUserDetails']),
    matchpass() {
      if (this.newpass === this.newpass1) {
        return true
      } else {
        return false
      }
    },
  },
}
</script>

<style></style>
