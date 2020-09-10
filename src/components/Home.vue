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

    export default {
        name: 'Home',

        data: () => ({

        }),
        methods: {
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
                        this.$router.push({path:`/charts/${filePath}`})
                    }
                }).catch(err => {
                    console.log(err)
                })
            }
        },

    }
</script>
