//Copyright 2024 Jonathan Hilliard

import React, {isValidElement, useContext, useEffect, useState} from 'react';
import {
  FlatList,
  Switch,
  View,
  TouchableHighlight,
} from 'react-native';

import {
  Text,
  Button,
  SubText,
  TextInput,
  DeleteButton,
  ButtonText,
  SMarginView,
  BackgroundView
} from '../Style.tsx'
import itemSort from '../itemSort.tsx'
import {Picker} from '@react-native-picker/picker';
import Fuse, {FuseResult} from 'fuse.js';
import OnlineDB from '../OnlineDB.tsx';

const standardTuneAttrs = new Map<string, string>([
  ["title", "Title"],
  ["alternative_title", "Alternative Title"],
  ["form", "Form"],
  //  ["bio", "Bio"],
  ["year", "Year"],
]);
const standardComposersAttrs = new Map<string, string>([
  ["name", "Name"],
  ["birth", "Birth"],
  ["death", "Death"],
]);

import { Status, composer, standard, standard_composer } from '../types.ts';
import dateDisplay from '../textconverters/dateDisplay.tsx';
import TuneDraftContext from '../contexts/TuneDraftContext.ts';
import {AxiosResponse} from 'axios';
import ComposerDraftContext from '../contexts/ComposerDraftContext.ts';
import {useQuery, useRealm} from '@realm/react';
import Composer from '../model/Composer.ts';
import Tune from '../model/Tune.ts';

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
    "Composers.name"
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

function prettyPrint(object: unknown): string{
  if (typeof object == "string") return object as string;
  if (typeof object == "number") return JSON.stringify(object);
  if (Array.isArray(object)) return object.join(", ");
  if (object instanceof Date) return dateDisplay(object);
  return "(Empty)";
}
const statusTextMap = new Map([
  [Status.Waiting, "Connecting to the server! Please wait."],
  [Status.Failed, 'Connection failed, press the button below to try again. Your internet or the server may be down. Email jhilla@jhilla.org if you believe the server is down. If the server is down, then tunetracker.jhilla.org should also be down!'],
  [Status.Complete, "Connection complete, but something is wrong."]
])
function renderStandard(item: standard | composer, importFn: Function, separators: any, selectedAttr: keyof standard | composer, isComposer: boolean){
  let text = "";
  let subtext = "";
  if(isComposer){
    const comp = item as composer;
    text = comp.name;
    if(selectedAttr !== "name" as keyof composer){
      subtext = prettyPrint(comp[selectedAttr as keyof composer])
    }else{
      subtext = dateDisplay(comp["birth"])
    }
  }else{
    const stand = item as standard;
    text = stand.title;
    if(selectedAttr !== "title" as keyof standard){
      subtext = prettyPrint(stand[selectedAttr as keyof standard])
    }else{
      if(stand["Composers"]){
        subtext = prettyPrint(stand["Composers"].map(comp => comp.name).join(", "));
      }else{
        subtext = "(No composers listed)"
      }
    }
  }
  return {text: text, subtext: subtext};
}

function ImporterHeader({
  listReversed,
  setListReversed,
  updateSelectedAttr,
  navigation,
  setSearch,
  importingId,
  importingComposers,
  suggestTuneSubmission
}: {
  listReversed: boolean | undefined,
  setListReversed: Function,
  updateSelectedAttr: Function,
  navigation: any,
  setSearch: Function,
  importingId: boolean,
  importingComposers: boolean,
  suggestTuneSubmission: boolean
}){
  const standardAttrs = importingComposers ? standardComposersAttrs : standardTuneAttrs;
  const selectedAttrItems = Array.from(standardAttrs.entries())
    .map((x) => {return {label: x[1], value: x[0]}});
  const [createOnlineItemExpanded, setCreateOnlineItemExpanded] = useState(false);
  const currentTune = useContext(TuneDraftContext);
  const currentComposer = useContext(ComposerDraftContext);
  const [submissionResult, setSubmissionResult] = useState({} as any);
  const submissionSuccessful = submissionResult && "data" in submissionResult;
  const [submissionError, setSubmissionError] = useState({} as any);
  const errorReceived = submissionError && "message" in submissionError;
  return(
    <View style={{backgroundColor: "#222"}}>
      <TextInput
        placeholder={"Search"}
        placeholderTextColor={"white"}
        onChangeText={(text) => setSearch(text)}
      />
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <View style={{flex: 2}}>
        <Picker
          onValueChange={(value) => updateSelectedAttr(value)}
        >
          {
            (selectedAttrItems).map(
              (attrPair) => 
              <Picker.Item label={attrPair.label} value={attrPair.value} key={attrPair.value}
                style={{color: "white", backgroundColor: "#222", fontSize: 20, fontWeight: 200}}
              />
              )
          }
        </Picker>
      </View>
      <View style={{alignItems: "flex-end"}}>
        <SubText style={{fontWeight: "medium"}}>{"Reverse sort:"}</SubText>
      </View>
      <View style={{flex: 1, alignItems: "center"}}>
        <Switch value={listReversed} onValueChange={() => setListReversed(!listReversed)}/>
      </View>
    </View>
    <SubText>If you already saved/connected to the {importingComposers ? "composer" : "tune"} you're searching for, it won't be available here.</SubText>
    {
      importingId &&
      <View>
        <Button onPress={() => setCreateOnlineItemExpanded(!createOnlineItemExpanded)}>
          {
            createOnlineItemExpanded ?
            <ButtonText>(Collapse)</ButtonText>
            :
            <ButtonText>Can't find my {importingComposers ? "composer" : "tune"} below</ButtonText>
          }
        </Button>
      {
        createOnlineItemExpanded &&
        <View>
          {
            suggestTuneSubmission ?
            <View>
              <SubText>This search doesn't seem to match well with any {importingComposers ? "composer" : "tune"} from our database. You can submit your draft below. After it is reviewed and accepted, it will be added to the database for everyone to use!</SubText>
              {
                submissionSuccessful &&
                <View style={{borderColor: "white", borderWidth: 1, padding: 4}}>
                  <SubText>Submitted your tune "{importingComposers ? currentComposer.name : currentTune.title}" to tunetracker.jhilla.org</SubText>
                </View>
              }
              {
                errorReceived &&
                <View style={{borderColor: "white", borderWidth: 1, padding: 4}}>
                  <SubText>Error: {submissionError["message"]}</SubText>
                </View>
              }
              <Button
                style={{backgroundColor: (submissionSuccessful || errorReceived) ? "#444" : "cadetblue"}}
                onPress={() => {
                  //TODO: Move tune conversion to OnlineDB here and in Compare.tsx
                  if(!submissionSuccessful && !errorReceived){
                    if(!importingComposers){
                      if(!currentTune || !currentTune.title){
                        console.error("No title in the tune!");
                        return;
                      }
                      const copyToSend = {
                        title: currentTune.title,
                        alternative_title: currentTune.alternativeTitle,
                        id: currentTune.id,
                        form: currentTune.form,
                        bio: currentTune.bio,
                        composers: !currentTune.composers ? undefined : currentTune.composers.map(comp => {
                          console.log(comp);
                          if("dbId" in comp){
                            return comp["dbId"]
                          }
                          return comp.id;
                        })
                      }
                      OnlineDB.createTuneDraft(copyToSend).then(res => {
                        setSubmissionResult(res as AxiosResponse)
                      }).catch(err => {
                        setSubmissionError(err);
                      });
                    }else{
                      if(!currentComposer || !currentComposer.name){
                        console.error("No name in the composer!");
                        return;
                      }
                      const copyToSend = {
                        name: currentComposer.name,
                        bio: currentComposer.bio,
                        birth: currentComposer.birth,
                        death: currentComposer.death
                      }
                      OnlineDB.createComposerDraft(copyToSend).then(res => {
                        setSubmissionResult(((res as AxiosResponse)))
                      }).catch(err => {
                        setSubmissionError(err);
                      });
                    }
                  }
                }}
              >
                {
                  (submissionResult && "data" in submissionResult) ?
                  <ButtonText style={{color: "#777"}}>(Tune already submitted)</ButtonText>
                  :
                  <ButtonText>Upload your {importingComposers ? "composer" : "tune"}</ButtonText>
                }
              </Button>
            </View>
            :
            <View>
              <SubText>You have very similar search results, or you haven't searched yet. We suggest searching for the Tune and connecting to it before submitting your copy; you can still suggest your changes after you connect to our version. Otherwise, tap and hold if you're sure you want to send your copy to our server for review.</SubText>
              <Button
                onLongPress={() => {
                  OnlineDB.createTuneDraft(currentTune);
                  navigation.goBack();
                }}
              >
                <ButtonText>Submit your Tune to TuneTracker</ButtonText>
              </Button>
            </View>
          }
        </View>
      }
    </View>
  }
  <DeleteButton onPress={() => navigation.goBack()}>
    <ButtonText>Cancel import</ButtonText>
  </DeleteButton>
</View>
  );
}

export default function Importer({
  importFn,
  navigation,
  importingId,
  importingComposers
}: {
  importFn: Function,
  navigation: any,
  importingId: boolean,
  importingComposers: boolean
}){
  const dbStatus = useContext(OnlineDB.DbStateContext).status;
  const dbDispatch = useContext(OnlineDB.DbDispatchContext);
  useEffect(() => {
  }, []);
  const composerQuery = useQuery(Composer);
  const tuneQuery = useQuery(Tune);
  const [listReversed, setListReversed] = useState(false);
  const [selectedAttr, updateSelectedAttr] = useState(importingComposers ? "name" : "title");
  const [search, setSearch] = useState("");
  let standards = importingComposers ? OnlineDB.getComposers() : OnlineDB.getStandards();

  let displayStandards = standards;
  let suggestTuneSubmission = false;
  const fuse = importingComposers ?
    new Fuse<standard_composer>(standards as standard_composer[], composerFuseOptions) 
    : new Fuse<standard>(standards as standard[], composerFuseOptions);
  let searchResults: FuseResult<standard | composer>[] = []
  if(search === ""){
    itemSort(displayStandards, selectedAttr, listReversed);
  }else{
    searchResults = fuse.search(search);
    displayStandards = searchResults
      .map(function(value){
        return value.item;
      });
  }
  if(importingComposers){
    displayStandards = displayStandards.filter(standard => {
      return !composerQuery.some(C => C.dbId === standard.id);
    })
  }else{
    displayStandards = displayStandards.filter(standard => {
      return !tuneQuery.some(T => T.dbId === standard.id);
    })
  }
  suggestTuneSubmission = false;
  if(!searchResults || !searchResults[0]){
    suggestTuneSubmission = true;
  }
  else if(searchResults[0].score && searchResults[0].score > 0.6){
    suggestTuneSubmission = true;
  }
  return (
    (standards.length || dbStatus === Status.Complete) ?
    <FlatList
      data={displayStandards}
      extraData={selectedAttr}
      ListHeaderComponent={
        <ImporterHeader listReversed={listReversed}
          setListReversed={setListReversed}
          updateSelectedAttr={updateSelectedAttr}
          navigation={navigation}
          importingId={importingId}
          importingComposers={importingComposers}
          suggestTuneSubmission={suggestTuneSubmission}
          setSearch={setSearch}/>
      }
      renderItem={({item, index, separators}) => {
        let texts = renderStandard(item, importFn, separators, selectedAttr as keyof standard | composer, importingComposers)
        return (
          <TouchableHighlight
            key={item.name}
            onPress={() => {
              importFn(item, true);
            }}
            onLongPress={() => {
              importFn(item);
            }}
            onShowUnderlay={separators.highlight}
            onHideUnderlay={separators.unhighlight}>
            <View style={{backgroundColor: 'black', padding: 8}}>
              <Text>{texts?.text}</Text>
              <SubText>{texts?.subtext}</SubText>
            </View>
          </TouchableHighlight>
      )}
    }
  />
  : <View style={{flex: 1, display: "flex", justifyContent: "center", alignItems: "center"}}>
    <View style={{flex: 1, backgroundColor: "black"}}>
      <SMarginView>
        <SubText>{statusTextMap.get(dbStatus)}</SubText>
      </SMarginView>
      {
        dbStatus === Status.Failed &&
        <Button onPress={() => {OnlineDB.updateDispatch(dbDispatch)}}>
          <ButtonText>Retry</ButtonText>
        </Button>
      }
      <DeleteButton onPress={() => {navigation.goBack()}}><ButtonText>Cancel import</ButtonText></DeleteButton>
    </View>
    </View>
  );
}
