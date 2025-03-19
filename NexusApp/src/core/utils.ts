import { Platform } from "react-native"
import ProfileImage from '../assets/images/Profile.png'
import { ADDRESS } from "./api"

function log(...args: any[]) {
    for(let i = 0; i < arguments.length ; i++){
        let arg = arguments[i]
        if (typeof arg === 'object') {
            arg = JSON.stringify(arg, null, 2)
        } 
        console.log(`[${Platform.OS}]`,arg)
    }
}

function thumbnail(url: string) {
    if(!url){
        return ProfileImage
    }

    return {
        uri: 'http://' + ADDRESS + '/thumbnail/' + url
    }

}

export default { log, thumbnail }