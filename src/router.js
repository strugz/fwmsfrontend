import Vue from 'vue'
import Router from 'vue-router'

// import regContact from './views/Forms/regContact.vue'
import Login from './views/Forms/Login.vue'
import home from './views/Forms/home.vue'
//
import cservice from '@/components/profilefrms/cservice.vue'
import crptsvc from '@/components/profilefrms/crptsvc.vue'
import p404 from './views/404.vue'

import Cookies from 'js-cookie'
import jwt from 'jsonwebtoken'

Vue.use(Router)

const ifNotAuthenticated = (to, from, next) => {
  jwt.verify(Cookies.get('token'), process.env.VUE_APP_PRIVATE_KEY, (err, decoded) => {
    if (decoded) {
      next('/')
      return
    }
  })
  next()
}

const ifAuthenticated = (to, from, next) => {
  jwt.verify(Cookies.get('token'), process.env.VUE_APP_PRIVATE_KEY, err => {
    if (err) {
      next('/Login')
      return
    }
  })
  next()
}

export default new Router({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    /*{
      path: '/testForm',
      name: 'testForm',
      component: testForm,
    },
    {
      path: '/regContact',
      name: 'regContact',
      component: regContact,
    },
    {
      path: '/usercontact',
      name: 'usercontact',
      component: usercontact,
    },
    {
      path: '/contactinfo',
      name: 'contactinfo',
      component: contactinfo,
      children: [
        {
          path: '/',
          name: 'userbasic',
          component: userbasic,
        },
        {
          path: '/usersettings',
          name: 'usersettings',
          component: usersettings,
        },
        {
          path: '/usercontact',
          name: 'usercontact',
          component: usercontact,
        },
      ],
    },*/
    // new Design
    {
      path: '/Login',
      name: 'Login',
      component: Login,
      beforeEnter: ifNotAuthenticated,
    },
    {
      path: '*',
      name: '404',
      component: p404,
    },
    {
      path: '/',
      name: 'home',
      component: home,
      beforeEnter: ifAuthenticated,
      children: [
        {
          path: '/customer/:ACCMID',
          component: cservice,
        },
        {
          path: '/thread/:TRDMTI',
          component: crptsvc,
        },
      ],
    },
  ],
})
