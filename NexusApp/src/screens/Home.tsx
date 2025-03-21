import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import React, { useEffect, useLayoutEffect } from 'react'
import RequestsScreen from './Requests'
import FriendsScreen from './Friends'
import ProfileScreen from './Profile'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import {
  TouchableOpacity,
  View,
} from 'react-native'
import useGlobal from '../core/global'
import Thumbnail from '../common/Thumbnail'
import utils from '../core/utils'

interface HomeProps {
  navigation: any;
}

const Tab = createBottomTabNavigator()

const HomeScreen = ({ navigation }: HomeProps) => {

  const socketConnect = useGlobal(state => state.socketConnect)
  const socketClose = useGlobal(state => state.socketClose)
  const user = useGlobal(state => state.user)
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false
    })
  }, [])

  useEffect(() => {
    socketConnect()
    return () => {
      socketClose()
    }
  }, [])

  function onSearch() {
    navigation.navigate('Search')
  }


  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        headerLeft: () => (
          <View style={{ marginLeft: 16 }}>
            <Thumbnail
              url={user.account.thumbnail}
              size={32}
            />
          </View>
        ),
        headerRight: () => (
          <TouchableOpacity
            onPress={onSearch}
          >
            <FontAwesomeIcon
              style={{ marginRight: 16 }}
              icon="magnifying-glass"
              size={22}
              color="#404040"
            />
          </TouchableOpacity>
        ),
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<'Requests' | 'Friends' | 'Profile', string> = {
            Requests: 'bell',
            Friends: 'inbox',
            Profile: 'user'
          }
          const icon = icons[route.name as keyof typeof icons] as IconProp;
          return (
            <FontAwesomeIcon icon={icon} size={28} color={color} />
          )
        },
        tabBarActiveTintColor: "#202020",
        tabBarShowLabel: false
      })}
    >
      <Tab.Screen name='Requests' component={RequestsScreen}></Tab.Screen>
      <Tab.Screen name='Friends' component={FriendsScreen}></Tab.Screen>
      <Tab.Screen name='Profile' component={ProfileScreen}></Tab.Screen>
    </Tab.Navigator>
  )
}

export default HomeScreen