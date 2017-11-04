<template>
  <div id="storms" class="row">
    <h2 class="text-center">Notable Storms</h2>
    <template v-for="name in names">
      <div class="col-sm-4 col-lg-4">
        <h4 class="text-center">{{name.name}}</h4>
        <p class="text-center">Wind: {{name.mph}}/{{name.km}} mph/km/h<br/>
           Cost: {{name.cost}}</p>
        <canvas :id="name.name" :height="height" :width="width"></canvas>
      </div>
    </template>
  </div>
</template>

<script>
  import * as d3 from 'd3';
  import * as _ from 'lodash';

  const ktToMph = 1.1152,
        ktToKm = 1.85;

  export default {
    name: 'CanvasMap',

    data() {
      return {
        width: 300,
        height: 300,
        names: [
          { name: "TIP", wind: 140, mph: this.roundUp(140 * ktToMph),
            km: this.roundUp(140 * ktToKm), center: [140,15], cost: 'Most intense storm in W. Pacific' },
          { name: "PATRICIA", wind: 185, mph: this.roundUp(185 * ktToMph),
            km: this.roundUp(185 * ktToKm), center: [-80,30], cost: 'Most intense storm in Americas' },
        /*  { name: "GILBERT", wind: 160, mph: this.roundUp(160 * ktToMph),
            km: this.roundUp(160 * ktToKm), center: [-80,30] },
          { name: "LINDA", wind: 160, mph: this.roundUp(160 * ktToMph),
            km: this.roundUp(160 * ktToKm), center: [-80,30] },
          { name: "WILMA", wind: 160, mph: this.roundUp(160 * ktToMph),
            km: this.roundUp(160 * ktToKm), center: [-80,30] }, */
          { name: "SANDY", wind: 100, mph: this.roundUp(100 * ktToMph),
            km: this.roundUp(100 * ktToKm), center: [-80,30], cost: '75 billion USD' },
          { name: "ANDREW", wind: 150, mph: this.roundUp(150 * ktToMph),
            km: this.roundUp(150 * ktToKm), center: [-80,30], cost: '26.5 billion USD' }
            ]
      }
    },

    methods: {
      roundUp(val) {
        return _.round(val, 1);
      },

      mapScale(data) {
        return d3.scaleSqrt()
          .domain(d3.extent(data, (d) => { return +d.wind; }))
          .range([.5, 6]);
      },

      draw() {
        let vm = this;

        d3.queue()
          .defer(d3.json, 'static/data/map.geojson')
          .defer(d3.csv, 'static/data/big_storms.csv')
          .await(function(error, map, data) {
            let storms = _.groupBy(data, 'name');
            let sizing = vm.mapScale(data);

            let scale = 1,
              mapType = d3.geoEquirectangular(),
              projection = mapType
                .scale(scale)
                .translate([0, 0]);

            let path = d3.geoPath().projection(projection);
            let bounds = path.bounds(map);
            scale = .98 / Math.max((bounds[1][0] - bounds[0][0]) / vm.width * .3, (bounds[1][1] - bounds[0][1]) / vm.height * .25);
            let translation = [(vm.width - scale * (bounds[1][0] + bounds[0][0])) / 2,
              (vm.height - scale * (bounds[1][1] + bounds[0][1])) / 2];

            // update projection
            projection = mapType
              .scale(scale)
              .translate(translation);

            for (let i = 0, n = vm.names.length; i < n; ++i) {
              let canvas = d3.select(`#${vm.names[i].name}`);
              let ctx = canvas.node().getContext('2d');

              projection.center(vm.names[i].center);
              path = d3.geoPath()
                .projection(projection)
                .context(ctx);

              ctx.beginPath();
              path({type: 'FeatureCollection', features: map.features});

              ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
              ctx.fill();
              ctx.lineWidth = 1;
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
              ctx.stroke();

              // Add hurricane path
              for (let t = 0, r = storms[vm.names[i].name].length; t < r; ++t) {
                let node = storms[vm.names[i].name][t];
                node.x = projection([node.lng, node.lat])[0];
                node.y = projection([node.lng, node.lat])[1];

                ctx.beginPath();
                ctx.moveTo(node.x, node.y);
                ctx.arc(node.x, node.y, sizing(node.wind), 0, 2 * Math.PI, false);
                ctx.lineWidth = 4;
                ctx.fillStyle = 'rgba(255,165,0, 0.5)';
                ctx.fill();
              }
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
  #storms {
    color: white;
  }

  h2 {
    width: 100%;
  }

  h4 {
    margin-top: 25px;
  }
</style>
