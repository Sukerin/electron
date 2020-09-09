<template>
    <v-container>
        <v-row class="text-center">
            <v-col cols="12">
                <v-img
                        :src="require('../assets/logo.svg')"
                        class="my-3"
                        contain
                        height="200"
                />
            </v-col>

            <v-col class="mb-4">
                <v-btn @click="chooseFileDialog">choose file</v-btn>
            </v-col>

        </v-row>
    </v-container>
</template>

<script>
    import moment from "moment"
    export default {
        name: 'HelloWorld',

        data: () => ({
            rawData:[],
        }),
        methods: {
            chooseFileDialog: () => {
                const {dialog} = window.require('electron').remote;

                dialog.showOpenDialog({
                    filters:
                        [
                            {name: 'excel', extensions: ['xlsx', 'xls']}
                        ],
                    properties: ['openFile']
                }).then(result => {
                    if(!result.canceled){
                        let filePath=result.filePaths[0];
                        const XLSX=window.require('xlsx');
                        let workbook = XLSX.readFile(filePath);
                        let first_sheet_name = workbook.SheetNames[0];
                        let worksheet = workbook.Sheets[first_sheet_name];
                        let jsonArray= XLSX.utils.sheet_to_json(worksheet, {header:["A","B","C","D","year","month","day","hour","wd"]});

                        this.rawData=jsonArray;

                    }
                }).catch(err => {
                    console.log(err)
                })
            }
        },
        computed:{
            sortedData:()=>{
                for (let value of this.rawData.values()){
                    let {year,month}=value ;
                    let date=moment().year(year).month(month)
                    console.log(date.format('yyyy-MM')) ;
                    break;
                }
            }

        }
    }
</script>
