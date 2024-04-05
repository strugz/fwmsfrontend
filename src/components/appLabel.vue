<template>
  <v-layout
    class="caption font-weight-regular text-uppercase"
    style="color: grey"
    align-start
    justify-start
    column
    fill-height
  >
    <v-flex x12 style="font-size: .85em;" class="pb-0"> {{ header }} </v-flex>
    <v-flex class="font-weight-bold ml-2 black--text text-xs-left pt-0" x12>{{ details }}</v-flex>
  </v-layout>
</template>

<script>
export default {
  computed: {
    details() {
      if (this.detail == undefined || this.detail == "" || this.detail == null) {
        return ' ----- '
      } else {
        return this.detail
      }
    },
  },
  props: {
    header: String,
    detail: String,
  },
}
</script>
