<template>
  <v-main>
    <div class="login-page">
      <section class="login-brand">
        <v-avatar size="76" class="login-brand__logo">
          <img :src="require(`@/assets/ThreadLogo.svg`)" alt="FWMS logo" />
        </v-avatar>
        <div>
          <p>FWMS</p>
          <h1>Field Workforce Management</h1>
          <span>Sign in to manage visits, service reports, calendars, and customer threads.</span>
        </div>
      </section>

      <v-card class="login-card" elevation="0" @keydown.enter="login()">
        <div class="login-card__header">
          <p>Welcome back</p>
          <h2>Login User</h2>
        </div>

        <v-card-text class="login-card__body">
          <v-text-field
            v-model="username"
            label="Username"
            hint="Please input your log-in name"
            prepend-inner-icon="account_circle"
            outlined
            dense
          ></v-text-field>
          <v-text-field
            v-model="password"
            type="password"
            label="Password"
            hint="Please input your password"
            prepend-inner-icon="lock"
            outlined
            dense
          ></v-text-field>
        </v-card-text>

        <v-card-actions class="login-card__actions">
          <v-btn block dark depressed color="teal darken-2" @click="login()">Take Me There</v-btn>
        </v-card-actions>

        <v-alert :value="alert" type="error" icon="warning" transition="scale-transition" class="mx-5 mb-5">
          {{ message }}
        </v-alert>
      </v-card>

      <v-dialog v-model="dialog" max-width="520" persistent>
        <v-card class="privacy-card" elevation="0">
          <div class="privacy-card__header">
            <v-icon color="white">verified_user</v-icon>
            <div>
              <p>Privacy Policy</p>
              <h2>Data Accuracy Attestation</h2>
            </div>
          </div>

          <v-card-text class="privacy-card__body">
            By accessing and using the FWMS, you acknowledge that the information and data contained within are
            confidential and proprietary to the company. You agree to maintain the confidentiality of this information
            and not to disclose or share it with any third parties without prior written consent from the company.
          </v-card-text>

          <v-card-actions class="privacy-card__actions">
            <v-spacer></v-spacer>
            <v-btn color="teal darken-2" dark depressed @click="userAcceptance">Agree</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-main>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import Cookies from 'js-cookie'
export default {
  data() {
    return {
      username: '',
      password: '',
      alert: false,
      message: '',
      setDate: new Date('02/14/2023').toDateString(),
      setDateNow: new Date().toDateString(),
      eventValidation: '0',
      dialog: false,
    }
  },
  computed: {
    ...mapState(['CurUserDetails']),
  },
  methods: {
    ...mapActions(['userLogin', 'getCurUserDetails', 'userGetPrivacy', 'userPrivacyAcceptanceInsert']),
    stringifyCookieValue(value) {
      return typeof value === 'string' ? value : JSON.stringify(value)
    },
    userAcceptance() {
      this.userPrivacyAcceptanceInsert(this.CurUserDetails.USRDTL.USRDCI).then(res => {
        this.getCurUserDetails()
        this.$router.replace({ name: 'home' })
      })
    },
    login() {
      if (this.username.trim() == '' || this.password.trim() == '') {
        this.message = 'Field is required!'
        this.alert = true
        return false
      }
      this.userLogin({ username: this.username, password: this.password })
        .then(res => {
          if (res.status == 200 && res.data.message == 'Auth successful') {
            Cookies.set('token', res.data.token, { expires: 1, path: '/' })
            Cookies.set('user_details', this.stringifyCookieValue(res.data.details), {
              expires: 1,
              path: '/',
            })
            this.getCurUserDetails()
            this.userGetPrivacy(res.data.details.USRDTL.USRDCI)
              .then(res => {
                console.log(res)
                if (res.status == 200) {
                  this.$router.replace({ name: 'home' })
                } else {
                  this.dialog = true
                }
              })
              .catch(error => {
                this.dialog = true
              })
          }
        })
        .catch(error => {
          this.alert = true
          if (typeof error.response.status == 'undefined') {
            this.message = 'login error'
          } else if (error.response.status == 401) {
            this.message = 'User not found'
          }
        })
    },
  },
}
</script>

<style scoped>
.login-page {
  align-items: center;
  display: grid;
  gap: 28px;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 420px);
  min-height: 100vh;
  padding: 32px;
}

.login-brand {
  align-items: center;
  display: flex;
  gap: 18px;
  justify-self: end;
  max-width: 560px;
}

.login-brand__logo {
  background: white;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.12);
  flex: 0 0 auto;
}

.login-brand p,
.login-card__header p,
.privacy-card__header p {
  color: #0f766e;
  font-size: 0.76rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  margin: 0 0 8px;
  text-transform: uppercase;
}

.login-brand h1 {
  color: #0f172a;
  font-size: 2.2rem;
  line-height: 1.05;
  margin: 0 0 10px;
}

.login-brand span {
  color: #64748b;
  line-height: 1.6;
}

.login-card,
.privacy-card {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 12px;
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.12) !important;
  overflow: hidden;
}

.login-card__header {
  background: linear-gradient(135deg, #ecfdf5, #f8fafc);
  border-bottom: 1px solid rgba(15, 76, 76, 0.1);
  padding: 24px 26px 18px;
}

.login-card__header h2 {
  color: #0f172a;
  font-size: 1.45rem;
  margin: 0;
}

.login-card__body {
  display: grid;
  gap: 4px;
  padding: 24px 26px 8px;
}

.login-card__actions {
  padding: 4px 26px 24px;
}

.privacy-card__header {
  align-items: center;
  background: linear-gradient(135deg, #0f766e, #1976d2);
  color: white;
  display: flex;
  gap: 12px;
  padding: 22px 24px;
}

.privacy-card__header p {
  color: rgba(255, 255, 255, 0.82);
}

.privacy-card__header h2 {
  font-size: 1.2rem;
  margin: 0;
}

.privacy-card__body {
  color: #334155;
  line-height: 1.7;
  padding: 22px 24px 8px;
}

.privacy-card__actions {
  padding: 12px 24px 20px;
}

@media (max-width: 860px) {
  .login-page {
    grid-template-columns: 1fr;
    padding: 24px 16px;
  }

  .login-brand {
    justify-self: stretch;
  }
}
</style>
