import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    allDates: [],
    currentDate: '',
    hurricanes: [],
    selectedHurricanes: []
  },

  getters: {
    getAllDates(state) {
      return state.allDates;
    },

    getCurrentDate(state) {
      return state.currentDate;
    },

    getHurricanes(state) {
      return state.hurricanes;
    },

    getSelectedHurricanes(state) {
      return state.selectedHurricanes;
    }
  },

  mutations: {
    setAllDates(state, dates){
      state.allDates = dates;
    },

    setCurrentDate(state, currentDate) {
      state.currentDate = currentDate;
    },

    setHurricanes(state, hurricanes) {
      state.hurricanes = hurricanes;
    },

    setSelectedHurricanes(state, selectedHurricanes) {
      state.selectedHurricanes = selectedHurricanes;
    },
  },

  actions: {
    setAllDates({commit}, dates){
      commit('setAllDates', dates);
    },

    setCurrentDate({commit}, currentDate) {
      commit('setCurrentDate', currentDate);
    },

    setHurricanes({commit}, hurricanes) {
      commit('setHurricanes', hurricanes);
    },

    setSelectedHurricanes({commit}, selectedHurricanes) {
      commit('setSelectedHurricanes', selectedHurricanes);
    },
  }
});
