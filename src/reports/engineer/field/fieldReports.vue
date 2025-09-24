<template>
    <v-container fluid class="report-wrapper pa-4">
        <!-- Print button -->
        <div class="no-print" style="text-align: right; margin-bottom: 10px;">
            <v-btn @click="generatePDF">📄 Download PDF</v-btn>
            <v-btn color="success" @click="emailPDF">📧 Email PDF</v-btn>
        </div>

        <div id="printSection" class="report-container">
            <v-layout row wrap>
                <!-- Offices & contact -->
                <v-layout row wrap>
                    <v-flex xs12>
                        <img :src="require('@/assets/logoMDMPI.png')" style="width: 450px; height: 70px;" />
                        <div><strong>Main Office:</strong></div>
                        <div>G/F Molave Bldg., 2231 Chino Roces Ave., Makati City, Phils 1233</div>
                        <div>Tel. No. +63.2.7751.9999</div>
                        <div>e-mail: service@marsmandrysdale.com</div>
                        <strong>Davao Office:</strong>
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
                            <strong>CALL DATE & TIME</strong>
                            <div>{{ CurSRDetails.header.callDateTime }}</div>
                        </template>
                        <strong>SERVICE BY</strong>
                        <div>{{ sentenceCase(CurThreadDetails.TRDMUI.CNTMCN) }}</div>
                        <strong>Instrument</strong>
                        <div>{{ sentenceCase(CurSRDetails.header.instrumentModelID) }}</div>
                        <div>Arrival: {{ CurSRDetails.meterReading.arrival }}</div>
                        <div>Departure: {{ CurSRDetails.meterReading.departure }}</div>
                    </v-flex>
                </v-layout>
            </v-layout>

            <!-- top divider -->
            <div class="header-divider"></div>


            <!-- Customer -->
            <v-layout row wrap class="section">
                <v-flex xs6>
                    <strong>CUSTOMER NAME</strong>
                    <div>{{ sentenceCase(CurClientDetails.ACCMNM) }}</div>
                </v-flex>
                <v-flex xs6>
                    <strong>ADDRESS</strong>
                    <div>{{ sentenceCase(CurClientDetails.ACCMAD) }}</div>
                </v-flex>
            </v-layout>

            <v-layout row wrap class="section">
                <v-flex xs6>
                    <strong>SERVICE TYPE</strong>
                    <div>{{ sentenceCase(CurSRDetails.serviceTypes[0].srTypeDescription) }}</div>
                </v-flex>
                <v-flex xs6>
                    <strong>PURPOSE OF VISIT</strong>
                    <div v-for="pv in CurSRDetails.purposeOfVisits" :key="pv.pvid">
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
                                <li v-for="(action, i) in CurSRDetails.actionTakens.filter(a => a.atDescription !== 'TESTED PARTS')"
                                    :key="'action-' + i">
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
                                <strong>TESTED PARTS</strong>

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
                    <div>{{ sentenceCase(CurSRDetails.remarks.srRemarks) }}</div>
                </v-card-text>
            </v-card>

            <!-- Parts used - table with borders -->
            <v-card flat class="section card-no-elevation compact-box">
                <v-card-title primary-title>
                    <h3 class="headline mb-0">Parts Used</h3>
                </v-card-title>

                <v-data-table :headers="partsHeaders" :items="CurSRDetails.partsUsed" hide-actions class="parts-table" disable-sort>
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
                        <v-img :src="CurSRDetails.footerSignature.srFooterAcceptance" class="signature-img" />
                        <div class="signature-name">
                            {{ sentenceCase(CurSRDetails.footer.customerUserID) }}
                        </div>
                    </div>
                    <div class="signature-meta">{{ CurSRDetails.footer.srfDateTimeIn }}</div>
                    <div class="signature-meta">{{ CurSRDetails.footer.srfDateTimeOut }}</div>
                </v-flex>
            </v-layout>

            <div class="bottom-divider"></div>

            <div class="sr-footer">Result: {{ sentenceCase(CurSRDetails.results[0].srResultDescription) }}</div>

            <div class="sr-footer">SR No.
                <span style="color: red;">
                    {{ CurSRDetails.header.srid }}
                </span>
            </div>
        </div>
    </v-container>
</template>

<script>
import { mapActions, mapState } from 'vuex'
export default {
    name: 'ServiceReport',
    data() {
        return {
            // content placeholders
            logoUrl: '',
            company: {
                name: 'MARSMANDRYSDALE',
                address: 'G/F Molave Bldg., 2231 Chino Roces Ave., Makati City, Phils 1233'
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
                { text: 'Qty', value: 'puqty', sortable: false }
            ],
            parts: [],
            preparedBy: {},
            customerAcceptance: '',
            srNo: '',
            result: '',
            workStatus: '',
            serviceBy: ""
        }
    },
    computed: {
        ...mapState(['CurThreadDetails', 'CurSRDetails', 'CurClientDetails']),
        testedPartsList() {
            return this.CurSRDetails.actionTakens.filter(a => a.atDescription === 'TESTED PARTS')
        }
    },
    methods: {
        ...mapActions(["getSRDetailsById", "getCNTMSTUserID"]),
        formatTestedParts(item) {
            if (!item.atRemarks || item.atRemarks === 'undefined - undefined') {
                return { partNumber: '', description: '' }
            }
            const [partNumber, description] = item.atRemarks.split(' - ')
            return {
                partNumber: partNumber && partNumber !== 'undefined' ? partNumber : '',
                description: description && description !== 'undefined' ? description : ''
            }
        },
        sentenceCase(value) {
            if (value === null || value === undefined) return '';
            // If it's not a string, just return as-is (numbers, codes)
            if (typeof value !== 'string') return value;

            const trimmed = value.trim();
            if (!trimmed) return '';

            // Lowercase everything then uppercase first letter
            const lower = trimmed.toLowerCase();
            return lower.charAt(0).toUpperCase() + lower.slice(1);
        },
        isValidDate(value) {
            if (!value) return false;

            // Trim spaces and normalize
            const val = String(value).trim();

            // Hide if matches the default "empty" date
            if (val === "01/01/0001 00:00:00") return false;

            // Hide if invalid date
            const date = new Date(val);
            return date instanceof Date && !isNaN(date.getTime());
        },
        // Reusable helper: renders the report section to a jsPDF instance
        async renderReportPdf() {
            const reportEl = document.getElementById('printSection');
            if (!reportEl) throw new Error('Report section not found!');

            const wrapper = document.createElement('div');
            wrapper.style.display = 'inline-block';
            wrapper.style.background = 'white';
            wrapper.style.padding = '10px';
            wrapper.appendChild(reportEl.cloneNode(true));
            document.body.appendChild(wrapper);

            try {
                const canvas = await html2canvas(wrapper, { scale: 2, useCORS: true });
                const imgData = canvas.toDataURL('image/png');
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });

                const pageWidth = pdf.internal.pageSize.getWidth();
                const imgProps = pdf.getImageProperties(imgData);
                const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;

                pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pdfHeight);

                return pdf;
            } finally {
                // Always clean up the wrapper even on error
                document.body.removeChild(wrapper);
            }
        },
        async generatePDF() {
            try {
                const pdf = await this.renderReportPdf();
                const fileName = `${this.CurSRDetails.header.srid}.pdf`;
                pdf.save(fileName);
            } catch (err) {
                console.error('PDF Generation Error:', err);
            }
        },
        async emailPDF() {
            try {
                const pdf = await this.renderReportPdf();

                // Get PDF as Blob
                const pdfBlob = pdf.output('blob');

                // Send the PDF Blob directly to your API
                const response = await fetch('https://your-api-endpoint.com/send-report', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': `attachment; filename="${this.CurSRDetails.header.srid}.pdf"`,
                    },
                    body: pdfBlob,
                });

                if (!response.ok) throw new Error('Failed to send PDF to API');

                alert('PDF sent successfully to API!');
            } catch (err) {
                console.error('Send PDF Error:', err);
                alert('Failed to send PDF via API. See console for details.');
            }
        }


    }
}
</script>

<style scoped>
/* Force Times New Roman for everything inside this component */
.report-wrapper,
.report-container,
.report-container * {
    font-family: "Times New Roman", Times, serif !important;
}

.report-wrapper {
    display: flex;
    justify-content: center;
}

.wrap-text {
    flex-wrap: wrap;
    /* allow flex items to wrap */
    white-space: normal;
}

/* Letter size layout with thinner padding */
.report-container {
    width: 8.5in;
    background: white;
    border: 1px solid #222;
    padding: 12px;
}

/* Divider under header */
.header-divider {
    height: 1px;
    background: #000 !important;
    /* Force visible in print */
    margin: 8px 0;
    border: none;
}

/* Sections separation - thinner */
.section {
    margin-bottom: 4px;
    /* reduce space */
    padding-bottom: 4px;
    /* reduce padding */
    border-bottom: 1px dashed #ccc;
}

.v-card__title {
    padding: 4px 8px !important;
    /* tighten title */
}

.v-card__text {
    padding: 4px 8px !important;
    /* tighten text */
}

.actions-list {
    margin-top: 0;
    /* remove extra list space */
}

.card-no-elevation {
    box-shadow: none;
}

/* Tested parts plain layout */
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

/* Compact styling for the Action Taken card to reduce font sizes and spacing */
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

/* Unified title and subtitle styling: make card titles and section labels consistent */
h3.headline,
.v-card__title .headline,
.v-card-title .headline,
.section strong,
.compact-box h3.headline,
.compact-actions h3.headline {
    font-family: "Times New Roman", Times, serif !important;
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 2px 0;
    line-height: 1.2;
}

/* Ensure strong labels inside sections use the same weight and spacing */
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

/* Compact box modifier - applied to the Parts Used card to save vertical space */
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

/* Remove extra gap between title and table inside the compact box */
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

/* Signature block - compact */
.signature-name {
    margin-top: 6px;
    font-weight: 600;
    font-size: 13px;
}

.signature-meta {
    font-size: 11px;
}

/* Footer */
.bottom-divider {
    height: 1px;
    background: #ddd;
    margin: 8px 0;
}

.sr-footer {
    font-size: 11px;
    color: #333;
}

/* Vertical divider */
.vertical-divider {
    border-left: 1px solid #000;
    height: auto;
    margin: 0 6px;
}

.signature-block {
    position: relative;
    width: 200px;
    /* or your desired width */
    height: 80px;
    /* enough height for the signature */
    font-weight: 600;
    font-size: 14px;
    color: #000;
    line-height: 80px;
    /* vertically center text */
    user-select: none;
}

.signature-name {
    position: relative;
    /* keeps it in normal flow */
    z-index: 1;
    /* on top of background but below image */
}

.signature-img {
    position: absolute;
    top: 50%;
    left: 0;
    width: 120px;
    /* size of the signature */
    height: auto;
    transform: translateY(-50%);
    transform: translateX(-10%);
    /* translucent signature */
    pointer-events: none;
    z-index: 2;
    /* overlay on top of text */
}


/* Print-friendly */
@media print {
    .no-print {
        display: none !important;
    }
}
</style>
