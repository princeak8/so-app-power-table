//Retrieve and save data in localstorage

export const save = (key: string, val: any) => {
    localStorage.setItem(key, val);
}