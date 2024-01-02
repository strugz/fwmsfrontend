<template>
  <v-container fluid>
    <v-layout
      align-start
      justify-center
      row
      wrap
    >
      <v-flex
        xs12
        class="mt-4"
      >
        <v-data-table
          v-show="DataTableItems != null"
          v-model="CustSelected"
          :headers="CurCNTTableHeaders"
          :items="DataTableItems"
        >
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.CNTMCN }}</td>
            <td class="text-xs-center">{{ props.item.CNTMNN }}</td>
            <td class="text-xs-center">{{ props.item.CNTARE }}</td>
            <td class="text-xs-center">{{ props.item.CNTEPS }}</td>
            <td class="text-xs-center">{{ props.item.CNTDPT }}</td>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>
  </v-container>
</template>>
  <script>
import { mapState, mapActions } from "vuex";
export default {
  data() {
    return {
      dialog: false,
      CustSelected: [],
      DataTableHeaders: [],
      DataTableItems: [],
    };
  },
  watch: {
    CurCNTMSTList() {
      this.DataTableItems = this.CurCNTMSTList;
    },
  },
  created() {
    this.getCNT();
  },
  computed: {
    ...mapState(["CurCNTTableHeaders", "CurCNTMSTList"]),
  },
  methods: {
    ...mapActions(["getAllCNTMST"]),
    getCNT() {
      this.getAllCNTMST().then((res) => {
        this.DataTableItems = res.data;
      });
    },
  },
};
</script>
  