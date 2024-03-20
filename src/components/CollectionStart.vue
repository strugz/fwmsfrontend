<template>
  <v-layout mt-0 row justify-center>
    <v-dialog width="500" v-model="dialog" hide-overlay persistent>
      <template v-slot:activator="{ on }">
        <v-btn v-if="type == 'icon'" small icon flat round dark color="teal" v-on="on">
          <v-icon color="white lighten-1">timer_off</v-icon>
        </v-btn>
        <v-btn v-else small round dark color="teal" v-on="on">
          Collection
        </v-btn>
      </template>
      <v-card>
        <v-toolbar absolute color="primary" dense dark scroll-off-screen scroll-target="#scrolling-techniques">
          <v-toolbar-title>Collection Visit</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="dialog = !dialog">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-layout justify-center>
          <v-card-actions>
            <v-container>
              <v-flex xs12>
                <v-btn @click="StartCollection" class="mt-5  button">Start</v-btn>
              </v-flex>
            </v-container>
          </v-card-actions>
        </v-layout>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
<script>
import { mapActions, mapState, mapMutations } from "vuex";
export default {
  data() {
    return {
      dialog: false,
    };
  },
  created() { },
  watch: {},
  computed: {
    ...mapState(["CurUserDetails", "CurClientDetails"])
  },
  methods: {
    ...mapActions(["InsertStartCollection"]),
    StartCollection() {
      let Collection = JSON.stringify({
        userID: this.CurUserDetails.CNTMST.CNTMID,
        CustomerID: this.CurClientDetails.ACCMID,
        SRFormType: "COLLECT"
      });
      this.InsertStartCollection({ data: Collection }).then(res => {
        if (res == 201) {
          this.Sample();
        }
      })
        .catch((error) => {
          alert(error);
        });
    },
    Sample() {
      let dataTwo = JSON.stringify({
        RECEIVER: this.CurUserDetails.CNTMST.CNTTGP,
        SENDER: this.CurUserDetails.CNTMST.CNTMNN,
        MESSAGE: "Arrive at " + this.CurClientDetails.ACCMNM,
      });
      const OpheadersTwo = {
        method: "POST",
        data: dataTwo,
        headers: {
          "content-type": "application/json",
          accept: "*/*",
          "accept-Encoding": "gzip, deflate, br",
          connection: "keep-alive",
          "sec-fetch-mode": "no-cors",
        },
        url: "https://mdmpi.com.ph/lasius/api_sendsms",
      };
      axios(OpheadersTwo).then((res) => {
        if (res.status == 200) {
          this.dialog = false;
        }
      });
    },
  },
  props: {
    type: {
      type: String,
      default: "",
    },
  },
};
</script>
<style>
button {
  text-align: center;
  margin: 0 auto;
  display: flex;
  justify-content: center;
}
</style>
