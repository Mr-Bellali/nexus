import { Text, View } from "react-native"
import Thumbnail from "../../common/Thumbnail"

interface HeaderProps {
    friend: any
  }

function MessageHeader({ friend }: HeaderProps) {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
      }}
    >
      <Thumbnail
        url={friend.thumbnail}
        size={30}
      />
      <Text
        style={{
          color: '#202020',
          marginLeft: 10,
          fontSize: 18,
          fontWeight: 'bold'
        }}
      >
        {friend.lastName} {friend.firstName}
      </Text>
    </View>
  )
}

export default MessageHeader