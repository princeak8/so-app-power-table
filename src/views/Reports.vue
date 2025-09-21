<template>
    <!-- <TheWelcome /> -->
    <div class="border-0 relative">
        <div id="header">
            <div class="heading">
                <h1 class="font text-8xl font-extrabold text-red-500">REPORTS</h1>
            </div>

            <div>
                <div class="mb-6 mt-6 flex flex-row justify-between">
                    <h2>{{ title }}</h2>
                    <button type="button" @click="reload">
                        <span v-if="!reloading">RELOAD</span>
                        <img v-if="reloading" src="./reload.gif" width="50" height="30" />
                    </button>
                </div>
                <div class="flex flex-row gap-4 mb-4">
                    <!-- <p>Start Date:<input type="date" v-model="startDate" :max="maxStartDate" class="border-2 rounded" /></p> -->
                    <!-- <p class="ml-[5%] mr-[2%]">End Date: <input type="date" v-model="endDate" :max="maxEndDate" :min="minEndDate" :disabled="!endDateActive" /></p> -->
                    <div class="border-2 border-blue-500 p-2 rounded-lg bg-blue-50 min-w-fit">
                        <label class="block text-xs font-medium text-blue-700 mb-1">Start Date</label>
                        <input type="date" v-model="startDate" :max="maxStartDate" class="bg-transparent border-0 focus:outline-none text-sm" />
                    </div>
                    <div class="border-2 border-blue-500 p-2 rounded-lg bg-blue-50 min-w-fit" :class="{'opacity-50': !endDateActive}">
                        <label class="block text-xs font-medium text-blue-700 mb-1">End Date</label>
                        <input type="date" v-model="endDate" :max="maxEndDate" :min="minEndDate" :disabled="!endDateActive" class="bg-transparent border-0 focus:outline-none text-sm disabled:text-gray-400" />
                    </div>
                    <!-- <button type="button" @click="search" class="!rounded-md !py-2 !px-3 !border-2 !text-red-600"> Search </button>
                    <button type="button" @click="download"> Download </button>
                    <button type="button" @click="clear"> Clear </button> -->

                    <button type="button" @click="search" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"> Search </button>
                    <button type="button" @click="download" class="bg-green-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all"> Download </button>
                    <button type="button" @click="clear" class="bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all"> Clear </button>
                    
                    

                </div>
                <div style="margin-top: 24px; margin-bottom: 24px;">
    <input type="text" v-model="nameFilter" placeholder="Filter name..." class="w-[30%] px-4 py-2 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
</div>
            </div>
        </div>
        <div class="content">
            <Reports :loadDrops="filteredLoadDrops" />
        </div>
    </div>
</template>

<style scoped>
    .table-column {
        text-align: center; 
        padding-top: 1em; 
        padding-bottom: 1em;
    }
    
    /* .button {
        font-size: 1em; 
        height: 2em; 
        border-radius: 0.5em; 
    } */

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
    import { ref, onBeforeMount, watch, onMounted, computed } from 'vue';
    // import { save as saveToStorage } from "@/services/DbService";
    import { settings } from '@/enums';
    const { VITE_POWER_SAMPLE_SIZE, VITE_MAX_LOAD_DROP_THRESHOLD } = import.meta.env;
    import axios from "axios";
    import Reports from "../components/inc/Reports.vue";

    let nameFilter = ref('');
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

    const filteredLoadDrops = computed(() => {
        if (!nameFilter.value.trim()) {
            return loadDrops.value;
        }
        
        return loadDrops.value.filter((item: any) => {
            // Adjust the property name based on your data structure
            // Common property names might be: name, title, description, etc.
            const nameToFilter = item.station.name;
            return nameToFilter.toLowerCase().includes(nameFilter.value.toLowerCase());
        });
    });

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
        nameFilter.value = '';
        latestDrops();
    }

    onBeforeMount(async() => {
        latestDrops();
    })

    onMounted(() => {
        //
    })
</script>