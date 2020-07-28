<template>
  <v-card light color="white" class="text-sm-left">
    <v-card-title class="subheading">
      <v-layout row wrap>
        <v-flex @click="toDetails(thread.TRDMTI)" class="subheading" xs12>
          <span class="indigo darken-1 pa-1 caption white--text mr-1">{{ thread.TRDSEC }}</span>
          <span class="red darken-1 pa-1 caption white--text">{{ thread.TRDMTY }}</span>
          <span class="hoverClick"> {{ thread.TRDMTT }} </span>
          <v-chip
            v-if="thread.TRDMST"
            label
            color="indigo darken-1"
            text-color="white"
            small
            class="absolute top right"
          >
            <v-icon size="12" class="pr-2">fa-lock-open</v-icon> Open
          </v-chip>
          <v-chip v-else label color="red darken-1" text-color="white" small class="absolute top right">
            <v-icon size="12" class="pr-2">fa-lock</v-icon> Closed
          </v-chip>
        </v-flex>
        <v-flex mt-1 ml-1>
          <v-layout class="caption font-weight-regular text-uppercase" align-start justify-center column fill-height>
            <v-flex pa-0>
              Posted by:
              <template v-if="thread.TRDMUI">
                <span class="font-weight-medium">
                  {{ thread.TRDMUI.CNTMCN }}
                </span>
              </template>
            </v-flex>
            <v-flex pa-0>
              Date posted:
              <span class="font-weight-medium">{{ getRelativeTime(thread.TRDMCD) }}</span>
            </v-flex>
            <v-flex pa-0>
              Action date:
              <span class="font-weight-medium">{{ getRelativeTime(thread.TRDADT) }}</span>
            </v-flex>
          </v-layout>
        </v-flex>
        <!-- <v-flex class="caption py-0" xs12>Posted by: {{ thread.TRDMUI.CNTMCN }}</v-flex>
        <v-flex class="caption pt-0" xs12>Date posted: {{ getRelativeTime(thread.TRDMCD) }} </v-flex> -->
      </v-layout>
    </v-card-title>
    <v-card-text class="body-1">{{ thread.TRDMDE }}</v-card-text>
    <v-divider light></v-divider>
    <v-card-actions class="pa-2">
      <v-layout @click="toDetails(thread.TRDMTI)" class="xs3 hoverClick" justify-start align-center row wrap>
        <v-flex>
          <v-icon small class="pr-1">chat_bubble</v-icon>
          <span class="">{{ thread.TRDCNT }}</span>
          <template class="caption" v-if="thread.TRDUBY !== undefined">
            <span class="caption font-weight-light ml-3">
              by:
              <span class="font-weight-medium">{{ thread.TRDUBY.CNTMNN }}</span>
              on:
              {{ getRelativeTime(thread.TRDUPD) }}
            </span>
          </template>
        </v-flex>
      </v-layout>
    </v-card-actions>
  </v-card>
</template>

<script>
import moment from 'moment'
export default {
  methods: {
    getRelativeTime(date) {
      let time = moment().from(date, true)
      if (time.endsWith('days')) {
        return moment(date).format('MMMM Do YYYY, hh:mm a')
      } else {
        return time + ' ago'
      }
    },
    toDetails(TRDMTI) {
      this.$router.push({ path: `/thread/${TRDMTI}` })
    },
  },
  props: {
    thread: {
      type: Object,
    },
  },
}
</script>

<style></style>
