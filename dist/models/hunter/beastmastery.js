"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _abilities = _interopRequireDefault(require("../../domain/abilities"));

var _combat = require("../../utils/combat");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = function _default(_ref) {
  var stats = _ref.vitals,
      target = _ref.target,
      gear = _ref.character.data.gear;
  var DELAY_LAG = 0.1;
  var DELAY_HUMAN_FACTOR = 0.1;
  var GCD = 1.5;

  var WEAPON_MAINHAND = _lodash.default.find(gear, {
    slot: 'ranged'
  }).item;

  var ATTACK_TABLE = (0, _combat.getRangedAttackTable)(stats); // Chicken & egg problem here, value would be calculated later
  // FIXME: implement N-pass modeling

  var ASSUMED_HASTE = 1.4778690091230573;
  var AUTO_ATTACKS_PER_SECOND = 1 / (WEAPON_MAINHAND.weapon_speed / 1000 / ASSUMED_HASTE);
  var IMPROVED_HAWK_UPTIME = 1 - Math.pow(1 - 0.1, AUTO_ATTACKS_PER_SECOND * 12);
  var IMPROVED_HAWK_HASTE = 1 + IMPROVED_HAWK_UPTIME * 0.15;
  var QUIVER_HASTE = 1.15;
  var SERPENTS_SWIFTNESS_HASTE = 1.2;
  var BONUS_HASTE = SERPENTS_SWIFTNESS_HASTE * IMPROVED_HAWK_HASTE * QUIVER_HASTE;
  var TOTAL_HASTE = (1 + stats.haste / 100) * BONUS_HASTE;
  var MAX_TOTAL_HASTE = (1 + stats.haste / 100) * QUIVER_HASTE * SERPENTS_SWIFTNESS_HASTE * 1.15;
  /* Thori'dal, the Stars' Fury
     Thori'dal generates magical arrows when the bow string is drawn. */

  var THORIDAL = WEAPON_MAINHAND.id === 34334;
  var PROJECTILE_DAMAGE = THORIDAL ? 0 : 32 * (WEAPON_MAINHAND.weapon_speed / 1000);
  var WEAPON_DAMAGE = WEAPON_MAINHAND && (WEAPON_MAINHAND.dmg_min + WEAPON_MAINHAND.dmg_max) / 2 + PROJECTILE_DAMAGE || 0;
  var ARMOR_MULTIPLIER = (0, _combat.getArmorMultiplier)(_lodash.default.clamp(target.stats.armor - stats.armorpen, 0, 7700));
  var MH_DAMAGE = WEAPON_MAINHAND && (WEAPON_DAMAGE + stats.rangedattackpower / 14 * (WEAPON_MAINHAND.weapon_speed / 1000)) * ARMOR_MULTIPLIER * 1.02 * // Talent: Focused Fire
  target.multipliers.physical || 0;
  var MH_WHITE_COMPONENT = (ATTACK_TABLE.hit * MH_DAMAGE + ATTACK_TABLE.crit * MH_DAMAGE * 2.3) / (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE);
  var CLIPPED_MH = DELAY_LAG + DELAY_HUMAN_FACTOR + GCD - WEAPON_MAINHAND.weapon_speed / 1000 / MAX_TOTAL_HASTE;
  var MH_CLIPPED_COMPONENT = CLIPPED_MH > 0 && (ATTACK_TABLE.hit * MH_DAMAGE + ATTACK_TABLE.crit * MH_DAMAGE * 2.3) / (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE) * (CLIPPED_MH / (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE)) || 0;
  var WEAPON_DPS = (WEAPON_MAINHAND.dmg_min + WEAPON_MAINHAND.dmg_max) / 2 / (WEAPON_MAINHAND.weapon_speed / 1000);
  /* Actual Equation
  The tooltip is proven to be wrong and the following is the best player worked out formula so far with data taken from [1]
  Formula: DamagePercentageBonus*RangedWeaponSpecialization*(150 + WeaponDamage/WeaponSpeed*2.8 + 0.2*RAP + [Dazed: 175])
  https://wowwiki.fandom.com/wiki/Steady_Shot?oldid=680876
  */

  var STEADY_SHOT_DAMAGE = (150 + WEAPON_DPS * 2.8 + 0.2 * stats.rangedattackpower) * 1.02 * // Talent: Focused Fire
  ARMOR_MULTIPLIER * target.multipliers.physical;
  var STEADY_SHOT_HIT_COMPONENT = ATTACK_TABLE.hit * STEADY_SHOT_DAMAGE;
  var STEADY_SHOT_CRIT_COMPONENT = ATTACK_TABLE.crit * STEADY_SHOT_DAMAGE * 2.3;
  var STEADY_SHOT_DPS = (STEADY_SHOT_HIT_COMPONENT + STEADY_SHOT_CRIT_COMPONENT) / Math.max(WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE, GCD + DELAY_LAG + DELAY_HUMAN_FACTOR);
  return [{
    source: {
      icon: 'ability_whirlwind',
      name: 'Auto Shot'
    },
    dps: MH_WHITE_COMPONENT - MH_CLIPPED_COMPONENT
  }, {
    source: _abilities.default.steadyshot,
    dps: STEADY_SHOT_DPS
  }];
};

exports.default = _default;