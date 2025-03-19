import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text, View } from "react-native";


interface EmptyProps {
  icon: IconProp;
  message: string;
  centered: boolean;
}

const Empty = ({ icon, message, centered = true }: EmptyProps) => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: centered ? 'center' : 'flex-start',
        alignItems: 'center',
        paddingVertical: 120
      }}
    >
      <FontAwesomeIcon 
        icon={icon}
        color="#d0d0d0"
        size={90}
        style={{
          marginBottom: 16
        }}
      />
      <Text
        style={{
          color:'#c3c3c3',
          fontSize: 16
        }}
      >
        {message}
      </Text>
    </View>
  )
}

export default Empty
