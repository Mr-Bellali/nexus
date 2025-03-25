import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  SafeAreaView, 
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
          onEndReachedThreshold={0.1}
          onEndReached={() => {
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