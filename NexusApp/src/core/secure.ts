import EncryptedStorage from "react-native-encrypted-storage"

async function set(key: string, object: Object) {
    console.log("object: ", object);
    try {
        await EncryptedStorage.setItem(key, JSON.stringify(object))
    } catch (error) {
        console.error("secure.set: ", error)
    }
}

async function get(key: string) {
    try {
        const data = await EncryptedStorage.getItem(key)
        if (data !== undefined) {
            return JSON.parse(data as string)
        }
    } catch (error) {
        console.error("secure.get: ", error)
    }
}

async function remove(key: string) {
    try {
        await EncryptedStorage.removeItem(key)
    } catch (error) {
        console.error("secure.remove: ", error)
    }
}

async function wipe() {
    try {
        await EncryptedStorage.clear()
    } catch (error) {
        console.error("secure.wipe: ", error)
    }
}

export default { set, get, remove, wipe }