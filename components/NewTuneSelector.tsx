import {useNavigation} from "@react-navigation/native";
import {BgView, ButtonText, DeleteButton, SafeBgView, SubText, Text} from "../Style";
import {Button} from "../simple_components/Button";

export default function NewTuneSelector({}: {}){
  const navigation = useNavigation();
  return(
    <SafeBgView>
      <Text>ADD TUNE</Text>
      <SubText>Press "Import" to import tune information from TuneTracker. (Recommneded) </SubText>
      <SubText>Press "New" to create a tune that doesn't exist on our servers yet. (You will not be required to publish your tune to the server if you don't want to.)</SubText>
      <Button text="Import" onPress={() => {navigation.goBack(); navigation.navigate("Importer")}}/>
      <Button text="New" onPress={() => {navigation.goBack(); navigation.navigate("Editor")}}/>
      <DeleteButton onPress={() => {navigation.goBack();}}><ButtonText>Go back</ButtonText></DeleteButton>
    </SafeBgView>
  );
}
