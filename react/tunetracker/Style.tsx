import styled from 'styled-components/native'
import OriginalRNPickerSelect from 'react-native-picker-select';

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
const ButtonText = styled.Text`
  font-size: 20px;
  color: white;
  font-weight: 500;
  text-align: center;
`
const TextInput = styled.TextInput`
  border-width: 1px;
  font-size: 20px;
  font-weight: 200;
  color: white;
`;
export {Text, Title, SubText, TextInput, DeleteButton, Button, ButtonText};
