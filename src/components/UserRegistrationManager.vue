<template>
  <v-layout>
    <v-dialog
      class="dialog"
      v-model="dialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <template v-slot:activator="{ on }">
        <span v-on="on">User</span>
      </template>
      <v-card>
        <v-toolbar
          color="primary"
          dense
          dark
          fixed
        >
          <v-toolbar-title>User Director</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
            icon
            @click="dialog = !dialog"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-container fluid>
          <v-layout
            row
            wrap
          >
            <v-flex
              xs12
              class="mt-4"
            >
              <manager-dialog></manager-dialog>
              <manager-table></manager-table>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
<script>
import ManagerDialog from "../components/UserRegistrationManagerDialog.vue";
import ManagerTable from "../components/UserRegistrationManagerDataTable.vue";
export default {
  components: {
    ManagerDialog,
    ManagerTable,
  },
  data() {
    return {
      dialog: false,
    };
  },
};
</script>
