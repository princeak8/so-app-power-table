<template>
    <!-- <TheWelcome /> -->
    <div class="content-container" style="border: none; display: relative;">
        <div id="header">
            <div class="heading">
                <h1>REPORTS</h1>
            </div>

            <div>
                <div style="margin-bottom: 3%; margin-top: 3%; display: flex; flex-direction: row; justify-content: space-between;">
                    <h2>{{ title }}</h2>
                    <button type="button" @click="reload">
                        <span v-if="!reloading">RELOAD</span>
                        <img v-if="reloading" src="./reload.gif" width="50" height="30" />
                    </button>
                </div>
                <div style="display: flex; flex-direction: row;">
                    <p>Start Date:<input type="date" v-model="startDate" :max="maxStartDate" /></p>
                    <p style="margin-left: 5%; margin-right: 2%;">End Date: <input type="date" v-model="endDate" :max="maxEndDate" :min="minEndDate" :disabled="!endDateActive" /></p>
                    <button type="button" @click="search"> Search </button>
                    <button type="button" @click="download"> Download </button>
                    <button type="button" @click="clear"> Clear </button>           
                </div>
                
            </div>
        </div>
        <div class="content">
            <Reports :loadDrops="loadDrops" />
        </div>
    </div>
</template>

<style scoped>
    .table-column {
        text-align: center; padding-top: 1em; padding-bottom: 1em;
    }
    .button {
        font-size: 1em; height: 2em; border-radius: 0.5em; 
    }

    /* The sticky class is added to the header with JS when it reaches its scroll position */
    .sticky {
        position: fixed;
        top: 0;
        width: 100%;
    }

    .sticky + .content {
        padding-top: 102px;
    }
</style>


<script setup lang="ts">
    import { ref, onBeforeMount, watch, onMounted } from 'vue';
    // import { save as saveToStorage } from "@/services/DbService";
    import { settings } from '@/enums';
    const { VITE_POWER_SAMPLE_SIZE, VITE_MAX_LOAD_DROP_THRESHOLD } = import.meta.env;
    import axios from "axios";
    import Reports from "../components/inc/Reports.vue";

    let loadDrops = ref([]);
    let title = ref('latest Load Drops');
    let startDate = ref();
    let endDate = ref();
    let error = ref('');
    let maxEndDate = ref(new Date().toJSON().split('T')[0]);
    let minEndDate = ref(startDate);
    let maxStartDate = ref(new Date().toJSON().split('T')[0]);
    let endDateActive = ref(false);
    let reloading = ref(false);
    
    let header:any = null;
    let sticky:any = null;

    watch(startDate, (start) => {
        (start != undefined) ? endDateActive.value = true : endDateActive.value = false;
    })

    const latestDrops = async () => {
        const url = `${import.meta.env.VITE_DB_URL}load_drop/latest`
        await axios.get(url)
              .then((res) => {
                    //console.log('latest drops:', res.data);
                    loadDrops.value = (res.data.data) ? res.data.data : res.data;
              })
              .catch((err) => console.log('Error:', err));
    }

    const reload =async () => {
        const url = `${import.meta.env.VITE_DB_URL}load_drop/latest`
        reloading.value = true;
        await axios.get(url)
            .then((res) => {
                // console.log('latest drops:', res.data);
                loadDrops.value = res.data;
            })
            .catch((err) => console.log('Error:', err));
        reloading.value = false;
    }

    const search = async () => {
        console.log('start date: ',startDate.value);
        console.log('end date: ',endDate.value);
        if(startDate.value != undefined) {
            let url = `${import.meta.env.VITE_DB_URL}load_drop/range?start=${startDate.value}`;
            if(endDate.value != undefined) url += `&end=${endDate.value}`;
            await axios.get(url)
                .then((res) => {
                    console.log('range: ',res.data.data);
                    loadDrops.value = res.data.data;
                })
                .catch((err) => {
                    console.log('Error:', err);
                });
        }
    }

    const download = async () => {
        if(startDate.value != undefined) {
            let url = `${import.meta.env.VITE_DB_URL}load_drop/download_range?start=${startDate.value}`;
            if(endDate.value != undefined) url += `&end=${endDate.value}`;
            await axios.get(url, {
                        responseType: 'blob',
                        headers: {
                            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        }
                    })
                .then((res) => {
                    console.log('Download Successful', res);
                    // loadDrops.value = res.data;;

                    // Create a Blob
                    const blob = new Blob([res.data], { 
                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    });

                    // Get filename from response headers if available
                    const contentDisposition = res.headers['content-disposition'];
                    let filename = `loadDrop Report ${startDate.value}.xlsx`;
                    if (contentDisposition) {
                        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                        if (filenameMatch && filenameMatch[1]) {
                            filename = filenameMatch[1].replace(/['"]/g, '');
                        }
                    }

                    // Create download link
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', filename);
                    document.body.appendChild(link);
                    link.click();

                    // Cleanup
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);

                })
                .catch((err) => {
                    console.log('Download Error:', err);
                });
        }
    }

    const clear = async () => {
        startDate.value = undefined;
        endDate.value = undefined;
        latestDrops();
    }

    onBeforeMount(async() => {
        latestDrops();
    })

    onMounted(() => {
        //
    })


</script>