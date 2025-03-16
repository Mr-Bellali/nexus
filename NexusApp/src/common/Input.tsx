import { Text, TextInput, View } from "react-native";

interface InputProps {
    title: string;
    value: string;
    setValue: any;
    error: any;
    setError: any;
    secureTextEntry?: boolean;
}

const Input = ({ title, value, error, setValue, setError, secureTextEntry = false }: InputProps) => {
    return (
        <View>
            <Text style={{
                color: error ? '#ff5555' : '#70747a',
                marginVertical: 6,
                paddingLeft: 16
            }}>
                {error ? error : title}
            </Text>
            <TextInput
                autoCapitalize="none"
                autoComplete="off"
                secureTextEntry={secureTextEntry}
                style={{
                    backgroundColor: "#e1e2e4",
                    borderWidth: error ? 1 : 0,
                    borderColor: error ? "#ff5555" : "",
                    borderRadius: 26,
                    height: 52,
                    paddingHorizontal: 16,
                    fontSize: 16
                }}
                value={value}
                onChangeText={text => {
                    setValue(text)
                    if (error) {
                        setError('')
                    }
                }}
            />
        </View>
    )
}

export default Input
