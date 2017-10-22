<template>
  <div class="col-sm-12 col-lg-12" id="graph">
    <svg id='line-chart'>
      <g class="x axis" :transform="`translate(${this.margins().left},${(this.graph_height + this.margins().top)})`"></g>
      <g class="y axis" :transform="graph_translate"></g>
      <text :x="graph_width/1.5" :y="graph_height+this.margins().bottom" text-anchor="zs">Date</text>
      <text transform="rotate(-90)" :x="-graph_height/2" y="6" dy=".71em" style="text-anchor:end">Acre Feet</text>
      <g>
        <path id="timing" :d="storage" stroke="steelblue" :transform="graph_translate"></path>
      </g>
      <g class="focus" style="display:none">
        <line class="y0" x1="0" x2="0" y1="0" :y2="graph_height"></line>
      </g>
      <rect class="overlay" :height="graph_height" :width="graph_width"></rect>
    </svg>
  </div>
</template>

<script>
  import * as d3 from 'd3';
  import * as _ from 'lodash';
  import {formatting} from './utilities/formatting';
  import {tip} from './utilities/tip';

  export default {
    name: 'LineChart',

    data() {
      return {
        graph_height: 500 - this.margins().top -this. margins().bottom,
        graph_width: 650 - this.margins().left - this.margins().right,
        graph_translate: `translate(${this.margins().left},${this.margins().top})`
      }
    },

    props: {
      selectedData: Array,
    },

    computed: {
      getHurricanes() {
        return this.$store.getters.getHurricanes;
      }
    },

    methods: {
      margins() {
        return {top: 20, right: 130, left: 100, bottom: 80};
      },

      linePath(field, formatting, scales) {
        return d3.line()
          .curve(d3.curveNatural)
          .x(function(d) { return scales.xScale(formatting(d.time)); })
          .y(function(d) { return scales.yScale(d[field]); });
      },

      draw() {
        let data = this.histAvg(this.selectedData),
          format = d3.timeParse('%m/%Y'),
          margin = this.margins(),
          num_format = d3.format(',');

    //    let tip_div = tip.tipDiv();
        let xScale = d3.scaleTime().domain(d3.extent(data, function(d) { return format(d.time); }));

        xScale.range([0, this.graph_width]);

        let yScale = d3.scaleLinear()
          .domain([d3.max(data, function(d) { return d.capacity; }) * 1.2, 0]);

        yScale.range([0, this.graph_height]);

        let scales = {xScale: xScale, yScale: yScale};

      //  let bisectDate = d3.bisector(function(d) { return format(d.time); }).right;

        // Create Axis
        let xAxis = d3.axisBottom()
          .scale(xScale);

        let yAxis = d3.axisLeft()
          .scale(yScale);

        let timing = this.linePath('storage', format, scales);

        d3.select('#line-chart')
          .attr('width', this.graph_width + margin.left + margin.right)
          .attr('height', this.graph_height + margin.top + margin.bottom);

        d3.select('#line-chart g.x').transition()
          .duration(1000)
          .ease(d3.easeSinInOut)
          .call(xAxis);

        d3.select('#line-chart g.y').transition()
          .duration(1000)
          .ease(d3.easeSinInOut)
          .call(yAxis);

        d3.select('#timing').transition()
          .duration(1000)
          .ease(d3.easeSinInOut)
          .attr('d', timing(data));

   /*     let focus = d3.select('.focus');
        d3.select('rect.overlay').on('mouseover touchstart', function () {
          focus.style('display', null);
        }).on('mouseout touchend', function () {
          focus.style('display', 'none');
          tip.tipHide(tip_div);
        }).on('mousemove touchmove', mousemove)
          .attr('transform', `translate(${margin.left},${margin.top})`);

        function mousemove() {
          let x0 = xScale.invert(d3.mouse(this)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i];

          if(d1 === undefined) d1 = Infinity;
          let d = x0 - d0.date > d1.date - x0 ? d1 : d0;
          d3.select('#graph line.y0')
            .attr('transform', `translate(${xScale(format(d.time)) + margin.left},${margin.top})`);

          let date_bits = d.time.split('/');
          let message = `<h4 class='text-center tip'>${formatting.stringDate(date_bits[0])}, ${date_bits[1]}</h4>
          <ul class='list-unstyled'>
          <li>Capacity: ${num_format(d.capacity)} acre ft</li>
          <li>Vol: ${num_format(d.storage)} acre ft</li>
          <li>Pct Full: ${d.pct_capacity}%</li>
          <li>Pct of Hist. Avg: ${(d.storage / d.mean * 100).toFixed(1)}%</li>
          </ul>`;

         // tip.tipShow(tip_div, message);
        }*/
      }
    }
  }
</script>

<style scoped>
  #line-chart path {
    fill: none;
    stroke-width: 2;
  }

  text {
    stroke:none;
    fill:white;
  }
</style>
