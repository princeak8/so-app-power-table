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
                    // console.log('latest drops:', res.data);
                    loadDrops.value = res.data;
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
        if(startDate.value != undefined) {
            let url = `${import.meta.env.VITE_DB_URL}load_drop/range?start=${startDate.value}`;
            if(endDate.value != undefined) url += `&end=${endDate.value}`;
            await axios.get(url)
                .then((res) => {
                    // console.log('range: ',res.data);
                    loadDrops.value = res.data;;
                })
                .catch((err) => {
                    console.log('Error:', err);
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