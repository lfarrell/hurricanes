import Vue from 'vue'
import Router from 'vue-router'
import Map from '@/components/Map'

Vue.use(Router)

export default new Router({
  base: '/hurricanes/',

  routes: [
    {
      path: '/',
      name: 'Map',
      component: Map
    }
  ]
})
