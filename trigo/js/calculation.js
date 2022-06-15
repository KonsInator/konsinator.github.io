var values = {
    "alpha": new Component("\\alpha", NaN),
    "beta": new Component("\\beta", NaN),
    "gamma": new Component("\\gamma", NaN),
    "side_a": new Component("a", NaN),
    "side_b": new Component("b", NaN),
    "side_c": new Component("c", NaN)
};

var sides = ["side_a", "side_b", "side_c"];
var angles = ["alpha", "beta", "gamma"];

var oppositeSide = {
    "alpha": "side_a",
    "beta": "side_b",
    "gamma": "side_c"
};

var oppositeAngle = {
    "side_a": "alpha",
    "side_b": "beta",
    "side_c": "gamma"
};

var formulas = {
    "alpha": [],
    "beta": [],
    "gamma": [],
    "side_a": [],
    "side_b": [],
    "side_c": []
};

var used_formulas = {};

function appendFormulaTo(key, formula) {
    formulas[key].push(formula);
}

function appendFormulasTo(key, formula_arr) {
    for (let f in formula_arr) {
        appendFormulaTo(key, f);
    }
}

function initSineAndCosineTheorem() {
    // sides
    for (let side in sides) {
        let oppAng = oppositeAngle[sides[side]];
        let other_sides = getArrayCopyWithoutIndex(sides, side)
        for (let other_side in other_sides) {
            let othAng = oppositeAngle[other_sides[other_side]];
            appendFormulaTo(sides[side], new SineTheoremSide(values[oppAng], values[othAng], values[other_sides[other_side]]));
        }
        appendFormulaTo(sides[side], new CosineTheoremSide(values[other_sides[0]], values[other_sides[1]], values[oppAng]));
    }

    // angles
    for (let angle in angles) {
        let oppSide = oppositeSide[angles[angle]];
        let other_angles = getArrayCopyWithoutIndex(angles, angle);
        for (let other_angle in other_angles) {
            let othSide = oppositeSide[other_angles[other_angle]];
            appendFormulaTo(angles[angle], new SineTheoremAngle(values[oppSide], values[other_angles[other_angle]], values[othSide]));
        }
        appendFormulaTo(angles[angle], new CosineTheoremAngle(values[oppSide], values[oppositeSide[other_angles[0]]], values[oppositeSide[other_angles[1]]]));
    }
}

function getArrayCopyWithoutIndex(arr, index) {
    let cpy = arr.slice();
    cpy.splice(index, 1);
    return cpy;
}

function initAngleSumTheorem() {
    for (let angle in angles) {
        let other_angles = getArrayCopyWithoutIndex(angles, angle);
        appendFormulaTo(angles[angle], new AngleSumTheorem(values[other_angles[0]], values[other_angles[1]]));
    }
}

function initFormulas() {
    initAngleSumTheorem();
    initSineAndCosineTheorem();
}

function updateValuesFromInputs() {
    let num_given_angles = 0;
    let num_given_sides = 0;
    for (let key in values) {
        let input = document.getElementById(key).valueAsNumber;
        if (!isNaN(input))
            isAngle(key) ? num_given_angles++ : num_given_sides++;

        if (isAngle(key))
            input = normalizeAngle(input);
        else if (isSide(key))
            input = normalizeSide(input);

        values[key].value = input;
    }

    // validity check
    if (num_given_angles == 3) {
        if (sumAllAngles() != 180) {
            showAlert("Die drei Winkel ergeben zusammen nicht 180 &deg;.");
            return false;
        }
    }
    
    if (sumAllAngles() > 180) {
        showAlert("Die gegebenen Winkel d&uuml;rfen zusammen nicht gr&ouml;&szlig;er als 180 &deg; sein.");
        return false;
    }

    if ((num_given_angles == 2 && num_given_sides == 2) || (num_given_angles == 1 && num_given_sides == 3)) {
        showAlert("Das Dreieck ist &uuml;berbestimmt. Die angezeigten Werte sind wahrscheinlich nicht richtig.");
        return false;
    }

    if (num_given_sides == 3) {
        let side_lengths = getSideLengths();
        let max_l = Math.max.apply(null, side_lengths);
        side_lengths.splice(side_lengths.indexOf(max_l), 1);
        if (side_lengths.reduce((a, b) => a+b, 0) < max_l) {
            showAlert("Es gibt kein Dreieck mit diesen Seitenl&auml;ngen.");
            return false;
        }
    }

    return true;

    function sumAllAngles() {
        let sum = 0;
        for (let i in angles) {
            sum += values[angles[i]].value || 0;
        }
        return sum;
    }

    function getSideLengths() {
        let s = [];
        for (let key in values) {
            if (isSide(key)) {
                s.push(values[key].value);
            }
        }
        return s;
    }
}

function calc() {
    clearAlerts();
    used_formulas = {};
    if (!updateValuesFromInputs()) {
        clearFormulaView();
        return;
    }
    
    calculateRemaining();
    updateFormulaView();
    updateValueView();
    if (allAnglesCalculated()) {
        triangle.adjustTo(values);
        triangle.draw();
    }
}

function updateValueView() {
    for (let key in values) {
        let val = values[key].value;
        if (!isNaN(val)) {
            document.getElementById(key).placeholder = isAngle(key) ? roundPostPoint(val, 1) : roundPostPoint(val, 2);
        } else {
            document.getElementById(key).placeholder = "";
        }
    }
    showMetadata();
}

function showMetadata() {
    let content = "";

    if (isAllCalculated()) {
        let area = claculateArea();
        let circ = calculateCircumference();

        content += "Fl&auml;che: "+roundPostPoint(area, 3)+" FE\n";
        content += "Umfang: "+roundPostPoint(circ, 2)+"\n";
        content += "H&ouml;he &uuml;ber a: "+roundPostPoint(Math.sin(values.beta.value)*values.side_c.value, 2)+"\n";
        content += "H&ouml;he &uuml;ber b: "+roundPostPoint(Math.sin(values.alpha.value)*values.side_c.value, 2)+"\n";
        content += "H&ouml;he &uuml;ber c: "+roundPostPoint(Math.sin(values.alpha.value)*values.side_b.value, 2)+"\n";
    }

    document.getElementById("metadata").innerHTML = content;
}

function calculateCircumference() {
    let circ = 0;
    for (let s in sides)
        circ += values[sides[s]].value;

        return circ;
}

function claculateArea() {
    return values.side_c.value*Math.sin(degToRad(values.alpha.value))*values.side_b.value/2;
}

function roundPostPoint(n, digits) {
    let pow = Math.pow(10, digits);
    return Math.round(n*pow)/pow;
}

function isAngle(key) {
    return angles.includes(key);
}

function isSide(key) {
    return sides.includes(key);
}

function updateFormulaView() {
    let formulaView = document.getElementById("formulas");
    formulaView.innerHTML = "";
    for (let key in used_formulas) {
        let formulaDiv = createFormulaDivOf(key);
        formulaView.appendChild(formulaDiv);
    }
}

function clearFormulaView() {
    let formulaView = document.getElementById("formulas");
    formulaView.innerHTML = "";
}

function createFormulaDivOf(key) {
    let formulaDiv = document.createElement("div");
    formulaDiv.className = "formula";

    formulaDiv.appendChild(createFormulaParOf(key));
    formulaDiv.appendChild(createFormulaNameParOf(key));
    return formulaDiv;
}

function createFormulaParOf(key) {
    let formulaPar = document.createElement("p");
    formulaPar.className = "formula-par";
    formulaPar.innerText = "\\("+values[key].symbol+"="+used_formulas[key].latex+"\\)";
    MathJax.typeset([formulaPar]);
    return formulaPar;
} 

function createFormulaNameParOf(key) {
    let formulaNamePar = document.createElement("p");
    formulaNamePar.className = "formula-name";
    formulaNamePar.innerText = used_formulas[key].name;
    return formulaNamePar;
}

function calculateRemaining() {
    let numOfValsBefore;
    let numOfValsAfter = numberOfValues();
    do {
        numOfValsBefore = numOfValsAfter;
        for (let key in values) {
            if (!values[key].isPresent()) {
                for (let formula in formulas[key]) {
                    let f = formulas[key][formula];
                    if (f.isOfUse()) {
                        values[key].value = f.result();
                        used_formulas[key] = f;
                    }
                }
            }
        }
        numOfValsAfter = numberOfValues();
    } while (numOfValsBefore < numOfValsAfter)
}

function isAllCalculated() {
    return numberOfValues() == 6;
}

function allAnglesCalculated() {
    return (values["alpha"].isPresent() && values["beta"].isPresent() && values["gamma"].isPresent());
}

function numberOfValues() {
    let  number = 0;
    for (let key in values) {
        if (values[key].isPresent())
            number++;
    }
    return number;
}