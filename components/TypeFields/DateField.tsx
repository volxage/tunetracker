import {useEffect, useState} from "react";
import {View} from "react-native";
import DatePicker from "react-native-date-picker";
import { ButtonText, DeleteButton, SubText, Title} from "../../Style";
import dateDisplay from "../../textconverters/dateDisplay";
import { Button } from "../../simple_components/Button";

export default function DateField({
  attr,
  attrKey,
  navigation,
  handleSetCurrentItem,
  attrName
}:{
  attr: Date | undefined,
  attrKey: string,
  navigation: any,
  handleSetCurrentItem: Function,
  attrName: string
}){
  const [dateCopy, setDateCopy]: [Date | undefined, Function] = useState(undefined);
  const [dateOpen, setDateOpen] = useState(false);
  useEffect(() => {
    if(typeof attr !== "undefined"){
      setDateCopy(new Date(attr.valueOf()))
    }
  }, [attr])

  if(typeof dateCopy === "undefined"){
    return(
      <View style={{padding: 8}}>
        <Title>{attrName.toUpperCase()}</Title>
        <View style={{flexDirection: "row"}}>
          <SubText style={{flex: 1, alignSelf: "center", textAlign: "center", borderWidth: 1, borderColor: "grey", padding: 8}}>Empty Date</SubText>
          <Button style={{flex:1}} onPress={() => {handleSetCurrentItem(attrKey, new Date())}}
            text="Add date"
          />
        </View>
      </View>
    )
  }
  return(
    <View style={{padding: 8}}>
      <DatePicker
        modal
        mode="date"
        date={dateCopy}
        open={dateOpen}
        timeZoneOffsetInMinutes={0}
        onConfirm={(date) => {
          setDateOpen(false)
          setDateCopy(date);
          handleSetCurrentItem(attrKey, date);
        }}
        onCancel={() => {
          setDateOpen(false);
        }}
      />
      <Title>{attrName.toUpperCase()}</Title>
      <View style={{flexDirection: "row"}}>
        <View style={{flex: 2, alignSelf: "center"}}>
          <View style={{borderColor: "grey", borderWidth: 1, padding: 8}}>
            <SubText style={{textAlign: "center"}}>{dateDisplay(attr)}</SubText>
          </View>
        </View>
        <Button style={{flex:1}} onPress={() => setDateOpen(true)}
          text="Set date"
        />
        <DeleteButton style={{flex: 1}} onPress={() => {handleSetCurrentItem(attrKey, undefined); setDateCopy(undefined);}}>
          <ButtonText>Delete</ButtonText>
        </DeleteButton>
      </View>
      {
        attrKey == "playedAt" &&
        <Button text="Set to Today" onPress={() => {handleSetCurrentItem(attrKey, new Date())}}/>
      }
    </View>
  );
}
