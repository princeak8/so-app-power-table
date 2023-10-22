//Retrieve and save data in DB.json file
import fs from 'fs';
const DB = '../DB.json'

export const fetch = async () => {
    let data = fs.readFileSync(DB);
    return JSON.parse(data.toString());
}

export const save = (data: any) => {
    fs.writeFileSync(DB, JSON.stringify(data));
}