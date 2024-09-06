import * as readlinePromises from 'node:readline/promises';
const rl = readlinePromises.createInterface({ input: process.stdin, output: process.stdout });
import fs from "node:fs";

async function askQuestion(question) {
    return await rl.question(question);
}

import { ANSI } from './ansi.mjs';
import { HANGMAN_UI } from './graphics.mjs';

const GAME_OVER_TEXT = "Game Over";
const ALREADY_GUESSED = "This letter has been guessed.... dummy";
const PLAYER_WON = "You guessed correctly!";
const PLAYER_RESTART = "Do you want to play more?\n";
const WORD_LIST_FILE = "./words.txt";
const UNICODE = "utf-8";
const START_OF_QUESTION = "Guess a char or the word : "
const IMPORTED_LIST = wordList();
let correctWord = wordSelectionFromList(IMPORTED_LIST);
let numberOfCharInWord = correctWord.length;
let guessedWord = "".padStart(correctWord.length, "_"); 
let wordDisplay = "";
let isGameOver = false;
let wasGuessCorrect = false;
let wrongGuesses = [];
let guessesMadeCorrectly = [];

function resetVariables() {
    correctWord = wordSelectionFromList(IMPORTED_LIST);
    numberOfCharInWord = correctWord.length;
    guessedWord = "".padStart(correctWord.length, "_"); 
    wordDisplay = "";
    isGameOver = false;
    wasGuessCorrect = false;
    wrongGuesses = [];
    guessesMadeCorrectly = [];
}


function drawWordDisplay() {

    wordDisplay = "";

    for (let i = 0; i < numberOfCharInWord; i++) {
        if (guessedWord[i] != "_") {
            wordDisplay += ANSI.COLOR.GREEN;
        }
        wordDisplay = wordDisplay + guessedWord[i] + " ";
        wordDisplay += ANSI.RESET;
    }

    return wordDisplay;
}

function drawList(list, color) {
    list = Array.from(list);
    let output = color;
    for (let i = 0; i < list.length; i++) {
        output += list[i] + " ";
    }

    return output + ANSI.RESET;
}

function playerStats() {
    let stats="Correct Guesses\n";
    for(let i=0;i<guessesMadeCorrectly.length; i++){
        stats = stats + guessesMadeCorrectly[i] + "\n";
    }
    stats = stats + "Wrong guesses\n";
    for(let i=0;i<wrongGuesses.length; i++){
        stats = stats + wrongGuesses[i] + "\n";
    }
    return stats;
}

async function hangmanGame() {



    while (isGameOver == false) {

        output(ANSI.CLEAR_SCREEN);
        output(drawWordDisplay());
        output(drawList(new Set(wrongGuesses), ANSI.COLOR.RED));
        output(HANGMAN_UI[wrongGuesses.length]);

        output(correctWord);

        const answer = (await askQuestion(START_OF_QUESTION)).toLowerCase();

        if (answer == correctWord) {
            isGameOver = true;
            wasGuessCorrect = true;
            guessedWord = answer;
        } else if (ifPlayerGuessedLetter(answer) == false) {
            let isCorrect = false;
            if (answer != correctWord) {
                isCorrect = false;
                wrongGuesses.push(answer);
            }
        } else if (ifPlayerGuessedLetter(answer)) {

            let org = guessedWord;
            guessedWord = "";

            if (guessedWord.includes(answer)) {
                output(ALREADY_GUESSED);
            }

            let isCorrect = false;
            for (let i = 0; i < correctWord.length; i++) {
                if (correctWord[i] == answer) {
                    guessedWord += answer;
                    isCorrect = true;
                } else {
                    guessedWord += org[i];
                }
            }
            if (guessesMadeCorrectly.includes(answer)) {
                isCorrect = false;
            }
            if (isCorrect == true) {
                guessesMadeCorrectly.push(answer);
            }
            if (isCorrect == false) {
                wrongGuesses.push(answer);
            } else if (guessedWord == correctWord) {
                isGameOver = true;
                wasGuessCorrect = true;
            }
        }

        if (wrongGuesses.length == HANGMAN_UI.length) {
            isGameOver = true;
        }

    }
    output(ANSI.CLEAR_SCREEN);
    output(drawWordDisplay());
    output(drawList(wrongGuesses, ANSI.COLOR.RED));
    output(HANGMAN_UI[wrongGuesses.length % correctWord.length]);
    if (wasGuessCorrect) {
        output(ANSI.COLOR.YELLOW + PLAYER_WON);
    }
    output(GAME_OVER_TEXT);
    output(playerStats());
    await doesPlayerWantToPlayMore();
}

async function doesPlayerWantToPlayMore() {
    const playerResponse = (await askQuestion(PLAYER_RESTART)).toLowerCase();
    if (playerResponse == "yes") {
        resetVariables();
        hangmanGame();
    } else if (playerResponse == "no") {
        process.exit();
    } else {
        await doesPlayerWantToPlayMore();
    }
}

function ifPlayerGuessedLetter(answer) {
    return answer.length == 1;
}

function wordList() {
    const wordArray = fs.readFileSync(WORD_LIST_FILE, UNICODE).split("\r\n");
    return wordArray;
}

function wordSelectionFromList(list) {
    const index = Math.floor(Math.random() * list.length - 1) + 1;
    return list[index];
}

function output(content){
    console.log(content);
}


resetVariables();
hangmanGame();