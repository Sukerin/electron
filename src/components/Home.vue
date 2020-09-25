<template>
  <v-app>
    <v-app-bar
        app
        color="primary"
        dark
    >
      <div class="d-flex align-center">

        <v-btn-toggle mandatory shaped v-model="btnGroupToggle" color="white" group>
          <v-btn @click="toYear" ref="toYearBtn">
            <span>年</span>
            <v-icon right>mdi-format-align-left</v-icon>
          </v-btn>

          <v-btn @click="toQuarter">
            <span>季</span>
            <v-icon right>mdi-format-align-center</v-icon>
          </v-btn>

          <v-btn @click="toMonth">
            <span>月</span>

            <v-icon right>mdi-format-align-right</v-icon>
          </v-btn>
        </v-btn-toggle>


      </div>

      <v-spacer></v-spacer>

      <v-btn text @click="chooseFileDialog">
        <span class="mr-2">选择文件</span>
        <v-icon>mdi-folder-open</v-icon>
      </v-btn>

    </v-app-bar>

    <v-main style="background-color: #f1f1f1">

      <v-container fluid>
        <v-alert
            dense
            v-model="alert"
            type="error"
            dismissible
            transition="scale-transition"
            close-icon="mdi-close-circle"
        >
          文件内容有误
        </v-alert>
        <v-row class="mb-4">
          <v-col>
            <v-card>
              <v-chart :options="chartsData" autoresize style="width: 100%;height: 500px"
                       @legendselectchanged="handleLegendSelectChanged"
                       ref="vechart"/>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <v-card>
              <v-data-table loading-text="读取数据..." fixed-header :footer-props="{itemsPerPageText: '每页数量'}"
                            :loading="dataLoading"
                            no-data-text="暂无数据"
                            :headers="headers"
                            :items="tableData"
                            :items-per-page="10"
              />
            </v-card>

          </v-col>
        </v-row>
      </v-container>
    </v-main>
    <v-footer class="d-flex justify-space-between " app color="primary">

      <v-menu top offset-y transition="scale-transition" origin="left bottom">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon color="white" v-bind="attrs"
                 v-on="on">
            <v-icon>mdi-tools</v-icon>
          </v-btn>
        </template>
        <v-list dense dark rounded color="primary">
          <v-list-item-group>

            <v-list-item @click.stop=" errorDetailsDialog.show = true">
              <v-list-item-content>
                <v-list-item-title>
                  <v-icon size="20">mdi-bug</v-icon>
                  异常信息
                </v-list-item-title>

              </v-list-item-content>
            </v-list-item>

            <v-list-item @click.stop=" excelOptionsDialog.show = true">

              <v-list-item-content>
                <v-list-item-title>
                  <v-icon size="20">mdi-cog</v-icon>
                  设置
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>

          </v-list-item-group>
        </v-list>
      </v-menu>

      <v-tooltip v-once top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn text v-bind="attrs" v-on="on" color="white">
            <v-icon>mdi-copyright</v-icon>
            {{ new Date().getFullYear() }} - 风向玫瑰图
          </v-btn>
        </template>
        <span>软件作者：
          <br>
          <v-avatar size="25"><img
              :src="require('@/assets/toad.jpg')"
              alt="WJJ"></v-avatar>  汪健健（武汉市公共气象服务中心）
          <br>
          <v-avatar size="25"><img
              :src="require('@/assets/jay.jpg')"
              alt="DR"></v-avatar>  董睿（武汉天融信创新科技有限公司）</span>
      </v-tooltip>



    </v-footer>
    <v-dialog
        v-model="errorDetailsDialog.show"
        max-width="290"
    >
      <v-card shaped>
        <v-card-title>异常详情</v-card-title>
        <v-card-text>
          {{ errorDetailsDialog.text }}
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog
        v-model="excelOptionsDialog.show"
        max-width="290"
    >
      <v-card shaped>
        <v-card-title>
          Excel读取配置
        </v-card-title>
        <v-card-text>
          <ValidationObserver v-slot="{ invalid }">
            <form>
              <ValidationProvider v-slot="{ errors }" name="风向列号码" rules="required|integer|max_value:100">
                <v-text-field
                    v-model="excelOptions.wd"
                    :error-messages="errors"
                    label="风向"
                    required
                ></v-text-field>
              </ValidationProvider>
              <ValidationProvider v-slot="{ errors }" name="年列号码" rules="required|integer|max_value:100">
                <v-text-field
                    v-model="excelOptions.year"
                    :error-messages="errors"
                    label="年"
                    required
                ></v-text-field>
              </ValidationProvider>
              <ValidationProvider v-slot="{ errors }" name="月列号码" rules="required|integer|max_value:100">
                <v-text-field
                    v-model="excelOptions.month"
                    :error-messages="errors"
                    label="月"
                    required

                ></v-text-field>
              </ValidationProvider>
              <ValidationProvider v-slot="{ errors }" name="日列号码" rules="required|integer|max_value:100">
                <v-text-field
                    v-model="excelOptions.day"
                    :error-messages="errors"
                    label="日"
                    required

                ></v-text-field>
              </ValidationProvider>
              <ValidationProvider v-slot="{ errors }" name="小时列号码" rules="required|integer|max_value:100">
                <v-text-field
                    v-model="excelOptions.hour"
                    :error-messages="errors"
                    label="小时"
                    required

                ></v-text-field>
              </ValidationProvider>
              <div class="d-flex justify-space-around">
                <v-btn color="warning"  :disabled="invalid" @click.stop=" okDialog.submit = true">更新</v-btn>
                <v-btn color="primary"  @click.stop=" okDialog.reset = true">还原默认值</v-btn>
              </div>

            </form>
          </ValidationObserver>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="okDialog.submit"
              max-width="250">
      <v-card rounded>
        <div class="d-flex justify-space-around ">
          <v-btn text color="red" dark
                 @click="okDialog.submit = false"
          >
            <v-icon>mdi-close</v-icon>取消
          </v-btn>

          <v-btn text color="primary" dark
                 @click="excelOptionsSubmit"
          >
            <v-icon>mdi-check</v-icon>确认
          </v-btn>

        </div>

      </v-card>
    </v-dialog>

    <v-dialog v-model="okDialog.reset"
              max-width="250">
      <v-card rounded>
        <div class="d-flex justify-space-around ">
          <v-btn text color="red" dark
                 @click="okDialog.reset = false"
          >
            <v-icon>mdi-close</v-icon>取消
          </v-btn>

          <v-btn text color="primary" dark
                 @click="excelOptionsSubmit"
          >
            <v-icon>mdi-check</v-icon>确认
          </v-btn>

        </div>

      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>

// 引入 ECharts 主模块
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/radar'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/radar'
import 'echarts/lib/component/legendScroll'
import Wind from "@/libs/wind";


import cn from 'vee-validate/dist/locale/zh_CN.json';
import {ValidationObserver, ValidationProvider, setInteractionMode, localize, extend} from 'vee-validate'

import {required, max_value, integer} from 'vee-validate/dist/rules';


extend('required', {
  ...required,
});
extend('max_value', {
  ...max_value,
});
extend('integer', {
  ...integer,
});

localize('cn', cn);
setInteractionMode('eager')

const {ipcRenderer} = require('electron');
const {app} = require('electron').remote;
const fs=require('fs');
const optionFilePath=app.getPath('userData')+'/config.json';


// "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"
export default {
  name: 'Home',
  components: {
    ValidationProvider,
    ValidationObserver,
  },


  data: () => ({
    rawData: [],
    headers: [
      {text: '日期', value: 'sDateTime'},
      {text: 'N', value: 'windDirectionCount.N'},
      {text: 'NNE', value: 'windDirectionCount.NNE'},
      {text: 'NE', value: 'windDirectionCount.NE'},
      {text: 'ENE', value: 'windDirectionCount.ENE'},

      {text: 'E', value: 'windDirectionCount.E'},
      {text: 'ESE', value: 'windDirectionCount.ESE'},
      {text: 'SE', value: 'windDirectionCount.SE'},
      {text: 'SSE', value: 'windDirectionCount.SSE'},

      {text: 'S', value: 'windDirectionCount.S'},
      {text: 'SSW', value: 'windDirectionCount.SSW'},
      {text: 'SW', value: 'windDirectionCount.SW'},
      {text: 'WSW', value: 'windDirectionCount.WSW'},

      {text: 'W', value: 'windDirectionCount.W'},
      {text: 'WNW', value: 'windDirectionCount.WNW'},
      {text: 'NW', value: 'windDirectionCount.NW'},
      {text: 'NNW', value: 'windDirectionCount.NNW'},
    ],
    tableData: [],
    chartsData: {
      tooltip: {},
      legend: {
        data: [],
        type: 'scroll',
      },
      radar: {

        name: {
          textStyle: {
            color: '#fff',
            backgroundColor: '#999',
            borderRadius: 3,
            padding: [3, 3]
          }
        },
        splitNumber: 100,

        splitLine: {
          lineStyle: {
            width: 1,
            color: '#ffffff',
          }
        },
        axisLine: {
          lineStyle: {
            width: 2,
            color: '#ffffff',
          }
        },
        splitArea: {
          areaStyle: {
            color: [
              new echarts.graphic.LinearGradient(0, 0, 1, 0,
                  [{
                    offset: 0,
                    color: '#c6ffdd'
                  }, {
                    offset: 1,
                    color: '#fbd786'
                  }],
                  false),
              new echarts.graphic.LinearGradient(0, 0, 1, 0,
                  [{
                    offset: 0,
                    color: '#fbd786'
                  }, {
                    offset: 1,
                    color: '#f7797d'
                  }],
                  false),
            ]
          },
        },
        indicator: [],

      },
      series: [{
        type: 'radar',
        data: []
      }]
    },

    btnGroupToggle: 0,
    dataLoading: false,
    workerParam: {
      filePath: null,
      sortType: null,
      fucType: null,
    },
    alert: false,
    errorDetailsDialog: {
      text: "暂无",
      show: false,
    },
    excelOptionsDialog: {
      show: false,
    },
    okDialog: {
      submit:false,
      reset: false,
      show: false,
    },
    // "A", "B", "C", "D", "year", "month", "day", "hour", "wd"
    excelOptions: {
      year: 4,
      month: 5,
      day: 6,
      hour: 7,
      wd: 8,
    },
    defaultExcelOptions: {
      year: 4,
      month: 5,
      day: 6,
      hour: 7,
      wd: 8,
    },
  }),
  methods: {
    excelOptionsSubmit() {
      fs.writeFileSync(optionFilePath,JSON.stringify({excelOptions:this.excelOptions}));
      this.okDialog.submit=false;
      this.excelOptionsDialog.show=false;
    },
    excelOptionsReset() {
      fs.writeFileSync(optionFilePath,JSON.stringify({excelOptions:this.defaultExcelOptions}));
      this.okDialog.reset=false;
      this.excelOptionsDialog.show=false;
    },

    //计算雷达图最大值
    handleLegendSelectChanged: function (e) {
      let selected = e.selected;
      let max = 0;
      for (let prop of Object.keys(selected)) {
        if (selected[prop] === false) continue;

        let dataArray = this.chartsData.series[0].data
        for (let data of dataArray) {
          if (data.name === prop) {
            let valueArray = data.value;
            let currentMax = Math.max.apply(null, valueArray);
            if (currentMax > max) {
              max = currentMax;
            }
          }
        }

        let indicatorArray = this.chartsData.radar.indicator;
        for (let indicator of indicatorArray) {
          indicator.max = max;
        }
      }
    },
    toYear: function () {

      this.dataLoading = true;
      this.workerParam.sortType = 'year';
      this.workerParam.fucType = 'sort';
      ipcRenderer.send('message-from-renderer', this.workerParam);
    },
    toMonth: function () {

      this.dataLoading = true;
      this.workerParam.sortType = 'month';
      this.workerParam.fucType = 'sort';
      ipcRenderer.send('message-from-renderer', this.workerParam);
    },
    toQuarter: function () {

      this.dataLoading = true;
      this.workerParam.sortType = 'quarter';
      this.workerParam.fucType = 'sort';
      ipcRenderer.send('message-from-renderer', this.workerParam);
    },
    readAndSort: function (filePath) {
      this.workerParam.filePath = filePath;
      this.workerParam.fucType = 'read';
      this.workerParam.excelOptions = this.excelOptions;
      this.dataLoading = true;
      ipcRenderer.send('message-from-renderer', this.workerParam);
    },

    chooseFileDialog: function () {
      const {dialog} = require('electron').remote;
      dialog.showOpenDialog({
        filters:
            [
              {name: 'excel', extensions: ['xlsx', 'xls']}
            ],
        properties: ['openFile']
      }).then(result => {
        if (!result.canceled) {
          return this.readAndSort(result.filePaths[0]);
        }
      }).catch(err => {
        console.log(err)
      })
    },
  },
  watch: {
    dataLoading: function (val) {
      if (val) {
        this.$refs.vechart.showLoading()
      } else {
        this.$refs.vechart.hideLoading()
      }
    }
  },
  created() {


    {//雷达图坐标初始化
      let indicatorArray = [];
      for (let wdName of Object.keys(new Wind().windDirectionCount)) {
        let indicatorItem = {};
        indicatorItem.name = wdName;
        indicatorArray.push(indicatorItem);
      }
      this.chartsData.radar.indicator = indicatorArray;
    }
    {//excelOptions初始化
      // console.log(optionFilePath)
      if(fs.existsSync(optionFilePath)){
        let options=fs.readFileSync(optionFilePath,'utf-8');
        let excelOptions = JSON.parse(options).excelOptions;
        //判断配置文件中的配置是否符合要求
        if(excelOptions){
          let matchFlag=true;
          for (let prop of Object.keys(this.excelOptions)){
            if(!Object.prototype.hasOwnProperty.call(excelOptions, prop)) {
              matchFlag=false;
              break;
            }
          }
          if(matchFlag){
            this.excelOptions=excelOptions;
          }
        }
      }
      // console.log(this.excelOptions)

    }



    ipcRenderer.removeAllListeners("message-from-worker");
    ipcRenderer.on('message-from-worker', (event, arg) => {
      if (arg.isSuccess) {
        if (arg.type === 'read') {
          this.workerParam.sortType = 'year';
          this.workerParam.fucType = 'sort';
          this.btnGroupToggle = 0
          ipcRenderer.send('message-from-renderer', this.workerParam);
        }
        if (arg.type === 'sort') {
          this.tableData = arg.table;
          this.chartsData.legend.data = arg.charts.legendData
          this.chartsData.radar.indicator = arg.charts.indicator
          this.chartsData.series[0].data = arg.charts.seriesData
        }
        this.alert = false;
      } else {
        this.alert = true;
        this.errorDetailsDialog.text = arg.error;
      }
      this.dataLoading = false;
    });

  },

};


</script>

