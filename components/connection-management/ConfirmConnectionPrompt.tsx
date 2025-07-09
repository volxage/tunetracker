import {View} from "react-native";
import {Text, BgView, ButtonText, DeleteButton, RowView, SubBoldText, SubText, SafeBgView, Title, SMarginView, SubDimText} from "../../Style";
import {Button} from "../../simple_components/Button";
import {useNavigation} from "@react-navigation/native";
import {useContext, useEffect, useState} from "react";
import TuneDraftContext from "../../contexts/TuneDraftContext";
import ComposerDraftContext from "../../contexts/ComposerDraftContext";
import OnlineDB from "../../OnlineDB";
import dateDisplay from "../../textconverters/dateDisplay";
import {standard, standardDefaults} from "../../types";
import {translateAttrFromStandardTune} from "../../DraftReducers/utils/translate";
import {useQuery, useRealm} from "@realm/react";
import Composer from "../../model/Composer";
import Tune from "../../model/Tune";
import DraftSummary, {DbDraftSummary} from "../../simple_components/DraftSummary";

//TODO: Only display what is different! Like a function-less Compare and change
export default function ConfirmConectionPrompt({
}: {
}){
  const navigation = useNavigation();
  const TDContext = useContext(TuneDraftContext);
  const CDContext = useContext(ComposerDraftContext);
  const isComposer = Object.keys(CDContext).length > 0;
  const tuneQuery = useQuery(Tune);
  const compQuery = useQuery(Composer);
  const realm = useRealm();

  const [duplicateItemFound, setDuplicateItemFound] = useState(false);
  useEffect(() => {
    if(isComposer){
      const filtered = compQuery.filtered("dbId IN $0", CDContext.cd.dbId);
      setDuplicateItemFound(filtered.length > 0);
    }else{
      const filtered = tuneQuery.filtered("dbId IN $0", TDContext.td.dbId);
      setDuplicateItemFound(filtered.length > 0);
    }
  }, [])

  if(duplicateItemFound){
    //TODO:
    //Return special menu with options to handle duplicate
    //I.E. "Delete this one, take me to the other one."
    // Are you sure? this is permanent -> Tune deleted. Want to view the other one?
    //Or: "The other one is connected to the wrong item, let me fix it"
    // Above would take you to the SimilarItemPrompt for the other item. This would mean that SimilarItemPrompt should show the currently editing draft to make things clearer!
    
    const stand = isComposer ? OnlineDB.getComposerById(CDContext.cd.dbId as number) : OnlineDB.getStandardById(TDContext.td.dbId as number)
    return(
      <View>
      <Title></Title>
        <Title>THIS MENU IS STILL IN PROGRESS</Title>
        <Title>Duplicate Item Found</Title>
        <SubText>This {isComposer ? "composer" : "tune"} is already connected on your device! What do you want to do?</SubText>
        <SMarginView>
          <RowView>
            <View>
              <SubBoldText>Version you're connecting to:</SubBoldText>
              <DbDraftSummary dbDraft={stand}/>
            </View>
            <View>
              <SubBoldText>Currently Editing:</SubBoldText>
              <DraftSummary/>
            </View>
            <View>
              <SubBoldText>Other version found on device</SubBoldText>
              <DraftSummary/>
            </View>
          </RowView>
        </SMarginView>
      </View>
    );
  }
  if(isComposer){
    if(!CDContext.cd.dbId){
      return(
        <BgView>
          <Text>Oops!</Text>
          <SubText>This composer doesn't seem to be connected. You shouldn't be on this menu, please email code@jhilla.org if you are able to consistently reach this message even after pressing "Back."</SubText>
          <DeleteButton onPress={()=>{navigation.goBack();}}><ButtonText>Back</ButtonText></DeleteButton>
        </BgView>
      )
    }
    const comp = OnlineDB.getComposerById(CDContext.cd.dbId as number);
    if(!comp){
      return(
        <BgView>
          <Text>Oops!</Text>
          <SubText>We can't reach the composer you just selected. You shouldn't be on this menu, please email code@jhilla.org if you are able to consistently reach this message even after pressing "Back."</SubText>
          <DeleteButton onPress={()=>{navigation.goBack();}}><ButtonText>Back</ButtonText></DeleteButton>
        </BgView>
      )
    }
    return(
      <SafeBgView>
        <SMarginView>
          <Text>How do you want to connect?</Text>
        </SMarginView>
        <Title>{comp.name}</Title>
        <RowView>
          <SubBoldText>Birth-Death:</SubBoldText>
          <SubText>{dateDisplay(comp.birth)}-{dateDisplay(comp.death)}</SubText>
        </RowView>
        <RowView>
          <SubBoldText>Bio: </SubBoldText>
          <SubText>{comp.bio}</SubText>
        </RowView>
        <RowView>
          <DeleteButton style={{flex:1}} onPress={() => {
            CDContext.updateCd("dbId", 0, true);
            navigation.goBack();
          }}>
            <ButtonText>Cancel connection</ButtonText>
          </DeleteButton>
          <DeleteButton style={{flex:1}} onPress={() => {
            CDContext.updateCd("dbId", 0, true);
            navigation.goBack();
            navigation.navigate("SimilarItemPrompt");
          }}>
            <ButtonText>Wrong composer</ButtonText>
          </DeleteButton>
        </RowView>
        <Button text="Connect, ignore changes above" onPress={() => {
          navigation.goBack();
        }}
        />
        <Button text="Fix issues above" onPress={() => {
          //Send to improved Compare and Change}/>
          //
        }}
        />
        <Button text="Accept all changes" onPress={() => {}}/>
      </SafeBgView>
    );
  }else{
    if(!TDContext.td.dbId){
      return(
        <BgView>
          <Text>Oops!</Text>
          <SubText>This tune doesn't seem to be connected. You shouldn't be on this menu, please email code@jhilla.org if you are able to consistently reach this message even after pressing "Back."</SubText>
          <DeleteButton onPress={()=>{navigation.goBack();}}><ButtonText>Back</ButtonText></DeleteButton>
        </BgView>
      )
    }
    const stand = OnlineDB.getStandardById(TDContext.td.dbId as number);
    if(!stand){
      return(
        <BgView>
          <Text>Oops!</Text>
          <SubText>We can't reach the standard you just selected. You shouldn't be on this menu, please email code@jhilla.org if you are able to consistently reach this message even after pressing "Back."</SubText>
          <DeleteButton onPress={()=>{navigation.goBack();}}><ButtonText>Back</ButtonText></DeleteButton>
        </BgView>
      )
    }
    return(
      <SafeBgView>
        <SMarginView>
          <Text>How do you want to connect?</Text>
        </SMarginView>
        <Title>{stand.title}</Title>
        <RowView>
          <SubBoldText>Alternative title: </SubBoldText>
          <SubText>{stand.alternative_title}</SubText>
        </RowView>
        <RowView>
          <SubBoldText>Year:</SubBoldText>
          <SubText>{stand.year}</SubText>
        </RowView>
        <RowView>
          <SubBoldText>Form: </SubBoldText>
          <SubText>{stand.form}</SubText>
        </RowView>
        <RowView>
          <SubBoldText>Bio: </SubBoldText>
          <SubText>{stand.bio}</SubText>
        </RowView>
        <RowView>
          <DeleteButton style={{flex:1}} onPress={() => {
            TDContext.updateTd("dbId", 0, true);


            navigation.goBack();
          }}>
            <ButtonText>Cancel connection</ButtonText>
          </DeleteButton>
          <DeleteButton style={{flex:1}} onPress={() => {
            TDContext.updateTd("dbId", 0, true);
            navigation.goBack();
            navigation.navigate("SimilarItemPrompt");
          }}>
            <ButtonText>Wrong tune</ButtonText>
          </DeleteButton>
        </RowView>
        <Button text="Connect, ignore changes above" onPress={() => {
          navigation.goBack();
        }}
        />
        <Button text="Fix issues above" onPress={() => {
          navigation.goBack();
          navigation.navigate("Compare");
        }}
        />
          <Button text="Accept all changes"
            onPress={() => {
              //Accept all entries that don't include id or composer_placeholder.
              const excludeList = ["id", "composer_placeholder"];
              const modifiedStdDefaults = new Map(Array.from(standardDefaults.entries()).filter((ent) => !excludeList.includes(ent[0])));
              for(const a in stand){
                const attr = a as keyof standard;
                if(modifiedStdDefaults.has(attr)){
                  const newEntry = translateAttrFromStandardTune(attr, stand[attr], compQuery, realm)[0];
                  TDContext.updateTd(newEntry[0], newEntry[1]);
                }
              }
              navigation.goBack();
            }}
          />
      </SafeBgView>
    )
  }
}
