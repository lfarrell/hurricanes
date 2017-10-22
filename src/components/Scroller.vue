<template>
  <div id="scrolling">
    <ul id="scroller-list">
      <li v-for="h in selectedHurricanes">
        <h5 class="text-center">{{ h.name }}</h5>
        <p>
          {{h.date}}
          Wind: {{h.mph}} mph<br/>
          Latitude: {{h.display_lat}}<br/>
          Longitude: {{h.display_lng}}<br/>
        </p>
      </li>
    </ul>
  </div>
</template>

<script>
  import * as _ from 'lodash';

  export default {
    name: 'Scroller',

    computed: {
      selectedHurricanes() {
        let hurricanes = _.groupBy(this.$store.getters.getSelectedHurricanes, 'name');
        let names = Object.keys(hurricanes);

        return names.map(d => {
          return _.last(hurricanes[d], 'name');
        });
      }
    }
  }
</script>

<style scoped>
  #scrolling {
    overflow: hidden;
    height: 800px;
    margin-right: 0;
  }

  #scroller-list {
    margin: 0;
    padding-left: 5px;
  }

  #scroller-list li {
    list-style-type: none;
    color: white;
    text-align: center;
    padding-top: 10px;
  }

  p {
    font-size: .9rem;
  }
</style>
