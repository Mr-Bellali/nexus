import React from 'react'
import { ActivityIndicator, FlatList, SafeAreaView, Text, View } from 'react-native'
import Empty from '../common/Empty'
import Cell from '../common/Cell'
import useGlobal from '../core/global'

interface FriendsProps {
  item: any
}

function FriendRow({ item }: FriendsProps) {
  return(
    <Cell>
      <Text>
        hello
      </Text>
    </Cell>
  )
}

const FriendsScreen = () => {
  const friendsList = useGlobal(state => state.friendsList)

  // Show loading indicator
  if (friendsList === null) {
    return (
      <ActivityIndicator style={{ flex: 1 }} />
    )
  }

  // Show empty if there's no requests
  if (friendsList.length === 0) {
    return (
      <Empty
        icon='inbox'
        message='No Friends'
        centered={true}
      />
    )
  }

  // Show request list
  return (
    <View
      style={{
        flex: 1
      }}
    >
      <FlatList
        data={friendsList}
        renderItem={(item) => (
          <FriendRow
            item={item.item}

          />
        )}
        keyExtractor={item => item.sender.id}
      />
    </View>
  )
}

export default FriendsScreen