import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {DarkButton, DarkButtonText} from "../Style";
import {StyleProp, TextStyle, ViewStyle} from "react-native";

export function Button({
  text,
  iconName,
  iconSize,
  onPress,
  onLongPress,
  style,
  textStyle,
  iconColor,
  accessibilityLabel
}:{
  text?: string,
  iconName?: string,
  iconSize?: number,
  onPress?: () => void,
  onLongPress?: () => void,
  style?: StyleProp<ViewStyle>,
  textStyle?: StyleProp<TextStyle>,
  iconColor?: string,
  accessibilityLabel?: string
}){
  if(!iconSize) iconSize = 30;
  if(text){
    return(
      <DarkButton onPress={onPress} style={style} accessibilityLabel={accessibilityLabel}>
        <DarkButtonText style={textStyle}>
          {text}
        </DarkButtonText>
      </DarkButton>
    );
  }
  if(iconName){
    return(
      <DarkButton onPress={onPress} style={style} accessibilityLabel={accessibilityLabel}>
        <DarkButtonText style={textStyle}>
          <Icon name={iconName} size={iconSize} color={iconColor}/>
        </DarkButtonText>
      </DarkButton>
    )
  }
  return(
    <DarkButton onPress={onPress} style={style} accessibilityLabel={accessibilityLabel}>
      <DarkButtonText>
        {text}
      </DarkButtonText>
    </DarkButton>
  );
}

