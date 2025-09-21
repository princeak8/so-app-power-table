import { stationId } from '@/enums';

import { afamIIIStore } from './afamIIIStore';
import {afamIVStore} from "@/stores/afamIVStore";
import { afamVStore } from "@/stores/afamVStore";
import { afamVIStore } from "./afamVIStore";
import { alaojiStore } from "./alaojiStore";
import { azuraStore } from "./azuraStore";
import { dadinkowaStore } from "./dadinkowaStore";
import { delta2Store } from "./delta2Store";
import { delta3Store } from "./delta3Store";
import { delta4Store } from "./delta4Store";
import { egbinStore } from "./egbinStore";
import { gereguStore } from "./gereguStore";
import { gereguNippStore } from "./gereguNippStore";
import { gbarainStore } from "./gbarainStore";
import { ihovborStore } from "./ihovborStore";
import { jebbaStore } from "./jebbaStore";
import { kainjiStore } from "./kainjiStore";
import { odukpaniStore } from "./odukpaniStore";
import { sapeleNippStore } from "./sapeleNippStore";
import { sapeleSteamStore } from './sapeleSteamStore';
import { okpaiStore } from "./okpaiStore";
import { olorunsogoNippStore } from "./olorunsogoNippStore";
import { omokuStore } from "./omokuStore";
import { omotoshoNippStore } from "./omotoshoNippStore";
import { omotoshoStore } from './omotoshoStore';
import { parasEnergyStore } from "./parasEnergyStore";
import { riversIppStore } from "./riversIppStore";
import { shiroroStore } from "./shiroroStore";
import { taopexStore } from "./taopexStore";
import { transamadiStore } from "./transamadiStore";
import { zungeruStore } from "./zungeruStore";

import { useEketStore } from "./useEketStore";
import { useEkimStore } from "./useEkimStore";
import { useOmotosho1Store } from "./useOmotosho1Store";
import { useOmotosho2Store } from "./useOmotosho2Store";
import { useOlorunsogo1Store } from "./useOlorunsogo1Store";
import { useOlorunsogo2Store } from "./useOlorunsogo2Store";

const stores = () =>  {
    return {
        [stationId.AfamIII] : afamIIIStore(),
        [stationId.AfamIV] : afamIVStore(),
        [stationId.AfamV] : afamVStore(),
        [stationId.AfamVI] : afamVIStore(),
        [stationId.Alaoji] : alaojiStore(),
        [stationId.Azura] : azuraStore(),
        [stationId.Dadinkowa] : dadinkowaStore(),
        [stationId.Delta2] : delta2Store(),
        [stationId.Delta3] : delta3Store(),
        [stationId.Delta4] : delta4Store(),
        [stationId.Egbin] : egbinStore(),
        [stationId.GereguNipp] : gereguNippStore(),
        [stationId.Geregu] : gereguStore(),
        [stationId.Gbarain] : gbarainStore(),
        [stationId.Ihovbor] : ihovborStore(),
        [stationId.Jebba] : jebbaStore(),
        [stationId.Kainji] : kainjiStore(),
        [stationId.Odukpani] : odukpaniStore(),
        [stationId.Okpai] : okpaiStore(),
        [stationId.OlorunsogoLines] : olorunsogoNippStore(),
        [stationId.Omoku] : omokuStore(),
        [stationId.OmotoshoNipp] : omotoshoNippStore(),
        [stationId.OmotoshoGas] : omotoshoStore(),
        [stationId.ParasEnergy] : parasEnergyStore(),
        [stationId.RiversIpp] : riversIppStore(),
        [stationId.SapeleNipp] : sapeleNippStore(),
        [stationId.SapeleSteam] : sapeleSteamStore(),
        [stationId.Shiroro] : shiroroStore(),
        [stationId.Taopex] : taopexStore(),
        [stationId.Transamadi] : transamadiStore(),
        [stationId.Zungeru] : zungeruStore(),
        

        [stationId.Eket] : useEketStore(),
        [stationId.Ekim] : useEkimStore(),
        [stationId.Omotosho1] : useOmotosho1Store(),
        [stationId.Omotosho2] : useOmotosho2Store(),
        [stationId.Olorunsogo1] : useOlorunsogo1Store(),
        [stationId.Olorunsogo2] : useOlorunsogo2Store(),
    };
};

export default stores;