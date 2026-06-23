<template>
  <div class="collection-start">
    <v-dialog max-width="520" v-model="dialog" persistent transition="dialog-bottom-transition" :retain-focus="false">
      <template v-slot:activator="{ on }">
        <v-btn v-if="showActivator && type == 'icon'" small icon text rounded dark color="teal" v-on="on">
          <v-icon color="white lighten-1">timer_off</v-icon>
        </v-btn>
        <v-btn v-else-if="showActivator" small rounded dark color="teal" v-on="on"> Collection </v-btn>
      </template>

      <v-card class="collection-start__card" flat @click.stop>
        <div class="collection-start__header">
          <div>
            <p>Collection Visit</p>
            <h2>Start Collection</h2>
            <span>Choose the purpose and verify your current location before starting.</span>
          </div>
          <v-btn icon text color="white" @click="dialog = false">
            <v-icon>close</v-icon>
          </v-btn>
        </div>

        <v-card-text class="collection-start__body">
          <v-combobox
            v-model="itemPOV"
            :items="CollectorPOVList"
            item-value="PVID"
            item-text="PVDescription"
            label="Purpose of Visit"
            multiple
            outlined
            dense
            auto-select-first
            hide-details="auto"
            prepend-inner-icon="assignment"
          ></v-combobox>

          <div class="collection-start__location">
            <v-icon color="teal darken-2">place</v-icon>
            <div>
              <strong>Current location</strong>
              <span>{{ lat || 'Waiting for location' }} {{ long || '' }}</span>
            </div>
          </div>

          <a :href="'https://www.google.com/maps?q=' + lat + ',' + long" target="_blank" class="collection-start__link">
            <v-icon small color="teal darken-2">open_in_new</v-icon>
            Verify your location in Maps
          </a>
        </v-card-text>

        <v-card-actions class="collection-start__actions">
          <v-btn text color="blue-grey darken-1" :disabled="startLoading" @click="dialog = false">Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="teal darken-2"
            dark
            depressed
            :loading="startLoading"
            :disabled="startLoading"
            @click="LocationValidation"
          >
            Start
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import { mapActions, mapMutations, mapState } from 'vuex'
export default {
  data() {
    return {
      dialog: false,
      itemPOV: [],
      itemPOVTemp: [],
      lat: '',
      long: '',
      startLoading: false,
    }
  },
  created() {
    this.GetCollectorsPOV()
    this.GetMyCoordinates()
  },
  watch: {},
  computed: {
    ...mapState(['CurUserDetails', 'CurClientDetails', 'CollectorPOVList']),
  },
  methods: {
    ...mapActions(['InsertStartCollection', 'getPOV']),
    ...mapMutations(['upCollectorPOVList']),
    open() {
      this.dialog = true
    },
    GetMyCoordinates() {
      this.lat = ''
      this.long = ''
      navigator.geolocation.getCurrentPosition(
        position => {
          this.lat = position.coords.latitude
          this.long = position.coords.longitude
        },
        error => {
          alert(error.message)
        }
      )
      console.log(this.lat + ' ' + this.long)
    },
    LocationValidation() {
      let val = '1'
      if (this.lat == '') {
        val = '0'
        alert('Location is Not Detected!')
      }
      if (this.itemPOV.length == 0) {
        val = '0'
        alert('Purpose of Visit is Empty!')
      }
      if (val == '1') {
        this.StartCollection()
      }
    },
    StartCollection() {
      this.startLoading = true
      let Collection = JSON.stringify({
        userID: this.CurUserDetails.CNTMST.CNTMID,
        CustomerID: this.CurClientDetails.ACCMID,
        SRFormType: 'COLLECT',
        pov: this.itemPOV,
        TRDLOC: this.lat + ' ' + this.long,
      })
      this.InsertStartCollection({ data: Collection })
        .then(res => {
          if (res.status == 201) {
            this.Sample()
          } else if (res.status == 200) {
            if (res.data.message == 'PENDING') {
              alert('Another Activity is still Pending!')
            }
            this.startLoading = false
          } else {
            this.startLoading = false
          }
        })
        .catch(error => {
          alert(error)
          this.startLoading = false
        })
    },
    GetCollectorsPOV() {
      this.getPOV(this.CurUserDetails.CNTMST.CNTDPT).then(res => {
        res.data.forEach(x => {
          this.itemPOVTemp.push({
            PVID: Number(x.drpiid),
            PVDescription: x.drpval,
            PVRemarks: '',
          })
        })
        this.upCollectorPOVList(this.itemPOVTemp)
      })
    },
    Sample() {
      let POV = ''
      this.itemPOV.forEach(x => {
        POV = POV == '' ? x.PVDescription : POV + ' and ' + x.PVDescription
      })
      let dataTwo = JSON.stringify({
        RECEIVER: this.CurUserDetails.CNTMST.CNTTGP,
        SENDER: this.CurUserDetails.CNTMST.CNTMNN,
        MESSAGE: 'Visiting ' + this.CurClientDetails.ACCMNM + ' to do ' + POV,
      })
      const OpheadersTwo = {
        method: 'POST',
        data: dataTwo,
        headers: {
          'content-type': 'application/json',
          accept: '*/*',
          'accept-Encoding': 'gzip, deflate, br',
          connection: 'keep-alive',
          'sec-fetch-mode': 'no-cors',
        },
        url: 'https://mdmpi.com.ph/lasius/api_sendsms',
      }
      axios(OpheadersTwo)
        .then(res => {
          if (res.status == 200) {
            this.startLoading = false
            this.dialog = false

            setTimeout(() => {
              location.reload()
            }, 1000)
          }
        })
        .catch(error => {
          alert(error)
          this.startLoading = false
        })
    },
  },
  props: {
    type: {
      type: String,
      default: '',
    },
    showActivator: {
      type: Boolean,
      default: true,
    },
  },
}
</script>
<style scoped>
.collection-start__card {
  border-radius: 12px;
  overflow: hidden;
}

.collection-start__header {
  align-items: flex-start;
  background: linear-gradient(135deg, #0f766e, #1976d2);
  color: white;
  display: flex;
  justify-content: space-between;
  padding: 22px 24px;
}

.collection-start__header p {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin: 0 0 6px;
  text-transform: uppercase;
}

.collection-start__header h2 {
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0 0 4px;
}

.collection-start__header span {
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.9rem;
}

.collection-start__body {
  display: grid;
  gap: 14px;
  padding: 22px 24px 10px;
}

.collection-start__location {
  align-items: center;
  background: #f8fafc;
  border: 1px solid rgba(15, 76, 76, 0.12);
  border-radius: 10px;
  display: flex;
  gap: 12px;
  padding: 16px;
}

.collection-start__location strong,
.collection-start__location span {
  display: block;
}

.collection-start__location strong {
  color: #0f172a;
}

.collection-start__location span {
  color: #64748b;
}

.collection-start__link {
  align-items: center;
  color: #00695c;
  display: inline-flex;
  font-weight: 700;
  gap: 6px;
  text-decoration: none;
}

.collection-start__actions {
  border-top: 1px solid rgba(15, 76, 76, 0.1);
  padding: 14px 24px 18px;
}
</style>
