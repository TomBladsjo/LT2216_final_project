import { MachineConfig, send, Action, assign } from "xstate";


function say(text: string): Action<SDSContext, SDSEvent> {
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }));
  }

const getCardData = (imageName: string) => {
    let code = imageName.replace(/\.png$/g, "");
    const card: Card = {
        id: imageName,
        item: Number(code[0]),
        horns: Number(code[1]),
        colour: Number(code[2]),
        pinkBow: Number(code[3]),
        eyes: Number(code[4]),
    }
    return card
}

const UnknownCard = () => {
    let card: Card = {
        id: undefined,
        item: undefined,
        horns: undefined,
        colour: undefined,
        pinkBow: undefined,
        eyes: undefined,
    }
    return card
}



export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = {
  initial: "idle",
  states: {
    idle: {
      on: {
        CLICK: "init",
      },
    },
    init: {
      on: {
        TTS_READY: "welcome",
        CLICK: "welcome",
      },
    },
    welcome: {
        entry: [say('Fnargs'),
      assign({userCard: '00113.png'})],
        on: {ENDSPEECH: "card"},
    },
    card: {
      entry: ["displayUserCard",
        say('This is Nad.')],
    }
  },
};










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





