import {ReactNode, useContext} from "react";
import HeaderFocusContext from "../contexts/HeaderFocusContext";
import {Button} from "../simple_components/Button";
import {ThemeContext} from "styled-components";
import {View} from "react-native";

export default function HeaderFocusWrapper({
  children,
  buttonText,
  description
}:{
  children: ReactNode,
  buttonText: string,
  description: string
}){
  const theme = useContext(ThemeContext);
  const [focusedComponent, setFocus, focusDescription, setFocusDescription] = useContext(HeaderFocusContext);
  function updateFocus(){
    setFocusDescription(description);
    setFocus(children)
  }
  return(
    <Button style={{backgroundColor: theme?.panelBg}} onPress={updateFocus} text={buttonText}/>
  );
}
