import { type dataType, type sectionType, type stationType, type powerValObjType, type mvarValObjType, type voltageValObjType, type singleStoreValsType } from "@/types/index";
import {afamIVStore} from "@/stores/afamIVStore";
import { afamVStore } from "./stores/afamVStore";
import { stationId } from '@/enums';
import stores from "./stores";

export const initializeStation = (name: string): stationType => {
    return {
        id: name,
        t: "11:50:2",
        sections: [
          {
            id: "",
            data: {
              mw: '',
              A: '',
              V: '',
              mvar: ''
            }
          },
        ]
      }
}

// const round = (num:number, places:number) => {
//         return Math.round(num + "e+" + places)  + "e-" + places);
//         return +(Math.round(num + "e+2")  + "e-2");
//     }
// }

export const getPower = (sections: sectionType[], absolute=false): powerValObjType => {
    let pwr = 0;
    let status = false;
    sections.forEach((section) => {
        let mw = parseFloat(section.data.mw.toString());
        if(!Number.isNaN(mw)) {
            status = true;
            if(absolute) {
                mw = (mw < 0) ? (mw * -1) : mw;
                pwr += mw;
            }else{
                pwr += mw;
            }
        }
    });
    return {pwr: pwr.toFixed(2), status};
}

export const getMvar = (sections: sectionType[], absolute=false): mvarValObjType => {
    let pwr = 0;
    let status = false;
    sections.forEach((section) => {
        let mx = parseFloat(section.data.mvar.toString());
        if(!Number.isNaN(mx)) {
            status = true;
            if(absolute) {
                mx = (mx < 0) ? (mx * -1) : mx;
                pwr += mx;
            }else{
                pwr += mx;
            }
        }
    });
    return {pwr: pwr.toFixed(2), status};
}

export const getVoltage = (sections: sectionType[]): voltageValObjType => {
    let status = false;
    let voltage = 0;
    sections.forEach((section) => {
        let v = parseFloat(section.data.V.toString());
        if(!Number.isNaN(v)) {
            status = true;
            voltage = (v > voltage) ? v : voltage
        }
    });
    // console.log('section', maxVoltageSection.data);
    return {value: parseInt(voltage.toString()), status}
}

//merge vals from different stores to become vals for a single store
export const mergeVals = (...vals: singleStoreValsType[]) => {
    let newVals: [any];
    let totalPower = {pwr: '0', status: false};
    let totalMvar = {pwr: '0', status: false};
    let totalVoltage = {value: 0, status: false};
    if(vals.length > 0) {
        vals.forEach((storeVals) => {
            // console.log('stroe values', storeVals);
            let {power, mvar, voltage} = storeVals;
            if(power != undefined) {
                if(power.status) {
                    let totalMw = parseFloat(totalPower.pwr);
                    totalMw += parseFloat(power.pwr);
                    totalPower.pwr = totalMw.toFixed(2);
                }
                if(power.status) totalPower.status = true;
            }

            if(mvar != undefined) {
                if(mvar.status) {
                    let totalMx = parseFloat(totalMvar.pwr);
                    totalMx += parseFloat(mvar.pwr);
                    totalMvar.pwr = totalMx.toFixed(2);
                }
                if(mvar.status) totalMvar.status = true;
            }

            if(voltage != undefined) {
                if(voltage.status) if(totalVoltage.value < voltage.value) totalVoltage.value = voltage.value;
                if(voltage.status) totalVoltage.status = true;
            }
        })
    }
    return {power: totalPower, mvar: totalMvar, voltage: totalVoltage};
}

//use max_load_drop_threshold, which is a percentage, to get the percentage threshold from the target
// the target is the value that will serve as a reference from which power drop percentage is calculated
// the target can either be gottrn from sampled incoming data or from a set value in sqlite
export const checkPowerDrop = (target: number, power: number) => {
    if(target > 0) {
        const dropTarget = (import.meta.env.VITE_MAX_LOAD_DROP_THRESHOLD/100) * target;
        const diff = target - power;
        if(diff > dropTarget) return {drop: diff, status: true};
    }
    return null;
}

export const checkPowerDrop1 = (incomingSections: sectionType[], currentSections: sectionType[]) => {
    let newTotal = incomingSections.reduce((total, next) => total + parseFloat(next.data.mw.toString()), 0);
    let currTotal = currentSections.reduce((total, next) => total + parseFloat(next.data.mw.toString()), 0);
    let diff = currTotal - newTotal;
    // console.log('diff:', diff);
    if(diff > import.meta.env.VITE_MAX_LOAD_DROP_THRESHOLD){
        return {drop: diff, status: true};
    }
    return null;
    // console.log(powerDrop.value);
}

// const stores = {
//     [stationId.AfamIV] : afamIVStore(),
//     [stationId.AfamV] : afamVStore()
// };

// export const monitorConnection = () => {
//     stores.forEach((store) => {
//         store.prototype.
//     })
// }

export const stationStore = (id: any) => {
    let AllStores = stores();
    return AllStores[id as keyof typeof AllStores];
}

export const currentTime = () => {
    return Math.round(new Date().getTime() / 1000);
}