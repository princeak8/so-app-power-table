import { afamIIIStore } from './stores/afamIIIStore';
import { afamIVStore } from './stores/afamIVStore';
import { afamVStore } from './stores/afamVStore';
import { afamVIStore } from './stores/afamVIStore';
import { alaojiStore } from './stores/alaojiStore';
import { azuraStore } from './stores/azuraStore';
import { dadinkowaStore } from './stores/dadinkowaStore';
import { delta2Store } from './stores/delta2Store';
import { delta3Store } from './stores/delta3Store';
import { delta4Store } from './stores/delta4Store';
import { egbinStore } from './stores/egbinStore';
import { gereguStore } from './stores/gereguStore';
import { gereguNippStore } from './stores/gereguNippStore';
import { gbarainStore } from './stores/gbarainStore';
import { ibomStore } from './stores/ibomStore';
import { ihovborStore } from './stores/ihovborStore';
import { jebbaStore } from './stores/jebbaStore';
import { kainjiStore } from './stores/kainjiStore';
import { okpaiStore } from './stores/okpaiStore';
import { olorunsogoStore } from './stores/olorunsogoStore';
import { olorunsogoNippStore } from './stores/olorunsogoNippStore';
import { omokuStore } from './stores/omokuStore';
import { omotoshoStore } from './stores/omotoshoStore';
import { omotoshoNippStore } from './stores/omotoshoNippStore';
import { parasEnergyStore } from './stores/parasEnergyStore';
import { riversIppStore } from './stores/riversIppStore';
import { sapeleNippStore } from './stores/sapeleNippStore';
import { sapeleSteamStore } from './stores/sapeleSteamStore';
import { shiroroStore } from './stores/shiroroStore';
import { taopexStore } from './stores/taopexStore';
import { transamadiStore } from './stores/transamadiStore';
import { zungeruStore } from './stores/zungeruStore';

const stations = [
    { name: "AFAM III", store: afamIIIStore, showDetails: true },
    { name: "AFAM IV", store: afamIVStore, showDetails: true },
    { name: "AFAM V", store: afamVStore, showDetails: true },
    { name: "AFAM VI", store: afamVIStore, showDetails: true },
    { name: "ALAOJI", store: alaojiStore, showDetails: false },
    { name: "AZURA", store: azuraStore, showDetails: false },
    { name: "DADINKOWA", store: dadinkowaStore, showDetails: true },
    { name: "DELTA 2", store: delta2Store, showDetails: true },
    { name: "DELTA 3", store: delta3Store, showDetails: true },
    { name: "DELTA 4", store: delta4Store, showDetails: true },
    { name: "EGBIN", store: egbinStore, showDetails: true },
    { name: "GEREGU", store: gereguStore, showDetails: false },
    { name: "GEREGU NIPP", store: gereguNippStore, showDetails: false },
    { name: "GBARAIN", store: gbarainStore, showDetails: false },
    { name: "IBOM", store: ibomStore, showDetails: false },
    { name: "IHOVBOR", store: ihovborStore, showDetails: false },
    { name: "JEBBA", store: jebbaStore, showDetails: false },
    { name: "KAINJI", store: kainjiStore, showDetails: false },

    { name: "Okpai", store: okpaiStore, showDetails: true },
    { name: "OLORUNSOGO", store: olorunsogoStore, showDetails: false },
    { name: "OLORUNSOGO NIPP", store: olorunsogoNippStore, showDetails: false },
    { name: "OMOKU", store: omokuStore, showDetails: false },
    { name: "OMOTOSHO", store: omotoshoStore, showDetails: false },
    { name: "OMOTOSHO NIPP", store: omotoshoNippStore, showDetails: false },
    { name: "PARAS ENERGY", store: parasEnergyStore, showDetails: true },
    { name: "RIVERS IPP", store: riversIppStore, showDetails: false },
    { name: "SAPELE NIPP", store: sapeleNippStore, showDetails: false },
    { name: "SAPELE STEAM", store: sapeleSteamStore, showDetails: true },
    { name: "SHIRORO", store: shiroroStore, showDetails: true },
    { name: "TAOPEX", store: taopexStore, showDetails: false },
    { name: "TRANS-AMADI", store: transamadiStore, showDetails: false },
    { name: "ZUNGERU", store: zungeruStore, showDetails: false },
  ];

  export default stations