// Copyright 2024 Jonathan Hilliard

import React, {isValidElement, useEffect, useState} from 'react';
import {View} from 'react-native';
import {ButtonText, DeleteButton, SafeBgView, Title} from '../Style';
import {useNavigation} from '@react-navigation/native';
import {Button} from '../simple_components/Button';
import {useTheme} from 'styled-components';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import TempTutorial from './Tutorials/TempTutorial';

// <Button onPress={() => {navigation.navigate("PlaylistImporter")}}>
export default function ExtrasMenu({
  toggleTheme
}: {
  toggleTheme: Function
}){
  const Stack = createNativeStackNavigator();
  return(
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name={"EditorUnwrapped"} >
        {
          (props) => 
          <ExtrasMenuUnwrapped toggleTheme={toggleTheme}/>
        }
      </Stack.Screen>
      <Stack.Screen name="TempTutorial">
        {(props) =>
        <TempTutorial>
        </TempTutorial>
        }
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function ExtrasMenuUnwrapped({
  toggleTheme
}: {
  toggleTheme: Function
}){
  const navigation = useNavigation() as any;
  const theme = useTheme();
  return (
    <SafeBgView style={{flex:1}}>
      <View>
        <View style={{alignSelf: "center"}}>
          <Title>Extras Menu</Title>
        </View>
        <Button text="Profile" onPress={() => {navigation.navigate("ProfileMenu")}}/>
        <Button text="Playlist Viewer" 
          onPress={() => {navigation.navigate("PlaylistViewer")}}
        />
        <Button style={{backgroundColor: theme.panelBg}} text='Import Playlist (Coming soon!)'/>
        <Button text='Tutorial'
          onPress={() => {navigation.navigate("TempTutorial")}}
        />
        <Button text='Toggle Light mode / Dark mode' onPress={() => {toggleTheme()}}/>
        <DeleteButton onPress={() => {navigation.goBack()}}>
          <ButtonText>Back</ButtonText>
        </DeleteButton>
      </View>
    </SafeBgView>
  );
}
