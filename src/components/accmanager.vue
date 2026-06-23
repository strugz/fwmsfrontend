<template>
  <div class="account-manager">
    <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
      <template v-slot:activator="{ on }">
        <span class="account-manager__trigger" v-on="on">User/Contact Manager</span>
      </template>

      <v-card class="account-manager__card" flat>
        <div class="account-manager__hero">
          <div>
            <p class="account-manager__eyebrow">Administration</p>
            <h1>User Account Manager</h1>
            <span>Review contacts, manage account access, and add new field users.</span>
          </div>
          <v-btn icon text color="white" @click="dialog = !dialog">
            <v-icon>close</v-icon>
          </v-btn>
        </div>

        <div class="account-manager__content">
          <v-card class="account-manager__toolbar" flat>
            <v-text-field
              v-model="contactSearch"
              clearable
              hide-details
              outlined
              dense
              prepend-inner-icon="search"
              placeholder="Search contacts"
            ></v-text-field>
            <v-spacer></v-spacer>

            <v-dialog v-model="editdialog" max-width="640px">
              <template v-slot:activator="{ on }">
                <v-btn color="teal darken-2" dark depressed v-on="on">
                  <v-icon left small>person_add</v-icon>
                  New Contact
                </v-btn>
              </template>

              <v-card class="account-form" flat>
                <div class="account-form__header">
                  <div>
                    <p class="account-manager__eyebrow">Contact</p>
                    <h2>{{ formTitle }}</h2>
                  </div>
                  <v-btn icon text color="white" @click="close">
                    <v-icon>close</v-icon>
                  </v-btn>
                </div>

                <v-card-text class="account-form__body">
                  <v-row dense>
                    <v-col cols="12" md="6">
                      <v-text-field v-model="editedItem.Username" label="Username" outlined dense></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="editedItem.Password"
                        label="Password"
                        type="password"
                        outlined
                        dense
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field v-model="editedItem.Lname" label="Last Name" outlined dense></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field v-model="editedItem.Fname" label="First Name" outlined dense></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field v-model="editedItem.Mname" label="Middle Name" outlined dense></v-text-field>
                    </v-col>
                    <v-col cols="12" md="8">
                      <v-text-field
                        :value="`${editedItem.Fname} ${editedItem.Mname} ${editedItem.Lname}`"
                        label="Complete Name"
                        outlined
                        dense
                        readonly
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field v-model="editedItem.Department" label="Department" outlined dense></v-text-field>
                    </v-col>
                  </v-row>
                </v-card-text>

                <v-card-actions class="account-form__actions">
                  <v-spacer></v-spacer>
                  <v-btn color="blue-grey darken-1" text @click="close">Cancel</v-btn>
                  <v-btn color="teal darken-2" dark depressed @click="save">Save</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-card>

          <v-card class="account-manager__table-card" flat>
            <v-data-table :headers="headers" :items="filteredContacts" class="account-manager__table">
              <template v-slot:items="props">
                <td>{{ props.item.CNTMCN }}</td>
                <td>{{ props.item.CNTDPT }}</td>
                <td>
                  <v-chip small color="teal lighten-5" text-color="teal darken-4">
                    {{ isAdmin(props.item) ? 'Admin' : 'User' }}
                  </v-chip>
                </td>
                <td>
                  <v-btn icon small color="teal darken-2" @click="editItem(props.item)">
                    <v-icon small>edit</v-icon>
                  </v-btn>
                  <v-btn icon small color="blue-grey" @click="deleteItem(props.item)">
                    <v-icon small>settings_backup_restore</v-icon>
                  </v-btn>
                </td>
              </template>
              <template v-slot:no-data>
                <div class="account-manager__empty">
                  <v-icon size="42" color="blue-grey lighten-1">people</v-icon>
                  <strong>No contacts found</strong>
                </div>
              </template>
            </v-data-table>
          </v-card>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  data: () => ({
    editdialog: false,
    contacts: [],
    contactSearch: '',
    dialog: false,
    headers: [
      { text: 'Name', value: 'CNTMCN' },
      { text: 'Department', value: 'CNTDPT' },
      { text: 'Role', value: 'admin', sortable: false },
      { text: 'Actions', value: 'name', sortable: false },
    ],
    desserts: [],
    editedIndex: -1,
    editedItem: {
      Lname: '',
      Fname: '',
      Mname: '',
      Department: '',
      Username: '',
      Password: '',
    },
    defaultItem: {
      Lname: '',
      Fname: '',
      Mname: '',
      Department: '',
      Username: '',
      Password: '',
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
    },
    filteredContacts() {
      const query = String(this.contactSearch || '').toLowerCase()
      if (!query) return this.contacts
      return this.contacts.filter(contact => {
        return [contact.CNTMCN, contact.CNTDPT, contact.CNTMNN].filter(Boolean).join(' ').toLowerCase().includes(query)
      })
    },
  },

  watch: {
    editdialog(val) {
      val || this.close()
    },
  },

  created() {
    if (this.$route && this.$route.path === '/accmanager') {
      this.dialog = true
    }

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
    ...mapActions(['getContacts', 'postNewUser']),
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

    deleteItem(item) {
      console.log(item)
    },

    save() {
      const data = JSON.stringify({
        USRMUI: 'JSAGUDO',
        USRMPW: '123456',
        CNTMLN: 'AGUDO',
        CNTMMN: 'S',
        CNTMFN: 'JESSIE',
        CNTDPT: 'TSG',
        CNTMNN: 'JSA',
        CNTMCN: 'JESSIE S. AGUDO',
        CNTMSX: 'MALE',
      })

      this.postNewUser(data).then(
        res => {
          console.log(res.status)
        },
        error => {
          console.error(error)
        }
      )
    },
  },
}
</script>

<style scoped>
.account-manager__trigger {
  cursor: pointer;
}

.account-manager__card {
  background: #f8fafc;
  min-height: 100vh;
}

.account-manager__hero,
.account-form__header {
  align-items: flex-start;
  background: linear-gradient(135deg, #0f766e, #1976d2);
  color: white;
  display: flex;
  justify-content: space-between;
  padding: 24px 28px;
}

.account-manager__eyebrow {
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  margin: 0 0 8px;
  text-transform: uppercase;
}

.account-manager__hero h1,
.account-form__header h2 {
  margin: 0 0 6px;
}

.account-manager__hero span {
  color: rgba(255, 255, 255, 0.82);
}

.account-manager__content {
  display: grid;
  gap: 16px;
  margin: 0 auto;
  max-width: 1180px;
  padding: 20px;
}

.account-manager__toolbar,
.account-manager__table-card,
.account-form {
  background: white;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08) !important;
}

.account-manager__toolbar {
  align-items: center;
  display: flex;
  gap: 14px;
  padding: 16px;
}

.account-manager__table-card {
  overflow: hidden;
}

.account-manager__table {
  box-shadow: none !important;
}

.account-form {
  overflow: hidden;
}

.account-form__body {
  padding: 22px 24px 4px;
}

.account-form__actions {
  border-top: 1px solid rgba(15, 23, 42, 0.08);
  padding: 14px 24px 20px;
}

.account-manager__empty {
  align-items: center;
  color: #64748b;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
  padding: 38px;
}

@media (max-width: 700px) {
  .account-manager__toolbar {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
