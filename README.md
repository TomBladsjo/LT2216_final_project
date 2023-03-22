# LT2216_final_project
My final project in the Dialogue Systems course 2023.

This game is called "Fnargs". It is a dialogue-based game inspired by the board game Guess Who, where two players take turns to ask yes/no questions in order to figure out which of a set of characters their opponent has chosen. In this game, instead of human characters, the game contains a set of aliens (fnargs), that can be distinguished from each other by characteristics such as colour, number of eyes, and whether or not they are carrying an item. The user plays against the computer and takes turns asking and answering yes/no questions about the fnargs. If the user manages to guess the computer's fnarg before the computer guesses theirs, they win. 

If the user is unsure of the rules at any point in the game, they can say "help", and the computer will read out the rules.

The game has a simple design using the xstate library. The interpretation of user utterances is entirely based on Regexp. 

The game is meant to be played in a computer browser and does not work on smartphone. 
