<template>
    <v-layout mt-0 row justify-center>
        <v-dialog v-model="dialog" width="500" persistent transition="dialog-bottom-transition">
            <template v-slot:activator="{ on }">
                <v-btn v-if="type == 'icon'" small icon flat round dark color="teal" v-on="on">
                    <v-icon color="white lighten-1">timer_off</v-icon>
                </v-btn>
                <v-btn v-else small round dark color="teal" v-on="on">
                    Other Act.
                </v-btn>
            </template>
            <v-flex xs12>
                <v-card color="grey lighten-4" min-width="350px" flat class="mt-0">
                    <v-toolbar color="primary" dark>
                        <v-toolbar-title>Leave Details</v-toolbar-title>
                        <v-spacer></v-spacer>
                    </v-toolbar>
                    <v-card-title primary-title>
                        <v-flex xs12>
                            <v-text-field v-model="details" placeholder="Description"></v-text-field>
                        </v-flex>
                        <v-flex xs12 lg6>
                            <v-menu ref="menu1" v-model="menu1" :close-on-content-click="false" :nudge-right="40" lazy
                                transition="scale-transition" offset-y full-width max-width="290px" min-width="290px">
                                <template v-slot:activator="{ on }">
                                    <v-text-field v-model="dateFormatted" label="Date Leave" hint="MM/DD/YYYY format"
                                        persistent-hint prepend-icon="event" @blur="date = parseDate(dateFormatted)"
                                        v-on="on"></v-text-field>
                                </template>
                                <v-date-picker v-model="date" no-title @input="menu1 = false"></v-date-picker>
                            </v-menu>
                        </v-flex>
                    </v-card-title>
                    <v-card-actions>
                        <v-btn color="primary" :disabled="enableStart" @click="SaveAdditionalItinerary">Save</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" @click="dialog = false">
                            Cancel
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-flex>
        </v-dialog>
    </v-layout>
</template>
<script>
import { mapActions, mapMutations, mapState } from "vuex";
export default {
    data() {
        return {
            dialog: false,
            date: new Date().toISOString().substr(0, 10),
            dateFormatted: this.formatDate(new Date().toISOString().substr(0, 10)),
            menu1: false,
            enableStart: false,
            details: ""
        };
    },
    watch: {
        date(val) {
            this.dateFormatted = this.formatDate(this.date);
        },
    },
    computed: {
        computedDateFormatted() {
            return this.formatDate(this.date);
        },
        ...mapState([
            "CurUserDetails"
        ]),
    },
    methods: {
        ...mapActions(["insertLVEMST"]),
        ...mapMutations(["upCurITIMSTList"]),
        SaveAdditionalItinerary() {
            let myValidation = JSON.stringify({
                LVEDSC: this.details,
                LVECNT: this.CurUserDetails.USRDTL.USRDCI,
                LVEDTE: this.date
            });
            this.insertLVEMST({ data: myValidation }).then(res => {
                if (res.status == 200) {
                    this.details = "";
                    this.upCurITIMSTList(res.data);
                    alert("Save Successfully");
                }
            })
                .catch((error) => {
                    console.log(error);
                });
        },
        ObjectiveSelectedItems(item) {
            console.log(item);
        },
        formatDate(date) {
            if (!date) return null;

            const [year, month, day] = date.split("-");
            return `${month}/${day}/${year}`;
        },
        parseDate(date) {
            if (!date) return null;

            const [month, day, year] = date.split("/");
            return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        },
    },
    props: {
        type: {
            type: String,
            default: "",
        },
    },
};
</script>
    