import axios from "axios";
import { Platform } from "react-native";

export const ADDRESS = Platform.OS === 'ios'
    ? "localhost:8787/api"
    : "10.0.2.2:8787/api"

const api = axios.create({
    baseURL: `http://${ADDRESS}`,
    headers: {
        'Content-Type': 'application/json'
    }
})

export default api