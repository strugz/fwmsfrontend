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
          :headers="CurCSTMSTTableHeaders"
          :items="DataTableItems"
        >
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.accmst.ACCMNM }}</td>
            <td class="text-xs-center">{{ props.item.CSTNME }}</td>
            <td class="text-xs-center">{{ props.item.CSTEML }}</td>
            <td class="text-xs-center">{{ props.item.CSTADD }}</td>
            <td class="text-xs-center">{{ props.item.CSTCDL }}</td>
            <td class="text-xs-center">{{ props.item.CSTPOS }}</td>
            <td class="text-xs-center">{{ props.item.CSTTPR }}</td>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>
  </v-container>
</template>>
<script>
import { mapState, mapActions, mapMutations } from "vuex";
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
    CurCSTMSTList() {
      this.DataTableItems = this.CurCSTMSTList;
    }
  },
  created() {
    this.getAllCSTMST();
  },
  computed: {
    ...mapState(["CurCSTMSTTableHeaders", "CurCSTMSTList"]),
  },
  methods: {
    ...mapActions(["getCSTMSTAllAcc"]),
    ...mapMutations(["upCSTMSTList"]),
    getAllCSTMST() {
      this.getCSTMSTAllAcc().then((res) => {
        this.upCSTMSTList(res.data);
      });
    },
  },
};
</script>
