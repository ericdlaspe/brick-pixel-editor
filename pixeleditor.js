// MIT License
//
// Copyright (c) 2017 Eric Laspe
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// Ported to Processing.js from my Khan Academy project, here:
// https://www.khanacademy.org/computer-programming/brick-brick-gear-pixel-creator/5760802139734016

var canvasDimX = 600;
var canvasDimY = canvasDimX;

var cOrange = color(255, 132, 0);
var cYellow = color(238, 255, 0);
var cBrown = color(161, 106, 47);
var cBlack = color(0, 0, 0);
var cPink = color(254, 187, 223);
var cBlue = color(41, 59, 255);
var cNavy = color(0, 12, 117);
var cGray = color(140, 140, 140);
var cPeach = color(255, 206, 122);
var cGreen = color(0, 184, 0);
var cPurple = color(144, 0, 196);
var cRed = color(255, 0, 0);
var cWhite = color(255, 255, 255);
var cErase = color(50, 50, 50);

var paletteColors = [
    cWhite, cBlack, cGray, cNavy, cBlue,
    cYellow, cPeach, cOrange, cRed, cPurple,
    cGreen, cBrown, cPink, cErase
];

var drawColor = paletteColors[0];
var nCols = 36;
var nRows = 16;
var nPixels = nCols * nRows;
var pSize = floor(canvasDimX / nCols);
var offset = 12;

var boardOffsetX = 0;
var boardOffsetY = 0;
var boardDimX = canvasDimX;
var boardDimY = pSize * (nRows + 2) - 8;
var boardCornerRad = 16;

var paletteOffsetX = 20;
var paletteOffsetY = boardOffsetY + boardDimY + 20;
var paletteNCols = 14;
var paletteSlotSize = 40;
var paletteLen = paletteColors.length;
var paletteSelected = 0;

// Set background to slightly different than black so empty nibs aren't
// counted as black bricks
var boardBgColor = cBlack + 1;
var boardStColor = color(40, 40, 40);

// Arrays of pixels, palette slots, etc.
var pA = [nPixels];
var pCounts = [paletteLen];

var f = createFont("sans-serif");
textFont(f);


var paletteSlotGetOffsetX = function(i) {
    return paletteSlotSize * (i % paletteNCols) + paletteOffsetX;
};

var paletteSlotGetOffsetY = function(i) {
    return paletteSlotSize * floor(i / paletteNCols) + paletteOffsetY;
};

var paletteDraw = function() {
    var i
    var textStr;
    var currentColor;
    var slotTextOffsetX = paletteSlotSize * 0.5;
    var slotTextOffsetY = paletteSlotSize * 0.6;

    strokeWeight(2);
    stroke(cWhite);
    fill(cWhite);
    textSize(14);
    textAlign(CENTER);

    rect(paletteSlotGetOffsetX(0) - 1,
         paletteSlotGetOffsetY(0) - 1,
         paletteSlotSize * paletteNCols + 2,
         paletteSlotSize + 2);

    for (i = 0; i < paletteLen; i++) {
        currentColor = paletteColors[i];
        fill(currentColor);
        rect(paletteSlotGetOffsetX(i),
             paletteSlotGetOffsetY(i),
             paletteSlotSize, paletteSlotSize);

        // Print counts in contrasting color
        if ([cBlack, cNavy, cBlue, cPurple, cErase].includes(currentColor)) {
            fill(cWhite);
        } else {
            fill(cBlack);
        }

        textStr = '';
        if (currentColor === cErase)
            textStr = 'X';
        else if (pCounts[i] !== 0)
            textStr = pCounts[i];

        text(textStr,
             paletteSlotGetOffsetX(i) + slotTextOffsetX,
             paletteSlotGetOffsetY(i) + slotTextOffsetY);
    }

    // Stroke selected color in white
    strokeWeight(4);
    stroke(cBlack);
    noFill();
    rect(paletteSlotGetOffsetX(paletteSelected),
         paletteSlotGetOffsetY(paletteSelected),
         paletteSlotSize, paletteSlotSize);
};

var updatePixelCounts = function() {
    var c, i;
    for (c = 0; c < paletteLen; c++) {
        pCounts[c] = 0;
    }

    for (i = 0; i < nPixels; i++) {
        for (c = 0; c < paletteLen; c++) {
            if (pA[i] === paletteColors[c]) {
                ++pCounts[c];
            }
        }
    }

    paletteDraw();
};

var paletteHit = function(mX, mY) {
    var hitColor;
    var i;
    var lowerX, lowerY;

    for (i = 0; i < paletteLen; i++) {
        lowerX = paletteSlotGetOffsetX(i);
        lowerY = paletteSlotGetOffsetY(i);

        if (mX >= lowerX && mX < lowerX + paletteSlotSize &&
            mY >= lowerY && mY < lowerY + paletteSlotSize) {

            hitColor = paletteColors[i];
            drawColor = hitColor;
            paletteSelected = i;
            paletteDraw();
            return true;
        }
    }

    return false;
};

// Based on the linear gradient here:
// http://processingjs.org/learning/basic/lineargradient/
var setGradient = function(x, y, w, h) {
    var i;
    var j;
    var fromColor = cGray;
    var toColor = cWhite;
    var c;
    var endCol = x + w;
    var endRow = y + h;

    // calculate differences between color components
    var deltaR = red(toColor) - red(fromColor);
    var deltaG = green(toColor) - green(fromColor);
    var deltaB = blue(toColor) - blue(fromColor);

    // Set pixels
    for (i = x; i <= endCol; i++) {
        for (j = y; j <= endRow; j++) {
            c = color((red(fromColor)+j*(deltaR/h)),
                      (green(fromColor)+j*(deltaG/h)),
                      (blue(fromColor)+j*(deltaB/h)));
            set(i, j, c);
        }
    }
};

var pixelGetOffset = function(i) {
    return floor(i * pSize + offset);
};

var numberColumns = function() {
    var i;
    var topOffsetY = 11;
    var bottomOffsetY = (nRows + 1) * pSize + 4;
    var offsetX = 4;

    fill(cGray);
    textSize(10);
    textAlign(CENTER);

    // Top edge of board
    text('1', pSize + offsetX, topOffsetY);
    for (i = 0; i <= nCols; i += 4) {
        if (i === 0)
            continue;
        text(i, i * pSize + offsetX, topOffsetY);
    }

    // Bottom edge of board
    text('1', pSize + offsetX, bottomOffsetY);
    for (i = 0; i <= nCols; i += 4) {
        if (i === 0)
            continue;
        text(i, i * pSize + offsetX, bottomOffsetY);
    }
};

var numberRows = function(i) {
    var i;
    var offsetX = 14;

    fill(cGray);
    textSize(10);

    // Left side of board
    textAlign(RIGHT);
    text('1', offsetX, pSize + 8);
    for (i = 0; i <= nRows; i += 4) {
        if (i === 0)
            continue;
        text(i, offsetX, i * pSize + 8);
    }

    // Right side of board
    textAlign(LEFT);
    text('1', canvasDimX - 13, pSize + 8);
    for (i = 0; i <= nRows; i += 4) {
        if (i === 0)
            continue;
        text(i, canvasDimX - 13, i * pSize + 8);
    }
};

var boardInit = function() {
    for (var i = 0; i < nCols; i++) {
        for (var j = 0; j < nRows; j++) {

            // Init each pixel color
            pA[nCols * j + i] = boardBgColor;
        }
    }

    updatePixelCounts();
    boardDraw();
};

var boardBgDraw = function() {
    fill(boardBgColor);
    rect(boardOffsetX, boardOffsetY, boardDimX, boardDimY, boardCornerRad);
};

var boardDraw = function() {
    var i, j;
    var pixelColor = pA
    var cornerX, cornerY;
    var nibOffset = pSize / 2;
    var nibDiam = 8;

    strokeWeight(1);
    noStroke();

    boardBgDraw();
    numberColumns();
    numberRows();

    for (i = 0; i < nCols; i++) {
        for (j = 0; j < nRows; j++) {

            // Get pixel parameters
            pixelColor = pA[nCols * j + i];
            cornerX = pixelGetOffset(i);
            cornerY = pixelGetOffset(j);

            fill(boardBgColor);
            stroke(boardStColor);

            // Draw brick
            if (pixelColor !== boardBgColor) {
                if (pixelColor === cBlack) {
                    stroke(color(70, 70, 70));
                } else {
                    stroke(cBlack);
                }
                fill(pixelColor);
                rect(cornerX, cornerY, pSize, pSize);
            }

            // Draw nib
            ellipse(cornerX + nibOffset + 1,
                    cornerY + nibOffset + 1,
                    nibDiam, nibDiam);
            ellipse(cornerX + nibOffset,
                    cornerY + nibOffset,
                    nibDiam, nibDiam);
        }
    }

};

var boardHit = function(mX, mY) {
    var i, j;
    var lowerX, lowerY;
    var pixelColor;

    for (i = 0; i < nCols; i++) {
        for (j = 0; j < nRows; j++) {
            lowerX = pixelGetOffset(i);
            lowerY = pixelGetOffset(j);

            if (mX >= lowerX && mX < lowerX + pSize &&
                mY >= lowerY && mY < lowerY + pSize) {

                pixelColor = drawColor;
                if (drawColor === cErase) {
                    pixelColor = boardBgColor;
                }
                pA[nCols * j + i] = pixelColor;
                updatePixelCounts();
                boardDraw();
                return;
            }
        }
    }
};

void mouseDragged() {
    // Only check for board hit on drag
    var pixHit = boardHit(mouseX, mouseY);
};

void mousePressed() {
    // Only check for board hit on drag
    var pixHit = boardHit(mouseX, mouseY);
};

void mouseReleased() {
    // First check for palette hit
    if (paletteHit(mouseX, mouseY)) {
        return;
    }

    // Next check for board hit
    boardHit(mouseX, mouseY);
};

void setup() {
    size(canvasDimX, canvasDimY);
    background(cWhite);
    setGradient(0, canvasDimY * 0.4, canvasDimX, canvasDimY * 0.9);

    boardInit();
    paletteDraw();
}
