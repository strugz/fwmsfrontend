<template>
    <v-layout>
        <v-dialog class="dialog" v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
            <template v-slot:activator="{ on }">
                <span v-on="on">OCC</span>
            </template>
            <v-card>
                <v-toolbar color="primary" dense fixed app prominent>
                    <v-toolbar-title>OCC - Opportunities Conversion Card</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon @click="dialog = !dialog">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-container fluid>
                    <v-layout row wrap>
                        <v-flex xs12 class="mt-4">
                            <v-combobox class="v-combobox mt-1" v-show="show" v-model="fieldSearch" :items="itemsAcct"
                                item-text="ACCMNM" item-value="ACCMID" clearable outlined prepend-inner-icon="search"
                                placeholder="Search by: Client name or Initial" @focus="$event.target.select()">
                            </v-combobox>
                        </v-flex>
                        <v-flex xs12 class="mt-2">
                            <span class="font-weight-bold">{{ fieldSearch.ACCMNM == null ? "" : "Name Of Hospital: " +
                                fieldSearch.ACCMNM }}</span>
                        </v-flex>
                        <v-flex xs12 class="mt-2">
                            <span class="font-weight-bold">{{ fieldSearch.ACCMAD == null ? "" : "Complete Address: " +
                                fieldSearch.ACCMAD }}</span>
                        </v-flex>
                        <v-flex xs12 class="mt-2">
                            <span class="font-weight-bold">{{ fieldSearch.ACCMPH == null ? "" : "Contact Number: " +
                                fieldSearch.ACCMPH }}</span>
                        </v-flex>
                        <v-flex xs12 v-show="fieldSearch.ACCMAD != null">
                            <v-form @submit.prevent="submitForm">
                                <input type="file" @change="readExcelFileValidation">
                                <v-btn color="primary" @click="uploadFile">Import Excel</v-btn>
                                <v-btn color="primary" @click="AddOcc">Add Data</v-btn>
                            </v-form>
                        </v-flex>
                        <occ-add v-show="occShow"></occ-add>
                        <occ-dialog :accmid="fieldSearch.ACCMID"></occ-dialog>
                    </v-layout>
                </v-container>
            </v-card>
        </v-dialog>
    </v-layout>
</template>
<script>
import { mapActions, mapMutations, mapState } from "vuex";
import OccDialog from "../CardOccDataTable.vue";
import OccAdd from "../CardOccAddData.vue";
export default {
    components: {
        OccDialog,
        OccAdd
    },
    data() {
        return {
            dialog: false,
            CustSelected: [],
            DataTableHeaders: [],
            DataTableItems: [],
            show: true,
            fieldSearch: "" ? [] : "",
            itemsAcct: [],
            importedFile: null,
            file: [],
            tempOCCMSTList: "",
            occShow: false
        };
    },
    computed: {
        ...mapState(["CurCheckInAcc", "CurOCCMSTList"]),
    },
    watch: {
        fieldSearch() {
            this.verifier();
        },
    },
    methods: {
        ...mapActions(["filterAcct", "getAcc", "InsertOCCMSTImport", "InsertOCCMST"]),
        ...mapMutations(["upClient", "upCheckInAcc", "upOCCMSTList"]),
        AddOcc() {
            if (this.occShow == true) {
                this.occShow = false;
            }
            else {
                this.occShow = true;
            }

        },
        verifier() {
            if (this.fieldSearch != null) {
                if (this.fieldSearch != "") {
                    if (this.fieldSearch.ACCMNM != undefined) {
                        this.getFilteredAcct(this.fieldSearch.ACCMNM);
                    } else {
                        this.getFilteredAcct(this.fieldSearch);
                    }
                }
            }
        },
        getFilteredAcct(e) {
            this.filterAcct(e).then(
                (res) => {
                    res.forEach((element) => {
                        this.itemsAcct.unshift(element);
                    });
                },
                (error) => {
                    console.error(error);
                }
            );

            console.timeEnd();
        },
        uploadFile() {
            if (this.tempOCCMSTList != "") {
                this.InsertOCCMSTImport(this.tempOCCMSTList).then(res => {
                    if (res == 200) {
                        alert("Import successfuly!");
                    }
                })
            }
            else {
                alert("No Data to save.")
            }
        },
        readExcelFileValidation(event) {
            if (this.CurOCCMSTList.occmst != null) {
                this.readExcelFile(event);
            }
            else {
                alert("Already Has a Data!")
            }
        },
        readExcelFile(event) {
            var file = event.target.files[0];

            if (file) {
                var reader = new FileReader();

                reader.onload = (e) => {
                    var data = new Uint8Array(e.target.result);
                    var workbook = XLSX.read(data, { type: 'array' });

                    // Assuming the data is in the first sheet (index 0)
                    var sheet = workbook.Sheets[workbook.SheetNames[0]];

                    // Get all cell addresses
                    var range = XLSX.utils.decode_range(sheet['!ref']);

                    // Iterate through rows and columns to read data
                    var jsonData = [];
                    var jsonColumnString = ["occdsc", "occacc", "", "occche", "occhem", "occimm", "occmcb", "occuri", "occbld", "occele", "occcoa", "occblb", "occlis", "occlab"];

                    // Iterate through rows and columns to read data
                    for (var R = 8; R <= 15; ++R) {
                        var rowData = {};

                        for (var C = range.s.c; C <= 13; ++C) {
                            // Get the cell address
                            var cellAddress = XLSX.utils.encode_cell({ r: R, c: C });



                            // Get the cell value
                            var cellValue = sheet[cellAddress] ? sheet[cellAddress].v : undefined;

                            if (cellValue != undefined) {
                                // Store the cell value in the JSON object
                                rowData[jsonColumnString[C]] = cellValue;
                            }
                            if (jsonColumnString[C] == "occacc") {
                                rowData[jsonColumnString[C]] = this.fieldSearch.ACCMID;
                            }
                        }

                        // Add the row data to the JSON array
                        jsonData.push(rowData);
                    }
                    this.tempOCCMSTList = JSON.stringify({
                        occmst: jsonData
                    });
                    this.upOCCMSTList({
                        occmst: jsonData
                    });
                };

                reader.readAsArrayBuffer(file);
            } else {
                console.log("No file selected.");
            }
        }
    }
};
</script>
<style>
.hoverClick:hover {
    text-decoration: underline;
    color: steelblue;
    cursor: pointer;
}

.card {
    height: 100%;
}

.fixed {
    position: fixed;
    bottom: 0;
}
</style>
