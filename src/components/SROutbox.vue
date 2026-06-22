<template>
  <v-container fluid class="iframe-page pa-0">
    <v-card class="iframe-page__card">
      <v-toolbar dark flat height="72" class="iframe-page__toolbar">
        <div class="iframe-page__brand">
          <div class="iframe-page__icon">
            <v-icon color="white">inbox</v-icon>
          </div>
          <div class="iframe-page__title">
            <span>{{ title }}</span>
            <small>Embedded service report workspace</small>
          </div>
        </div>
        <v-spacer></v-spacer>
      </v-toolbar>
      <div class="iframe-page__body">
        <template v-if="iframeUrl">
          <iframe class="iframe-page__frame" :src="iframeUrl"></iframe>
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
.iframe-page {
  height: 100vh;
  margin: 0;
}

.iframe-page__card {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.iframe-page__toolbar {
  background: linear-gradient(135deg, #00695c 0%, #1976d2 100%) !important;
  flex: 0 0 auto;
  padding-left: 18px;
  padding-right: 14px;
  box-shadow: 0 6px 22px rgba(15, 23, 42, 0.2);
}

.iframe-page__brand {
  align-items: center;
  display: flex;
  gap: 12px;
  min-width: 0;
}

.iframe-page__icon {
  align-items: center;
  background: rgba(255, 255, 255, 0.16);
  border-radius: 12px;
  display: flex;
  height: 40px;
  justify-content: center;
  width: 40px;
}

.iframe-page__title {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  min-width: 0;
}

.iframe-page__title span {
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0;
}

.iframe-page__title small {
  color: rgba(255, 255, 255, 0.76);
  font-size: 12px;
  font-weight: 500;
  margin-top: 3px;
}

.iframe-page__body {
  background: #eef4f6;
  flex: 1 1 auto;
  min-height: 0;
  position: relative;
}

.iframe-page__frame {
  border: none;
  height: 100%;
  position: absolute;
  display: block;
  inset: 0;
  width: 100%;
}

.fill {
  height: 100%;
}
</style>
