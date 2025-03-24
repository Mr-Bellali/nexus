import React, { useEffect, useLayoutEffect, useState } from 'react'
import { FlatList, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
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
  friend: any,
  content: any,
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
        padding: 4
      }}
    >
      <View style={{ flex: 1 }} />
      <View
        style={{
          backgroundColor: '#303040',
          borderRadius: 21,
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
function MessageBubbleFriend({ content, friend }: MessageBubbleFriendProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        padding: 4
      }}
    >
      <Thumbnail
        url={friend.thumbnail}
        size={42}
      />
      <View
        style={{
          backgroundColor: '#d0d2db',
          borderRadius: 21,
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
      <View style={{ flex: 1 }} />
    </View>
  )
}



function MessageBubble({ index, message, user, friend }: MessageBubbleProps) {
  // if it's my message
  console.log("user: ", user)
  return user.account.id === message.accountId ? (
    <MessageBubbleMe
      content={message.content}

    />
  ) : (
    <MessageBubbleFriend
      content={message.content}
      friend={friend}
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

  const messagesList = useGlobal(state => state.messagesList)
  const getMessages = useGlobal(state => state.getMessagesList)
  const messageSend = useGlobal(state => state.messageSend)
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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* KeyboardAvoidingView to make input move with keyboard */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 70}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View
            style={{
              flex: 1,
              borderWidth: 6,
              borderColor: 'red'
            }}
          >
            <FlatList
              data={messagesList}
              inverted={true}
              keyExtractor={item => item.id}
              renderItem={({ item, index }) => (
                <MessageBubble
                  index={index}
                  message={item}
                  friend={friend}
                  user={user}
                />
              )}
            />
          </View>
        </ScrollView>
        <MessageInput
          message={message}
          setMessage={setMessage}
          onSend={onSend}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default MessagesScreen