<template>
    <div>

    </div>
</template>
<script>
    import moment from 'moment';
    import Wind from '../libs/wind';

    const {ipcRenderer} = require('electron')

    export default {
        name: 'Worker',
        data:() => ({

        }),
    }
    let rawData=[];
    let response={
        table:null,
        charts:null,
        type:null
    }
    ipcRenderer.on('message-from-renderer', (event, mainArgs) => {

        if(mainArgs.fucType==='read'){
            console.log(mainArgs)
            let {filePath} =mainArgs;
            readFile(filePath);
            response.type='read';
            ipcRenderer.send('message-from-worker', response);
        }

        if(mainArgs.fucType==='sort'){
            let {sortType} =mainArgs;
            let sortedData = sortData(rawData,sortType);

            response.table=Array.from(sortedData.values());
            response.charts=genChartsOption(sortedData);
            response.type='sort';
            ipcRenderer.send('message-from-worker', response);
        }
    })

    // function readAndSort(mainArgs) {
    //     let {filePath,sortType} =mainArgs;
    //     readFile(filePath);
    //     let sortedData = sortData(rawData,sortType);
    //     let data={};
    //     data.table=Array.from(sortedData.values());
    //     data.charts=genChartsOption(sortedData);
    //
    //     ipcRenderer.send('message-from-worker', data);
    // }

    function readFile(filePath) {
        const XLSX = require('xlsx');

        let workbook = XLSX.readFile(filePath);
        let first_sheet_name = workbook.SheetNames[0];
        let worksheet = workbook.Sheets[first_sheet_name];
        return rawData = XLSX.utils.sheet_to_json(worksheet, {header: ["A", "B", "C", "D", "year", "month", "day", "hour", "wd"]}) ?? [];
    }

    function sortData(rawData, type) {
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
    }

     function genChartsOption(sortedData) {
        let map = sortedData;
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

        let json= {
            tooltip: {},
            legend: {
                data: legendData,
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
                indicator: indicatorArray
            },
            series: [{
                type: 'radar',

                data: seriesDataArray
            }]
        };
         console.log(json)
        return json;
    }

</script>
