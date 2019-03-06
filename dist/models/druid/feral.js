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
  var WOLFSHEAD_HELM = _lodash.default.get(_lodash.default.find(gear, {
    slot: 'head'
  }), 'item.name') === 'Wolfshead Helm';
  var WEAPON_MAINHAND = {
    weapon_speed: 1000,
    name: 'Auto Attacks',
    icon: 'ability_druid_catformattack'
  };
  var ATTACK_TABLE_WHITE = (0, _combat.getAttackTable)('white', stats, [WEAPON_MAINHAND]);
  var ATTACK_TABLE_YELLOW = (0, _combat.getAttackTable)('yellow', stats, [WEAPON_MAINHAND]);
  var TOTAL_HASTE = 1 + stats.haste / 100;
  var ARMOR_MULTIPLIER = (0, _combat.getArmorMultiplier)(_lodash.default.clamp(target.stats.armor - stats.armorpen, 0, 7700)); // Mangle -> Shred to 4-5 combo points -> Wait for 70+ energy (preferably 80+), Rip->Mangle, start again.

  var MANGLE_ENERGY_COST = 45 - 5;
  var SHRED_ENERGY_COST = 60 - 18;
  var RIP_ENERGY_COST = 30;
  var ROTATION_ENERGY_COST = MANGLE_ENERGY_COST + 3 * SHRED_ENERGY_COST + RIP_ENERGY_COST;
  var YELLOW_HIT_CHANCE = 1 - ATTACK_TABLE_YELLOW.miss - ATTACK_TABLE_YELLOW.dodge - ATTACK_TABLE_YELLOW.parry;
  var CP_PER_YELLOW = YELLOW_HIT_CHANCE + YELLOW_HIT_CHANCE * ATTACK_TABLE_YELLOW.crit;
  var AVERAGE_YELLOW_COST = (3 * SHRED_ENERGY_COST + MANGLE_ENERGY_COST) / 4;
  var YELLOWS_PER_RIP = 4 / CP_PER_YELLOW;
  var ENERGY_REGEN = 10; // Twice per minute - dunno what's sustainable

  var ENERGY_POWER_SHIFT = (40 + (WOLFSHEAD_HELM ? 20 : 0)) / 30; // Omen of Clarity, 2 ppm

  var ENERGY_FROM_OOC = 2 / 60 * AVERAGE_YELLOW_COST;
  var ENERGY_BUDGET = ENERGY_REGEN + ENERGY_FROM_OOC + ENERGY_POWER_SHIFT;
  var SECONDS_TO_RIP = AVERAGE_YELLOW_COST * YELLOWS_PER_RIP / ENERGY_BUDGET; // Rotation cannot be shorter than 10 seconds due to Rip duration

  var ROTATION_DURATION_SECONDS = Math.max(SECONDS_TO_RIP + 1, 10);
  var MH_SWINGS_PER_ROTATION = ROTATION_DURATION_SECONDS / (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE);
  var CAT_EXTRA_DAMAGE = 55;
  var WEAPON_DAMAGE = CAT_EXTRA_DAMAGE + stats.attackpower / 14;
  var MH_DAMAGE = WEAPON_DAMAGE * ARMOR_MULTIPLIER * target.multipliers.physical;
  var MH_WHITE_COMPONENT = (ATTACK_TABLE_WHITE.hit * MH_DAMAGE + ATTACK_TABLE_WHITE.glance * MH_DAMAGE * 0.65 + ATTACK_TABLE_WHITE.crit * MH_DAMAGE * 2.1) / (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE);
  var MH_WHITE_DPS = MH_WHITE_COMPONENT * MH_SWINGS_PER_ROTATION / ROTATION_DURATION_SECONDS;
  var SHRED_DAMAGE = (405 + 2.25 * WEAPON_DAMAGE) * 1.3 * ARMOR_MULTIPLIER * target.multipliers.physical;
  var SHRED_HIT_COMPONENT = YELLOW_HIT_CHANCE * (1 - ATTACK_TABLE_YELLOW.crit) * SHRED_DAMAGE;
  var SHRED_CRIT_COMPONENT = YELLOW_HIT_CHANCE * ATTACK_TABLE_YELLOW.crit * SHRED_DAMAGE * 2.1;
  var SHRED_DPS = (YELLOWS_PER_RIP - 1) * (SHRED_HIT_COMPONENT + SHRED_CRIT_COMPONENT) / ROTATION_DURATION_SECONDS;
  var MANGLE_DAMAGE = (317 + 1.6 * WEAPON_DAMAGE) * 1.2 * // Talent: Savage Fury
  ARMOR_MULTIPLIER * target.multipliers.physical;
  var MANGLE_HIT_COMPONENT = YELLOW_HIT_CHANCE * (1 - ATTACK_TABLE_YELLOW.crit) * MANGLE_DAMAGE;
  var MANGLE_CRIT_COMPONENT = YELLOW_HIT_CHANCE * ATTACK_TABLE_YELLOW.crit * MANGLE_DAMAGE * 2.1;
  var MANGLE_DPS = (MANGLE_HIT_COMPONENT + MANGLE_CRIT_COMPONENT) / ROTATION_DURATION_SECONDS;
  var RIP_DAMAGE = (774 + 0.24 * stats.attackpower) * 1.3;
  var RIP_DPS = RIP_DAMAGE / ROTATION_DURATION_SECONDS;
  return [{
    source: WEAPON_MAINHAND,
    dps: MH_WHITE_DPS
  }, {
    source: _abilities.default.shred,
    dps: SHRED_DPS
  }, {
    source: _abilities.default.mangle,
    dps: MANGLE_DPS
  }, {
    source: _abilities.default.rip,
    dps: RIP_DPS
  }];
};

exports.default = _default;