"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getArmorMultiplier = exports.getAPCoefficient = exports.getAttackTable = exports.getRangedAttackTable = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _util = require("util");

var _decimal = _interopRequireDefault(require("decimal.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var clamp = function clamp(value, min, max) {
  return _decimal.default.max(_decimal.default.min(value, max), min).toNumber();
};

var getRangedAttackTable = function getRangedAttackTable(stats) {
  var MISS_CHANCE = clamp((0, _decimal.default)(9 - stats.hitChance), 0, 100);
  var HIT_CHANCE = (0, _decimal.default)(100 - MISS_CHANCE);
  var CRIT_CHANCE = clamp((0, _decimal.default)(stats.critChance), 0, HIT_CHANCE);
  var ORDINARY_HIT_CHANCE = clamp((0, _decimal.default)(100).minus(MISS_CHANCE).minus(CRIT_CHANCE), 0, 100);
  return {
    miss: MISS_CHANCE / 100,
    crit: CRIT_CHANCE / 100,
    hit: ORDINARY_HIT_CHANCE / 100
  };
};

exports.getRangedAttackTable = getRangedAttackTable;

var getAttackTable = function getAttackTable(type, rawStats, weapons) {
  var bonus = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var DUALWIELDING = !!(weapons[0] && weapons[1]);

  var stats = _lodash.default.mergeWith({}, rawStats, bonus, _util.addNumbers); // Base miss chance against level 73 is 9% (+19% if dualwielding)


  var MISS_CHANCE_WHITE = _lodash.default.clamp(9 + (DUALWIELDING ? 19 : 0) - stats.hitChance, 0, 100);

  var MISS_CHANCE_YELLOW = _lodash.default.clamp(9 - stats.hitChance, 0, 100);

  var DODGE_CHANCE = _lodash.default.clamp(6.5 - Math.floor(stats.expertise) * 0.25, 0, 100);

  var PARRY_CHANCE = 0;
  var GLANCE_CHANCE = 25;
  var HIT_CHANCE_WHITE = 100 - MISS_CHANCE_WHITE - DODGE_CHANCE - PARRY_CHANCE - GLANCE_CHANCE;
  var HIT_CHANCE_YELLOW = 100 - MISS_CHANCE_YELLOW - DODGE_CHANCE - PARRY_CHANCE;

  var CRIT_CHANCE_WHITE = _lodash.default.clamp(stats.critChance, 0, HIT_CHANCE_WHITE);

  var CRIT_CHANCE_YELLOW = _lodash.default.clamp(stats.critChance, 0, HIT_CHANCE_YELLOW);

  var ORDINARY_HIT_CHANCE_WHITE = _lodash.default.clamp(100 - CRIT_CHANCE_WHITE - MISS_CHANCE_WHITE - GLANCE_CHANCE - DODGE_CHANCE - PARRY_CHANCE, 0, 100);

  var ORDINARY_HIT_CHANCE_YELLOW = _lodash.default.clamp(100 - CRIT_CHANCE_YELLOW - MISS_CHANCE_YELLOW - DODGE_CHANCE - PARRY_CHANCE, 0, 100);

  if (type === 'white') {
    return {
      miss: MISS_CHANCE_WHITE / 100,
      dodge: DODGE_CHANCE / 100,
      parry: PARRY_CHANCE / 100,
      glance: GLANCE_CHANCE / 100,
      crit: CRIT_CHANCE_WHITE / 100,
      hit: ORDINARY_HIT_CHANCE_WHITE / 100
    };
  }

  return {
    miss: MISS_CHANCE_YELLOW / 100,
    dodge: DODGE_CHANCE / 100,
    parry: PARRY_CHANCE / 100,
    crit: CRIT_CHANCE_YELLOW / 100,
    hit: ORDINARY_HIT_CHANCE_YELLOW / 100
  };
};

exports.getAttackTable = getAttackTable;

var getAPCoefficient = function getAPCoefficient(weapon) {
  switch (weapon.subclass) {
    case 'dagger':
      return 1.7;

    case 'mace_2h':
    case 'sword_2h':
    case 'poleaxe_2h':
      return 3.3;

    case 'mace_1h':
    case 'sword_1h':
    case 'fist_weapon':
      return 2.4;

    default:
      return 2.4;
  }
}; // DR% = Armor / (Armor + 400 + 85 * (AttackerLevel + 4.5 * (AttackerLevel - 59)))


exports.getAPCoefficient = getAPCoefficient;

var getArmorMultiplier = function getArmorMultiplier(armor) {
  return 1 - armor / (armor + 400 + 85 * (70 + 4.5 * (70 - 59)));
};

exports.getArmorMultiplier = getArmorMultiplier;