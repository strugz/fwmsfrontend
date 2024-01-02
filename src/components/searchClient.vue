<template>
  <v-combobox
    class="v-combobox mt-1"
    v-show="show"
    v-model="fieldSearch"
    :items="itemsAcct"
    item-text="ACCMNM"
    item-value="ACCMID"
    clearable
    outlined
    @emptied="clickSearch"
    @click="clickSearch"
    prepend-inner-icon="search"
    placeholder="Search by: Client name or Initial"
    @focus="$event.target.select()"
  >
  </v-combobox>
</template>
<script>
import { mapActions, mapMutations, mapState } from "vuex";
export default {
  data() {
    return {
      fieldSearch: "" ? [] : "",
      show: true,
    };
  },
  computed: {
    ...mapState(["CurCheckInAcc", "itemsAcct"]),
  },
  watch: {
    fieldSearch() {
      this.verifier();
    },
    $route(to) {
      if (to.path == "/") {
        this.fieldSearch = "";
      }
    },
  },
  methods: {
    ...mapActions(["filterAcct", "getAcc"]),
    ...mapMutations(["upClient", "upCheckInAcc"]),
    verifier() {
      if (this.fieldSearch != null) {
        if (this.fieldSearch != "") {
          if (this.fieldSearch.ACCMNM != undefined) {
            this.getFilteredAcct(this.fieldSearch.ACCMNM);
          } else {
            this.getFilteredAcct(this.fieldSearch);
          }
        }
      }
    },
    clickSearch() {
      this.$router.push({ path: `/` });
    },
    getFilteredAcct(e) {
      console.log(1);
      console.time();
      this.filterAcct(e).then(
        (res) => {
          console.log(res);
          res.forEach((element) => {
            
            this.upCheckInAcc({ items: element });
          });
          this.clientClick(this.fieldSearch.ACCMID);
        },
        (error) => {
          console.error(error);
        }
      );
      console.timeEnd();
    },
    clientClick(id) {
      if (id != undefined) {
        this.getAcc(id).then(
          (res) => {
            this.upClient(res.data);
          },
          (error) => {
            console.error(error);
          }
        );
        this.$router.push({ path: `/customer/${id}` });
      }
    },
  },
};
</script>
<style>
.v-combobox {
  height: 40px;
  border-radius: 16px;
  background: #cfd8dc;
  padding-top: 5px;
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 0;
}
</style>
