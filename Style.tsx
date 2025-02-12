
// Copyright 2024 Jonathan Hilliard
import {Picker} from '@react-native-picker/picker';
import {PixelRatio} from 'react-native';
import styled from 'styled-components/native'

const minButtonSize = PixelRatio.getPixelSizeForLayoutSize(24);
const fontScale = PixelRatio.getFontScale();
export const DarkButton = styled.Pressable`
  padding-vertical: 6px;
  border-radius: 4px;
  elevation: 3;
  border-width: 2px;
  border-color: cadetblue;
  margin: 4px;
  min-height: ${minButtonSize}px;
  min-length: ${minButtonSize}px;
  justify-content: center;
`
export const DeleteButton = styled.Pressable`
  align-items: 'center';
  justify-content: 'center';
  padding-vertical: 6px;
  border-radius: 4px;
  border-width: 2px;
  elevation: 3;
  font-size: 20px;
  border-color: maroon;
  margin: 4px;
  min-height: ${minButtonSize}px;
  min-length: ${minButtonSize}px;
  justifyContent: center;
`
export const Title = styled.Text`
  font-size: 30px;
  color: white;
  font-weight: 400;
  text-align: center;
`
export const Text = styled.Text`
  font-size: 24px;
  color: white;
  font-weight: 500;
`;
export const SubText = styled.Text`
  font-size: ${fontScale * 20}px;
  color: white;
  font-weight: 200;
`;
export const SubBoldText = styled.Text`
  font-size: ${fontScale * 20}px;
  color: white;
  font-weight: 350;
  min-height: ${minButtonSize}px;
  min-length: ${minButtonSize}px;
`;
export const ButtonText = styled.Text`
  font-size: ${20 * fontScale}px;
  color: white;
  font-weight: 500;
  text-align: center;
`
export const DarkButtonText = styled.Text`
  font-size: ${20 * fontScale}px;
  color: white;
  font-weight: 500;
  text-align: center;
`
export const TextInput = styled.TextInput`
  font-size: ${fontScale * 20}px;
  font-size: 20px;
  color: white;
  padding: 16px;
  min-height: ${minButtonSize}px;
  min-length: ${minButtonSize}px;
`;
export const SMarginView = styled.View`
  background-color: black;
  margin: 16px;
`;
export const ConfidenceBarView = styled.View`
  margin-vertical: -4px;
  margin-horizontal: -12px;
`;
export const BackgroundView = styled.View`
  background-color: black;
  flex: 1;
`;
export const RowView = styled.View`
  flex-direction: row;
`;

