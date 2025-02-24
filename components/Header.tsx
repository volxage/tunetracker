import {PropsWithChildren, ReactNode, useContext} from "react"
import {View} from "react-native"
import HeaderFocusContext from "../contexts/HeaderFocusContext"
import { RowView, Text } from "../Style"
import {Button} from "../simple_components/Button"

export default function Header({
  children
}:{
  children: ReactNode
}){
  const [FocusedComponent, setFocus, focusDescription, setFocusDescription] = useContext(HeaderFocusContext);
  function resetFocus(){setFocus(null)}
  if(FocusedComponent === null || typeof FocusedComponent === undefined){
    return(
      <View>
        {children}
      </View>
    )
  }else{
    return(
      <View>
        <Text>{focusDescription}</Text>
        {FocusedComponent}
        <Button text="Done" onPress={resetFocus}/>
      </View>
    );
  }
}
