<template>
  <v-layout>
    <v-dialog class="dialog" v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
      <template v-slot:activator="{ on }">
        <span v-on="on">Itinerary Forms</span>
      </template>
      <v-card>
        <v-toolbar color="primary" dense dark fixed>
          <v-toolbar-title>For Approval</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="dialog = !dialog">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-container fluid>
          <v-layout row wrap>
            <v-flex xs12 class="mt-4">
              <!-- Combobox -->
              <v-combobox v-model="selectedItemDepartment" :items="departmentList" item-text="DPTNME"
                item-value="DPTNME" label="Select Department"></v-combobox>
              <v-combobox v-model="selectedItemUser" :items="userList" item-text="CNTMNN" item-value="CNTMID"
                label="Select User"></v-combobox>
              <!-- Datatable -->
              <v-data-table :headers="headers" :items="itineraryList">
                <template v-slot:items="props">
                  <td class="text-xs-left responsive-date">{{ props.item.ITIDTE }}</td>
                  <td class="text-xs-left">{{ props.item.ACCMNM }}</td>
                  <td class="text-xs-left">{{ props.item.CSTNME }}</td>
                  <td class="text-xs-left">{{ props.item.ITIOBJ }}</td>
                  <td class="text-xs-left">{{ props.item.CSTADD }}</td>
                  <td class="text-xs-left">{{ props.item.CNTMNN }}</td>
                  <td class="text-xs-left">
                    <v-icon color="success" @click="approveItem(props.item)">check_circle</v-icon>
                  </td>
                </template>
              </v-data-table>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
<script>
import { mapActions, mapMutations } from "vuex";
export default {
  data() {
    return {
      dialog: false,
      selectedItemUser: null,
      selectedItemDepartment: null,
      userList: [],
      departmentList: [{ DPTNME: "TSRLUZON" }, { DPTNME: "TSRVISMIN" }],
      itineraryList: [],
      headers: [
        { text: 'Date', value: 'ITIDTE', width: '100px' },
        { text: 'Client', value: 'ACCMNM' },
        { text: 'Customer Name', value: 'CSTNME' },
        { text: 'Objective', value: 'ITIOBJ' },
        { text: 'Client Address', value: 'CSTADD' },
        { text: 'Initial', value: 'CNTMNN' }
      ],
    };
  },
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
    selectedItemUser() {
      this.getUserItinerary(this.selectedItemUser.CNTMID).then(
        res => {
          if (res.data.data != "") {
            this.itineraryList = res.data;
          }
          else {
            this.itineraryList = [];
          }
        }
      )
        .catch(error => {
          console.log(error);
        })
    }
  },
  computed: {
  },
  methods: {
    ...mapActions(["getAllCNTMST", "getUserByDepartment", "getUserItinerary", "updateForApproval"]),
    ...mapMutations([]),
    approveItem(item) {
      const index = this.itineraryList.indexOf(item);
      if (index > -1) {

        this.updateForApproval(item.ITIMID).then(
          res => {
            if (res.status == 200) {
              this.itineraryList.splice(index, 1);
            }
            else {
              alert("Please try Again!");
            }
          }
        )
          .catch(error => {
            alert("Please try Again!", error);
          })
      }
    },
  },
};
</script>

<style>
.card {
  height: 100%;
}

.fixed {
  position: fixed;
  bottom: 0;
}

.responsive-date {
  min-width: 100px;
  max-width: 200px;
  width: 10%;
}
</style>
