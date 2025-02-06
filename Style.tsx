// Copyright 2024 Jonathan Hilliard
import {Picker} from '@react-native-picker/picker';
import styled from 'styled-components/native'

const Button = styled.Pressable`
  align-items: 'center';
  justify-content: 'center';
  padding-vertical: 6px;
  border-radius: 4px;
  elevation: 3;
  background-color: cadetblue;
  margin: 8px;
`
const DeleteButton = styled.Pressable`
  align-items: 'center';
  justify-content: 'center';
  padding-vertical: 6px;
  border-radius: 4px;
  elevation: 3;
  font-size: 20px;
  background-color: maroon;
  margin: 8px;
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
  font-size: 20px;
  color: white;
  font-weight: 200;
`;
const SubBoldText = styled.Text`
  font-size: 20px;
  color: white;
  font-weight: 350;
`;
const ButtonText = styled.Text`
  font-size: 20px;
  color: white;
  font-weight: 500;
  text-align: center;
`
const TextInput = styled.TextInput`
  font-size: 20px;
  color: white;
  padding: 16px;
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
