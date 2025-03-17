import { useLayoutEffect, useState } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  SafeAreaView,
  Text,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import Input from '../common/Input'
import Botton from '../common/Button'
import utils from '../core/utils'
import api from '../core/api'
import useGlobal from '../core/global'

interface SignUpProps {
  navigation: any
}

const SignUpScreen = ({ navigation }: SignUpProps) => {

  const [username, setUsername] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [usernameError, setUsernameError] = useState('')
  const [firstNameError, setFirstNameError] = useState('')
  const [lastNameError, setLastNameError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')

  const login = useGlobal(state => state.login)

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false
    })
  }, [])

  function onSignUp() {

    console.log('on sign up', username, firstName, lastName, password, confirmPassword)

    if (!username || username.length < 5) {
      setUsernameError('Username must be 5 or more caracters')
    }
    if (!firstName) {
      setFirstNameError('First name must be provided')
    }
    if (!lastName) {
      setLastNameError('Last name must be provided')
    }
    if (!password || password.length < 8) {
      setPasswordError('Password must be 8 caracters at least')
    }
    if (!confirmPassword) {
      setConfirmPasswordError('Confirm your password')
    }
    if (password !== confirmPassword) {
      setPasswordError("Password and its confirmation don't match")
      setConfirmPasswordError('Make sure you retype your same password')
    }

    if (!username
      || username.length < 5
      || !firstName
      || !lastName
      || !password
      || password.length < 8
      || !confirmPassword)
      return

    api({
      method: 'POST',
      url: '/auth/register',
      data: {
        username,
        firstName,
        lastName,
        password,
        confirmPassword
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
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <KeyboardAvoidingView behavior='height' style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

          <View style={{
            flex: 1,
            justifyContent: 'center',
            paddingHorizontal: 16
          }}>

            <Text style={{
              textAlign: 'center',
              marginBottom: 24,
              fontSize: 36,
              fontWeight: 'bold'
            }}>
              Sign Up
            </Text>

            <Input
              title='Username'
              value={username}
              error={usernameError}
              setValue={setUsername}
              setError={setUsernameError}
            />

            <Input
              title='First name'
              value={firstName}
              error={firstNameError}
              setValue={setFirstName}
              setError={setFirstNameError}
            />
            <Input
              title='Last name'
              value={lastName}
              error={lastNameError}
              setValue={setLastName}
              setError={setLastNameError}
            />
            <Input
              title='Password'
              value={password}
              error={passwordError}
              setValue={setPassword}
              setError={setPasswordError}
              secureTextEntry={true}
            />
            <Input
              title='Confirm Password'
              value={confirmPassword}
              error={confirmPasswordError}
              setValue={setConfirmPassword}
              setError={setConfirmPasswordError}
              secureTextEntry={true}
            />
            <Botton
              title='Register'
              onPress={onSignUp}
            />
            <Text style={{
              textAlign: 'center',
              marginTop: 40,
              color: '#70747a'
            }}>
              Already have an account? <Text style={{
                color: 'black',
                fontWeight: 'bold'
              }}
                onPress={() => navigation.navigate('SignIn')}
              >
                Sign In
              </Text>
            </Text>
          </View>
        </ TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default SignUpScreen