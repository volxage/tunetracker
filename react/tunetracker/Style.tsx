import styled from 'styled-components/native'
import {
  StyleSheet,
} from 'react-native';
const styles = StyleSheet.create({ //TODO: replaced with styled components and delete extra
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  bordered: {
    borderWidth: 1,
  }
});

const Button = styled.Pressable`
  align-items: 'center';
  justify-content: 'center';
  padding-vertical: 12px;
  padding-horizontal: 36px;
  border-radius: 4px;
  elevation: 3;
  background-color: cadetblue;
  margin: 8px;
`
const DeleteButton = styled.Pressable`
  align-items: 'center';
  justify-content: 'center';
  padding-vertical: 12px;
  padding-horizontal: 36px;
  border-radius: 4px;
  elevation: 3;
  font-size: 20px;
  background-color: darkred;
  margin: 8px;
`
const Text = styled.Text`
  font-size: 24px;
  color: white;
  font-weight: 500;
`;
const SubText = styled.Text`
  font-size: 20px;
  color: white;
  font-weight: 250;
`;
const ButtonText = styled.Text`
  font-size: 20px;
  color: white;
  line-height: 21px;
  font-weight: 500;
  text-align: center;
`
const TextInput = styled.TextInput`
  border-width: 1px;
  font-size: 20px;
  font-weight: 250;
  color: white;
`;
export {Text, SubText, TextInput, styles, DeleteButton, Button, ButtonText};
