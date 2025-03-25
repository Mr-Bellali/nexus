import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { TextInput, TouchableOpacity, View } from "react-native";

interface MessageInputProps {
    message: string;
    setMessage: any;
    onSend: any;
}

function MessageInput({ message, setMessage, onSend }: MessageInputProps) {
    return (
        <View
            style={{
                paddingHorizontal: 10,
                paddingBottom: 10,
                backgroundColor: 'white',
                flexDirection: 'row',
                alignItems: 'center'
            }}
        >
            <TextInput
                placeholder='Message...'
                placeholderTextColor="#909090"
                value={message}
                onChangeText={setMessage}
                style={{
                    flex: 1,
                    paddingHorizontal: 18,
                    borderWidth: 1,
                    borderRadius: 25,
                    borderColor: '#d0d0d0',
                    backgroundColor: 'white',
                    height: 50
                }}
            />
            <TouchableOpacity
                onPress={onSend}
            >
                <FontAwesomeIcon
                    icon='paper-plane'
                    size={22}
                    color='#303040'
                    style={{
                        marginHorizontal: 12
                    }}
                />
            </TouchableOpacity>
        </View>
    )
}


export default MessageInput