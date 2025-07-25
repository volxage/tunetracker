//Copyright 2024 Jonathan Hilliard
import {
  TextInput,
  DeleteButton,
  ButtonText,
  Title,
  Text,
  SubText,
  BgView,
  SMarginView,
  SubDimText
} from '../Style.tsx'
import { Button } from '../simple_components/Button.tsx';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import React, {useEffect, useState} from 'react';
import Slider from '@react-native-community/slider';
import {
  FlatList,
  Switch,
  View,
} from 'react-native';
import { composer, keyMap, playlist, prettyKeyMap, tune_draft, tune_draft_extras } from '../types.ts';
import DbConnection from './typefields/DbConnection.tsx';
import ComposerField from './typefields/ComposerField.tsx';
import Composer from '../model/Composer.ts';
import Playlist from '../model/Playlist.ts';
import {useQuery, useRealm} from '@realm/react';
import {BSON, List} from 'realm';
import { Picker } from '@react-native-picker/picker';
import DateField from './typefields/DateField.tsx';
import DbDrafts from './typefields/DbDrafts.tsx';
import {useTheme} from 'styled-components';
import PlaylistField from './typefields/PlaylistField.tsx';
import DraftNotif from './typefields/DraftNotif.tsx';



//TODO: Refactor, there should not be this many props
function TypeField({
  attr,
  attrKey,
  attrName,
  handleSetCurrentItem,
}: {
  attr: unknown,
  attrKey: keyof (tune_draft & composer & tune_draft_extras),
  attrName: string,
  handleSetCurrentItem: Function,
}){
  const theme = useTheme();
  const [icon, setIcon] = useState();
  const [bool, setBool] = useState(attr as boolean)
  useEffect(() => {
    Icon.getImageSource('circle', 26, 'white')
      .then(setIcon);
  }, []);
  type keyOfEitherDraft = keyof (tune_draft | composer)
  if (attrKey === "dbId" as keyOfEitherDraft){
    //<DbConnection attr={attr} isComposer={isComposer} handleSetCurrentItem={handleSetCurrentItem}/>
    return(
      <DraftNotif/>
    );
  }
  else if (attrKey === "dbDraftId" as keyOfEitherDraft){
    return(
      <DbDrafts attr={attr} handleSetCurrentItem={handleSetCurrentItem}/>
    )

  }
  else if (attrKey === "composers" as keyOfEitherDraft){
    return(
      <ComposerField attr={attr as (Composer | composer)[]} />
    );
  }
  else if (attr instanceof Date || attrKey === "birth" || attrKey === "death" || attrKey === "playedAt"){
    return(
      <DateField
        attr={attr as (Date | undefined)}
        attrKey={attrKey}
        attrName={attrName}
        handleSetCurrentItem={handleSetCurrentItem}
      />
    );
  }
  else if (attrKey === "mainTempo" || attrKey === "playthroughs"){
    return(
      <BgView style={{padding: 8}}>
        <Title style={{textAlign: "center"}}>{attrName.toUpperCase()}</Title>
        <TextInput defaultValue={String(attr as number)} placeholderTextColor={theme.detailText}
          keyboardType="numeric"
          value={String(attr)}
          onChangeText={(text) => {
            text = text.replace(/\D/g,'');
            if(Number.isNaN(Number(text))){
              text = "0"
              console.error("Cannot parse number, perhaps non-numeric character snuck through?");
            }
            handleSetCurrentItem(attrKey, Number(text))
          }}
          accessibilityLabel={"Enter main tempo"}
          style={{textAlign: "center", fontWeight: "300", borderColor: theme.detailText, borderWidth: 1, marginHorizontal: 32}}
        />
      </BgView>
    );
  }
  else if (attrKey === "playlists" as keyOfEitherDraft && attr){
    return(
      <PlaylistField attr={attr as (Playlist | playlist)[]}/>
    )
  }
  else if (attrKey === "tempi"){
    function handleReplace(value: number, index: number){
      const newArrAttr = (attr as number[]).map((c, i) => {
        return i === index ? value : c;
      });
      handleSetCurrentItem(attrKey, newArrAttr);
      //setarrAttr(newArrAttr); handeSetCurrentTune causes a rerender, indirectly updating arrAttr.
    }
    return(
      <View style={{padding: 8}}>
        <View style={{flexDirection: 'row', paddingLeft: 32}}>
          <View style={{flex: 3, alignSelf: "center"}}>
            <Title>{attrName.toUpperCase()}</Title>
          </View>
          <View style={{flex: 1}}>
            <Button
              onPress={() => handleSetCurrentItem(attrKey, (attr as number[]).concat([0]))}
              iconName="plus"
            />
          </View>
        </View>
        <FlatList
          data={attr as number[]}
          renderItem={({item, index, separators}) => (
            <View style={{flexDirection: 'row'}}>
              <View style={{flex: 3, alignSelf: "center"}}>
                <TextInput defaultValue={String(attr as number)} placeholderTextColor={theme.detailText}
                  keyboardType="numeric"
                  accessibilityLabel='Enter a tempo'
                  value={String((attr as number[])[index])}
                  onChangeText={(text) => {
                    text = text.replace(/\D/g,'');
                    if(Number.isNaN(Number(text))){
                      text = "0"
                      console.error("Cannot parse number, perhaps non-numeric character snuck through?");
                    }
                    handleReplace(Number(text), index)
                  }}
                  style={{textAlign: "center", fontWeight: "300", borderWidth: 1, borderColor: theme.detailText, marginLeft: 32}}
                />
              </View>
              <View style={{flex:1, alignContent: 'flex-end'}}>
                <DeleteButton onPress={
                    () => handleSetCurrentItem(attrKey, (attr as number[]).filter((a, i) => i !== index))
                }>
                  <ButtonText><Icon name="close" size={30}/></ButtonText>
                </DeleteButton>
              </View>
            </View>
          )}
        />
      </View>
    )
  }
  else if (attrKey === "keyCenters"){
    const [keyEditing, setKeyEditing] = useState(-1);
    //Should either be a 12-item array of integers, or undefined.
    let arr = attr as (number[] | undefined)
    if(!arr || arr.length !== 12){
      arr = [0,0,0,0,0,0,0,0,0,0,0,0];
    }
    const arr1 = arr.slice(0,4);
    const arr2 = arr.slice(4,8);
    const arr3 = arr.slice(8,12);
    const colorConfMap = new Map([
      [0, theme.detailText],
      [1, theme.off],
      [2, theme.pending],
      [3, theme.soloConf],
      [4, theme.on],
    ]);
    const items1 = arr1.map((conf, i) => {return(
      <Button key={i} text={prettyKeyMap.get(i)} style={{borderColor: colorConfMap.get(conf), flex: 1}} onPress={() => {
        setKeyEditing(i);
      }}/>
    )});
    const items2 = arr2.map((conf, i) => {return(
      <Button key={i + 4} text={prettyKeyMap.get(i + 4)} style={{borderColor: colorConfMap.get(conf), flex: 1}} onPress={() => {
        //+ 6 to offset the array slice from earlier
        setKeyEditing(i + 4);
      }}/>
    )})
    const items3 = arr3.map((conf, i) => {return(
      <Button key={i + 8} text={prettyKeyMap.get(i + 8)} style={{borderColor: colorConfMap.get(conf), flex: 1}} onPress={() => {
        //+ 6 to offset the array slice from earlier
        setKeyEditing(i + 8);
      }}/>
    )})
    if(keyEditing < 0 || keyEditing > 11){
      return(
        <View style={{marginHorizontal: 32}}>
          <Title>KEYS</Title>
          <View style={{flexDirection: "row"}}>
            {items1}
          </View>
          <View style={{flexDirection: "row"}}>
            {items2}
          </View>
          <View style={{flexDirection: "row"}}>
            {items3}
          </View>
      </View>
      )
    }else{
      return(
        <View>
          <Title>KEYS</Title>
          <View style={{flexDirection: "row"}}>
          {
            Array.from(colorConfMap.entries()).map(([i, color]) => 
              <Button key={i} text={prettyKeyMap.get(keyEditing)} style={{borderColor: color, flex:1}} onPress={() => {
                //Replace array with new array where currently editing key is replaced by the selected confidence
                handleSetCurrentItem(attrKey, arr.map((val, arrIndex) => arrIndex === keyEditing ? i : val));
                setKeyEditing(-1);
              }}/>
            )
          }
          </View>
        </View>
    )
    }
  }
  else if (attrKey === "mainKey"){
    const keys = [
      [0,1,2,3],
      [4,5,6,7],
      [8,9,10,11],
    ]
    const attrStr = attr ? attr as string : "";
    const [key, quality] = attrStr.split(" ");
    let invalidPreviousKey = !keyMap.has(key.toLowerCase());
    const previousKeyIndex = invalidPreviousKey ? 0 : keyMap.get(key.toLowerCase());

    //This is my first recursive jsx map function! I hope this doesn't have bad performance implications! :o
    const keyButtons = keys.map((row, rowIndex) => {
      return(
        <View key={rowIndex} style={{flexDirection: "row"}}>
          {
            row.map((keyIndex) => 
              <Button key={keyIndex} text={prettyKeyMap.get(keyIndex)} style={{flex:1, borderColor: keyIndex === previousKeyIndex ? theme.on : theme.detailText}} onPress={() => {
                handleSetCurrentItem(attrKey, (prettyKeyMap.get(keyIndex) as string).concat(" ", quality));
              }}/>
            )
          }
        </View>
      );
    });
    return(
      <View style={{padding: 8, marginHorizontal:32}}>
        <Title>MAIN KEY</Title>
      { invalidPreviousKey && attr !== "" &&
        <SMarginView>
          <SubText>We found your last key, but your key "{key}" doesn't seem to be a note. Please select which key you meant below, and this message will go away.</SubText>
        </SMarginView>
      }
        {keyButtons}
        <View style={{flexDirection: "row"}}>
          <Button style={{flex:1, borderColor: quality==="Major" ? theme.on : theme.detailText}} text="Major" onPress={() => {
            handleSetCurrentItem(attrKey, key.concat(" ", "Major"));
          }}/>
          <Button style={{flex:1, borderColor: quality==="Minor" ? theme.on : theme.detailText}} text="Minor" onPress={() => {
            handleSetCurrentItem(attrKey, key.concat(" ", "Minor"));
          }}/>
        </View>
      </View>
    )
  }
  else if (typeof attr === "string"){
    return(
      <View style={{padding: 8}}>
        <Title style={{textAlign: "center"}}>{attrName.toUpperCase()}</Title>
        <TextInput defaultValue={attr} placeholderTextColor={theme.detailText}
          onChangeText={(text) => handleSetCurrentItem(attrKey, text)}
          style={{textAlign: "center", fontWeight: "300", borderColor: theme.detailText, borderWidth: 1, marginHorizontal: 32}}
          accessibilityLabel={"Enter " + attrName}
        />
      </View>
    );
  }else if (typeof attr == "number"){
    return(
      <View style={{padding: 8}}>
        <Title>{attrName.toUpperCase()}</Title>
        <Slider
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={attr as number}
          onSlidingComplete={(value) => {handleSetCurrentItem(attrKey, value)}}
          thumbImage={icon}
          style={{marginVertical: 20, marginHorizontal: 16, backgroundColor: "black"}}
          minimumTrackTintColor='cadetblue'
          maximumTrackTintColor='gray'
          thumbTintColor={theme.text || "gray"}
        />
      </View>
    );
  }
  else if (typeof attr === "boolean") {
    return(
      <View style={{padding: 8}}>
        <Title>{attrName.toUpperCase()}</Title>
        <View style={{flexDirection: "row", alignSelf: 'center'}}>
          <Switch
            onValueChange={(value) => {setBool(value); handleSetCurrentItem(attrKey, value)}}
            value={bool}
            trackColor={{false: "#444"}}
          />
        </View>
      </View>
    );
  }
  else if (Array.isArray(attr) || attr instanceof List){
//    const [arrAttr, setarrAttr] = useState(attr);
    function handleReplace(value: string, index: number){
      const newArrAttr = (attr as string[]).map((c, i) => {
        return i === index ? value : c;
      });
      handleSetCurrentItem(attrKey, newArrAttr);
      //setarrAttr(newArrAttr); handeSetCurrentTune causes a rerender, indirectly updating arrAttr.
    }
    return(
      <View style={{padding: 8}}>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 3, alignSelf: "center", marginLeft: 32}}>
            <Title>{attrName.toUpperCase()}</Title>
          </View>
          <View style={{flex:1}}>
            <Button
              onPress={() => handleSetCurrentItem(attrKey, (attr as string[]).concat(["New item"]))}
              accessibilityLabel={"Create new entry for the " + attrName}
              iconName='plus'
            />
          </View>
        </View>
        <FlatList
          data={attr}
          renderItem={({item, index, separators}) => (
            <View style={{flexDirection: 'row'}}>
              <View style={{flex: 3, alignSelf: "center", marginLeft: 32}}>
                <TextInput
                  placeholder={"Type new value here"}
                  placeholderTextColor={theme.detailText}
                  defaultValue={item}
                  accessibilityLabel={"Enter entry " + index + " for this item's " + attrName}
                  style={{borderColor: theme.detailText, borderWidth: 1, textAlign: "center"}}
                  onChangeText={(text) => handleReplace(text, index)}/>
              </View>
              <View style={{flex:1, alignContent: 'flex-end'}}>
                <DeleteButton
                  onPress={
                    () => handleSetCurrentItem(attrKey, (attr as string[]).filter((a, i) => i !== index))
                  }
                  accessibilityLabel={"Delete " + attrName + " entry " + index + " which says: " + item}
                >
                  <ButtonText><Icon name="close" size={30}/></ButtonText>
                </DeleteButton>
              </View>
            </View>
          )}
        />
      </View>
    )
  }
}

export default TypeField;
