import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import { type dataType, type sectionType, type stationType } from "@/types/index";
import { initializeStation } from '@/helper';

export const useStationData = defineStore('stationData', () => {
  const afamIV = ref(initializeStation('afamIv_vPs'));
  const afamV = ref(initializeStation('afamVPs'));
  const afamVI = ref(initializeStation('afamViTs'));
  const alaoji = ref(initializeStation('alaoji'));
  const azura = ref(initializeStation('azura'));
  const dadinkowa = ref(initializeStation('dadinkowaGs'));
  const delta2 = ref(initializeStation('delta2'));
  const delta3 = ref(initializeStation('delta3'));
  const delta4 = ref(initializeStation('deltaGs'));
  const egbin = ref(initializeStation('egbinPs'));
  const eket = ref(initializeStation('eket'));
  const ekim = ref(initializeStation('ekim'));
  const gbarain = ref(initializeStation('gbarain'));
  const geregu = ref(initializeStation('gereguPs'));
  const gereguNipp = ref(initializeStation('gereguPs'));
  const ihovbor = ref(initializeStation('ihovborNippPs'));
//   const ikot = ref(initializeStation('afamIV'));
  const jebba = ref(initializeStation('JebbaTs'));
  const kainji = ref(initializeStation('kainjiTs'));
  const odukpani = ref(initializeStation('odukpaniNippPs'));
  const okpai = ref(initializeStation('okpaiGs'));
  const olorunsogo1 = ref(initializeStation('olorunsogo1'));
  const olorunsogo2 = ref(initializeStation('olorunsogoPhase1Gs'));
  const omoku = ref(initializeStation('omokuPs1'));
  const omotosho1 = ref(initializeStation('omotosho1'));
  const omotosho2 = ref(initializeStation('omotosho2'));
  const omotoshoNipp = ref(initializeStation('omotoshoNippPs'));
  const parasEnergy = ref(initializeStation('parasEnergyPs'));
//   const phMain = ref(initializeStation('phmain'));
  const riversIpp = ref(initializeStation('riversIppPs'));
  const sapeleNipp = ref(initializeStation('sapeleNippPs'));
  const sapeleSteam = ref(initializeStation('afamIV'));
  const shiroro = ref(initializeStation('shiroroPs'));
  const taopex = ref(initializeStation('taopex'));
//   const transamadi = ref(initializeStation('afamIV'));
  const zungeru = ref(initializeStation('zungeru'));

  const stations: stationType[] = [afamIV.value, afamV.value, afamVI.value, alaoji.value, azura.value, dadinkowa.value, delta2.value, delta3.value, delta4.value, 
                                    egbin.value, eket.value, ekim.value, gbarain.value, geregu.value, gereguNipp.value, ihovbor.value, 
                                    jebba.value, kainji.value, odukpani.value, okpai.value, olorunsogo1.value, olorunsogo2.value, omoku.value, omotosho1.value, 
                                    omotosho2.value, omotoshoNipp.value, parasEnergy.value, riversIpp.value, 
                                        sapeleNipp.value, sapeleSteam.value, shiroro.value, taopex.value, zungeru.value
                                    ];

    function setStation (data: stationType) {
        stations.forEach((station) => {
            console.log(`${station.id} == ${data.id}`)
            if(station.id == data.id) {
              console.log('station is set')
              station = {...data};
              console.log(afamIV.value);
            }
        })
    }

    const afamIVStation = computed(() => afamIV.value)

  return { setStation, afamIVStation, afamV, afamVI, alaoji, azura, dadinkowa, delta2, delta3, delta4, egbin, eket, ekim, gbarain, geregu, gereguNipp, 
            ihovbor, jebba, kainji, odukpani, okpai, olorunsogo1, olorunsogo2, omoku, omotosho1, omotosho2, omotoshoNipp, parasEnergy, riversIpp, 
            sapeleNipp, sapeleSteam, shiroro, taopex, zungeru
          }
})

// export const stationData = defineStore('stationData', {
    
//     state: () => ({
//         afamIV: initializeStation('afamIV_vPs'),
//         afamV: initializeStation('afamVPs'),
//         afamVI: initializeStation('afamViTs'),
//         alaoji: initializeStation('alaoji'),
//         azura: initializeStation('azura'),
//         dadinkowa: initializeStation('dadinkowaGs'),
//         delta2: initializeStation('delta2'),
//         delta3: initializeStation('delta3'),
//         delta4: initializeStation('deltaGs'),
//         egbin: initializeStation('egbinPs'),
//         eket: initializeStation('eket'),
//         ekim: initializeStation('ekim'),
//         gbarain: initializeStation('gbarain'),
//         geregu: initializeStation('gereguPs'),
//         gereguNipp: initializeStation('gereguPs'),
//         ihovbor: initializeStation('ihovborNippPs'),
//         jebba: initializeStation('JebbaTs'),
//         kainji: initializeStation('kainjiTs'),
//         odukpani: initializeStation('odukpaniNippPs'),
//         okpai: initializeStation('okpaiGs'),
//         olorunsogo1: initializeStation('olorunsogo1'),
//         olorunsogo2: initializeStation('olorunsogoPhase1Gs'),
//         omoku: initializeStation('omokuPs1'),
//         omotosho1: initializeStation('omotosho1'),
//         omotosho2: initializeStation('omotosho2'),
//         omotoshoNipp: initializeStation('omotoshoNippPs'),
//         parasEnergy: initializeStation('parasEnergyPs'),
//         riversIpp: initializeStation('riversIppPs'),
//         SapeleNipp: initializeStation('sapeleNippPs'),
//         SapeleSteam: initializeStation('afamIV'),
//         shiroro: initializeStation('shiroroPs'),
//         taopex: initializeStation('taopex'),
//         zungeru: initializeStation('zungeru'),
//     }),
//     getters: {
//         loggedIn: (state) => {
//             // console.log("loggedIn:user", state.user)
//             return (state.user == null) ? false : true
//         },
//     },
//     actions: {
//         // no context as first argument, use `this` instead
//         loginSuccess(user) {
//             console.log('setting user in the store');
//             this.user = {...user};
//             console.log('The set user:', this.user);
//         },
//     }
// })
