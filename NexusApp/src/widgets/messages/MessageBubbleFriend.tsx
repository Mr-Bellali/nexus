import { Text, View } from "react-native"
import MessageTypingAnimation from "./MessageTypingAnimation"

interface MessageBubbleFriendProps {
    friend?: any,
    content: any,
    typing: boolean,
  }

function MessageBubbleFriend({ content = '', friend, typing = false }: MessageBubbleFriendProps) {
    console.log("typing: ", typing)
    return (
      <View
        style={{
          flexDirection: 'row',
          padding: 4,
          paddingLeft: 16
        }}
      >
  
        {typing ? (
          <View style={{
            flexDirection: 'row',
            paddingHorizontal: 16,
            paddingVertical: 4
          }}>
            <MessageTypingAnimation offset={0} />
            <MessageTypingAnimation offset={1} />
            <MessageTypingAnimation offset={2} />
          </View>
        ) : (
          <View
            style={{
              backgroundColor: '#d0d2db',
              borderTopRightRadius: 15,
              borderTopLeftRadius: 15,
              borderBottomRightRadius: 15,
              maxWidth: '75%',
              paddingHorizontal: 16,
              paddingVertical: 12,
              justifyContent: 'center',
              marginLeft: 8,
              minHeight: 42
            }}
          >
            <Text
              style={{
                color: '#202020',
                fontSize: 16,
                lineHeight: 18
              }}
            >
              {content}
            </Text>
  
  
          </View>
        )}
        <View style={{ flex: 1 }} />
      </View >
    )
  }

  export default MessageBubbleFriend