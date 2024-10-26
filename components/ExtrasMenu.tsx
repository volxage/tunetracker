// Copyright 2024 Jonathan Hilliard

import React, {isValidElement, useEffect, useState} from 'react';
import {SafeAreaView, View} from 'react-native';
import {Button, ButtonText, DeleteButton, Title} from '../Style';


export default function ExtrasMenu({
  navigation,
}: {
  navigation: any,
}){
  return (
    <SafeAreaView style={{flex:1, backgroundColor:"black"}}>
      <View>
        <View style={{alignSelf: "center"}}>
          <Title>Extras Menu</Title>
        </View>
        <Button onPress={() => {navigation.navigate("PlaylistViewer")}}>
          <ButtonText>Playlist Viewer</ButtonText>
        </Button>
        <Button onPress={() => {navigation.navigate("PlaylistImporter")}}>
          <ButtonText>Import Playlist</ButtonText>
        </Button>
        <DeleteButton onPress={() => {navigation.goBack()}}>
          <ButtonText>Back</ButtonText>
        </DeleteButton>
      </View>
    </SafeAreaView>
  );
}
