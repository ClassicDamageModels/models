"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _abilities = _interopRequireDefault(require("../abilities"));

var _utils = require("../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = function _default(_ref) {
  var stats = _ref.vitals,
      target = _ref.target,
      buffs = _ref.buffs,
      gear = _ref.character.data.gear,
      spells = _ref.spells;

  var WEAPON_MAINHAND = _lodash.default.get(_lodash.default.find(gear, {
    slot: 'weapon1'
  }), 'item');

  var WEAPON_OFFHAND = _lodash.default.get(_lodash.default.find(gear, {
    slot: 'weapon2'
  }), 'item');

  var DAGGERS = WEAPON_MAINHAND && WEAPON_OFFHAND && WEAPON_MAINHAND.subclass === 'dagger' && WEAPON_OFFHAND.subclass === 'dagger' || false;
  var FIGHT_DURATION_SECONDS = 5 * 60;
  var MANGLE = buffs.raid;
  var WINDFURY_TOTEM = buffs.raid; // FIXME: Pass all buffs explicitly
  // T4 2-piece: Increases the duration of your Slice and Dice ability by 3 sec.

  var SET_BONUS_TIER4_2PIECE = _lodash.default.find(spells, {
    id: 37167
  }); // T4 4-piece: Your finishing moves have a 15% chance to grant you a combo point.


  var SET_BONUS_TIER4_4PIECE = _lodash.default.find(spells, {
    id: 37168
  });

  var ATTACK_TABLE_WHITE = (0, _utils.getAttackTable)('white', stats, [WEAPON_MAINHAND, WEAPON_OFFHAND]);
  var ATTACK_TABLE_YELLOW = (0, _utils.getAttackTable)('yellow', stats, [WEAPON_MAINHAND, WEAPON_OFFHAND]);
  var AP_COEFFICIENT = (0, _utils.getAPCoefficient)(WEAPON_MAINHAND);
  var BONUS_HASTE = // Slice and Dice
  1.3 * // Blade Flurry (15/120s uptime * 20% = 2.5% average)
  1.025;
  var TOTAL_HASTE = (1 + stats.haste / 100) * BONUS_HASTE;
  var ARMOR_MULTIPLIER = (0, _utils.getArmorMultiplier)(_lodash.default.clamp(target.stats.armor - stats.armorpen, 0, 7700));
  var SND_DURATIONS = {
    1: Math.floor((9 + (SET_BONUS_TIER4_2PIECE ? 3 : 0)) * 1.45),
    2: Math.floor((12 + (SET_BONUS_TIER4_2PIECE ? 3 : 0)) * 1.45),
    3: Math.floor((15 + (SET_BONUS_TIER4_2PIECE ? 3 : 0)) * 1.45),
    4: Math.floor((18 + (SET_BONUS_TIER4_2PIECE ? 3 : 0)) * 1.45),
    5: Math.floor((21 + (SET_BONUS_TIER4_2PIECE ? 3 : 0)) * 1.45)
    /*
      Our rotation is 3s/5r, enabling 100% uptime for both snd and expose weakness
       --
      Mutilate 2-3cp
      Snd 0-1cp
      Mutilate 1-4 cp
      Mutilate 4-5 cp
      Rupture 0-1
      --
      Mutilate 2-4
      Snd 0-1
     */

  };
  var SND_CP = 3;
  var RUPTURE_CP = 5;
  var MUTILATE_COST = 60;
  var SND_COST = 25;
  var RUPTURE_COST = 25;
  var RUTHLESSNESS_CHANCE = 0.6;
  var T4_4PC_CHANCE = SET_BONUS_TIER4_4PIECE ? 0.15 : 0;
  var DISCOUNT_PER_CP = 5;
  var MAX_ENERGY = 110 / FIGHT_DURATION_SECONDS;
  var ENERGY_REGEN = 10;
  var ENERGY_PER_SECOND = MAX_ENERGY + ENERGY_REGEN;
  var YELLOW_HIT_CHANCE = 1 - ATTACK_TABLE_YELLOW.miss - ATTACK_TABLE_YELLOW.dodge - ATTACK_TABLE_YELLOW.parry;
  var MUTILATE_CRIT_CHANCE = ATTACK_TABLE_YELLOW.crit + 0.15;
  var CP_PER_MUTILATE = YELLOW_HIT_CHANCE * 2 + YELLOW_HIT_CHANCE * MUTILATE_CRIT_CHANCE;
  var MUTILATES_TO_REACH_SND_CPS = (SND_CP - RUTHLESSNESS_CHANCE - T4_4PC_CHANCE) / CP_PER_MUTILATE;
  var MUTILATES_TO_REACH_RUPTURE_CPS = (RUPTURE_CP - RUTHLESSNESS_CHANCE - T4_4PC_CHANCE) / CP_PER_MUTILATE; // console.log('MUTILATES_TO_REACH_SND_CPS', MUTILATES_TO_REACH_SND_CPS)
  // console.log('MUTILATES_TO_REACH_RUPTURE_CPS', MUTILATES_TO_REACH_RUPTURE_CPS)

  var ROTATION_ENERGY_CONSUMPTION = MUTILATES_TO_REACH_SND_CPS * MUTILATE_COST + SND_COST - SND_CP * DISCOUNT_PER_CP + MUTILATES_TO_REACH_RUPTURE_CPS * MUTILATE_COST + RUPTURE_COST - RUPTURE_CP * DISCOUNT_PER_CP; // const ROTATION_DURATION_SECONDS = Math.max(
  //   ROTATION_ENERGY_CONSUMPTION / ENERGY_PER_SECOND + 1, // 1 second total delay for human factor / lag
  //   16 // We dont want to clip Rupture
  // )

  var ROTATION_DURATION_SECONDS = 20;
  var EXTRA_ENERGY = ENERGY_PER_SECOND * ROTATION_DURATION_SECONDS - ROTATION_ENERGY_CONSUMPTION; // console.log('ROTATION_ENERGY_CONSUMPTION', ROTATION_ENERGY_CONSUMPTION)
  // console.log('ROTATION_DURATION_SECONDS', ROTATION_DURATION_SECONDS)
  // console.log('EXTRA_ENERGY', EXTRA_ENERGY)

  var MH_WEAPON_DAMAGE = WEAPON_MAINHAND && (WEAPON_MAINHAND.dmg_min + WEAPON_MAINHAND.dmg_max) / 2 || 0;
  var OH_WEAPON_DAMAGE = WEAPON_OFFHAND && (WEAPON_OFFHAND.dmg_min + WEAPON_OFFHAND.dmg_max) / 2 || 0;
  var MH_SWINGS_PER_ROTATION = ROTATION_DURATION_SECONDS / (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE);
  var MH_ATTACKS_PER_ROTATION = MH_SWINGS_PER_ROTATION + MUTILATES_TO_REACH_SND_CPS + MUTILATES_TO_REACH_RUPTURE_CPS;
  var MH_EXTRA_ATTACKS_WINDFURY_TOTEM = WINDFURY_TOTEM ? 0.2 * MH_SWINGS_PER_ROTATION : 0;
  var MUTILATE_DAMAGE = !!(DAGGERS && WEAPON_MAINHAND && WEAPON_OFFHAND) && (101 + MH_WEAPON_DAMAGE + AP_COEFFICIENT * stats.attackpower / 14 + (101 + OH_WEAPON_DAMAGE + AP_COEFFICIENT * stats.attackpower / 14)) * // Poisoned Target
  1.5 * // Talent: Murder
  1.02 * // Talent: Find Weakness
  1.1 * ARMOR_MULTIPLIER * target.multipliers.physical || 0; // Yellow hits that dont miss and dont crit

  var MUTILATE_HIT_COMPONENT = YELLOW_HIT_CHANCE * (1 - MUTILATE_CRIT_CHANCE) * MUTILATE_DAMAGE; // Yellow hits that dont miss and do crit

  var MUTILATE_CRIT_COMPONENT = YELLOW_HIT_CHANCE * MUTILATE_CRIT_CHANCE * MUTILATE_DAMAGE * // Melee crit
  2 * // Talent: Lethality
  1.3;
  var MUTILATE_DPS = (MUTILATE_HIT_COMPONENT + MUTILATE_CRIT_COMPONENT) * (MUTILATES_TO_REACH_RUPTURE_CPS + MUTILATES_TO_REACH_SND_CPS + EXTRA_ENERGY / MUTILATE_COST) / ROTATION_DURATION_SECONDS; // Rupture at 5 combo points deals 8 ticks at 125 + 0.03 * AP

  var RUPTURE_DAMAGE = (125 + 0.03 * stats.attackpower) * 8 * // 8 ticks
  1.1 * ( // Talent: Find Weakness
  MANGLE ? 1.3 : 1) * target.multipliers.physical; // Each strike has a 30% chance of poisoning the enemy for 180 Nature damage over 12 sec. Stacks up to 5 times on a single target.
  // FIXME: Assumed 100% uptime

  var DEADLY_POISON_DAMAGE = 5 * 180 / 12 * 1.2 * target.multipliers.nature; // Use Instant Poison in MH unless we have Windfury Totem

  var INSTANT_POISON_DAMAGE = (146 + 195) / 2 * 1.2 * target.multipliers.nature;
  var SPELL_CRIT_CHANCE = 0.05; // FIXME: ... apply bonuses

  var SPELL_HIT_CHANCE = 0.83; // FIXME: ... apply bonuses

  var INSTANT_POISON_HIT_COMPONENT = SPELL_HIT_CHANCE * (1 - SPELL_CRIT_CHANCE) * INSTANT_POISON_DAMAGE;
  var INSTANT_POISON_CRIT_COMPONENT = SPELL_HIT_CHANCE * SPELL_CRIT_CHANCE * INSTANT_POISON_DAMAGE * 1.5;
  var INSTANT_POISON_DAMAGE_COMPONENT = WINDFURY_TOTEM ? 0 : MH_ATTACKS_PER_ROTATION * 0.2 * SPELL_HIT_CHANCE * INSTANT_POISON_DAMAGE / ROTATION_DURATION_SECONDS;
  var MH_DAMAGE = WEAPON_MAINHAND && (MH_WEAPON_DAMAGE + stats.attackpower / 14 * (WEAPON_MAINHAND.weapon_speed / 1000)) * ARMOR_MULTIPLIER * target.multipliers.physical || 0;
  var OH_DAMAGE = WEAPON_OFFHAND && (OH_WEAPON_DAMAGE + stats.attackpower / 14 * (WEAPON_OFFHAND.weapon_speed / 1000)) * ARMOR_MULTIPLIER * target.multipliers.physical || 0;
  var MH_WHITE_COMPONENT_EXTRA_ATTACKS_WINDFURY_TOTEM = MH_EXTRA_ATTACKS_WINDFURY_TOTEM * (ATTACK_TABLE_WHITE.hit * MH_DAMAGE + ATTACK_TABLE_WHITE.glance * MH_DAMAGE * 0.65 + ATTACK_TABLE_WHITE.crit * MH_DAMAGE * 2) / ROTATION_DURATION_SECONDS;
  var MH_WHITE_COMPONENT = (ATTACK_TABLE_WHITE.hit * MH_DAMAGE + ATTACK_TABLE_WHITE.glance * MH_DAMAGE * 0.65 + ATTACK_TABLE_WHITE.crit * MH_DAMAGE * 2) / (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE);
  var OH_WHITE_COMPONENT = (ATTACK_TABLE_WHITE.hit * OH_DAMAGE + ATTACK_TABLE_WHITE.glance * OH_DAMAGE * 0.65 + ATTACK_TABLE_WHITE.crit * OH_DAMAGE * 2) * 0.75 / (WEAPON_OFFHAND.weapon_speed / 1000 / TOTAL_HASTE);
  var WHITE_COMPONENT = MH_WHITE_COMPONENT + MH_WHITE_COMPONENT_EXTRA_ATTACKS_WINDFURY_TOTEM + OH_WHITE_COMPONENT;
  var segments = [{
    source: {
      icon: 'inv_sword_04',
      name: 'Auto Attacks'
    },
    dps: WHITE_COMPONENT,
    subSegments: [{
      source: _objectSpread({}, WEAPON_MAINHAND, {
        name: 'Main Hand'
      }),
      dps: MH_WHITE_COMPONENT + MH_WHITE_COMPONENT_EXTRA_ATTACKS_WINDFURY_TOTEM,
      subSegments: [{
        source: {
          icon: 'spell_nature_windfury',
          name: 'Windfury Totem'
        },
        dps: MH_WHITE_COMPONENT_EXTRA_ATTACKS_WINDFURY_TOTEM
      }]
    }, {
      source: _objectSpread({}, WEAPON_OFFHAND, {
        name: 'Off Hand'
      }),
      dps: OH_WHITE_COMPONENT
    }]
  }, {
    source: _abilities.default.rupture,
    dps: RUPTURE_DAMAGE / ROTATION_DURATION_SECONDS
  }, {
    source: _abilities.default.deadlypoison,
    dps: DEADLY_POISON_DAMAGE
  }, {
    source: _abilities.default.instantpoison,
    dps: INSTANT_POISON_DAMAGE_COMPONENT
  }, {
    source: _abilities.default.mutilate,
    dps: MUTILATE_DPS
  }];
  return segments;
  return [];
};

exports.default = _default;