import axios from "axios";
import { Platform } from "react-native";

const ADDRESS = Platform.OS === 'ios'
    ? "http://localhost:8787/api"
    : "http://10.0.2.2:8787/api"

const api = axios.create({
    baseURL: ADDRESS,
    headers: {
        'Content-Type': 'application/json'
    }
})

export default api