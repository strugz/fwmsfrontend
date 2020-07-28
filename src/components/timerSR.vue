<template>
  <v-layout mt-0 row justify-end>
    <v-dialog v-model="dialog">
      <template v-slot:activator="{ on }">
        <v-btn small flat icon color="indigo" class="ma-0" dark v-on="on">
          <v-icon>timer</v-icon>
        </v-btn>
      </template>
      <v-card>
        <v-card-text style="height: 450px;" class="pa-0">
          <iframe v-if="dialog" :src="srFormURL"></iframe>
          {{ srFormURL }}
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data() {
    return {
      dialog: false,
    }
  },
  // /startedservice/:ClientID/:Client/:LoginUserID/:SRID
  computed: {
    ...mapState(['CurClientDetails', 'CurUserDetails', 'CurThreadDetails']),
    srFormURL() {
      return `https://sr.mdmpi.com.ph/#/startedservice/${this.CurClientDetails.ACCMID}/${
        this.CurClientDetails.ACCMNM
      }/${this.CurUserDetails.CNTMST.CNTMID}/${this.CurThreadDetails.TRDMTT}/${this.CurThreadDetails.TRDMTI}`
    },
  },
}
</script>

<style></style>
