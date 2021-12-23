// audio & speech initialization
let isReadQuestion;
let synth;
let audioObj;

try {
    // flag for speech (default no read)
    isReadQuestion = 0;
    synth = window.speechSynthesis;
    if (!synth) console.log("speechSynthesis not supported!!");

    // for sound

    audioObj = new Audio("./wrong.mp3");
    audioObj.playbackRate = 10;
} catch (error) {
    console.error(error);
}

// question list
let cnt = 0;
let questions = [];
let RANDOM_QUESTION_CNT = 10;
let STRING_LENGTH = 15;


// set the first question from the list
let question;

// index for character in a single question;
let index = 0;
let selChar = '';



// check if string is empty
let isEmpty = (str) => !str || /^\s*$/.test(str);


/**
 * Get the dom element from its id
 * @param {*} ch | id
 * @returns dom element
 */
function selectedButton(ch) {
    try {
        return document.getElementById(`id_${ch.toLowerCase()}`);

    } catch (error) {
        // do nothing
    }

    return false;
}

function init() {
    // if checkbox is checked then play sound
    isReadQuestion = document.getElementById("sound_play").checked;

    // focus textbox
    document.getElementById("textbox").focus();


    // select the first letter of the question
    index = 0;
    cnt = 0;
    questions = [];
    for (var i = 0; i < RANDOM_QUESTION_CNT; i++) {
        questions.push(Math.random().toString(36).substr(2, STRING_LENGTH).toUpperCase());
    }
    question = questions[cnt];
    selChar = question[index].toUpperCase();


    // set question
    document.getElementById("question").textContent = question;

    selectKey();

    // set question content
    const questionContentElm = document.getElementById("question_content");
    questionContentElm.textContent = questions.join("\n");
    // questionContentElm.addEventListener("change", e => {
    //     console.log(e)
    // })


    // show setting window
    document.querySelector(".set-button").addEventListener("click", () => {
        let isShow = document.querySelector(".body").classList.contains("show");
        if (isShow) {
            document.querySelector(".body").classList.remove("show");
        } else {
            document.querySelector(".body").classList.add("show");
        }
    });

    // show score
    document.getElementById("score").textContent = `${cnt}/${questions.length}`;
}
window.addEventListener('load', () => {
    document.getElementById("sound_play").addEventListener("change", e => {
        isReadQuestion = e.target.checked;
        if (isReadQuestion) utter(selChar);
    })

    // add key event listener for each key press
    addEventListerToInputBox();

    init();
});


function addEventListerToInputBox() {
    const textBox = document.getElementById("textbox");

    // on focus hide setting
    textBox.addEventListener("focus", () => {
        document.querySelector(".body").classList.remove("show");
    });

    // add event for key pressed in textbox
    textBox.addEventListener("keypress", e => {
        let inputChar = e.key.toUpperCase();

        console.log("inputChar", inputChar, e.keyCode);
        console.log("selChar", selChar);
        if (e.keyCode == 32) inputChar = "space";
        if (e.keyCode == 44) inputChar = "comma";

        if (isEmpty(selChar)) selChar = "space";

        if (inputChar === selChar) {
            document.querySelectorAll("button.select").forEach(btn => btn.classList.remove("select"));

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
                document.getElementById("score").textContent = `${cnt}/${questions.length}`;

                // if questions from the list are finished then finish the game
                if (cnt >= questions.length) {

                    setTimeout(() => {
                        alert("完成！！");
                        init();
                    }, 500);
                    return true;
                }
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


/**
 * Select character for question
 * If the flag "isReadQuestion" is on,
 * then it will read active character
 * @returns 
 */
function selectKey() {
    if (isEmpty(selChar)) selChar = "space";
    if (selChar == ',') selChar = "comma";

    let nextSelection = selectedButton(selChar);
    if (!nextSelection) return;

    document.querySelectorAll(".select").forEach(btn => btn.classList.remove("select"));
    nextSelection.classList.add("select");

    if (isReadQuestion) utter(selChar);
}


/**
 * Utter
 * @param {*} str | string to be utterred
 */
function utter(str) {
    try {
        var utterThis = new SpeechSynthesisUtterance(str);
        utterThis.lang = 'en-US';
        synth.speak(utterThis)
    } catch (error) {
        console.error(error);
    }

}