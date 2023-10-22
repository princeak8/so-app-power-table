<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import { type dataType, type sectionType, type processingStationType, type stationType, type rawSectionType, type rawStationType } from "@/types/index";
import { stationStore } from "@/helper";
import { checkConnections, disconnected } from './connectionHelpers';
import { ref, watch, onBeforeMount } from 'vue';
import { randomNumber } from './utilities';

let rawData = ref({
    id: "afamIv_vPs",
    t: "11:50:2",
    units: [
      {
        id: "gt17",
        td: {
          mw: randomNumber(95, 300),
          A: randomNumber(1, 600),
          V: randomNumber(300, 360),
          mvar: randomNumber(0, 45)
        }
      },
      {
        id: "gt18",
        td: {
          mw: randomNumber(95, 300),
          A: randomNumber(1, 600),
          V: randomNumber(300, 360),
          mvar: randomNumber(0, 45)
        }
      }
    ]
  });

  const getRawData = () => {
    return {
    id: "afamIv_vPs",
    t: "11:50:2",
    units: [
      {
        id: "gt17",
        td: {
          mw: randomNumber(95, 300),
          A: randomNumber(1, 600),
          V: randomNumber(300, 360),
          mvar: randomNumber(0, 45)
        }
      },
      {
        id: "gt18",
        td: {
          mw: randomNumber(95, 300),
          A: randomNumber(1, 600),
          V: randomNumber(300, 360),
          mvar: randomNumber(0, 45)
        }
      }
    ]
  }
  }

  const formatStreamedData = (rawData: rawStationType): stationType | null => {
      let formattedSectionData = formatSections(rawData);

      let formattedInnerData = (formattedSectionData != null ) ? formatAllInnerData(formattedSectionData.sections) : null;
      // let formattedInnerData = (formattedSectionData != null) ? formatAllInnerData(formattedSectionData) : null
      if(formattedSectionData != null && formattedInnerData != null) {
        return {...formattedSectionData, sections: formattedInnerData};
      }
      return null;
  }

  //convert units and lines to sections
  const formatSections = (rawStationData: rawStationType): processingStationType | null => {
    let sectionData:rawSectionType[];
    if(rawStationData.units) {
       sectionData = [...rawStationData.units];
      //  delete rawStationData.units;
       return {...rawStationData, sections: sectionData};
    }
    if(rawStationData.lines) {
      sectionData = [...rawStationData.lines];
      //  delete rawStationData.lines;
      return {...rawStationData, sections: sectionData};
    }
    return null;
  }


  // loop through all the lines/units and format the data
  const formatAllInnerData = (rawSectionData: rawSectionType[]): sectionType[] => {
      let result: sectionType[] = [];
      rawSectionData.forEach((rawSection: rawSectionType) => {
        let formattedSection = formatInnerData(rawSection);
        if(formattedSection != null) result.push(formattedSection);
      })
      return result;
  }

  // convert td or pd to data
  const formatInnerData = (rawSectionData: rawSectionType): sectionType | null => {
      let dt: dataType;
      if(rawSectionData.td) {
        dt = {...rawSectionData.td};
        // delete rawSectionData.td;
        return {...rawSectionData, data: dt};
      }
      if(rawSectionData.pd) {
        dt = {...rawSectionData.pd};
        // delete rawSectionData.pd;
        return {...rawSectionData, data: dt};
      }
      if(rawSectionData.gd) {
        dt = {...rawSectionData.gd};
        // delete rawSectionData.gd;
        return {...rawSectionData, data: dt};
      }
      return null;
  }

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

      const ws = new WebSocket('ws://localhost:3002');

      ws.onmessage = (msg) => {
          try{
              const fMsg = JSON.parse(msg.data);
              connected.value = true;
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

  function connectionStopped () {
      connected.value = false;
      disconnected();
      clearInterval(intervalId);
      // console.log('stop checking');
  }

  onBeforeMount(async() => {
      connect();
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
    padding-right: calc(var(--section-gap) / 2);
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


