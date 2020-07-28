<template>
  <v-layout class="py-1" :align-start="!curUser" :align-end="curUser" justify-start column>
    <v-flex class="caption font-weight-regular px-2" style="padding-bottom: 0 !important;">
      <span style="font-size: .85em;">{{ getRelativeTime(value.TRDCDT) }}</span>
    </v-flex>
    <v-flex style="padding-top: 0 !important;">
      <v-card width="auto" :style="curUser ? myStyle : defStyle" :color="curUser ? 'teal darken-3' : 'teal lighten-4'">
        <v-card-title v-if="!curUser" class="caption pt-1 pb-0 pl-2 pr-4">
          <span style="font-size: .9em;">{{ `(${value.TRDCUI.CNTMNN}) ${value.TRDCUI.CNTMCN}` }}</span>
        </v-card-title>
        <v-card-text :class="(curUser ? 'pa-2' : 'pt-0 pb-1') + ' body-2 white-space-pre px-4'">{{
          value.TRDCCM
        }}</v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import moment from 'moment'
export default {
  data() {
    return {}
  },
  props: {
    value: Object,
    curUser: Boolean,
  },
  methods: {
    getRelativeTime(date) {
      let time = moment().from(date, true)
      if (time.endsWith('days')) {
        return moment(date).format('MMMM Do YYYY, hh:mm a')
      } else {
        return time + ' ago'
      }
    },
    // },
  },
  computed: {
    defStyle() {
      return 'border-radius: 0px 51px 51px 51px; color: black'
    },
    myStyle() {
      return 'border-radius: 51px 51px 0px 51px; color: white'
    },
  },
}
</script>

<style scoped>
.white-space-pre {
  white-space: pre-wrap;
}
</style>
