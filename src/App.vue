<template>
    <v-app>
        <v-app-bar
                app
                color="primary"
                dark
        >
            <div class="d-flex align-center">

                <v-btn-toggle :class="{ 'd-none': btnGroupHide }" v-model="btnGroupToggle" color="white" group>
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
                <v-icon>mdi-open-in-new</v-icon>
            </v-btn>

        </v-app-bar>

        <v-main>
            <v-container fluid>
                <v-row>
                    <v-col>
                        <v-data-table loading-text="读取数据..." :loading="dataTableLoading"
                                      :headers="headers"
                                      :items="tableData"
                                      :items-per-page="10"
                                      class="elevation-1"
                        />
                    </v-col>
                </v-row>
                <!--                <v-row><v-divider></v-divider></v-row>-->
                <v-row>
                    <v-col>
                        <v-card justify="center">
                            <v-chart :options="chartsData" autoresize style="width: 100%; height: 500px"/>
                        </v-card>
                    </v-col>
                </v-row>

            </v-container>
        </v-main>
    </v-app>
</template>

<script>
    import moment from "moment";

    import Wind from "./classes/Wind";

    // "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"
    export default {
        name: 'App',
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
            chartsData:{},
            btnGroupToggle: 0,
            btnGroupHide: true,
            dataTableLoading: false,

        }),
        methods: {
            toYear: function () {
                // this.dataTableLoading=true;
                this.chartsData = this.yearEchartsOptions;
                this.tableData = this.yearData;
                // this.dataTableLoading=false;
            },
            toMonth: function () {
                // this.dataTableLoading=true;
                this.chartsData = this.monthEchartsOptions;
                this.tableData = this.monthData;
                // this.dataTableLoading=false;
            },
            toQuarter: function () {
                // this.dataTableLoading=true;
                this.chartsData = this.quarterEchartsOptions;
                this.tableData = this.quarterData;
                // this.dataTableLoading=false;
            },
            chooseFileDialog: function () {
                const {dialog} = window.require('electron').remote;

                dialog.showOpenDialog({
                    filters:
                        [
                            {name: 'excel', extensions: ['xlsx', 'xls']}
                        ],
                    properties: ['openFile']
                }).then(result => {
                    if (!result.canceled) {
                        let filePath = result.filePaths[0];
                        // this.dataTableLoading=true;
                        this.readData(filePath);
                        // this.dataTableLoading=false;
                    }
                }).catch(err => {
                    console.log(err)
                })
            },
            readData: function (filePath) {
                const XLSX = window.require('xlsx');
                let workbook = XLSX.readFile(filePath);
                let first_sheet_name = workbook.SheetNames[0];
                let worksheet = workbook.Sheets[first_sheet_name];
                this.rawData = XLSX.utils.sheet_to_json(worksheet, {header: ["A", "B", "C", "D", "year", "month", "day", "hour", "wd"]}) ?? [];
                if (Object.is(this.rawData.length, 0)) return;
                this.tableData = this.yearData;
                this.chartsData = this.yearEchartsOptions;
                this.btnGroupToggle = 0;
                this.btnGroupHide = false
            },
            sortData: function (rawData, type) {

                let format;
                switch (type) {
                    case 'year':
                        format = 'yyyy';
                        break;
                    case 'quarter':
                        format = 'yyyy-第Q季度';
                        break;
                    case 'month':
                        format = 'yyyy-MM';
                        break;
                    default :
                        format = 'yyyy'
                }
                let map = new Map();
                for (let value of rawData.values()) {
                    let {year, month, wd} = value;

                    let date = moment().year(year).month(month - 1);
                    let ym = date.format(format);
                    let wind;
                    if (map.has(ym)) {
                        wind = map.get(ym);
                    } else {
                        wind = new Wind();
                        map.set(ym, wind);
                        wind.year = year;
                        wind.month = month;
                        wind.sDateTime = ym;
                    }
                    if (wind.windDirectionCount[wd] !== undefined) {
                        wind.windDirectionCount[wd] = wind.windDirectionCount[wd] + 1;
                    }
                }
                return map;
            },
            genChartsOption:function (rawData, type) {
                let map = this.sortData(rawData, type);
                let values = Array.from(map.values());

                let legendData = Array.from(map.keys());
                let seriesDataArray = [];
                let max = 0;
                for (let data of values) {
                    let itemData = {};
                    itemData.name = data.sDateTime;
                    itemData.value = [];
                    for (let wdName of Object.keys(data.windDirectionCount)) {
                        itemData.value.push(data.windDirectionCount[wdName])
                    }
                    let currentMax = Math.max.apply(null, itemData.value);
                    if (max < currentMax) {
                        max = currentMax;
                    }

                    seriesDataArray.push(itemData)
                }
                let indicatorArray = [];
                for (let wdName of Object.keys(new Wind().windDirectionCount)) {
                    let indicatorItem = {};
                    indicatorItem.name = wdName;
                    indicatorItem.max = max;
                    indicatorArray.push(indicatorItem);
                }

                return {

                    tooltip: {},
                    legend: {
                        data: legendData
                    },
                    radar: {
                        // shape: 'circle',
                        name: {
                            textStyle: {
                                color: '#fff',
                                backgroundColor: '#999',
                                borderRadius: 3,
                                padding: [3, 5]
                            }
                        },
                        indicator: indicatorArray
                    },
                    series: [{
                        type: 'radar',
                        // areaStyle: {normal: {}},
                        data: seriesDataArray
                    }]
                };
            },
        },
        computed: {
            monthEchartsOptions: function () {
                return this.genChartsOption(this.rawData, 'month');
            },
            quarterEchartsOptions: function () {
                return this.genChartsOption(this.rawData, 'quarter');
            },
            yearEchartsOptions: function () {
                return this.genChartsOption(this.rawData, 'year');
            },

            monthData: function () {
                return Array.from(this.sortData(this.rawData, 'month').values());
            },
            quarterData: function () {
                return Array.from(this.sortData(this.rawData, 'quarter').values());
            },
            yearData: function () {
                return Array.from(this.sortData(this.rawData, 'year').values());
            },
        }
    };
</script>
