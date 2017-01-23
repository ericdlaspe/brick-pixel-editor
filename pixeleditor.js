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
var canvasDimY = 500;

var cOrange = color(254, 132, 0);
var cYellow = color(238, 254, 0);
var cBrown = color(161, 106, 47);
var cBlack = color(0, 0, 0);
var cPink = color(254, 187, 223);
var cBlue = color(41, 59, 254);
var cNavy = color(0, 12, 117);
var cGray = color(140, 140, 140);
var cPeach = color(254, 206, 122);
var cGreen = color(0, 184, 0);
var cPurple = color(144, 0, 196);
var cRed = color(255, 0, 0);
var cWhite = color(254, 254, 254);
var cErase = color(50, 50, 50);
var cGold = color(212, 175, 55);
var cSilver = color(192, 192, 192);
var cDarkGray = color(70, 70, 70);
var cDarkerGray = color(40, 40, 40);

var paletteColors = [
    cWhite,
    cBlack,
    cGray,
    cBrown,
    cOrange,
    cPeach,
    cYellow,
    cGreen,
    cBlue,
    cNavy,
    cPurple,
    cPink,
    cRed,
    cErase,
];

var miniPlateColors = [
    cWhite,
    cBlack,
    cSilver,
    cGold,
    cBlue,
    cNavy,
    cPink,
    cRed,
];

var darkColors = [cBlack, cNavy, cBlue, cPurple, cRed, cErase];

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

var miniPlatesOffsetX = 105;
var miniPlatesOffsetY = paletteOffsetY + paletteSlotSize + 40;
var miniPlatesLen = miniPlateColors.length;
var miniPlatesNCols = 4;
var miniPlateDimY = 40
var miniPlateDimX = 2.25 * miniPlateDimY;
var miniPlateSelected = 1;

// Set background to slightly different than black so empty nibs aren't
// counted as black bricks
var boardBgColor = cBlack + 1;
var boardStColor = cDarkerGray;

// Arrays of pixels, palette slots, etc.
var pA = [nPixels];
var pCounts = [paletteLen];

var f = createFont("sans-serif");
textFont(f);

var cursorDraw = function(xCenter, yBase, selColor) {
    var halfWidth = paletteSlotSize * 0.5;

    if (darkColors.includes(selColor))
        fill(cWhite);
    else
        fill(cBlack);
    noStroke();
    triangle(xCenter - halfWidth,
             yBase,
             xCenter + halfWidth,
             yBase,
             xCenter,
             yBase - paletteSlotSize * 0.3);
}

var miniPlateGetOffsetX = function(i) {
    var padding = 10;
    return (miniPlateDimX + padding) * (i % miniPlatesNCols) + miniPlatesOffsetX;
};

var miniPlateGetOffsetY = function(i) {
    var padding = 10;
    return (miniPlateDimY + padding) * floor(i / miniPlatesNCols) + miniPlatesOffsetY;
};

var miniPlatesDraw = function() {
    var i, j, k;
    var currentColor;
    var selColor = miniPlateColors[miniPlateSelected];
    var selOffsetX = miniPlateGetOffsetX(miniPlateSelected);
    var selOffsetY = miniPlateGetOffsetY(miniPlateSelected);
    var cornerX, cornerY;
    var nibsNCols = 9;
    var nibsNRows = 4;
    var nibOffsetX = floor(miniPlateDimX / (nibsNCols + 1));
    var nibOffsetY = floor(miniPlateDimY / (nibsNRows + 1));
    var nibDiam = 3;

    // Mini plates background
    fill(cWhite);
    noStroke();
    rect(miniPlateGetOffsetX(0) - 2,
         miniPlateGetOffsetY(0) - 2,
         400,
         100);

    for (i = 0; i < miniPlatesLen; i++) {
        cornerX = miniPlateGetOffsetX(i);
        cornerY = miniPlateGetOffsetY(i);

        currentColor = miniPlateColors[i];
        fill(currentColor);

        stroke(cDarkGray);
        strokeWeight(2);

        rect(miniPlateGetOffsetX(i),
             miniPlateGetOffsetY(i),
             miniPlateDimX, miniPlateDimY, 8);

        noFill();
        stroke(70, 70, 70, 100);
        // stroke(boardStColor);
        strokeWeight(1);
        for (j = 1; j <= nibsNCols; j++) {
            for (k = 1; k <= nibsNRows; k++) {
                ellipse(cornerX + nibOffsetX * j,
                        cornerY + nibOffsetY * k,
                        nibDiam, nibDiam);
            }
        }

    }

    cursorDraw(selOffsetX + miniPlateDimX * 0.5,
               selOffsetY + miniPlateDimY,
               selColor);
}

var updateBoardColor = function(newColor) {
    var idx;
    var pColor;
    newColor = newColor + 1;

    for (var i = 0; i < nCols; i++) {
        for (var j = 0; j < nRows; j++) {
            // Get current pixel color
            idx = nCols * j + i;
            pColor = pA[idx];

            // Change empty pixels
            if (pColor === boardBgColor)
                pA[idx] = newColor;
        }
    }

    boardBgColor = newColor;
}
var miniPlateHit = function(mX, mY) {
    var i;
    var hitColor;
    var lowerX, lowerY;

    for (i = 0; i < miniPlatesLen; i++) {
        lowerX = miniPlateGetOffsetX(i);
        lowerY = miniPlateGetOffsetY(i);

        if (mX >= lowerX && mX < lowerX + miniPlateDimX &&
            mY >= lowerY && mY < lowerY + miniPlateDimY) {

            hitColor = miniPlateColors[i];
            plateColor = hitColor;
            miniPlateSelected = i;
            miniPlatesDraw();
            updateBoardColor(plateColor);
            boardDraw();
            return true;
        }
    }

    return false;
};

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
    var selColor = paletteColors[paletteSelected];
    var selOffsetX = paletteSlotGetOffsetX(paletteSelected);
    var selOffsetY = paletteSlotGetOffsetY(paletteSelected);

    noStroke();
    fill(cBlack);
    textSize(14);
    textAlign(CENTER);

    // Palette background
    rect(paletteSlotGetOffsetX(0) - 2,
         paletteSlotGetOffsetY(0) - 2,
         paletteSlotSize * paletteNCols + 4,
         paletteSlotSize + 4);

    noStroke();

    for (i = 0; i < paletteLen; i++) {
        currentColor = paletteColors[i];
        fill(currentColor);
        rect(paletteSlotGetOffsetX(i),
             paletteSlotGetOffsetY(i),
             paletteSlotSize, paletteSlotSize);

        // Print counts in contrasting color
        if (darkColors.includes(currentColor))
            fill(cWhite);
        else
            fill(cBlack);

        textStr = '';
        if (currentColor === cErase)
            textStr = 'X';
        else if (pCounts[i] !== 0)
            textStr = pCounts[i];

        text(textStr,
             paletteSlotGetOffsetX(i) + slotTextOffsetX,
             paletteSlotGetOffsetY(i) + slotTextOffsetY);
    }

    // Identify selected color
    cursorDraw(selOffsetX + paletteSlotSize * 0.5,
               selOffsetY + paletteSlotSize,
               selColor);
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
    var i;
    var hitColor;
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
    fill(cWhite);
    rect(boardOffsetX, boardOffsetY, boardDimX, boardDimY);
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
                    stroke(cDarkGray);
                } else {
                    stroke(cBlack);
                }
                fill(pixelColor);
                rect(cornerX, cornerY, pSize, pSize);
            }

            // Draw nib
            if (boardBgColor - 1 === cNavy)
                stroke(cBlack);

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
    // Only check for board hit on click
    var pixHit = boardHit(mouseX, mouseY);
};

void mouseReleased() {
    // First check for palette hit
    if (paletteHit(mouseX, mouseY) || miniPlateHit(mouseX, mouseY))
        return;

    // Next check for board hit
    boardHit(mouseX, mouseY);
};

void setup() {
    size(canvasDimX, canvasDimY);
    background(cWhite);

    boardInit();
    paletteDraw();
    miniPlatesDraw();
}
