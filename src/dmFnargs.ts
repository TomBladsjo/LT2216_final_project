import { MachineConfig, send, Action, assign, Machine } from "xstate";

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
'31211.png', '31213.png']

function say(text: string): Action<SDSContext, SDSEvent> {
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }));
  }

function shuffle(arr: Array<any>) {
  return [...arr].sort(() => 0.5 - Math.random());
  }
  
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
}







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
}

const initCards = (cardList: Array<string>) => {
  let cardsInGame = [];
  for (let card of cardList) {
    cardsInGame.push(getCardData(card))
  };
  return shuffle(cardsInGame)
}

const unknownCard = () => {
    let card: Card = {
        item: undefined,
        horns: undefined,
        colour: undefined,
        pinkBow: undefined,
        eyes: undefined,
    }
    return card
}

const relevantProperty = (context: SDSContext) => {
  let cards = context.computerImages;
  const features: Array<string> = ['item', 'horns', 'colour', 'pinkBow', 'eyes'];
  for (let f in shuffle(features)) {
      let val = cards[0][f]
      for (let card of cards) {
        if (card[f] != val) {
          let question: Property = {
            feature: f,
            value: val as number,
          };
          return question
      }
    }
  }
}

const question = (property: Property) => {
  let f = property.feature;
  let v = property.value;
  if (f == 'item') {
    if (v == 0) {
      return "Is it empty-handed? I mean, tentacled? Whatevered?"
    } else {
      let item = grammar.item[v];
      return `Is it holding a ${item}?`
    }
  }
  if (f == 'horns') {
    return "Does it have horns?"
  }
  if (f == 'colour') {
    let colour = grammar.colour[v];
    return `Is it ${colour}?`
  }
  if (f == 'pinkBow') {
    return "Does it have a pink bow on its head?"
  }
  if (f == 'eyes') {
    if (v == 1) {
      return "Does it have only one eye?"
    } else {
      return `Does it have ${v} eyes?`
    }
  }
}

const filterCards = (context: SDSContext, yesno: string | undefined) => {
  let allCards = context.computerImages;
  let relevantCards = Array<Card>()
  let f = context.nextQuestion.feature;
  let v = context.nextQuestion.value;
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
  return relevantCards
}

const yesNoResponse = (context: SDSContext) => {
  
}


/* 
    - recognise yes/no response
 */

/* const checkProperties = (c: Card) => {
  // let c = context.computerCard
  for (let propt in c) {console.log(c[propt]);}
} */

/* function newGame(context: SDSContext) {
  context.deck = shuffle(context.deck);
  context.userCard = context.deck[0];
  context.userImages = context.deck.slice(1, 24);
  context.cardHypothesis = UnknownCard();
  let cardsInGame = [];
  for (let card of context.userImages) {
    cardsInGame.push(getCardData(card))
  };
  context.computerImages = shuffle(cardsInGame);
  context.computerCard = context.computerImages.pop() as Card;
} */




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
      initial: "init",
      states: {
        init: {
          entry: [
            assign({deck: (context) => shuffle(context.deck)}),
            assign({userCard: (context) => context.deck[0]}),
            assign({userImages: (context) => context.deck.slice(1, 24)}),
            assign({cardHypothesis: unknownCard()}),
            assign({computerImages: (context) => initCards(context.userImages)}),
            assign({computerCard: (context) => context.computerImages.pop() as Card}),
            assign({computerImages: (context) => context.computerImages.concat(getCardData(context.userCard))}),
            ],
          on: {CLICK: "userCard"}, 
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
            on: {ENDSPEECH: "#root.dm.idle"},
            },
          },
        },
        computerTurn: {
          entry: say("OK, my turn!"),
          initial: "statusCheck",
          states: {
            statusCheck: {
              entry: [],  // match hypothesis to list of cards, check which property to ask about
              always: [
                {target: "#root.dm.idle",
                actions: [
                ]}
              ],  // transition based on check (ask or guess)
            },
            computerAsk: {
          initial: "prompt",
          on: {
            RECOGNISED: [

            ],
            ENDSPEECH: ".ask",
          },
          states: {
            prompt: {

            },
            ask: {
              entry: send("LISTEN"),
            },
            updateHypothesis: {

            },
          },
        },
        computerGuess: {

        },
      },
    },
    userTurn: {

    },
    result: {

    },
      },
    },
  },
};
















