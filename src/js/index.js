const synth = window.speechSynthesis;
if (!synth) alert("speechSynthesis not supported!!");

const audioObj = new Audio("./wrong.mp3");
audioObj.playbackRate = 10;

// question list
let questions = [
    // Math.random().toString(36).substr(2, 10).toUpperCase(),
    "HELLO, MY NAME IS ARYAN",
    "I AM 5 YEAR OLD",
    "I LIKE PLAYING SOCCER",
    "I LIVE IN TOKIWA URAWA",
    "NICE TO MEET YOU",
];
const RANDOM_QUESTION_CNT = 5;
for (var i = 0; i < RANDOM_QUESTION_CNT; i++) {
    questions.push(Math.random().toString(36).substr(2, 10).toUpperCase());
}

// for counting number of question
let cnt = 0;
let question = questions[cnt];

// index for character;
let index = 0;
let selChar = '';

let isPlaySound = 1;

let isEmpty = (str) => !str || /^\s*$/.test(str);

function selectedButton(ch) {
    try {
        return document.getElementById(`id_${ch.toLowerCase()}`);

    } catch (error) {
        // do nothing
    }

    return false;
}

window.addEventListener('load', (event) => {
    // if checkbox is checked then play sound
    isPlaySound = document.getElementById("sound_play").checked;
    document.getElementById("sound_play").addEventListener("change", e => {
        isPlaySound = e.target.checked;
    })

    // focus textbox
    document.getElementById("textbox").focus();

    // add key event listener for each key press
    addKeyPressedEventListerToInputBox();

    // set question
    document.getElementById("question").textContent = question;

    // select the first letter of the question
    index = 0;
    selChar = question[index].toUpperCase();
    selectKey();
});


function addKeyPressedEventListerToInputBox() {
    // add event for key pressed in textbox
    document.getElementById("textbox").addEventListener("keypress", e => {
        let inputChar = e.key.toUpperCase();

        console.log("inputChar", inputChar, e.keyCode);
        console.log("selChar", selChar);
        if (e.keyCode == 32) inputChar = "space";
        if (e.keyCode == 44) inputChar = "comma";

        if (isEmpty(selChar)) selChar = "space";

        if (inputChar === selChar) {
            document.querySelectorAll("button.select").forEach(btn => btn.classList.remove("select"));

            // if questions from the list are finished then finish the game
            if (cnt >= questions.length) {
                alert(`Complete :${cnt}`);
                return true;
            }

            // if all the characters from a question are done, then set next question from the list
            if (index >= question.length - 1) {
                index = -1;
                cnt++;
                // set question
                question = questions[cnt];
                document.getElementById("question").textContent = question;
                // empty text after the keypress event is completed so that last character does not remain in the text box
                setTimeout(() => document.getElementById("textbox").value = "", 100);

                // todo show number of chars typed
                document.getElementById("char_cnt").textContent = cnt;
            }

            // shift the character
            index++;
            selChar = question[index].toUpperCase();
            selectKey();

        } else {
            // do not allow input
            // to play ng sound

            let inputKey = selectedButton(inputChar);
            if (inputKey) {
                inputKey.classList.add("select-error");
                audioObj.play();
                setTimeout(() => inputKey.classList.remove("select-error"), 200);
            }
            e.preventDefault();
            return false;
        }


        return true;

    })
}

function selectKey() {
    if (isEmpty(selChar)) selChar = "space";
    if (selChar == ',') selChar = "comma";

    let nextSelection = selectedButton(selChar);
    if (!nextSelection) return;

    document.querySelectorAll(".select").forEach(btn => btn.classList.remove("select"));
    nextSelection.classList.add("select");

    if (isPlaySound) {
        var utterThis = new SpeechSynthesisUtterance(selChar);
        utterThis.lang = 'en-US';
        synth.speak(utterThis);
    }
}