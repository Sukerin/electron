<template>
    <v-container fluid>
        <v-row>
            <v-toolbar dense>
                <v-btn-toggle color="primary" group>
                    <v-btn @click="toYear">
                        <v-icon>mdi-format-align-left</v-icon>
                    </v-btn>

                    <v-btn @click="toMonth">
                        <v-icon>mdi-format-align-center</v-icon>
                    </v-btn>

                    <v-btn>
                        <v-icon>mdi-format-align-right</v-icon>
                    </v-btn>

                    <v-btn>
                        <v-icon>mdi-format-align-justify</v-icon>
                    </v-btn>
                </v-btn-toggle>

            </v-toolbar>
        </v-row>

        <v-row justify="center">
            <v-data-table
                    :headers="headers"
                    :items="tableData"
                    :items-per-page="10"
                    class="elevation-1"
            ></v-data-table>
        </v-row>


    </v-container>
</template>
<script>
    import moment from "moment";

    import Wind from "../classes/Wind";
    import WindDirectionCount from "../classes/WindDirectionCount";

    export default {
        name: 'Charts',
        data: () => ({
            headers: [
                {text: '年', align: 'start', sortable: false, value: 'year'},
                {text: '月', value: 'month'},
                {text: '日期', value: 'sDateTime'},
                {text: 'N', value: 'N'},
                {text: 'NNE', value: 'NNE'},
                {text: 'NE', value: 'NE'},
                {text: 'ENE', value: 'ENE'},
            ],
            tableData: [],
        }),
        methods: {
            toYear: function () {
                this.tableData = this.yearData;
            },
            toMonth: function () {
                this.tableData = this.monthData;
            },
        },
        computed: {
            yearData: function () {
                let processedData = this.processedData;
                let windDirection = new WindDirectionCount();
                let map = new Map();
                for (let item of processedData) {
                    let year = item.year;

                    let wind;
                    if (map.has(year)) {
                        wind = map.get(year);
                    } else {
                        wind = new Wind();
                        map.set(year, wind)
                        wind.year = year
                        wind.sDateTime = year
                    }
                    for (let prop in windDirection) {
                        wind[prop] = wind[prop] + item[prop];
                    }
                }
                return Array.from(map.values())
            },

            monthData: function () {
                return Array.from(this.processedData);
            },

            processedData: function () {
                const XLSX = window.require('xlsx');
                let workbook = XLSX.readFile(this.filePath);
                let first_sheet_name = workbook.SheetNames[0];
                let worksheet = workbook.Sheets[first_sheet_name];
                let rawData = XLSX.utils.sheet_to_json(worksheet, {header: ["A", "B", "C", "D", "year", "month", "day", "hour", "wd"]});
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
                        map.set(ym, wind)
                        wind.year = year
                        wind.month = month
                    }
                    if (wind[wd] !== undefined) {
                        wind[wd] = wind[wd] + 1;
                    }
                }
                return map.values()
            }

        },
        props: ['filePath']
    }
</script>