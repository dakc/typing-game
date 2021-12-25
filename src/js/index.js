const KEY = "dakc_typing_game_question_v1";

// audio & speech initialization
let synthObj, audioObj;
(function () {
    // for wrong input
    try {
        audioObj = new Audio("./wrong.mp3");
        audioObj.playbackRate = 10;
    } catch (error) {
        // do nothing
    }

    // for 質問読み上げ
    try {
        synthObj = window.speechSynthesis;
    } catch (error) {
        // do nothing
    }
})();


window.APP_DATA = {};
window.STR_LENGTH = 10;
window.QUESTION_COUNT = 5;

let INPUT_TEXT_BOX;

// check if string is empty
let isEmpty = (str) => !str || /^\s*$/.test(str);

function init() {
    // initialize APP_DATA
    let questionList = document.getElementById("question_content").value.split('\n');

    APP_DATA = {
        "questionList": questionList,
        "questionCompleted": 0,
        "selectedQuestion": questionList[0],
        "charIndex": 0,
        "playSound": document.getElementById("sound_play").checked,
        "startTime": new Date(),
        "inputData": {
            "keyPressCode": 0,
            "isJpMode": 0,
            "status": {
                "totalInput": 0,
                "correctInput": 0,
                "wrongInput": 0,

            }
        }
    };

    // empty text box
    INPUT_TEXT_BOX.value = "";
    // focus textbox
    INPUT_TEXT_BOX.focus();


    // set question
    document.getElementById("question").textContent = APP_DATA.selectedQuestion;

    // focus key for first character of the selected question
    if (APP_DATA.selectedQuestion) selectKey(APP_DATA.selectedQuestion[0]);

    // show status
    document.getElementById("score").textContent = `${APP_DATA.questionCompleted}/${APP_DATA.questionList.length}`;
}


// window load event
window.addEventListener('load', () => {
    // attach event listner
    INPUT_TEXT_BOX = document.getElementById("textbox");

    (function () {
        let notAlertKeyCodes = [243, 244, 229];
        let getKeyCode = e => e.keyCode || e.charCode;

        function onKeyDown(e) {
            APP_DATA.inputData.isJpMode = getKeyCode(e) == 229;
        }

        function onKeyPress(e) {
            APP_DATA.inputData.keyPressCode = getKeyCode(e);
        }

        function onKeyUp(e) {
            APP_DATA.inputData.keyUpCode = getKeyCode(e);
            console.log("APP_DATA.inputData", APP_DATA.inputData);
            if (APP_DATA.inputData.isJpMode && !notAlertKeyCodes.includes(APP_DATA.inputData.keyUpCode)) {
                alert("入力を「半角英数字」モードに切り替えてください！！");
                return;
            }

            // main process to check input
            checkInput();
        }

        if (INPUT_TEXT_BOX.addEventListener) {
            INPUT_TEXT_BOX.addEventListener('keydown', onKeyDown, false);
            INPUT_TEXT_BOX.addEventListener('keypress', onKeyPress, false);
            INPUT_TEXT_BOX.addEventListener('keyup', onKeyUp, false);
        } else {
            INPUT_TEXT_BOX.attachEvent('onkeydown', onKeyDown);
            INPUT_TEXT_BOX.attachEvent('onkeypress', onKeyPress);
            INPUT_TEXT_BOX.attachEvent('onkeyup', onKeyUp);
        }
    })();

    // on focus hide setting window
    INPUT_TEXT_BOX.addEventListener("focus", () => {
        document.querySelector(".body").classList.remove("show");
    });

    // show/hide setting window
    document.querySelector(".set-button").addEventListener("click", () => {
        let isShow = document.querySelector(".body").classList.contains("show");
        if (isShow) {
            document.querySelector(".body").classList.remove("show");
        } else {
            document.querySelector(".body").classList.add("show");
        }
    });

    // create question
    let question = localStorage.getItem(KEY) || createRandomTextPara(STR_LENGTH, QUESTION_COUNT);
    console.log("question", question);
    document.getElementById("question_content").value = question;


    // initialize
    init();


    // save button clicked
    document.getElementById("btn_save").addEventListener("click", () => {
        // set question
        let content = document.getElementById("question_content").value;
        document.getElementById("question_content").value = content.toUpperCase();

        // save to local storage
        localStorage.setItem(KEY, content.toUpperCase());

        // initialize();  
        init();
    })

    document.getElementById("btn_save_random").addEventListener("click", () => {
        document.getElementById("question_content").value = createRandomTextPara(STR_LENGTH, QUESTION_COUNT);
        init();
    })
});


/**
 * Check Input 
 * If correct then show next question
 */
function checkInput() {
    APP_DATA.inputData.status.totalInput++;

    // run comparing
    let isCorrect = isInputSame(APP_DATA.inputData.keyUpCode, normalizeCode(APP_DATA.selectedQuestion[APP_DATA.charIndex]));
    if (isCorrect) {
        APP_DATA.inputData.status.correctInput++;
        // select next key from question
        selectNextQuestion();
    } else {
        // increement
        APP_DATA.inputData.status.wrongInput++;
        // play wrong sound
        if (APP_DATA.playSound) audioObj.play();
        // focus key
        let inputKey = document.getElementById(`id_${APP_DATA.inputData.keyUpCode}`);
        if (inputKey) {
            inputKey.classList.add("select-error");
            setTimeout(() => inputKey.classList.remove("select-error"), 200);
        }
    }

    // show status
    document.getElementById("score").innerHTML = `${APP_DATA.questionCompleted}/${APP_DATA.questionList.length}`;
    document.getElementById("correctness").innerHTML = `${Math.floor(APP_DATA.inputData.status.correctInput / APP_DATA.inputData.status.totalInput * 100)}`;
    document.getElementById("time").innerHTML = Math.ceil(((new Date).getTime() - APP_DATA.startTime.getTime()) / 1000);
}

/**
 * Select next character for question
 * @returns 
 */
function selectNextQuestion() {

    // if the character is last character of the string,
    // then show the new string
    if (APP_DATA.charIndex >= APP_DATA.selectedQuestion.length - 1) {
        // set to -1 so that incrementing in following step will set to zero
        APP_DATA.charIndex = -1;
        // increment number of questions completed
        APP_DATA.questionCompleted++;

        // if questions from the list are finished then finish the game
        if (APP_DATA.questionCompleted >= APP_DATA.questionList.length) {

            setTimeout(() => {
                let curDate = new Date();
                APP_DATA.inputData.status.timeTaken = Math.ceil((curDate.getTime() - APP_DATA.startTime.getTime())) / 1000;
                alert("完成！！" + "\n" + `Time: ${APP_DATA.inputData.status.timeTaken}秒`);
                init();
            }, 500);
            return true;
        }

        // set question
        APP_DATA.selectedQuestion = APP_DATA.questionList[APP_DATA.questionCompleted];
        document.getElementById("question").textContent = APP_DATA.selectedQuestion;

        // empty text after the keypress event is completed so that last character remains in the text box for that time
        setTimeout(() => document.getElementById("textbox").value = "", 100);

    }

    // shift the character
    APP_DATA.charIndex++;

    // select new character
    selectKey(APP_DATA.selectedQuestion[APP_DATA.charIndex]);
}

/**
 * find the button element for specific key and focus so that it becomes visible to user
 * @param {string} selChar | key
 */
function selectKey(selChar) {
    // remove previous selection
    document.querySelectorAll(".select").forEach(btn => btn.classList.remove("select"));

    // select new key
    let keyBtnElm = document.getElementById(`id_${normalizeCode(selChar)}`);
    if (keyBtnElm) keyBtnElm.classList.add("select");

    // utter sound
    if (APP_DATA.playSound) utter(selChar);
}

function normalizeCode(selChar) {
    let ret = selChar.charCodeAt(0);
    switch (selChar) {
        case '-':
            ret = 189;
            break;
        case '^':
            ret = 222;
            break;
        case '\\':
            ret = 220;
            break;
        case '@':
            ret = 192;
            break;
        case '[':
            ret = 219;
            break;
        case ';':
            ret = 187;
            break;
        case ':':
            ret = 186;
            break;
        case ']':
            ret = 221;
            break;
        case ',':
            ret = 188;
            break;
        case '.':
            ret = 190;
            break;
        case '/':
            ret = 191;
            break;
        case '\\':
            ret = 226;
            break;
        default:
            break;
    }
    return ret;
}
/**
 * Compare the input with the key
 * @param {*} input 
 * @param {*} target 
 */
function isInputSame(input, target) {
    console.log("input", input, "target", target)
    return input === target;
}

/**
 * Utter
 * @param {*} str | string to be utterred
 */
function utter(str) {
    try {
        var utterThis = new SpeechSynthesisUtterance(str);
        utterThis.lang = 'en-US';
        synthObj.speak(utterThis)
    } catch (error) {
        console.error(error);
    }

}

/**
 * Create ramdom text paragraph
 * @param {*} strLength 
 * @param {*} lineCnt 
 * @returns 
 */
function createRandomTextPara(strLength, lineCnt) {
    let str = '';
    for (var i = 0; i < lineCnt; i++) {
        str += Math.random().toString(36).substr(2, strLength).toUpperCase() + '\n';
    }
    return str.trim();
}