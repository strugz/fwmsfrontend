<template>
  <v-container fluid class="report-wrapper pa-4">
    <div class="no-print" style="text-align: right; margin-bottom: 10px;">
      <v-btn @click="generatePDF">📄 Download PDF</v-btn>
      <v-btn color="success" @click="emailPDF">📧 Email PDF</v-btn>
      <div style="margin-top:8px; max-width:420px; margin-left:auto;">
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
          style="width: 100%;"
        ></v-combobox>
      </div>
    </div>

    <div id="printSection" class="report-container">
      <v-layout row wrap>
        <!-- Offices & contact -->
        <v-layout row wrap>
          <v-flex xs12>
            <img :src="require('@/assets/logoMDMPI.png')" style="width: 450px; height: 70px;" />
            <div>
              <h3 class="headline mb-0">Main Office:</h3>
            </div>
            <div>G/F Molave Bldg., 2231 Chino Roces Ave., Makati City, Phils 1233</div>
            <div>Tel. No. +63.2.7751.9999</div>
            <div>e-mail: service@marsmandrysdale.com</div>
            <h3 class="headline mb-0">Davao Office:</h3>
            <div>G/F Door #4 MK Central Bldg., JP Laurel Ave., Bajada, Davao City</div>
            <div>Tel No. +63.2.7751.9999 local 4075</div>
            <div>Hotline No. +63.908.888.0000</div>
          </v-flex>
        </v-layout>
        <div class="vertical-divider"></div>
        <!-- Service details -->
        <v-layout row wrap>
          <v-flex xs12>
            <template v-if="isValidDate(CurSRDetails.header.callDateTime)">
              <h3 class="headline mb-0">CALL DATE & TIME</h3>
              <div>{{ CurSRDetails.header.callDateTime }}</div>
            </template>
            <h3 class="headline mb-0">SERVICE BY</h3>
            <div>{{ sentenceCase(CurThreadDetails.TRDMUI.CNTMCN) }}</div>
            <h3 class="headline mb-0">Instrument</h3>
            <div>{{ sentenceCase(CurSRDetails.header.instrumentModelID) }}</div>
            <div>Arrival: {{ CurSRDetails.meterReading ? CurSRDetails.meterReading.arrival : '' }}</div>
            <div>Departure: {{ CurSRDetails.meterReading ? CurSRDetails.meterReading.departure : '' }}</div>
          </v-flex>
        </v-layout>
      </v-layout>

      <!-- top divider -->
      <div class="header-divider"></div>

      <!-- Customer -->
      <v-layout row wrap class="section">
        <v-flex xs6>
          <h3 class="headline mb-0">Customer Name</h3>
          <div>{{ sentenceCase(CurClientDetails.ACCMNM) }}</div>
        </v-flex>
        <v-flex xs6>
          <h3 class="headline mb-0">Address</h3>
          <div>{{ sentenceCase(CurClientDetails.ACCMAD) }}</div>
        </v-flex>
      </v-layout>

      <v-layout row wrap class="section">
        <v-flex xs6>
          <h3 class="headline mb-0">Service Type</h3>
          <div>{{ sentenceCase((CurSRDetails.serviceTypes && CurSRDetails.serviceTypes[0] && CurSRDetails.serviceTypes[0].srTypeDescription) || '') }}</div>
        </v-flex>
        <v-flex xs6>
          <h3 class="headline mb-0">Purpose of Visit</h3>
          <div v-for="pv in (CurSRDetails.purposeOfVisits || [])" :key="pv.pvid">
            <v-card-text>
              {{ sentenceCase(pv.pvDescription) }} <span v-if="pv.pvRemarks">- {{ sentenceCase(pv.pvRemarks) }}</span>
            </v-card-text>
          </div>
        </v-flex>
      </v-layout>

      <!-- Action Taken -->
      <v-card flat class="section card-no-elevation compact-actions">
        <v-card-title primary-title>
          <h3 class="headline mb-0">Action Taken</h3>
        </v-card-title>
        <v-card-text>
          <v-layout row wrap>
            <!-- Left: Normal actions -->
            <v-flex xs8>
              <ul class="actions-list">
                <li
                  v-for="(action, i) in (CurSRDetails.actionTakens || []).filter(a => a.atDescription !== 'TESTED PARTS')"
                  :key="'action-' + i"
                >
                  <!-- Show description -->
                  <span class="desc-col wrap-text">
                    {{ sentenceCase(action.atDescription) }}
                  </span>
                  <!-- If it's OTHERS and has remarks, append them -->
                  <span v-if="action.atDescription === 'OTHERS' && action.atRemarks">
                    - {{ sentenceCase(action.atRemarks) }}
                  </span>
                </li>
              </ul>
            </v-flex>

            <!-- Vertical divider -->
            <div class="vertical-divider"></div>

            <!-- Right: Tested Parts plain layout -->
            <v-flex xs4>
              <div v-if="testedPartsList.length">
                <h3 class="headline mb-0">TESTED PARTS</h3>

                <div class="tested-parts-header mt-2">
                  <span class="part-col">PART NUMBER</span>
                  <span class="desc-col">DESCRIPTION</span>
                </div>

                <div v-for="(tp, idx) in testedPartsList" :key="'tp-' + idx" class="tested-parts-row">
                  <span class="part-col">{{ formatTestedParts(tp).partNumber }}</span>
                  <span class="desc-col">{{ sentenceCase(formatTestedParts(tp).description) }}</span>
                </div>
              </div>
            </v-flex>
          </v-layout>
        </v-card-text>
      </v-card>

      <!-- Remarks -->
      <v-card flat class="section card-no-elevation">
        <v-card-title primary-title>
          <h3 class="headline mb-0">Significant Remarks</h3>
        </v-card-title>
        <v-card-text>
          <div v-if="CurSRDetails.remarks != null">{{ sentenceCase(CurSRDetails.remarks.srRemarks) }}</div>
        </v-card-text>
      </v-card>

      <!-- Parts used - table with borders -->
      <v-card flat class="section card-no-elevation compact-box">
        <v-card-title primary-title>
          <h3 class="headline mb-0">Parts Used</h3>
        </v-card-title>

        <v-data-table
          :headers="partsHeaders"
          :items="CurSRDetails.partsUsed || []"
          hide-actions
          class="parts-table"
          disable-sort
        >
          <template slot="items" slot-scope="props">
            <tr>
              <td>{{ sentenceCase(props.item.puDescription) }}</td>
              <td>{{ props.item.puPartNo }}</td>
              <td class="text-right">{{ props.item.puqty }}</td>
            </tr>
          </template>

          <template slot="no-data">
            <tr>
              <td colspan="3">No parts used</td>
            </tr>
          </template>
        </v-data-table>
      </v-card>

      <!-- Footer & signatures -->
      <v-layout row wrap class="section footer-section">
        <v-flex xs6>
          <div class="signature-block">
            <v-img :src="(CurSRDetails.footerSignature && CurSRDetails.footerSignature.srFooterAcceptance) || ''" class="signature-img" />
            <div class="signature-name">
              {{ sentenceCase((CurSRDetails.footer && CurSRDetails.footer.customerUserID) || '') }}
            </div>
          </div>
          <div class="signature-meta">{{ (CurSRDetails.footer && CurSRDetails.footer.srfDateTimeIn) || '' }}</div>
          <div class="signature-meta">{{ (CurSRDetails.footer && CurSRDetails.footer.srfDateTimeOut) || '' }}</div>
        </v-flex>
      </v-layout>

      <div class="bottom-divider"></div>

  <div class="sr-footer">Result: {{ sentenceCase((CurSRDetails.results && CurSRDetails.results[0] && CurSRDetails.results[0].srResultDescription) || '') }}</div>

      <div class="sr-footer">
        SR No.
        <span style="color: red;">
          {{ (CurSRDetails.header && CurSRDetails.header.srid) || '' }}
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
    testedPartsList() {
      return this.CurSRDetails.actionTakens.filter(a => a.atDescription === 'TESTED PARTS')
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
      const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i
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
  font-family: 'Times New Roman', Times, serif !important;
}

.report-wrapper {
  display: flex;
  justify-content: center;
}

.wrap-text {
  flex-wrap: wrap;
  white-space: normal;
}

.report-container {
  width: 8.5in;
  background: white;
  border: 1px solid #222;
  padding: 12px;
}

.header-divider {
  height: 1px;
  background: #000 !important;
  margin: 8px 0;
  border: none;
}

.section {
  margin-bottom: 4px;
  padding-bottom: 4px;
  border-bottom: 1px dashed #ccc;
}

.v-card__title {
  padding: 4px 8px !important;
}

.v-card__text {
  padding: 4px 8px !important;
}

.actions-list {
  margin-top: 0;
}

.card-no-elevation {
  box-shadow: none;
}

.tested-parts-header {
  font-weight: bold;
  display: flex;
  gap: 8px;
  font-size: 13px;
}

.tested-parts-row {
  display: flex;
  gap: 8px;
  font-size: 13px;
}

.compact-actions {
  font-size: 12px;
}

.compact-actions .v-card__title {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}

.compact-actions .actions-list {
  margin: 0;
  padding-left: 14px;
}

.compact-actions .actions-list li {
  margin-bottom: 2px;
  font-size: 12px;
  line-height: 1.2;
}

.compact-actions .tested-parts-header,
.compact-actions .tested-parts-row {
  font-size: 12px;
}

.compact-actions strong {
  font-size: 12px;
}

h3.headline,
.headline.mb-0,
.v-card .headline,
.v-card__title .headline,
.v-card-title .headline,
.section strong,
.compact-box h3.headline,
.compact-actions h3.headline {
  font-family: 'Times New Roman', Times, serif !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  margin: 0 0 2px 0 !important;
  line-height: 1.2 !important;
}

.section strong {
  display: block;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 2px;
}

.part-col {
  width: 100px;
}

.desc-col {
  flex: 1;
}

.parts-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.compact-box {
  padding: 6px !important;
  margin-bottom: 4px !important;
}

.compact-box .v-card__title {
  padding: 2px 6px !important;
}

.compact-box .v-card__text,
.compact-box .v-data-table {
  padding: 2px 6px !important;
}

.compact-box h3.headline {
  margin: 0;
  font-size: 14px;
}

.compact-box .parts-table table td,
.compact-box .parts-table table th {
  padding: 2px 4px;
  font-size: 11px;
  line-height: 1.1;
}

.compact-box .v-card__title {
  margin-bottom: 0;
}

.compact-box .v-card__title + .v-data-table,
.compact-box .v-card__title + .v-card__text + .v-data-table {
  margin-top: 0;
}

.compact-box .v-data-table {
  margin-top: 0;
}

.compact-box .v-data-table .v-data-table__wrapper {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

.compact-box .v-data-table__actions {
  margin: 0;
  padding: 0;
}

.parts-table th,
.parts-table td {
  border: 1px solid #333;
  padding: 4px 6px;
}

.parts-table thead th {
  background: #f7f7f7;
}

.signature-name {
  margin-top: 6px;
  font-weight: 600;
  font-size: 13px;
}

.signature-meta {
  font-size: 11px;
}

.bottom-divider {
  height: 1px;
  background: #ddd;
  margin: 8px 0;
}

.sr-footer {
  font-size: 11px;
  color: #333;
}

.vertical-divider {
  border-left: 1px solid #000;
  height: auto;
  margin: 0 6px;
}

.signature-block {
  position: relative;
  width: 200px;
  height: 80px;
  font-weight: 600;
  font-size: 14px;
  color: #000;
  line-height: 80px;
  user-select: none;
}

.recipient-combobox .v-input__slot {
  min-height: 36px;
}

.recipient-combobox .v-combobox__selections {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.recipient-combobox .v-chip {
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recipient-combobox .v-text-field__slot input {
  min-width: 120px;
}

.recipient-combobox .v-input__slot {
  overflow: visible;
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

.recipient-combobox .v-combobox__input {
  flex: 1 1 auto !important;
  width: 100% !important;
  min-width: 120px !important;
}

.recipient-combobox input[type='text'] {
  min-width: 120px !important;
}

.recipient-combobox .v-input__slot {
  position: relative !important;
}

.recipient-combobox .v-text-field__slot {
  position: relative !important;
  z-index: 3;
  padding-top: 4px;
  padding-bottom: 4px;
}

.recipient-combobox .v-combobox__selection,
.recipient-combobox .v-chip {
  z-index: 1;
}

.signature-name {
  position: relative;
  z-index: 1;
}

.signature-img {
  position: absolute;
  top: 50%;
  left: 0;
  width: 120px;
  height: auto;
  transform: translateY(-50%);
  transform: translateX(-10%);
  pointer-events: none;
  z-index: 2;
}

@media print {
  .no-print {
    display: none !important;
  }
}
</style>
