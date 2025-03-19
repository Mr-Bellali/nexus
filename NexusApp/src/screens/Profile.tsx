import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { ImageLibraryOptions, launchImageLibrary } from 'react-native-image-picker'
import useGlobal from '../core/global'
import utils from '../core/utils'
import Thumbnail from '../common/Thumbnail'

function ProfileImage() {
  const uploadThumbnail = useGlobal(state => state.uploadThumbnail)
  const user = useGlobal(state => state.user)

  console.log("user-here: ", user)

  

  return (
    <TouchableOpacity
      style={{ marginBottom: 20 }}
      onPress={() => {
        launchImageLibrary({ includeBase64: true} as ImageLibraryOptions, (response) => {
          // utils.log('image library: ', response)
          if (response.didCancel) return
          if(response.assets === undefined) return
          const file = response.assets[0]
          // ......
          uploadThumbnail(file)
        })
      }}
    >
     <Thumbnail
      url= {user.account.thumbnail}
      size={180}
     />
      <View
        style={{
          backgroundColor: '#202020',
          width: 40,
          height: 40,
          borderRadius: 20,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          bottom: 0,
          right: 0,
          borderWidth: 3,
          borderColor: 'white'
        }}
      >
        <FontAwesomeIcon
          icon='pencil'
          size={15}
          color='#D0D0D0'
        />
      </View>
    </TouchableOpacity>
  )
}

function ProfileLogout() {
  const logout = useGlobal(state => state.logout)
  return (
    <TouchableOpacity
      onPress={logout}
      style={{
        flexDirection: 'row',
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 26,
        backgroundColor: '#202020',
        marginTop: 40
      }}>
      <FontAwesomeIcon
        icon='right-from-bracket'
        size={20}
        color='#d0d0d0'
        style={{
          marginRight: 12
        }}
      />
      <Text style={{
        fontWeight: 'bold',
        color: '#d0d0d0'
      }}>
        Logout
      </Text>
    </TouchableOpacity>
  )
}

const ProfileScreen = () => {
  const user = useGlobal(state => state.user)
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        padding: 100
      }}
    >

      <ProfileImage />

      <Text style={{
        textAlign: 'center',
        color: '#303030',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 6
      }}>
        {`${user.account.lastName} ${user.account.firstName}`}
      </Text>
      <Text style={{
        textAlign: 'center',
        color: '#606060',
        fontSize: 14
      }}>
        @{user.account.username}
      </Text>

      <ProfileLogout />

    </View>
  )
}

export default ProfileScreen