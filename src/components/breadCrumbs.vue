<template>
  <!-- <v-breadcrumbs :items="BreadCrumbItems" light>
    <template v-slot:item="props">
      <v-breadcrumbs-item :to="props.item.href">
        {{ props.item.text.toUpperCase() }}
      </v-breadcrumbs-item>
    </template>
    <template v-slot:divider>
      <v-icon color="teal darken-2">chevron_right</v-icon>
    </template>
  </v-breadcrumbs> -->
  <v-breadcrumbs light>
    <v-breadcrumbs-item :to="'/'">{{ 'Home' }}</v-breadcrumbs-item>
    <v-breadcrumbs-item v-if="client.hasOwnProperty('href')" :to="client.href">{{ client.text }}</v-breadcrumbs-item>
    <v-breadcrumbs-item v-if="thread.hasOwnProperty('href')" :to="thread.href" :disabled="true">{{
      thread.text
    }}</v-breadcrumbs-item>
    <template v-slot:divider>
      <v-icon color="teal darken-2">chevron_right</v-icon>
    </template>
  </v-breadcrumbs>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
  data() {
    return {
      BreadCrumbItems: [
        {
          text: 'Home',
          href: '/',
        },
      ],
    }
  },
  computed: {
    ...mapState(['CurClientDetails', 'CurThreadDetails']),
    client() {
      if (this.CurClientDetails.hasOwnProperty('ACCMNM')) {
        return {
          text: `${this.CurClientDetails.ACCMNM}`,
          href: `/customer/${this.CurClientDetails.ACCMID}`,
        }
      } else return ''
    },
    thread() {
      if (this.CurThreadDetails.hasOwnProperty('TRDMTT')) {
        return {
          text: `${this.CurThreadDetails.TRDMTY == 'Service Report' ? 'SR: #' : ''}${this.CurThreadDetails.TRDMTT}`,
          href: `/${this.CurThreadDetails.TRDMTY == 'Service Report' ? 'sr' : 'thread'}/${
            this.CurClientDetails.ACCMID
          }`,
        }
      } else return ''
    },
  },
  methods: {
    ...mapMutations(['upClient', 'upTrdDetails']),
  },
  watch: {
    client(val) {
      if (val !== '') {
        this.BreadCrumbItems[1] = val
      }
    },
    thread(val) {
      if (val !== '') {
        this.BreadCrumbItems[2] = val
      }
    },
    $route(to) {
      if (to.path == '/') {
        this.upClient({})
        this.upTrdDetails([])
        this.BreadCrumbItems = [
          {
            text: 'Home',
            disabled: false,
            href: '/',
          },
        ]
      } else if (to.name == 'customer') {
        this.upTrdDetails([])
      }
    },
  },
}
</script>

<style></style>
