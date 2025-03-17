import { useLayoutEffect, useState } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  SafeAreaView,
  Text,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import Title from '../common/Title';
import Input from '../common/Input';
import Button from '../common/Button';
import api from '../core/api';
import utils from '../core/utils';
import useGlobal from '../core/global';

interface SignInProps {
  navigation: any;
}

const SignInScreen = ({ navigation }: SignInProps) => {

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const login = useGlobal(state => state.login)

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false
    })
  }, [])

  function onSignIn() {
    console.log("on SignIn", username, password)

    // Check username
    if (!username) {
      setUsernameError('Username must be provided')
    }

    // Check password
    if (!password) {
      setPasswordError('password must be provided')
    }

    // Break out of this function if there were any issues
    if (!username || !password) return

    // Make signin request
    // ...

    api({
      method: 'POST',
      url: '/auth/login',
      data: {
        username,
        password
      }
    })
      .then(response => {
        utils.log('login: ', response.data)
        login(response.data.user, {username, password})
      })
      .catch(error => {
        if (error.response) {
          utils.log(error.response.data)
          utils.log(error.response.status)
          utils.log(error.response.headers)
        } else if (error.request) {
          utils.log(error.request)
        } else {
          utils.log('Error', error.message)
        }
        utils.log(error.config)
      })
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior='height' style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              paddingHorizontal: 20
            }}>
            <Title text='N E X U S' color='#202020' />

            <Input
              title='Username'
              value={username}
              error={usernameError}
              setValue={setUsername}
              setError={setUsernameError}
            />

            <Input
              title='Password'
              value={password}
              error={passwordError}
              setValue={setPassword}
              setError={setPasswordError}
              secureTextEntry={true}
            />

            <Button
              title='Sign In '
              onPress={onSignIn}
            />

            <Text style={{
              textAlign: 'center',
              marginTop: 40,
              color: '#70747a'
            }}>
              Don't have an account? <Text style={{
                color: 'black',
                fontWeight: 'bold'
              }}
                onPress={() => navigation.navigate('SignUp')}
              >
                Sign Up
              </Text>
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default SignInScreen