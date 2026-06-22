<template>
  <v-container fluid class="report-wrapper pa-4" :class="{ 'report-wrapper--embedded': embedded }">
    <div v-if="!embedded" class="no-print" style="text-align: right; margin-bottom: 10px">
      <v-btn @click="generatePDF">📄 Download PDF</v-btn>
      <v-btn color="success" @click="emailPDF">📧 Email PDF</v-btn>
      <div style="margin-top: 8px; max-width: 420px; margin-left: auto">
        <v-combobox
          class="recipient-combobox"
          v-model="emailRecipients"
          :items="availableClientEmails"
          multiple
          chips
          small-chips
          deletable-chips
          clearable
          dense
          label="Recipient Emails"
          placeholder="Add email and press Enter"
          :rules="[emailListRule]"
          :hide-details="true"
          style="width: 100%"
        ></v-combobox>
      </div>
    </div>

    <div id="printSection" class="report-container">
      <div class="report-sheet">
        <div class="report-top">
          <section class="report-company report-pad">
            <img :src="require('@/assets/logoMDMPI.png')" class="report-logo" />

            <div class="office-block">
              <div class="office-title">Main Office:</div>
              <div>G/F Molave Bldg., 2231 Chino Roces Ave., Makati City, Phils 1233</div>
              <div>Tel. No. +63.2.751.9999; Directline +63.2.813.8617</div>
              <div>Fax +63.2.817.8405; e-mail: service@marsmandrysdale.com</div>
            </div>

            <div class="office-block office-block--davao">
              <div class="office-title">Davao Office:</div>
              <div>G/F Door #4 MK Central Bldg., JP Laurel Ave., Bajada, Davao City</div>
              <div class="office-line">
                <span>Tel No. +63.2.751.9999 local 4075</span>
                <span>Hotline No. +63.908.888.0000</span>
              </div>
            </div>
          </section>

          <section class="report-service report-pad">
            <div class="compact-row">
              <span>Service By</span>
              <b>:</b>
              <strong>{{ serviceByName }}</strong>
            </div>
            <div class="compact-row">
              <span>Instrument</span>
              <b>:</b>
              <strong>{{ sentenceCase(reportHeader.instrumentModelID) }}</strong>
            </div>
            <div class="compact-row">
              <span>Arrival</span>
              <b>:</b>
              <strong>{{ CurSRDetails.meterReading ? CurSRDetails.meterReading.arrival : '' }}</strong>
            </div>
            <div class="compact-row">
              <span>Departure</span>
              <b>:</b>
              <strong>{{ CurSRDetails.meterReading ? CurSRDetails.meterReading.departure : '' }}</strong>
            </div>
          </section>
        </div>

        <section class="report-row report-row--customer">
          <div class="report-field">
            <div class="report-label">Customer Name</div>
            <div class="report-value">{{ sentenceCase(CurClientDetails.ACCMNM) }}</div>
          </div>
          <div class="report-field">
            <div class="report-label">Address</div>
            <div class="report-value">{{ sentenceCase(CurClientDetails.ACCMAD) }}</div>
          </div>
        </section>

        <section class="report-row report-row--service">
          <div class="report-field">
            <div class="report-label">Service Type</div>
            <div class="report-value">{{ serviceTypeText }}</div>
          </div>
          <div class="report-field">
            <div class="report-label">Purpose of Visit</div>
            <div class="report-value">
              <div v-for="pv in CurSRDetails.purposeOfVisits || []" :key="pv.pvid">
                {{ sentenceCase(pv.pvDescription) }}
                <span v-if="pv.pvRemarks">- {{ sentenceCase(pv.pvRemarks) }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="report-section report-section--action">
          <div class="report-label">Action Taken</div>
          <div class="report-value">
            <div v-for="(action, i) in normalActionList" :key="'action-' + i">
              {{ i + 1 }}.
              {{ sentenceCase(action.atDescription) }}
              <span v-if="action.atDescription === 'OTHERS' && action.atRemarks">
                - {{ sentenceCase(action.atRemarks) }}
              </span>
            </div>
          </div>
        </section>

        <section class="report-section report-section--remarks">
          <div class="report-label">Significant Remarks</div>
          <div class="report-value">
            {{ CurSRDetails.remarks != null ? sentenceCase(CurSRDetails.remarks.srRemarks) : '' }}
          </div>
        </section>

        <section v-if="!isPsServiceBy" class="report-section report-section--parts">
          <div class="report-label">Parts Used</div>
          <div class="parts-table">
            <div class="parts-header">
              <span>Description</span>
              <span>Part Number</span>
              <span>Serial Number</span>
              <span>Qty</span>
            </div>
            <div v-if="!reportPartsUsed.length" class="parts-empty">No parts used</div>
            <div v-for="(part, idx) in reportPartsUsed" :key="'part-' + idx" class="parts-row">
              <span>{{ sentenceCase(part.puDescription) }}</span>
              <span>{{ part.puPartNo }}</span>
              <span>{{ part.puSerialNo }}</span>
              <span>{{ part.puqty }}</span>
            </div>
          </div>
        </section>

        <section class="report-section report-section--acceptance">
          <div class="acceptance-box">
            <img
              v-if="CurSRDetails.footerSignature && CurSRDetails.footerSignature.srFooterAcceptance"
              :src="CurSRDetails.footerSignature.srFooterAcceptance"
              class="acceptance-signature"
            />
            <div class="acceptance-name">
              {{ sentenceCase((CurSRDetails.footer && CurSRDetails.footer.customerUserID) || '') }}
            </div>
            <div class="acceptance-time">{{ (CurSRDetails.footer && CurSRDetails.footer.srfDateTimeIn) || '' }}</div>
            <div class="acceptance-time">{{ (CurSRDetails.footer && CurSRDetails.footer.srfDateTimeOut) || '' }}</div>
          </div>
        </section>

        <section class="report-bottom">
          <div class="report-bottom-row">
            Result:
            <strong>{{ resultText }}</strong>
          </div>
          <div class="report-bottom-row">
            SR No.:
            <strong class="report-sr-number">{{ reportHeader.srid || CurThreadDetails.TRDMTT || '' }}</strong>
          </div>
        </section>
      </div>
    </div>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'ServiceReport',
  props: {
    embedded: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      // content placeholders
      logoUrl: '',
      company: {
        name: 'MARSMANDRYSDALE',
        address: 'G/F Molave Bldg., 2231 Chino Roces Ave., Makati City, Phils 1233',
      },

      mainOffice: {},
      davaoOffice: {},
      serviceDetails: {},
      customer: {},
      actions: [],
      remarks: [],
      partsHeaders: [
        { text: 'Description', value: 'puDescription', sortable: false },
        { text: 'Part Number', value: 'puPartNo', sortable: false },
        { text: 'Qty', value: 'puqty', sortable: false },
      ],
      parts: [],
      preparedBy: {},
      customerAcceptance: '',
      srNo: '',
      result: '',
      workStatus: '',
      serviceBy: '',
      emailRecipients: [],
      availableClientEmails: [],
    }
  },
  mounted() {
    this.initEmailRecipientsFromStore()
  },
  computed: {
    ...mapState(['CurThreadDetails', 'CurSRDetails', 'CurClientDetails']),
    reportHeader() {
      return this.CurSRDetails.header || {}
    },
    serviceByName() {
      return this.CurThreadDetails.TRDMUI ? this.sentenceCase(this.CurThreadDetails.TRDMUI.CNTMCN) : ''
    },
    serviceByRole() {
      return this.CurThreadDetails.TRDMUI ? this.CurThreadDetails.TRDMUI.CNTSEC : ''
    },
    isPsServiceBy() {
      return this.serviceByRole === 'PS'
    },
    reportPartsUsed() {
      if (this.isPsServiceBy) return []
      return this.CurSRDetails.partsUsed || []
    },
    normalActionList() {
      return (this.CurSRDetails.actionTakens || []).filter(a => a.atDescription !== 'TESTED PARTS')
    },
    testedPartsList() {
      return (this.CurSRDetails.actionTakens || []).filter(a => a.atDescription === 'TESTED PARTS')
    },
    serviceTypeText() {
      return this.sentenceCase(
        (this.CurSRDetails.serviceTypes &&
          this.CurSRDetails.serviceTypes[0] &&
          this.CurSRDetails.serviceTypes[0].srTypeDescription) ||
          ''
      )
    },
    resultText() {
      if (this.isPsServiceBy) return 'Work Complete'
      return this.sentenceCase(
        (this.CurSRDetails.results &&
          this.CurSRDetails.results[0] &&
          this.CurSRDetails.results[0].srResultDescription) ||
          ''
      )
    },
    workWithText() {
      const workWith = this.CurSRDetails.workWith || []
      if (!Array.isArray(workWith) || workWith.length === 0) return ''
      if (workWith[0].userInitials === '1') return ''
      return workWith
        .map(user => user.userInitials)
        .filter(Boolean)
        .join(' / ')
    },
  },
  watch: {
    CurClientDetails: {
      handler() {
        this.initEmailRecipientsFromStore()
      },
      deep: true,
    },
  },
  methods: {
    initEmailRecipientsFromStore() {
      const src = this.CurClientDetails && this.CurClientDetails.ACCMEM
      if (!src) {
        this.availableClientEmails = []
        return
      }
      const emails = String(src)
        .split(/[;,]+/)
        .map(s => s.trim())
        .filter(Boolean)
      this.availableClientEmails = Array.from(new Set(emails))
    },
    emailListRule(val) {
      if (!val || (Array.isArray(val) && val.length === 0)) return true
      const emails = Array.isArray(val)
        ? val
        : String(val)
            .split(/[;,]+/)
            .map(s => s.trim())
            .filter(Boolean)
      const re =
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i
      for (let e of emails) {
        if (!re.test(e)) return 'Invalid email: ' + e
      }
      return true
    },
    formatTestedParts(item) {
      if (!item.atRemarks || item.atRemarks === 'undefined - undefined') {
        return { partNumber: '', description: '' }
      }
      const [partNumber, description] = item.atRemarks.split(' - ')
      return {
        partNumber: partNumber && partNumber !== 'undefined' ? partNumber : '',
        description: description && description !== 'undefined' ? description : '',
      }
    },
    sentenceCase(value) {
      if (value === null || value === undefined) return ''
      if (typeof value !== 'string') return value

      const trimmed = value.trim()
      if (!trimmed) return ''

      const words = trimmed.split(/\s+/)
      const titled = words
        .map(w => {
          return w
            .split(/([-\/_.])/)
            .map(part => {
              if (part === '-' || part === '/' || part === '_' || part === '.') return part
              const lower = part.toLowerCase()
              return lower.charAt(0).toUpperCase() + lower.slice(1)
            })
            .join('')
        })
        .join(' ')

      return titled
    },
    isValidDate(value) {
      if (!value) return false

      const val = String(value).trim()

      if (val === '01/01/0001 00:00:00') return false

      const date = new Date(val)
      return date instanceof Date && !isNaN(date.getTime())
    },
    async renderReportPdf() {
      const reportEl = this.$el.querySelector('#printSection') || document.getElementById('printSection')
      if (!reportEl) throw new Error('Report section not found!')

      const wrapper = document.createElement('div')
      wrapper.style.display = 'inline-block'
      wrapper.style.background = 'white'
      wrapper.style.padding = '0'
      wrapper.style.boxSizing = 'border-box'
      const cloned = reportEl.cloneNode(true)

      cloned.style.fontSize = '10px'

      wrapper.appendChild(cloned)
      document.body.appendChild(wrapper)

      const CANVAS_SCALE = 2.5
      const IMAGE_TYPE = 'image/jpeg'
      const MAX_SIZE_BYTES = 1 * 1024 * 1024

      try {
        const canvas = await html2canvas(wrapper, { scale: CANVAS_SCALE, useCORS: true, backgroundColor: '#ffffff' })

        const { jsPDF } = window.jspdf

        const tmpPdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
        const pageWidth = tmpPdf.internal.pageSize.getWidth()
        const pageHeight = tmpPdf.internal.pageSize.getHeight()

        const imgWidthInPdf = pageWidth
        const pixelsPerMm = canvas.width / imgWidthInPdf
        const pageHeightPx = Math.floor(pageHeight * pixelsPerMm)

        const buildPdfForQuality = quality => {
          const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter', compress: true })

          let yOffset = 0
          while (yOffset < canvas.height) {
            const sliceHeight = Math.min(pageHeightPx, canvas.height - yOffset)

            const sliceCanvas = document.createElement('canvas')
            sliceCanvas.width = canvas.width
            sliceCanvas.height = sliceHeight
            const ctx = sliceCanvas.getContext('2d')
            ctx.drawImage(canvas, 0, yOffset, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight)

            const sliceData = sliceCanvas.toDataURL(IMAGE_TYPE, quality)

            const sliceHeightInMm = sliceHeight / pixelsPerMm
            pdf.addImage(sliceData, 'JPEG', 0, 0, pageWidth, sliceHeightInMm)

            yOffset += sliceHeight
            if (yOffset < canvas.height) pdf.addPage()
          }

          const blob = pdf.output('blob')
          return { pdf, blob }
        }

        let minQ = 3.4
        let maxQ = 5.98
        let bestPdf = null
        let bestSize = Infinity

        const maxIterations = 6
        for (let i = 0; i < maxIterations; i++) {
          const midQ = +((minQ + maxQ) / 2).toFixed(3)
          try {
            const { pdf, blob } = buildPdfForQuality(midQ)
            const size = blob ? blob.size : Infinity

            if (size <= MAX_SIZE_BYTES) {
              bestPdf = pdf
              bestSize = size
              minQ = midQ
              if (Math.abs(maxQ - minQ) < 0.01) break
            } else {
              maxQ = midQ
            }
          } catch (e) {
            maxQ = midQ
          }
        }

        if (bestPdf) return bestPdf

        const fallback = buildPdfForQuality(minQ)
        return fallback.pdf
      } finally {
        document.body.removeChild(wrapper)
      }
    },
    async generatePDF() {
      try {
        const pdf = await this.renderReportPdf()
        const fileName = `${this.CurSRDetails.header.srid}.pdf`
        pdf.save(fileName)
      } catch (err) {
        console.error('PDF Generation Error:', err)
      }
    },
    async emailPDF() {
      try {
        const pdf = await this.renderReportPdf()

        if (!this.emailRecipients || !this.emailRecipients.length) {
          alert('Please provide at least one recipient email before sending.')
          return
        }

        const pdfBlob = pdf.output('blob')

        const form = new FormData()
        form.append('file', pdfBlob, `${this.CurSRDetails.header.srid}.pdf`)
        form.append('recipients', this.emailRecipients.join(','))
        form.append('srid', this.CurSRDetails.header.srid || '')

        const response = await fetch('https://your-api-endpoint.com/send-report', {
          method: 'POST',
          body: form,
        })

        if (!response.ok) {
          const text = await response.text().catch(() => '')
          throw new Error('Failed to send PDF to API: ' + (text || response.statusText))
        }

        alert('PDF sent successfully to API!')
      } catch (err) {
        console.error('Send PDF Error:', err)
        alert('Failed to send PDF via API. See console for details.')
      }
    },
  },
}
</script>

<style scoped>
.report-wrapper,
.report-container,
.report-container * {
  font-family: Arial, Helvetica, sans-serif !important;
}

.report-wrapper {
  display: flex;
  justify-content: center;
  background: #eef2f5;
}

.report-container {
  width: 8.5in;
  height: 11in;
  padding: 0.12in 0.16in;
  color: #111;
  background: #fff;
  box-sizing: border-box;
}

.report-sheet {
  display: flex;
  height: 100%;
  flex-direction: column;
  border: 1px solid #111;
  background: #fff;
  box-sizing: border-box;
  font-size: 10px;
  line-height: 1.32;
}

.report-top {
  display: grid;
  min-height: 2.5in;
  grid-template-columns: 50.5% 49.5%;
  border-bottom: 1px solid #111;
}

.report-pad {
  padding: 0.14in 0.13in 0.1in;
}

.report-company {
  border-right: 1px solid #111;
}

.report-logo {
  display: block;
  width: 3.08in;
  max-width: 100%;
  height: auto;
  margin-bottom: 0.08in;
}

.office-block {
  margin-top: 0.04in;
  font-size: 9px;
  line-height: 1.35;
}

.office-block--davao {
  margin-top: 0.11in;
}

.office-line {
  display: flex;
  gap: 0.18in;
}

.report-service {
  font-size: 10px;
}

.compact-row {
  display: grid;
  grid-template-columns: 0.88in 0.08in 1fr;
  margin-bottom: 0.07in;
}

.compact-row span,
.compact-row b {
  font-weight: 700;
}

.report-row {
  display: grid;
  grid-template-columns: 50.5% 49.5%;
  min-height: 0.86in;
  border-bottom: 1px dashed #888;
}

.report-row--service {
  min-height: 1.02in;
}

.report-field {
  padding: 0.11in 0.13in 0.08in;
}

.report-label {
  margin-bottom: 0.03in;
  font-size: 10px;
  font-weight: 700;
}

.report-value {
  min-height: 0.14in;
  font-size: 10px;
}

.report-section {
  padding: 0.11in 0.13in 0.08in;
  border-bottom: 1px dashed #888;
}

.report-section--action {
  min-height: 0.95in;
}

.report-section--remarks {
  min-height: 0.38in;
}

.report-section--parts {
  min-height: 1.5in;
}

.parts-table {
  padding-top: 0.08in;
}

.parts-header,
.parts-row {
  display: grid;
  grid-template-columns: 1.8in 1.95in 1.95in 0.55in;
  column-gap: 0.16in;
  padding: 0 0.18in;
}

.parts-header {
  min-height: 0.23in;
  border-bottom: 1px solid #d6d6d6;
  font-weight: 700;
  text-align: center;
}

.parts-row {
  padding-top: 0.04in;
}

.parts-empty {
  display: inline-block;
  margin: 0.08in 0 0 0.27in;
  padding: 0.03in 0.18in;
  border: 1px solid #aaa;
  color: #555;
}

.report-section--acceptance {
  min-height: 1.85in;
  border-bottom: 1px dashed #888;
}

.acceptance-box {
  width: 2.15in;
  margin-top: 0.07in;
}

.acceptance-signature {
  display: block;
  width: 1.7in;
  max-height: 0.5in;
  margin-bottom: 0.2in;
  object-fit: contain;
}

.acceptance-name,
.acceptance-time {
  font-size: 10px;
}

.acceptance-name {
  margin-bottom: 0.02in;
}

.report-bottom {
  padding: 0.1in 0.16in;
  font-size: 11px;
}

.report-bottom-row + .report-bottom-row {
  margin-top: 0.04in;
}

.report-sr-number {
  color: #f00;
  font-weight: 700;
}

.office-title {
  font-weight: 700;
}

.report-wrapper--embedded {
  padding: 0 !important;
  background: #fff;
}

.recipient-combobox .v-input__slot {
  min-height: 36px;
  overflow: visible;
  position: relative !important;
}

.recipient-combobox .v-combobox__selections {
  display: flex !important;
  flex-direction: column !important;
  align-items: stretch !important;
}

.recipient-combobox .v-combobox__selection {
  flex: 0 0 auto !important;
  width: 100% !important;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.recipient-combobox .v-combobox__input,
.recipient-combobox input[type='text'] {
  width: 100% !important;
  min-width: 120px !important;
}

.recipient-combobox .v-text-field__slot {
  position: relative !important;
  z-index: 3;
  padding-top: 4px;
  padding-bottom: 4px;
}

.recipient-combobox .v-chip {
  max-width: 180px;
  z-index: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media print {
  .no-print {
    display: none !important;
  }

  .report-wrapper {
    padding: 0 !important;
    background: #fff;
  }
}
</style>
