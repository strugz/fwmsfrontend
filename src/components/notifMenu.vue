<template>
  <v-menu
    transition="slide-y-transition"
    style="border-radius: 0 0 12px 12px;"
    max-width="450"
    bottom
    nudge-width
    offset-y
    nudge-left
    lazy
  >
    <template v-slot:activator="{ on }">
      <v-badge
        color="red"
        overlap
        right
        top
      >
        <template
          v-if="notif_length !== 0"
          v-slot:badge
          style="top: 1px, right: 1px"
        >
          <span class="caption">{{ notif_length }}</span>
        </template>
        <v-btn
          small
          flat
          icon
          color="teal lighten-5"
          v-on="on"
        >
          <v-icon>notifications</v-icon>
        </v-btn>
      </v-badge>
    </template>
    <v-card>
      <v-card-title class="pa-0">
        <v-layout
          fluid
          wrap
        >
          <v-flex
            xs12
            py-1
            mx-3
          >
            <v-layout row>
              <v-flex>Notifications</v-flex>
              <v-spacer></v-spacer>
              <v-flex class="layout align-center justify-space-around caption">
                <span>
                  <v-icon small>forum</v-icon>Thread
                </span>
                <span>
                  <v-icon small>assignment</v-icon>Service Report
                </span>
                <span>
                  <v-icon small>chat</v-icon>Comment
                </span>
              </v-flex>
            </v-layout>
          </v-flex>
          <v-flex xs12>
            <v-divider />
          </v-flex>
        </v-layout>
      </v-card-title>
      <v-card-text class="pa-0 menu-card">
        <v-list
          three-line
          dense
          class="py-0"
        >
          <template v-for="(notif, index) in Notifications">
            <v-list-tile
              :class="notifIsNotSeen[index] ? 'teal lighten-5' : ''"
              :key="notif.title"
              avatar
              @click="toThread(index)"
            >
              <v-list-tile-avatar>
                <v-img
                  v-if="defaultImg(notif.NTFAID.ACCMSC)"
                  :src="require(`@/assets/${notif.NTFAID.ACCMSC}.png`)"
                  style="border-radius: 8px;"
                ></v-img>
                <v-icon
                  v-else
                  large
                >fa-clinic-medical</v-icon>
              </v-list-tile-avatar>

              <v-list-tile-content v-if="notif.NTFTYP == 'thread'">
                <span
                  v-if="notif.NTFTRD.TRDMTY == 'Service Report'"
                  class="v-list__tile__title body-1"
                >
                  <span class="red darken-1 pa-1 caption white--text">{{ 'SR' }}</span>
                  <span class="font-weight-medium">{{ ` ${notif.NTFAID.ACCMSC}` }}</span>
                  {{ ` - SR: #${notif.NTFTRD.TRDMTT}` }}
                </span>
                <span
                  v-else
                  class="v-list__tile__title body-1"
                >
                  <span class="indigo darken-1 pa-1 caption white--text">{{ 'TRD' }}</span>
                  <span class="font-weight-medium">{{ ` ${notif.NTFAID.ACCMSC}` }}</span>
                  {{ ` - ${notif.NTFTRD.TRDMTT}` }}
                </span>
                <span class="v-list__tile__sub-title caption">
                  <span class="text--primary">
                    {{ `(${notif.NTFFRM.CNTMNN}) ${notif.NTFFRM.CNTMCN}` }}
                  </span>
                  - {{ notif.NTFTRD.TRDMDE }}
                </span>
                <span class="v-list__tile__sub-title align-start caption">
                  <v-icon
                    v-if="notif.NTFTRD.TRDMTY == 'Service Report'"
                    small
                  >assignment</v-icon>
                  <v-icon
                    v-else
                    small
                  >forum</v-icon>
                  {{ getRelativeTime(notif.created_at) }}
                </span>
              </v-list-tile-content>

              <v-list-tile-content v-else-if="notif.NTFTYP == 'comment'">
                <span
                  v-if="notif.NTFTRD.TRDMTY == 'Service Report'"
                  class="v-list__tile__title body-1"
                >
                  <span class="red darken-1 pa-1 caption white--text">{{ 'SR' }}</span>
                  <span class="font-weight-medium">{{ ` ${notif.NTFAID.ACCMSC}` }}</span>
                  {{ ` - ${notif.NTFTRD.TRDMTT}` }}
                </span>
                <span
                  v-else
                  class="v-list__tile__title body-1"
                >
                  <span class="indigo darken-1 pa-1 caption white--text">{{ 'TRD' }}</span>
                  <span class="font-weight-medium">{{ ` ${notif.NTFAID.ACCMSC}` }}</span>
                  {{ ` - SR: #${notif.NTFTRD.TRDMTT}` }}
                </span>
                <span class="v-list__tile__sub-title caption">
                  <span class="text--primary">
                    {{ `(${notif.NTFFRM.CNTMNN}) ${notif.NTFFRM.CNTMCN}` }}
                  </span>
                  - {{ notif.NTFCMM.TRDCCM }}
                </span>
                <span class="v-list__tile__sub-title align-start caption">
                  <v-icon small>chat</v-icon>
                  {{ getRelativeTime(notif.created_at) }}
                </span>
              </v-list-tile-content>
            </v-list-tile>

            <v-divider
              v-if="index !== Notifications.length - 1"
              :key="index"
            ></v-divider>
          </template>
        </v-list>
      </v-card-text>
      <v-card-actions class="pa-0">
        <v-layout
          fluid
          wrap
        >
          <v-flex xs12>
            <v-divider />
          </v-flex>
          <v-flex
            xs12
            py-1
            mx-3
          >
            <v-flex></v-flex>
          </v-flex>
        </v-layout>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script>
import moment from "moment";
import { mapState, mapActions, mapMutations } from "vuex";
export default {
  data() {
    return {};
  },
  computed: {
    ...mapState(["Notifications", "CurUserDetails"]),
    usr_id() {
      return this.CurUserDetails.CNTMST.CNTMID;
    },
    notifIsNotSeen() {
      let tmp = [];
      for (const i in this.Notifications) {
        if (this.Notifications[i].NTFSBY.includes(this.usr_id)) {
          tmp.push(false);
        } else {
          tmp.push(true);
        }
      }
      return tmp;
    },
    notif_length() {
      return this.notifIsNotSeen.filter((notif) => {
        return notif === true;
      }).length;
    },
  },
  methods: {
    ...mapActions(["updateNotification"]),
    ...mapMutations(["seenNotification"]),
    defaultImg(imgName) {
      try {
        require(`@/assets/${imgName}.png`);
        return true;
      } catch (error) {
        return false;
      }
    },
    toThread(i) {
      const route =
        this.Notifications[i].NTFTRD.TRDMTY == "Service Report"
          ? "sr"
          : "thread";

      if (!this.notifIsNotSeen[i]) {
        this.$router.push({
          path: `/${route}/${this.Notifications[i].NTFTRD._id}`,
        });
      } else {
        const data = {
          notif_id: this.Notifications[i]._id,
          usr_id: this.usr_id,
        };
        this.updateNotification(data).then(
          (res) => {
            console.log(res);
            this.$router.push({ path: `/${route}/${res.data.NTFTRD}` });
            this.seenNotification({ index: i, usr_id: this.usr_id });
          },
          (error) => {
            console.error(error);
          }
        );
      }
    },
    getRelativeTime(date) {
      let time = moment().from(date, true);
      if (time.endsWith("days")) {
        return moment(date).format("MMMM Do YYYY, hh:mm a");
      } else {
        return time + " ago";
      }
    },
  },
};
</script>

<style scoped>
.v-menu__content {
  border-radius: 0 0 5px 5px;
}
.menu-card {
  overflow-y: auto;
  max-height: 383px;
}

/* width */
::-webkit-scrollbar {
  width: 5px;
}

/* Track */
::-webkit-scrollbar-track {
  display: none;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #999999;
  border-radius: 10px;
}
</style>
<style>
.v-badge .v-badge__badge {
  top: -1px;
  right: -1px;
}
</style>
