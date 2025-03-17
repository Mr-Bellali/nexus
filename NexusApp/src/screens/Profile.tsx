import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import useGlobal from '../core/global'


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
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        padding: 100
      }}
    >
      <Image
        source={require('../assets/images/Profile.png')}
        style={{ width: 180, height: 180, borderRadius: 90, marginBottom: 20 }}
      />
      <Text style={{
        textAlign: 'center',
        color: '#303030',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 6
      }}>
        Bellali Yassine
      </Text>
      <Text style={{
        textAlign: 'center',
        color: '#606060',
        fontSize: 14
      }}>
        @yassine
      </Text>

      <ProfileLogout />

    </View>
  )
}

export default ProfileScreen