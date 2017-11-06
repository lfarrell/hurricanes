<template>
  <div v-bind:class="{'circle-legend': centerClass}" class="circle-legend">
    <h4 v-bind:style="{ marginLeft: offSet}"> Wind Speed (Miles per Hour)</h4>
    <svg :width="width" :height="height">
      <g :id="field" :width="width" transform="translate(20,15)"></g>
    </svg>
  </div>
</template>

<script>
  import * as d3 from 'd3';
  import legend from 'd3-svg-legend';

  export default {
    name: 'CircleLegend',

    data() {
      return {
        width: '',
        height: '',
        centerClass: false
      }
    },

    props: {
      dataValues: Array,
      field: String
    },

    computed: {
      offSet() {
        let orientation = this.legendOrientation().orientation;

        if(orientation === 'horizontal' && this.field === 'canvas') {
          return '-65px';
        } else if(orientation === 'horizontal') {
          return '-45px';
        }

        return  0;
      }
    },

    watch: {
      dataValues: function(val) {
        this.dataValues = val;
        this.draw();
      }
    },

    methods: {
      circleSizing() {
        let sizing;

        if (this.field === 'canvas') {
          sizing = [.5, 6];
        } else {
          sizing = [1, 10];
        }

        return sizing;
      },

      legendOrientation() {
        let screen_width = window.innerWidth;
        let orientation;

        if(screen_width < 1000) {
          orientation = 'vertical';
          this.height = 250;
          this.width = window.innerWidth;
        } else {
          orientation = 'horizontal';
          this.width = 350;
          this.height = 70;
        }

        return {orientation: orientation};
      },

      chartType() {
        let format, spacing;

        format = '.01f';

        if(window.innerWidth < 1000) {
          spacing = 25;
        } else {
          spacing = 50;
        }

        return {format: format, spacing: spacing};
      },

      legendCircle() {
        let legend_scales = d3.scaleSqrt()
          .domain(d3.extent(this.dataValues, (d) => { return +d.mph; }))
          .range(this.circleSizing());
        let configs = this.legendOrientation();
        let chart_format = this.chartType();

        return legend.legendSize()
          .scale(legend_scales)
          .shape('circle')
          .shapePadding(chart_format.spacing)
          .labelOffset(20)
          .labelFormat(d3.format(chart_format.format))
          .orient(configs.orientation);
      },

      draw() {
        let svg = d3.select(`#${this.field}`);
        let legend_scale = this.legendCircle();

        if(this.whichType !== 'map') {
          setTimeout(function() {
            svg.call(legend_scale);
          }, 500);
        } else {
          svg.call(legend_scale);
        }
      }
    }
  }
</script>

<style scoped>
  .circle-legend {
    text-align: center;
    position: relative;
  }

  h4 {
    color: white;
  }
</style>
