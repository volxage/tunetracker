// Copyright 2024 Jonathan Hilliard

import React, {isValidElement, useEffect, useState} from 'react';
import {View} from 'react-native';
import {ButtonText, DeleteButton, SafeBgView, Title} from '../Style';
import {useNavigation} from '@react-navigation/native';
import {Button} from '../simple_components/Button';
import {useTheme} from 'styled-components';

// <Button onPress={() => {navigation.navigate("PlaylistImporter")}}>
export default function ExtrasMenu({
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
        <Button text='Tutorial'/>
        <Button text='Toggle Light mode / Dark mode' onPress={() => {toggleTheme()}}/>
        <DeleteButton onPress={() => {navigation.goBack()}}>
          <ButtonText>Back</ButtonText>
        </DeleteButton>
      </View>
    </SafeBgView>
  );
}
