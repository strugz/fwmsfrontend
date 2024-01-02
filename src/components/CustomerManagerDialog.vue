<template>
  <v-dialog
    v-model="dialog"
    width="700"
    hide-overlay
    persistent
  >
    <template v-slot:activator="{ on }">
      <v-btn
        v-on="on"
        class="primary mt-3"
      >Add New Customer</v-btn>
    </template>
    <v-card>

      <v-container>
        <v-layout
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
              v-model="CSTTCD"
              placeholder="Terr Code"
            ></v-text-field>
          </v-flex>
          <v-flex
            xs12
            xl6
            md6
            class="pr-1"
          >
            <v-combobox
              v-model="cntmstSelected"
              label="Assign To"
              :items="CurCNTMSTList"
              item-text="CNTMCN"
              item-value="CNTMID"
              @change="cntSelectedItem"
            ></v-combobox>
          </v-flex>
          <v-flex
            xs12
            class="pr-1"
          >
            <v-combobox
              v-model="clientSelected"
              label="Client"
              :items="CurClientList"
              item-text="ACCMNM"
              item-value="ACCMID"
              hide-details
              @change="clientSelectedItem"
            ></v-combobox>
          </v-flex>
          <v-flex
            xs12
            xl6
            md6
            class="pr-1"
          >
            <v-text-field
              v-model="CSTNME"
              label="Fullname"
            ></v-text-field>
          </v-flex>
          <v-flex
            xs12
            xl6
            md6
            class="pr-1"
          >
            <v-text-field
              v-model="CSTEML"
              label="Email Address"
            ></v-text-field>
          </v-flex>
          <v-flex
            xs12
            xl6
            md6
            class="pr-1"
          >
            <v-text-field
              v-model="CSTADD"
              label="Address"
            ></v-text-field>
          </v-flex>
          <v-flex
            xs12
            xl6
            md6
            class="pr-1"
          >
            <v-text-field
              v-model="CSTCDL"
              label="Contact Details"
            ></v-text-field>
          </v-flex>
          <v-flex
            xs12
            xl6
            md6
            class="pr-1"
          >
            <v-text-field
              v-model="CSTDOB"
              label="BirthDate"
            ></v-text-field>
          </v-flex>
          <v-flex
            xs12
            xl6
            md6
            class="pr-1"
          >
            <v-combobox
              v-model="itemOneSelected"
              :items="itemOne"
              label="Specialty / Position"
            ></v-combobox>
          </v-flex>
          <v-flex
            xs12
            xl6
            md4
            class="pr-1"
          >
            <v-combobox
              v-model="itemCodeSelected"
              :items="CurItemCode"
              label="Target Product"
              multiple
              @change="cntSelectedItemCode"
            ></v-combobox>
          </v-flex>
          <v-flex
            xs12
            xl3
            md3
            class="pr-1"
          >
            <v-combobox
              v-model="itemTwoSelected"
              :items="itemTwo"
              label="Status"
            ></v-combobox>
          </v-flex>
          <v-flex
            xs12
            xl6
            md3
            class="pr-1"
          >
            <v-combobox
              v-model="CSTCFR"
              :items="itemCallFrequency"
              label="Call Frequency"
            ></v-combobox>
          </v-flex>
          <v-flex
            xs12
            xl6
            md2
          >
            <v-combobox
              v-model="CSTCLS"
              :items="ItemThree"
              label="Classification"
            ></v-combobox>
          </v-flex>
          <v-flex xs12>
            <v-textarea
              label="Customer Description"
              v-model="CSTREM"
              style="height: 50%;"
            ></v-textarea>
          </v-flex>
          <v-flex
            xs12
            md6
            xl6
            class="pr-1"
          >
            <v-btn
              class="btn primary"
              @click="dialog = !dialog"
            >
              Cancel
            </v-btn>
          </v-flex>
          <v-flex
            xs12
            md6
            xl6
            class="pr-1"
          >
            <v-btn
              :disabled="saveBTNEnable"
              class="btn primary"
              @click="SaveCSTMSTValidation"
            >Save</v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card>
  </v-dialog>
</template>
<script>
import { mapActions, mapMutations, mapState } from "vuex";
export default {
  data() {
    return {
      saveBTNEnable: false,
      dialog: false,
      CSTNME: "",
      CSTEML: "",
      CSTCNT: "",
      CSTACC: "",
      CSTADD: "",
      CSTCDL: "",
      CSTDOB: "",
      CSTPOS: "",
      CSTTPR: "",
      CSTSTS: "",
      CSTCLS: "",
      CSTTCD: "",
      CSTCFR: "",
      CSTREM: "",
      clientSelected: [],
      cntmstSelected: [],
      itemOne: [
        "Pathologist",
        "CMT",
        "Section Head",
        "MT",
        "Purchasing Manager",
      ],
      itemOneSelected: "",
      itemTwo: ["User", "Non-User"],
      itemTwoSelected: "",
      ItemThree: ["A", "B"],
      itemThreeSelected: "",
      itemCodeSelected: [],
      itemCallFrequency: ["2", "4"],
      itemCallFrequencySelected: [],

      rules: {
        required: (value) => !!value || "Required.",
        email: (value) => {
          const pattern =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || "Invalid e-mail.";
        },
      },
    };
  },
  computed: {
    ...mapState(["CurClientList", "CurCNTMSTList", "CurItemCode"]),
  },
  mounted() {
    this.clientList();
    this.cntmstList();
    this.itemCodeList();
  },
  methods: {
    ...mapActions([
      "getAllAcc",
      "getAllCNTMST",
      "getItemCode",
      "InsertCSTMST",
      "getCSTMSTAllAcc",
    ]),
    ...mapMutations([
      "upAllClient",
      "upCNTMSTList",
      "upCurItemCode",
      "upCSTMSTList",
    ]),
    clientList() {
      this.getAllAcc({ accId: "" }).then((res) => {
        this.upAllClient(res.data);
      });
    },
    cntmstList() {
      this.getAllCNTMST({ accId: "" }).then((res) => {
        this.upCNTMSTList(res.data);
      });
    },
    itemCodeList() {
      this.getItemCode({ accId: "" }).then((res) => {
        let tempData = res.data;
        console.log(tempData.ITEM_CODE);
        this.upCurItemCode(tempData.ITEM_CODE);
      });
    },
    clientSelectedItem(item) {
      if (item.ACCMNM == undefined) {
        alert("Please select Client!");
      }
    },
    cntSelectedItem(item) {
      if (item.CNTMCN == undefined) {
        alert("Please select Med Rep!");
      }
    },
    cntSelectedItemCode(item) {
      if (item == "") {
        alert("Please select Target Product!");
      }
    },
    SaveCSTMSTValidation() {
      this.saveBTNEnable = true;
      if (this.CSTTCD == "") {
        alert("Missing Terr Code");
      } else if (
        this.cntmstSelected.CNTMID == [] ||
        this.cntmstSelected.CNTMID == undefined
      ) {
        alert("Missing Assignt To");
      } else if (
        this.clientSelected.ACCMID == null ||
        this.clientSelected.ACCMID == undefined
      ) {
        alert("Missing Missing Client");
      } else {
        this.saveCSTMST();
      }
    },
    saveCSTMST() {
      let data = JSON.stringify({
        CSTNME: this.CSTNME,
        CSTEML: this.CSTEML,
        CSTCNT: this.cntmstSelected.CNTMID,
        CSTACC: this.clientSelected.ACCMID,
        CSTADD: this.CSTADD,
        CSTCDL: this.CSTCDL,
        CSTDOB: this.CSTDOB,
        CSTPOS: this.itemOneSelected,
        CSTTPR: this.itemCodeSelected,
        CSTSTS: this.itemTwoSelected,
        CSTCLS: this.CSTCLS,
        CSTTCD: this.CSTTCD,
        CSTCFR: this.CSTCFR,
        CSTREM: this.CSTREM,
      });
      this.InsertCSTMST({ data: data });
      this.getAllCSTMST();
    },
    getAllCSTMST() {
      this.getCSTMSTAllAcc().then((res) => {
        this.CSTNME = "";
        this.CSTEML = "";
        this.cntmstSelected = [];
        this.clientSelected = [];
        this.CSTADD = "";
        this.CSTCDL = "";
        this.CSTDOB = "";
        this.itemOneSelected = "";
        this.itemCodeSelected = "";
        this.itemTwoSelected = "";
        this.CSTCLS = "";
        this.CSTTCD = "";
        this.CSTCFR = "";
        this.CSTREM = "";
        this.upCSTMSTList(res.data);
        alert("Save Successfully");
        this.saveBTNEnable = false;
      });
    },
  },
};
</script>
<style>
.btn {
  width: 100%;
}
</style>
