<template>
  <div class="report-preview-launcher">
    <v-dialog v-model="pdfDialog" fullscreen hide-overlay persistent transition="dialog-bottom-transition">
      <template v-slot:activator="{ on }">
        <v-btn small text icon color="indigo" class="ma-0" dark v-on="on" @click="PrintPreview">
          <v-icon>print</v-icon>
        </v-btn>
      </template>

      <v-card class="report-preview">
        <v-toolbar dark flat height="74" class="report-preview__toolbar">
          <div class="report-preview__brand">
            <div class="report-preview__icon">
              <v-icon color="white">assignment</v-icon>
            </div>
            <div class="report-preview__title">
              <span>Service Report Preview</span>
              <small>{{ clientName }}</small>
            </div>
          </div>

          <div class="report-preview__meta">
            <span class="report-preview__chip">{{ CurThreadDetails.TRDMTT || 'Service report' }}</span>
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
            <div class="report-preview__panel-card">
              <div class="report-preview__panel-kicker">Quick action</div>
              <div class="report-preview__panel-title">Service Report</div>
              <div class="report-preview__panel-text">
                Preview the generated field report, download a PDF, or send a copy.
              </div>
            </div>

            <div class="report-preview__section-title">Recipient</div>

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

            <div class="report-preview__actions">
              <v-btn
                block
                depressed
                color="teal darken-2"
                dark
                :loading="sendBTNDisbled"
                :disabled="sendBTNDisbled"
                @click="Emailvalidation"
              >
                <v-icon left size="18">send</v-icon>
                Send to Email
              </v-btn>

              <v-btn block outlined color="teal darken-2" class="mt-3" :disabled="loading" @click="LoadPdf">
                <v-icon left size="18">file_download</v-icon>
                Download PDF
              </v-btn>
            </div>

            <div class="report-preview__hint">
              <v-icon size="16" color="blue-grey lighten-1">info</v-icon>
              <span>Preview and download use the latest report layout.</span>
            </div>
          </aside>

          <main class="report-preview__viewer">
            <div v-if="loading" class="report-preview__state">
              <v-progress-circular indeterminate color="teal darken-2"></v-progress-circular>
              <span>Preparing report preview...</span>
            </div>

            <div v-else-if="previewError" class="report-preview__state report-preview__state--error">
              <v-icon size="44" color="red lighten-1">error_outline</v-icon>
              <span>{{ previewError }}</span>
              <v-btn small depressed color="teal darken-2" dark @click="PrintPreview">Try again</v-btn>
            </div>

            <div v-else-if="!pdfsrc" class="report-preview__state">
              <v-icon size="44" color="blue-grey lighten-1">picture_as_pdf</v-icon>
              <span>No preview loaded yet</span>
            </div>

            <div v-else class="report-preview__document-shell">
              <div class="report-preview__document-toolbar">
                <span>PDF Preview</span>
                <span>{{ CurThreadDetails.TRDMTT || '' }}</span>
              </div>
              <div class="report-preview__document">
                <pdf :src="pdfsrc"></pdf>
              </div>
            </div>
          </main>
        </div>

        <div class="report-preview__renderer" aria-hidden="true">
          <field-report ref="fieldReportRenderer" embedded></field-report>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import pdf from 'vue-pdf'
import { mapState } from 'vuex'
import axios from 'axios'
import fieldReport from '@/reports/engineer/field/fieldReports.vue'

export default {
  components: {
    fieldReport,
    pdf,
  },
  data() {
    return {
      sendBTNDisbled: false,
      loading: false,
      dialog: false,
      pdfsrc: null,
      previewError: '',
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
    clientName() {
      return this.CurClientDetails.ACCMNM || this.CurClientDetails.ACCMSC || 'Customer'
    },
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
    async buildLocalReportPdf() {
      await this.$nextTick()
      const renderer = this.$refs.fieldReportRenderer
      if (!renderer || typeof renderer.renderReportPdf !== 'function') {
        throw new Error('Local report renderer is not ready.')
      }
      return renderer.renderReportPdf()
    },
    async LoadPdf() {
      this.previewError = ''
      this.loading = true
      try {
        const pdfDoc = await this.buildLocalReportPdf()
        pdfDoc.save(`${this.CurThreadDetails.TRDMTT}.pdf`)
      } catch (error) {
        this.previewError = 'Unable to generate the local field report PDF.'
        console.error('Local PDF Download Error:', error)
        alert(error)
      } finally {
        this.loading = false
      }
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
    async PrintPreview() {
      this.loading = true
      this.previewError = ''

      try {
        const pdfDoc = await this.buildLocalReportPdf()
        const blob = pdfDoc.output('blob')

        if (this.pdfsrc) {
          URL.revokeObjectURL(this.pdfsrc)
        }

        this.pdfsrc = URL.createObjectURL(blob)
      } catch (error) {
        this.pdfsrc = null
        this.previewError = 'Unable to prepare the local field report preview.'
        console.error('Local PDF Preview Error:', error)
        alert(error)
      } finally {
        this.loading = false
      }
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
  background: #f3f7f8;
}

.report-preview__toolbar {
  flex: 0 0 auto;
  padding: 0 18px;
  background: linear-gradient(135deg, #00695c 0%, #00897b 100%);
  box-shadow: 0 4px 18px rgba(0, 77, 64, 0.22);
}

.report-preview__brand {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
}

.report-preview__icon {
  display: inline-flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.14);
}

.report-preview__title {
  display: flex;
  min-width: 0;
  flex-direction: column;
  line-height: 1.2;
}

.report-preview__title span {
  font-size: 18px;
  font-weight: 800;
}

.report-preview__title small {
  color: rgba(255, 255, 255, 0.82);
  font-size: 12px;
  max-width: 520px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.report-preview__meta {
  margin-left: 18px;
}

.report-preview__chip {
  display: inline-flex;
  min-height: 28px;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  padding: 0 12px;
  background: rgba(255, 255, 255, 0.13);
  color: #fff;
  font-size: 12px;
  font-weight: 800;
}

.report-preview__content {
  display: grid;
  flex: 1 1 auto;
  min-height: 0;
  grid-template-columns: 340px minmax(0, 1fr);
}

.report-preview__panel {
  padding: 22px;
  border-right: 1px solid #d9e2ec;
  background: #fff;
}

.report-preview__panel-card {
  border: 1px solid #dbe7ed;
  border-radius: 8px;
  padding: 16px;
  background: #f8fbfc;
}

.report-preview__panel-kicker {
  margin-bottom: 5px;
  color: #00796b;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.report-preview__panel-title {
  color: #102a43;
  font-size: 18px;
  font-weight: 800;
}

.report-preview__panel-text {
  margin: 8px 0 0;
  color: #62748a;
  font-size: 13px;
  line-height: 1.5;
}

.report-preview__section-title {
  margin: 22px 0 10px;
  color: #334e68;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

.report-preview__field {
  margin-bottom: 14px;
}

.report-preview__actions {
  margin-top: 8px;
}

.report-preview__hint {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 18px;
  border-top: 1px solid #edf2f7;
  padding-top: 14px;
  color: #62748a;
  font-size: 12px;
  line-height: 1.45;
}

.report-preview__viewer {
  position: relative;
  min-width: 0;
  overflow: auto;
  padding: 28px 32px;
  background: radial-gradient(circle at top left, rgba(0, 137, 123, 0.08), transparent 30%),
    linear-gradient(180deg, #eef5f7 0%, #f8fafb 100%);
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

.report-preview__state--error {
  color: #9b1c1c;
  text-align: center;
}

.report-preview__document-shell {
  width: min(100%, 920px);
  margin: 0 auto;
}

.report-preview__document-toolbar {
  display: flex;
  min-height: 42px;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #d7e2e8;
  border-bottom: 0;
  border-radius: 8px 8px 0 0;
  padding: 0 14px;
  background: #fff;
  color: #334e68;
  font-size: 12px;
  font-weight: 800;
}

.report-preview__document {
  min-height: calc(100vh - 150px);
  overflow: hidden;
  border: 1px solid #d7e2e8;
  border-radius: 0 0 8px 8px;
  background: #fff;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.16);
}

.report-preview__renderer {
  position: fixed;
  top: 0;
  left: -12000px;
  width: 9in;
  height: 12in;
  overflow: hidden;
  pointer-events: none;
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

  .report-preview__meta {
    display: none;
  }

  .report-preview__viewer {
    padding: 14px;
  }
}
</style>
