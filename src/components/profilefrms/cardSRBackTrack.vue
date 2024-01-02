<template>
  <v-card light color="white" class="text-sm-left">
    <v-card-title class="subheading">
      <v-layout row wrap>
        <v-flex xs12>
          <h4>
            <span>{{ data.TRDMACD.ACCMNM }}</span>
          </h4>
        </v-flex>
        <v-flex class="subheading" xs12>
          <span class="indigo darken-1 pa-1 caption white--text mr-1">{{ data.TRDSEC }}</span>
          <span class="red darken-1 pa-1 caption white--text">{{ data.TRDMTY }}</span>
          <span> SR: #{{ data.TRDMTT }} </span>
          <v-chip v-if="data.TRDSTS == 'START'" label color="green darken-1" text-color="white" small
            class="absolute top right">
            <v-icon size="15" class="pr-2">cached</v-icon> Ongoing
          </v-chip>
          <v-chip v-if="data.TRDSTS == 'STOP'" label color="red darken-1" text-color="white" small
            class="absolute top right">
            <v-icon size="15" class="pr-2">pause_circle_filled</v-icon> Onhold
          </v-chip>
          <v-chip v-if="data.TRDSTS == 'DONE'" label color="warning" text-color="white" small class="absolute top right">
            <v-icon size="15" class="pr-2">info</v-icon> Finalizing
          </v-chip>
          <v-chip v-if="data.TRDSTS == 'WORK COMPLETE'" label color="indigo darken-1" text-color="white" small
            class="absolute top right">
            <v-icon size="15" class="pr-2">done_all</v-icon> Work Complete
          </v-chip>
        </v-flex>
        <v-flex>
          <v-layout class="caption font-weight-regular text-uppercase" align-start justify-center column fill-height>
            <v-flex pa-0>
              Posted by:
              <template v-if="data.TRDMUI">
                <span class="font-weight-medium">
                  {{ data.TRDMUI.CNTMCN }}
                </span>
              </template>
            </v-flex>
            <v-flex pa-0>
              Date posted:
              <span class="font-weight-medium">{{ getRelativeTime(data.TRDMCD) }}</span>
            </v-flex>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-card-title>
    <v-card-text class="body-1 pt-0">
      <v-flex style="white-space: pre-line;" v-if="data.TRDSTS == 'STOP'">
        <v-chip label class="red lighten-3">
          <b>PENDING:</b>
        </v-chip>
        {{ data.TRDMDE }}
      </v-flex>
      <v-flex style="white-space: pre-line;" v-else>
        {{ data.TRDMDE }}
      </v-flex>
      <v-flex style="white-space: pre-line;" v-show="data.TRDSTS != 'STOP'">
        <span class="font-weight-medium">Purpose of Visits:</span> {{ "\r\n" }} {{ POVDetails }}
      </v-flex>
    </v-card-text>
    <v-divider light></v-divider>
  </v-card>
</template>
<script>
import moment from "moment";
export default {
  data() {
    return {
      POVDetails: ""
    }
  },
  created() {
    this.data.purposeOfVisits.forEach(x => {
      if (x.pvRemarks == null) {
        if (x.pvRemarks == "") {
          this.POVDetails = this.POVDetails == "" ? x.pvDescription : this.POVDetails + "\r\n " + x.pvDescription;
        }
        else {
          this.POVDetails = this.POVDetails == "" ? x.pvDescription + ": " + x.pvRemarks : this.POVDetails + "\r\n " + x.pvDescription + ": " + x.pvRemarks;
        }
      }
      else {
        this.POVDetails = this.POVDetails == "" ? x.pvDescription : this.POVDetails + "\r\n " + x.pvDescription;
      }
    });
  },
  methods: {
    getRelativeTime(date) {
      let time = moment().from(date, true);
      if (time.endsWith("days")) {
        return moment(date).format("MMMM Do YYYY, hh:mm a");
      } else {
        return time + " ago";
      }
    },
    toDetails(srid) {
      if (this.data.TRDSEC == "TTP") {
        this.$router.push({ name: "ttp", params: { TRDMTI: srid } });
      } else {
        this.$router.push({ name: "sr", params: { TRDMTI: srid } });
      }
    },
  },
  props: {
    data: {
      type: Object,
    },
  },
};
</script>
  
<style>
</style>
  