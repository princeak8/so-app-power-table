<template>
    <tr :class="[classes, { redBg: powerDrop.status }]">
      <td :class="classes" style="padding-left: 5px;">{{ sn }}</td>
      <td :class="[classes, { 'text-blue-500 clickable-cursor': showDetails }]" class="center cursor-pointer" @click="selectStation">{{ name }} </td>
      <td :class="classes" class="center">{{ vals.mw }}</td>
      <td :class="classes" class="center">{{ vals.mx }}</td>
      <td :class="classes" class="center">{{ vals.kv }}</td>
      <td class="center" :class="[classes, connectionStatusColor]">
        {{ isConnected ? "Connected" : isConnectionLost ? "Connection Lost" : "Not Connected" }}
      </td>
      <td :class="classes" class="center">
        <span v-if="!edit" @click="editDeclaredPower">{{ declaredPower || "-" }}</span>
        <input
          v-if="edit"
          type="text"
          class="form-control"
          v-model="declaredPower"
          @blur="saveDeclaredPower"
        />
      </td>
  
      <!-- Drop Handling Columns -->
      <StationPowerDropCols
        :powerDropIgnored="powerDropIgnored"
        :powerDrop="powerDrop"
        @emitAcknowledgeDrop="acknowledgeDrop"
        @emitIgnorePowerDrop="ignorePowerDrop"
        @emitLiftIgnore="liftIgnore"
      />
    </tr>

    <Teleport to="#app">
        <StationModal :isOpen="stationModalOpen" :station="station" @close="closeStationModal" style="z-index: 9999;" />
    </Teleport>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch, nextTick } from "vue";
  import { storeToRefs } from "pinia";
  import type { StoreGeneric } from "pinia";
  import StationPowerDropCols from "./inc/StationPowerDropCols.vue";
  import { inStorage, storage } from "@/localStorage";
  import { ignore, lift } from "@/helper";
  import { settings } from "@/enums";
  import { getDate } from "@/utilities";
  import StationModal from "./modals/StationModal.vue";
  
  // 🟢 Props
  const props = defineProps<{
  sn: number;
  name: string;
  classes: string;
  store: StoreGeneric; // <- correct type
  showDetails: boolean
}>();
  
  const emits = defineEmits([
    "emitTotal",
    "resetTotal",
    "startAlarm",
    "stopAlarm",
    "saveLoadDrop",
    "acknowledge",
  ]);
  
  // 🟢 Use the store passed from parent
  const {
    station,
    isConnected,
    isConnectionLost,
    powerDrop,
    vals,
    referenceLoad,
  } = storeToRefs(props.store);

//   console.log("station:", station.value);
  
  const stationModalOpen = ref(false);
  const storeId = props.store.$id;
  const declaredPower = ref(localStorage.getItem(storeId));
  const edit = ref(false);
  const powerDropIgnored = ref(
    inStorage("ignore-" + storeId) && storage("ignore-" + storeId) == "1"
  );
  const currLoad = ref();
  const prevLoad = ref();
  
  // 🟢 Watchers
  watch(
    () => powerDrop.value,
    (powerDropped) => {
      if (powerDropped.status) {
        if (powerDropIgnored.value == false) emits("startAlarm");
        const data = {
          powerStationId: station.value.id,
          load: parseFloat(vals.value.mw),
          previousLoad:
            prevLoad.value == null ? 0 : parseFloat(prevLoad.value),
          referenceLoad: referenceLoad.value,
          timeOfDrop: getDate().toISOString(),
          calType: localStorage.getItem(settings.LoadDropOption),
        };
        emits("saveLoadDrop", data);
      }
    }
  );
  
  const connectionStatusColor = computed(() => {
    return isConnected.value
      ? "connected"
      : isConnectionLost.value
      ? "connectionLost"
      : "notConnected";
  });
  
  watch(vals, (currentVals) => {
    if (currentVals.mw != "" && currentVals.mw != "-") {
      prevLoad.value = currLoad.value;
      currLoad.value = currentVals.mw;
      emits("emitTotal", station.value.id, currentVals.mw);
    }
  });
  
  watch(
    () => isConnected.value,
    (connected) => {
      if (!connected) emits("resetTotal", station.value.id);
    }
  );
  
  // 🟢 Handlers

  const selectStation = async () => {
      if(props.showDetails) stationModalOpen.value = true;
  }

  const closeStationModal = () => {
        stationModalOpen.value = false;
  }

  const acknowledgeDrop = () => {
    props.store.acknowledgePowerDrop();
    emits("stopAlarm");
    const data = {
      identifier: station.value.id,
      acknowledgedAt: new Date().toISOString(),
    };
    emits("acknowledge", data);
  };
  
  const ignorePowerDrop = () => {
    acknowledgeDrop();
    ignore(storeId);
    powerDropIgnored.value =
      inStorage("ignore-" + storeId) && storage("ignore-" + storeId) == "1";
  };
  
  const liftIgnore = () => {
    lift(storeId);
    powerDropIgnored.value =
      inStorage("ignore-" + storeId) && storage("ignore-" + storeId) == "1";
  };
  
  const editDeclaredPower = () => {
    edit.value = true;
  };
  
  const saveDeclaredPower = () => {
    if (!declaredPower.value) declaredPower.value = "";
    localStorage.setItem(storeId, declaredPower.value.toString());
    edit.value = false;
  };
  </script>

  <style>
.clickable-cursor {
  cursor: pointer !important;
}
</style>
  