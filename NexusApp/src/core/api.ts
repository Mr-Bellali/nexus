import axios from "axios";
import { Platform } from "react-native";

export const ADDRESS = Platform.OS === 'ios'
    ? "192.168.1.37:8787/api"
    : "192.168.1.37:8787/api"

const api = axios.create({
    baseURL: `http://${ADDRESS}`,
    headers: {
        'Content-Type': 'application/json'
    }
})

export default api