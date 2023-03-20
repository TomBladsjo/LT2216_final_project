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

const question = (property: Property) => {
  const isVariations = ['Is it', 'Is yours', 'Is your fnarg', 'Are they'];
  const doesVariations = ['Does it', 'Does yours', 'Does your fnarg', 'Do they'];
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




// nlu:

// - guard functions:

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

////////////////////////// text material ////////////////////////////

const helpText = `You are playing this game against me, the computer. We each have an identical set of 26 fnargs, one of which is our special fnarg. For you, this fnarg is displayed at the top of the screen. Your job is to guess which of the 26 fnargs is my special fnarg, before I guess which is yours. To do this, we will take turns asking each other yes no questions, such as "is your fnarg blue?" or "is it carrying an item?". If you manage to name my special fnarg first, you have won. Hover the cursor over the fnarg images to see their names. Good luck!`;
const yourTurnReprompts = ['Your turn!', "Hey, it's your turn!", "It's your turn!", "Your turn, ask me something!", "Hey, don't fall asleep! It's your turn!", "It's your turn to ask!", "Come on, ask me a question!", "Don't think too much, just ask something!"];

/////////////////////////////////// machine ///////////////////////////////////



export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = {
  initial: "idle",
  id: "idle",
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
    help: {
      id: "help",
      entry: say(helpText),
      on: { ENDSPEECH: "game.history" },
      },
    welcome: {
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
              target: ".nomatch"
            },
          ],
          TIMEOUT: ".reprompt",
        },
        states: {
          prompt: {
            entry: say('Hi! Welcome to the Fnargs game! Have you played this game before?'),
            on: {ENDSPEECH: "ask"},
          },
          reprompt: 
          {
            entry: say('Have you played this game before?'),
            on: {ENDSPEECH: "ask"},
          },
          nomatch: 
          {
            entry: say("Sorry, I didn't catch that."),
            on: {ENDSPEECH: "reprompt"},
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
          ],
          always: {
            target: "userCard",
          } ,
          },
        userCard: {
          entry: ["displayUserCard",
            say('Alright! This is your fnarg, that I will try to guess. If you hover near the bottom of the image, you will see its name.'),],
          on: {ENDSPEECH: "allImages"},
          },
        allImages: {
          entry: [
            "displayImages",
            say('And here are all its friends. Hover over them to see their names. Can you guess which one is mine?')
            ],
            on: {ENDSPEECH: "#userTurn"},
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
          initial: "turnChange",
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
                  assign({currentProperty: (context) => relevantProperty(context) as Property})
                ], // also say eg "hmm, ok..."
              },
              {target: ".nomatch"}
            ],
            TIMEOUT: ".prompt",
          },
          states: {
            turnChange: {
              entry: say('Ok, my turn.'),
              on: {ENDSPEECH: "prompt"},
            },
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
              {target: ".nomatch"},
            ],
          },
          states:
          {
            guess: {
              entry: send((context) => ({
                type: "SPEAK",
                value: `Is it ${context.computerImages[0].name}?`,
              })),
              on: { ENDSPEECH: "ask" },
            },
            ask: {
              entry: send("LISTEN"),
            },
            wasRight: {
              entry: say("Yay, I won!"),
              on: {ENDSPEECH: "#result"},
            },
            wasWrong: {
              entry: say("Oh, bother!"),  // say are you sure, have you been messing with me? etc
              on: {ENDSPEECH: "#userTurn"},
            },
            nomatch: {
              entry: say("I don't understand, please repeat!"),
              on: {ENDSPEECH: "ask"},
            },
          },
        },
      },
    },
    userTurn: {
      id: "userTurn",
      initial: "prompt",
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
          {target: ".nomatch"},
        ],
        TIMEOUT: ".reprompt",
      },
      states:{
        prompt: {
          entry: say('Your turn!'),
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
                  entry: say("Congratulations, you won!"),
                  on: {ENDSPEECH: "#result"}
                }
              },
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
          entry: say("It's your turn!"),
          on: { ENDSPEECH: "ask" },
        },
        nomatch: {
          entry: say("Sorry, I don't understand. Are you sure that was a yes/no question?"),
          on: { ENDSPEECH: "ask" },
        },
      },
    },
    result: {
      id: "result",
      initial: "prompt",
      on: {RECOGNISED: [
        {
          target: "#newGame",
          cond: (context) => yesNoResponse(context) == 'yes',
        },
        {
          target: ".goodbye",
        }
      ],
      ENDSPEECH: ".ask",
    },
      states: {
        prompt: {
          entry: say(`That was fun! Do you want to play again?`)
        },
        ask: {
          entry: send("LISTEN"),
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

















