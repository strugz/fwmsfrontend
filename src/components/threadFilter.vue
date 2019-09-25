<template>
  <v-toolbar dense floating>
    <v-select
      clearable
      v-model="select"
      :items="sections"
      label="Filter"
      class="pa-0 ma-0"
      flat
      hide-details
      autowidth
      dense
      single-line
      @change="upThreads()"
    ></v-select>
  </v-toolbar>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
export default {
  data() {
    return {
      select: '',
    }
  },
  computed: {
    ...mapState(['CurClientDetails']),
    sections() {
      let itms = []
      for (const i in this.CurClientDetails.ACCDTL) {
        itms.push(this.CurClientDetails.ACCDTL[i].ACCDDN)
      }
      return itms
    },
  },
  methods: {
    ...mapActions(['getThreadByAccountIdWithFilter']),
    ...mapMutations(['upCurThreads']),
    upThreads() {
      // console.log(this.select)
      const dept = typeof this.select !== 'undefined' ? `?dept=${this.select}` : ''
      const data = { id: this.$route.params.ACCMID, dept }
      this.getThreadByAccountIdWithFilter(data).then(
        res => {
          this.upCurThreads(res.data.threads)
        },
        error => {
          console.error(error)
        }
      )
    },
  },
}
</script>
