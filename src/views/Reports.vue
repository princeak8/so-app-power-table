<template>
    <div class="border-0 relative">
        <div id="header">
            <div class="heading">
                <h1 class="font text-8xl font-extrabold text-red-500">REPORTS</h1>
            </div>

            <!-- Tab Navigation -->
            <div class="flex gap-4 mb-6 mt-6 border-b border-gray-300">
                <button 
                    @click="activeTab = 'load-drops'" 
                    :class="[
                        'px-6 py-3 font-medium transition-all',
                        activeTab === 'load-drops' 
                            ? 'text-blue-600 border-b-2 border-blue-600' 
                            : 'text-gray-600 hover:text-blue-500'
                    ]"
                >
                    Load Drops
                </button>
                <button 
                    @click="activeTab = 'unit-by-unit'" 
                    :class="[
                        'px-6 py-3 font-medium transition-all',
                        activeTab === 'unit-by-unit' 
                            ? 'text-blue-600 border-b-2 border-blue-600' 
                            : 'text-gray-600 hover:text-blue-500'
                    ]"
                >
                    Unit by Unit
                </button>
            </div>

            <!-- Load Drops Tab Content -->
            <div v-if="activeTab === 'load-drops'">
                <div class="mb-6 mt-6 flex flex-row justify-between">
                    <h2>{{ title }}</h2>
                    <button type="button" @click="reload">
                        <span v-if="!reloading">RELOAD</span>
                        <img v-if="reloading" src="./reload.gif" width="50" height="30" />
                    </button>
                </div>
                <div class="flex flex-row gap-4 mb-4">
                    <div class="border-2 border-blue-500 p-2 rounded-lg bg-blue-50 min-w-fit">
                        <label class="block text-xs font-medium text-blue-700 mb-1">Start Date</label>
                        <input type="date" v-model="startDate" :max="maxStartDate" class="bg-transparent border-0 focus:outline-none text-sm" />
                    </div>
                    <div class="border-2 border-blue-500 p-2 rounded-lg bg-blue-50 min-w-fit" :class="{'opacity-50': !endDateActive}">
                        <label class="block text-xs font-medium text-blue-700 mb-1">End Date</label>
                        <input type="date" v-model="endDate" :max="maxEndDate" :min="minEndDate" :disabled="!endDateActive" class="bg-transparent border-0 focus:outline-none text-sm disabled:text-gray-400" />
                    </div>

                    <button type="button" @click="search" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"> Search </button>
                    <button type="button" @click="download" class="bg-green-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all"> Download </button>
                    <button type="button" @click="clear" class="bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all"> Clear </button>
                </div>
                <div style="margin-top: 24px; margin-bottom: 24px;">
                    <input type="text" v-model="nameFilter" placeholder="Filter name..." class="w-[30%] px-4 py-2 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
                </div>
            </div>

            <!-- Unit by Unit Tab Content -->
            <div v-if="activeTab === 'unit-by-unit'">
                <div class="mb-6 mt-6">
                    <h2 class="text-2xl font-semibold mb-4">Export Unit Data for Load Drops</h2>
                    <p class="text-gray-600 mb-6">Select a power station and date to export unit-by-unit data during load drop periods.</p>
                </div>

                <div class="bg-white text-gray-800 p-6 rounded-lg shadow-md">
                    <div class="space-y-4">
                        <!-- Input Fields in Row -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <!-- Power Station Select -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Power Station</label>
                                <select 
                                    v-model="unitExport.powerStationId" 
                                    class="w-full px-4 py-2 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-600"
                                    :disabled="loadingStations"
                                >
                                    <option value="">{{ loadingStations ? 'Loading stations...' : 'Select a power station' }}</option>
                                    <option 
                                        v-for="station in powerStations" 
                                        :key="station.id" 
                                        :value="station.id"
                                    >
                                        {{ station.name }}
                                    </option>
                                </select>
                            </div>

                            <!-- Date Select -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                <input 
                                    type="date" 
                                    v-model="unitExport.date" 
                                    :max="maxStartDate"
                                    class="w-full px-4 py-2 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-600"
                                />
                            </div>

                            <!-- Buffer Minutes (Optional) -->
                            <!-- <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Buffer Minutes (Optional)
                                    <span class="text-xs text-gray-500 ml-2">Minutes before/after drop to include</span>
                                </label>
                                <input 
                                    type="number" 
                                    v-model="unitExport.bufferMinutes" 
                                    min="1"
                                    max="60"
                                    placeholder="5"
                                    class="w-full px-4 py-2 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-600"
                                />
                            </div> -->
                        </div>

                        <!-- Export Button -->
                        <div class="pt-4">
                            <button 
                                type="button" 
                                @click="exportUnitData" 
                                :disabled="!canExport || exportingUnitData"
                                class="w-full bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                <span v-if="!exportingUnitData">Export Unit Data</span>
                                <span v-else>Exporting...</span>
                            </button>
                        </div>

                        <!-- Error Message -->
                        <div v-if="unitExportError" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p class="text-red-700 text-sm">{{ unitExportError }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Reports Content (only visible in Load Drops tab) -->
        <div class="content" v-if="activeTab === 'load-drops'">
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
    import { settings } from '@/enums';
    const { VITE_POWER_SAMPLE_SIZE, VITE_MAX_LOAD_DROP_THRESHOLD } = import.meta.env;
    import axios from "axios";
    import Reports from "../components/inc/Reports.vue";
    import type { PowerStation } from '@/types/index';

    // Existing refs
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
    
    // New refs for Unit by Unit tab
    let activeTab = ref('load-drops');
    let powerStations = ref<PowerStation[]>([]);
    let loadingStations = ref(false);
    let exportingUnitData = ref(false);
    let unitExportError = ref('');
    let unitExport = ref({
        powerStationId: '',
        date: '',
        bufferMinutes: 5
    });

    let header: any = null;
    let sticky: any = null;

    const filteredLoadDrops = computed(() => {
        if (!nameFilter.value.trim()) {
            return loadDrops.value;
        }
        
        return loadDrops.value.filter((item: any) => {
            const nameToFilter = item.station.name;
            return nameToFilter.toLowerCase().includes(nameFilter.value.toLowerCase());
        });
    });

    const canExport = computed(() => {
        return unitExport.value.powerStationId && unitExport.value.date;
    });

    watch(startDate, (start) => {
        (start != undefined) ? endDateActive.value = true : endDateActive.value = false;
    })

    // Watch for tab changes to load power stations
    watch(activeTab, (newTab) => {
        if (newTab === 'unit-by-unit' && powerStations.value.length === 0) {
            fetchPowerStations();
        }
    });

    const fetchPowerStations = async () => {
        loadingStations.value = true;
        const url = `${import.meta.env.VITE_DB_URL}power_stations/with_units`;
        
        try {
            const res = await axios.get(url);
            powerStations.value = res.data.data || res.data;
            console.log('Power stations loaded:', powerStations.value);
        } catch (err) {
            console.error('Error loading power stations:', err);
            unitExportError.value = 'Failed to load power stations. Please try again.';
        } finally {
            loadingStations.value = false;
        }
    };

    const exportUnitData = async () => {
        if (!canExport.value) {
            unitExportError.value = 'Please select both a power station and date.';
            return;
        }

        exportingUnitData.value = true;
        unitExportError.value = '';

        const url = `${import.meta.env.VITE_DB_URL}load_drop/export_load_drop_unit_data`;
        
        const params: any = {
            powerStationId: unitExport.value.powerStationId,
            date: unitExport.value.date
        };

        if (unitExport.value.bufferMinutes) {
            params.buffer_minutes = unitExport.value.bufferMinutes;
        }

        try {
            const res = await axios.post(url, params, {
                responseType: 'blob',
                headers: {
                    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                }
            });

            console.log('Export Successful', res);

            // Create a Blob
            const blob = new Blob([res.data], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            // Get filename from response headers if available
            const contentDisposition = res.headers['content-disposition'];
            const selectedStation = powerStations.value.find(
                (s: any) => s.id === unitExport.value.powerStationId
            );
            const stationName = selectedStation?.name || 'Station';
            let filename = `${stationName}_Unit_Data_${unitExport.value.date}.xlsx`;
            
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, '');
                }
            }

            // Create download link
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

        } catch (err: any) {
            console.error('Export Error:', err);
            unitExportError.value = err.response?.data?.message || 'Failed to export unit data. Please try again.';
        } finally {
            exportingUnitData.value = false;
        }
    };

    const latestDrops = async () => {
        const url = `${import.meta.env.VITE_DB_URL}load_drop/latest`
        await axios.get(url)
              .then((res) => {
                    loadDrops.value = (res.data.data) ? res.data.data : res.data;
              })
              .catch((err) => console.log('Error:', err));
    }

    const reload = async () => {
        const url = `${import.meta.env.VITE_DB_URL}load_drop/latest`
        reloading.value = true;
        await axios.get(url)
            .then((res) => {
                loadDrops.value = res.data;
            })
            .catch((err) => console.log('Error:', err));
        reloading.value = false;
    }

    const search = async () => {
        console.log('start date: ', startDate.value);
        console.log('end date: ', endDate.value);
        if (startDate.value != undefined) {
            let url = `${import.meta.env.VITE_DB_URL}load_drop/range?start=${startDate.value}`;
            if (endDate.value != undefined) url += `&end=${endDate.value}`;
            await axios.get(url)
                .then((res) => {
                    console.log('range: ', res.data.data);
                    loadDrops.value = res.data.data;
                })
                .catch((err) => {
                    console.log('Error:', err);
                });
        }
    }

    const download = async () => {
        if (startDate.value != undefined) {
            let url = `${import.meta.env.VITE_DB_URL}load_drop/download_range?start=${startDate.value}`;
            if (endDate.value != undefined) url += `&end=${endDate.value}`;
            await axios.get(url, {
                        responseType: 'blob',
                        headers: {
                            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        }
                    })
                .then((res) => {
                    console.log('Download Successful', res);

                    const blob = new Blob([res.data], { 
                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    });

                    const contentDisposition = res.headers['content-disposition'];
                    let filename = `loadDrop Report ${startDate.value}.xlsx`;
                    if (contentDisposition) {
                        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                        if (filenameMatch && filenameMatch[1]) {
                            filename = filenameMatch[1].replace(/['"]/g, '');
                        }
                    }

                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', filename);
                    document.body.appendChild(link);
                    link.click();

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

    onBeforeMount(async () => {
        latestDrops();
    })

    onMounted(() => {
        //
    })
</script>