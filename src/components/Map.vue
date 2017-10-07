<template>
  <div class="row">
      <vue-slider ref="slider"
                  @callback="updateSlider"
                  v-bind="slider_data"
                  v-model="slider_data.value"></vue-slider>

    <div class="col-sm-12 col-lg-12 ">
      <button  @click="animateGraph()" type="button" class="btn btn-secondary" id="start">Start</button>
      <button  @click="stopAnimation()" type="button" class="btn btn-secondary" id="stop">Stop</button>
      <button  @click="stopAnimation()" type="button" class="btn btn-secondary" id="pause">Pause</button>
      <button  @click="fasterAnimation()" type="button" class="btn btn-secondary" id="faster">+</button>
      <button  @click="slowerAnimation()" type="button" class="btn btn-secondary" id="slower">-</button>
     </div>
    <svg id="map" :width="width" height="800px">
      <g>
        <template v-for="(d, index) in filtered_hurricanes">
          <circle :id="d.name + index"
                  :cx="projection([+d.lng, +d.lat])[0]"
                  :cy="projection([+d.lng, +d.lat])[1]"
                  fill="red"
                  :r="scale(+d.wind)"></circle>
        </template>
      </g>
    </svg>
  </div>
</template>

<script>
  import * as d3 from 'd3';
  import * as _ from 'lodash';
  import vueSlider from 'vue-slider-component';

  export default {
    name: 'Map',

    data() {
      return {
        width: window.innerWidth,
        height: 800,
        hurricanes: [],
        filtered_hurricanes: [],
        map: {},
        scale: {},
        projection: {},
        slider_values_length: 0,
        current_slider_index: 0,
        animated: false,
        animating: {},
        animationInterval: 100,
        slider_data: {
          value: '2015-11-18 18:00:00',
          width: '80%',
          speed: .5,
          formatter: function(value) {
            let formatting = d3.timeFormat('%b %d %I:%M %p, %Y');
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
      vueSlider
    },

    methods: {
      updateSlider(val) {
        this.filtered_hurricanes = this.filteredData(val);
      },

      animateGraph() {
        let current_index = this.getIndex('slider');
        this.animated = true;

        let timing = d3.interval((elapsed) => {
          if(this.current_slider_index > this.slider_values_length) {
            timing.stop();
          }
          this.current_slider_index = current_index += 1;
          this.setIndex('slider', this.current_slider_index);
        }, this.animationInterval);

        this.animating = timing;
      },

      stopAnimation() {
        if(this.animated) {
          this.animating.stop();
        }
      },

      fasterAnimation() {
        let interval = this.animationInterval;
        let speed = this.slider_data.speed;
        this.animationInterval = (interval <= 100) ? interval -= 25 :interval;
        this.slider_data.speed = (speed <= .9) ? speed += .2 : speed;
      },

      slowerAnimation() {
        let interval = this.animationInterval;
        let speed = this.slider_data.speed;
        this.animationInterval = (interval > 50) ? interval += 25 : interval;
        this.slider_data.speed = (speed > .5) ? speed -= .2 : speed;
      },

      setIndex (name, num) {
        let slider = this.$refs[name];
        slider.setIndex(num)
      },

      getIndex (name) {
        let slider = this.$refs[name];
        return slider.getIndex();
      },

      mapScale(data) {
        return d3.scaleSqrt()
          .domain(d3.extent(data, (d) => { return d.wind; }))
          .range([2, 13]);
      },

      filteredData(test_value) {
        let parse_date = d3.timeParse('%Y-%m-%d %H:%M:%S');
        let date_to_milli = parse_date(test_value).getTime();
        let four_hours = 60 * 60 * 168 * 1000;
        return this.hurricanes.filter(function(d) {
          return d.full_date <= date_to_milli && d.full_date >= (date_to_milli - four_hours);
        });
      },

      draw() {
        let vm = this;
        let svg = d3.select('#map g');

        d3.queue()
          .defer(d3.json, 'static/data/map.geojson')
          .defer(d3.csv, 'static/data/2016.csv')
          .await(function(error, map, data) {
            let parse_date = d3.timeParse('%Y-%m-%d %H:%M:%S');
            data.forEach((d) => {
              d.full_date = parse_date(d.time).getTime();
            });
            vm.map = map;
            vm.hurricanes = data;

            let test_value = data[0].time;
            vm.flitered_hurricanes = vm.filteredData(test_value);

            let slider_values = _.map(_.uniq(data, 'time'), 'time');
            vm.slider_data.data = slider_values;
            vm.slider_values_length = slider_values.length;
            vm.scale = vm.mapScale(data);

            let scale = 1,
              mapType = d3.geoEquirectangular(),
              projection = mapType
                .scale(scale)
                .translate([0,0]);

            let path = d3.geoPath().projection(projection);
            let bounds = path.bounds(map);
            scale = .95 / Math.max((bounds[1][0] - bounds[0][0]) / vm.width, (bounds[1][1] - bounds[0][1]) / vm.height);
            let translation = [(vm.width - scale * (bounds[1][0] + bounds[0][0])) / 2,
              (vm.height - scale * (bounds[1][1] + bounds[0][1])) / 2];

            // update projection
            projection = mapType
              .scale(scale)
              .translate(translation);

            path = path.projection(projection);
            vm.projection = projection;

            let zoom = d3.zoom().scaleExtent([1, 5]).on('zoom', zoomed);
            svg.call(zoom);

            let maps = svg.selectAll('path')
              .data(map.features);

            maps.enter()
              .append('path')
              .merge(maps)
              .attr('vector-effect', 'non-scaling-stroke')
              .attr('d', path);

            maps.exit().remove();

            function zoomed() {
              svg.attr("transform", d3.event.transform);
            }
          });
      }
    },

    mounted() {
      this.draw();
    }
  }
</script>

<style scoped>
  #pause {
    margin-right: 25px;
  }
</style>
