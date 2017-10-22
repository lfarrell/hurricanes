<template>
  <div id="scrolling">
    <ul id="scroller-list">
      <li v-for="h in selectedHurricanes">
        <h5 class="text-center">{{ h.name }}</h5>
        <p>Wind: {{h.mph}} mph<br/>
           {{h.date}}</p>
      </li>
    </ul>
  </div>
</template>

<script>
  import * as d3 from 'd3';
  import * as _ from 'lodash';

  export default {
    name: 'Scroller',

    data() {
      return {
        height: 700
      }
    },

    computed: {
      selectedHurricanes() {
        return _.uniqBy(this.$store.getters.getSelectedHurricanes,
          (d) => _.last(d.name));
      }
    }
  }
</script>

<style scoped>
  #scrolling {
    overflow: hidden;
    margin-left: 5px;
    height: 500px;
  }

  #scroller-list {
    margin: 15px 15px 15px 0;
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
