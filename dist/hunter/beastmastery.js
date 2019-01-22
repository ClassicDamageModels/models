"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _abilities = _interopRequireDefault(require("../abilities"));

var _utils = require("../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = function _default(_ref) {
  var stats = _ref.vitals,
      target = _ref.target,
      gear = _ref.character.data.gear;

  var WEAPON_MAINHAND = _lodash.default.find(gear, {
    slot: 'ranged'
  }).item;

  var ATTACK_TABLE = (0, _utils.getRangedAttackTable)(stats); // Chicken & egg problem here, value would be calculated later

  var ASSUMED_HASTE = 1.4778690091230573;
  var AUTO_ATTACKS_PER_SECOND = 1 / (WEAPON_MAINHAND.weapon_speed / 1000 / ASSUMED_HASTE);
  var IMPROVED_HAWK_UPTIME = 1 - Math.pow(1 - 0.1, AUTO_ATTACKS_PER_SECOND * 12);
  var IMPROVED_HAWK_HASTE = 1 + IMPROVED_HAWK_UPTIME * 0.15;
  var QUIVER_HASTE = 1.15;
  var SERPENTS_SWIFTNESS_HASTE = 1.2;
  var BONUS_HASTE = SERPENTS_SWIFTNESS_HASTE * IMPROVED_HAWK_HASTE * QUIVER_HASTE;
  var TOTAL_HASTE = (1 + stats.haste / 100) * BONUS_HASTE;
  var PROJECTILE_DAMAGE = 32 * (WEAPON_MAINHAND.weapon_speed / 1000);
  var WEAPON_DAMAGE = WEAPON_MAINHAND && (WEAPON_MAINHAND.dmg_min + WEAPON_MAINHAND.dmg_max) / 2 + PROJECTILE_DAMAGE || 0;
  var ARMOR_MULTIPLIER = (0, _utils.getArmorMultiplier)(_lodash.default.clamp(target.stats.armor - stats.armorpen, 0, 7700));
  var MH_DAMAGE = WEAPON_MAINHAND && (WEAPON_DAMAGE + stats.rangedattackpower / 14 * (WEAPON_MAINHAND.weapon_speed / 1000)) * ARMOR_MULTIPLIER * 1.02 * // Talent: Focused Fire
  target.multipliers.physical || 0;
  var MH_WHITE_COMPONENT = (ATTACK_TABLE.hit * MH_DAMAGE + ATTACK_TABLE.crit * MH_DAMAGE * 2.3) / (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE);
  var STEADY_SHOT_DAMAGE = (150 + WEAPON_DAMAGE / (WEAPON_MAINHAND.weapon_speed / 1000) * 2.8 + 0.2 * stats.rangedattackpower) * 1.02 * // Talent: Focused Fire
  ARMOR_MULTIPLIER * target.multipliers.physical;
  var STEADY_SHOT_HIT_COMPONENT = ATTACK_TABLE.hit * STEADY_SHOT_DAMAGE;
  var STEADY_SHOT_CRIT_COMPONENT = ATTACK_TABLE.crit * STEADY_SHOT_DAMAGE * 2.3;
  var STEADY_SHOT_DPS = (STEADY_SHOT_HIT_COMPONENT + STEADY_SHOT_CRIT_COMPONENT) / (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE);
  return [{
    source: {
      icon: 'ability_whirlwind',
      name: 'Auto Shot'
    },
    dps: MH_WHITE_COMPONENT
  }, {
    source: _abilities.default.steadyshot,
    dps: STEADY_SHOT_DPS
  }];
};

exports.default = _default;