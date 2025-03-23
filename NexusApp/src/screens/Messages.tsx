import React, { useLayoutEffect } from 'react'
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Thumbnail from '../common/Thumbnail'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'

interface MessagesProps {
  navigation: any,
  route: any,
}

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

function MessageInput(){
  return(
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
        style={{
          flex:1,
          paddingHorizontal: 18,
          borderWidth: 1,
          borderRadius: 25,
          borderColor: '#d0d0d0',
          backgroundColor: 'white',
          height: 50
        }}
      />
      <TouchableOpacity>
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

  const friend = route.params.friend

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <MessageHeader friend={friend} />
      )
    })
  })

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* KeyboardAvoidingView to make input move with keyboard */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 70} // Adjust this offset based on header height
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View
            style={{
              flex: 1,
              borderWidth: 6,
              borderColor: 'red'
            }}
          >
            {/* Messages List Would Go Here */}
          </View>
        </ScrollView>
        <MessageInput />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default MessagesScreen