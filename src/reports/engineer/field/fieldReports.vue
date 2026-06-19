<template>
  <v-container fluid class="report-wrapper pa-4">
    <div class="no-print" style="text-align: right; margin-bottom: 10px">
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
          <section class="report-company">
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

          <section class="report-service">
            <div class="service-row">
              <span>CALL DATE &amp; TIME</span>
              <b>:</b>
              <strong>{{ isValidDate(reportHeader.callDateTime) ? reportHeader.callDateTime : '' }}</strong>
            </div>
            <div class="service-row">
              <span>SERVICE BY</span>
              <b>:</b>
              <strong>{{ serviceByName }}</strong>
            </div>
            <div class="service-row">
              <span>WORK WITH</span>
              <b>:</b>
              <strong>{{ workWithText }}</strong>
            </div>
            <div class="service-row">
              <span>INSTRUMENT</span>
              <b>:</b>
              <strong>{{ sentenceCase(reportHeader.instrumentModelID) }}</strong>
            </div>
            <div class="meter-row">
              <span>METER READING</span>
              <b>:</b>
            </div>
            <div class="meter-values">
              <span>Arrival : {{ CurSRDetails.meterReading ? CurSRDetails.meterReading.arrival : '' }}</span>
              <span>Departure : {{ CurSRDetails.meterReading ? CurSRDetails.meterReading.departure : '' }}</span>
            </div>
            <div class="meter-box"></div>
          </section>
        </div>

        <div class="customer-grid">
          <div class="customer-left">
            <div class="field-row">
              <span>CUSTOMER NAME</span>
              <b>:</b>
              <strong>{{ sentenceCase(CurClientDetails.ACCMNM) }}</strong>
            </div>
            <div class="field-row">
              <span>ADDRESS</span>
              <b>:</b>
              <strong>{{ sentenceCase(CurClientDetails.ACCMAD) }}</strong>
            </div>
          </div>
          <div class="service-type-box">
            <div class="section-label">SERVICE TYPE</div>
            <div class="service-type-value">
              {{
                sentenceCase(
                  (CurSRDetails.serviceTypes &&
                    CurSRDetails.serviceTypes[0] &&
                    CurSRDetails.serviceTypes[0].srTypeDescription) ||
                    ''
                )
              }}
            </div>
          </div>
        </div>

        <section class="purpose-box">
          <div class="section-label">PURPOSE OF VISIT</div>
          <div class="purpose-list">
            <div v-for="pv in CurSRDetails.purposeOfVisits || []" :key="pv.pvid">
              {{ sentenceCase(pv.pvDescription) }}
              <span v-if="pv.pvRemarks">- {{ sentenceCase(pv.pvRemarks) }}</span>
            </div>
          </div>
        </section>

        <section class="action-grid">
          <div class="action-box">
            <div class="section-label">ACTION TAKEN</div>
            <div class="action-list">
              <div v-for="(action, i) in normalActionList" :key="'action-' + i">
                {{ sentenceCase(action.atDescription) }}
                <span v-if="action.atDescription === 'OTHERS' && action.atRemarks">
                  - {{ sentenceCase(action.atRemarks) }}
                </span>
              </div>
            </div>
          </div>
          <div class="tested-box">
            <div class="section-label">TESTED PARTS</div>
            <div class="tested-header">
              <span>PART NUMBER</span>
              <span>DESCRIPTION</span>
            </div>
            <div v-for="(tp, idx) in testedPartsList" :key="'tp-' + idx" class="tested-row">
              <span>{{ formatTestedParts(tp).partNumber }}</span>
              <span>{{ sentenceCase(formatTestedParts(tp).description) }}</span>
            </div>
          </div>
        </section>

        <section class="remarks-box">
          <div class="section-label">SIGNIFICANT REMARKS :</div>
          <div class="remarks-text">
            {{ CurSRDetails.remarks != null ? sentenceCase(CurSRDetails.remarks.srRemarks) : '' }}
          </div>
        </section>

        <section class="parts-box">
          <div class="section-label">PARTS USED</div>
          <div class="parts-header">
            <span>QTY</span>
            <span>PART NUMBER</span>
            <span>DESCRIPTION</span>
          </div>
          <div v-for="(part, idx) in CurSRDetails.partsUsed || []" :key="'part-' + idx" class="parts-row">
            <span>{{ part.puqty }}</span>
            <span>{{ part.puPartNo }}</span>
            <span>{{ sentenceCase(part.puDescription) }}</span>
          </div>
        </section>

        <section class="bottom-grid">
          <div class="result-box">
            <div class="section-label">RESULT</div>
          </div>
          <div class="result-box result-box--middle">
            <div class="section-label">RESULT</div>
            <div class="result-value">
              :
              {{
                sentenceCase(
                  (CurSRDetails.results && CurSRDetails.results[0] && CurSRDetails.results[0].srResultDescription) || ''
                )
              }}
            </div>
          </div>
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
      </div>

      <div class="report-page-footer">
        <span class="report-page-count">Page 1 of 1</span>
        <span class="report-sr-number">
          SR No.<strong>{{ reportHeader.srid || '' }}</strong>
        </span>
      </div>
    </div>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'ServiceReport',
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
    normalActionList() {
      return (this.CurSRDetails.actionTakens || []).filter(a => a.atDescription !== 'TESTED PARTS')
    },
    testedPartsList() {
      return (this.CurSRDetails.actionTakens || []).filter(a => a.atDescription === 'TESTED PARTS')
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
      const reportEl = document.getElementById('printSection')
      if (!reportEl) throw new Error('Report section not found!')

      const wrapper = document.createElement('div')
      wrapper.style.display = 'inline-block'
      wrapper.style.background = 'white'
      wrapper.style.padding = '6px'
      wrapper.style.boxSizing = 'border-box'
      const cloned = reportEl.cloneNode(true)

      const imgs = cloned.querySelectorAll('img, .v-img')
      imgs.forEach(el => {
        try {
          if (el.tagName === 'IMG') {
            el.style.maxWidth = '300px'
            el.style.height = 'auto'
          } else {
            const inner = el.querySelector('img')
            if (inner) {
              inner.style.maxWidth = '300px'
              inner.style.height = 'auto'
            }
          }
        } catch (e) {
          /* ignore */
        }
      })

      cloned.style.fontSize = '12px'

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
  min-height: 11in;
  padding: 0.42in 0.36in 0.22in;
  color: #111;
  background: #fff;
  box-sizing: border-box;
}

.report-sheet {
  display: flex;
  min-height: 10.08in;
  flex-direction: column;
  border: 2px solid #111;
  background: #fff;
}

.report-top {
  display: grid;
  min-height: 1.78in;
  grid-template-columns: 56% 44%;
  border-bottom: 2px solid #111;
}

.report-company {
  padding: 14px 14px 10px;
  border-right: 2px solid #111;
}

.report-logo {
  display: block;
  width: 3.65in;
  max-width: 100%;
  height: auto;
  margin-bottom: 6px;
}

.office-block {
  margin-top: 8px;
  padding-left: 2px;
  font-size: 10.5px;
  font-weight: 600;
  line-height: 1.55;
}

.office-block--davao {
  margin-top: 14px;
}

.office-title,
.section-label {
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.office-title {
  text-transform: none;
}

.office-line {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.report-service {
  padding: 10px 0 0;
  font-size: 11px;
  font-weight: 700;
}

.service-row {
  display: grid;
  min-height: 22px;
  grid-template-columns: 138px 14px 1fr;
  align-items: end;
  padding: 0 0 0 12px;
}

.service-row strong {
  min-height: 18px;
  padding-left: 6px;
  border-bottom: 2px solid #111;
  font-size: 11px;
  line-height: 18px;
}

.meter-row {
  display: grid;
  grid-template-columns: 138px 14px 1fr;
  padding: 14px 0 0 12px;
}

.meter-values {
  display: flex;
  justify-content: center;
  gap: 82px;
  padding: 10px 12px 8px;
  font-size: 11px;
}

.meter-box {
  height: 47px;
  margin: 0 3px 2px 10px;
  border: 2px solid #111;
}

.customer-grid {
  display: grid;
  min-height: 0.62in;
  grid-template-columns: 56% 44%;
  border-bottom: 2px solid #111;
}

.customer-left {
  border-right: 2px solid #111;
}

.field-row {
  display: grid;
  min-height: 31px;
  grid-template-columns: 128px 18px 1fr;
  align-items: center;
  padding: 0 14px;
  border-bottom: 1px solid #777;
}

.field-row:last-child {
  border-bottom: 0;
}

.field-row span,
.field-row b {
  font-size: 12px;
  font-weight: 800;
}

.field-row strong {
  font-size: 16px;
  font-weight: 500;
}

.service-type-box {
  padding: 9px 12px;
}

.service-type-value {
  margin-top: 24px;
  font-size: 13px;
  font-weight: 700;
}

.purpose-box {
  min-height: 0.58in;
  padding: 12px 14px;
  border-bottom: 2px solid #111;
}

.purpose-list,
.action-list {
  margin-top: 14px;
  padding-left: 16px;
  font-size: 14px;
  line-height: 1.55;
}

.action-grid {
  display: grid;
  min-height: 1.12in;
  grid-template-columns: 56% 44%;
  border-bottom: 2px solid #111;
}

.action-box {
  padding: 8px 14px;
  border-right: 2px solid #111;
}

.tested-box {
  padding: 8px 12px;
}

.tested-header,
.tested-row {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 18px;
}

.tested-header {
  margin-top: 16px;
  font-size: 12px;
  font-weight: 800;
  text-decoration: underline;
}

.tested-row {
  margin-top: 8px;
  font-size: 12px;
}

.remarks-box {
  min-height: 0.46in;
  padding: 7px 14px 10px;
  border-bottom: 2px solid #111;
}

.remarks-text {
  margin-top: 9px;
  padding-left: 14px;
  font-size: 16px;
  line-height: 1.35;
}

.parts-box {
  flex: 1 1 auto;
  min-height: 3.62in;
  padding: 8px 14px;
  border-bottom: 2px solid #111;
}

.parts-header,
.parts-row {
  display: grid;
  grid-template-columns: 100px 210px 1fr;
  gap: 12px;
  padding-left: 66px;
}

.parts-header {
  margin-top: 14px;
  font-size: 12px;
  font-weight: 800;
  text-decoration: underline;
}

.parts-row {
  margin-top: 8px;
  font-size: 12px;
}

.bottom-grid {
  display: grid;
  min-height: 1.55in;
  grid-template-columns: 31% 28% 41%;
}

.result-box {
  padding: 14px;
  border-right: 2px solid #111;
}

.result-box--middle {
  position: relative;
}

.result-value {
  margin-top: 26px;
  text-align: center;
  font-size: 13px;
}

.acceptance-box {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 12px 14px 16px;
  text-align: center;
}

.acceptance-signature {
  position: absolute;
  right: 16px;
  bottom: 52px;
  max-width: 190px;
  max-height: 58px;
  object-fit: contain;
}

.acceptance-name,
.acceptance-time {
  position: relative;
  z-index: 1;
  font-size: 13px;
  font-weight: 700;
}

.acceptance-time {
  margin-top: 4px;
}

.report-page-footer {
  position: relative;
  height: 22px;
  font-size: 14px;
  line-height: 22px;
}

.report-page-count {
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
}

.report-sr-number {
  position: absolute;
  right: 0;
  font-weight: 800;
}

.report-sr-number strong {
  color: #f00;
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
