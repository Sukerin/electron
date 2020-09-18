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
        type:null,
        isSuccess:true,
        error:null
    }
    ipcRenderer.on('message-from-renderer', (event, mainArgs) => {

        try {
            console.log(mainArgs)
            if(mainArgs.fucType==='read'){
                let {filePath} =mainArgs;
                readFile(filePath);
                response.type='read';
            }
            if(mainArgs.fucType==='sort'){
                let {sortType} =mainArgs;
                let sortedData = sortData(rawData,sortType);
                response.table=Array.from(sortedData.values());
                response.charts=genChartsOption(sortedData);
                response.type='sort';
            }
            response.isSuccess=true;
        }catch (e) {
            response.error=e;
            response.isSuccess=false;
        }

        ipcRenderer.send('message-from-worker', response);
    })

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
                format = 'yyyy-MM月';
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

        let legendArray = Array.from(map.keys());
        let seriesDataArray = [];
        let max = 0;
        for (let data of values) {
            let itemData = {};
            itemData.name = data.sDateTime;
            itemData.value = [];
            itemData.symbolSize=3;
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
         legendData: legendArray,
         indicator: indicatorArray,
         seriesData: seriesDataArray,
        };
    }

</script>
