import {useContext, useEffect, useState} from "react";
import OnlineDB from "../../OnlineDB";
import TuneDraftContext from "../../contexts/TuneDraftContext";
import ComposerDraftContext from "../../contexts/ComposerDraftContext";
import {ButtonText, DeleteButton, SafeBgView, SubText, Text} from "../../Style";
import {Button} from "../../simple_components/Button";
import {useNavigation} from "@react-navigation/native";
import Fuse from "fuse.js";
import {composer, standard, standard_composer} from "../../types";
import {jsx} from "react/jsx-runtime";
import {FlatList, View} from "react-native";
import dateDisplay from "../../textconverters/dateDisplay";
import {Pressable} from "react-native";

const tuneFuseOptions = { // For finetuning the search algorithm
	// isCaseSensitive: false,
	// includeScore: false,
	// shouldSort: true,
	// includeMatches: false,
	// findAllMatches: false,
	// minMatchCharLength: 1,
	// location: 0,
	// threshold: 0.6,
	// distance: 100,
	// useExtendedSearch: false,
	// ignoreLocation: false,
	// ignoreFieldNorm: false,
	// fieldNormWeight: 1,
	keys: [
		"title",
	]
};
const composerFuseOptions = { // For finetuning the search algorithm
	// isCaseSensitive: false,
	// includeScore: false,
	// shouldSort: true,
	// includeMatches: false,
	// findAllMatches: false,
	// minMatchCharLength: 1,
	// location: 0,
	// threshold: 0.6,
	// distance: 100,
	// useExtendedSearch: false,
	// ignoreLocation: false,
	// ignoreFieldNorm: false,
	// fieldNormWeight: 1,
	keys: [
		"name",
	]
};

function StandardRender({stand}: {stand: standard}){
  const [expanded, setExpanded] = useState(false);
  return(
    <Pressable style={{padding: 8}} onPress={() => {setExpanded(!expanded)}}>
      <Text>{stand.title}</Text>
      <SubText>{stand.Composers?.map(c => c.name).join(", ")}</SubText>
      {
        expanded &&
          <Button text="This is the one!" onPress={() => {}}/>
      }
    </Pressable>
  )
}

function ComposerRender({comp}:{comp: standard_composer}){
  const [expanded, setExpanded] = useState(false);
  return(
    <View style={{padding:8}}>
      <Text>{comp.name}</Text>
      <SubText>{dateDisplay(comp.birth)} - {dateDisplay(comp.death)}</SubText>
      {
        expanded &&
          <Button text="This is the one!" onPress={() => {}}/>
      }
    </View>
  )
}

export default function SimilarItemPrompt({
}:{
}){
  const navigation = useNavigation();
  const dbState = useContext(OnlineDB.DbStateContext);
  const standards = dbState.standards;
  const composers = dbState.composers;
  const TDContext = useContext(TuneDraftContext);
  const CDContext = useContext(ComposerDraftContext);
  //If the composerDraftContext isn't empty.
  const isComposer = Object.keys(CDContext).length > 0;
  const activeDraft = isComposer ? CDContext.cd : TDContext.td;
  if(!activeDraft){
    //Simple error message. Hopefully never reached.
    return(
      <SafeBgView><Text>Error: Couldn't retrieve active draft.</Text><DeleteButton onPress={()=>{navigation.goBack()}}/></SafeBgView>
    );
  }

  let fuse = isComposer ? new Fuse<standard_composer>(composers, composerFuseOptions) : new Fuse<standard>(standards, tuneFuseOptions);
  let results;

  if(activeDraft.dbId){
    return(
      <SafeBgView>
        <Text>Oops!</Text>
        <SubText>This {isComposer ? "composer" : "tune" } seems to be connected. You shouldn't be on this menu, please email code@jhilla.org if you are able to consistently reach this message even after pressing "Back."</SubText>
        <DeleteButton onPress={()=>{navigation.goBack();}}><ButtonText>Back</ButtonText></DeleteButton>
      </SafeBgView>
    );
  }

  if(isComposer){
    results = fuse.search(CDContext.cd.name as string);
  }else{
    results = fuse.search(TDContext.td.title as string);
  }
  results = results.slice(0,3);
  return(
    <SafeBgView>
      <Text style={{textAlign: "center"}}>Are any of these your {isComposer ? "composer?" : "tune?"}</Text>
    <FlatList data={results} renderItem={({item}) => {
      if(isComposer){
        //Not sure why the typing system complains about item.item always being a standard.
        const comp = item.item as unknown as standard_composer;
        return( <ComposerRender comp={comp} /> );
      }else{
        return( <StandardRender stand={item.item} /> );
      }
    }}/>
    </SafeBgView>
  )
}
