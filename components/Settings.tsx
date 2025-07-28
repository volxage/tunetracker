// Copyright 2024 Jonathan Hilliard

import React, {isValidElement, useEffect, useState} from 'react';
import {View} from 'react-native';
import {ButtonText, DeleteButton, SMarginView, SafeBgView, Title} from '../Style';
import {useNavigation} from '@react-navigation/native';
import {Button} from '../simple_components/Button';
import {useTheme} from 'styled-components';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import TempTutorial from './Tutorials/TempTutorial';

// <Button onPress={() => {navigation.navigate("PlaylistImporter")}}>
export default function Settings({
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
          <SettingsUnwrapped toggleTheme={toggleTheme}/>
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

function SettingsUnwrapped({
  toggleTheme
}: {
  toggleTheme: Function
}){
  const navigation = useNavigation();
  const theme = useTheme();
  return (
    <SafeBgView style={{flex:1}}>
      <View>
        <View style={{alignSelf: "center"}}>
          <Title>Settings</Title>
        </View>
        <Button text='Tutorial'
          onPress={() => {navigation.navigate("TempTutorial")}}
        />
        <Button text='Toggle Light mode / Dark mode' onPress={() => {toggleTheme()}}/>
        <DeleteButton onPress={() => {navigation.navigate("AccountDeletion")}}>
          <ButtonText>DELETE ACCOUNT</ButtonText>
        </DeleteButton>
        <DeleteButton onPress={() => {navigation.goBack()}}>
          <ButtonText>Back</ButtonText>
        </DeleteButton>
      </View>
    </SafeBgView>
  );
}
