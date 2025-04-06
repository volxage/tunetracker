import {FlatList, TouchableHighlight, View} from "react-native";
import {ButtonText, DeleteButton, SMarginView, SafeBgView, SubText, Text, Title} from "../Style";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {useNavigation} from "@react-navigation/native";
import {useContext, useEffect, useState} from "react";
import http from "../http-to-server";
import {AxiosError, isAxiosError} from "axios";
import OnlineDB from "../OnlineDB";
import {composer, submitted_composer_draft, submitted_tune_draft, tune_draft} from "../types";
import InformationExpand from "./InformationExpand";
import dateDisplay from "../textconverters/dateDisplay";
import {useTheme} from "styled-components";

function TuneDraftRender({
  tune,
  separators,
}: {
  tune: submitted_tune_draft,
  separators: any,
}){
  const navigation = useNavigation() as any;
  const theme = useTheme();
  return(
    <TouchableHighlight
      key={tune.title}
      onPress={() => {
      }}
      onShowUnderlay={separators.highlight}
      onHideUnderlay={separators.unhighlight}>
      {
        <SMarginView>
          <Text>{tune.title}</Text>
          <SubText>{(tune.Composers && tune.Composers.length > 0) ? tune.Composers.map(comp => comp.name).join(",") : "(No composers provided)"}</SubText>
        {
          (tune.pending_review === null || tune.pending_review === true) ? 
          <SubText><Icon name="database-clock" color={theme.pending} size={28}/></SubText>
          :
          <>
            {
              (tune.accepted === null || tune.accepted === false) ?
              <SubText><Icon name="database-alert" size={28} color={theme.off}/></SubText>
              :
              <SubText><Icon name="database-check" color={theme.on} size={28}/></SubText>
            }
          </>
        }
        </SMarginView>
      }
    </TouchableHighlight>
  )
}
function ComposerDraftRender({
  composer,
  separators,
}: {
  composer: submitted_composer_draft,
  separators: any,
}){
  const theme = useTheme();
  const navigation = useNavigation() as any;
  return(
    <TouchableHighlight
      key={composer.name}
      onPress={() => {
      }}
      onShowUnderlay={separators.highlight}
      onHideUnderlay={separators.unhighlight}>
      {
        <SMarginView>
          <Text>{composer.name}</Text>
          <SubText>{composer.birth ? dateDisplay(composer.birth) : "No birthday provided!"}</SubText>
        {
          (composer.pending_review === null || composer.pending_review === true) ? 
          <SubText><Icon name="database-clock" color={theme.pending} size={28}/></SubText>
          :
          <>
            {
              (composer.accepted === null || composer.accepted === false) ?
              <SubText><Icon name="database-alert" size={28} color={theme.off}/></SubText>
              :
              <SubText><Icon name="database-check" color={theme.on} size={28}/></SubText>
            }
          </>
        }
        </SMarginView>
      }
    </TouchableHighlight>
  )
}
type User = {
  email: string,
  nickname: string,
  approved_nickname: boolean,
  pending_review: boolean,
  paid: boolean
}
export default function ProfileMenu({}:{}){
  const navigation = useNavigation();
  const [user, setUser] = useState({} as User);
  const [tuneDrafts, setTuneDrafts] = useState([]);
  const [composerDrafts, setComposerDrafts] = useState([]);
  const [fetchError, setFetchError] = useState({} as AxiosError);
  const dbDispatch = useContext(OnlineDB.DbDispatchContext);
  const [fetchDone, setFetchDone] = useState(false);

  async function getUserInfo(){
    console.log("getUserInfo called")
    let first = true;
    async function catchFunc(e: AxiosError){
      if(!first){
        console.error("Sumission failed twice. Giving up");
        console.log("Second error:");
        console.log(e);
        setFetchError(e);
	//Need to bubble up error in case the system tries to login a user all 3 times.
        throw e;
      }
      else{
        console.log("First submission error:");
        console.log(e);
      }
      first = false;
      if(isAxiosError(e)){
        switch(e.response?.status){
          case 401: {
            await OnlineDB.tryLogin(navigation, dbDispatch).then(() => {
            });
            break;
          }
          case 404:{
            console.log(e.response.data);
            break;
          }
        }
        if(e.message === "Network Error"){
          setFetchError(e);
          console.log("Network error");
        }
      }
    }
    try{
      //TODO: Move to OnlineDB.ts
      await http.get("/users/info").then(res => {
        setUser(res.data as User);
      }).catch(catchFunc)
      await http.get("users/tunedrafts").then(res => {
        setTuneDrafts(res.data);
      }).catch(catchFunc);
      await http.get("users/composerdrafts").then(res => {
        setComposerDrafts(res.data);
      }).catch(catchFunc);
      setFetchDone(true);
    }catch(err){
      console.log("Giving up, returning from function")
      setFetchDone(false);
      return;
    }
  };

  useEffect(() => {
    getUserInfo();
  }, []);
  return(
    <SafeBgView>
      <SMarginView style={{flexDirection: "row"}}>
        <View style={{flex:1}}>
          <Text style={{"textAlign": "center"}}><Icon name={"account-music"} size={64}/></Text>
        </View>
        <View style={{flex: 3}}>
          <Text>
            {user.nickname ? user.nickname : "Loading nickname..."}
          </Text>
          <SubText>{user.email ? user.email : "Loading email..."}</SubText>
        </View>
      </SMarginView>
      <InformationExpand
        Content={() => {return (
          <View>
            <SMarginView><SubText style={{color: "#888", fontSize: 18}}>Only your username "{user.nickname}" is visible to other users. Your email is only known by you and the server.</SubText></SMarginView>
            <SMarginView>
              <SubText style={{color: "#888", fontSize: 18}}><Icon name={"database-clock"} size={24}/> - Your submission is pending review, so your changes aren't in the database yet.</SubText>
              <SubText style={{color: "#888", fontSize: 18}}><Icon name={"database-alert"} size={24}/> - Your submission was rejected, possibly because it contained incorrect or inappropriate content.</SubText>
              <SubText style={{color: "#888", fontSize: 18}}><Icon name={"database-check"} size={24}/> - Congratulations! Your submission was accepted, it should be available to other users now.</SubText>
              <SubText style={{color: "#888", fontSize: 18}}>Press and hold below to begin the process of permanently deleting your account!</SubText>
            </SMarginView>
          {
            fetchDone && 
            <DeleteButton
              onLongPress={() => {
                navigation.navigate("AccountDeletion")
              }}>
                <ButtonText>DELETE ACCOUNT</ButtonText>
            </DeleteButton>
          }
          </View>
        );}}
      />
      <Title>SUBMITTED TUNES</Title>
      <FlatList
        data={tuneDrafts}
        renderItem={({item, index, separators}) => (
        <TuneDraftRender 
          tune={item}
          separators={separators}
        />
        )}
        ListEmptyComponent={() => (
          <SubText>We don't see any submissions</SubText>
        )}
      />   
      <SMarginView>
        <Title>SUBMITTED COMPOSERS</Title>
      </SMarginView>
      <FlatList
        data={composerDrafts}
        renderItem={({item, index, separators}) => (
        <ComposerDraftRender 
          composer={item}
          separators={separators}
        />
        )}
        ListEmptyComponent={() => (
          <SMarginView>
            <SubText>We don't see any submissions</SubText>
          </SMarginView>
        )}
      />   
          <DeleteButton onPress={navigation.goBack}><ButtonText>Go back</ButtonText></DeleteButton>
        </SafeBgView>
  );
}
