<template>
  <div>
    <vue-slider ref="slider"
                @callback="updateSlider"
                v-bind="slider_data"
                v-model="slider_data.value"></vue-slider>
    <div id="controls">
      <button id="start"></button>
      <button id="stop"></button>
      <button id="pause"></button>
      <span id="faster">+</span><span id="slower">-</span>
    </div>
  </div>
  <map :hurricaneData="hurricaneData"
    :scale=""></map>
</template>

<script>
  import * as d3 from 'd3';
  import * as _ from 'lodash';
  import vueSlider from 'vue-slider-component';
  import Map from './Map';

  export default {
    name: 'Timer',

    data() {
      return {
        hurricaneData: [],
        slider_data: {
          value: '2015-11-18 18:00:00',
          width: '80%',
          formatter: function(value) {
            let formatting = d3.timeFormat('%b, %Y');
            let create_date = d3.timeParse("%Y-%m-%d %H:%M:%S");
            return formatting(create_date(value));
          },
          style: {
            marginLeft: '10%',
            marginBottom: '1%'
          },
          data: []
        }
      }
    },

    components: {
      vueSlider,
      Map: Map
    },

    methods: {
      updateSlider(val) {
        return this.hurricaneData.filter(function(d) {
          return d.time === val;
        });
      },

      draw() {
        let vm = this;
        d3.csv('static/data/2016.csv', function(data) {
          vm.hurricaneData = data;
        });
      }
    }
  }
</script>
