<template>
  <v-content>
    <v-container fluid fill-height>
      <v-layout align-center justify-center>
        <v-flex xs12 sm6 md4 xl3>
          <div class="pb-5">
            <v-layout align-center justify-center>
              <div>
                <v-avatar size="100">
                  <img :src="require(`@/assets/ThreadLogo.svg`)" alt="avatar" />
                </v-avatar>
              </div>
              <p class="headline font-weight-black pl-2 pt-2">THREAD</p>
            </v-layout>
          </div>
          <v-card @keydown.enter="login()" color="transparent" class="elevation-1">
            <v-toolbar class="elevation-0 white--text BG_toolbar">
              <v-toolbar-title>Login User</v-toolbar-title>
              <v-spacer></v-spacer>
            </v-toolbar>
            <v-card-text class="pa-3">
              <v-text-field
                label="Username"
                hint="Please input your log-in name"
                append-icon="account_circle"
                v-model="username"
              ></v-text-field>
              <v-text-field
                type="password"
                label="Password"
                hint="Please input your password"
                append-icon="lock"
                v-model="password"
              ></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-layout align-center justify-center column>
                <v-btn dark @click="login()">Take Me There</v-btn>
                <p class="grey--text">Need help ?</p>
              </v-layout>
            </v-card-actions>
          </v-card>
          <v-alert :value="alert" type="error" icon="warning" transition="scale-transition">
            {{ message }}
          </v-alert>
        </v-flex>
      </v-layout>
    </v-container>
  </v-content>
</template>
<script>
import { mapActions } from 'vuex'
import Cookies from 'js-cookie'
export default {
  data() {
    return {
      username: '',
      password: '',
      alert: false,
      message: '',
    }
  },
  methods: {
    ...mapActions(['userLogin', 'getCurUserDetails']),
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
            Cookies.set('user_details', res.data.details, { expires: 1, path: '/' })
            this.getCurUserDetails()
            this.$router.replace({ name: 'home' })
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

<style>
.BG_toolbar {
  background: linear-gradient(0.25turn, #024b29, #0ed350, #045f13);
}
.scroll {
  overflow-y: auto;
  height: 100vh;
}
.pHead {
  height: 20vh;
}
.pbody {
  height: 80vh;
}
.pfoot {
  height: 10vh;
}
.ne {
  width: auto !important;
}
</style>
