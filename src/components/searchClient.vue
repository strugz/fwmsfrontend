<template>
  <v-combobox
    class="client-search"
    v-show="show"
    v-model="fieldSearch"
    :items="itemsAcct"
    item-text="ACCMNM"
    item-value="ACCMID"
    clearable
    dense
    flat
    hide-details
    outlined
    @emptied="clickSearch"
    @click="clickSearch"
    prepend-inner-icon="search"
    placeholder="Search by: Client name or Initial"
    @focus="$event.target.select()"
  ></v-combobox>
</template>
<script>
import { mapActions, mapMutations, mapState } from 'vuex'
export default {
  data() {
    return {
      fieldSearch: '',
      show: true,
    }
  },
  computed: {
    ...mapState(['itemsAcct']),
  },
  watch: {
    fieldSearch() {
      this.verifier()
    },
    $route(to) {
      if (to.path == '/') {
        this.fieldSearch = ''
      }
    },
  },
  methods: {
    ...mapActions(['filterAcct', 'getAcc']),
    ...mapMutations(['upClient', 'upCheckInAcc']),
    verifier() {
      if (this.fieldSearch === null || this.fieldSearch === '') {
        return
      }

      const searchText = this.fieldSearch.ACCMNM !== undefined ? this.fieldSearch.ACCMNM : this.fieldSearch
      this.getFilteredAcct(searchText)
    },
    clickSearch() {
      this.$router.push({ path: `/` })
    },
    getFilteredAcct(e) {
      this.filterAcct(e).then(
        res => {
          res.forEach(element => {
            this.upCheckInAcc({ items: element })
          })

          const selectedAccountId = this.fieldSearch && this.fieldSearch.ACCMID
          this.clientClick(selectedAccountId)
        },
        error => {
          console.error(error)
        }
      )
    },
    clientClick(id) {
      if (id != undefined) {
        this.getAcc(id).then(
          res => {
            this.upClient(res.data)
          },
          error => {
            console.error(error)
          }
        )
        this.$router.push({ path: `/customer/${id}` })
      }
    },
  },
}
</script>
<style>
.client-search.v-input {
  border-radius: 14px;
}

.client-search .v-input__slot {
  background: #f8fafc !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 14px !important;
  min-height: 44px !important;
  transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
}

.client-search.v-input--is-focused .v-input__slot {
  background: #ffffff !important;
  border-color: #0f766e !important;
  box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.12);
}

.client-search .v-label,
.client-search input::placeholder {
  color: #64748b !important;
}
</style>
