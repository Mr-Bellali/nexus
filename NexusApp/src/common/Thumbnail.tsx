import { Image } from "react-native";
import utils from "../core/utils";

interface ThumbnailProps {
    url: string | null;
    size: number
}

function Thumbnail({ url, size }: ThumbnailProps) {
    return (
        <Image
            source={utils.thumbnail(url)}
            style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                position: 'relative'
            }}
        />
    )
}

export  default Thumbnail