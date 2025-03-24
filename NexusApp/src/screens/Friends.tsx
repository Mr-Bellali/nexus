import React from 'react'
import { ActivityIndicator, FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native'
import Empty from '../common/Empty'
import Cell from '../common/Cell'
import useGlobal from '../core/global'
import Thumbnail from '../common/Thumbnail'

interface FriendsProps {
  item: any,
  navigation: any
}

function formatTime(date: Date | string | null) {
  if (!date) {
    return '-';
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return '-';
  }

  const now = new Date();
  const s = Math.abs((now.getTime() - parsedDate.getTime()) / 1000);

  // Seconds
  if (s < 60) {
    return 'now';
  }

  // Minutes
  if (s < 60 * 60) {
    const m = Math.floor(s / 60);
    return `${m}m ago`;
  }

  // Hours 
  if (s < 60 * 60 * 24) {
    const h = Math.floor(s / (60 * 60))
    return `${h}h ago`;
  }

  // Days 
  if (s < 60 * 60 * 24 * 7) {
    const d = Math.floor(s / (60 * 60 * 24))
    return `${d}d ago`;
  }

  // Weeks 
  if (s < 60 * 60 * 24 * 7 * 4) {
    const w = Math.floor(s / (60 * 60 * 24 * 7))
    return `${w}w ago`;
  }

  // Months 
  if (s < 60 * 60 * 24 * 7 * 4) {
    const w = Math.floor(s / (60 * 60 * 24 * 30))
    return `${w}mo ago`;
  }

  // Years
  const y = Math.floor(s / (60 * 60 * 24 * 365))
  return `${y}y ago`;

}


function FriendRow({ navigation, item }: FriendsProps) {
  return (
    <TouchableOpacity
      onPress={()=>{
        navigation.navigate('Messages', item)
      }}
    >
      <Cell>
        <Thumbnail
          url={item.friend.thumbnail}
          size={67}
        />
        <View style={{
          flex: 1,
          paddingHorizontal: 16
        }}>
          <Text
            style={{
              fontWeight: 'bold',
              color: '#202020',
              marginBottom: 4
            }}
          >
            {item.friend.lastName} {item.friend.firstName}
          </Text>
          <Text
            style={{
              color: '#606060',
              fontSize: 13
            }}
          >
            {item.preview}
            <Text style={{ color: '#909090', fontSize: 10 }}>
              {formatTime(item.updatedAt)}
            </Text>
          </Text>
        </View>


      </Cell>
    </TouchableOpacity>
  )
}

const FriendsScreen = ({navigation} : FriendsProps) => {
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
            navigation={navigation}
            item={item.item}
          />
        )}
        keyExtractor={item => item.id}
      />
    </View>
  )
}

export default FriendsScreen