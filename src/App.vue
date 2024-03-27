<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { stationStore, formatStreamedData } from "@/helper";
import { checkConnections, disconnect } from './connectionHelpers';
import { ref, watch, onBeforeMount, onMounted } from 'vue';
import axios from "axios";
import { settings } from '@/enums';
import { retrieveLoadDropsFromStorage } from '@/helper';
import { inStorage, putInStorage, storage } from './localStorage';

  let connected = ref(false);
  let intervalId = 0;
  let MessageReceivedTime = Math.round(new Date().getTime() / 1000);

  watch(connected, (isConnected) => {
      if(isConnected) {
          intervalId = startChecking();
      }else{
          connectionStopped();
      }
  })

  const wait = (ms: number) => {
      return new Promise((resolve) => {
          console.log(`waiting ${ms/1000}Secs to retry connection`);
          setTimeout(resolve, ms);
      })
  }

  const connect = () => {

      const ws = new WebSocket(import.meta.env.VITE_SOCKET_URL);

      ws.onmessage = async (msg) => {
          try{
              const fMsg = JSON.parse(msg.data);
              // if(fMsg.id=='odukpaniNippPs') console.log('fmsg:', fMsg);
              connected.value = true;
              if(fMsg.id && fMsg.nc) {
                let ncStation = stationStore(fMsg.id);
                ncStation.disconnected();
              }
              // if(fMsg.id=='olorunsogoLines') console.log('formatted message', fMsg);
              // console.log('formatted message', fMsg);
              // const formattedData = (fMsg.id == 'afamIv_vPs') ? formatStreamedData(getRawData()) : formatStreamedData(fMsg);
              const formattedData = formatStreamedData(fMsg);
              // if(formattedData?.id=='dadinKowaGs') console.log('formatted data', formattedData);
              if(formattedData != null) {
                  // if(formattedData?.id=='dadinKowaGs') console.log('formatted data', formattedData);
                  const station = stationStore(formattedData.id);
                  // if(formattedData?.id=='dadinKowaGs') console.log('dadinkowa station', station);
                  
                  if(station != undefined) {
                    // if(formattedData?.id=='dadinKowaGs') console.log('setting station');
                      station.set(formattedData);
                  }
                  MessageReceivedTime = Math.round(new Date().getTime() / 1000);
                  checkConnections();
              }
          }catch(error){
              //
          }
      }

      ws.onerror = async (error) => {
          console.log('Web Socket Error:', error);
          // await wait(5000);
          // connect();
      }

      ws.onclose = async (event: any) => {
          console.log('Web Socket has closed.', event);
          await wait(5000);
          connect();
      }
  }

  const startChecking = () => {
    return setInterval(() => {
      // console.log('checking..');
      if(Math.abs(Math.round(new Date().getTime() / 1000) - MessageReceivedTime) > 60) {
        connectionStopped();
      }else{
        // console.log(Math.abs(Math.round(new Date().getTime() / 1000) - MessageReceivedTime));
      }
    }, 10000);
  }

  const testDB =async () => {
    const url = `${import.meta.env.VITE_DB_URL}load_drop/latest`;
    return await axios.get(url)
    .then((res) => {
        return true;
    })
    .catch((err) => {
      return false;
    });
  }

  const checkAndUpdateDB = async () => {
    setInterval(async () => {
      // console.log('checking..');
      if(inStorage(settings.LoadDropsData)) { // if there's loadDropsData key in the localstorage
          let loadDrops = retrieveLoadDropsFromStorage(); // retrieve the data from localstorage
          if(loadDrops.length > 0) { // if the data is not empty
              await updateDB(loadDrops);
          }else{
              // console.log('no load drops:',loadDrops);
          }
      }else{
          // console.log('not in storage');
      }
    }, 30000);
  }

  async function updateDB(loadDrops:any) {
      let dbOk = await testDB(); // test if the DB is going
      if(dbOk) {
          // console.log('DB is okay');
          // let savedIndexes: number[] = [] // indexes of load drop data that has been saved successfuly
          let unSavedData: any[] = [];
          // loadDrops.forEach(async (loadDropData:any, index:number) => {
          for(let i=0; i < loadDrops.length; i++) {
              let loadDropData = loadDrops[i];
              loadDropData.calType = (inStorage(settings.LoadDropOption)) ? String(storage(settings.LoadDropOption)) : String(import.meta.env.VITE_DB_CAL_TYPE);
              const url = `${import.meta.env.VITE_DB_URL}load_drop/save`;
              try{
                  await axios.post(url, loadDropData);
                  // console.log('load drops', loadDrops);
                  // console.log('saved successfuly');
                  // console.log(savedIndexes);
              }catch(err) {
                  unSavedData.push(loadDropData);
                  console.log("error:", err);
              }
          }
          console.log('unSavedData:', unSavedData);
          putInStorage(settings.LoadDropsData, JSON.stringify(unSavedData));
          
          // if(savedIndexes.length > 0) {
          //     console.log('deleting saved load drops');
          //     // while(savedIndexes.length > 0) {
          //     savedIndexes.forEach(async (index) => await loadDrops.splice(index, 1));
          //     console.log('load drops', loadDrops);
          //     putInStorage(settings.LoadDropsData, JSON.stringify(loadDrops))
          // }else{
          //   console.log('savedIndexes:', savedIndexes);
          // }
      }else{
          // console.log('DB is not OK');
      }
  }

  function connectionStopped () {
      connected.value = false;
      disconnect();
      clearInterval(intervalId);
      // console.log('stop checking');
  }

  onBeforeMount(async() => {
      connect();
  })

  onMounted(async() => {
      // console.log('check and update DB');
      checkAndUpdateDB();
      // console.log(storage(settings.LoadDropsData));
  })


  // const formattedData = formatStreamedData(rawData.value);
  // console.log('formatted data', formattedData);
  // if(formattedData != null) {
  //     const station = stationStore(formattedData.id);
  //     station.set(formattedData);
  // }
  // console.log('raw data:', rawData);
</script>

<template>
  <!-- <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header> -->
  <div style="display: flex; flex-direction: row; justify-content: flex-end;">
    <RouterLink to="/" style="margin-right: 5%;"><b>HOME</b></RouterLink>
    <RouterLink to="/settings" style="margin-right: 5%;"><b>SETTINGS</b></RouterLink>
    <RouterLink to="/reports" style="margin-right: 5%;"><b>REPORTS</b></RouterLink>
  </div>
  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    /* padding-right: calc(var(--section-gap) / 2); */
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>


