import React, { useEffect, useLayoutEffect } from 'react'
import {
    Animated,
    SafeAreaView,
    StatusBar,
    View
} from 'react-native'
import Title from '../common/Title'

interface SplashProps {
    navigation: any;
}

const SplashScreen = ({ navigation }: SplashProps) => {
    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false
        })
    }, [])

    const translateY = new Animated.Value(0);
    const duration = 800;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(translateY, {
                    toValue: 20,
                    duration,
                    useNativeDriver: true
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration,
                    useNativeDriver: true
                })
            ])
        ).start()
    }, [])

    return (
        <SafeAreaView
            style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'black'
            }}
        >
            <StatusBar barStyle='light-content' />
            <Animated.View style={[{ transform: [{ translateY }] }]}>
                <Title text='N E X U S' color='white' />
            </Animated.View>
        </SafeAreaView>
    )
}

export default SplashScreen