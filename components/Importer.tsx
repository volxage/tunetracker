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
  BackgroundView,
  RowView,
  SubBoldText
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

import { Status, composer, standard, standard_composer, tune_draft } from '../types.ts';
import dateDisplay from '../textconverters/dateDisplay.tsx';
import TuneDraftContext from '../contexts/TuneDraftContext.ts';
import {AxiosError, AxiosResponse, isAxiosError} from 'axios';
import ComposerDraftContext from '../contexts/ComposerDraftContext.ts';
import {useQuery, useRealm} from '@realm/react';
import Composer from '../model/Composer.ts';
import Tune from '../model/Tune.ts';
import {useNavigation} from '@react-navigation/native';
import ResponseHandler from '../services/ResponseHandler.ts';
import ResponseBox from './ResponseBox.tsx';

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
function StandardComposerDetails({
  std
}: {
  std: standard_composer
}){
  return(
    <SMarginView>
      <RowView>
        <SubBoldText>Bio: </SubBoldText>
        <SubText>{std.bio}</SubText>
      </RowView>
      <RowView>
        <SubBoldText>Birthday: </SubBoldText>
        <SubText>{dateDisplay(std.birth)}</SubText>
      </RowView>
      <RowView>
        <SubBoldText>Date of death: </SubBoldText>
        <SubText>{dateDisplay(std.death)}</SubText>
      </RowView>
    </SMarginView>
  )
}
function StandardDetails({
  std
}: {
  std: standard
}){
  return(
    <SMarginView>
      <RowView>
        <SubBoldText>Alternative title: </SubBoldText>
        <SubText>{std.alternative_title}</SubText>
      </RowView>
      <RowView>
        <SubBoldText>Year: </SubBoldText>
        <SubText>{std.year}</SubText>
      </RowView>
      <RowView>
        <SubBoldText>Form: </SubBoldText>
        <SubText>{std.form}</SubText>
      </RowView>
      <RowView>
        <SubBoldText>Bio: </SubBoldText>
        <SubText>{std.bio}</SubText>
      </RowView>
    </SMarginView>
  )
}
function StandardRender({
  item,
  importFn,
  separators,
  selectedAttr,
  isComposer
}:{
  item: standard | standard_composer,
  importFn: Function,
  separators: any,
  selectedAttr: keyof (standard & standard_composer),
  isComposer: boolean
}){
  let text = "";
  let subtext = "";
  const [detailsShown, setDetailsShown] = useState(false);
  if(isComposer){
    const comp = item as standard_composer;
    text = comp.name;
    if(selectedAttr !== "name" as keyof standard_composer){
      subtext = prettyPrint(comp[selectedAttr as keyof standard_composer])
    }else{
      subtext = dateDisplay(comp["birth"])
    }
    return (
      <TouchableHighlight
        key={comp.name}
        onPress={() => {
        }}
        onLongPress={() => {
          importFn(item);
        }}
        onShowUnderlay={separators.highlight}
        onHideUnderlay={separators.unhighlight}>
        <View style={{backgroundColor: 'black', padding: 8}}>
          <Text>{text}</Text>
          <SubText>{subtext}</SubText>
          {
            detailsShown &&
            <StandardComposerDetails std={comp}/>
          }
        </View>
      </TouchableHighlight>
    )
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
    return (
      <TouchableHighlight
        key={stand.title}
        onPress={() => {
          setDetailsShown(!detailsShown);
        }}
        onLongPress={() => {
          importFn(item);
        }}
        onShowUnderlay={separators.highlight}
        onHideUnderlay={separators.unhighlight}>
        <View style={{backgroundColor: 'black', padding: 8}}>
          <Text>{text}</Text>
          <SubText>{subtext}</SubText>
          {
            detailsShown &&
            <StandardDetails std={stand}/>
          }
        </View>
      </TouchableHighlight>
    )
  }
}
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
  setSearch,
  importingId,
  importingComposers,
  suggestTuneSubmission
}: {
  listReversed: boolean | undefined,
  setListReversed: Function,
  updateSelectedAttr: Function,
  setSearch: Function,
  importingId: boolean,
  importingComposers: boolean,
  suggestTuneSubmission: boolean
}){
  const standardAttrs = importingComposers ? standardComposersAttrs : standardTuneAttrs;
  const dbDispatch = useContext(OnlineDB.DbDispatchContext);
  const selectedAttrItems = Array.from(standardAttrs.entries())
    .map((x) => {return {label: x[1], value: x[0]}});
  const [createOnlineItemExpanded, setCreateOnlineItemExpanded] = useState(false);
  const currentTune = useContext(TuneDraftContext);
  const currentComposer = useContext(ComposerDraftContext);
  const [submissionResult, setSubmissionResult] = useState("");
  const [errorPresent, setErrorPresent] = useState(false);
  const navigation = useNavigation();
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
              <ResponseBox result={submissionResult} isError={errorPresent}/>
              <Button
                style={{backgroundColor: (submissionResult !== "") ? "#444" : "cadetblue"}}
                onPress={() => {
                  submit();
                  //TODO: Move tune conversion to OnlineDB here and in Compare.tsx
                  function submit(first=true){
                    if(submissionResult === ""){
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
                        } as tune_draft;
                        ResponseHandler(
                          OnlineDB.createTuneDraft(copyToSend),
                          (res) => {return `Successfully submitted your draft of ${res.data.title}`},
                          submit,
                          first,
                          navigation,
                          dbDispatch
                        ).then(res => {
                          setSubmissionResult(res.result);
                          setErrorPresent(res.isError);
                        })
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
                          ResponseHandler(
                            OnlineDB.createComposerDraft(copyToSend),
                            (res) => {return `Successfully submitted your draft of ${res.data.name}`},
                            submit,
                            first,
                            navigation,
                            dbDispatch
                          ).then(res => {
                            setSubmissionResult(res.result);
                            setErrorPresent(res.isError);
                          })
                      }
                    }
                  }
                }}
              >
                {
                  (submissionResult !== "") ?
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
  importingId,
  importingComposers
}: {
  importFn: Function,
  importingId: boolean,
  importingComposers: boolean
}){
  const dbState = useContext(OnlineDB.DbStateContext);
  const dbStatus = useContext(OnlineDB.DbStateContext).status;
  const dbDispatch = useContext(OnlineDB.DbDispatchContext);
  useEffect(() => {
  }, []);
  const composerQuery = useQuery(Composer);
  const tuneQuery = useQuery(Tune);
  const [listReversed, setListReversed] = useState(false);
  const [selectedAttr, updateSelectedAttr] = useState(importingComposers ? "name" : "title");
  const [search, setSearch] = useState("");
  let standards = importingComposers ? dbState.composers : dbState.standards;

  let displayStandards = standards;
  let suggestTuneSubmission = false;
  const fuse = importingComposers ?
    new Fuse<standard_composer>(standards as standard_composer[], composerFuseOptions) 
    : new Fuse<standard>(standards as standard[], composerFuseOptions);
  let searchResults: FuseResult<standard | composer>[] = []
  const navigation = useNavigation();
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
          importingId={importingId}
          importingComposers={importingComposers}
          suggestTuneSubmission={suggestTuneSubmission}
          setSearch={setSearch}/>
      }
      renderItem={({item, index, separators}) => {
        return (
          <StandardRender item={item} importFn={importFn} separators={separators} selectedAttr={selectedAttr as keyof (standard & standard_composer)} isComposer={importingComposers} />
        )
      }
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
