<template>
    <v-app>
        <v-app-bar
                app
                color="primary"
                dark
        >
            <div class="d-flex align-center">

                <v-btn-toggle  v-model="btnGroupToggle" color="white" group>
                    <v-btn  @click="toYear">
                        <span>年</span>

                        <v-icon right>mdi-format-align-left</v-icon>
                    </v-btn>

                    <v-btn >
                        <span>季</span>

                        <v-icon right>mdi-format-align-center</v-icon>
                    </v-btn>

                    <v-btn  @click="toMonth">
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

                <v-row justify="center">
                    <v-data-table
                            :headers="headers"
                            :items="tableData"
                            :items-per-page="10"
                            class="elevation-1"
                    ></v-data-table>
                </v-row>


            </v-container>
        </v-main>
    </v-app>
</template>

<script>
    import moment from "moment";

    import Wind from "./classes/Wind";
//    import WindDirection from "./classes/WindDirection";


    export default {
        name: 'App',
        data: () => ({
            rawData:[],
            headers: [
//                {text: '年', align: 'start', sortable: false, value: 'year'},
//                {text: '月', value: 'month'},
                {text: '日期', value: 'sDateTime'},
                {text: 'N', value: 'N'},
                {text: 'NNE', value: 'NNE'},
                {text: 'NE', value: 'NE'},
                {text: 'ENE', value: 'ENE'},
            ],
            tableData: [],
            btnGroupToggle:0
        }),
        methods: {
            toYear: function () {
                this.tableData = this.yearData;
            },
            toMonth: function () {
                this.tableData = this.monthData;
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

                        this.readData(filePath);

                    }
                }).catch(err => {
                    console.log(err)
                })
            },
            readData:function (filePath) {
                const XLSX = window.require('xlsx');
                let workbook = XLSX.readFile(filePath);

                let first_sheet_name = workbook.SheetNames[0];
                let worksheet = workbook.Sheets[first_sheet_name];
                this.rawData = XLSX.utils.sheet_to_json(worksheet, {header: ["A", "B", "C", "D", "year", "month", "day", "hour", "wd"]});
                this.tableData=this.yearData;
                this.btnGroupToggle=0
            },
        },
        computed:{
            monthData: function () {
                let rawData = this.rawData;
                let map = new Map();
                for (let value of rawData.values()) {
                    let {year, month, wd} = value;

                    let date = moment().year(year).month(month - 1);
                    let ym = date.format('yyyy-MM');
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
                    if (wind[wd] !== undefined) {
                        wind[wd] = wind[wd] + 1;
                    }
                }
                return Array.from(map.values());
            },
            yearData: function () {
                let rawData = this.rawData;
                let map = new Map();
                for (let value of rawData.values()) {
                    let {year, month, wd} = value;

                    let date = moment().year(year).month(month - 1);
                    let ym = date.format('yyyy');
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
                    if (wind[wd] !== undefined) {
                        wind[wd] = wind[wd] + 1;
                    }
                }
                return Array.from(map.values());
            },
        }
    };
</script>
