class Component {
    constructor(symbol, value) {
        this.symbol = symbol;
        this.value = value;
    }

    isPresent() {
        return !(isNaN(this.value) || this.value == null);
    }
}

class Formula {
    constructor(components, func, latex, name) {
        this.components = components;
        this.func = func;
        this.latex = latex;
        this.name = name;
    }    
    
    result() {
        return this.func.apply(null, this.components);
    }    

    isOfUse() {
        let numOfNotPresent = 0;
        for (let c in this.components) {
            if (!this.components[c].isPresent())
                numOfNotPresent++;
        }
        return numOfNotPresent == 0;
    }    
}

class TwoCompFormula extends Formula {
    constructor(comp1, comp2, func2, latex, name) {
        super([comp1, comp2], func2, latex, name);
    }
}

class ThreeCompFormula extends Formula {
    constructor(comp1, comp2, comp3, func3, latex, name) {
        super([comp1, comp2, comp3], func3, latex, name);
    }
}

class AngleSumTheorem extends TwoCompFormula {
    constructor(othAng1, othAng2) {
        let latex = "180^\\circ-"+othAng1.symbol+"-"+othAng2.symbol;
        super(othAng1, othAng2, (a1, a2) => {return normalizeAngle(180-a1.value-a2.value)}, latex, "Winkelsummensatz");
    }
}

class SineTheoremSide extends ThreeCompFormula {
    constructor(oppAng, othAng, othSide) {
        let func = function (oppAngC, otherAngC, otherSideC) {
            return normalizeSide(Math.sin(degToRad(oppAngC.value))*(otherSideC.value)/Math.sin(degToRad(otherAngC.value)));
        };
        let latex = "\\cfrac{"+othSide.symbol+"}{\\sin("+othAng.symbol+")}\\cdot\\sin("+oppAng.symbol+")";
        super(oppAng, othAng, othSide, func, latex, "Sinussatz");
    }
}

class SineTheoremAngle extends ThreeCompFormula {
    constructor(oppSide, othAng, othSide) {
        let func = function (oppSideC, otherAngC, otherSideC) {
            return normalizeAngle(radToDeg(Math.asin(Math.sin(degToRad(otherAngC.value))*oppSideC.value/otherSideC.value)));
        };
        let latex = "\\arcsin(\\cfrac{"+oppSide.symbol+"}{"+othSide.symbol+"}\\cdot\\sin("+othAng.symbol+"))";
        super(oppSide, othAng, othSide, func, latex, "Sinussatz");
    }
}

class CosineTheoremSide extends ThreeCompFormula {
    constructor(othSide1, othSide2, oppAng) {
        let func = (a, b, gamma) => {
            return normalizeSide(Math.sqrt(Math.pow(a.value, 2)+ Math.pow(b.value, 2)-2*a.value*b.value*Math.cos(degToRad(gamma.value))));
        };
        let latex = "\\sqrt{"+othSide1.symbol+"^2+"+othSide2.symbol+"^2-2"+othSide1.symbol+othSide2.symbol+"\\cdot\\cos("+oppAng.symbol+")}";
        super(othSide1, othSide2, oppAng, func, latex, "Kosinussatz");
    }
}

class CosineTheoremAngle extends ThreeCompFormula {
    constructor(oppSide, othSide1, othSide2) {
        let func = (c, a, b) => {
            return normalizeAngle(radToDeg(Math.acos((Math.pow(a.value, 2)+Math.pow(b.value, 2)-Math.pow(c.value, 2))/(2*a.value*b.value))));
        };
        let latex = "\\arccos(\\cfrac{"+othSide1.symbol+"^2+"+othSide2.symbol+"^2-"+oppSide.symbol+"^2"+"}{2"+othSide1.symbol+othSide2.symbol+"})";
        super(oppSide, othSide1, othSide2, func, latex, "Kosinussatz");
    }
}

function radToDeg(rad) {
    return (180/Math.PI)*rad;
}

function degToRad(deg) {
    return (Math.PI/180)*deg;
}

function normalizeSide(side) {
    return Math.abs(side);
}

function normalizeAngle(angle) {
    return angle % 360;
}