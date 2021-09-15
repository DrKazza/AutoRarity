const Ability = require('./ability');
const constVal = require('../../const');

class Token {
    id = 0;
    owner = "";
    xp = 0;
    log = 0;
    class = 0;
    level = 0;
    ability = new Ability();
    gold = 0;
    material_1 = 0;

    getClassName(){
        return constVal.classes[this.class];
    }

}

module.exports = Token;