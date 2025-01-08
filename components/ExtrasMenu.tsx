// Copyright 2024 Jonathan Hilliard

import React, {isValidElement, useEffect, useState} from 'react';
import {SafeAreaView, View} from 'react-native';
import {Button, ButtonText, DeleteButton, Title} from '../Style';
import {useNavigation} from '@react-navigation/native';

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
        <Button onPress={() => {navigation.navigate("ProfileMenu")}}>
          <ButtonText>Profile</ButtonText>
        </Button>
        <Button onPress={() => {navigation.navigate("PlaylistViewer")}}>
          <ButtonText>Playlist Viewer</ButtonText>
        </Button>
        <Button style={{backgroundColor: "#111"}}>
          <ButtonText style={{color: "#777"}}>Import Playlist (Coming soon!)</ButtonText>
        </Button>
        <DeleteButton onPress={() => {navigation.goBack()}}>
          <ButtonText>Back</ButtonText>
        </DeleteButton>
      </View>
    </SafeAreaView>
  );
}
