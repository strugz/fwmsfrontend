<template>
  <div class="report-preview-launcher">
    <v-dialog v-model="pdfDialog" fullscreen hide-overlay persistent transition="dialog-bottom-transition">
      <template v-slot:activator="{ on }">
        <v-btn small text icon color="indigo" class="ma-0" dark v-on="on" @click="PrintPreview">
          <v-icon>print</v-icon>
        </v-btn>
      </template>

      <v-card class="report-preview">
        <v-toolbar color="teal darken-2" dark flat height="64" class="report-preview__toolbar">
          <div class="report-preview__title">
            <span>Print Preview</span>
            <small>{{ CurThreadDetails.TRDMTT || 'Service report' }}</small>
          </div>
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn icon color="white" v-on="on" :disabled="loading" @click="LoadPdf">
                <v-icon>file_download</v-icon>
              </v-btn>
            </template>
            <span>Download SR</span>
          </v-tooltip>
          <v-btn icon color="white" @click="close">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>

        <div class="report-preview__content">
          <aside class="report-preview__panel">
            <div class="report-preview__panel-title">Send Copy</div>
            <div class="report-preview__panel-text">Email this report directly to the customer or download a PDF.</div>

            <v-text-field
              ref="email"
              v-model="EmailReceiver"
              class="report-preview__field"
              :rules="[rules.email]"
              label="Email address"
              placeholder="customer@email.com"
              outlined
              dense
              hide-details="auto"
            ></v-text-field>

            <v-btn
              block
              depressed
              color="teal darken-2"
              dark
              :loading="sendBTNDisbled"
              :disabled="sendBTNDisbled"
              @click="Emailvalidation"
            >
              Send to Email
            </v-btn>

            <v-btn block text color="teal darken-2" class="mt-2" :disabled="loading" @click="LoadPdf">
              <v-icon left size="18">file_download</v-icon>
              Download PDF
            </v-btn>
          </aside>

          <main class="report-preview__viewer">
            <div v-if="loading" class="report-preview__state">
              <v-progress-circular indeterminate color="teal darken-2"></v-progress-circular>
              <span>Preparing report preview...</span>
            </div>

            <div v-else-if="!pdfsrc" class="report-preview__state">
              <v-icon size="44" color="blue-grey lighten-1">picture_as_pdf</v-icon>
              <span>No preview loaded yet</span>
            </div>

            <div v-else class="report-preview__document">
              <pdf :src="pdfsrc"></pdf>
            </div>
          </main>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import pdf from 'vue-pdf'
import { mapState } from 'vuex'
import axios from 'axios'

export default {
  components: {
    pdf,
  },
  data() {
    return {
      sendBTNDisbled: false,
      loading: false,
      dialog: false,
      pdfsrc: null,
      pdfDialog: false,
      EmailReceiver: '',
      rules: {
        email: value => {
          const pattern =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          return pattern.test(value) || 'Invalid e-mail.'
        },
      },
    }
  },
  computed: {
    ...mapState(['CurClientDetails', 'CurUserDetails', 'CurThreadDetails']),
    reportMachineCode() {
      return (this.CurThreadDetails.TRDMMC || '').replace(':', '').replace('/', ' ').replace('/', ' ').trim()
    },
    reportRequest() {
      const reportId = this.CurThreadDetails.TRDMTT || ''
      const isTtp = reportId.substring(0, 3) == 'TTP'
      const url = isTtp
        ? `https://crm.mdmpi.com.ph/rpt/rgenerator/report/${reportId}`
        : `https://crm.mdmpi.com.ph/rpt/rgenerator/report/${reportId}/${this.reportMachineCode}`

      return {
        method: isTtp ? 'POST' : 'GET',
        headers: {
          'content-type': 'application/pdf, */*',
          accept: 'application/pdf, */*',
        },
        responseType: 'blob',
        url,
      }
    },
    emailRequestUrl() {
      const clientName = encodeURI((this.CurClientDetails.ACCMNM || '').replace('.', '').replace('&', 'and').trim())
      return `https://crm.mdmpi.com.ph/rpt/rgenerator/report/${clientName}/${this.reportMachineCode}/${this.EmailReceiver}/${this.CurThreadDetails.TRDMTT}`
    },
  },
  methods: {
    close() {
      this.EmailReceiver = ''
      this.sendBTNDisbled = false
      this.resetForm()
      this.pdfDialog = false
    },
    resetForm() {
      if (this.$refs.email) {
        this.$refs.email.reset()
      }
    },
    LoadPdf() {
      axios(this.reportRequest)
        .then(res => {
          const fileURL = window.URL.createObjectURL(new Blob([res.data]))
          const fileLink = document.createElement('a')
          fileLink.href = fileURL
          fileLink.setAttribute('download', `${this.CurThreadDetails.TRDMTT}.pdf`)
          document.body.appendChild(fileLink)
          fileLink.click()
          document.body.removeChild(fileLink)
          window.URL.revokeObjectURL(fileURL)
        })
        .catch(error => {
          alert(error)
        })
    },
    Emailvalidation() {
      if (this.EmailReceiver != '') {
        this.sendBTNDisbled = true
        this.InsertEmail()
      } else {
        alert('No Email Inputted!')
      }
    },
    InsertEmail() {
      const OpHeaders = {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
        },
        url: this.emailRequestUrl,
      }

      axios(OpHeaders)
        .then(res => {
          if (res.status == 200) {
            this.sendBTNDisbled = false
            alert('Email Sent!')
          }
        })
        .catch(error => {
          this.sendBTNDisbled = false
          alert(error)
        })
    },
    PrintPreview() {
      this.loading = true

      axios(this.reportRequest)
        .then(res => {
          if (this.pdfsrc) {
            URL.revokeObjectURL(this.pdfsrc)
          }

          const blob = new Blob([res.data])
          this.pdfsrc = URL.createObjectURL(blob)
          this.loading = false
        })
        .catch(error => {
          this.loading = false
          alert(error)
        })
    },
  },
}
</script>

<style scoped>
.report-preview-launcher {
  display: inline-flex;
}

.report-preview {
  display: flex;
  height: 100vh;
  flex-direction: column;
  overflow: hidden;
  background: #eef4f7;
}

.report-preview__toolbar {
  flex: 0 0 auto;
}

.report-preview__title {
  display: flex;
  min-width: 0;
  flex-direction: column;
  line-height: 1.2;
}

.report-preview__title span {
  font-size: 17px;
  font-weight: 800;
}

.report-preview__title small {
  color: rgba(255, 255, 255, 0.82);
  font-size: 12px;
}

.report-preview__content {
  display: grid;
  flex: 1 1 auto;
  min-height: 0;
  grid-template-columns: 320px minmax(0, 1fr);
}

.report-preview__panel {
  padding: 20px;
  border-right: 1px solid #d9e2ec;
  background: #fff;
}

.report-preview__panel-title {
  color: #102a43;
  font-size: 15px;
  font-weight: 800;
}

.report-preview__panel-text {
  margin: 6px 0 18px;
  color: #62748a;
  font-size: 13px;
  line-height: 1.5;
}

.report-preview__field {
  margin-bottom: 14px;
}

.report-preview__viewer {
  position: relative;
  min-width: 0;
  overflow: auto;
  padding: 28px;
}

.report-preview__state {
  display: flex;
  min-height: 360px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #52606d;
  font-size: 14px;
}

.report-preview__document {
  width: min(100%, 920px);
  min-height: calc(100vh - 120px);
  margin: 0 auto;
  overflow: hidden;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.16);
}

@media (max-width: 860px) {
  .report-preview__content {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr);
  }

  .report-preview__panel {
    border-right: 0;
    border-bottom: 1px solid #d9e2ec;
    padding: 14px;
  }

  .report-preview__viewer {
    padding: 14px;
  }
}
</style>
