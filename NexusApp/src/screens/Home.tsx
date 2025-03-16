import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import React, { useLayoutEffect } from 'react'
import RequestsScreen from './Requests'
import FriendsScreen from './Friends'
import ProfileScreen from './Profile'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { 
  TouchableOpacity, 
  View, 
  Image 
} from 'react-native'

interface HomeProps {
  navigation: any;
}

const Tab = createBottomTabNavigator()

const HomeScreen = ({ navigation }: HomeProps) => {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false
    })
  }, [])
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        headerLeft: () => (
          <View style={{ marginLeft: 16}}>
            <Image 
              source={require('../assets/images/Profile.png')}
              style={{ width: 32, height: 32, borderRadius: 15}}
            />
          </View>
        ),
        headerRight: () => (
          <TouchableOpacity>
            <FontAwesomeIcon 
              style={{marginRight: 16}}
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