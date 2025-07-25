import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {ButtonText, RowView, ThemedButton} from "../Style";
import {StyleProp, TextStyle, View, ViewStyle} from "react-native";

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
  if(text && iconName){
    return(
      <ThemedButton onPress={onPress} onLongPress={onLongPress} style={style} accessibilityLabel={accessibilityLabel}>
          <RowView style={{alignSelf: "center"}}>
            <ButtonText><Icon name={iconName} size={iconSize} color={iconColor}/></ButtonText>
            <ButtonText style={[textStyle, {marginLeft: 8}]}>{text}</ButtonText>
          </RowView>
      </ThemedButton>
    );
  }
  if(text){
    return(
      <ThemedButton onPress={onPress} onLongPress={onLongPress} style={style} accessibilityLabel={accessibilityLabel}>
        <ButtonText style={textStyle}>
          {text}
        </ButtonText>
      </ThemedButton>
    );
  }
  if(iconName){
    return(
      <ThemedButton onPress={onPress} onLongPress={onLongPress} style={style} accessibilityLabel={accessibilityLabel}>
        <ButtonText style={textStyle}>
          <Icon name={iconName} onLongPress={onLongPress} size={iconSize} color={iconColor}/>
        </ButtonText>
      </ThemedButton>
    )
  }
  return(
    <ThemedButton onPress={onPress} onLongPress={onLongPress} style={style} accessibilityLabel={accessibilityLabel}>
      <ButtonText style={textStyle}>
        {text}
      </ButtonText>
    </ThemedButton>
  );
}

