import {ElementType, FC, ReactNode} from "react";
import {Platform, View} from "react-native";

export default function PlatformContainerSwitch({
  IosContainer,
  AndroidContainer,
  children
}: {
  IosContainer: ElementType,
  AndroidContainer: ElementType
  children: Element
}){
  switch(Platform.OS){
    case "ios": {
      return(
        <IosContainer>
          {children}
        </IosContainer>
      );
    }
    case "android": {
      return(
        <AndroidContainer>
          {children}
        </AndroidContainer>
      );
    }
    default: {
      return (<>children</>);
    }
  }
}
