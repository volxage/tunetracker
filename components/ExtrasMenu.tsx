// Copyright 2024 Jonathan Hilliard

import React, {isValidElement, useEffect, useState} from 'react';
import {SafeAreaView, View} from 'react-native';
import {ButtonText, DeleteButton, Title} from '../Style';
import {useNavigation} from '@react-navigation/native';
import {Button} from '../simple_components/Button';

// <Button onPress={() => {navigation.navigate("PlaylistImporter")}}>
export default function ExtrasMenu({
}: {
}){
  const navigation = useNavigation() as any;
  return (
    <SafeAreaView style={{flex:1, backgroundColor:"black"}}>
      <View>
        <View style={{alignSelf: "center"}}>
          <Title>Extras Menu</Title>
        </View>
        <Button text="Profile" onPress={() => {navigation.navigate("ProfileMenu")}}/>
        <Button text="Playlist Viewer" 
          onPress={() => {navigation.navigate("PlaylistViewer")}}
        />
        <Button style={{backgroundColor: "#111"}} text='Import Playlist (Coming soon!)'/>
        <DeleteButton onPress={() => {navigation.goBack()}}>
          <ButtonText>Back</ButtonText>
        </DeleteButton>
      </View>
    </SafeAreaView>
  );
}
