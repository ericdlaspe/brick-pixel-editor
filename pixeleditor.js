// Ported to Processing.js from my Khan Academy project, here:
// https://www.khanacademy.org/computer-programming/brick-brick-gear-pixel-creator/5760802139734016

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
var cClear = color(50, 50, 51);
var cTransparent = color(255, 0, 0, 0);

var paletteColors = [
    cWhite, cBlack, cGray, cNavy, cBlue,
    cYellow, cPeach, cOrange, cRed, cPurple,
    cGreen, cBrown, cPink, cErase, cClear
];

var paletteOffsetX = 79;
var paletteOffsetY = 300;
var paletteNCols = 5;
var palettePSize = 89;
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

textSize(18);
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

    strokeWeight(3);
    stroke(cBlack);

    for (var i = 0; i < paletteLen; i++) {
        var currentColor = paletteColors[i];
        fill(currentColor);
        rect(paletteGetLowerBoundX(i),
             paletteGetLowerBoundY(i),
             palettePSize, palettePSize);

        // Print counts in contrasting color
        if (currentColor <= cClear) {
            fill(255, 255, 255);
        } else {
            fill(40, 40, 40);
        }

        if (currentColor === cErase) {
            textStr = 'Eraser';
        } else if (currentColor === cClear) {
            textStr = 'Clear';
        } else {
            textStr = pCounts[i];
        }

        text(textStr,
             paletteGetLowerBoundX(i) + palettePSize * 0.1,
             paletteGetLowerBoundY(i) + palettePSize * 0.3);
    }

    // Stroke selected color in white
    strokeWeight(3);
    stroke(cWhite);
    fill(cTransparent);

    rect(paletteGetLowerBoundX(paletteSelected),
         paletteGetLowerBoundY(paletteSelected),
         palettePSize, palettePSize);
};

var updatePixelCounts = function() {
    for (var c = 0; c < paletteLen; c++) {
        pCounts[c] = 0;
    }

    for (var i = 0; i < nPixels; i++) {
        for (var c = 0; c < paletteLen; c++) {
            if (pA[i] === paletteColors[c]) {
                ++pCounts[c];
            }
        }
    }

    paletteDraw();
};

var paletteHit = function(mX, mY) {
    var hitColor;

    for (var i = 0; i < paletteLen; i++) {
        var lowerX = paletteGetLowerBoundX(i);
        var lowerY = paletteGetLowerBoundY(i);

        if (mX >= lowerX && mX < lowerX + palettePSize &&
            mY >= lowerY && mY < lowerY + palettePSize) {

            hitColor = paletteColors[i];
            if (hitColor === cClear) {
                boardInit();

                return true;
            }
            drawColor = hitColor;
            paletteSelected = i;
            paletteDraw();
            return true;
        }
    }

    return false;
};

var boardGetLowerBound = function(i) {
    return floor(i * pSize + offset);
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

var boardDraw = function() {
    strokeWeight(1);
    noStroke();

    for (var i = 0; i < nCols; i++) {
        for (var j = 0; j < nRows; j++) {

            // Get pixel parameters
            var pixelColor = pA[nCols * j + i];
            var cornerX = boardGetLowerBound(i);
            var cornerY = boardGetLowerBound(j);
            var circleOffset = pSize/2;
            var circleDiam = 9;

            if (pixelColor !== boardBgColor) {
                stroke(boardStColor);
            } else {
                noStroke();
            }
            // Draw pixel
            fill(pixelColor);
            rect(cornerX,
                 cornerY,
                 pSize, pSize);

            // Draw the nib
            stroke(boardStColor);
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
    for (var i = 0; i < nCols; i++) {
        for (var j = 0; j < nRows; j++) {
            var lowerX = boardGetLowerBound(i);
            var lowerY = boardGetLowerBound(j);

            if (mX >= lowerX && mX < lowerX + pSize &&
                mY >= lowerY && mY < lowerY + pSize) {

                var pixelColor = drawColor;
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

void mouseClicked() {
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
    size(600, 600);
    background(cBlack);

    boardInit();
    paletteDraw();
}
