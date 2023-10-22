import {afamIVStore} from "@/stores/afamIVStore";
import { afamVStore } from "./stores/afamVStore";

export const checkConnections = () => {
    afamIVStore().checkConnection();
}

export const disconnected = () => {
    afamIVStore().disconnected();
}