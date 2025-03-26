import axios from "axios";
import { Platform } from "react-native";

export const ADDRESS = "192.168.1.14:8787/api"

const api = axios.create({
    baseURL: `http://${ADDRESS}`,
    headers: {
        'Content-Type': 'application/json'
    }
})

export default api