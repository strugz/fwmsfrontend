<template>
    <v-flex xs12 class="ma-0">
        <v-data-table v-show="DataTableItems != null" v-model="CustSelected" :headers="OCCMSTHeaders"
            :items="DataTableItems.occmst" total-items="8" hide-actions>
            <template v-slot:items="props">
                <td class="text-xs-center">
                    <span class="bold-text">
                        {{ props.item.occdsc }}
                    </span>
                </td>
                <td class="text-xs-center">{{ props.item.occche }}</td>
                <td class="text-xs-center">{{ props.item.occhem }}</td>
                <td class="text-xs-center">{{ props.item.occimm }}</td>
                <td class="text-xs-center">{{ props.item.occmcb }}</td>
                <td class="text-xs-center">{{ props.item.occuri }}</td>
                <td class="text-xs-center">{{ props.item.occbld }}</td>
                <td class="text-xs-center">{{ props.item.occele }}</td>
                <td class="text-xs-center">{{ props.item.occcoa }}</td>
                <td class="text-xs-center">{{ props.item.occblb }}</td>
                <td class="text-xs-center">{{ props.item.occlis }}</td>
                <td class="text-xs-center">{{ props.item.occlab }}</td>
            </template>
        </v-data-table>
    </v-flex>
</template>
<script>
import { mapState, mapActions, mapMutations } from "vuex";
export default {
    data() {
        return {
            dialog: false,
            CustSelected: [],
            DataTableHeaders: [],
            DataTableItems: [],
            OCCMSTHeaders: [
                {
                    text: 'Description',
                    align: 'center',
                    sortable: false,
                    value: 'occdsc'
                },
                {
                    text: 'Chemistry',
                    align: 'center',
                    sortable: false,
                    value: 'OCCCHE'
                },
                {
                    text: 'Hema',
                    align: 'center',
                    sortable: false,
                    value: 'OCCHEM'
                },
                {
                    text: 'Immu',
                    align: 'center',
                    sortable: false,
                    value: 'OCCIMM'
                },
                {
                    text: 'MicroBio',
                    align: 'center',
                    sortable: false,
                    value: 'OCCMCB'
                },
                {
                    text: 'Urinalysis',
                    align: 'center',
                    sortable: false,
                    value: 'OCCURI'
                },
                {
                    text: 'Blood Gas',
                    align: 'center',
                    sortable: false,
                    value: 'OCCBLD'
                },
                {
                    text: 'Electrolytes',
                    align: 'center',
                    sortable: false,
                    value: 'OCCELE'
                },
                {
                    text: 'Coagulation',
                    align: 'center',
                    sortable: false,
                    value: 'OCCCOA'
                },
                {
                    text: 'Bloodbank',
                    align: 'center',
                    sortable: false,
                    value: 'OCCBLB'
                },
                {
                    text: 'LIS',
                    align: 'center',
                    sortable: false,
                    value: 'OCCLIS'
                },
                {
                    text: 'Lab Automation',
                    align: 'center',
                    sortable: false,
                    value: 'OCCLAB'
                },
            ]
        };
    },
    watch: {
        CurOCCMSTList() {
            this.DataTableItems = this.CurOCCMSTList;
        },
        accmid() {
            this.getAllOCCMST();
        }
    },
    mounted() {
        this.getAllOCCMST();
    },
    computed: {
        ...mapState(["CurOCCMSTList", "itemsAcct"]),
    },
    methods: {
        ...mapActions(["getOCCMST"]),
        ...mapMutations(["upOCCMSTList"]),
        getAllOCCMST() {
            this.getOCCMST(this.accmid).then((res) => {
                this.upOCCMSTList(res.data);
            });

        },
    },
    props: {
        accmid: {
            type: String,
            default: "",
        },
    },
};
</script>
<style scoped>
.bold-text {
    font-weight: bold;
}
</style>
