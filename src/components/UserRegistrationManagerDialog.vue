<template>
  <v-layout>
    <v-dialog
      v-model="dialog"
      width="550"
      hide-overlay
      persistent
    >
      <template v-slot:activator="{ on }">
        <v-btn
          v-on="on"
          class="primary mt-3"
        >Add User</v-btn>
      </template>

      <v-card ref="form">
        <v-toolbar
          color="primary"
          dense
          dark
        >
          <v-toolbar-title>Add New</v-toolbar-title>
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
            align-start
            justify-left
            row
            wrap
          >
            <v-flex
              xs12
              xl6
              md6
              class="pr-1"
            >
              <v-text-field
                ref="USRMUI"
                v-model="USRMUI"
                :rules="[() => !!USRMUI || 'This field is required']"
                :error-messages="errorMessages"
                placeholder="Username"
                required
              ></v-text-field>
            </v-flex>
            <v-flex
              xs12
              xl6
              md6
              class="pr-1"
            >
              <v-text-field
                ref="USRMPW"
                type="password"
                v-model="USRMPW"
                :rules="[() => !!USRMPW || 'This field is required']"
                :error-messages="errorMessages"
                placeholder="Password"
              ></v-text-field>
            </v-flex>
            <v-flex
              xs12
              xl5
              md5
              class="pr-1"
            >
              <v-text-field
                ref="CNTMLN"
                v-model="CNTMLN"
                :rules="[() => !!CNTMLN || 'This field is required']"
                :error-messages="errorMessages"
                placeholder="Lastname"
              ></v-text-field>
            </v-flex>
            <v-flex
              xs12
              xl5
              md5
              class="pr-1"
            >
              <v-text-field
                ref="CNTMFN"
                v-model="CNTMFN"
                :rules="[() => !!CNTMFN || 'This field is required']"
                :error-messages="errorMessages"
                placeholder="Firstname"
              ></v-text-field>
            </v-flex>
            <v-flex
              xs12
              xl2
              md2
              class="pr-1"
            >
              <v-text-field
                ref="CNTMMN"
                v-model="CNTMMN"
                :rules="[() => !!CNTMMN || 'This field is required']"
                :error-messages="errorMessages"
                placeholder="M.I."
              ></v-text-field>
            </v-flex>
            <v-flex
              xs12
              xl6
              md6
              class="pr-1"
            >
              <v-text-field
                ref="CNTMNN"
                v-model="CNTMNN"
                :rules="[() => !!CNTMNN || 'This field is required']"
                :error-messages="errorMessages"
                placeholder="Initial"
              ></v-text-field>
            </v-flex>
            <v-flex
              xs12
              xl6
              md6
              class="pr-1"
            >
              <v-combobox
                ref="CNTDPT"
                v-model="CNTDPT"
                :items="CurDPTItems"
                :rules="[() => !!CNTDPT || 'This field is required']"
                :error-messages="errorMessages"
                placeholder="Department"
              ></v-combobox>
            </v-flex>
            <v-flex
              xs12
              xl6
              md6
              class="pr-1"
            >
              <v-combobox
                ref="CNTMSX"
                v-model="CNTMSX"
                :items="GENDER"
                :rules="[() => !!CNTMSX || 'This field is required']"
                :error-messages="errorMessages"
                placeholder="Gender"
              ></v-combobox>
            </v-flex>
            <v-flex
              xs12
              xl6
              md6
              class="pr-1"
            >
              <v-text-field
                ref="CNTMBD"
                v-model="CNTMBD"
                :rules="[() => !!CNTMBD || 'This field is required']"
                :error-messages="errorMessages"
                placeholder="BirthDate"
              ></v-text-field>
            </v-flex>
            <v-flex
              xs12
              xl6
              md6
              class="pr-1"
            >
              <v-text-field
                ref="CNTARE"
                v-model="CNTARE"
                :rules="[() => !!CNTARE || 'This field is required']"
                :error-messages="errorMessages"
                placeholder="AREA"
              ></v-text-field>
            </v-flex>
            <v-flex
              xs12
              xl6
              md6
              class="pr-1"
            >
              <v-text-field
                ref="CNTRTH"
                v-model="CNTRTH"
                :rules="[() => !!CNTRTH || 'This field is required']"
                :error-messages="errorMessages"
                placeholder="Rights"
              ></v-text-field>
            </v-flex>
            <v-flex
              xs12
              xl6
              md6
              class="pr-1"
            >
              <v-text-field
                ref="CNTEPS"
                v-model="CNTEPS"
                :rules="[() => !!CNTEPS || 'This field is required']"
                :error-messages="errorMessages"
                placeholder="Employee Position"
              ></v-text-field>
            </v-flex>
          </v-layout>

        </v-container>
        <v-card-actions>
          <v-btn flat>Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-slide-x-reverse-transition>
            <v-tooltip
              v-if="formHasErrors"
              left
            >
              <template v-slot:activator="{ on }">
                <v-btn
                  icon
                  class="my-0"
                  @click="resetForm"
                  v-on="on"
                >
                  <v-icon>refresh</v-icon>
                </v-btn>
              </template>
              <span>Refresh form</span>
            </v-tooltip>
          </v-slide-x-reverse-transition>
          <v-btn
            class="primary"
            flat
            @click="submit"
          >Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
  <script>
import { mapActions, mapState } from "vuex";
export default {
  data() {
    return {
      dialog: false,
      errorMessages: "",
      CNTMLN: null,
      CNTMMN: null,
      CNTMFN: null,
      CNTMNN: null,
      CNTDPT: null,
      CNTMCN: null,
      CNTMSX: null,
      CNTMPF: null,
      CNTMSF: null,
      CNTMBD: null,
      CNTARE: null,
      CNTRTH: null,
      CNTEPS: null,
      USRMUI: null,
      USRMPW: null,
      GENDER: ["MALE", "FEMALE"],
      formHasErrors: false,
    };
  },
  computed: {
    ...mapState(["CurDPTItems"]),
    form() {
      return {
        USRMUI: this.USRMUI,
        USRMPW: this.USRMPW,
        CNTMLN: this.CNTMLN,
        CNTMMN: this.CNTMMN,
        CNTMFN: this.CNTMFN,
        CNTMNN: this.CNTMNN,
        CNTDPT: this.CNTDPT,
        CNTMSX: this.CNTMSX,
        CNTEPS: this.CNTEPS,
      };
    },
  },
  mounted() {},
  watch: {
    USRMUI() {
      this.errorMessages = "";
    },
  },
  methods: {
    ...mapActions(["insertCNTMST", "getAllCNTMST"]),
    saveCNTMST() {
      let data = JSON.stringify({
        CNTMLN: this.CNTMLN,
        CNTMMN: this.CNTMMN,
        CNTMFN: this.CNTMFN,
        CNTMNN: this.CNTMNN,
        CNTDPT: this.CNTDPT,
        CNTMCN: this.CNTMFN + " " + this.CNTMMN + " " + this.CNTMLN,
        CNTMSX: this.CNTMSX,
        CNTMPF: "",
        CNTMSF: "",
        CNTMBD: this.CNTMBD,
        CNTEPS: this.CNTEPS,
        USRMUI: this.USRMUI,
        USRMPW: this.USRMPW,
      });
      console.log(data);
      this.insertCNTMST({ data: data });
      this.getCNTMST();
    },
    getCNTMST() {
      this.getAllCNTMST().then((res) => {
        this.upCNTMSTList(res.data);
      });
    },
    resetForm() {
      this.errorMessages = [];
      this.formHasErrors = false;

      Object.keys(this.form).forEach((f) => {
        this.$refs[f].reset();
      });
    },
    submit() {
      this.formHasErrors = false;

      Object.keys(this.form).forEach((f) => {
        if (!this.form[f]) this.formHasErrors = true;

        this.$refs[f].validate(true);
      });
      this.saveCNTMST();
    },
  },
};
</script>
  <style>
.btn {
  width: 100%;
}
</style>
  