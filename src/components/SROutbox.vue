<template>
  <v-container fluid class="pa-0">
    <v-card class="hide-overflow" style="position: relative;">
      <v-toolbar color="primary" dense dark>
        <v-toolbar-title>{{ title }}</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>
      <div class="sr-outbox-content">
        <template v-if="iframeUrl">
          <iframe :src="iframeUrl"></iframe>
        </template>
        <template v-else>
          <div class="d-flex align-center justify-center fill">
            <p class="pa-4">Missing iframeUrl. Provide it via route query: /sroutbox?url=ENCODED_URL</p>
          </div>
        </template>
      </div>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'SROutbox',
  props: {
    iframeUrl: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: 'Service Report Outbox',
    },
  },
  computed: {},
  methods: {},
}
</script>

<style scoped>
.sr-outbox-content {
  position: relative;
  height: calc(100vh - 48px); /* account for dense toolbar height */
}

iframe {
  border: none;
  position: absolute;
  display: block;
  width: 100%;
  height: 100%;
}

.fill {
  height: calc(100vh - 48px);
}
</style>
