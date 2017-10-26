<template>
  <canvas id="bob" :height="height" :width="width"></canvas>
</template>

<script>
  import * as d3 from 'd3';
  import * as _ from 'lodash';

  export default {
    name: 'CanvasMap',

    data() {
      return {
        width: 300,
        height: 300,
      }
    },

    methods: {
      draw() {
        let vm = this;

        d3.queue()
          .defer(d3.json, 'static/data/map.geojson')
          .defer(d3.csv, 'static/data/2016.csv')
          .await(function(error, map, data) {
            let scale = 1,
              mapType = d3.geoEquirectangular(),
              projection = mapType
                .scale(scale)
                .translate([0, 0]);

            let path = d3.geoPath().projection(projection);
            let bounds = path.bounds(map);
            scale = .98 / Math.max((bounds[1][0] - bounds[0][0]) / vm.width, (bounds[1][1] - bounds[0][1]) / vm.height);
            let translation = [(vm.width - scale * (bounds[1][0] + bounds[0][0])) / 2,
              (vm.height - scale * (bounds[1][1] + bounds[0][1])) / 2.5];

            // update projection
            projection = mapType
              .scale(scale)
              .translate(translation);

           // let canvas = d3.select(`#${this.id_value}`);
            let canvas = d3.select('#bob');
            let ctx = canvas.node().getContext('2d');

            path = d3.geoPath()
              .projection(projection)
              .context(ctx);

            ctx.beginPath();
            path({type: 'FeatureCollection', features: map.features});

            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.fill();
            ctx.lineWidth = '1';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.stroke();
          });
      }
    },

    mounted() {
      this.draw();
    }
  }
</script>
