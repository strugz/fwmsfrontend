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
// import VueSocketio from 'vue-socket.io-extended'
// import io from 'socket.io-client'
// import VueSignaturePad from 'vue-signature-pad';

// Vue.use(VueSignaturePad);

Axios.defaults.baseURL = process.env.VUE_APP_apiURL

// Vue.use(VueSocketio, io(process.env.VUE_APP_wsURL))

new Vue({
  router,
  store,
  moment,
  Vuelidate,
  render: h => h(App),
}).$mount('#app')

// Register service worker for PWA (only in production or localhost)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Use a relative path so it works when app is served from a subpath
    navigator.serviceWorker.register('service-worker.js').catch(err => {
      // eslint-disable-next-line no-console
      console.warn('Service worker registration failed:', err);
    });
  });
}
