import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import '@fortawesome/fontawesome-free/css/all.css'
// import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/src/stylus/app.styl'
import colors from 'vuetify/es5/util/colors'

Vue.use(Vuetify, {
  iconfont: ['md', 'fa'],
  theme: {
    primary: colors.teal.darken3,
    secondary: colors.red.lighten4,
    accent: colors.indigo.lighten1,
  },
})
