import Vue from 'vue'
import './plugins/axios'
import './plugins/vuetify'
import './plugins/vuesax.js'
import App from './App.vue'
import router from './router'
import store from './store'
import Axios from 'axios'
import moment from 'moment'
import Vuelidate from 'vuelidate'
import VueSocketio from 'vue-socket.io-extended'
import io from 'socket.io-client'

Axios.defaults.baseURL = process.env.VUE_APP_apiURL

Vue.config.productionTip = false

Vue.use(VueSocketio, io(process.env.VUE_APP_wsURL))

new Vue({
  router,
  store,
  moment,
  Vuelidate,
  render: h => h(App),
}).$mount('#app')
