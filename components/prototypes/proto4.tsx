import { computeLevenshteinDistance } from "@/utils/levenshtein";
import { phrases } from "@/utils/phrases";
import p5 from "p5";

export default function Proto1(props: { dpi: number }) {
  const protoFn = (p5: p5) => {

    const DPIofYourDeviceScreen = props.dpi;
    const sizeOfInputArea = DPIofYourDeviceScreen * 1;

    const totalTrialNum = 2;
    let currTrialNum = 0;
    let startTime = 0;
    let finishTime = 0;
    let lastTime = 0;
    let lettersEnteredTotal = 0;
    let lettersExpectedTotal = 0;
    let errorsTotal = 0;
    let currentPhrase = "";
    let currentTyped = "";

    // ------------------------
    // MULTI-TAP KEYBOARD STATE
    // ------------------------
    const keys = [
      "e", // top row (highlighted)
      "t",
      "a",
      "o",
      "bcd", // second row
      "fgh",
      "ij",
      "klm",
      "npq", // third row
      "r",
      "s",
      "uv",
      "_", // bottom row
      "wx",
      "yz",
      "`", // backspace
    ];

    let lastKeyIndex = -1;
    let tapCount = 0;
    let lastTapTime = 0;
    const TAP_TIMEOUT = 500;
    let currentLetterPreview = "";

    p5.setup = () => {
      p5.createCanvas(window.innerWidth, window.innerHeight);
      p5.noStroke();

      // randomize phrases
      for (let i = 0; i < phrases.length; i++) {
        const r = Math.floor(Math.random() * phrases.length);
        [phrases[i], phrases[r]] = [phrases[r], phrases[i]];
      }
    };

    p5.draw = () => {
      p5.background(255);

      // ------------------------
      // END OF ALL TRIALS
      // ------------------------
      if (finishTime != 0) {
        p5.fill(0);
        p5.textAlign(p5.CENTER);
        p5.text("Trials complete!", window.innerWidth / 2, 200);
        p5.text(
          "Total time taken: " + (finishTime - startTime),
          window.innerWidth / 2,
          220
        );
        p5.text(
          "Total letters entered: " + lettersEnteredTotal,
          window.innerWidth / 2,
          240
        );
        p5.text(
          "Total letters expected: " + lettersExpectedTotal,
          window.innerWidth / 2,
          260
        );
        p5.text(
          "Total errors entered: " + errorsTotal,
          window.innerWidth / 2,
          280
        );
        const wpm =
          lettersEnteredTotal / 5.0 / ((finishTime - startTime) / 60000);
        p5.text("Raw WPM: " + wpm, window.innerWidth / 2, 300);
        const freebieErrors = lettersExpectedTotal * 0.05;
        p5.text(
          "Freebie errors: " + p5.nf(freebieErrors, 1, 3),
          window.innerWidth / 2,
          320
        );
        const penalty = p5.max(errorsTotal - freebieErrors, 0) * 0.5;
        p5.text("Penalty: " + penalty, window.innerWidth / 2, 340);
        p5.text(
          "WPM w/ penalty: " + (wpm - penalty),
          window.innerWidth / 2,
          360
        );
        return;
      }

      // ------------------------
      // GREY BOX (keep it — user knows where to hover)
      // ------------------------
      p5.fill(200);
      p5.rect(
        p5.width / 2 - sizeOfInputArea / 2,
        p5.height / 2 - sizeOfInputArea / 2,
        sizeOfInputArea,
        sizeOfInputArea
      );

      // ------------------------
      // START SCREEN
      // ------------------------
      if (startTime == 0 && !p5.mouseIsPressed) {
        p5.fill(128);
        p5.textAlign(p5.CENTER);
        p5.text("Click to start time!", 280, 150);
      }

      if (startTime == 0 && p5.mouseIsPressed) {
        nextTrial();
      }

      // ------------------------
      // ACTIVE TRIAL
      // ------------------------
      if (startTime != 0) {
        p5.textAlign(p5.LEFT);
        p5.fill(128);
        p5.text(
          "Phrase " + (currTrialNum + 1) + " of " + totalTrialNum,
          70,
          50
        );
        p5.text("Target:   " + currentPhrase, 70, 100);

        // Build display text
        let displayText = currentTyped;
        if (currentLetterPreview) displayText += currentLetterPreview;

        // GREEN CURSOR (replaces old blue + removes start-line cursor)
        p5.fill(0);
        p5.text("Entered:  " + displayText, 70, 140);

        let cursorX = 70 + p5.textWidth("Entered:  " + displayText);
        p5.stroke(0, 200, 0);
        p5.strokeWeight(3);
        p5.line(cursorX, 125, cursorX, 155);
        p5.noStroke();

        // ------------------------
        // NEXT BUTTON
        // ------------------------
        p5.fill(255, 0, 0);
        p5.rect(window.innerWidth - 200, window.innerHeight - 200, 200, 200);
        p5.fill(255);
        p5.textAlign(p5.CENTER);
        p5.text("NEXT >", window.innerWidth - 100, window.innerHeight - 100);

        // ------------------------
        // DRAW 4×4 GRID WITH OUTLINES + HIGHLIGHT FIRST ROW
        // ------------------------
        const cellW = sizeOfInputArea / 4;
        const cellH = sizeOfInputArea / 4;
        const x0 = p5.width / 2 - sizeOfInputArea / 2;
        const y0 = p5.height / 2 - sizeOfInputArea / 2;

        p5.textAlign(p5.CENTER);
        p5.textSize(18);

        for (let i = 0; i < 16; i++) {
          let cx = x0 + (i % 4) * cellW;
          let cy = y0 + Math.floor(i / 4) * cellH;

          // highlight the entire first row
          if (i < 4) p5.fill(180, 255, 180);
          else p5.fill(230);

          // draw outline
          p5.stroke(0);
          p5.strokeWeight(2);
          p5.rect(cx, cy, cellW, cellH);

          p5.noStroke();
          p5.fill(0);
          p5.text(keys[i], cx + cellW / 2, cy + cellH / 2);
        }
      }
    };

    function didMouseClick(x: number, y: number, w: number, h: number) {
      return (
        p5.mouseX > x && p5.mouseX < x + w &&
        p5.mouseY > y && p5.mouseY < y + h
      );
    }

    // ------------------------
    // MULTI-TAP INPUT
    // ------------------------
    p5.mousePressed = () => {
      const x0 = p5.width / 2 - sizeOfInputArea / 2;
      const y0 = p5.height / 2 - sizeOfInputArea / 2;
      const cellW = sizeOfInputArea / 4;
      const cellH = sizeOfInputArea / 4;

      // NEXT button
      if (didMouseClick(window.innerWidth - 200, window.innerHeight - 200, 200, 200)) {
        commitLetter();
        nextTrial();
        return;
      }

      // detect key presses
      for (let i = 0; i < 16; i++) {
        let cx = x0 + (i % 4) * cellW;
        let cy = y0 + Math.floor(i / 4) * cellH;

        if (didMouseClick(cx, cy, cellW, cellH)) {
          handleKeyPress(i);
          return;
        }
      }
    };

    function handleKeyPress(keyIndex: number) {
      let t = p5.millis();

      if (keyIndex !== lastKeyIndex || t - lastTapTime > TAP_TIMEOUT) {
        if (lastKeyIndex >= 0) commitLetter();
        tapCount = 0;
      }

      lastKeyIndex = keyIndex;
      lastTapTime = t;
      tapCount++;

      const letters = keys[keyIndex];
      currentLetterPreview = letters[(tapCount - 1) % letters.length];
    }

    function commitLetter() {
      if (lastKeyIndex < 0) return;

      const letters = keys[lastKeyIndex];
      const letter = letters[(tapCount - 1) % letters.length];

      if (letter === "_") currentTyped += " ";
      else if (letter === "`") currentTyped = currentTyped.slice(0, -1);
      else currentTyped += letter;

      tapCount = 0;
      lastKeyIndex = -1;
      currentLetterPreview = "";
    }

    function nextTrial() {
      if (currTrialNum >= totalTrialNum) return;

      if (startTime != 0 && finishTime == 0) {
        lettersExpectedTotal += currentPhrase.length;
        lettersEnteredTotal += currentTyped.length;
        errorsTotal += computeLevenshteinDistance(
          currentTyped.trim(),
          currentPhrase.trim()
        );
      }

      if (currTrialNum == totalTrialNum - 1) {
        finishTime = p5.millis();
        currTrialNum++;
        return;
      }

      if (startTime == 0) {
        startTime = p5.millis();
      } else {
        currTrialNum++;
      }

      lastTime = p5.millis();
      currentTyped = "";
      currentLetterPreview = "";
      currentPhrase = phrases[currTrialNum];
    }

    /* END OF PROTOTYPE CODE */
  };

  new p5(protoFn);
  return <></>;
}