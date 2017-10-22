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
      <button  @click="stopAnimation()" type="button" class="btn" id="stop">Stop<icon name="stop"></icon></button>
      <button  @click="pauseAnimation()" type="button" class="btn" id="pause">Pause<icon name="pause"></icon></button>
      <button  @click="fasterAnimation()" type="button" class="btn" id="faster">Faster<icon name="step-forward"></icon></button>
      <button  @click="slowerAnimation()" type="button" class="btn" id="slower">Slower<icon name="step-backward"></icon></button>
    </div>
  </div>
</template>

<script>
  import * as d3 from 'd3';
  import vueSlider from 'vue-slider-component';
  import Icon from 'vue-awesome/components/Icon'
  import 'vue-awesome/icons/play';
  import 'vue-awesome/icons/stop';
  import 'vue-awesome/icons/pause';
  import 'vue-awesome/icons/step-forward';
  import 'vue-awesome/icons/step-backward';

  export default {
    name: 'Timer',

    data() {
      return {
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

    props: {
      dateValues: Array
    },

    watch: {
      dateValues: function(val) {
        this.dateValues = val;
        this.draw();
      }
    },

    components: {
      vueSlider,
      Icon
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
          this.setIndex('slider', 0);
        }
      },

      pauseAnimation() {
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
      },

      draw() {
        this.slider_data.data = this.dateValues;
        this.slider_values_length = this.slider_data.data.length;
      }
    }
  }
</script>

<style scoped>
  #faster {
    margin-left: 25px;
  }

  .btn .fa-icon {
    vertical-align: middle;
    margin-left: 0.5rem;
  }
  .btn .fa-icon:last-child {
    margin-right: 0;
  }

  .btn:hover {
    cursor: pointer;
  }
</style>
