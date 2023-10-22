export interface dataType {
    mw: number | string;
    A: number | string;
    V: number | string;
    mvar: number | string;
}

export interface sectionType {
    id: string;
    data: dataType;
}

export interface processingStationType {
    id: string;
    t: string;
    sections: rawSectionType[];
}

export interface stationType {
    id: string;
    t: string;
    sections: sectionType[]
}

export interface rawSectionType {
    id: string;
    td?: dataType;
    pd?: dataType;
    gd?: dataType;
}

export interface rawStationType {
    id: string;
    t: string;
    units?: rawSectionType[];
    lines?: rawSectionType[];
}

export interface powerDropType {
    drop: number;
    status: boolean;
}

export interface powerValObjType {
    pwr: string;
    status: boolean;
}

export interface mvarValObjType extends powerValObjType {}

export interface voltageValObjType {
    value: number;
    status: powerValObjType['status'];
}

export interface singleStoreValsType {
    power: powerValObjType;
    mvar: mvarValObjType;
    voltage: voltageValObjType;
}