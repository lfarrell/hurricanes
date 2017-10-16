import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    currentDate: '',
    hurricanes: [],
    selectedHurricanes: []
  },

  getters: {
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
