import {composer_draft_context_t} from "../../contexts/ComposerDraftContext";
import {tune_draft_context_t} from "../../contexts/TuneDraftContext";
import {standard, standard_composer} from "../../types";

type draft_context_t = tune_draft_context_t | composer_draft_context_t;
export function findDifferences(draftContext: draft_context_t, std: standard | standard_composer){
  if("cd" in draftContext){
    //3 cases to target:
    //1: key exists in local but not in standard
    //2: key exists in both, but value is different (what does different mean in special cases?)
    //3: key exists in standard, but not local
    //Make a list of keys that should exist in both, and translate to standard key
    //Does this call for version numbers in drafts and tunes/composers?

  }
}
