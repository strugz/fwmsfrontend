<template>
  <div class="home-shell">
    <v-main v-if="hasUserDetails" app class="home-main" :class="{ 'home-main--mobile': isMobileShell }">
      <v-app-bar app flat height="72" extension-height="38" class="home-app-bar">
        <div class="home-brand" @click="backToHomePage">
          <v-avatar size="36" color="teal darken-3" class="mr-3">
            <v-icon color="white">forum</v-icon>
          </v-avatar>
          <div>
            <div class="home-brand__title">FWMS</div>
            <div class="home-brand__subtitle hidden-sm-and-down">Field Workforce Management</div>
          </div>
        </div>

        <div class="home-search">
          <client-search></client-search>
        </div>

        <v-spacer></v-spacer>
        <v-menu v-if="isAdmin" transition="slide-y-transition" bottom offset-y>
          <template v-slot:activator="{ on }">
            <v-btn icon color="teal darken-2" class="home-icon-btn" v-on="on">
              <v-icon>settings</v-icon>
            </v-btn>
          </template>
          <v-list dense>
            <v-list-item>
              <span class="v-list-item__title body-1">{{ 'Client Manager' }}</span>
            </v-list-item>
            <v-list-item>
              <acc-manager></acc-manager>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-menu transition="slide-y-transition" bottom offset-y>
          <template v-slot:activator="{ on }">
            <v-btn icon color="teal darken-2" class="home-icon-btn" v-on="on">
              <v-icon>account_circle</v-icon>
            </v-btn>
          </template>
          <v-list dense>
            <v-list-item>
              <change-pass></change-pass>
            </v-list-item>
            <v-list-item v-if="canBackTrack">
              <back-track></back-track>
            </v-list-item>
            <v-list-item v-if="isAdminLeader">
              <user-manager></user-manager>
            </v-list-item>
            <v-list-item v-if="isAdminLeader">
              <customer-manager></customer-manager>
            </v-list-item>
            <v-list-item v-if="canOpenServiceCalendar">
              <span @click="goTo">Service Calendar</span>
            </v-list-item>
            <v-list-item v-if="canOpenItineraryViewer">
              <span @click="goToViewer">Itinerary Viewer</span>
            </v-list-item>
            <v-list-item v-if="canOpenPsViewer">
              <span @click="goToPSCalendarViewer">PS Viewer</span>
            </v-list-item>
            <v-list-item v-if="canOpenCalendarViewer">
              <span @click="goToServiceCalendarViewer">Calendar Viewer</span>
            </v-list-item>
            <v-list-item v-if="canOpenOutbox">
              <span @click="gotoSROutbox">Outbox</span>
            </v-list-item>
            <v-list-item @click="logout()">
              <span class="v-list-item__title body-1">{{ 'Logout' }}</span>
            </v-list-item>
          </v-list>
        </v-menu>
        <template v-slot:extension>
          <div class="home-breadcrumbs">
            <bread-crumb></bread-crumb>
          </div>
        </template>
      </v-app-bar>
      <div id="helloElement"></div>
      <div class="home-content">
        <router-view :key="$route.fullPath" />
      </div>
    </v-main>
    <v-main v-else app class="home-loading">
      <div class="home-loading__panel">
        <v-progress-circular indeterminate color="teal darken-2" size="42" width="4"></v-progress-circular>
        <div class="home-loading__title">Preparing your workspace</div>
        <div class="home-loading__text">Loading your account access and starting route.</div>
      </div>
    </v-main>
  </div>
</template>
<script>
import clientSearch from '@/components/searchClient'
import changePass from '@/components/changePass'
import accManager from '@/components/accmanager'
import breadCrumb from '@/components/breadCrumbs'
import backTrack from '@/components/SRBackTrack'
import customerManager from '@/components/CustomerManager'
import userManager from '@/components/UserRegistrationManager'
import { canViewRecentVisits, shouldOpenItinerary } from '@/modules/auth/sections'
import { mapState, mapActions, mapMutations } from 'vuex'
import Cookies from 'js-cookie'

const ITINERARY_VIEWER_DEPARTMENTS = ['BUVISMIN', 'TSRVISMIN', 'AHBU', 'POCT', 'IMG']
const CALENDAR_VIEWER_DEPARTMENTS = ['TSGLUZON', 'IMS', 'COLLECTOR']
const PS_VIEWER_DEPARTMENTS = ['POCT', 'PMDLUZON']

export default {
  components: {
    breadCrumb,
    changePass,
    accManager,
    clientSearch,
    backTrack,
    customerManager,
    userManager,
  },
  computed: {
    ...mapState(['CurClientDetails', 'CurUserDetails']),
    hasUserDetails() {
      return Boolean(this.CurUserDetails && this.CurUserDetails.USRDTL && this.CurUserDetails.CNTMST)
    },
    isMobileShell() {
      return Boolean(this.$vuetify && this.$vuetify.breakpoint && this.$vuetify.breakpoint.smAndDown)
    },
    userDetails() {
      return this.CurUserDetails || {}
    },
    userAccount() {
      return this.userDetails.USRDTL || {}
    },
    contactDetails() {
      return this.userDetails.CNTMST || {}
    },
    currentUserId() {
      return this.userAccount.USRDCI
    },
    department() {
      return this.contactDetails.CNTDPT || ''
    },
    section() {
      return this.contactDetails.CNTSEC || ''
    },
    leader() {
      return this.contactDetails.CNTLDR || ''
    },
    isHead() {
      return this.leader === 'HEAD'
    },
    isAdminLeader() {
      return this.leader === 'ADMIN'
    },
    isAdmin() {
      const roles = this.userAccount.USRDRT || {}
      return Object.prototype.hasOwnProperty.call(roles, 'ADMIN')
    },
    canBackTrack() {
      return this.leader === 'TL' && this.department !== 'IMG'
    },
    canOpenServiceCalendar() {
      const departmentPrefix = this.department.substring(0, 3)
      return (
        departmentPrefix === 'TSG' ||
        departmentPrefix === 'PMD' ||
        this.section.includes('PS') ||
        this.section.includes('IMS') ||
        this.department === 'COLLECTOR'
      )
    },
    canOpenItineraryViewer() {
      return this.isHead && ITINERARY_VIEWER_DEPARTMENTS.includes(this.department)
    },
    canOpenCalendarViewer() {
      return this.isHead && CALENDAR_VIEWER_DEPARTMENTS.includes(this.department)
    },
    canOpenPsViewer() {
      return this.isHead && PS_VIEWER_DEPARTMENTS.includes(this.department)
    },
    canOpenOutbox() {
      return this.department.includes('TSG') || this.department.includes('IMS')
    },
    canViewRecentVisits() {
      return canViewRecentVisits(this.section)
    },
  },
  mounted() {
    if (!this.hasUserDetails) return

    this.userGetPrivacy(this.currentUserId).catch(error => {
      this.logout()
      console.error(error)
    })
  },
  created() {
    if (!this.hasUserDetails) {
      this.getCurUserDetails()
    }
    if (!this.hasUserDetails) {
      this.logout()
      return
    }

    this.getCurCheckInAcc(this.currentUserId).then(res => {
      if (res && res.serviceLocLogAction !== 'CheckOut') {
        if (res.customerID !== undefined) {
          this.upCheckInAcc({ items: res.customerID })
        }
      }
    })
    this.ValidationItinerary()
  },
  methods: {
    ...mapActions(['getCurCheckInAcc', 'getRecentVisit', 'userGetPrivacy', 'getCurUserDetails']),
    ...mapMutations(['upCheckInAcc', 'upRecentVisit']),
    logout() {
      Cookies.remove('token', { path: '/' })
      Cookies.remove('user_details', { path: '/' })
      this.$router.replace({ name: 'Login' })
    },
    goTo() {
      this.$router.push({ path: `/servicecalendar/${this.currentUserId}` })
    },
    goToViewer() {
      this.$router.push({ path: `/itineraryviewer` })
    },
    goToServiceCalendarViewer() {
      this.$router.push({ path: `/servicecalendarviewer` })
    },
    goToPSCalendarViewer() {
      this.$router.push({ path: `/pscalendarviewer` })
    },
    gotoSROutbox() {
      this.$router.push({ name: 'sroutbox' })
    },
    backToHomePage() {
      if (!this.canViewRecentVisits) {
        this.ValidationItinerary()
        return
      }

      this.goToRecentVisits()
    },

    ValidationRecentVisit() {
      this.getRecentVisit({ CNTMID: this.currentUserId }).then(res => {
        this.upRecentVisit(res.data)
        if (res.data.length === undefined) {
          this.$router.push('/')
          return
        }
        this.goToRecentVisits()
      })
    },
    ValidationItinerary() {
      if (shouldOpenItinerary(this.section)) {
        this.goToItinerary()
      } else if (this.canViewRecentVisits) {
        this.ValidationRecentVisit()
      }
    },
    routeMatches(name, params) {
      return (
        this.$route.name === name &&
        Object.keys(params).every(key => String(this.$route.params[key]) === String(params[key]))
      )
    },
    goToRecentVisits() {
      const params = { RCTCNT: this.currentUserId }
      if (!this.routeMatches('recentvisit', params)) {
        this.$router.push({ name: 'recentvisit', params })
      }
    },
    goToItinerary() {
      const params = { CNTMID: this.currentUserId }
      if (!this.routeMatches('mritinerary', params)) {
        this.$router.push({ name: 'mritinerary', params })
      }
    },
  },
}
</script>
<style>
.home-shell,
.home-main {
  min-height: 100vh;
  width: 100%;
}

.home-loading {
  align-items: center;
  background: linear-gradient(135deg, #f8fafc, #ecfdf5);
  display: flex;
  justify-content: center;
  min-height: 100vh;
}

.home-loading__panel {
  align-items: center;
  color: #64748b;
  display: flex;
  flex-direction: column;
  padding: 32px;
  text-align: center;
}

.home-loading__title {
  color: #0f172a;
  font-size: 1rem;
  font-weight: 700;
  margin-top: 16px;
}

.home-loading__text {
  font-size: 0.88rem;
  margin-top: 4px;
}

.home-main--mobile .home-content {
  padding-bottom: 24px;
}

.home-app-bar {
  border-bottom: 1px solid rgba(15, 76, 76, 0.1) !important;
  background: rgba(255, 255, 255, 0.94) !important;
  backdrop-filter: blur(12px);
}

.home-brand {
  align-items: center;
  cursor: pointer;
  display: flex;
  min-width: 150px;
}

.home-brand__title {
  color: #0f172a;
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.1;
}

.home-brand__subtitle {
  color: #64748b;
  font-size: 0.74rem;
  line-height: 1.2;
}

.home-search {
  flex: 1 1 640px;
  max-width: 760px;
  padding: 0 24px;
}

.home-icon-btn {
  background: rgba(15, 118, 110, 0.08);
  margin-left: 8px;
}

.home-breadcrumbs {
  align-items: center;
  display: flex;
  min-height: 38px;
  padding-left: 20px;
  width: 100%;
}

.home-content {
  min-height: calc(100vh - 110px);
  padding: 24px;
}

@media (max-width: 960px) {
  .home-search {
    max-width: none;
    padding: 0 12px;
  }
}

@media (max-width: 600px) {
  .home-app-bar {
    height: auto !important;
  }

  .home-brand {
    min-width: 0;
  }

  .home-search {
    flex-basis: 100%;
    order: 3;
    padding: 8px 0 0;
  }

  .home-content {
    padding: 16px;
  }
}
</style>
