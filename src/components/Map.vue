<template>
  <div class="row">
    <timer :dateValues="dates"></timer>
    <div id="base" class="col-sm-12 col-lg-12">
      <svg id="map" :width="width" height="800px">
        <g>
          <rect height="800" :width="width"></rect>
          <template v-for="(d, index) in selectedHurricanes">
            <circle :id="d.name + index"
                    :cx="projection([+d.lng, +d.lat])[0]"
                    :cy="projection([+d.lng, +d.lat])[1]"
                    :r="scale(+d.wind)"></circle>
          </template>
        </g>
      </svg>

    </div>
  </div>
</template>

<script>
  import * as d3 from 'd3';
  import * as _ from 'lodash';
  import Timer from './Timer';

  export default {
    name: 'Map',

    data() {
      return {
        width: window.innerWidth,
        base_height: window.innerHeight,
        height: 800,
        map: {},
        scale: {},
        projection: {},
        dates: [],
        hurricaneColors: [],
        colors: ['#d73027','#fc8d59','#fee090','#ffffbf','#e0f3f8','#91bfdb','#4575b4']
      }
    },

    components: {
      Timer
    },

    computed: {
      selectedHurricanes() {
        return this.$store.getters.getSelectedHurricanes;
      }
    },

    methods: {
      uniqHurricanes(data) {
        return _.map(_.uniq(data, 'name'), 'name');
      },

      mapScale(data) {
        return d3.scaleSqrt()
          .domain(d3.extent(data, (d) => { return d.wind; }))
          .range([1, 10]);
      },

      filteredData(test_value) {
        let parse_date = d3.timeParse('%Y-%m-%d %H:%M:%S');
        let date_to_milli = parse_date(test_value).getTime();
        let one_week = 60 * 60 * 168 * 1000;

        return this.$store.getters.getHurricanes.filter(function(d) {
          return d.full_date <= date_to_milli && d.full_date >= (date_to_milli - one_week);
        });
      },

      formatValues(data) {
        const ktToMph =1.1152;
        const ktToKm = 1.85;

        data.forEach((d) => {
          d.mph = d.wind * ktToMph;
          d.km = d.wind * ktToKm;
          d.color = this.colors[1];
        });

        return data;
      },

      draw() {
        const parse_date = d3.timeParse('%Y-%m-%d %H:%M:%S');
        let vm = this;
        let svg = d3.select('#map g');

        d3.queue()
          .defer(d3.json, 'static/data/map.geojson')
          .defer(d3.csv, 'static/data/2016.csv')
          .await(function(error, map, data) {
            vm.map = map;

            vm.hurricaneColors = vm.uniqHurricanes(data);
            console.log(vm.hurricaneColors.length)

            data.forEach((d) => {
              d.full_date = parse_date(d.time).getTime();
            });

            vm.$store.dispatch('setHurricanes', vm.formatValues(data));
            vm.dates = _.map(_.uniq(data, 'time'), 'time');

            let test_value = data[0].time;
            vm.$store.dispatch('setSelectedHurricanes', vm.filteredData(test_value));

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
