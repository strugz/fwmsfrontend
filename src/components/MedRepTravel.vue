<template>
  <div class="mr-travel">
    <v-dialog v-model="dialog" max-width="460" transition="dialog-bottom-transition">
      <template v-slot:activator="{ on }">
        <v-btn v-if="type == 'icon'" small icon text rounded dark color="teal" v-on="on">
          <v-icon color="white lighten-1">timer_off</v-icon>
        </v-btn>
        <v-btn v-else small rounded dark color="teal" v-on="on">
          <v-icon left small>near_me</v-icon>
          Travel
        </v-btn>
      </template>

      <v-card class="mr-travel__card" flat>
        <div class="mr-travel__header">
          <div>
            <p class="mr-travel__eyebrow">Field Travel</p>
            <h2>Start Travel</h2>
            <span>Confirm your location before beginning today&apos;s travel log.</span>
          </div>
          <v-btn icon text color="white" @click="dialog = false">
            <v-icon>close</v-icon>
          </v-btn>
        </div>

        <v-card-text class="mr-travel__body">
          <div class="mr-travel__location">
            <v-icon color="teal darken-2" size="34">place</v-icon>
            <div>
              <strong>Current coordinates</strong>
              <span>{{ lat || 'Waiting for location' }} {{ long || '' }}</span>
            </div>
          </div>

          <a :href="'https://www.google.com/maps?q=' + lat + ',' + long" target="_blank" class="mr-travel__map-link">
            <v-icon small color="teal darken-2">open_in_new</v-icon>
            Verify your location in Maps
          </a>
        </v-card-text>

        <v-card-actions class="mr-travel__actions">
          <v-btn text color="blue-grey darken-1" @click="dialog = false">Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="teal darken-2" class="text-center" dark depressed @click="startTravel">Start Travel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import moment from 'moment'
import { mapActions, mapState } from 'vuex'
export default {
  data() {
    return {
      dialog: false,
      datetime: moment(new Date()).format('YYYY-MM-DD'),
      lat: '',
      long: '',
    }
  },
  mounted() {
    this.GetMyCoordinates()
  },
  computed: {
    ...mapState(['CurUserDetails']),
  },
  methods: {
    ...mapActions(['getTRLMSTOnGoing', 'InsertTRLMST']),
    startTravel() {
      let dataTemp = JSON.stringify({
        TRLCDT: moment(new Date()).format('YYYY-MM-DD'),
        TRLCNT: this.CurUserDetails.CNTMST.CNTMID,
        TRLSTS: '1',
      })
      this.getTRLMSTOnGoing({ data: dataTemp })
        .then(res => {
          if (res.status == 204) {
            let tempData = JSON.stringify({
              TRLLOC: this.lat + ' ' + this.long,
              TRLCNT: this.CurUserDetails.CNTMST.CNTMID,
            })
            this.InsertTRLMST({ data: tempData })
              .then(res => {
                if (res.status == 200) {
                  this.dialog = false
                }
              })
              .error(error => {
                alert(error)
              })
          } else if (res.status == 200) {
            alert('Already Started the Travel.')
          }
        })
        .error(error => {
          alert(error)
        })
    },
    GetMyCoordinates() {
      navigator.geolocation.getCurrentPosition(
        position => {
          this.lat = position.coords.latitude
          this.long = position.coords.longitude
        },
        error => {
          alert(error.message)
        }
      )
    },
  },
  props: {
    type: {
      type: String,
      default: '',
    },
  },
}
</script>
<style scoped>
.mr-travel__card {
  border-radius: 12px;
  overflow: hidden;
}

.mr-travel__header {
  align-items: flex-start;
  background: linear-gradient(135deg, #0f766e, #1976d2);
  color: white;
  display: flex;
  justify-content: space-between;
  padding: 22px 24px;
}

.mr-travel__eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin: 0 0 6px;
  text-transform: uppercase;
}

.mr-travel__header h2 {
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0 0 4px;
}

.mr-travel__header span {
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.9rem;
}

.mr-travel__body {
  display: grid;
  gap: 14px;
  padding: 22px 24px 10px;
}

.mr-travel__location {
  align-items: center;
  background: #f8fafc;
  border: 1px solid rgba(15, 76, 76, 0.12);
  border-radius: 10px;
  display: flex;
  gap: 12px;
  padding: 16px;
}

.mr-travel__location strong,
.mr-travel__location span {
  display: block;
}

.mr-travel__location strong {
  color: #0f172a;
}

.mr-travel__location span {
  color: #64748b;
  font-size: 0.88rem;
}

.mr-travel__map-link {
  align-items: center;
  color: #0f766e;
  display: inline-flex;
  font-weight: 700;
  gap: 6px;
  text-decoration: none;
}

.mr-travel__actions {
  border-top: 1px solid rgba(15, 76, 76, 0.1);
  padding: 14px 24px 18px;
}
</style>
