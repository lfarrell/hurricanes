<template>
  <div class="col-sm-12 col-lg-12">
    <div v-if="loading" class="loader">Loading...</div>
    <div class="row" v-bind:class="{'show': loading}">
      <h1 class="text-center">Storms of the World - Cyclones, Typhoons and Hurricanes</h1>
      <p class="col-sm-10 offset-sm-1 col-lg-10 offset-lg-1">
        There are a surprising number of tropical disturbances every year. Most you rarely think about,
        or have likely never even heard of, unless they're headed your way. Historically, storm data is
        somewhat spotty. The satellite era of storm tracking only
        began in 1965, so it is completely possible that there were major storms that stayed at sea that no
        one was aware of.
      </p>
      <p class="col-sm-10 offset-sm-1 col-lg-10 offset-lg-1">
        Storms typically develop in warm water near the equator. They're most common in the first half
        of the year in the southern hemisphere, with storm likelihood switching to the
        northern hemisphere in the second half of the year. It's unclear if there will be
        more storms as the climate warms, but the storms that do form will, likely, be more
        intense than they otherwise would have been.
      </p>
      <p class="col-sm-10 offset-sm-1 col-lg-10 offset-lg-1">
        The map below shows every named storm since 1995. If you don't want to wait for the animation
        you can drag the slider to any point on the time line. Pause the animation and hover
        over any storm circle to see the storm intensity at that on the time line.
        Zoom and pan the map for a closer look.
      </p>
      <p class="col-sm-10 offset-sm-1 col-lg-10 offset-lg-1">
        If you'd like to make a donation to help the victims of the recent spate of huge hurricanes to strike
        the United States and Caribbean:
        <ul>
          <li><a target="_blank" href="https://www.nytimes.com/2017/09/22/world/americas/hurricane-maria-donate-charity.html">Hurricane Maria</a></li>
          <li><a target="_blank" href="https://www.nytimes.com/2017/09/08/us/hurricane-irma-help-donate.html">Hurricane Irma</a></li>
          <li><a target="_blank" href="https://www.nytimes.com/2017/08/28/us/donate-harvey-charities-scams.html">Hurricane Harvey</a></li>
        </ul>
      </p>
      <p class="col-sm-10 offset-sm-1 col-lg-10 offset-lg-1">
        Where are the big, recent storms: Harvey, Irma and Maria? They're not included in the data provided by
        the National Oceanic and Atmospheric Administration. They'll be added in when data becomes available.
      </p>
      <p class="col-sm-10 offset-sm-1 col-lg-10 offset-lg-1">
        Note: Maximum sustained winds are calculated differently depending on where the storm occurs. In the
        Atlantic and Northeastern Pacific, wind speeds are the maximum sustained wind speed for one
        minute. In the rest of the world, wind intensity is the maximum sustained wind speed over either
        a three-minute or, more commonly, ten minute period. This can make it seem that storms that are actually of the same intensity are
        more intense in the Atlantic and Northeastern Pacific. Unfortunately there's no real way to correct for
        this in the available data.
      </p>
      <timer :dateValues="dates"></timer>
      <circle-legend :dataValues="hurricanes" :field="selector"></circle-legend>
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
  import CircleLegend from './CircleLegend';

  export default {
    name: 'Map',

    data() {
      return {
        loading: true,
        selector: 'main',
        width: Math.round(window.innerWidth * .8),
        base_height: window.innerHeight,
        height: 650,
        map: {},
        scale: {},
        projection: {},
        dates: [],
        hurricanes: []
      }
    },

    components: {
      Timer,
      Scroller,
      CanvasMap,
      CircleLegend
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
          .defer(d3.csv, 'static/data/all_storms_short_1995.csv')
          .await(function(error, map, data) {
            vm.map = map;

            data.forEach((d) => {
              d.full_date = parse_date(d.time).getTime();
            });

            vm.hurricanes = vm.formatValues(data);
            vm.$store.dispatch('setHurricanes', vm.hurricanes);
            vm.dates = _.map(_.uniqBy(data, 'time'), 'time');

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
    text-indent: 20px;
  }
  a, a:hover, a:visited {
    color: orange;
  }
  h1 {
    color: white;
    margin-bottom: 25px;
    width: 100%;
  }

  .show {
    opacity: 0;
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
    stroke-width: .25px;
    stroke: choclate;
    stroke-opacity:  .7;
  }
</style>
