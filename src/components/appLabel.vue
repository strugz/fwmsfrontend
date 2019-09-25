<template>
  <v-layout
    class="caption font-weight-regular text-uppercase"
    style="color: grey"
    align-start
    justify-start
    column
    fill-height
    pa-2
  >
    <v-flex x12 style="font-size: .85em;" class="pb-0"> {{ header }} </v-flex>
    <v-flex class="font-weight-bold ml-2 black--text text-xs-left pt-0" x12>{{ detail }}</v-flex>
  </v-layout>
</template>

<script>
export default {
  props: {
    header: String,
    detail: String,
  },
}
</script>
