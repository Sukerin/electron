<template>
    <v-app>
        <v-app-bar
                app
                color="primary"
                dark
        >
            <div class="d-flex align-center">

                <v-btn-toggle :class="{ 'd-none': btnGroupHide }" v-model="btnGroupToggle" color="white" group>
                    <v-btn @click="toYear" id="yearBtn">
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

        <v-main>

            <v-container fluid>

                <v-row class="mb-4">
                    <v-col>
                        <v-card class="d-flex" :loading="dataLoading">

                            <div :class="['pa-16',{ 'd-none': !btnGroupHide }]">
                                <span class="text--disabled body-2">暂无数据</span>
                            </div>

                            <v-chart :options="chartsData" autoresize style="width: 100%;height: 500px"
                                     :class="['align-center ','justify-center',{ 'd-none': btnGroupHide }]"/>
                        </v-card>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col>
                        <v-card>
                            <v-data-table loading-text="读取数据..." :loading="dataLoading" fixed-header
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
        <v-footer class="d-flex justify-end rounded " app>
            <v-btn text>
                <v-icon>mdi-information</v-icon>
                {{ new Date().getFullYear() }} - 风向玫瑰图
            </v-btn>

        </v-footer>
    </v-app>
</template>

<script>


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
            chartsData: {},
            btnGroupToggle: 0,
            btnGroupHide: true,
            dataLoading: false,
            mainArgs: {
                filePath: null,
                sortType: null,
                fucType: null,
            }

        }),
        methods: {
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

                ipcRenderer.send('message-from-renderer', this.mainArgs);

                this.dataLoading = true;

                ipcRenderer.on('message-from-worker', (event, arg) => {
                    if (arg.type === 'read') {
                        this.btnGroupHide = false
                        this.btnGroupToggle = 0
                        this.mainArgs.sortType = 'year';
                        this.mainArgs.fucType = 'sort';
                        ipcRenderer.send('message-from-renderer', this.mainArgs);
                    }
                    if (arg.type === 'sort') {
                        this.tableData = arg.table;
                        this.chartsData = arg.charts
                    }
                    this.dataLoading = false;

                });

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

    };


</script>
