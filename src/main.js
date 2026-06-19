import Vue from 'vue'
import './plugins/axios'
import vuetify from './plugins/vuetify'
import './plugins/vuesax.js'
import App from './App.vue'
import router from './router'
import store from './store'
import moment from 'moment'
import Vuelidate from 'vuelidate'
// import VueSocketio from 'vue-socket.io-extended'
// import io from 'socket.io-client'
// import VueSignaturePad from 'vue-signature-pad';

// Vue.use(VueSignaturePad);

// Vue.use(VueSocketio, io(process.env.VUE_APP_wsURL))

new Vue({
  router,
  store,
  vuetify,
  moment,
  Vuelidate,
  render: h => h(App),
}).$mount('#app')
