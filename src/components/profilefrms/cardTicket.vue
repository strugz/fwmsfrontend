<template>
  <v-card
    light
    color="white"
    class="text-sm-left"
  >
    <v-card-title class="subheading">
      <v-layout
        row
        wrap
      >
        <v-flex
          xs12
          class="subheading"
        >
          <span class="indigo darken-1 pa-1 caption white--text mr-1">Ticket #: </span>
        </v-flex>
        <v-flex
          mt-1
          ml-1
        >
          <v-layout class="caption font-weight-regular text-uppercase" align-start justify-center column fill-height>
            <v-flex pa-0>
              Accepted / Service By:
              <span class="font-weight-medium"></span>
            </v-flex>
            <v-flex pa-0>
              Concern:
              <span class="font-weight-medium"></span>
            </v-flex>
            <v-flex pa-0>
              Date:
              <span class="font-weight-medium"></span>
            </v-flex>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-card-title>
  </v-card>
</template>
<script>
export default {
    methods: {
        
    }
}
</script>
