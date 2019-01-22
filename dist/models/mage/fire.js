"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _abilities = _interopRequireDefault(require("../../domain/abilities"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = function _default(_ref) {
  var spec = _ref.spec,
      stats = _ref.vitals,
      target = _ref.target;

  var TALENT_IGNITE = _lodash.default.find(spec.talents, {
    name: 'Ignite',
    active: true
  });

  var TALENT_EMPOWERED_FIREBALL = _lodash.default.find(spec.talents, {
    name: 'Empowered Fireball',
    active: true
  });

  var TALENT_IMPROVED_FIREBALL = _lodash.default.find(spec.talents, {
    name: 'Improved Fireball',
    active: true
  });

  var TALENT_PLAYING_WITH_FIRE = _lodash.default.find(spec.talents, {
    name: 'Playing with Fire',
    active: true
  });

  var TALENT_FIRE_POWER = _lodash.default.find(spec.talents, {
    name: 'Fire Power',
    active: true
  });

  var TALENT_MOLTEN_FURY = _lodash.default.find(spec.talents, {
    name: 'Molten Fury',
    active: true
  });

  var TALENT_ICY_VEINS = _lodash.default.find(spec.talents, {
    name: 'Icy Veins',
    active: true
  }); // FIXME: Make fight duration configurable


  var FIGHT_DURATION_SECONDS = 5 * 60;
  /* Miss chance against level 73 targets is 17%. Hit chance lowers this to down to minimum of 1% */

  var HIT_CHANCE = (100 - (16 - _lodash.default.clamp(stats.spellhitChance, 0, 16) + 1)) / 100;
  var CRIT_CHANCE = stats.spellcritChance / 100;
  var BONUS_HASTE = TALENT_ICY_VEINS ? // Icy Veins uptime * haste bonus (20%)
  Math.floor(FIGHT_DURATION_SECONDS / 180) * 20 / FIGHT_DURATION_SECONDS * 20 : 0;
  var DAMAGE_MULTIPLIER = 1 * ( // Playing with Fire: All spells +3%
  TALENT_PLAYING_WITH_FIRE ? 1.03 : 1) * ( // Fire Power: Fire spells +10%
  TALENT_FIRE_POWER ? 1.1 : 1) * ( // Molten Fury: 20% more damage against targets w/ <20% hp ~= 4% average increase
  TALENT_MOLTEN_FURY ? 1.04 : 1) * // Curse of Elements, Improved Scorch, Misery (FIXME: Are these all multiplicative?)
  target.multipliers.fire;
  var FIREBALL_COEFFICIENT = _abilities.default.fireball.coefficient + (TALENT_EMPOWERED_FIREBALL ? 0.15 : 0);
  var FIREBALL_DAMAGE = (_abilities.default.fireball.damage + FIREBALL_COEFFICIENT * stats.spelldamage) * DAMAGE_MULTIPLIER;
  var FIREBALL_CAST_TIME = (_abilities.default.fireball.castTime + (TALENT_IMPROVED_FIREBALL ? -0.5 : 0)) / (1 + (stats.spellhaste + BONUS_HASTE) / 100); // Fireball casts that do not miss AND do not crit

  var FIREBALL_HIT_COMPONENT = HIT_CHANCE * (1 - CRIT_CHANCE) * FIREBALL_DAMAGE; // Fireball casts that do not miss AND crit

  var FIREBALL_CRIT_COMPONENT = HIT_CHANCE * CRIT_CHANCE * FIREBALL_DAMAGE * 1.5; // Ignite deals additional 40% from any crit damage

  var FIREBALL_IGNITE_COMPONENT = FIREBALL_CRIT_COMPONENT * 0.4; // We assume scorch duty here ...

  var SCORCH_DAMAGE = (_abilities.default.scorch.damage + _abilities.default.scorch.coefficient * stats.spelldamage) * DAMAGE_MULTIPLIER;
  var SCORCH_CAST_TIME = _abilities.default.fireball.castTime / (1 + (stats.spellhaste + BONUS_HASTE) / 100); // Scorch casts that do not miss AND do not crit

  var SCORCH_HIT_COMPONENT = HIT_CHANCE * (1 - CRIT_CHANCE) * SCORCH_DAMAGE; // Scorch casts that do not miss AND crit

  var SCORCH_CRIT_COMPONENT = HIT_CHANCE * CRIT_CHANCE * SCORCH_DAMAGE * 1.5; // Ignite deals additional 40% from any crit damage

  var SCORCH_IGNITE_COMPONENT = SCORCH_CRIT_COMPONENT * 0.4; // You are at risk of dropping scorch debuff if we go for more than 8 FBs between scorches

  var FB_CASTS = 8;
  var ROTATION_DURATION_SECONDS = FB_CASTS * FIREBALL_CAST_TIME + SCORCH_CAST_TIME;
  return [{
    source: _abilities.default.fireball,
    dps: FB_CASTS * (FIREBALL_HIT_COMPONENT + FIREBALL_CRIT_COMPONENT) / ROTATION_DURATION_SECONDS
  }, {
    source: _abilities.default.scorch,
    dps: (SCORCH_HIT_COMPONENT + SCORCH_CRIT_COMPONENT) / ROTATION_DURATION_SECONDS
  }, {
    source: TALENT_IGNITE,
    dps: (FB_CASTS * FIREBALL_IGNITE_COMPONENT + SCORCH_IGNITE_COMPONENT) / ROTATION_DURATION_SECONDS
  }];
};

exports.default = _default;