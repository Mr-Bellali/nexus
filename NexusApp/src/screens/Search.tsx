import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import React, { useEffect, useState } from 'react'
import {
  FlatList,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import Empty from '../common/Empty'
import Thumbnail from '../common/Thumbnail'
import { User } from '../core/types'
import useGlobal from '../core/global'
import utils from '../core/utils'
import Cell from '../common/Cell'

interface SearchRowProps {
  user: User
}


function SearchRow({ user }: SearchRowProps) {
  return (
   <Cell>
      <Thumbnail
        url={user.thumbnail as string}
        size={65}
      />
      <View
        style={{
          flex: 1,
          paddingHorizontal: 16
        }}
      >
        <Text
          style={{
            fontWeight: 'bold',
            color: '#202020',
            marginBottom: 4
          }}
        >
          {user.lastName} {user.firstName}
        </Text>
        <Text
          style={{
            color: '#606060',
          }}
        >
          {user.username}
        </Text>
      </View>
      <SearchButton user={user} />
    </ Cell>
  )
}

function SearchButton({ user }: SearchRowProps) {
  // Add tick if user is already connected
  if (user.status === "connected") {
    return (
      <FontAwesomeIcon
        icon='circle-check'
        size={30}
        color='#20d080'
        style={{
          marginRight: 10
        }}
      />
    )
  }

  const requestConnect = useGlobal(state => state.requestConnect)

  let data: {
    text: string,
    disabled: boolean,
    onPress: any
  } = {
    text: '',
    disabled: true,
    onPress: () => { }
  }

  switch (user.status) {
    case 'no-connection':
      data.text = 'Connect'
      data.disabled = false
      data.onPress = () => requestConnect(user.id)
      break;
    case 'pending-them':
      data.text = 'Pending'
      data.disabled = true
      data.onPress = () => { }
      break;
    case 'pending-me':
      data.text = 'Accept'
      data.disabled = false
      data.onPress = () => { }
      break;

    default:
      break;
  }

  return (
    <TouchableOpacity
      style={{
        backgroundColor: data.disabled ? '#505055' : '#202020',
        paddingHorizontal: 14,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 18
      }}
      disabled={data.disabled}
      onPress={data.onPress}
    >
      <Text
        style={{
          color: data.disabled ? '#808080' : 'white',
          fontWeight: 'bold'

        }}
      >
        {data.text}
      </Text>
    </TouchableOpacity>
  )

}

const SearchScreen = () => {

  const [query, setQuery] = useState('')
  const searchList = useGlobal(state => state.searchList)
  const searcUsers = useGlobal(state => state.searchUsers)

  useEffect(() => {
    searcUsers(query)
  }, [query])


  return (
    <SafeAreaView
      style={{
        flex: 1
      }}
    >
      <View
        style={{
          padding: 16,
          borderBottomWidth: 1,
          borderColor: '#f0f0f0'
        }}
      >
        <View>
          <TextInput
            style={{
              backgroundColor: '#e1e2e4',
              height: 52,
              borderRadius: 26,
              padding: 16,
              fontSize: 16,
              paddingLeft: 50
            }}
            value={query}
            onChangeText={setQuery}
            placeholder='Search...'
            placeholderTextColor='#b0b0b0'
          />
          <FontAwesomeIcon
            icon='magnifying-glass'
            size={20}
            color='#505050'
            style={{
              position: 'absolute',
              left: 18,
              top: 17
            }}
          />
        </View>
      </View>
      {searchList === null || searchList ===  undefined ? (
        <Empty
          icon='magnifying-glass'
          message='Search for friends'
          centered={false}
        />
      ) : searchList.length === 0 ? (
        <Empty
          icon='triangle-exclamation'
          message={'no user found for "' + query + '"'}
          centered={false}
        />
      ) : (
        <FlatList
          data={searchList}
          renderItem={({ item }) => (
            <SearchRow user={item} />
          )}
          keyExtractor={item => item.id.toString()}
        />
      )}
    </SafeAreaView>
  )
}

export default SearchScreen