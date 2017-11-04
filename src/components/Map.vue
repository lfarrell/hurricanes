<template>
  <div class="col-sm-12 col-lg-12">
    <div v-if="loading" class="loader">Loading...</div>
    <div class="row" v-show="done">
      <h1 class="text-center">Storms of the World - Cyclones, Typhoons and Hurricanes</h1>
      <p class="col-sm-10 offset-sm-1 col-lg-10 offset-lg-1">
        There are a surprising number of tropical disturbances every year. Most you rarely think about,
        or have likely never even heard of, unless they're headed your way. Storms typically develop in warm water
        near the equator.
      </p>
      <timer :dateValues="dates"></timer>
      <div class="col-sm-3 col-lg-2">
        <scroller></scroller>
      </div>
      <div id="base" class="col-sm-9 col-lg-10">
        <svg id="map" :width="width" height="575px">
          <g>
            <rect :height="height" :width="width"></rect>
            <template v-for="(d, index) in selectedHurricanes">
              <circle :id="d.name + index"
                      :cx="projection([+d.lng, +d.lat])[0]"
                      :cy="projection([+d.lng, +d.lat])[1]"
                      :r="scale(+d.wind)"
                      v-b-tooltip.html
                      :title="hurricaneNote(d)"
                      variant="outline-success"></circle>
            </template>
          </g>
        </svg>
      </div>
      <canvas-map></canvas-map>
    </div>
  </div>
</template>

<script>
  import * as d3 from 'd3';
  import * as _ from 'lodash';
  import Timer from './Timer';
  import Scroller from './Scroller';
  import CanvasMap from './CanvasMap';

  export default {
    name: 'Map',

    data() {
      return {
        loading: true,
        done: false,
        width: Math.round(window.innerWidth * .8),
        base_height: window.innerHeight,
        height: 650,
        map: {},
        scale: {},
        projection: {},
        dates: []
      }
    },

    components: {
      Timer,
      Scroller,
      CanvasMap
    },

    computed: {
      selectedHurricanes() {
        return this.$store.getters.getSelectedHurricanes;
      }
    },

    methods: {
      hurricaneNote(d) {
        return `<h5 class="text-center">${d.name}</h5>
        <p>
        ${d.date}
        Wind: ${d.mph} mph<br/>
        Latitude: ${d.display_lat}<br/>
        Longitude: ${d.display_lng}
        </p>`;
      },

      mapScale(data) {
        return d3.scaleSqrt()
          .domain(d3.extent(data, (d) => { return d.wind; }))
          .range([1, 10]);
      },

      filteredData(test_value) {
        let parse_date = this.dateFormat();
        let date_to_milli = parse_date(test_value).getTime();
        let one_week = 60 * 60 * 168 * 1000;

        return this.$store.getters.getHurricanes.filter(function(d) {
          return d.full_date <= date_to_milli && d.full_date >= (date_to_milli - one_week);
        });
      },

      formatValues(data) {
        const ktToMph =1.1152;
        const ktToKm = 1.85;
        const windFormat = d3.format(".1f");
        const dateParse = this.dateFormat();
        const dateFormat = d3.timeFormat('%b %d %I:%M %p, %Y');

        data.forEach((d) => {
          d.mph = windFormat(d.wind * ktToMph);
          d.km = windFormat(d.wind * ktToKm);
          d.date = dateFormat(dateParse(d.time));
          d.name = _.capitalize(d.name.toLowerCase());
          d.display_lat = _.round(d.lat, 3);
          d.display_lng = _.round(d.lng, 3);
        });

        return data;
      },

      dateFormat() {
        return d3.timeParse('%Y-%m-%d %H:%M');
      },

      draw() {
        const parse_date = this.dateFormat();
        let vm = this;
        let svg = d3.select('#map g');

        d3.queue()
          .defer(d3.json, 'static/data/map.geojson')
          .defer(d3.csv, 'static/data/2016.csv')
          .await(function(error, map, data) {
            vm.map = map;

            data.forEach((d) => {
              d.full_date = parse_date(d.time).getTime();
            });

            vm.$store.dispatch('setHurricanes', vm.formatValues(data));
            vm.dates = _.map(_.uniqBy(data, 'time'), 'time');
          //  console.log(JSON.stringify(vm.dates))

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
            scale = .98 / Math.max((bounds[1][0] - bounds[0][0]) / vm.width, (bounds[1][1] - bounds[0][1]) / vm.height);
            let translation = [(vm.width - scale * (bounds[1][0] + bounds[0][0])) / 2,
              (vm.height - scale * (bounds[1][1] + bounds[0][1])) / 2.5];

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

            vm.loading = false;
            vm.done = true;
          });
      }
    },

    mounted() {
      this.draw();
    }
  }
</script>

<style scoped>
  #base {
    margin: 0;
  }

  p {
    color: white;
    text-align: left;
  }

  h1 {
    color: white;
    margin-bottom: 50px;
    width: 100%;
  }
  .loader {
    font-size: 3em;
    margin-top:25px;
    text-align: center;
    color: white;
  }
  rect {
    fill: none;
    stroke: none;
    pointer-events: all;
  }

  circle {
    fill: orange;
    fill-opacity: .5;
  }
</style>
