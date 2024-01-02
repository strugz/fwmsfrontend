
<template>
  <v-layout
    mt-0
    row
    justify-end
  >
    <v-dialog
      v-model="pdfDialog"
      persistent
    >
      <template v-slot:activator="{ on }">
        <v-btn
          small
          flat
          icon
          color="indigo"
          class="ma-0"
          dark
          v-on="on"
          @click="PrintPreview"
        >
          <v-icon>print</v-icon>
        </v-btn>
      </template>
      <v-card>
        <v-card-title
          primary-title
          class="primary lighten-2"
        >
          Print Preview
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn
                small
                flat
                icon
                color="indigo"
                class="mr-2"
                dark
                v-on="on"
                @click="LoadPdf"
              >
                <v-icon large>file_download</v-icon>
              </v-btn>
            </template>
            <span>Download SR</span>
          </v-tooltip>
          <v-btn
            small
            flat
            icon
            color="indigo"
            class="ma-0"
            dark
            @click="close"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-container
            fluid
            class="pa-1"
          >
            <v-layout
              row
              wrap
              align-center
            >

              <v-flex
                xs12
                sm6
                md3
              >
                <v-text-field
                  v-model="EmailReceiver"
                  label="Email Address"
                  ref="email"
                  :rules="[rules.email]"
                  placeholder="Customer Email"
                ></v-text-field>
              </v-flex>
              <v-flex
                xs12
                md1
                xl1
                class="pa-0 ma-0"
              >
                <v-btn
                  class="btn primary"
                  @click="Emailvalidation"
                  :disabled="sendBTNDisbled"
                >Send to Email</v-btn>
              </v-flex>
              <v-flex xs12>
                <span v-show="sendBTNDisbled">Sending please wait...</span>
                <v-progress-circular
                  v-show="sendBTNDisbled"
                  indeterminate
                  color="primary"
                ></v-progress-circular>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <div v-show="loading">
          <span>Loading...</span>
          <v-progress-linear :indeterminate="true"></v-progress-linear>
        </div>
        <pdf :src="pdfsrc"></pdf>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
<script>
/* eslint-disable */
import pdf from "vue-pdf";
import { mapState } from "vuex";
import axios from "axios";
export default {
  components: {
    pdf,
  },
  data() {
    return {
      sendBTNDisbled: false,
      loading: false,
      dialog: false,
      pdfsrc: null,
      pdfDialog: false,
      EmailReceiver: "",
      rules: {
        email: (value) => {
          const pattern =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || "Invalid e-mail.";
        },
      },
    };
  },
  computed: {
    ...mapState(["CurClientDetails", "CurUserDetails", "CurThreadDetails"]),
    srFormURL() {
      return `https://sr.mdmpi.com.ph/#/srview/${this.CurThreadDetails.TRDMTT}`;
    },
  },
  methods: {
    close() {
      this.EmailReceiver = "";
      this.resetForm();
      this.pdfDialog = false;
    },
    resetForm() {
      this.$refs.email.reset();
    },
    LoadPdf() {
      this.CurThreadDetails.TRDMMC = this.CurThreadDetails.TRDMMC.replace(
        ":",
        ""
      );
      this.CurThreadDetails.TRDMMC = this.CurThreadDetails.TRDMMC.replace(
        "/",
        " "
      );
      this.CurThreadDetails.TRDMMC = this.CurThreadDetails.TRDMMC.replace(
        "/",
        " "
      );
      let OpHeaders = "";
      // let data = JSON.stringify({ SRID: this.CurThreadDetails.TRDMTT });
      if (this.CurThreadDetails.TRDMTT.substring(0, 3) == "TTP") {
        OpHeaders = {
          method: "POST",
          headers: {
            "content-type": "application/pdf, */*",
            accept: "application/pdf, */*",
          },
          responseType: "blob",
          url:
            "https://crm.mdmpi.com.ph/rpt/rgenerator/report/" +
            this.CurThreadDetails.TRDMTT,
        };
      } else {
        OpHeaders = {
          method: "GET",
          headers: {
            "content-type": "application/pdf, */*",
            accept: "application/pdf, */*",
          },
          responseType: "blob",
          url:
            "https://crm.mdmpi.com.ph/rpt/rgenerator/report/" +
            this.CurThreadDetails.TRDMTT +
            "/" +
            this.CurThreadDetails.TRDMMC,
        };
      }
      axios(OpHeaders)
        .then((res) => {
          var fileURL = window.URL.createObjectURL(new Blob([res.data]));
          var fileLink = document.createElement("a");
          fileLink.href = fileURL;
          fileLink.setAttribute(
            "download",
            this.CurThreadDetails.TRDMTT + ".pdf"
          );
          document.body.appendChild(fileLink);
          fileLink.click();
        })
        .catch((error) => {
          alert(error);
        });
    },
    Emailvalidation() {
      this.sendBTNDisbled = true;
      if (this.EmailReceiver != "") {
        this.InsertEmail();
      } else {
        alert("No Email Inputted!");
      }
    },
    InsertEmail() {
      let email = "";
      if (this.EmailReceiver == "") {
        email = srvid + "/" + this.CurThreadDetails.TRDMMC;
      } else {
        email =
          encodeURI(
            this.CurClientDetails.ACCMNM.replace(".", "").replace("&", "and").trim()
          ) +
          "/" +
          this.CurThreadDetails.TRDMMC.replace(":", "")
            .replace("/", " ")
            .replace("/", " ").trim() +
          "/" +
          this.EmailReceiver +
          "/" +
          this.CurThreadDetails.TRDMTT;
      }
      const OpHeaders = {
        method: "GET",
        headers: {
          "content-type": "application/json",
        },
        url: "https://crm.mdmpi.com.ph/rpt/rgenerator/report/" + email,
      };
      console.log(OpHeaders);
      axios(OpHeaders)
        .then((res) => {
          if (res.status == 200) {
            this.sendBTNDisbled = false;
            alert("Email Sent!");
          }
        })
        .catch((error) => {
          alert(error);
        });
    },
    PrintPreview() {
      this.loading = true;
      this.CurThreadDetails.TRDMMC = this.CurThreadDetails.TRDMMC.replace(
        ":",
        ""
      );
      this.CurThreadDetails.TRDMMC = this.CurThreadDetails.TRDMMC.replace(
        "/",
        " "
      );
      this.CurThreadDetails.TRDMMC = this.CurThreadDetails.TRDMMC.replace(
        "/",
        " "
      );
      let OpHeaders = "";
      // let data = JSON.stringify({ SRID: this.CurThreadDetails.TRDMTT });
      if (this.CurThreadDetails.TRDMTT.substring(0, 3) == "TTP") {
        OpHeaders = {
          method: "POST",
          headers: {
            "content-type": "application/pdf, */*",
            accept: "application/pdf, */*",
          },
          responseType: "blob",
          url:
            "https://crm.mdmpi.com.ph/rpt/rgenerator/report/" +
            this.CurThreadDetails.TRDMTT,
        };
      } else {
        OpHeaders = {
          method: "GET",
          headers: {
            "content-type": "application/pdf, */*",
            accept: "application/pdf, */*",
          },
          responseType: "blob",
          url:
            "https://crm.mdmpi.com.ph/rpt/rgenerator/report/" +
            this.CurThreadDetails.TRDMTT +
            "/" +
            this.CurThreadDetails.TRDMMC,
        };
      }

      axios(OpHeaders)
        .then((res) => {
          const blob = new Blob([res.data]);
          const objectURL = URL.createObjectURL(blob);
          this.pdfsrc = objectURL;
          this.loading = false;
        })
        .catch((error) => {
          this.loading = false;
          alert(error);
        });
    },
  },
};
</script>
<style>
.aspect-ratio {
  padding-top: 20px;
  padding-right: 0px;
  width: 100%;
  aspect-ratio: inherit;
}
.aspect-ratio iframe {
  position: relative;
  height: 700px;
  width: 850px;
}
.btn {
  width: 95%;
}
</style>
