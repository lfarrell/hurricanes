<template>
  <div id="storms" class="row">
    <h2 class="text-center">Notable Storms</h2>
    <p class="col-sm-10 offset-sm-1 col-lg-10 offset-lg-1">
      Mercifully, storms have gotten less deadly over time. This is due largely to greatly improved forecasting,
      which often allows time to evacuate inland, away from the worst of a storm. Particularly before the satellite
      era people would often have no idea that a storm was even approaching until it was right on top of them.
    </p>
    <p class="col-sm-10 offset-sm-1 col-lg-10 offset-lg-1">
      Highlighted below are the storm paths of some of the worlds most powerful and expensive storms.
      The great Atlantic storms of 2017 are not included as data is not yet available.
    </p>
    <template v-for="name in names">
      <div class="col-sm-4 col-lg-4">
        <h4 class="text-center">{{name.name}}</h4>
        <p class="text-center">
          Wind: {{name.mph}}/{{name.km}} mph/km/h<br/>
          {{name.cost}}</p>
        <canvas :id="name.name" :height="height" :width="width"></canvas>
      </div>
    </template>
    <div class="row col-sm-12 col-lg-12 ">
      <footer>
        <ul class="list-unstyled">
          <li><a href="../index.php">Other Visualizations</a></li>
          <li><a href="../western_water">Western Water</a></li>
          <li><a href="mailto:farrelldlfarrell@gmail.com">Email</a></li>
          <li><a href="https://twitter.com/farrelldlfarrel">Twitter</a></li>
        </ul>
      </footer>
    </div>
    <div class=" row col-sm-12 col-lg-12">
      <div class="col-offset-md-1 subfooter">
        <h3 class="text-center">Data Sources</h3>
        <ul class="list-unstyled text-center">
          <li><a href="https://www.ncdc.noaa.gov/ibtracs/index.php?name=ibtracs-data">Storm Paths</a></li>
          <li><a href="https://en.wikipedia.org/wiki/List_of_the_most_intense_tropical_cyclones">Strongest Storms</a></li>
          <li><a href="https://en.wikipedia.org/wiki/List_of_costliest_Atlantic_hurricanes">Most Expensive Storms</a></li>
        </ul>
      </div>
    </div>
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
            km: this.roundUp(140 * ktToKm), center: [140,15], cost: 'Most intense storm in the Pacific' },
          { name: "PATRICIA", wind: 185, mph: this.roundUp(185 * ktToMph),
            km: this.roundUp(185 * ktToKm), center: [-80,30], cost: 'Most intense storm in the Americas' },
          { name: "FANTALA", wind: 135, mph: this.roundUp(135 * ktToMph),
            km: this.roundUp(135 * ktToKm), center: [85,20], cost: 'Most intense storm in the Indian Ocean' },
          { name: "KATRINA", wind: 150, mph: this.roundUp(150 * ktToMph),
            km: this.roundUp(150 * ktToKm), center: [-80,30], cost: 'Cost: 108 billion USD' },
          { name: "SANDY", wind: 100, mph: this.roundUp(100 * ktToMph),
            km: this.roundUp(100 * ktToKm), center: [-80,30], cost: 'Cost: 75 billion USD' },
          { name: "ANDREW", wind: 150, mph: this.roundUp(150 * ktToMph),
            km: this.roundUp(150 * ktToKm), center: [-80,30], cost: 'Cost: 26.5 billion USD' }
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

  p {
    text-align: left;
    color: white;
    text-indent: 20px;
  }

  ul {
    list-style-type: none;
  }

  a, a:hover, a:visited {
    color: orange;
  }

  h2 {
    width: 100%;
  }

  h3 {
    text-align: justify;
  }

  h3, h4 {
    margin-top: 25px;
  }

  footer {
    width: 100%;
    margin-top: 50px;
  }

  footer ul {
    text-align: center;
  }

  footer ul li {
    display: inline;
    margin-left: 25px;
    font-size: 1.4em;
  }

  .subfooter {
    width: 100%;
    margin-bottom: 25px;
  }

  .subfooter ul {
    text-align: center;
  }
</style>
