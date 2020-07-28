<template>
  <v-container grid-list-md pt-2>
    <app-filter-thread v-if="false"></app-filter-thread>
    <v-layout row wrap>
      <v-flex v-for="(thread, key) in CurThreads" :key="key" xs12>
        <v-badge color="red" left overlap style="width: 100%;">
          <card-thread v-if="thread.TRDMTY !== 'Service Report'" :thread="thread"></card-thread>
          <card-sr v-else :data="thread"></card-sr>
        </v-badge>
      </v-flex>
      <!-- <v-flex v-for="(details, key) in sampleSR" :key="key" xs12>
        <card-sr :data="details"></card-sr>
      </v-flex> -->
    </v-layout>
    <v-speed-dial bottom right fixed transition="slide-x-reverse-transition" direction="top">
      <template v-slot:activator>
        <v-btn color="blue darken-2" dark fab>
          <v-icon>add</v-icon>
          <v-icon>close</v-icon>
        </v-btn>
      </template>
      <new-thread class="mr-5"></new-thread>
      <new-sreport class="mr-5" v-if="CurCheckInAcc.serviceLocLogAction == 'CheckIn'"></new-sreport>
      <checkInOut class="mr-5"></checkInOut>
    </v-speed-dial>
  </v-container>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import AppFilterThread from '@/components/threadFilter.vue'
import NewThread from '@/components/zuzi/createthread.vue'
import checkInOut from '@/components/checkInOut.vue'
import NewSreport from '@/components/SRForm.vue'
import CardThread from './cardThread'
import CardSr from './cardSR'

export default {
  data() {
    return {}
  },
  created() {
    const accID = this.$route.params.ACCMID ? this.$route.params.ACCMID : ''
    this.getThreadByAccountId(accID).then(
      res => {
        this.upCurThreads(res.data.threads)
      },
      error => {
        console.error(error)
      }
    )
  },
  computed: {
    ...mapState(['CurThreads', 'CurCheckInAcc']),
  },
  methods: {
    ...mapActions(['getThreadByAccountId']),
    ...mapMutations(['upCurThreads']),
  },
  components: {
    NewThread,
    NewSreport,
    AppFilterThread,
    CardThread,
    CardSr,
    checkInOut,
  },
}
</script>

<style>
.hoverClick:hover {
  text-decoration: underline;
  color: steelblue;
  cursor: pointer;
}
</style>
