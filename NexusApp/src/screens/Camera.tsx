import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';

interface CameraProps {
  navigation: any
}

export default function CameraScreen({ navigation }: CameraProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [photo, setPhoto] = useState(null);
  const camera = useRef(null);
  const devices = useCameraDevices();

  const [device, setDevice] = useState(devices[0])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false
    })
  }, [])

  useEffect(() => {
    (async () => {
      const permission = await Camera.requestCameraPermission();
      setHasPermission(permission === 'granted' || permission === 'authorized');
    })();
  }, []);

  const takePhoto = async () => {
    if (camera.current) {
      try {
        const capturedPhoto = await camera.current.takePhoto({
          flash: 'off',
          qualityPrioritization: 'speed',
        });
        setPhoto(capturedPhoto);
        console.log(capturedPhoto);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const switchCamera = () => {
    if (device === devices[0]) {
       setDevice(devices[3])
    } else {
      setDevice(devices[0])
    }
  }

  if (!hasPermission) return <Text>No camera permission</Text>;
  if (!device) return <Text>Loading camera...</Text>;

  return (
    <View style={{ flex: 1 }}>
      <Camera
        ref={camera}
        style={{ flex: 1 }}
        device={device}
        isActive={true}
        photo={true}
      />
      <View
        style={{
          flexDirection: 'row',
          width: 'auto',
          height: 100,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          bottom:0,
          right: 0
        }}
      >
        <View
          style={{
            height: '100%',
            flex: 1,
            position: 'relative'
          }}
        >
          <TouchableOpacity
            onPress={takePhoto}
            style={{
              position:'absolute',
              width: 80,
              height: 80,
              borderRadius: 40,
              borderWidth: 6,
              borderColor: 'white',
              right: 70,
              top: 10
            }}
          />
        </View>
  
        <View
          style={{
            height: '100%',
            paddingHorizontal: 10,
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingRight: 24
          }}
        >
          <TouchableOpacity
            onPress={switchCamera}
            style={{
              width: 60,
              height: 60,
              borderRadius: 35,
              backgroundColor: 'white',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FontAwesomeIcon icon="camera" size={30} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
  
}
