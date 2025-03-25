import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Animated, Easing, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Thumbnail from '../common/Thumbnail'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import useGlobal from '../core/global'

interface MessagesProps {
  navigation: any,
  route: any,
}

interface HeaderProps {
  friend: any
}

interface MessageInputProps {
  message: string;
  setMessage: any;
  onSend: any;
}

interface MessageBubbleProps {
  index: any,
  message: any,
  friend: any,
  user: any,
}
interface MessageBubbleMeProps {
  content: any,
}
interface MessageBubbleFriendProps {
  friend?: any,
  content: any,
  typing: boolean,
}

interface MessageTypingAnimationProps {
  offset: number
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

function MessageBubble({ index, message, user, friend }: MessageBubbleProps) {

  const [showTyping, setShowTyping] = useState(false)

  const messagesTyping = useGlobal(state => state.messagesTyping)

  useEffect(() => {
    if (index !== 0) return
    if (messagesTyping === null) {
      setShowTyping(false)
      return
    }
    setShowTyping(true)
    const check = setInterval(() => {
      const now = new Date()
      const ms = now - messagesTyping
      if (ms > 2000) {
        setShowTyping(false)
      }
    }, 1000)
    return () => clearInterval(check)
  }, [messagesTyping])


  if (index === 0) {
    if (showTyping) {
      return <MessageBubbleFriend content={message.content} friend={friend} typing={true} />
    }
    return
  }

  return user.account.id === message.accountId ? (
    <MessageBubbleMe
      content={message.content}

    />
  ) : (
    <MessageBubbleFriend
      content={message.content}
      friend={friend}
      typing={false}
    />
  )
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

const MessagesScreen = ({ navigation, route }: MessagesProps) => {
  const [message, setMessage] = useState('')

  const getMessagesList = useGlobal(state => state.getMessagesList)
  const messagesList = useGlobal(state => state.messagesList)
  const messagesNext = useGlobal(state => state.messagesNext)
  const getMessages = useGlobal(state => state.getMessagesList)
  const messageSend = useGlobal(state => state.messageSend)
  const typingMessage = useGlobal(state => state.typingMessage)

  const user = useGlobal(state => state.user)

  const friend = route.params.friend
  const connectionId = route.params.id

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <MessageHeader friend={friend} />
      )
    })
  })

  useEffect(() => {
    getMessages(connectionId)
  }, [])


  function onSend() {
    const cleaned = message.replace(/\s+/g, ' ').trim()
    if (cleaned.length === 0) return
    messageSend(connectionId, cleaned)
    setMessage('')
  }

  function onType(value: any) {
    setMessage(value)
    typingMessage(friend.id)
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 70}
      >
        <FlatList
          style={{
            marginBottom: 26
          }}
          data={[{ id: -1 }, ...messagesList as any[]]}
          inverted={true}
          keyExtractor={(item) => item.id}
          onStartReachedThreshold={0.1}
          onStartReached={() => {
            console.log('onReached: ', messagesNext)
            if(messagesNext) {
              getMessagesList(connectionId, messagesNext)
            }
          }}
          renderItem={({ item, index }) => (
            <MessageBubble index={index} message={item} friend={friend} user={user} />
          )}
          contentContainerStyle={{ flexGrow: 1 }}
        />
        <MessageInput message={message} setMessage={onType} onSend={onSend} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default MessagesScreen