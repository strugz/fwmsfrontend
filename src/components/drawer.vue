<template>
  <v-navigation-drawer
    mini-variant
    mini-variant-width="280"
    class="teal darken-2"
    @input="emit($event)"
    :value="value"
    app
    dark
  >
    <v-toolbar color="teal darken-3" flat dark dense>
      <v-toolbar-title class="text--white"> <v-icon>view_quilt</v-icon> Customers </v-toolbar-title>
    </v-toolbar>
    <v-flex>
      <v-layout row wrap>
        <v-flex>
          <v-text-field
            v-model="custSrch"
            class="pt-2
            px-3"
            hide-details
            placeholder="search"
            append-icon="search"
            clearable
            solo
            light
          ></v-text-field>
        </v-flex>
        <v-flex v-if="CurCheckInAcc.serviceLocLogAction == 'CheckIn'" class="mt-2">
          <v-list three-line subheader dark>
            <v-list-tile class="teal darken-4" avatar @click="clientClick(CurCheckInAcc.customerID.ACCMID)">
              <v-list-tile-avatar tile>
                <v-icon large>fa-clinic-medical</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content style="opacity: 100! important" class="pl-4">
                <v-list-tile-sub-title class="white--text caption">Check-In at: </v-list-tile-sub-title>
                <v-list-tile-title class="white--text">{{ CurCheckInAcc.customerID.ACCMSC }}</v-list-tile-title>
                <v-list-tile-sub-title class="white--text caption">{{
                  CurCheckInAcc.serviceLocLogDateTime
                }}</v-list-tile-sub-title>
              </v-list-tile-content>

              <v-list-tile-action>
                <checkInOut type="icon"></checkInOut>
                <!-- <v-btn icon ripple>
                  <v-icon color="white lighten-1">timer_off</v-icon>
                </v-btn> -->
              </v-list-tile-action>
            </v-list-tile>
          </v-list>
        </v-flex>
      </v-layout>
    </v-flex>
    <v-layout d-flex align-space-around column class="items">
      <v-list>
        <v-list-tile
          v-for="(client, key) in filtItems"
          :key="key"
          avatar
          @click="clientClick(client.ACCMID)"
          @mouseover="hover(key, true)"
          @mouseout="hover(key, false)"
          :class="curClient == client.ACCMID ? 'teal darken-3' : ''"
        >
          <v-badge color="red" overlap>
            <!-- <template v-slot:badge>
              <span>!</span>
            </template> -->
            <v-list-tile-avatar tile>
              <v-img
                v-if="defaultImg(key)"
                :src="require(`@/assets/${client.ACCMSC}.png`)"
                style="border-radius: 8px;"
              ></v-img>
              <!-- <v-img v-else src="@/assets/Untitled.png" style="border-radius: 8px;"></v-img> -->
              <v-icon v-else large>fa-clinic-medical</v-icon>
            </v-list-tile-avatar>
          </v-badge>
          <span class="pl-4 white--text">{{ client.ACCMSC }}</span>
        </v-list-tile>
      </v-list>
    </v-layout>

    <!-- <v-card v-if="isAdmin" color="transparent" flat class="bottom-bar">
      <v-card-text class="pa-1">
        <v-menu transition="slide-y-transition" top offset-y>
          <template v-slot:activator="{ on }">
            <v-btn small flat icon color="teal lighten-5" v-on="on">
              <v-icon>settings</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-tile>
              <reg-client></reg-client>
            </v-list-tile>
            <v-list-tile @click="regUser()">
              <v-list-tile-title>{{ 'Manage Contact/User' }}</v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>
      </v-card-text>
    </v-card> -->
  </v-navigation-drawer>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import checkInOut from '@/components/checkInOut.vue'
// import RegClient from '@/components/regClient.vue'
export default {
  data() {
    return {
      avatar_hover: [],
      clients: [],
      default: 'default',
      custSrch: '',
    }
  },
  created() {
    this.getAcc().then(
      res => {
        this.clients = res.data
        for (const i in res.data) {
          this.avatar_hover[i] = false
        }
      },
      error => {
        console.error(error)
      }
    )
  },
  computed: {
    ...mapState(['CurUserDetails', 'CurClientDetails', 'CurCheckInAcc']),
    filtItems() {
      let srch = this.custSrch == null ? '' : this.custSrch
      var items = this.clients.filter(client => {
        return (
          client.ACCMSC.toLowerCase().includes(srch.toLowerCase()) ||
          client.ACCMNM.toLowerCase().includes(srch.toLowerCase())
        )
      })

      return items
    },
    active() {
      return 'border-left: solid #e0f2f1 3px;'
    },
    isAdmin() {
      return typeof this.CurUserDetails.USRDTL.USRDRT.ADMIN !== 'undefined' ? true : false
    },
    curClient() {
      return this.CurClientDetails.ACCMID
    },
  },
  components: {
    // RegClient,
    checkInOut,
  },
  methods: {
    ...mapActions(['getAcc']),
    ...mapMutations(['upClient']),
    defaultImg(key) {
      const imgName = this.filtItems[key].ACCMSC
      try {
        require(`@/assets/${imgName}.png`)
        return true
      } catch (error) {
        return false
      }
    },
    clientClick(id) {
      this.getAcc(id).then(
        res => {
          this.upClient(res.data)
        },
        error => {
          console.error(error)
        }
      )
      this.$router.push({ path: `/customer/${id}` })
    },
    hover(key, val) {
      this.$set(this.avatar_hover, key, val)
    },
    emit(val) {
      this.$emit('input', val)
    },
  },
  props: {
    value: {
      type: Boolean,
      default: true,
    },
  },
}
</script>

<style scoped>
.bottom-bar {
  position: absolute;
  width: 100%;
  bottom: 0;
  left: 0;
}
.border_right {
  border-right: solid #004d40 1px;
}
.v-list__tile__content {
  opacity: 100;
}
.items {
  max-height: 89%;
  overflow: auto;
}

/* width */
::-webkit-scrollbar {
  width: 5px;
}

/* Track */
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px grey;
  border-radius: 10px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: rgb(0, 77, 64);
  border-radius: 10px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: rgb(0, 42, 36);
}
</style>
