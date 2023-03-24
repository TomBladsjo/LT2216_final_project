import { MachineConfig, send, Action, assign, Machine } from "xstate";


////////////////////////// functions etc /////////////////////////////
interface Names {
  [index: string]: string;
}

const names: Names = {'00002.png': 'Ruby', '00101.png': 'Rosie', '00113.png': 'Daisy', 
'00212.png': 'Charlie', '00301.png': 'Molly', '00302.png': 'Willow', '00303.png': 'Bear', '01002.png': 'Roxy', 
'01111.png': 'Toby', '01113.png': 'Frankie', '01212.png': 'Honey', '01301.png': 'Ollie', '01302.png': 'Penny', 
'01303.png': 'Buster', '10001.png': 'Dolly', '10002.png': 'Bo', '10013.png': 'Cookie', '10101.png': 'Rex', 
'10102.png': 'Lulu', '10201.png': 'Riley', '10203.png': 'Finn', '10312.png': 'Lucky', '11011.png': 'Sam', 
'11013.png': 'Roddy', '11102.png': 'Cricket', '11201.png': 'Stardust', '11203.png': 'Ellie', '11312.png': 'Jax', 
'20002.png': 'Rudy', '20103.png': 'Joey', '20111.png': 'Rusty', '20202.png': 'Benny', '20301.png': 'Doddy', 
'20303.png': 'Ace', '21012.png': 'Clover', '21101.png': 'Moose', '21103.png': 'Sunny', '21202.png': 'Cody', 
'21311.png': 'Dixie', '21313.png': 'Buttercup', '30003.png': 'Ping', '30011.png': 'Trixie', '30102.png': 'Bob', 
'30201.png': 'River', '30203.png': 'Sage', '31001.png': 'Bubba', '31003.png': 'Levi', '31112.png': 'Foxy', 
'31211.png': 'Angel', '31213.png': 'Angus'};

const allCards: string[] = ['00002.png', '00101.png', '00113.png', 
'00212.png', '00301.png', '00302.png', '00303.png', '01002.png', 
'01111.png', '01113.png', '01212.png', '01301.png', '01302.png', 
'01303.png', '10001.png', '10002.png', '10013.png', '10101.png', 
'10102.png', '10201.png', '10203.png', '10312.png', '11011.png', 
'11013.png', '11102.png', '11201.png', '11203.png', '11312.png', 
'20002.png', '20103.png', '20111.png', '20202.png', '20301.png', 
'20303.png', '21012.png', '21101.png', '21103.png', '21202.png', 
'21311.png', '21313.png', '30003.png', '30011.png', '30102.png', 
'30201.png', '30203.png', '31001.png', '31003.png', '31112.png', 
'31211.png', '31213.png'];

interface Grammar {
  [property: string]: {
    [value: number]: string;
  };
}

const grammar: Grammar = {
  item: {
    0: '',
    1: 'violin',
    2: 'mushroom',
    3: 'flute',
  },
  colour: {
    0: 'blue',
    1: 'green',
    2: 'red',
    3: 'yellow',
  },
  eyes: {
    1: '1',
    2: '2',
    3: '3',
  },
};


// general functions:

function say(text: string): Action<SDSContext, SDSEvent> {
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }));
  }

function shuffle(arr: Array<any>) {
  return [...arr].sort(() => 0.5 - Math.random());
  }


// initialising game:
  
const getCardData = (imageName: string) => {
    let code = imageName.replace(/\.png$/g, "");
    const card: Card = {
        name: names[imageName],
        item: Number(code[0]),
        horns: Number(code[1]),
        colour: Number(code[2]),
        pinkBow: Number(code[3]),
        eyes: Number(code[4]),
    }
    return card
};

const initCards = (cardList: Array<string>) => {
  let cardsInGame = [];
  for (let card of cardList) {
    cardsInGame.push(getCardData(card))
  };
  return shuffle(cardsInGame)
};


// computer's turn

const relevantProperty = (context: SDSContext) => {
  let cards = context.computerImages;
  const features: Array<string> = ['item', 'horns', 'colour', 'pinkBow', 'eyes'];
  for (let f of shuffle(features)) {
      let val = cards[0][f]
      for (let card of cards) {
        if (card[f] != val) {
          let prop: Property = {
            feature: f,
            value: val as number,
          };
          return prop
      }
    }
  }
  return false;
};

const question = (property: Property) => {   // In this function, the shuffle functions get called anew each time I reenter the state where it's called.
  const isVariations = ['Is it', 'Is yours', 'Is your fnarg'];
  const doesVariations = ['Does it', 'Does yours', 'Does your fnarg'];
  let f = property.feature;
  let v = property.value;
  if (f == 'item') {
    if (v == 0) {
      return `${shuffle(isVariations)[0]} empty-handed? I mean, tentacled?`;
    } else {
      let item = grammar.item[v];
      return `${shuffle(isVariations)[0]} holding a ${item}?`;
    }
  }
  if (f == 'horns') {
    return `${shuffle(doesVariations)[0]} have horns?`;
  }
  if (f == 'colour') {
    let colour = grammar.colour[v];
    return `${shuffle(isVariations)[0]} ${colour}?`;
  }
  if (f == 'pinkBow') {
    return `${shuffle(doesVariations)[0]} have a pink bow on its head?`;
  }
  if (f == 'eyes') {
    if (v == 1) {
      return `${shuffle(doesVariations)[0]} have only one eye?`;
    } else {
      return `${shuffle(doesVariations)[0]} have ${v} eyes?`;
    }
  }
};

const filterCards = (context: SDSContext, yesno: string | undefined) => {
  let allCards = context.computerImages;
  let relevantCards = Array<Card>()
  let f = context.currentProperty.feature;
  let v = context.currentProperty.value;
  if (f in grammar) {
  if (yesno == 'yes') {
    for (let card of allCards) {
      if (card[f] = v) {
        relevantCards.push(card)
      }
    }
  } else { if (yesno == 'no') {
    for (let card of allCards) {
      if (card[f] != v) {
        relevantCards.push(card)
      }
    }
  }
  }
  } else {
    if (yesno == 'yes') {
      for (let card of allCards) {
        if (card[f] == 1) {
          relevantCards.push(card)
        }
      }
    } else { if (yesno == 'no') {
      for (let card of allCards) {
        if (card[f] == 0) {
          relevantCards.push(card)
        }
      }
    }
    }
  }
  return relevantCards;
};


// asr confidence threshold:

const asrTreshold = (context: SDSContext) => {
  let confidence = context.asrHypothesis.confidence;
  if (confidence >= 0.7){
    return true
  } else { 
    return false
  }
};


// nlu(ish):
// (guard functions etc)

const help = (context:SDSContext) => {
  let u = context.recResult[0].utterance.toLowerCase().replace(/\.$/g, "");
  const reHelp = /help/;
  if (u.match(reHelp)) {
    return true;
  } else {
    return false;
  }
}

const nameGuess = (context: SDSContext) => {
  let u = context.recResult[0].utterance.toLowerCase();
  for (let image of context.userImages) {
    if (u.includes(names[image].toLowerCase())) {
      return names[image];
    }
  } 
  return false;
}

const checkName = (context: SDSContext, name: string) => {
  let trueName = context.computerCard.name as string
  return name == trueName
}

const yesNoResponse = (context: SDSContext) => {
  let u = context.recResult[0].utterance.toLowerCase().replace(/\.$/g, "");
  const reYes = /(yes|yep|yup|sure|definitely|absolutely|yeah)/;
  const reNo = /(no|n't|never)/;
  if (u.match(reYes) && !u.match(/not/)) {
    return "yes";
  } else if (u.match(reNo)) {
    return "no";
  }
  return false;
};

const isYesNoQuestion = (context: SDSContext) => {
  let u = context.recResult[0].utterance.toLowerCase().replace(/\.$/g, "");
  const reYesNo = /(^is|^does|^has|^are|^do|^have)/g;
  if (u.match(reYesNo)) {
    return true;
  } else {
    return false;
  }
}

const aboutGender = (context: SDSContext) => {
  let u = context.recResult[0].utterance.toLowerCase().replace(/\.$/g, "");
  const reGender = /(girl|female|woman|boy|man|male)/;
  if (u.match(reGender)) {
    return true;
  } else {
    return false;
  }
}


const understandAndCheck = (context: SDSContext) => {

  const reColour = /(blue|green|red|yellow)/
  const reItem = /(hold|have|carry)(\w|\s)*(violin|flute|mushroom|instrument|something|anything|item|object|thing)/g
  const reOnHead = /(something|anything)(\w|\s)*?on(\w|\s)*?head/
  const reEyes =  /(single|one|1|two|2|three|3) eye/

  let u = context.recResult[0].utterance.toLowerCase().replace(/\.$/g, "");
  let card = context.computerCard;

  if (u.match(reColour)) {
      let askVal = u.match(reColour)![1];
      let trueVal = card.colour;
      if (grammar.colour[trueVal as number] == askVal) {
        return 'yes';
      } else {
        return 'no';
      }
  } 
  if (u.match(reEyes)) {
    let trueVal = card.eyes;
    if (u.match(/(single|one|1)/) && !u.match(/more/)) {
      if (trueVal == 1) {
        return 'yes';
      } else {
        return 'no';
      }
    } 
    if (u.match(/(two|2)/)) {
      if (trueVal == 2) {
        return 'yes';
      } else {
        return 'no';
      }
    }
    if (u.match(/(three|3)/)) {
      if (trueVal == 3) {
        return 'yes';
      } else {
        return 'no';
      }
    }
    if (u.match(/more than one/)) {
      if (trueVal != 1) {
        return 'yes';
      } else {
        return 'no';
      }
    }
  }
  if (u.match(reItem) && !u.match(/head/)) {
    let specItem = /(violin|flute|mushroom)/
    let trueVal = card.item;
    if (u.match(specItem)) {
      let askVal = u!.match(specItem)![1];
      if (grammar.item[trueVal as number] == askVal) {
        return 'yes';
      } else {
        return 'no';
      }
    }
    if (u.match(/instrument/)) {
      if (trueVal == 1 || trueVal == 3) {
        return 'yes';
      } else {
        return 'no';
      }
    } else {
      if (trueVal == 0) {
        return 'no';
      } else {
        return 'yes';
      }
    }
  }
  if (u.match(/horns/)) {
    let trueVal = card.horns;
    if (trueVal == 1) {
      return 'yes';
    } else {
      return 'no';
    }
  }
  if (u.match(/(pink\sbow|pink|bow)/)) {
    let trueVal = card.pinkBow;
    if (trueVal == 1) {
      return 'yes';
    } else {
      return 'no';
    }
  }
  if (u.match(reOnHead)) {
    if (card.horns == 1 || card.pinkBow == 1) {
      return 'yes';
    } else {
      return 'no';
    }
  }
  else {
    return false;
  }
}

////////////////////////// text material and utterance functions ////////////////////////////

const helpText = `You are playing this game against me, the computer. We each have an identical set of 26 fnargs, one of which is our special fnarg. For you, this fnarg is displayed at the top of the screen. Your job is to guess which of the 26 fnargs is my special fnarg, before I guess which is yours. To do this, we will take turns asking each other yes no questions, such as "is your fnarg blue?" or "is it carrying an item?". If you manage to name my special fnarg first, you have won. Hover the cursor over the fnarg images to see their names. Good luck!`;
const yourTurn = ['Ok, your turn!', 'Your turn!', 'Hmm, ok...', 'Aha!', 'Hmm, I see...', 'Oh, really? Hmm...', 'Hmm, ok...', 'Ok...']; 
const myTurn = ['Ok, my turn!', 'My turn!', 'Alright, my turn!']; 
const yourTurnReprompts = ['Your turn!', "Hey, it's your turn!", "It's your turn!", "Your turn, ask me something!", "Hey, don't fall asleep! It's your turn!", "It's your turn to ask!", "Come on, ask me a question!", "Don't think too much, just ask something!", "Go on, it's your turn!"];
const noResponseReprompts = ['Did you fall asleep?', 'Answer the question.', 'Hello?', 'Are you still there?', 'Hey, I asked you a question?', 'Answer the question please.', 'Hello?'];
const noMatch = ["I don't think I heard you properly. Could you repeat that?", "I'm sorry, what did you say?", "Excuse me?", "Sorry, I didn't catch that.", "Sorry, what?", "Could you repeat that? I don't think I heard you properly."];
const noMatchOOV = ["I don't know that.", "I don't know, you will have to ask about something else.", "I don't understand the question. Try something else.", "I don't know. If you want to win, you have to ask better questions!", "I don't know, and I'm pretty sure that's not a relevant question. Try again.", "I don't know. Are you sure that's a relevant question?"];
const noMatchYesnoQuestion = noMatch.concat(["I don't understand. Are you sure that was a yes no question?", "Remember, you can only ask yes no questions!", "Hey, the question has to be something I can answer yes or no to!"]);
const noMatchYesNo = noMatch.concat(["Was that a yes?", "Was that a yes?", "Did you say yes?", "Was that a yes?"]);
const noInputGoodbye = ['Alright, suit yourself.', 'Ok, bye.', 'Ok, goodbye.', 'Ok, goodbye then', 'Fine.'];
let yourturn = shuffle(yourTurn);


const sayMyTurn = (context: SDSContext) => {
  if (context.turnCount > 0) {
    if (Math.random() > 0.4 ) {
      return shuffle(myTurn)[0];
    }
  } else {
    return '';
  }
}


const sayUserCard = (context: SDSContext) => {
  const firstGame = 'Alright! This is your fnarg, that I will try to guess. You can see its name under the image.';
  const variations = ['Alright, here is your fnarg!', 'This is your fnarg!', "Here is your new fnarg!", "Alright, here is your new special fnarg!", "Ok, here is another fnarg for you!", "Here is your new best friend!"];
  if (context.gameNr == 1) {
    return firstGame;
  } else {
    return shuffle(variations)[0]; 
  }
};

const sayUserImages = (context: SDSContext) => {
  const firstGame = 'And here are all its friends. Hover over them to see their names. Can you guess which one is mine?';
  const variations = ['And here are all the others!', 'And here are its friends!', 'And here are the rest of them!', 'And the rest of them!', 'And all its little friends!'];
  const rememberHelp = ` Remember that you can say help at any time to get a quick recap of the rules.`
  if (context.gameNr == 1) {
    return firstGame;
  }
  if (context.gameNr % 2 == 0) {
    return shuffle(variations)[0]+rememberHelp
  } else {
    return shuffle(variations)[0];
  }
};

const sayNoMatch = (context: SDSContext, version: 'yesnoResponse' | 'notYesnoQuestion' | 'outOfVocab') => {
  const lateNoMatch = `I still don't understand. You have to remember that I am just a stupid computer. Be kind to me please!`;
  const finalNoMatch = `Ok, now you're just messing with me!`;
  if (context.noMatchCount < 4) {
    if (version == 'yesnoResponse') {
      return shuffle(noMatchYesNo)[0];
    } 
    if (version == 'notYesnoQuestion') {
      return shuffle(noMatchYesnoQuestion)[0];
    }
    if (version == 'outOfVocab') {
      return shuffle(noMatchOOV)[0];
    }
  } 
  if (context.noMatchCount == 4) {
    if (version == 'outOfVocab') {
      return "Hey, be kind to me, I am just a stupid computer!";
    }
    return lateNoMatch;
  } 
  if (context.noMatchCount == 5) {
    return finalNoMatch;
  }
}


/////////////////////////////////// machine ///////////////////////////////////


export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = {
  initial: "idle",
  states: {
    idle: {
      id: "idle",
      on: {
        CLICK: "init",
      },
    },
    init: {
      entry: assign({deck: shuffle(allCards)}),
      on: {
        TTS_READY: "#welcome", 
        CLICK: "#welcome", 
      },
    },
    help: {
      id: "help",
      entry: say(helpText),
      on: { ENDSPEECH: "game.history" },
      },
    noInputGoodbye: {
      id: "noInputGoodbye",
      entry: say(shuffle(noInputGoodbye)[0]),
      on: {ENDSPEECH: "#idle"}
    },
    welcome: {
        id: "welcome",
        entry: [assign({noMatchCount: 0}), assign({promptCount: 0})],
        initial: "prompt",
        on: {
          RECOGNISED: [
            {
              target: ".startGame",
              cond: (context) => yesNoResponse(context) == 'yes',
            },
            {
              target: ".explainRules",
              cond: (context) => yesNoResponse(context) == 'no',
            },
            {
              target: ".nomatch",
              cond: (context) => context.noMatchCount < 6,
            },
            {
              target: "#noInputGoodbye"
            }
          ],
          TIMEOUT: [
            {
              target: "#noInputGoodbye",
              cond: (context) => context.promptCount > 5
            },
            {
              target: ".reprompt1",
              cond: (context) => context.promptCount % 2 == 1
            },
            {
              target: ".reprompts",
            }
          ],
        },
        states: {
          prompt: {
            entry: say('Hi! Welcome to the Fnargs game! Have you played this game before?'),
            on: {ENDSPEECH: "ask"},
          },
          reprompt1: {
            entry: say('Have you played this game before?'),
            exit: assign({promptCount: (context) => context.promptCount +1}),
            on: {ENDSPEECH: "ask"},
          },
          reprompts: {
            entry: say(shuffle(noResponseReprompts)[0]),  // Shuffle returns same reprompt when reentering the state
            exit: assign({promptCount: (context) => context.promptCount +1}),
            on: {ENDSPEECH: "ask"},
          },
          nomatch: {
            entry: send((context) => ({
              type: "SPEAK", 
              value: sayNoMatch(context, 'yesnoResponse') // Shuffle returns same reprompt when reentering the state (I think?)
            })),
            exit: assign({noMatchCount: (context) => context.noMatchCount +1}),
            on: {ENDSPEECH: "reprompt1"},
          },
          ask: {
            entry: send('LISTEN'),
          },
          explainRules: {
              entry: say(`Ok! Then I will quickly explain the rules before we begin. ${helpText}`),
              on: {ENDSPEECH: "#game"},
          },
          startGame: {
            entry: say("Ok! If you are unsure of the rules at any point during the game, just say help and I will repeat them for you."),
            exit: assign({gameNr: 1}),
            on: {ENDSPEECH: "#game"},
          },
        },
    },
    game: {
    id: "game",
    initial: "newGame",
    states: {
      history: {
        type: 'history',
        history: 'deep'
      },
    newGame: {
      id: "newGame",
      initial: "init",
      states: {
        init: {
          entry: [
            assign({names: names}),
            assign({deck: (context) => shuffle(context.deck)}),
            assign({userCard: (context) => context.deck[0]}),
            assign({userImages: (context) => context.deck.slice(1, 26)}),
            assign({computerImages: (context) => initCards(context.userImages)}),
            assign({computerCard: (context) => context.computerImages.pop() as Card}),
            assign({computerImages: (context) => context.computerImages.concat(getCardData(context.userCard))}),
            assign({currentProperty: (context) => relevantProperty(context) as Property}),
            assign({turnCount: 0}),
            assign({yourTurn: shuffle(yourTurn)}),
            assign({myTurn: shuffle(myTurn)}),
          ],
          always: {
            target: "userCard",
          } ,
          },
        userCard: {
          entry: ["displayUserCard",
          send((context) => ({
            type: "SPEAK",
            value: sayUserCard(context),
          }))],
          on: {ENDSPEECH: "allImages"},
          },
        allImages: {
          entry: [
            "displayImages",
            send((context) => ({
              type: "SPEAK",
              value: sayUserImages(context),
            }))],
            on: {ENDSPEECH: "#userTurn"},
            },
          },
        },
        computerTurn: {
          id: "computerTurn",
          entry: ["computerTurn", assign({turnCount: (context) => context.turnCount + 1}), assign({myTurn: (context) => shuffle(context.myTurn)})],
          initial: "first",
          states: {
            first: {
              always: [
                {
                  target: "turnChange",
                  cond: (context) => Math.random() > 0.7,  // random seems to re-use result when reentering the state 
                },
                {
                  target: "statusCheck",
                },
              ],
            },
            turnChange: {
              entry: send((context) => ({
                type: "SPEAK",
                value: shuffle(context.myTurn)[0],
              })),
              on: {ENDSPEECH: "statusCheck"},
            },
            statusCheck: {
              always: [
                {target: "computerAsk",
                cond: (context) => context.computerImages.length > 1,
                actions: assign({nextQuestion: (context) => question(context.currentProperty) as string}),
              },
                {target: "computerGuess",
                cond: (context) => context.computerImages.length == 1},
              ], 
            },
            computerAsk: {
              entry: [assign({noMatchCount: 0}),assign({promptCount: 0})],
          initial: "prompt",
          on: {
            RECOGNISED: [
              {
                target: "#help",
                cond: (context) => help(context),
              },
              {
                target: "#userTurn",
                cond: (context) => !!yesNoResponse(context),
                actions: [assign({computerImages: (context) => filterCards(context, yesNoResponse(context) as string)}), 
                  assign({currentProperty: (context) => relevantProperty(context) as Property})  // relevantProperty function seems to actually reshuffle each time
                ], 
              },
              {
                target: ".nomatch",
                cond: (context) => context.noMatchCount < 6,
              },
              {
                target: "#noInputGoodbye"
              },
            ],
            TIMEOUT: [
              {
                target: "#noInputGoodbye",
                cond: (context) => context.promptCount > 4
              },
              {
                target: ".prompt",
                cond: (context) => context.promptCount % 2 == 1
              },
              {
                target: ".reprompt",
              }
            ],
          },
          states: {
            prompt: {
              entry: send((context) => ({
                type: "SPEAK",
                value: context.nextQuestion,
              })),
              exit: assign({promptCount: (context) => context.promptCount +1}),
              on: { ENDSPEECH: "ask" },
            },
            reprompt: {
              entry: say(shuffle(noResponseReprompts)[0]),  // Shuffle returns same reprompt when reentering the state
              exit: assign({promptCount: (context) => context.promptCount +1}),
              on: {ENDSPEECH: "ask"},
            },
            ask: {
              entry: send("LISTEN"),
            },
            nomatch: {
              entry: send((context) => ({
                type: "SPEAK", 
                value: sayNoMatch(context, 'yesnoResponse') // Function returns same reprompt when reentering the state
              })),
              exit: assign({noMatchCount: (context) => context.noMatchCount +1}),
              on: { ENDSPEECH: "ask" },
            }
          },
        },
        computerGuess: {
          entry: [assign({noMatchCount: 0}), assign({promptCount: 0})],
          initial: "guess",
          on: {
            RECOGNISED: [
              {
                target: "#help",
                cond: (context) => help(context),
              },
              {
                target: ".wasRight",
                cond: (context) => yesNoResponse(context) == 'yes',
              },
              {
                target: ".wasWrong",
                cond: (context) => yesNoResponse(context) == 'no',
              },
              {
                target: ".nomatch",
                cond: (context) => context.noMatchCount < 6,
              },
              {
                target: "#noInputGoodbye",
              },
            ],
            TIMEOUT: [
              {
                target: "#noInputGoodbye",
                cond: (context) => context.promptCount > 4
              },
              {
                target: ".guess",
                cond: (context) => context.promptCount % 2 == 0
              },
              {
                target: ".reprompt",
              }
            ],
          },
          states:
          {
            guess: {
              entry: send((context) => ({
                type: "SPEAK",
                value: `Is it ${context.computerImages[0].name}?`,
              })),
              exit: assign({promptCount: (context) => context.promptCount +1}),
              on: { ENDSPEECH: "ask" },
            },
            reprompt: {
              entry: say(shuffle(noResponseReprompts)[0]),  // Shuffle returns same reprompt when reentering the state
              exit: assign({promptCount: (context) => context.promptCount +1}),
              on: {ENDSPEECH: "ask"},
            },
            ask: {
              entry: send("LISTEN"),
            },
            wasRight: {
              entry: [say("Yay, I won!"), "computerWin"],
              on: {ENDSPEECH: "#result"},
            },
            wasWrong: {
              initial: "prompt",
              on: { RECOGNISED: [
                {
                  target: ".no",
                  cond: (context) => yesNoResponse(context) == 'no',
                },
                {
                  target: ".yes",
                  cond: (context) => yesNoResponse(context) == 'yes',
                },
                {
                  target: ".bye",
                },
              ],
              TIMEOUT: ".bye",
              },
              states: {
                prompt: {
                  entry: say(`But... based on what you said, there is only one fnarg it could be! Did you lie to me?`),
                  on: {ENDSPEECH: "ask"},
                },
                ask: {
                  entry: send("LISTEN"),
                },
                no: {
                  entry: say("I don't believe you."),
                  on: {ENDSPEECH: "bye"},
                },
                yes: {
                  entry: say("How could you!"),
                  on: {ENDSPEECH: "bye"},
                },
                bye: {
                  entry: say("You're a rotten liar and I don't wanna play with you anymore."),
                  exit: "removeCards",
                  on: {ENDSPEECH: "#idle"}
                }
              },
            },
            nomatch: {
              entry: send((context) => ({
                type: "SPEAK", 
                value: sayNoMatch(context, 'yesnoResponse')
              })),
              exit: assign({noMatchCount: (context) => context.noMatchCount +1}),
              on: {ENDSPEECH: "ask"},
            },
          },
        },
      },
    },
    userTurn: {
      id: "userTurn",
      entry: ["userTurn", assign({noMatchCount: 0}), assign({promptCount: 0}), assign({yourTurn: (context) => shuffle(context.yourTurn)})],
      initial: "first",
      on: {
        RECOGNISED: [
          {
            target: "#help",
            cond: (context) => help(context),
          },
          {
            target: ".respond",
            cond: (context) => isYesNoQuestion(context),
          },
          {
            target: ".nomatch",
            cond: (context) => context.noMatchCount < 6,
          },
          {
            target: "#noInputGoodbye",
          },
        ],
        TIMEOUT: [
          {
            target: ".reprompt",
            cond: (context) => context.promptCount < 4,
          },
          {
            target: "#noInputGoodbye",
          },
      ]
      },
      states:{
        first: {
          always: [
            {
              target: "ask",
              cond: (context) => context.turnCount < 1,
            },
            {
              target: "prompt",
            },
          ],
        },
        prompt: {
          entry: send((context) => ({
            type: "SPEAK",
            value: shuffle(context.yourTurn)[0],
          })),
          on: {ENDSPEECH: "ask"}
        },
        ask: {
          entry: send("LISTEN"),
        },
        respond: {
          initial: "interpret",
          states: {
            interpret: {
              always: [
                {
                  target: "yesno",
                  cond: (context) => !!understandAndCheck(context),
                },
                {
                  target: "userGuess",
                  cond: (context) => !!nameGuess(context),
                },
                {
                  target: "gender",
                  cond: (context) => aboutGender(context),
                },
                {
                  target: "nomatch",
                  cond: (context) => context.noMatchCount < 6,
                },
                {
                  target: "#noInputGoodbye",
                },
              ],
            },
            yesno: {
              entry: send((context) => ({
                type: "SPEAK",
                value: understandAndCheck(context),
              })),
              on: { ENDSPEECH: "#computerTurn" },
            },
            userGuess: {
              initial: "check",
              states: {
                check: {
                  always: [
                    {
                      target: "yes",
                      cond: (context) => checkName(context, nameGuess(context) as string),
                    },
                    {
                      target: "no",
                    },
                  ],
                },
                no: {
                  entry: say('No, sorry,'),
                  on: {ENDSPEECH: "#computerTurn"},
                },
                yes: {
                  entry: [say("Congratulations, you won!"), "userWin"],
                  on: {ENDSPEECH: "#result"}
                }
              },
            },
            gender: {
              entry: say("Fnargs have not invented the cultural concept of gender. All fnargs are fnargs."),
              on: { ENDSPEECH: "#computerTurn" },
            },
            nomatch: {
              entry: send((context) => ({
                type: "SPEAK", 
                value: sayNoMatch(context, 'outOfVocab')
              })),
              exit: assign({noMatchCount: (context) => context.noMatchCount +1}),
              on: { ENDSPEECH: "#userTurn.ask" },
            },
          },
        },
        reprompt: {
          entry: say(shuffle(yourTurnReprompts)[0]),  // Shuffle returns same reprompt when reentering the state
          exit: assign({promptCount: (context) => context.promptCount +1}),
          on: { ENDSPEECH: "ask" },
        },
        nomatch: {
          entry: send((context) => ({
            type: "SPEAK", 
            value: sayNoMatch(context, 'notYesnoQuestion')
          })),
          exit: assign({noMatchCount: (context) => context.noMatchCount +1}),
          on: { ENDSPEECH: "ask" },
        },
      },
    },
    result: {
      entry: ["removeCards", assign({noMatchCount: 0}), assign({promptCount: 0})],
      id: "result",
      initial: "prompt",
      on: {RECOGNISED: [
        {
          target: "#newGame",
          cond: (context) => yesNoResponse(context) == 'yes',
          actions: assign({gameNr: (context) => context.gameNr+1}),
        },
        {
          target: ".goodbye",
          cond: (context) => yesNoResponse(context) == 'no',
        },
        {
          target: ".nomatch",
          cond: (context) => context.noMatchCount < 5,
        },
        {
          target: "#noInputGoodbye",
        },
      ],
      TIMEOUT: [
        {
          target: "#noInputGoodbye",
          cond: (context) => context.promptCount > 4
        },
        {
          target: ".reprompt1",
          cond: (context) => context.promptCount % 2 == 1,
        },
        {
          target: ".reprompts",
        },
      ],
      ENDSPEECH: ".ask",
    },
      states: {
        prompt: {
          entry: say(`That was fun! Do you want to play again?`),
          exit: assign({promptCount: (context) => context.promptCount +1}),
        },
        reprompt1: {
          entry: say("Do you want to play again?"),
          exit: assign({promptCount: (context) => context.promptCount +1}),
        },
        reprompts: {
          entry: say(shuffle(noResponseReprompts)[0]),  // Shuffle returns same reprompt when reentering the state
          exit: assign({noMatchCount: (context) => context.noMatchCount +1}),
        },
        ask: {
          entry: send("LISTEN"),
        },
        nomatch: {
          entry: send((context) => ({
            type: "SPEAK", 
            value: sayNoMatch(context, 'yesnoResponse')  
          })),
          exit: assign({noMatchCount: (context) => context.noMatchCount +1}),
          on: {ENDSPEECH: "ask"},
        },
        goodbye: {
          entry: say("Alright. It's been fun playing with you! Come back soon!"),
          on: {ENDSPEECH: "#idle"},
        },
      },
    },
      },
    },
  },
};


/* 
So, as you see, there are several places where the shuffle function does not 
seem to be called again when the machine reenters a state. I am not entirely 
sure about all of these, because to be honest I ended up spending way more
time on development than on testing, and that stuff takes time. In the end, I 
just solved the most annoying things by assigning and reassigning them to the 
context, but ideally I don't want to clutter up my context with every possible 
utterance at all times. 
*/














