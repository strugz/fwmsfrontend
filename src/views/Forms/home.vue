<template>
  <v-content app>
    <v-toolbar color="teal darken-3" app dark dense>
      <v-toolbar-side-icon @click="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>{{ this.CurClientDetails.ACCMNM }}</v-toolbar-title>
      <v-spacer></v-spacer>

      <!-- <v-avatar> -->
      <notif-menu></notif-menu>

      <v-menu transition="slide-y-transition" bottom offset-y>
        <template v-slot:activator="{ on }">
          <v-btn small flat icon color="teal lighten-5" v-on="on">
            <v-icon>account_circle</v-icon>
          </v-btn>
        </template>
        <v-list dense>
          <v-list-tile @click="">
            <span class="v-list__tile__title body-1">{{ 'Change Password' }}</span>
          </v-list-tile>
          <v-list-tile @click="logout()">
            <span class="v-list__tile__title body-1">{{ 'Logout' }}</span>
          </v-list-tile>
        </v-list>
      </v-menu>

      <!-- </v-avatar> -->
    </v-toolbar>

    <app-drawer v-model="drawer"></app-drawer>
    <!-- <v-layout> -->
    <notif-alert></notif-alert>
    <router-view :key="$route.fullPath" />
    <!-- </v-layout> -->
  </v-content>
</template>

<script>
import appDrawer from '@/components/drawer'
import notifMenu from '@/components/notifMenu'
import notifAlert from '@/components/notifAlert'
import { mapState } from 'vuex'
import Cookies from 'js-cookie'
export default {
  components: {
    appDrawer,
    notifMenu,
    notifAlert,
  },
  computed: {
    ...mapState(['CurClientDetails']),
  },
  data() {
    return {
      dialog: false,
      clientlist: [],
      drawer: true,
      search_text: '',
    }
  },
  created() {},
  methods: {
    logout() {
      Cookies.remove('token', { path: '/crm' })
      Cookies.remove('user_details', { path: '/crm' })
      this.$router.go({ name: 'Login' })
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
