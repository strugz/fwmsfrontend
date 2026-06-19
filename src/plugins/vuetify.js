import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import '@fortawesome/fontawesome-free/css/all.css'
import 'material-icons/iconfont/material-icons.css'
import 'vuetify/dist/vuetify.min.css'
import colors from 'vuetify/lib/util/colors'
import './vuetifyLegacyGrid'

Vue.use(Vuetify)

export default new Vuetify({
  icons: {
    iconfont: 'md',
  },
  theme: {
    themes: {
      light: {
        primary: colors.teal.darken3,
        secondary: colors.red.lighten4,
        accent: colors.indigo.lighten1,
      },
    },
  },
})
