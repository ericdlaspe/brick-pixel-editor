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
var canvasDimY = 600;

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
var cTransparent = color(255, 0, 0, 0);

var paletteColors = [
    cWhite, cBlack, cGray, cNavy, cBlue,
    cYellow, cPeach, cOrange, cRed, cPurple,
    cGreen, cBrown, cPink, cErase
];

var paletteOffsetX = 125;
var paletteOffsetY = 320;
var paletteNCols = 5;
var palettePSize = 70;
var paletteLen = paletteColors.length;
var paletteSelected = 0;

var boardBgColor = cBlack + 1;
var boardStColor = color(40, 40, 40);

var drawColor = paletteColors[0];
var nCols = 36;
var nRows = 16;
var nPixels = nCols * nRows;
var pSize = floor(600 / nCols);
var offset = 12;
var pA = [nPixels];
var pCounts = [paletteLen];


var f = createFont("monospace");
textFont(f);


var paletteGetLowerBoundX = function(i) {
    return palettePSize * (i % paletteNCols) + paletteOffsetX;
};

var paletteGetLowerBoundY = function(i) {
    return palettePSize * floor(i / paletteNCols) + paletteOffsetY;
};

var paletteDraw = function() {
    var textStr;
    var currentColor;

    strokeWeight(2);
    stroke(cWhite);
    fill(cWhite);

    rect(paletteGetLowerBoundX(0) - 1,
         paletteGetLowerBoundY(0) - 1,
         palettePSize * paletteNCols + 2,
         palettePSize * 3 + 2);

    for (var i = 0; i < paletteLen; i++) {
        currentColor = paletteColors[i];
        strokeWeight(2);
        stroke(cWhite);
        fill(currentColor);
        rect(paletteGetLowerBoundX(i),
             paletteGetLowerBoundY(i),
             palettePSize, palettePSize);

        if (currentColor === cErase)
            textStr = 'Eraser';
        else
            textStr = pCounts[i];

        // Print counts in contrasting color
        if (currentColor <= cErase) {
            fill(255, 255, 255);
        } else {
            fill(40, 40, 40);
        }
        textSize(14);
        text(textStr,
             paletteGetLowerBoundX(i) + palettePSize * 0.05,
             paletteGetLowerBoundY(i) + palettePSize * 0.2);
    }

    // Stroke selected color in white
    strokeWeight(4);
    stroke(cBlack);
    fill(cTransparent);

    rect(paletteGetLowerBoundX(paletteSelected),
         paletteGetLowerBoundY(paletteSelected),
         palettePSize, palettePSize);
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

    for (var i = 0; i < paletteLen; i++) {
        lowerX = paletteGetLowerBoundX(i);
        lowerY = paletteGetLowerBoundY(i);

        if (mX >= lowerX && mX < lowerX + palettePSize &&
            mY >= lowerY && mY < lowerY + palettePSize) {

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

var boardGetLowerBound = function(i) {
    return floor(i * pSize + offset);
};

var numberColumns = function() {
    var i;

    fill(cGray);
    textSize(10);

    // Top edge of board
    text('1', pSize, 11);
    for (i = 0; i <= nCols; i += 4) {
        if (i === 0)
            continue;
        text(i, i * pSize, 11);
    }

    // Bottom edge of board
    text('1', pSize, (nRows + 1) * pSize);
    for (i = 0; i <= nCols; i += 4) {
        if (i === 0)
            continue;
        text(i, i * pSize, (nRows + 1) * pSize + 4);
    }
};

var numberRows = function(i) {
    var i;

    fill(cGray);
    textSize(10);

    // Left side of board
    text('1', 7, pSize + 8);
    for (i = 0; i <= nRows; i += 4) {
        if (i === 0)
            continue;
        if (i < 10)
            text(i, 7, i * pSize + 8);
        else
            text(i, 1, i * pSize + 8);
    }

    // Right side of board
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
    rect(0, 0, 600, pSize * (nRows + 2) - 8, 16);
};

var boardDraw = function() {
    var i, j;
    var pixelColor = pA
    var cornerX, cornerY;
    var circleOffset = pSize/2;
    var circleDiam = 8;
    var LabelNum = 1;

    strokeWeight(1);
    noStroke();

    boardBgDraw();
    numberColumns();
    numberRows();

    for (i = 0; i < nCols; i++) {
        for (j = 0; j < nRows; j++) {

            // Get pixel parameters
            pixelColor = pA[nCols * j + i];
            cornerX = boardGetLowerBound(i);
            cornerY = boardGetLowerBound(j);

            if (pixelColor === boardBgColor)
                noStroke();
            else
                stroke(boardStColor);

            // Draw pixel
            fill(pixelColor);
            rect(cornerX,
                 cornerY,
                 pSize, pSize);

            // Draw the nib
            if (pixelColor === boardBgColor)
                stroke(boardStColor);
            else if (pixelColor === cBlack)
                stroke(color(70, 70, 70));
            else
                stroke(cBlack);

            ellipse(cornerX + circleOffset + 1,
                    cornerY + circleOffset + 1,
                    circleDiam, circleDiam);
            ellipse(cornerX + circleOffset,
                    cornerY + circleOffset,
                    circleDiam, circleDiam);
        }
    }

};

var boardHit = function(mX, mY) {
    var i, j;
    var lowerX, lowerY;
    var pixelColor;

    for (i = 0; i < nCols; i++) {
        for (j = 0; j < nRows; j++) {
            lowerX = boardGetLowerBound(i);
            lowerY = boardGetLowerBound(j);

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
