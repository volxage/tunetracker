import {useState} from "react";
import {View} from "react-native";
import DatePicker from "react-native-date-picker";
import {Button, ButtonText, SubText, Title} from "../../Style";
import dateDisplay from "../../textconverters/dateDisplay";

export default function DateField({
  attr,
  attrKey,
  navigation,
  handleSetCurrentItem
}:{
  attr: Date,
  attrKey: string,
  navigation: any,
  handleSetCurrentItem: Function
}){
  const [dateCopy, setDateCopy] = useState(new Date(attr.valueOf()));
  const [dateOpen, setDateOpen] = useState(false);
  return(
    <View>
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
      <Title>{(attrKey as string).toUpperCase()}</Title>
      <View style={{flexDirection: "row"}}>
        <View style={{flex: 1, alignItems: "left", alignSelf: "center"}}>
          <View style={{borderColor: "grey", borderWidth: 1, padding: 8}}>
            <SubText>{dateDisplay(attr)}</SubText>
          </View>
        </View>
        <Button style={{flex:1}} onPress={() => setDateOpen(true)}>
          <ButtonText>Set date</ButtonText>
        </Button>
      </View>
    </View>
  );
}
