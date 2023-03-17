import { MachineConfig, send, Action, assign, Machine } from "xstate";


////////////////////////// functions etc /////////////////////////////

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
        id: Number(code),
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

const unknownCard = () => {
    let card: Card = {
        item: undefined,
        horns: undefined,
        colour: undefined,
        pinkBow: undefined,
        eyes: undefined,
    }
    return card
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

const question = (property: Property) => {
  let f = property.feature;
  let v = property.value;
  if (f == 'item') {
    if (v == 0) {
      return "Is it empty-handed? I mean, tentacled? Whatevered?";
    } else {
      let item = grammar.item[v];
      return `Is it holding a ${item}?`;
    }
  }
  if (f == 'horns') {
    return "Does it have horns?";
  }
  if (f == 'colour') {
    let colour = grammar.colour[v];
    return `Is it ${colour}?`;
  }
  if (f == 'pinkBow') {
    return "Does it have a pink bow on its head?";
  }
  if (f == 'eyes') {
    if (v == 1) {
      return "Does it have only one eye?";
    } else {
      return `Does it have ${v} eyes?`;
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




// nlu:

// - guard functions:

const yesNoResponse = (context: SDSContext) => {
  let u = context.recResult[0].utterance.toLowerCase().replace(/\.$/g, "");
  const reYes = /yes/;
  const reNo = /no/;
  if (u.match(reYes)) {
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



// - long and messy nlu function 

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
    if (u.match(/(single|one|1)/)) {
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


/////////////////////////////////// machine ///////////////////////////////////



export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = {
  initial: "idle",
  states: {
    idle: {
      on: {
        CLICK: "init",
      },
    },
    init: {
      entry: assign({deck: shuffle(allCards)}),
      on: {
        TTS_READY: "welcome",
        CLICK: "welcome",
      },
    },
    welcome: {
        entry: [say('Hi!'),],
        on: {ENDSPEECH: "game"},
    },
    game: {
    initial: "newGame",
    states: {
    newGame: {
      id: "newGame",
      initial: "init",
      states: {
        init: {
          entry: [
            assign({deck: (context) => shuffle(context.deck)}),
            assign({userCard: (context) => context.deck[0]}),
            assign({userImages: (context) => context.deck.slice(1, 24)}),
            assign({computerImages: (context) => initCards(context.userImages)}),
            assign({computerCard: (context) => context.computerImages.pop() as Card}),
            assign({computerImages: (context) => context.computerImages.concat(getCardData(context.userCard))}),
            assign({currentProperty: (context) => relevantProperty(context) as Property}),
          ],
          always: {
            target: "userCard",
          } ,
          },
        userCard: {
          entry: ["displayUserCard",
            say('This is Fnarglebleep.'),],
          on: {ENDSPEECH: "allImages"},
          },
        allImages: {
          entry: ["checkProperties",
            "displayImages",
            say('And this is everyone else!')
            ],
            on: {ENDSPEECH: "#computerTurn"},
            },
          },
        },
        computerTurn: {
          id: "computerTurn",
          // entry: say("OK, my turn!"),
          initial: "statusCheck",
          states: {
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
          initial: "prompt",
          on: {
            RECOGNISED: [
              {
                target: "#userTurn",
                cond: (context) => !!yesNoResponse(context),
                actions: [assign({computerImages: (context) => filterCards(context, yesNoResponse(context) as string)}), 
                  assign({currentProperty: (context) => relevantProperty(context) as Property})
                ], // also say eg "hmm, ok..."
              },
              {target: ".nomatch"}
            ],
            ENDSPEECH: ".ask",
            TIMEOUT: ".prompt"
          },
          states: {
            prompt: {
              entry: send((context) => ({
                type: "SPEAK",
                value: context.nextQuestion,
              })),
              on: { ENDSPEECH: "ask" },
            },
            ask: {
              entry: send("LISTEN"),
            },
            nomatch: {
              entry: say("I don't understand, please repeat."),
              on: { ENDSPEECH: "ask" },
            }
          },
        },
        computerGuess: {

        },
      },
    },
    userTurn: {
      id: "userTurn",
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: ".respond",
            cond: (context) => isYesNoQuestion(context),
          },
          {target: ".nomatch"},
        ],
        TIMEOUT: ".reprompt",
      },
      states:{
        prompt: {
          entry: say('Ok, your turn!'),
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
                  target: "gender",
                  cond: (context) => aboutGender(context),
                },
                {target: "nomatch"},
              ],
            },
            yesno: {
              entry: send((context) => ({
                type: "SPEAK",
                value: understandAndCheck(context),
              })),
              on: { ENDSPEECH: "#computerTurn" },
            },
            gender: {
              entry: say("Fnargs have not invented the cultural concept of gender. All fnargs are fnargs."),
              on: { ENDSPEECH: "#computerTurn" },
            },
            nomatch: {
              entry: say("I don't know that. You will have to ask about something else."),
              on: { ENDSPEECH: "#userTurn.ask" },
            },
          },
        },
        reprompt: {
          entry: say("Hey, it's your turn!"),
          on: { ENDSPEECH: "ask" },
        },
        nomatch: {
          entry: say("Sorry, I don't understand. Are you sure that was a yes/no question?"),
          on: { ENDSPEECH: "ask" },
        },
      },
    },
    result: {

    },
      },
    },
  },
};
















