/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {isValidElement, useState} from 'react';
import type {PropsWithChildren} from 'react';
import RNPickerSelect from 'react-native-picker-select';
import songsJson from './songs.json'
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  FlatList,
  TextInput,
  useColorScheme,
  View,
  Text,
  TouchableHighlight,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

// Requirements: 
// x Selection menu for tune attributes
// x Search (text input)
// 4 buttons (3 if the auto-search is efficient)
// List View
// Tune entry

// Maybe we can get rid of the bottom bar and have everything on top?

const prettyAttrs = new Map<string, string>([
  ["title", "Title"],
  ["alternative_title", "Alternative Title"],
  ["composers", "Composer(s)"],
  ["form", "Form"],
  ["notable_recordings", "Notable recordings"],
  ["keys", "Key(s)"],
  ["styles", "Styles"],
  ["tempi", "Tempi"],
  ["contrafacts", "Contrafacts"],
  ["playthroughs", "Playthrough Count"],
  ["form_confidence", "Form Confidence"],
  ["melody_confidence", "Melody Confidence"],
  ["solo_confidence", "Solo Confidence"],
  ["lyrics_confidence", "Lyrics Confidence"],
  ["played_at", "Played At"],
]);

function LList({selected, reversed=false}: {selected : string, reversed : boolean}){

  let reverse_null_multiplier = 1;
  let reversed_multiplier = reversed ? -1 : 1;
  if (selected.endsWith("confidence") || selected == "playthroughs") reverse_null_multiplier = -1;
  songsJson.sort(function(a_song, b_song){
    let a = a_song[selected as keyof typeof a_song] as unknown;
    let b = b_song[selected as keyof typeof b_song] as unknown;


    if (a == null) return 1 * reverse_null_multiplier * reversed_multiplier;
    if (b == null) return -1 * reverse_null_multiplier * reversed_multiplier;
    
    if (typeof a == "string"){
      if (a.toLowerCase() < (b as String).toLowerCase()){
        return -1 * reversed_multiplier;
      }
      else if (a.toLowerCase() > (b as String).toLowerCase()){
        return 1 * reversed_multiplier;
      }
      return 0;
    }
    else if(typeof a == "number"){
      if ((a as number) < (b as number)){
        return -1 * reversed_multiplier;
      }
      else if ((a as number) > (b as number)){
        return 1 * reversed_multiplier;
      }
      return 0;
    }
    else if (Array.isArray(a) && Array.isArray(b)){
      if (a.length == 0) return 1;
      if (b.length == 0) return -1;
      if (typeof a[0] == "string"){
        if (a[0].toLowerCase() < (b[0] as string).toLowerCase()){
          return -1 * reversed_multiplier;
        }else if (a[0].toLowerCase() > (b[0] as string).toLowerCase()){
          return 1 * reversed_multiplier;
        }
        return 0;
      }
      else { if (typeof a[0] == "number"){
        if ((a[0]) < (b[0] as number)){
          return -1 * reversed_multiplier;
        }
        if ((a[0]) > (b[0] as number)){
          return 1 * reversed_multiplier;
        }
        return 0;
      }
      }
    }
    return 0;
  });
  return (
      <FlatList
      data={songsJson}
      extraData={selected}
      renderItem={({item, index, separators}) => (
    <TouchableHighlight
      key={item.title}
      onPress={() => this._onPress(item)}
      onShowUnderlay={separators.highlight}
      style={styles.bordered}
      onHideUnderlay={separators.unhighlight}>
      <View style={{backgroundColor: 'white'}}>
        <Text>{item.title}</Text>
        <Text>{selected != "title" ? JSON.stringify(item[selected]) : item["composers"]}</Text>
      </View>
    </TouchableHighlight>
)}
      />
      );
}
function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const selectionItems = Array.from(prettyAttrs.entries()).map((x) => {return {label: x[1], value: x[0]}});
  const [selection, updateSelection] = useState("title");

  

  return (
    <SafeAreaView style={backgroundStyle}>
      <RNPickerSelect
        onValueChange={(value) => updateSelection(value)}
        items={selectionItems}
      />
      <TextInput
        style={styles.bordered}
        placeholder={"Search"}
      />
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <LList selected={selection} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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

export default App;
