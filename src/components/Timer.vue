<template>
  <div class="col-sm-12 col-lg-12">
    <vue-slider ref="slider"
                v-bind="slider_data"
                v-model="slider_data.value"
                @callback="updateSlider"
                @drag-start="dragStart"
                @drag-end="dragEnd"></vue-slider>
     <div class="col-sm-12 col-lg-12 ">
      <button  @click="animateGraph()" type="button" class="btn" id="start">Start<icon name="play"></icon></button>
      <button  @click="stopAnimation()" type="button" class="btn btn-secondary" id="stop">Stop</button>
      <button  @click="stopAnimation()" type="button" class="btn btn-secondary" id="pause">Pause</button>
      <button  @click="fasterAnimation()" type="button" class="btn btn-secondary" id="faster">+</button>
      <button  @click="slowerAnimation()" type="button" class="btn btn-secondary" id="slower">-</button>
    </div>
  </div>
</template>

<script>
  import * as d3 from 'd3';
  import * as _ from 'lodash';
  import vueSlider from 'vue-slider-component';
  import Icon from 'vue-awesome/components/Icon'
  import 'vue-awesome/icons/play';

  export default {
    name: 'Timer',

    data() {
      return {
        slider_values_length: this.allSize,
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
          data: this.allDates
        }
      }
    },

    components: {
      vueSlider,
      Icon
    },

    computed: {
      allDates() {
        return this.$store.getters.getAllDates;
      },

      allSize() {
        return this.$store.getters.getAllDates.length;
      }
    },

    methods: {
      filteredData(test_value) {
        let parse_date = d3.timeParse('%Y-%m-%d %H:%M:%S');
        let date_to_milli = parse_date(test_value).getTime();
        let one_week = 60 * 60 * 168 * 1000;

        return this.$store.getters.getHurricanes.filter(function(d) {
          return d.full_date <= date_to_milli && d.full_date >= (date_to_milli - one_week);
        });
      },

      updateSlider(val) {
        this.$store.dispatch('setSelectedHurricanes', this.filteredData(val));
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

      dragStart() {
        this.stopAnimation();
      },

      dragEnd () {
        this.animateGraph();
      }
    }
  }
</script>
