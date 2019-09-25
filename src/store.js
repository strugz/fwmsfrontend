/* eslint-disable no-empty-pattern */
import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import moment from 'moment'
import router from './router.js'
import Cookies from 'js-cookie'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    CurThreads: [],
    CurClientDetails: {},
    CurThreadDetails: {},
    CurUserDetails: {},
    Notifications: [],
  },
  mutations: {
    upClient(state, val) {
      state.CurClientDetails = val
    },
    upTrdDetails(state, val) {
      state.CurThreadDetails = val
    },
    upCurUserDetails(state, val) {
      state.CurUserDetails = JSON.parse(val)
    },
    upCurThreads(state, val) {
      state.CurThreads = val
    },
    pushCurThreadCmm(state, val) {
      state.CurThreadDetails.TRDCMM.push(val)
    },
    pushCurThreads(state, val) {
      state.CurThreads.unshift(val)
    },
    pushNotification(state, val) {
      if (state.CurUserDetails.CNTMST.CNTMID !== val.NTFFRM.CNTMID) {
        state.Notifications.unshift(val)
      }
    },
    seenNotification(state, data) {
      state.Notifications[data.index].NTFSBY.push(data.usr_id)
    },
    upNotification(state, val) {
      state.Notifications = val
    },
  },
  actions: {
    userLogin({}, credentials) {
      return new Promise((resolve, reject) => {
        axios
          .post(`/user/login`, {
            username: credentials.username,
            password: credentials.password,
          })
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    getCurUserDetails({ commit }) {
      try {
        commit('upCurUserDetails', Cookies.get('user_details'))
      } catch (error) {
        console.log(error.message)
      }
    },
    getAcc({}, accId) {
      accId = accId !== undefined ? accId : ''
      return new Promise((resolve, reject) => {
        axios
          .get(`/account/${accId}`)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    getThreadByAccountId({}, accId) {
      return new Promise((resolve, reject) => {
        axios
          .get(`/threads/${accId}`)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    getThreadByAccountIdWithFilter({}, data) {
      return new Promise((resolve, reject) => {
        axios
          .get(`/threads/${data.id}${data.dept}`)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    getThreadDetailsById({ commit }, trdId) {
      return new Promise((resolve, reject) => {
        axios
          .get(`/threads/details/${trdId}`)
          .then(result => {
            commit('upTrdDetails', result.data)
            resolve(result.data)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    getThreadDetails({ commit }, trdId) {
      axios
        .get(`/threads/details/${trdId}`)
        .then(result => {
          commit('upTrdDetails', result.data)
        })
        .catch(error => {
          console.log(error)
        })
    },
    getProv() {
      return new Promise((resolve, reject) => {
        axios
          .get('/psgc/province')
          .then(result => {
            resolve(result.data.prov)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    getMuni({}, code) {
      return new Promise((resolve, reject) => {
        axios
          .get(`/psgc/province/${code}`)
          .then(result => {
            resolve(result.data.muni)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    getBRGY({}, code) {
      return new Promise((resolve, reject) => {
        axios
          .get(`/psgc/bgy/${code}`)
          .then(result => {
            resolve(result.data.bgy)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    getTransType({}, id) {
      return new Promise((resolve, reject) => {
        axios
          .get(`/account/department/${id}`)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    getRelativeTime({}, date) {
      return new Promise((resolve, reject) => {
        try {
          let time = moment().from(date, true)
          if (time.endsWith('days')) {
            resolve(moment(date).format('MMMM Do YYYY, hh:mm: a'))
          } else {
            resolve(time + ' ago')
          }
        } catch (error) {
          reject(error)
        }
      })
    },
    //Post
    postNewAccount({}, data) {
      return new Promise((resolve, reject) => {
        axios
          .post(`/account`, data)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    postComment({}, data) {
      return new Promise((resolve, reject) => {
        axios
          .post(`/threads/details/${data.id}`, {
            TRDCUI: data.userID,
            TRDCCM: data.text,
          })
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    postThread({}, data) {
      return new Promise((resolve, reject) => {
        axios
          .post(`/threads/`, data)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    updateThreadByID({}, data) {
      return new Promise((resolve, reject) => {
        axios
          .patch(`/threads/${data.id}`, data.val)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    //Notification
    getNotifications({ state, commit }, userID) {
      var USRID = state.CurUserDetails.CNTMST.CNTMID
      //notif
      return new Promise((resolve, reject) => {
        axios
          .get(`/notif?USRID=${USRID}`)
          .then(result => {
            commit('upNotification', result.data)
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    updateNotification({}, data) {
      return new Promise((resolve, reject) => {
        axios
          .patch(`/notif/${data.notif_id}`, { CNTMID: data.usr_id })
          .then(result => {
            resolve(result.data)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    //Socket
    msgSender({}, msg) {
      this._vm.$socket.emit('SEND_MESSAGE', msg)
    },
    msgListener({ commit }, msg) {
      const msgData = msg
      if (msgData.type == 'comment' && router.currentRoute.params.TRDMTI == msgData.data.TRDCTI.TRDMTI) {
        commit('pushCurThreadCmm', msgData.data)
      } else if (msgData.type == 'thread' && router.currentRoute.params.ACCMID == msgData.data.TRDMAC) {
        commit('pushCurThreads', msgData.data)
      }
      commit('pushNotification', msgData.notif)
    },
  },
})
