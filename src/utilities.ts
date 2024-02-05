import { type powerValObjType, type mvarValObjType, type voltageValObjType } from "./types";

export const randomNumber = (min:number, max:number) => {
    return Math.random() * (max - min) + min;
}

export const values = (power: powerValObjType, mvar: mvarValObjType, voltage: voltageValObjType) => {
    let mw = (power != undefined) ? ((power.status) ? power.pwr : '-') : '';
    let mx = (mvar != undefined) ? ((mvar.status) ? mvar.pwr : '-') : '';
    let kv = (voltage != undefined) ? ((voltage.status) ? voltage.value : '-') : '';
    return {mw, mx, kv};
}

export const getAverage = (arr: string[]) => {
    let sum = 0;
    arr.forEach((val) => {
        sum += parseFloat(val);
    })
    return parseFloat((sum/arr.length).toFixed(2));
}
