import { View } from "react-native"

interface CellProps {
    children: any
}

const Cell = ({ children }: CellProps) => {
    return (
        <View
            style={{
                paddingHorizontal: 20,
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomWidth: 1,
                borderColor: '#f0f0f0',
                height: 106
            }}
        >
            {children}
        </View>
    )
}

export default Cell
