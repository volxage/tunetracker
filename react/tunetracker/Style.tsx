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
const TextInput = styled.TextInput`
  border-width: 1px;
  font-size: 20px;
  font-weight: 250;
  color: white;
`;
const DeleteButton = styled.Button`
  font-size: 20px;
  backgroundColor: red;
  color: white;
  font-weight: 250;
`
export {Text, SubText, TextInput, styles, DeleteButton};
