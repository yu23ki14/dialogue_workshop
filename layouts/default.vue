<template lang="pug">
  div
    nav.navbar.header.has-shadow.is-warning(role='navigation' aria-label='main navigation')
      .navbar-brand
        .title.is-4.navbar-item
          |Clustra
          span.subtitle.is-6
            |developed by Yuki Kawabe
        .navbar-burger
          span
            span
              span
    section.main-content.columns
      .container.column.is-12
        nuxt
</template>

<script>
export default {
  data () {
    return {
      items: [
        {
          title: 'Home',
          icon: 'home',
          to: { name: 'index' }
        },
        {
          title: 'Inspire',
          icon: 'lightbulb',
          to: { name: 'inspire' }
        }
      ]
    }
  }
}
</script>

<style lang="sass">
.navbar-brand
  .title:not(:last-child)
    margin-bottom: 0
  .subtitle
    padding-left: 10px
.navbar-item
  padding: 0.3rem 0.75rem 0
  align-items: baseline
.title
  &.is-6
    font-size: 1.15rem
.subtitle
  &.is-6
    font-size: .9rem
</style>