import Vue from 'vue'

const BREAKPOINTS = ['xs', 'sm', 'md', 'lg', 'xl']
const UTILITY_ATTR = /^(m|p)(a|x|y|t|r|b|l|s|e)?-\d+$/

const truthyAttrs = data => {
  const attrs = data.attrs || {}
  return Object.keys(attrs).filter(key => attrs[key] !== false && attrs[key] !== null && attrs[key] !== undefined)
}

const addUtilityClasses = (classes, attrs) => {
  attrs.forEach(attr => {
    if (UTILITY_ATTR.test(attr) || attr === 'fill-height') {
      classes.push(attr)
    }
  })
}

const layoutClasses = attrs => {
  const classes = ['legacy-v-layout', 'd-flex']

  if (attrs.includes('column')) {
    classes.push('flex-column')
  } else if (attrs.includes('column-reverse')) {
    classes.push('flex-column-reverse')
  } else if (attrs.includes('row-reverse')) {
    classes.push('flex-row-reverse')
  } else {
    classes.push('flex-row')
  }

  if (attrs.includes('wrap')) classes.push('flex-wrap')
  if (attrs.includes('align-center')) classes.push('align-center')
  if (attrs.includes('align-start')) classes.push('align-start')
  if (attrs.includes('align-end')) classes.push('align-end')
  if (attrs.includes('align-stretch')) classes.push('align-stretch')
  if (attrs.includes('justify-center')) classes.push('justify-center')
  if (attrs.includes('justify-start')) classes.push('justify-start')
  if (attrs.includes('justify-end')) classes.push('justify-end')
  if (attrs.includes('justify-space-between')) classes.push('justify-space-between')
  if (attrs.includes('justify-space-around')) classes.push('justify-space-around')
  if (attrs.includes('justify-space-evenly')) classes.push('justify-space-evenly')
  addUtilityClasses(classes, attrs)

  return classes
}

const flexClasses = attrs => {
  const classes = ['legacy-v-flex']
  let hasBreakpoint = false

  attrs.forEach(attr => {
    const match = attr.match(/^(xs|sm|md|lg|xl)(\d{1,2})$/)
    if (match) {
      hasBreakpoint = true
      const [, breakpoint, size] = match
      classes.push(breakpoint === 'xs' ? `col-${size}` : `col-${breakpoint}-${size}`)
    }
  })

  if (attrs.includes('x12')) {
    hasBreakpoint = true
    classes.push('col-12')
  }

  if (!hasBreakpoint) {
    classes.push('col')
  }

  if (attrs.includes('align-self-start')) classes.push('align-self-start')
  if (attrs.includes('align-self-center')) classes.push('align-self-center')
  if (attrs.includes('align-self-end')) classes.push('align-self-end')
  addUtilityClasses(classes, attrs)

  return classes
}

Vue.component('VLayout', {
  functional: true,
  render(h, context) {
    return h(
      'div',
      {
        ...context.data,
        staticClass: [context.data.staticClass, ...layoutClasses(truthyAttrs(context.data))].filter(Boolean).join(' '),
      },
      context.children
    )
  },
})

Vue.component('VFlex', {
  functional: true,
  render(h, context) {
    return h(
      'div',
      {
        ...context.data,
        staticClass: [context.data.staticClass, ...flexClasses(truthyAttrs(context.data))].filter(Boolean).join(' '),
      },
      context.children
    )
  },
})
