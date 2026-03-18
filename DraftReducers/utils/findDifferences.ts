import {Results} from "realm";
import {composer_draft_context_t} from "../../contexts/ComposerDraftContext";
import {tune_draft_context_t} from "../../contexts/TuneDraftContext";
import {standard, standard_composer} from "../../types";
import {translateAttrFromStandardTune, translateKeyFromLocal} from "./translate";
import Composer from "../../model/Composer";
import { Realm } from "realm";

type draft_context_t = tune_draft_context_t | composer_draft_context_t;

export function findDifferences(draftContext: draft_context_t, std: standard | standard_composer, composerQuery: Results<Composer> | undefined, realm: Realm){
  if("cd" in draftContext){
    //3 cases to target:
    //1: key exists in local but not in standard
    //2: key exists in both, but value is different (what does different mean in special cases?)
    //3: key exists in standard, but not local
    //Make a list of keys that should exist in both, and translate to standard key
    //Does this call for version numbers in drafts and tunes/composers?
  }else{
    const allKeys = new Set<string>([...Object.keys(draftContext.td)]);
    for(const stdKeyStr in std){
      const stdKey = stdKeyStr as keyof standard;
      const translations = translateAttrFromStandardTune(stdKey as keyof standard, std[stdKey], composerQuery, realm)
      for(const trns of translations){
        allKeys.add(trns[0]);
      }
    };
    for(const attr of allKeys){
    }
  }
}
