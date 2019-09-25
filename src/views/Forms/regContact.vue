<template>
  <v-container fluid grid-list-md>
    <v-card class="scroll transparent elevation-0">
      <!-- <v-card-title>
        <v-layout wrap column>
          <v-flex>
            <div class="title">Creating Contact</div>
          </v-flex>
          <v-flex>
            <span class="grey--text caption">Lorem ipsum dolor sit amet, consectetur adipiscing elit</span>
          </v-flex>
        </v-layout>
      </v-card-title> -->

      <v-card-text>
        <v-layout wrap>
          <v-flex xs12>
            <v-text-field box label="Last Name" v-model="CNTMLN"></v-text-field>
          </v-flex>
          <v-flex xs12>
            <v-text-field box label="First Name" v-model="CNTMFN"></v-text-field>
          </v-flex>
          <v-flex xs12>
            <v-text-field box label="Middle Name" v-model="CNTMMN"></v-text-field>
          </v-flex>
          <v-flex xs4>
            <v-text-field box label="Nick Name" v-model="CNTMNN"></v-text-field>
          </v-flex>
          <v-flex xs4>
            <v-text-field box label="Prefix" v-model="CNTMPF"></v-text-field>
          </v-flex>
          <v-flex xs4>
            <v-text-field box label="Suffix" v-model="CNTMSF"></v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-select :items="gender" box label="Gender" v-model="CNTMSX"></v-select>
          </v-flex>
          <v-flex xs6>
            <v-menu
              ref="menu"
              v-model="menu"
              :close-on-content-click="false"
              :nudge-right="40"
              lazy
              transition="scale-transition"
              offset-y
              full-width
              min-width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field v-model="date" label="Birthday date" box readonly v-on="on"></v-text-field>
              </template>
              <v-date-picker
                ref="picker"
                v-model="date"
                :max="new Date().toISOString().substr(0, 10)"
                min="1950-01-01"
                @change="save"
              ></v-date-picker>
            </v-menu>
          </v-flex>
        </v-layout>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red" dark>cancel</v-btn>

        <v-btn color="primary" to="/contactinfo">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
export default {
  components: {},
  data: () => ({
    date: null,
    menu: false,
    gender: ['Male', 'Female'],
    cnttype: ['Address', 'TelNo', 'Celphone', 'Email', 'Website'],
  }),

  watch: {
    menu(val) {
      val && setTimeout(() => (this.$refs.picker.activePicker = 'YEAR'))
    },
  },
  methods: {
    save(date) {
      this.$refs.menu.save(date)
    },
  },
}
</script>

<style></style>
