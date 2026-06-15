import { imageSrc } from "../Icons/icons";
import { View, Image } from "react-native";

const Characters = () => (
  <>
    <Image
      source={imageSrc.bookgirl}
      style={{
        width: 120, 
        height: 150, 
        resizeMode: 'contain', 
        position: 'absolute',
        bottom: 0,
        left: 0,
      }}
      resizeMode="contain"
    />
    <Image
      source={imageSrc.colorboy}
      style={{ 
        width: 140, 
        height: 120, 
        resizeMode: 'contain',
        position: 'absolute',
        bottom: 0,
        right: 0,
      }}
      resizeMode="contain"
    />
  </>
);

export default Characters;