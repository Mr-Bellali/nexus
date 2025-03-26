import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  View,
} from 'react-native'

import useGlobal from '../core/global'
import MessageHeader from '../widgets/messages/MessageHeader'
import MessageBubble from '../widgets/messages/MessageBubble'
import MessageInput from '../widgets/messages/MessageInput'

interface MessagesProps {
  navigation: any,
  route: any,
}

const MessagesScreen = ({ navigation, route }: MessagesProps) => {
  const [message, setMessage] = useState('')

  const getMessagesList = useGlobal(state => state.getMessagesList)
  const messagesList = useGlobal(state => state.messagesList)
  const messagesNext = useGlobal(state => state.messagesNext)
  const getMessages = useGlobal(state => state.getMessagesList)
  const messageSend = useGlobal(state => state.messageSend)
  const typingMessage = useGlobal(state => state.typingMessage)
  const media = useGlobal(state => state.media)

  console.log("media: ", media)

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
      {media === "" ? (
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
            onEndReachedThreshold={0.1}
            onEndReached={() => {
              if (messagesNext) {
                getMessagesList(connectionId, messagesNext)
              }
            }}
            renderItem={({ item, index }) => (
              <MessageBubble index={index} message={item} friend={friend} user={user} />
            )}
            contentContainerStyle={{ flexGrow: 1 }}
          />
          <MessageInput message={message} setMessage={onType} onSend={onSend} navigation={navigation} />
        </KeyboardAvoidingView>
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >

          <View
            style={{
              backgroundColor: 'red',
              height: 80,
              width: '100%',
              position: 'absolute',
              top: 0,
              justifyContent: 'center',
              paddingHorizontal: 10
            }}
          >
          </View>

          <Image
            source={{ uri: media.uri }}
            style={{
              width: '100%',
              height: 500
            }}
          />
          <View
            style={{
              backgroundColor: 'red',
              height: 80,
              width: '100%',
              position: 'absolute',
              bottom: 10,
              justifyContent: 'center',
              paddingHorizontal: 10
            }}
          >
            <View
              style={{
                height: 50,
                width: 'auto',
                borderWidth: 2,
                borderColor: '#2e2e2e',
                borderRadius: 25
              }}
            >

            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

export default MessagesScreen