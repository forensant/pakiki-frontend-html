import Vue from 'vue'
import VueRouter from 'vue-router'
import VueVirtualScroller from 'vue-virtual-scroller'
import Vuex from 'vuex'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import axios from 'axios'
import InjectList from './components/InjectList'
import RequestTabs from './components/RequestTabs'
import Settings from './components/Settings'

import '@/mixins/common'

Vue.use(Vuex)
Vue.use(VueRouter)
Vue.use(VueVirtualScroller)

Vue.config.productionTip = false

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

const routes = [
  { path: '/inject/:scan_id/:request_id', component: InjectList },
  { path: '/inject/:scan_id', component: InjectList },
  { path: '/inject', component: InjectList },
  { path: '/requests', component: RequestTabs },
  { path: '/', component: RequestTabs },
  { path: '/requests/manual', component: RequestTabs },
  { path: '/requests/manual/:request_id', component: RequestTabs },
  { path: '/settings', component: Settings }
]

// set up the default HTTP route and websocket URL
let baseLocation = window.location.origin
if(Vue.config.devtools) {
  baseLocation = 'http://localhost:10101'
}

export const customAxios = axios.create({
  baseURL: baseLocation
})

const store = new Vuex.Store({
  state: {
    apiKey: '',
    baseLocation: baseLocation,
  },
  getters: {
    websocketUrl (state) {
      var url = (state.baseLocation + "/project/notifications")
      url = url.replace("http://", "ws://").replace("https://", "wss://") + "?"

      if(state.apiKey != '') {
        url += "api_key=" + state.apiKey + "&"
      }

      return url
    }
  },
  mutations: {
    updateAPIKey: function(state, newKey) { state.apiKey = newKey; }
  }
});

/*global CORE_API_KEY*/
/*eslint no-undef: "error"*/

let key = CORE_API_KEY
if(key == '' && localStorage.coreAPIKey) {
  key = localStorage.coreAPIKey
}

if(key != '') {
  customAxios.defaults.headers.common['X-API-Key'] = key
  store.commit('updateAPIKey', key)
}

Vue.prototype.$http = customAxios

const router = new VueRouter({
  routes // short for `routes: routes`
})

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
