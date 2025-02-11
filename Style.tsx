
// Copyright 2024 Jonathan Hilliard
import {Picker} from '@react-native-picker/picker';
import {PixelRatio} from 'react-native';
import styled from 'styled-components/native'

const minButtonSize = PixelRatio.getPixelSizeForLayoutSize(24);
const fontScale = PixelRatio.getFontScale();
const Button = styled.Pressable`
  padding-vertical: 6px;
  border-radius: 4px;
  elevation: 3;
  border-width: 4px;
  border-color: cadetblue;
  margin: 4px;
  min-height: ${minButtonSize}px;
  min-length: ${minButtonSize}px;
  justify-content: center;
`
const DeleteButton = styled.Pressable`
  align-items: 'center';
  justify-content: 'center';
  padding-vertical: 6px;
  border-radius: 4px;
  border-width: 4px;
  elevation: 3;
  font-size: 20px;
  border-color: maroon;
  margin: 4px;
  min-height: ${minButtonSize}px;
  min-length: ${minButtonSize}px;
  justifyContent: center;
`
const Title = styled.Text`
  font-size: 30px;
  color: white;
  font-weight: 400;
  text-align: center;
`
const Text = styled.Text`
  font-size: 24px;
  color: white;
  font-weight: 500;
`;
const SubText = styled.Text`
  font-size: ${fontScale * 20}px;
  color: white;
  font-weight: 200;
`;
const SubBoldText = styled.Text`
  font-size: ${fontScale * 20}px;
  color: white;
  font-weight: 350;
  min-height: ${minButtonSize}px;
  min-length: ${minButtonSize}px;
`;
const ButtonText = styled.Text`
  font-size: ${20 * fontScale}px;
  color: white;
  font-weight: 500;
  text-align: center;
`
const TextInput = styled.TextInput`
  font-size: ${fontScale * 20}px;
  font-size: 20px;
  color: white;
  padding: 16px;
  min-height: ${minButtonSize}px;
  min-length: ${minButtonSize}px;
`;
const SMarginView = styled.View`
  background-color: black;
  margin: 16px;
`;
const ConfidenceBarView = styled.View`
  margin-vertical: -4px;
  margin-horizontal: -12px;
`;
const BackgroundView = styled.View`
  background-color: black;
  flex: 1;
`;
const RowView = styled.View`
  flex-direction: row;
`;

export {Text, Title, SubText, SubBoldText, TextInput, DeleteButton, Button, ButtonText, SMarginView, ConfidenceBarView, BackgroundView, RowView};
