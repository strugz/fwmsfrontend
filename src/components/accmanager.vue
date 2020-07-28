<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog" max-width="950" persistent>
      <template v-slot:activator="{ on }">
        <span v-on="on"> User/Contact Manager </span>
      </template>
      <v-card color="primary lighten-3" class="hide-overflow" style="position: relative;">
        <v-toolbar color="primary" dense dark flat>
          <v-toolbar-title>User Account Manager</v-toolbar-title>

          <v-spacer></v-spacer>
          <v-btn icon @click="dialog = !dialog">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <template>
            <div>
              <v-toolbar flat color="white">
                <v-text-field
                  clearable
                  hide-details
                  solo
                  prepend-inner-icon="search"
                  placeholder="search"
                  flat
                ></v-text-field>
                <v-spacer></v-spacer>
                <!-- Add Edit Dialog -->
                <v-dialog v-model="editdialog" max-width="500px">
                  <template v-slot:activator="{ on }">
                    <v-btn class="teal darken-2" dark small v-on="on">
                      <v-icon>person_add</v-icon> {{ 'New Contact' }}
                    </v-btn>
                  </template>
                  <v-card>
                    <v-card-title>
                      <span class="headline">{{ formTitle }}</span>
                    </v-card-title>

                    <v-card-text>
                      <v-container grid-list-md>
                        <v-layout wrap>
                          <!-- Last Name
                          First Name
                          Middle Name
                          Nick Name
                          Complete Name
                          Prefix
                          Suffix
                          Sex -->
                          <v-flex xs12 sm6 md4>
                            <v-text-field v-model="editedItem.Lname" label="Last Name"></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm6 md4>
                            <v-text-field v-model="editedItem.Fname" label="First Name"></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm6 md4>
                            <v-text-field v-model="editedItem.Mname" label="Middle Name"></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm6 md8>
                            <v-text-field
                              :value="`${editedItem.Fname} ${editedItem.Mname} ${editedItem.Lname}`"
                              label="Complete Name"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm6 md4>
                            <v-text-field v-model="editedItem.Department" label="Department"></v-text-field>
                          </v-flex>
                        </v-layout>
                      </v-container>
                    </v-card-text>

                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="blue darken-1" flat @click="close">Cancel</v-btn>
                      <v-btn color="blue darken-1" flat @click="save">Save</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-toolbar>
              <v-data-table :headers="headers" :items="contacts" class="elevation-1">
                <template v-slot:items="props">
                  <td>{{ props.item.CNTMCN }}</td>
                  <td>{{ props.item.CNTDPT }}</td>
                  <td>
                    <v-switch hide-details :value="true"></v-switch>
                  </td>
                  <td>
                    <v-icon class="mr-2" @click="editItem(props.item)">
                      edit
                    </v-icon>
                    <v-icon @click="deleteItem(props.item)">
                      settings_backup_restore
                    </v-icon>
                  </td>
                </template>
                <!-- <template v-slot:no-data>
                  <v-btn color="primary" @click="initialize">Reset</v-btn>
                </template> -->
              </v-data-table>
            </div>
          </template>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-layout>
  <!-- dialog: false,
      
Last Name
First Name
Middle Name
Nick Name
Complete Name
Prefix
Suffix
Sex
Birthdate -->
</template>
<script>
import { mapState, mapMutations, mapActions } from 'vuex'
export default {
  data: () => ({
    editdialog: false,
    contacts: [],
    dialog: false,
    headers: [
      { text: 'Name', value: 'CNTMCN' },
      { text: 'Department', value: 'CNTDPT' },
      { text: 'Admin', value: 'admin', sortable: false },
      { text: 'Actions', value: 'name', sortable: false },
    ],
    desserts: [],
    editedIndex: -1,
    editedItem: {
      Lname: '',
      Fname: '',
      Mname: '',
      Department: '',
    },
    defaultItem: {
      Lname: '',
      Fname: '',
      Mname: '',
      Department: '',
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
    },
  },

  watch: {
    editdialog(val) {
      val || this.close()
    },
  },

  created() {
    this.getContacts('').then(
      res => {
        this.contacts = res.data
      },
      error => {
        console.error(error)
      }
    )
  },

  methods: {
    ...mapActions(['getContacts']),
    isAdmin(data) {
      if (data.hasOwnProperty('USRDRT')) {
        if (data.USRDRT.hasOwnProperty('ADMIN')) {
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    },
    editItem(item) {
      this.editedIndex = this.desserts.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.editdialog = true
    },

    close() {
      this.editdialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },

    save() {
      if (this.editedIndex > -1) {
        Object.assign(this.desserts[this.editedIndex], this.editedItem)
      } else {
        this.desserts.push(this.editedItem)
      }
      this.close()
    },
  },
}
</script>

<style>
iframe {
  border: none;
  position: absolute;
  display: block;
  width: 100%;
  height: 100%;
}
</style>
