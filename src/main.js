import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import router from './router'
import ECharts from 'vue-echarts' // 在 webpack 环境下指向 components/ECharts.vue
import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader
import '@/assets/font.scss';


// 注册组件后即可使用
Vue.component('v-chart', ECharts)

Vue.config.productionTip = false

new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app')
