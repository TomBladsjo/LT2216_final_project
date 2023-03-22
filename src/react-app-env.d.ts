/// <reference types="react-scripts" />

declare module "react-speech-kit";
declare module "web-speech-cognitive-services/lib/SpeechServices/TextToSpeech";
declare module "web-speech-cognitive-services/lib/SpeechServices/SpeechToText";

interface Hypothesis {
  utterance: string;
  confidence: number;
}

interface MySpeechSynthesisUtterance extends SpeechSynthesisUtterance {
  new (s: string);
}

interface MySpeechRecognition extends SpeechRecognition {
  new (s: string);
}

interface Parameters {
  ttsVoice: string;
  ttsLexicon: string;
  asrLanguage: string;
  azureKey: string;
/*   azureNLUKey: string;
  azureNLUUrl: string;
  azureNLUprojectName: string;
  azureNLUdeploymentName: string; */
}

interface ChatInput {
  past_user_inputs: string[];
  generated_responses: string[];
  text: string;
}

/* interface Card {
  // link?: string (eg 1232.png)
  // identifyer! (name? or smth else. Can the asr recognise Fnarglebleep? No it can't!)
  id: any | undefined;
  item: number | undefined;
  horns: number | undefined;
  colour: number | undefined;
  pinkBow: number | undefined;
  eyes: number | undefined;
} */


interface Card {
  [index: string]: number | string;
}

interface Property {
  feature: string;
  value: number; 
}


interface SDSContext {
  parameters: Parameters;
  asr: SpeechRecognition;
  tts: SpeechSynthesis;
  voice: SpeechSynthesisVoice;
  ttsUtterance: MySpeechSynthesisUtterance;
  recResult: Hypothesis[];
 /*  nluResult: any; */
  ttsAgenda: string;
  azureAuthorizationToken: string;
  audioCtx: any;

  topic: any;

  turnCount: number;
  promptCount: number;
  noMatchCount: number;
  asrHypothesis: Hypothesis;


  // Implement later if I have time:
  // nCards: number; // Default: 20? User can say "change n of cards" and specify other. Affects difficulty.

  gameNr: number;

  names: {[index: string]: string};
  //  Image URLs:
  deck: string[];
  userImages: string[];  // The list of displayed images the user guesses based on. (eg ['11111.png', '12212.png', etc])
  userCard: string;  // The user's card, that the computer has to guess. Displayed. (eg '11001.png')
  
  // Abstract card representations:
  computerImages: Card[];  // The list of cards the computer guesses based on. Starts out representing the same images as userImages. Items removed when eliminated?
  computerCard: Card;  // The computer's card, that the user has to guess.
  // cardHypothesis: Card;  // The computer's knowledge about the user's card. Starts with all values as undefined, updates after each round. 

  currentProperty: Property;
  nextQuestion: string;

  yourTurn: string[];
  myTurn: string[];
  yourTurnReprompts: string[];
  noResponseReprompts: string[];
  noMatch: string[];
  noMatchOOV: string[];
  
}

type SDSEvent =
  | { type: "TTS_READY" }
  | { type: "TTS_ERROR" }
  | { type: "CLICK" }
  | { type: "SELECT"; value: any }
  | { type: "STARTSPEECH" }
  | { type: "RECOGNISED" }
  | { type: "ASRRESULT"; value: Hypothesis[] }
  | { type: "ENDSPEECH" }
  | { type: "LISTEN" }
  | { type: "TIMEOUT" }
  | { type: "SPEAK"; value: string };
