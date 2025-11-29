import { computeLevenshteinDistance } from "@/utils/levenshtein";
import { phrases } from "@/utils/phrases";
import p5 from "p5";

export default function Proto2(props: { dpi: number }) {
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
        let sliderX = 0;
        let sliderY = 0;
        let sliderW = sizeOfInputArea;
        let sliderH = 40;

        let knobX = 0;
        let knobY = 0;
        let knobR = 30;

        let dragging = false;
        let selectedLetter = "a";
        const alphabet = "abcdefghijklmnopqrstuvwxyz";
        p5.setup = () => {
            p5.createCanvas(window.innerWidth, window.innerHeight);
            p5.noStroke();

            // randomize phrase list
            for (let i = 0; i < phrases.length; i++) {
                const r = Math.floor(Math.random() * phrases.length);
                [phrases[i], phrases[r]] = [phrases[r], phrases[i]];
            }
        };
        p5.draw = () => {
            p5.background(255);

            if (finishTime !== 0) {
                p5.fill(0);
                p5.textAlign(p5.CENTER);
                p5.text("Trials complete!", window.innerWidth / 2, 200);
                p5.text("Total time taken: " + (finishTime - startTime), window.innerWidth / 2, 220);
                p5.text("Total letters entered: " + lettersEnteredTotal, window.innerWidth / 2, 240);
                p5.text("Total letters expected: " + lettersExpectedTotal, window.innerWidth / 2, 260);
                p5.text("Total errors entered: " + errorsTotal, window.innerWidth / 2, 280);
                const wpm = (lettersEnteredTotal / 5.0) / ((finishTime - startTime) / 60000.0);
                p5.text("Raw WPM: " + wpm, window.innerWidth / 2, 300);
                const freebieErrors = lettersExpectedTotal * 0.05;
                p5.text("Freebie errors: " + p5.nf(freebieErrors, 1, 3), window.innerWidth / 2, 320);
                const penalty = p5.max(errorsTotal - freebieErrors, 0) * 0.5;
                p5.text("Penalty: " + penalty, window.innerWidth / 2, 340);
                p5.text("WPM w/ penalty: " + (wpm - penalty), window.innerWidth / 2, 360);
                return;
            }

            p5.fill(100);
            const iaX = p5.width / 2 - sizeOfInputArea / 2;
            const iaY = p5.height / 2 - sizeOfInputArea / 2;
            p5.rect(iaX, iaY, sizeOfInputArea, sizeOfInputArea);

            if (startTime === 0 && !p5.mouseIsPressed) {
                p5.fill(128);
                p5.textAlign(p5.CENTER);
                p5.text("Click to start time!", 280, 150);
            }

            if (startTime === 0 && p5.mouseIsPressed) {
                nextTrial();
            }

            if (startTime !== 0) {
                p5.textAlign(p5.LEFT);
                p5.fill(128);
                p5.text("Phrase " + (currTrialNum + 1) + " of " + totalTrialNum, 70, 50);
                p5.text("Target:   " + currentPhrase, 70, 100);
                p5.text("Entered:  " + currentTyped + "|", 70, 140);

                p5.fill(255, 0, 0);
                p5.rect(window.innerWidth - 200, window.innerHeight - 200, 200, 200);
                p5.fill(255);
                p5.text("NEXT >", window.innerWidth - 150, window.innerHeight - 150);

                sliderX = iaX;
                sliderY = iaY + sizeOfInputArea / 2 - sliderH / 2;
                knobY = sliderY + sliderH / 2;

                p5.fill(220);
                p5.rect(sliderX, sliderY, sliderW, sliderH, 20);

                let t = (p5.mouseX - sliderX) / sliderW;
                t = p5.constrain(t, 0, 1);
                const index = Math.floor(t * (alphabet.length - 1));
                selectedLetter = alphabet[index];
                knobX = sliderX + t * sliderW;

                p5.fill(180);
                p5.ellipse(knobX, knobY, knobR, knobR);

                if (dragging) {
                    p5.stroke(0);
                    p5.strokeWeight(3);
                    p5.noFill();
                    p5.ellipse(knobX, knobY, knobR + 6, knobR + 6);
                    p5.noStroke();
                }

                p5.textAlign(p5.CENTER);
                p5.fill(0);
                p5.textSize(40);
                p5.text(selectedLetter, p5.width / 2, iaY + sizeOfInputArea * 0.25);
            }
        };

        function didMouseClick(x: number, y: number, w: number, h: number) {
            return p5.mouseX > x && p5.mouseX < x + w && p5.mouseY > y && p5.mouseY < y + h;
        }

        p5.mousePressed = () => {
            const d = p5.dist(p5.mouseX, p5.mouseY, knobX, knobY);
            if (d < knobR) dragging = true;

            if (didMouseClick(window.innerWidth - 200, window.innerHeight - 200, 200, 200))
                nextTrial();
        };

        p5.mouseReleased = () => {
            if (dragging) {
                currentTyped += selectedLetter;
            }
            dragging = false;
        };

        function nextTrial() {
            if (currTrialNum >= totalTrialNum) return;

            if (startTime !== 0 && finishTime === 0) {
                lettersExpectedTotal += currentPhrase.length;
                lettersEnteredTotal += currentTyped.length;
                errorsTotal += computeLevenshteinDistance(currentTyped.trim(), currentPhrase.trim());
            }

            if (currTrialNum === totalTrialNum - 1) {
                finishTime = p5.millis();
                currTrialNum++;
                return;
            }

            if (startTime === 0) {
                startTime = p5.millis();
            } else {
                currTrialNum++;
            }

            lastTime = p5.millis();
            currentTyped = "";
            currentPhrase = phrases[currTrialNum];
        }
    };

    new p5(protoFn);
    return <></>;
}