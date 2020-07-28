<template>
  <v-content app>
    <v-toolbar flat prominent color="teal darken-3" app dark dense :extension-height="32">
      <v-toolbar-side-icon @click="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>{{ CurClientDetails.ACCMNM }}</v-toolbar-title>
      <v-spacer></v-spacer>

      <notif-menu></notif-menu>
      <v-menu v-if="isAdmin" transition="slide-y-transition" bottom offset-y>
        <template v-slot:activator="{ on }">
          <v-btn small flat icon color="teal lighten-5" v-on="on">
            <v-icon>settings</v-icon>
          </v-btn>
        </template>
        <v-list dense>
          <v-list-tile @click="">
            <span class="v-list__tile__title body-1">{{ 'Client Manager' }}</span>
          </v-list-tile>
          <v-list-tile @click="">
            <acc-manager></acc-manager>
          </v-list-tile>
        </v-list>
      </v-menu>

      <v-menu transition="slide-y-transition" bottom offset-y>
        <template v-slot:activator="{ on }">
          <v-btn small flat icon color="teal lighten-5" v-on="on">
            <v-icon>account_circle</v-icon>
          </v-btn>
        </template>
        <v-list dense>
          <v-list-tile @click="">
            <change-pass></change-pass>
          </v-list-tile>
          <v-list-tile @click="logout()">
            <span class="v-list__tile__title body-1">{{ 'Logout' }}</span>
          </v-list-tile>
        </v-list>
      </v-menu>
      <template v-slot:extension>
        <bread-crumb></bread-crumb>
      </template>
    </v-toolbar>
    <app-drawer v-model="drawer"></app-drawer>
    <router-view :key="$route.fullPath" />
  </v-content>
</template>

<script>
import appDrawer from '@/components/drawer'
import notifMenu from '@/components/notifMenu'
// import notifAlert from '@/components/notifAlert'
import changePass from '@/components/changePass'
import accManager from '@/components/accmanager'
import breadCrumb from '@/components/breadCrumbs'
import { mapState, mapActions } from 'vuex'
import Cookies from 'js-cookie'
export default {
  components: {
    appDrawer,
    notifMenu,
    // notifAlert,
    breadCrumb,
    changePass,
    accManager,
  },
  computed: {
    ...mapState(['CurClientDetails', 'CurUserDetails']),
    isAdmin() {
      if (this.CurUserDetails.USRDTL.hasOwnProperty('USRDRT')) {
        if (this.CurUserDetails.USRDTL.USRDRT.hasOwnProperty('ADMIN')) {
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    },
  },
  data() {
    return {
      dialog: false,
      clientlist: [],
      drawer: true,
      search_text: '',
    }
  },
  created() {
    this.getCurCheckInAcc(this.CurUserDetails.USRDTL.USRDCI)
  },
  methods: {
    ...mapActions(['getCurCheckInAcc']),
    logout() {
      Cookies.remove('token', { path: '/' })
      Cookies.remove('user_details', { path: '/' })
      this.$router.replace({ name: 'Login' })
    },
  },
}
</script>

<style>
.TagDsgn {
  white-space: pre-line;
  width: 200px;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.v-toolbar__extension {
  background-color: #e0f2f1;
}
.nborder {
  border-color: #1b1b1b;
}
/* unvisited link */
a:link {
  color: rgb(27, 27, 27);
}

/* visited link */
a:visited {
  color: rgb(58, 58, 58);
}

/* mouse over link */
a:hover {
  color: rgb(0, 35, 75);
}
</style>
