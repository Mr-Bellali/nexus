import { useEffect, useRef } from "react"
import { Animated, Easing } from "react-native"


interface MessageTypingAnimationProps {
    offset: number
  }

function MessageTypingAnimation({ offset }: MessageTypingAnimationProps) {
  const y = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const total = 1000
    const bump = 200
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(bump * offset),
        Animated.timing(y, {
          toValue: 1,
          duration: bump,
          easing: Easing.linear,
          useNativeDriver: true
        }),
        Animated.timing(y, {
          toValue: 0,
          duration: bump,
          easing: Easing.linear,
          useNativeDriver: true
        }),
        Animated.delay(total - bump * 2 - bump * offset),
      ]),
    )
    animation.start()
    return () => {
      animation.stop()
    }
  }, [])

  const translateY = y.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8]
  })

  return (
    <Animated.View
      style={{
        width: 8,
        height: 8,
        marginHorizontal: 1.5,
        borderRadius: 4,
        backgroundColor: '#606060',
        transform: [{ translateY }]
      }}
    >

    </Animated.View>
  )
}

export default MessageTypingAnimation