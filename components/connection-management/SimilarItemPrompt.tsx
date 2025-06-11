import {useContext, useEffect} from "react";
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

function SimilarItemPrompt({
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

  let fuse = new Fuse([]) as unknown as (Fuse<standard> | Fuse<standard_composer>);
  let results;
  useEffect(() => {
    if(isComposer){
      fuse = new Fuse(composers, composerFuseOptions);
    }else{
      fuse = new Fuse(standards, tuneFuseOptions);
    }
  }, [isComposer])

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
    <FlatList data={results} renderItem={({item}) => {
      if(isComposer){
        //Not sure why the typing system complains about item.item always being a standard.
        const comp = item.item as unknown as standard_composer;
        return(
          <View style={{padding:8}}>
            <Text>{comp.name}</Text>
            <SubText>{dateDisplay(comp.birth)} - {dateDisplay(comp.death)}</SubText>
          </View>
        )
      }else{
        return(
          <View style={{padding: 8}}>
            <Text>{item.item.title}</Text>
            <SubText>{item.item.Composers?.map(c => c.name).join(", ")}</SubText>
          </View>
        )
      }
    }}/>
  )
}
