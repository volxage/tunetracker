
// Copyright 2024 Jonathan Hilliard
import {Picker} from '@react-native-picker/picker';
import {PixelRatio} from 'react-native';
import styled from 'styled-components/native'

const minButtonSize = PixelRatio.getPixelSizeForLayoutSize(24);
const fontScale = PixelRatio.getFontScale();
export const ThemedButton = styled.Pressable`
  padding-vertical: 6px;
  border-radius: 4px;
  elevation: 3;
  border-width: 2px;
  border-color: ${({ theme }) => theme.defaultButton};
  margin: 4px;
  min-height: ${minButtonSize}px;
  min-length: ${minButtonSize}px;
  justify-content: center;
`
export const DeleteButton = styled.Pressable`
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
  color: ${({ theme }) => theme.text};
  font-weight: 400;
  text-align: center;
`
export const Text = styled.Text`
  font-size: 24px;
  color: ${({ theme }) => theme.text};
  font-weight: 500;
`;
export const SubText = styled.Text`
  font-size: ${fontScale * 20}px;
  color: ${({ theme }) => theme.text};
  font-weight: 200;
`;
export const SubBoldText = styled.Text`
  font-size: ${fontScale * 20}px;
  color: ${({ theme }) => theme.text};
  font-weight: 350;
`;
export const ButtonText = styled.Text`
  font-size: ${20 * fontScale}px;
  color: ${({ theme }) => theme.text};
  font-weight: 500;
  text-align: center;
`
export const TextInput = styled.TextInput`
  font-size: ${fontScale * 20}px;
  font-size: 20px;
  color: ${({ theme }) => theme.text};
  padding: 16px;
  min-height: ${minButtonSize}px;
  min-length: ${minButtonSize}px;
`;
export const BgView = styled.View`
  background-color: ${({ theme }) =>  theme.bg};
`
export const SMarginView = styled.View`
  background-color: ${({ theme }) => theme.bg};
  margin: 16px;
`;
export const SafeBgView = styled.SafeAreaView`
  background-color: ${({ theme }) => theme.bg};
  flex:1
`
export const PanelView = styled.View`
  background-color: ${({theme}) => theme.panelBg};
`
export const RowView = styled.View`
  flex-direction: row;
`;

