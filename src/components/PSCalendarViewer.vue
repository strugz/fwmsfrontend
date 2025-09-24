<template>
    <v-container>
        <v-layout app wrap id="printDiv">
            <v-flex xs12 class="ml-3 mr-3 mt-3">
                <span>
                    <h4>MARSMAN DRYSDALE MEDICAL PRODUCT INC.</h4>
                    <h4>CALENDAR PLANNER</h4>
                </span>
                <span>
                    <h3>{{ myDate }}</h3>
                </span>
                <v-layout row wrap>
                    <v-flex sm4 md4 lg6 xs12>
                        <v-combobox outline v-model="selectedItemDepartment" :items="departmentList" item-text="DPTNME"
                            item-value="DPTNME" label="Select Department"></v-combobox>
                    </v-flex>
                    <v-flex sm4 md4 lg6 xs12>
                        <v-combobox outline v-model="selectedItemUser" :items="userList" item-text="CNTMNN"
                            item-value="CNTMID" label="Select User"></v-combobox>
                    </v-flex>
                </v-layout>
                <v-layout row wrap>
                    <v-flex sm2 md2 xs12>
                        <v-text-field v-model="datefrom" class="no-print ml-2" type="date" label="From"></v-text-field>
                    </v-flex>
                    <v-flex sm2 md2 xs12>
                        <v-text-field v-model="dateto" class="no-print ml-2" type="date" label="To"></v-text-field>
                    </v-flex>
                    <v-flex sm1 md1 xs12>
                        <v-btn class="no-print primary" @click="dataReload">Load</v-btn>
                    </v-flex>
                </v-layout>
                <v-layout row wrap>
                    <v-flex sm3 md3 xs12>
                        <v-btn class="red no-print" @click="removeCalendarData">Reset Data</v-btn>
                    </v-flex>
                    <v-flex sm3 md3 xs12>
                        <v-btn class="no-print" @click="$refs.calendar.prev()">
                            <v-icon dark left>
                                keyboard_arrow_left
                            </v-icon>
                            Prev
                        </v-btn>
                    </v-flex>
                    <v-flex sm3 md3 xs12>
                        <v-btn class="no-print" @click="$refs.calendar.next()">
                            Next
                            <v-icon right dark>
                                keyboard_arrow_right
                            </v-icon>
                        </v-btn>
                    </v-flex>
                </v-layout>
                <v-sheet height="800" class="my-event3">
                    <v-calendar ref="calendar" v-model="today" type="month" color="primary">
                        <template v-slot:day="{ date }">
                            <template v-for="event in eventsMap[date]">
                                <v-menu :key="event.trdmti" v-model="event.open" :close-on-content-click="false"
                                    full-width offset-x>
                                    <template v-slot:activator="{ on }">
                                        <div class="my-event1 mb-1" v-ripple v-on="on" v-show="event.trdsts != 'LEAVE'">
                                            <div v-if="!event.time && event.trdmde != '' && event.trdsts != ''">
                                                {{ event.client }}
                                            </div>
                                            <div v-if="event.trdmde == '' && event.trdsts == 'SCHEDULED'" v-ripple>
                                                {{ event.client }}
                                            </div>
                                            <div v-show="event.trdsts == ''">
                                                {{ event.client }}
                                            </div>
                                        </div>
                                        <div v-show="event.trdsts != '' && event.trdsts != 'LEAVE'"
                                            class="my-event2 mb-1" v-ripple v-on="on"
                                            v-for="(text, index) in event.trdmde.split('|')" :key="index">
                                            <div v-show="event.trdmde != '' && event.trdsts != 'SCHEDULED'">
                                                {{ text }}
                                            </div>
                                            <div
                                                v-show="event.trdmde == '' && event.trdsts == 'SCHEDULED' || event.trdsts == 'START'">
                                                {{ event.trdsts + ":" }}
                                                {{ event.itiobj + " - " }} {{ event.itiins }}
                                            </div>
                                        </div>
                                        <div v-show="event.trdmde != '' && event.trdsts == '' && event.trdsts != 'LEAVE'"
                                            class="my-event2 mb-1" v-ripple>
                                            {{ event.trdmde }}
                                        </div>
                                        <div v-show="event.trdsts == 'LEAVE'" class='my-event4' v-ripple v-on="on">
                                            {{ event.title }}
                                        </div>
                                    </template>
                                    <v-layout wrap row>
                                        <v-card v-show="event.trdsts == 'START' || event.trdsts == 'SCHEDULED'"
                                            color="grey lighten-4" min-width="250px" max-width="350px" flat>
                                            <v-toolbar color="primary" dark>
                                                <v-toolbar-title>{{ event.title }}</v-toolbar-title>
                                                <v-spacer></v-spacer>
                                            </v-toolbar>
                                            <v-card-title primary-title>
                                                <v-flex xs12 v-show="event.itiobj">
                                                    <p>
                                                        <span style="color:blue;font-weight:bold">Instrument:</span>
                                                        {{ ' ' + event.itiins }}
                                                    </p>
                                                </v-flex>
                                            </v-card-title>
                                            <v-card-actions>
                                            </v-card-actions>
                                        </v-card>
                                    </v-layout>
                                </v-menu>
                            </template>
                        </template>
                    </v-calendar>
                </v-sheet>
            </v-flex>
        </v-layout>
    </v-container>
</template>
<script>
import { mapActions, mapState, mapMutations } from "vuex";
import moment from "moment";

export default {
    data: () => ({
        menu: false,
        today: moment(new Date()).format("YYYY-MM-DD"),
        datefrom: "",
        dateto: "",
        client: "",
        departmentList: [],
        userList: [],
        selectedItemUser: null,
        selectedItemDepartment: null,
    }),
    watch: {
        selectedItemDepartment() {
            this.getUserByDepartment(this.selectedItemDepartment.DPTNME).then(
                res => {
                    this.userList = res.data;
                }
            )
                .catch(error => {
                    console.log(error);
                });
        },
    },
    computed: {
        ...mapState(["CurServiceCalendar", "CurUserDetails"]),
        eventsMap() {
            const map = {};
            this.CurServiceCalendar.forEach((e) =>
                (map[e.date] = map[e.date] || []).push(e)
            );
            return map;
        },
        myDate() {
            return moment(this.today).format("MMMM YYYY");
        },
    },
    mounted() {

        if(this.CurUserDetails.CNTMST.CNTDPT == "PMDLUZON") {
            this.departmentList.push({ DPTNME: "PASLUZON" }, { DPTNME: "PASVISMIN" });
        }else {
            this.departmentList.push({ DPTNME: "IMG" });
        }

        if (localStorage.mydata != undefined) {
            this.upCurServiceCalendar(JSON.parse(localStorage.mydata).myCalendar);
            this.datefrom = JSON.parse(localStorage.mydata).myCalendarDateFrom;
            this.dateto = JSON.parse(localStorage.mydata).myCalendarDateTo;
        }
    },
    methods: {
        ...mapActions(["getServiceCalendar", "getUserByDepartment"]),
        ...mapMutations(["upCurServiceCalendar"]),
        open(event) {
            alert(event.title);
        },
        dataReload() {
            this.getServiceCalendar({
                cntmid: this.selectedItemUser.CNTMID,
                data: {
                    itidteFrom: this.datefrom,
                    itidteTo: this.dateto,
                },
            }).then((res) => {
                if (res != "") {
                    this.upCurServiceCalendar(res);
                    let calendar = JSON.stringify({
                        myCalendar: res,
                        myCalendarDateFrom: this.datefrom,
                        myCalendarDateTo: this.dateto
                    });
                    localStorage.mydata = calendar;
                }
                else {
                    alert("No Data Found!");
                }
            }).catch((error) => {
                alert("Please re-select the Client!", error)
            });
        },
        removeCalendarData() {
            localStorage.removeItem("mydata");
            location.reload();
        },
    },
};
</script>
<style scoped>
.my-event1 {
    border-radius: 2px;
    color: #000000;
    border: 1px solid #1867c0;
    width: 100%;
    font-size: 10px;
}

.my-event2 {
    border-radius: 2px;
    color: #000000;
    border: 1px solid #f1cc52;
    width: 100%;
    font-size: 8px;
}

.my-event4 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border-radius: 2px;
    background-color: #127509;
    color: #ffffff;
    border: 1px solid #1867c0;
    width: 100%;
    font-size: 12px;
    padding: 3px;
    cursor: pointer;
    margin-bottom: 1px;
    inline-size: 100%;
    overflow-wrap: break-word;
}

.my-event3 {
    border-color: red;
    border: 2px solid;
}

@media print {
    .no-print {
        display: none;
    }
}
</style>
