import { ActivityIndicator, FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native'
import Thumbnail from '../common/Thumbnail'
import useGlobal from '../core/global'
import Empty from '../common/Empty'
import Cell from '../common/Cell'

interface RequestProps {
  item: any
}

function RequestAccept({ item }: RequestProps) {
  const requestAccept = useGlobal(state => state.requestAccept)
  return (
    <TouchableOpacity
      style={{
        backgroundColor: '#202020',
        paddingHorizontal: 14,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onPress={() => requestAccept(item.id)}
    >
      <Text style={{ color: 'white', fontWeight: 'bold',}}>Accept</Text>
    </TouchableOpacity>
  )
}

function RequestRow({ item }: RequestProps) {
  const message = 'Send a request'
  const time = '7m ago'
  return (
    <Cell>
      <Thumbnail
        url={item.sender.thumbnail}
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
          {item.sender.lastName} {item.sender.firstName}
        </Text>
        <Text
          style={{
            color: '#606060',
            fontSize: 13
          }}
        >
          {message} <Text style={{ color: '#909090', fontSize: 10 }}> {time}</Text>
        </Text>
      </View>

      <RequestAccept 
        item={item}
      />

    </Cell>
  )
}


const RequestsScreen = () => {
  const requestsList = useGlobal(state => state.requestsList)

  // Show loading indicator
  if (requestsList === null) {
    return (
      <ActivityIndicator style={{ flex: 1 }} />
    )
  }

  // Show empty if there's no requests
  if (requestsList.length === 0) {
    return (
      <Empty
        icon='bell'
        message='No requests'
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
        data={requestsList}
        renderItem={(item) => (
          <RequestRow
            item={item.item}

          />
        )}
        keyExtractor={item => item.sender.id}
      />
    </View>
  )
}

export default RequestsScreen