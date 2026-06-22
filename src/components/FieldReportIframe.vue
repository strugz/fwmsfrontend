<template>
  <v-container fluid class="pa-0 fill-viewport">
    <v-card class="hide-overflow fill-card">
      <v-toolbar dark flat height="72" class="iframe-page__toolbar">
        <div class="iframe-page__brand">
          <div class="iframe-page__icon">
            <v-icon color="white">assignment</v-icon>
          </div>
          <div class="iframe-page__title">
            <span>{{ title }}</span>
            <small>Embedded field report workspace</small>
          </div>
        </div>
        <v-spacer></v-spacer>
      </v-toolbar>
      <div class="sr-outbox-content">
        <template v-if="iframeUrl">
          <div class="fr-iframe-inner" :style="innerStyle">
            <iframe :src="iframeUrl" frameborder="0" allowfullscreen class="fr-iframe" :style="iframeStyle"></iframe>
          </div>
        </template>
        <template v-else>
          <div class="d-flex align-center justify-center fill">
            <p class="pa-4">
              Missing iframeUrl. Provide it via route params or route query: /fieldreport/:SRID/:ClientID or
              /fieldreport?url=ENCODED_URL
            </p>
          </div>
        </template>
      </div>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'FieldReportIframe',
  props: {
    iframeUrl: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: 'Field Report',
    },
    // zoom: scale factor for iframe (0.5 .. 1.2). 1 = 100%
    zoom: {
      type: Number,
      default: 0.9,
    },
  },
  data() {
    return {
      // sizing is handled entirely by CSS now
      supportsZoom: false,
    }
  },
  computed: {
    frScale() {
      // clamp zoom to sane range
      const z = Number(this.zoom) || 1
      return Math.min(1.2, Math.max(0.5, z))
    },
    iframeStyle() {
      // Prefer CSS zoom when supported (Chromium-based). If not, fall back to transform scale.
      if (this.supportsZoom) {
        // CSS zoom scales the rendering but keeps intrinsic layout; allow
        // iframe to be full-size inside the wrapper.
        return { zoom: this.frScale }
      }
      // For transform fallback we'll scale the iframe element and let the
      // inner wrapper (innerStyle) control the pre-scale dimensions so the
      // scrollable area matches the scaled content.
      const s = this.frScale
      return { transform: `scale(${s})`, transformOrigin: 'top left' }
    },
    innerStyle() {
      // When using transform fallback, set the inner wrapper to the
      // pre-scaled size (100/scale percent) so the scrolling area equals
      // the scaled iframe's visual area.
      if (this.supportsZoom) {
        return { width: '100%', height: '100%' }
      }
      const s = this.frScale
      const w = 100 / s + '%'
      const h = 100 / s + '%'
      return { width: w, height: h }
    },
  },

  mounted() {
    // Hide page scrollbar while iframe is active
    this._previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // detect zoom support
    try {
      this.supportsZoom = 'zoom' in document.body.style
    } catch (e) {
      this.supportsZoom = false
    }
  },
  beforeDestroy() {
    // restore body overflow
    if (this._previousBodyOverflow !== undefined) document.body.style.overflow = this._previousBodyOverflow
  },
  methods: {
    // No JS sizing required; kept in case future behavior is needed
  },
}
</script>

<style scoped>
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

.sr-outbox-content {
  background: #eef4f6;
  position: relative;
  /* allow this flex child to shrink properly to prevent overflow */
  flex: 1 1 auto;
  min-height: 0;
  /* crucial so children can shrink inside flex containers */
  overflow: hidden; /* delegate scrolling to inner wrapper */
}

.fr-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
  min-height: 0;
  /* allow iframe to be sized by flex parent */
  /* transform fallback will be set via inline style when zoom not supported */
}

.fr-iframe-inner {
  width: 100%;
  height: 100%;
  overflow: auto; /* inner wrapper is the scroll container now */
  position: relative;
}

.v-card.fill-card {
  /* Use flex column so .sr-outbox-content grows and can shrink when needed */
  display: flex;
  flex-direction: column;
  height: 100vh;
  /* keep full viewport but let inner flex children manage sizing */
}

.fill {
  height: calc(100vh - 48px);
}

.fill-viewport {
  padding: 0;
  margin: 0;
  height: 100vh;
  /* make the top container full viewport height */
  display: flex;
  flex-direction: column;
}

.fill-card {
  overflow: hidden;
  /* keep display flex to allow inner content to size correctly */
  display: flex;
  flex-direction: column;
}
</style>
