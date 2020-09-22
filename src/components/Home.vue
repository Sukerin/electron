<template>
  <v-app>
    <v-app-bar
        app
        color="primary"
        dark
    >
      <div class="d-flex align-center">

        <v-btn-toggle v-model="btnGroupToggle" color="white" group>
          <v-btn @click="toYear">
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
              <v-chart :options="chartsData"  autoresize style="width: 100%;height: 500px"
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
      <v-btn icon color="white" @click.stop=" errorDetailsDialog = true">
        <v-icon>mdi-bug</v-icon>
      </v-btn>

      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn text v-bind="attrs" v-on="on" color="white">
            <v-icon>mdi-copyright</v-icon>
            {{ new Date().getFullYear() }} - 风向玫瑰图
          </v-btn>
        </template>
        <span>软件作者：汪健健（武汉市气象局）、董睿</span>
      </v-tooltip>


      <v-dialog
          v-model="errorDetailsDialog"
          max-width="290"
      >
        <v-card>
          <v-card-title>异常详情</v-card-title>
          <v-card-text>
            {{ errorDetails }}
          </v-card-text>
        </v-card>
      </v-dialog>

    </v-footer>
  </v-app>
</template>

<script>
import echarts from "echarts";
import Wind from "@/libs/wind";


const {ipcRenderer} = require('electron');
// "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"
export default {
  name: 'Home',
  data: () => ({
    rawData: [],
    headers: [
//                {text: '年', align: 'start', sortable: false, value: 'year'},
//                {text: '月', value: 'month'},
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
      legend: {
        data: [],
        type: 'scroll',
      },
      radar: {
        // shape: 'circle',
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
            width: 3,
            color: '#ffffff',
          }
        },
        splitArea: {
          areaStyle: {
            color: [
              new echarts.graphic.LinearGradient(0, 0, 1, 0,
                  [{
                    offset: 0,
                    color: '#ed7d31'
                  }, {
                    offset: 1,
                    color: '#ffffff'
                  }],
                  false),
              new echarts.graphic.LinearGradient(0, 0, 1, 0,
                  [{
                    offset: 0,
                    color: '#ffffff'
                  }, {
                    offset: 1,
                    color: '#2f2f2f'
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
    mainArgs: {
      filePath: null,
      sortType: null,
      fucType: null,
    },
    alert: false,
    errorDetails: "暂无",
    errorDetailsDialog: false,
  }),
  methods: {
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
      this.mainArgs.sortType = 'year';
      this.mainArgs.fucType = 'sort';
      ipcRenderer.send('message-from-renderer', this.mainArgs);
    },
    toMonth: function () {

      this.dataLoading = true;
      this.mainArgs.sortType = 'month';
      this.mainArgs.fucType = 'sort';
      ipcRenderer.send('message-from-renderer', this.mainArgs);
    },
    toQuarter: function () {

      this.dataLoading = true;
      this.mainArgs.sortType = 'quarter';
      this.mainArgs.fucType = 'sort';
      ipcRenderer.send('message-from-renderer', this.mainArgs);
    },
    readAndSort: function (filePath) {
      this.mainArgs.filePath = filePath;
      this.mainArgs.fucType = 'read';
      this.dataLoading = true;
      ipcRenderer.send('message-from-renderer', this.mainArgs);
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
    {
      let indicatorArray=[];
      for (let wdName of Object.keys(new Wind().windDirectionCount)) {
        let indicatorItem = {};
        indicatorItem.name = wdName;
        indicatorArray.push(indicatorItem);
      }
      this.chartsData.radar.indicator=indicatorArray;
    }

    ipcRenderer.removeAllListeners("message-from-worker");
    ipcRenderer.on('message-from-worker', (event, arg) => {
      if (arg.isSuccess) {
        if (arg.type === 'read') {
          this.mainArgs.sortType = 'year';
          this.mainArgs.fucType = 'sort';
          this.btnGroupToggle = 0
          ipcRenderer.send('message-from-renderer', this.mainArgs);
        }
        if (arg.type === 'sort') {
          this.tableData = arg.table;
          this.chartsData.legend.data=arg.charts.legendData
          this.chartsData.radar.indicator=arg.charts.indicator
          this.chartsData.series[0].data=arg.charts.seriesData
        }
        this.alert = false;
      } else {
        this.alert = true;
        this.errorDetails = arg.error;
      }
      this.dataLoading = false;
    });

  },

};


</script>

