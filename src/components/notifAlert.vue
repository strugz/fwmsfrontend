<template>
  <v-card class="mb-1" @click="props.close">
    <v-list three-line dense class="py-0 notif-tile">
      <v-list-tile class="teal lighten-5" @click="toThread(props.item.data)" avatar>
        <v-list-tile-avatar>
          <v-img
            v-if="defaultImg(props.item.data.img)"
            :src="require(`@/assets/MDMPI.png`)"
            style="border-radius: 8px;"
          ></v-img>
          <v-icon v-else large>fa-clinic-medical</v-icon>
        </v-list-tile-avatar>

        <v-list-tile-content>
          <span class="v-list__tile__title font-weight-medium body-1">
            <v-icon small>{{ props.item.data.icon }}</v-icon
            >{{ props.item.title }}
          </span>
          <span class="v-list__tile__sub-title font-weight-bold caption">
            {{ props.item.data.from }}
            <span class="font-weight-regular"> - {{ props.item.text }} </span>
          </span>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
  </v-card>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
export default {
  computed: {
    ...mapState(['Notifications']),
  },
  methods: {
    ...mapActions(['updateNotification']),
    ...mapMutations(['seenNotification']),
    defaultImg(imgName) {
      try {
        require(`@/assets/${imgName}.png`)
        return true
      } catch (error) {
        return false
      }
    },
    toThread(props) {
      const data = { notif_id: props.notif_id, usr_id: props.usr_id }
      this.updateNotification(data).then(
        res => {
          this.$router.push({ path: `/thread/${res.data.NTFTRD}` })
          this.seenNotification({ index: props.notif_index, usr_id: props.usr_id })
        },
        error => {
          console.error(error)
        }
      )
    },
  },
}
</script>

<style scoped>
/* text-overflow: ellipsis */
.radius {
  border-radius: 15px 0 0 15px;
}
.notif-tile {
  border-left: solid 5px #00695c;
}
</style>
