import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { ImageLibraryOptions, launchImageLibrary } from 'react-native-image-picker'
import useGlobal from "../../core/global";


interface MessageInputProps {
    message: string;
    setMessage: any;
    onSend: any;
    navigation: any
}

function MessageInput({ message, setMessage, onSend, navigation }: MessageInputProps) {
    const [file, setFile] = useState<any>("")
    const selectMedia = useGlobal(state => state.selectMedia)
    return (
        <View
            style={{
                paddingHorizontal: 10,
                flexDirection: 'row',
                alignItems: 'center',
            }}
        >
            <View
                style={{
                    flex: 1,
                    paddingLeft: 18,
                    paddingRight: 10,
                    borderWidth: 1,
                    borderRadius: 25,
                    borderColor: '#d0d0d0',
                    backgroundColor: 'white',
                    height: 50,
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 10
                }}

            >
                <TextInput
                    placeholder='Message...'
                    placeholderTextColor="#909090"
                    value={message}
                    onChangeText={setMessage}
                    style={{
                        flex: 1,
                    }}
                />

                {file === "" ? (
                    <TouchableOpacity
                        style={{
                            width: 35,
                            height: 35,
                            borderRadius: 25,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onPress={() => {
                            launchImageLibrary({ includeBase64: true } as ImageLibraryOptions, (response) => {
                                if (response.didCancel) return
                                if (response.assets === undefined) return
                                selectMedia(response.assets[0])
                                setFile(response.assets[0])
                            })
                        }}
                    >
                        <FontAwesomeIcon
                            icon='paperclip'
                            size={22}
                            color='#505050'
                        />
                    </TouchableOpacity>
                ) : (
                    <View>

                    </View>
                )}
                <TouchableOpacity
                    style={{
                        width: 35,
                        height: 35,
                        borderRadius: 25,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onPress={() => {
                        navigation.navigate('Camera')
                    }}
                >
                    <FontAwesomeIcon
                        icon='camera'
                        size={22}
                        color='#505050'
                    />
                </TouchableOpacity>

            </View>
            <TouchableOpacity
                onPress={onSend}
            >
                <FontAwesomeIcon
                    icon='paper-plane'
                    size={22}
                    color='#303040'
                    style={{
                        marginLeft: 16,
                        marginRight: 5,
                    }}
                />
            </TouchableOpacity>
        </View>
    )
}


export default MessageInput