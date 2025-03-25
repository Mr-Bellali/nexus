import { Text, View } from "react-native"

interface MessageBubbleMeProps {
    content: any,
  }

function MessageBubbleMe({ content }: MessageBubbleMeProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        padding: 4,
        paddingRight: 16
      }}
    >
      <View style={{ flex: 1 }} />
      <View
        style={{
          backgroundColor: '#303040',
          borderTopRightRadius: 15,
          borderTopLeftRadius: 15,
          borderBottomLeftRadius: 15,
          maxWidth: '75%',
          paddingHorizontal: 16,
          paddingVertical: 12,
          justifyContent: 'center',
          marginRight: 8,
          minHeight: 42
        }}
      >
        <Text
          style={{
            color: 'white',
            fontSize: 16,
            lineHeight: 18
          }}
        >
          {content}
        </Text>
      </View>
    </View>
  )
}

export default MessageBubbleMe