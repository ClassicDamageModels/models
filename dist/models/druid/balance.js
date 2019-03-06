"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _abilities = _interopRequireDefault(require("../../domain/abilities"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = function _default(_ref) {
  var stats = _ref.vitals,
      target = _ref.target;
  var HIT_CHANCE = (100 - (16 - _lodash.default.clamp(stats.spellhitChance, 0, 16) + 1)) / 100;
  var NUM_STARFIRES_PER_ROTATION = 4;
  var NUM_MOONFIRES_PER_ROTATION = 1;
  var MOONFIRE_CRIT_CHANCE = (stats.spellcritChance + 10) / 100;
  var STARFIRE_CRIT_CHANCE = (stats.spellcritChance + 4) / 100;
  var AVERAGE_CRIT_CHANCE = (STARFIRE_CRIT_CHANCE * NUM_STARFIRES_PER_ROTATION + MOONFIRE_CRIT_CHANCE) / (NUM_STARFIRES_PER_ROTATION + NUM_MOONFIRES_PER_ROTATION);
  var HASTE_FROM_NATURES_GRACE = HIT_CHANCE * AVERAGE_CRIT_CHANCE * 0.5;
  var STARFIRE_CAST_TIME = _abilities.default.starfire.castTime / (1 + stats.spellhaste / 100 + HASTE_FROM_NATURES_GRACE);
  var MOONFIRE_CAST_TIME = _abilities.default.moonfire.castTime / (1 + stats.spellhaste / 100);
  var ROTATION_DURATION_SECONDS = MOONFIRE_CAST_TIME + NUM_STARFIRES_PER_ROTATION * STARFIRE_CAST_TIME;
  var DAMAGE_MULTIPLIER = 1 * 1.1 * // Talent: Moonfire
  target.multipliers.arcane;
  var STARFIRE_DAMAGE = (_abilities.default.starfire.damage + _abilities.default.starfire.coefficient * stats.spelldamage) * DAMAGE_MULTIPLIER;
  var STARFIRE_HIT_COMPONENT = HIT_CHANCE * (1 - STARFIRE_CRIT_CHANCE) * STARFIRE_DAMAGE;
  var STARFIRE_CRIT_COMPONENT = HIT_CHANCE * STARFIRE_CRIT_CHANCE * STARFIRE_DAMAGE * 2;
  var STARFIRE_DPS = NUM_STARFIRES_PER_ROTATION * (STARFIRE_HIT_COMPONENT + STARFIRE_CRIT_COMPONENT) / ROTATION_DURATION_SECONDS;
  var MOONFIRE_DAMAGE = (_abilities.default.moonfire.damage + _abilities.default.moonfire.coefficient * stats.spelldamage) * DAMAGE_MULTIPLIER;
  var MOONFIRE_HIT_COMPONENT = HIT_CHANCE * (1 - MOONFIRE_CRIT_CHANCE) * MOONFIRE_DAMAGE;
  var MOONFIRE_CRIT_COMPONENT = HIT_CHANCE * MOONFIRE_CRIT_CHANCE * MOONFIRE_DAMAGE * 2;
  var MOONFIRE_DPS = (MOONFIRE_HIT_COMPONENT + MOONFIRE_CRIT_COMPONENT) / ROTATION_DURATION_SECONDS;
  var MOONFIRE_DOT_DAMAGE = (_abilities.default.moonfire.dot.damage + _abilities.default.moonfire.dot.coefficient * stats.spelldamage) * DAMAGE_MULTIPLIER;
  var MOONFIRE_DOT_COMPONENT = HIT_CHANCE * MOONFIRE_DOT_DAMAGE;
  var MOONFIRE_DOT_DPS = MOONFIRE_DOT_COMPONENT / ROTATION_DURATION_SECONDS;
  return [{
    source: _abilities.default.starfire,
    dps: STARFIRE_DPS
  }, {
    source: _abilities.default.moonfire,
    dps: MOONFIRE_DPS + MOONFIRE_DOT_DPS
  }];
};

exports.default = _default;