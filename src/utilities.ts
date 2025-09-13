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

export const getDate = (adjustOffset:boolean = true) => {
    let date = new Date();
    let timezoneOffset = date.getTimezoneOffset();
    let adjustedOffset = timezoneOffset * -1;
    // let lagosOffset = 120; // this is the offset for the Pacific Standard Time timezone
    // let adjustedTime = new Date(date.getTime() + (lagosOffset + timezoneOffset) * 60 * 1000);
    let adjustedDate = new Date(date.getTime() + adjustedOffset * 60 * 1000);
    return adjustedDate;
}

export const toNumber = (val: string | number | null | undefined): number => {
    if (val === null || val === undefined || val === '' || val === '-') return NaN
    return typeof val === 'number' ? val : parseFloat(val)
  }
