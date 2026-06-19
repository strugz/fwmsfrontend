/* eslint-disable no-empty-pattern */
import Vue from 'vue'
import Vuex from 'vuex'
import axios from '@/modules/shared/api/client'
import moment from 'moment'
import router from './router.js'
import Cookies from 'js-cookie'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    CurClientMID: '',
    CurCheckInAcc: {},
    CurThreads: [],
    Notifications: [],
    CurSRDetails: {},
    // Try to restore CurClientDetails from sessionStorage so it survives full page refreshes
    CurClientDetails: (() => {
      try {
        const raw = sessionStorage.getItem('CurClientDetails')
        return raw ? JSON.parse(raw) : {}
      } catch (e) {
        return {}
      }
    })(),
    CurThreadDetails: {},
    CurUserDetails: {},
    CurRecentVisit: [],
    CurClientList: [],
    CurCNTMSTList: [],
    CurItemCode: [],
    CurCSTMSTList: [],
    CurOCCMSTList: [],
    CurCSTMST: [],
    CurITIMSTList: [],
    CurServiceCalendar: [],
    SRTimerDialog: false,
    CurCSTMSTTableHeaders: [
      {
        text: 'Client',
        align: 'center',
        sortable: true,
        value: 'ACCMNM',
      },
      {
        text: 'Customer',
        align: 'center',
        sortable: false,
        value: 'CSTNME',
      },
      {
        text: 'Email Adress',
        align: 'center',
        sortable: false,
        value: 'CSTEML',
      },
      {
        text: 'Address',
        align: 'center',
        sortable: false,
        value: 'CSTADD',
      },
      {
        text: 'Contact Details',
        align: 'center',
        sortable: false,
        value: 'CSTCDL',
      },
      {
        text: 'Specialty / Position',
        align: 'center',
        sortable: false,
        value: 'CSTPOS',
      },
      {
        text: 'Target Product',
        align: 'center',
        sortable: false,
        value: 'CSTTPR',
      },
      // { text: 'Actions', align: 'center', value: 'name', sortable: false }
    ],
    CurCNTTableHeaders: [
      {
        text: 'Fullname',
        align: 'center',
        sortable: true,
        value: 'CNTMCN',
      },
      {
        text: 'Initial',
        align: 'center',
        sortable: true,
        value: 'CNTMNN',
      },
      {
        text: 'Area',
        align: 'center',
        sortable: true,
        value: 'CNTARE',
      },
      {
        text: 'Position',
        align: 'center',
        sortable: true,
        value: 'CNTEPS',
      },
      {
        text: 'Department',
        align: 'center',
        sortable: true,
        value: 'CNTDPT',
      },
    ],
    CurDPTItems: ['IMS', 'TSGLUZON', 'TSGVISMIN', 'PMD', 'TSR'],
    PageNumber: 1,
    TotalPages: 1,
    TextFilter: '',
    itemsAcct: [],
    CollectorPOVList: [],
    collectorDetails: [],
  },
  mutations: {
    upSRTimerDialog(state, val) {
      state.SRTimerDialog = val
    },
    upcollectorDetails(state, val) {
      state.collectorDetails = val
    },
    upCollectorPOVList(state, val) {
      state.CollectorPOVList = val
    },
    upCurITIMSTList(state, val) {
      state.CurITIMSTList = val
    },
    upCurServiceCalendar(state, val) {
      state.CurServiceCalendar = val
    },
    upCurServiceCalendarUpdate(state, val) {
      state.CurServiceCalendar.unshift(val)
    },
    upCurServiceCalendarDeleteItem(state, val) {
      state.CurServiceCalendar.shift(val)
    },
    upCurITIMSTListUpdate(state, val) {
      state.CurITIMSTList.unshift(val)
    },
    upCurClientMID(state, val) {
      state.CurClientMID = val
    },
    upCurCSTMST(state, val) {
      state.CurCSTMST = val
    },
    upCurItemCode(state, val) {
      state.CurItemCode = val
    },
    upClient(state, val) {
      state.CurClientDetails = val
      try {
        if (val && Object.keys(val).length) sessionStorage.setItem('CurClientDetails', JSON.stringify(val))
        else sessionStorage.removeItem('CurClientDetails')
      } catch (e) {
        // ignore session storage errors
      }
    },
    upAllClient(state, val) {
      state.CurClientList = val
    },
    upCNTMSTList(state, val) {
      state.CurCNTMSTList = val
    },
    upCSTMSTList(state, val) {
      state.CurCSTMSTList = val
    },
    upOCCMSTList(state, val) {
      state.CurOCCMSTList = val
    },
    upTrdDetails(state, val) {
      state.CurThreadDetails = val
    },
    upSRdDetails(state, val) {
      state.CurSRDetails = val
    },
    upCurUserDetails(state, val) {
      if (!val) {
        state.CurUserDetails = {}
        return
      }

      if (typeof val === 'object') {
        state.CurUserDetails = val
        return
      }

      try {
        state.CurUserDetails = JSON.parse(val)
      } catch (error) {
        state.CurUserDetails = {}
      }
    },
    upCurThreads(state, val) {
      state.CurThreads = val
    },
    upCurCheckInAcc(state, val) {
      state.CurCheckInAcc = val
    },
    pushCurThreadCmm(state, val) {
      state.CurThreadDetails.TRDCMM.unshift(val)
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
    upPageNumber(state, val) {
      state.PageNumber = val.pageNumber
    },
    upTotalPages(state, val) {
      state.TotalPages = val.totPages
    },
    upTextFilter(state, val) {
      state.TextFilter = val.textSearch
    },
    upCheckInAcc(state, val) {
      state.itemsAcct.unshift(val.items)
    },
    upRecentVisit(state, val) {
      state.CurRecentVisit = val
    },
  },
  actions: {
    getCollectorDetails({}, trdmtt) {
      return new Promise((resolve, reject) => {
        axios
          .get(`https://inventory.mdmpi.com.ph/api2/trdmst/collect/${trdmtt}`)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    getPOV({}, dpt) {
      return new Promise((resolve, reject) => {
        axios
          .get(`https://inventory.mdmpi.com.ph/api2/DRPMST/pov/${dpt}`)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    userLogin({}, credentials) {
      return new Promise((resolve, reject) => {
        axios
          .post(`/api2/USRMST`, {
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
    userGetPrivacy({}, usrId) {
      return new Promise((resolve, reject) => {
        axios
          .get(`https://inventory.mdmpi.com.ph/api2/USRMST/${usrId}`)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    userPrivacyAcceptanceInsert({}, val) {
      return new Promise((resolve, reject) => {
        axios
          .post(`/api2/USRMST/usrprv?cntmid=${val}`)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    getContacts({}, cntId) {
      return new Promise((resolve, reject) => {
        axios
          .get(`/contacts/${cntId}`)
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
    getCurCheckInAcc({ commit }, usrId) {
      return new Promise((resolve, reject) => {
        axios
          .get(`/api2/ACCMST/checkin/${usrId}`)
          .then(result => {
            commit('upCurCheckInAcc', result.data)

            resolve(result.data)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    getAccItinerary({}, accId) {
      accId = accId !== undefined ? accId : ''
      return new Promise((resolve, reject) => {
        axios
          .get(`/api2/ACCMST/${accId}`)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    getAcc({}, accId) {
      accId = accId !== undefined ? accId : ''
      return new Promise((resolve, reject) => {
        axios
          .get(`/api2/ACCMST/${accId}`)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    getAllAcc({}, accId) {
      accId = accId !== undefined ? accId : ''
      return new Promise((resolve, reject) => {
        axios
          .get(`/api2/ACCMST`)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    getAllCNTMST({}, accId) {
      accId = accId !== undefined ? accId : ''
      return new Promise((resolve, reject) => {
        axios
          .get(`/api2/cntmst`)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    getCNTMSTUserID({}, cntmid) {
      accId = accId !== undefined ? accId : ''
      return new Promise((resolve, reject) => {
        axios
          .get(`/api2/cntmst/${cntmid}`)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    getAllDepartment({}, dptmid) {
      dptmid = dptmid !== undefined ? dptmid : ''
      return new Promise((resolve, reject) => {
        axios
          .get(`/api2/dptmst`)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    getUserByDepartment({}, cntdpt) {
      cntdpt = cntdpt !== undefined ? cntdpt : ''
      return new Promise((resolve, reject) => {
        axios
          .get(`/api2/cntmst/department/` + `${cntdpt}`)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    updateForApproval({}, itimid) {
      itimid = itimid !== undefined ? itimid : ''
      return new Promise((resolve, reject) => {
        axios
          .patch(`/api2/itimst/approve/${itimid}`)
          // .patch(`https://localhost:44361/api/ITIMST/approve/${itimid}`)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    getUserItinerary({}, cntmid) {
      cntmid = cntmid !== undefined ? cntmid : ''
      return new Promise((resolve, reject) => {
        axios
          .get(`/api2/itimst/approval/` + `${cntmid}`)
          // .get(`https://localhost:44361/api/ITIMST/approval/` + `${cntmid}`)

          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    insertCNTMST({}, val) {
      return new Promise((resolve, reject) => {
        const Opheaders = {
          method: 'POST',
          data: val.data,
          headers: {
            'content-type': 'application/json',
          },
          url: 'https://inventory.mdmpi.com.ph/api2/CNTMST/',
        }
        axios(Opheaders)
          .then(res => {
            resolve(res.data)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    getAllITIMST({}, accId) {
      accId = accId !== undefined ? accId : ''
      return new Promise((resolve, reject) => {
        axios
          .get(`/api2/ITIMST`)
          .then(result => {
            resolve(result.data)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    getITIMSTPerCNT({}, accId) {
      accId = accId !== undefined ? accId : ''
      return new Promise((resolve, reject) => {
        axios
          .get(`/api2/ITIMST/cnt/` + `${accId}`)
          // .get(`https://localhost:44361/api/ITIMST/cnt/` + `${accId}`)
          .then(result => {
            resolve(result.data)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    getServiceCalendar({}, val) {
      return new Promise((resolve, reject) => {
        const Opheaders = {
          method: 'POST',
          data: val.data,
          headers: {
            'content-type': 'application/json',
          },
          // url: `https://localhost:44361/api/TRDMST/calendar/` + `${val.cntmid}`,
          url: `/api2/TRDMST/calendar/` + `${val.cntmid}`,
        }

        axios(Opheaders)
          .then(result => {
            resolve(result.data)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    insertLVEMST({}, val) {
      return new Promise((resolve, reject) => {
        const Opheaders = {
          method: 'POST',
          data: val.data,
          headers: {
            'content-type': 'application/json',
          },
          url: `/api2/ITIMST/lve`,
          // url: `https://localhost:44361/api/ITIMST/lve`,
        }
        axios(Opheaders)
          .then(res => {
            resolve(res)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    insertITIMST({}, val) {
      return new Promise((resolve, reject) => {
        const Opheaders = {
          method: 'POST',
          data: val.data,
          headers: {
            'content-type': 'application/json',
          },
          url: 'https://inventory.mdmpi.com.ph/api2/ITIMST/',
        }
        axios(Opheaders)
          .then(res => {
            resolve(res)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    insertITIMSTTSG({}, val) {
      return new Promise((resolve, reject) => {
        const Opheaders = {
          method: 'POST',
          data: val.data,
          headers: {
            'content-type': 'application/json',
          },
          // url: 'https://localhost:44361/api/ITIMST/tsg',
          url: 'https://inventory.mdmpi.com.ph/api2/ITIMST/tsg',
        }
        axios(Opheaders)
          .then(res => {
            resolve(res)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    getITIMST({}, val) {
      return new Promise((resolve, reject) => {
        axios
          .get('https://inventory.mdmpi.com.ph/api2/ITIMST/iti' + `/${val}`)
          .then(result => {
            resolve(result.data)
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    getITIMSTValidation({}, val) {
      return new Promise((resolve, reject) => {
        const Opheaders = {
          method: 'POST',
          data: val.data,
          headers: {
            'content-type': 'application/json',
          },
          url: 'https://inventory.mdmpi.com.ph/api2/ITIMST/validation',
        }
        axios(Opheaders)
          .then(res => {
            resolve(res)
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    getITIMSTTRDValidation({}, val) {
      return new Promise((resolve, reject) => {
        const Opheaders = {
          method: 'POST',
          data: val.data,
          headers: {
            'content-type': 'application/json',
          },
          url: 'https://inventory.mdmpi.com.ph/api2/ITIMST/trd/validation',
        }
        axios(Opheaders)
          .then(res => {
            resolve(res)
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    getInstrumentByAccId({}, accId) {
      return new Promise((resolve, reject) => {
        axios
          .get('https://inventory.mdmpi.com.ph/api/instruments/account' + `/${accId}`)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    getItemCode({}, accId) {
      accId = accId !== undefined ? accId : ''
      return new Promise((resolve, reject) => {
        axios
          .get('https://inventory.mdmpi.com.ph/api/drops/ITEM_CODE')
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    getThreadByAccountId({}, val) {
      return new Promise((resolve, reject) => {
        axios
          .get(
            'https://inventory.mdmpi.com.ph/api2/TRDMST' +
              `/${val.cntdpt}` +
              `/${val.accID}` +
              `?PageNumber=${val.pageNumber}&PageSize=25`
          )
          // .get('https://localhost:44361/api/TRDMST' + `/${val.cntdpt}` + `/${val.accID}` + `?PageNumber=${val.pageNumber}&PageSize=25`)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    //Collection
    InsertStartCollection({}, val) {
      return new Promise((resolve, reject) => {
        const Opheaders = {
          method: 'POST',
          data: val.data,
          headers: {
            'content-type': 'application/json',
          },
          url: 'https://sr.mdmpi.com.ph/sr/collectionreport/begincollection',
        }
        axios(Opheaders)
          .then(res => {
            resolve(res)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    //New Update
    getThreadForBackTrack({}, val) {
      return new Promise((resolve, reject) => {
        axios
          .get('/api2/TRDMST/backtrack' + `/${val.cntare}` + `?PageNumber=${val.pageNumber}&PageSize=25`)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    //ImageViewer
    getImageLink({}, val) {
      return new Promise((resolve, reject) => {
        axios
          .get('api2/IMGMST' + `/${val}`)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    //
    //OCC
    getOCCMST({}, val) {
      console.log(val)
      return new Promise((resolve, reject) => {
        axios
          .get('https://inventory.mdmpi.com.ph/api2/occmst/' + val)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    InsertOCCMST({}, val) {
      return new Promise((resolve, reject) => {
        const Opheaders = {
          method: 'POST',
          data: val.data,
          headers: {
            'content-type': 'application/json',
          },
          url: 'https://inventory.mdmpi.com.ph/api2/OCCMST',
        }
        axios(Opheaders)
          .then(res => {
            resolve(res.status)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    InsertOCCMSTImport({}, val) {
      return new Promise((resolve, reject) => {
        const Opheaders = {
          method: 'POST',
          data: val,
          headers: {
            'content-type': 'application/json',
          },
          url: 'https://inventory.mdmpi.com.ph/api2/OCCMST/occimport',
        }
        axios(Opheaders)
          .then(res => {
            resolve(res.status)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    //
    //MEDREP Vist Retrieve data
    InsertCSTMST({}, val) {
      return new Promise((resolve, reject) => {
        const Opheaders = {
          method: 'POST',
          data: val.data,
          headers: {
            'content-type': 'application/json',
          },
          // url: 'https://localhost:44361/api/CSTMST/',
          url: 'https://inventory.mdmpi.com.ph/api2/CSTMST/',
        }
        axios(Opheaders)
          .then(res => {
            resolve(res.data)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    getCSTMSTPerCust({}, cstmid) {
      return new Promise((resolve, reject) => {
        axios
          .get('https://inventory.mdmpi.com.ph/api2/CSTMST/percust' + `/${cstmid}`)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    getCSTMSTPerAcc({}, val) {
      return new Promise((resolve, reject) => {
        axios
          .get('https://inventory.mdmpi.com.ph/api2/CSTMST' + `/${val.accmid}` + `/${val.cntmid}`)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    getCSTMSTcntacc({}, val) {
      return new Promise((resolve, reject) => {
        axios
          .get('https://inventory.mdmpi.com.ph/api2/CSTMST/cntacc' + `/${val.cntmid}`)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    getCSTMSTAllAcc({}, val) {
      console.log(val)
      return new Promise((resolve, reject) => {
        axios
          .get('https://inventory.mdmpi.com.ph/api2/CSTMST')
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    getTRDMST({}, val) {
      return new Promise((resolve, reject) => {
        const Opheaders = {
          method: 'POST',
          data: val.data,
          headers: {
            'content-type': 'application/json',
          },
          url: 'https://inventory.mdmpi.com.ph/api2/TRDMST/',
        }
        axios(Opheaders)
          .then(res => {
            resolve(res.data)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    getTRLMSTOnGoing({}, val) {
      return new Promise((resolve, reject) => {
        const Opheaders = {
          method: 'POST',
          data: val.data,
          headers: {
            'content-type': 'application/json',
          },
          url: 'https://inventory.mdmpi.com.ph/api2/TRLMST/ongoing',
        }
        axios(Opheaders)
          .then(res => {
            resolve(res)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    InsertTRLMST({}, val) {
      return new Promise((resolve, reject) => {
        const Opheaders = {
          method: 'POST',
          data: val.data,
          headers: {
            'content-type': 'application/json',
          },
          url: 'https://inventory.mdmpi.com.ph/api2/TRLMST',
        }
        axios(Opheaders)
          .then(res => {
            resolve(res)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    //END MEDREP

    getRecentVisit({}, val) {
      return new Promise((resolve, reject) => {
        axios
          .get('/api2/RCTVST/' + val.CNTMID)
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
          .get(
            `/api2/TRDMST/filter/${data.cntdpt}/${data.accmid}/${data.tosearch}?PageNumber=${data.pageNumber}&PageSize=25`
          )
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    getThreadDetailsByTRDMID({}, trdmtt) {
      return new Promise((resolve, reject) => {
        axios
          .get(`/api2/TRDMST/trd/${trdmtt}`)
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
          .get(`/api2/TRDMST/thread/${trdId}`)
          .then(result => {
            commit('upTrdDetails', result.data)
            resolve(result.data)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    filterAcct({}, filter) {
      return new Promise((resolve, reject) => {
        axios
          .get(`/api2/ACCMST/filter/${filter}`, { params: { api_key: process.env.VUE_APP_PRIVATE_KEY } })
          .then(result => {
            resolve(result.data)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    filterAcctItinerary({}, filter) {
      return new Promise((resolve, reject) => {
        axios
          .get(`/api2/ACCMST/filter/${filter}`)
          .then(result => {
            resolve(result.data)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    cancelMyItinerary({}, data) {
      return new Promise((resolve, reject) => {
        axios
          .patch(`/api2/itimst/cancel/${data.itimid}`)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    deleteSRCalendarAdditional({}, data) {
      return new Promise((resolve, reject) => {
        axios
          .patch(`/api2/itimst/modify/${data.lvecnt}`, {
            lvedte: data.lvedte,
            lvedsc: data.lvedsc,
          })
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    deleteLVETSR({}, data) {
      return new Promise((resolve, reject) => {
        axios
          .patch(`/api2/itimst/modifyLVETSR/${data.lvecnt}`, {
            lvedte: data.lvedte,
            lvedsc: data.lvedsc,
          })
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    deleteITITSR({}, data) {
      return new Promise((resolve, reject) => {
        axios
          .delete(`/api2/itimst/modifyITITSR/${data.itimid}`)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    getSRDetailsById({ commit }, trdId) {
      return new Promise((resolve, reject) => {
        axios
          .get(`https://sr.mdmpi.com.ph/sr/servicereport/${trdId}`)
          .then(result => {
            commit('upSRdDetails', result.data)
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
    getOTP({}, data) {
      return new Promise((resolve, reject) => {
        axios
          .post(`/api2/USRMST/otp`, {
            // .post(`https://localhost:44361/api/USRMST/otp`, {
            usr_initial: data.usr_initial,
          })
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
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
    postNewUser({}, data) {
      return new Promise((resolve, reject) => {
        axios
          .post('/user/newuser', data)
          .then(res => {
            resolve(res)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    postNewPassword({}, data) {
      return new Promise((resolve, reject) => {
        axios
          .post('api2/USRMST/change-password', {
            USRMUI: data.username,
            USRMPW: data.curpass,
            NewPassword: data.newpassword,
          })
          .then(res => {
            resolve(res)
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
          .post(`/api2/TRDMST`, data)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    postContact({}, data) {
      return new Promise((resolve, reject) => {
        axios
          .patch(`/contacts/${data.id}`, data.val)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    postContactDetails({}, data) {
      return new Promise((resolve, reject) => {
        axios
          .patch(`/contacts/${data.id}`, data.val)
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
    updateContacts({}, data) {
      return new Promise((resolve, reject) => {
        axios
          .patch(`/contacts/${data.id}`, data.val)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    //Notification
    // eslint-disable-next-line no-unused-vars
    getNotifications({ state, commit }, userID) {
      var USRID = state.CurUserDetails.CNTMST.CNTMID
      //notif
      return new Promise((resolve, reject) => {
        axios
          .get(`/api2/NTFDTL/notif/${USRID}`)
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
          .patch(`/api2/NTFDTL/${data.notif_id}`, {
            NTFSBY: data.usr_id,
          })
          .then(result => {
            resolve(result.data)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    //Socket
    // msgSender({ }, msg) {
    //   this._vm.$socket.emit('SEND_MESSAGE', msg)
    // },
    // msgListener({ commit }, msg) {
    //   const msgData = msg
    //   if (msgData.type == 'comment' && router.currentRoute.params.TRDMTI == msgData.data.TRDCTI.TRDMTI) {
    //     commit('pushCurThreadCmm', msgData.data)
    //   } else if (msgData.type == 'thread' && router.currentRoute.params.ACCMID == msgData.data.TRDMAC) {
    //     commit('pushCurThreads', msgData.data)
    //   }
    //   // commit('pushNotification', msgData.notif)
    // },
  },
})
