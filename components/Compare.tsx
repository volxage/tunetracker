import React, {isValidElement, useEffect, useState} from 'react';
import {
  Button,
  DeleteButton,
  ButtonText,
  SubText,
  Title,
  BackgroundView,
  Text,
  SMarginView,
} from '../Style.tsx'

import { editorAttrs } from '../types.tsx';

import {
  SafeAreaView,
  FlatList,
  View,
  TouchableHighlight,
} from 'react-native';

import TypeField from './TypeField.tsx';
import SongsList from '../SongsList.tsx';
import Playlists from '../Playlists.tsx';
import { tune, standard, playlist } from '../types.tsx';
import reactotron from 'reactotron-react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons.js';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Importer from './Importer.tsx';
import {BackHandler} from 'react-native';

//Anything that ends with "confidence" is also excluded
const exclude_set = new Set([
  "db_id",
  "playlists",
  "playthroughs"
]);

const empty_equivalent = new Set([
  "",
  "[]",
  "{}",
  "unknown"
]);
function stringify(value: any): string{
  switch(typeof value){
    case "string":
      return value
    case "number":
      return JSON.stringify(value);
    case "boolean":
      if(value){
        return "True"
      }
      return "False"
  }
  if(Array.isArray(value)){
    return value.join(", ");
  }
  return "Unable to parse"
}
function CompareField({item, index, currentStandard, currentTune}:
{
  item: string[],
  index: number,
  currentStandard: standard,
  currentTune: tune
}){
  const standardAttrPresent = (item[0] in currentStandard
            && !empty_equivalent.has(currentStandard[item[0] as keyof standard]
              .toString().trim()));
  const tuneAttrPresent = (item[0] in currentTune
            && !empty_equivalent.has(currentTune[item[0] as keyof tune]
              .toString().trim()));
  if(!standardAttrPresent && !tuneAttrPresent){
    return(<></>)
  }
  if(currentStandard[item[0] as keyof standard] === currentTune[item[0] as keyof tune]){
    return(
      <View>
        <Title>{item[1]}</Title>
        <SubText>{currentTune[item[0] as keyof tune]}</SubText>
      </View>
    )
  }
  const [choice, setChoice] = useState(1); // 0 - DB   1 - Neither   2 - Local
  return(
    <>
      <Title>{item[1]}</Title>
      <View>
        {
          (item[0] in currentStandard
            && !empty_equivalent.has(currentStandard[item[0] as keyof standard]
              .toString().trim())) &&
              <View>
                <SMarginView>
                  <SubText>{stringify(currentStandard[item[0] as keyof standard])}</SubText>
                </SMarginView>
              </View>
            }
            <View style={{flexDirection: "row"}}>
              {
                (item[0] in currentStandard
                  && !empty_equivalent.has(currentStandard[item[0] as keyof standard]
                    .toString().trim())) ?
                    <Button style={{
                        backgroundColor: choice === 0 ? "#338" : "#222",
                        flex: 1
                      }}
                      onPress={() => {setChoice(0)}}
                    >
                      <ButtonText><Icon name="database-arrow-up" size={30} /></ButtonText>
                    </Button>
                    :
                    <Button style={{
                      flex:1,
                        backgroundColor: "#111"
                    }}>
                      <ButtonText><Icon name="database-off" size={30} color="darkred" /></ButtonText>
                    </Button>
                  }
                  <Button style={{
                    backgroundColor: choice === 1 ? "#338" : "#222",
                      flex: 1
                    }}
                    onPress={() => {setChoice(1)}}
                  >
                    <ButtonText><Icon name="dots-horizontal" size={30} /></ButtonText>
                  </Button>
                  <Button style={{
                    backgroundColor: choice === 2 ? "#338" : "#222",
                      flex: 1
                  }}
                  onPress={() => {setChoice(2)}}
                  >
                    <ButtonText><Icon name="account-arrow-down" size={30} /></ButtonText>
                  </Button>
                </View>
                <View>
                  <SMarginView>
                    <SubText>{stringify(currentTune[item[0] as keyof tune])}</SubText>
                  </SMarginView>
                </View>
              </View>
            </>
          );
}
export default function Compare({
  currentTune,
  currentStandard,
  navigation
}:
{
  currentTune: tune,
  currentStandard: standard,
  navigation: any
}){
  const comparedTuneDraft = useState({} as tune);
  return(
  <BackgroundView>
  <FlatList
    data={editorAttrs.filter((item) => (!exclude_set.has(item[0]) && !item[0].endsWith("confidence")))}
    ListHeaderComponent={(props) => (
      <SMarginView>
        <SubText>Here, you can assess the differences between the online version of the tune (on top in each category) and your local version (at the bottom of each category) and choose which one you think to be more accurate. If you think neither are accurate, return to the Editor (via Cancel changes) to fix your version and then come back to upload your changes! Categories where both your local tune and the online tune are empty won't show up here.</SubText>
      </SMarginView>
    )}
    renderItem={({item, index, separators}) => (
      <CompareField item={item} index={index} currentTune={currentTune} currentStandard={currentStandard}/>
    )}
    ListFooterComponent={(props) => (
      <>
        <View>
          <Button style={{backgroundColor: "darkgreen"}}
          >
            <ButtonText>Upload draft to database</ButtonText>
          </Button>
        </View>
        <View style={{flexDirection: "row"}}>
          <Button style={{flex: 1}}
            onPress={() => {
              navigation.goBack();
            }}
          >
            <ButtonText>Save to phone</ButtonText>
          </Button>
          <DeleteButton style={{flex: 1}}
            onPress={() => {navigation.goBack()}}
          >
            <ButtonText>Cancel changes</ButtonText>
          </DeleteButton>
        </View>
      </>
      )}
    />
    </BackgroundView>
  );
}
