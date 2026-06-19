import Cookies from 'js-cookie'

const hasToken = () => Boolean(Cookies.get('token'))

export const ifNotAuthenticated = (to, from, next) => {
  if (hasToken()) {
    next('/')
    return
  }

  next()
}

export const ifAuthenticated = (to, from, next) => {
  if (!hasToken()) {
    next({ name: 'Login' })
    return
  }

  next()
}
