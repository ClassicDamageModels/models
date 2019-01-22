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
  var CRIT_CHANCE = stats.spellcritChance / 100; // const IMPROVED_SHADOW_BOLT_UPTIME = 1 - Math.pow(1 - CRIT_CHANCE, 4)
  // console.log('IMPROVED_SHADOW_BOLT_UPTIME', IMPROVED_SHADOW_BOLT_UPTIME)

  var DAMAGE_MULTIPLIER = 1 * 1.15 * // Talent: Demonic Sacrifice
  // (1 + 0.2 * IMPROVED_SHADOW_BOLT_UPTIME) *
  target.multipliers.shadow; // Includes Misery

  var SHADOW_BOLT_CAST_TIME = _abilities.default.shadowbolt.castTime / (1 + stats.spellhaste / 100);
  var SHADOW_BOLT_DAMAGE = (_abilities.default.shadowbolt.damage + _abilities.default.shadowbolt.coefficient * stats.spelldamage) * DAMAGE_MULTIPLIER;
  var SHADOW_BOLT_DAMAGE_HIT_COMPONENT = HIT_CHANCE * (1 - CRIT_CHANCE) * SHADOW_BOLT_DAMAGE;
  var SHADOW_BOLT_DAMAGE_CRIT_COMPONENT = HIT_CHANCE * CRIT_CHANCE * SHADOW_BOLT_DAMAGE * 2;
  var SHADOW_BOLT_DPS = (SHADOW_BOLT_DAMAGE_HIT_COMPONENT + SHADOW_BOLT_DAMAGE_CRIT_COMPONENT) / SHADOW_BOLT_CAST_TIME;
  return [{
    source: _abilities.default.shadowbolt,
    dps: SHADOW_BOLT_DPS
  }];
};

exports.default = _default;