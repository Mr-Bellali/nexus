import React from 'react'
import { Text } from 'react-native';

interface TitleProps {
    text: string;
    color: string;
  }

const Title = ( {text, color}: TitleProps ) => {
  return (
    <Text 
    style={{
        color,
        textAlign: 'center',
        fontSize: 48,
        fontFamily: 'Oxanium',
        fontWeight: '600',
        marginBottom: 30
    }}
>
    {text}
</Text>
  )
}

export default Title