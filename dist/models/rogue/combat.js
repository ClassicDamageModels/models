"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _abilities = _interopRequireDefault(require("../../domain/abilities"));

var _combat = require("../../utils/combat");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = function _default(_ref) {
  var spec = _ref.spec,
      stats = _ref.vitals,
      target = _ref.target,
      buffs = _ref.buffs,
      gear = _ref.character.data.gear,
      spells = _ref.spells;
  var weapons = {
    mh: _lodash.default.find(gear, {
      slot: 'weapon1'
    }),
    oh: _lodash.default.find(gear, {
      slot: 'weapon2'
    }),
    ranged: _lodash.default.find(gear, {
      slot: 'ranged'
    })
  };

  var WEAPON_MAINHAND = _lodash.default.get(weapons, 'mh.item');

  var WEAPON_OFFHAND = _lodash.default.get(weapons, 'oh.item');

  var MH_WEAPON_DAMAGE = WEAPON_MAINHAND && (WEAPON_MAINHAND.dmg_min + WEAPON_MAINHAND.dmg_max) / 2 || 0;
  var OH_WEAPON_DAMAGE = WEAPON_OFFHAND && (WEAPON_OFFHAND.dmg_min + WEAPON_OFFHAND.dmg_max) / 2 || 0;
  var FIGHT_DURATION_SECONDS = 5 * 60; // T4 2-piece: Increases the duration of your Slice and Dice ability by 3 sec.

  var SET_BONUS_TIER4_2PIECE = _lodash.default.find(spells, {
    id: 37167
  }); // T4 4-piece: Your finishing moves have a 15% chance to grant you a combo point.


  var SET_BONUS_TIER4_4PIECE = _lodash.default.find(spells, {
    id: 37168
  });

  console.log('SET_BONUS_TIER4_2PIECE', SET_BONUS_TIER4_2PIECE);
  console.log('SET_BONUS_TIER4_4PIECE', SET_BONUS_TIER4_4PIECE);
  var WINDFURY_TOTEM = buffs.raid; // FIXME: Pass all buffs explicitly

  var SWORD_SPECIALIZATION = _lodash.default.find(spec.talents, {
    name: 'Sword Specialization'
  });

  var SWORD_SPECIALIZATION_ACTIVE = SWORD_SPECIALIZATION && WEAPON_MAINHAND.subclass === 'sword_1h';
  var ATTACK_TABLE_WHITE = (0, _combat.getAttackTable)('white', stats, [WEAPON_MAINHAND, WEAPON_OFFHAND]);
  var ATTACK_TABLE_YELLOW = (0, _combat.getAttackTable)('yellow', stats, [WEAPON_MAINHAND, WEAPON_OFFHAND]);
  var AP_COEFFICIENT = (0, _combat.getAPCoefficient)(WEAPON_MAINHAND);
  var BONUS_HASTE = // Slice and Dice
  1.3 * // Blade Flurry (15/120s uptime * 20% = 2.5% average)
  1.025;
  var TOTAL_HASTE = (1 + stats.haste / 100) * BONUS_HASTE;
  var ARMOR_MULTIPLIER = (0, _combat.getArmorMultiplier)(_lodash.default.clamp(target.stats.armor - stats.armorpen, 0, 7700));
  var SND_DURATIONS = {
    1: Math.floor((9 + (SET_BONUS_TIER4_2PIECE ? 3 : 0)) * 1.45),
    2: Math.floor((12 + (SET_BONUS_TIER4_2PIECE ? 3 : 0)) * 1.45),
    3: Math.floor((15 + (SET_BONUS_TIER4_2PIECE ? 3 : 0)) * 1.45),
    4: Math.floor((18 + (SET_BONUS_TIER4_2PIECE ? 3 : 0)) * 1.45),
    5: Math.floor((21 + (SET_BONUS_TIER4_2PIECE ? 3 : 0)) * 1.45)
  };
  console.log('SND_DURATIONS', SND_DURATIONS);
  /* We are assuming 4s/5r rotation (100% snd uptime) */

  var SND_CP = SET_BONUS_TIER4_2PIECE ? 2 : 4;
  var ROTATION_DURATION_SECONDS = SND_DURATIONS[SND_CP];
  var RUPTURE_CP = 5;
  var SINISTER_COST = 45 - 5;
  var SND_COST = 25;
  var RUPTURE_COST = 25;
  var RUTHLESSNESS_CHANCE = 0.6;
  var T4_4PC_CHANCE = SET_BONUS_TIER4_4PIECE ? 0.15 : 0;
  var DISCOUNT_PER_CP = 5;
  console.log('ROTATION_DURATION_SECONDS', ROTATION_DURATION_SECONDS);
  var MH_SWINGS_PER_ROTATION = ROTATION_DURATION_SECONDS / (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE);
  var MH_ATTACKS_PER_ROTATION = MH_SWINGS_PER_ROTATION + 4 + RUPTURE_CP;
  var MH_EXTRA_ATTACKS_SWORD_SPECIALIZATION = SWORD_SPECIALIZATION_ACTIVE ? 0.05 * MH_ATTACKS_PER_ROTATION * (WINDFURY_TOTEM ? 1.2 : 1) : 0;
  var MH_EXTRA_ATTACKS_WINDFURY_TOTEM = WINDFURY_TOTEM ? 0.2 * MH_SWINGS_PER_ROTATION * (SWORD_SPECIALIZATION_ACTIVE ? 1.05 : 1) : 0;
  var OH_EXTRA_ATTACKS_SWORD_SPECIALIZATION = SWORD_SPECIALIZATION_ACTIVE ? 0.05 * (ROTATION_DURATION_SECONDS / (WEAPON_OFFHAND.weapon_speed / 1000 / TOTAL_HASTE)) : 0;
  var MAX_ENERGY = 100 / FIGHT_DURATION_SECONDS;
  var ENERGY_REGEN = 10;
  var ENERGY_FROM_POTENCY = WEAPON_OFFHAND && (ATTACK_TABLE_WHITE.hit + ATTACK_TABLE_WHITE.glance + ATTACK_TABLE_WHITE.crit) * 0.2 * 15 / (WEAPON_OFFHAND.weapon_speed / 1000 / TOTAL_HASTE) || 0;
  var ENERGY_FROM_AR = 150 / FIGHT_DURATION_SECONDS;
  var ENERGY_BUDGET = MAX_ENERGY + ENERGY_REGEN + ENERGY_FROM_POTENCY + ENERGY_FROM_AR;
  var ROTATION_ENERGY_CONSUMPTION = ((SND_CP - RUTHLESSNESS_CHANCE - T4_4PC_CHANCE) * SINISTER_COST + SND_COST - SND_CP * DISCOUNT_PER_CP + (RUPTURE_CP - RUTHLESSNESS_CHANCE - T4_4PC_CHANCE) * SINISTER_COST + RUPTURE_COST - RUPTURE_CP * DISCOUNT_PER_CP) / SND_DURATIONS[SND_CP];
  var EXTRA_ENERGY = (ENERGY_BUDGET - ROTATION_ENERGY_CONSUMPTION) * SND_DURATIONS[SND_CP];
  console.log('EXTRA_ENERGY', EXTRA_ENERGY);
  var SINISTER_DAMAGE = !!WEAPON_MAINHAND && 98 + (MH_WEAPON_DAMAGE + AP_COEFFICIENT * stats.attackpower / 14) * // Talent: Murder
  1.02 * // Talent: Aggression
  1.06 * // Talent: Surprise Attacks
  1.1 * ARMOR_MULTIPLIER * target.multipliers.physical || 0; // Rupture at 5 combo points deals 8 ticks at 125 + 0.03 * AP

  var RUPTURE_DAMAGE = (125 + 0.03 * stats.attackpower) * 8 * ARMOR_MULTIPLIER * target.multipliers.physical;
  var YELLOW_HIT_CHANCE = 1 - ATTACK_TABLE_YELLOW.miss - ATTACK_TABLE_YELLOW.dodge - ATTACK_TABLE_YELLOW.parry; // Yellow hits that dont miss and dont crit

  var SINISTER_HIT_COMPONENT = YELLOW_HIT_CHANCE * (1 - ATTACK_TABLE_YELLOW.crit) * SINISTER_DAMAGE; // Yellow hits that dont miss and do crit

  var SINISTER_CRIT_COMPONENT = YELLOW_HIT_CHANCE * ATTACK_TABLE_YELLOW.crit * SINISTER_DAMAGE * // Melee crit
  2 * // Talent: Lethality
  1.3; // Each strike has a 30% chance of poisoning the enemy for 180 Nature damage over 12 sec. Stacks up to 5 times on a single target.
  // FIXME: Assumed 100% uptime

  var DEADLY_POISON_DAMAGE = 5 * 180 / 12 * target.multipliers.nature; // Use Instant Poison in MH unless we have Windfury Totem

  var INSTANT_POISON_DAMAGE = (146 + 195) / 2 * target.multipliers.nature;
  var SPELL_CRIT_CHANCE = 0.05; // FIXME: ... apply bonuses

  var SPELL_HIT_CHANCE = 0.83; // FIXME: ... apply bonuses

  var INSTANT_POISON_HIT_COMPONENT = SPELL_HIT_CHANCE * (1 - SPELL_CRIT_CHANCE) * INSTANT_POISON_DAMAGE;
  var INSTANT_POISON_CRIT_COMPONENT = SPELL_HIT_CHANCE * SPELL_CRIT_CHANCE * INSTANT_POISON_DAMAGE * 1.5;
  var INSTANT_POISON_DAMAGE_COMPONENT = WINDFURY_TOTEM ? 0 : MH_ATTACKS_PER_ROTATION * // 4/5 Improved Poisons
  0.28 * (INSTANT_POISON_HIT_COMPONENT + INSTANT_POISON_CRIT_COMPONENT) / ROTATION_DURATION_SECONDS;
  var MH_DAMAGE = WEAPON_MAINHAND && (MH_WEAPON_DAMAGE + stats.attackpower / 14 * (WEAPON_MAINHAND.weapon_speed / 1000)) * ARMOR_MULTIPLIER * target.multipliers.physical || 0;
  var OH_DAMAGE = WEAPON_OFFHAND && (OH_WEAPON_DAMAGE + stats.attackpower / 14 * (WEAPON_OFFHAND.weapon_speed / 1000)) * ARMOR_MULTIPLIER * target.multipliers.physical || 0;
  var MH_WHITE_COMPONENT_EXTRA_ATTACKS_SWORD_SPECIALIZATION = MH_EXTRA_ATTACKS_SWORD_SPECIALIZATION * (ATTACK_TABLE_WHITE.hit * MH_DAMAGE + ATTACK_TABLE_WHITE.glance * MH_DAMAGE * 0.65 + ATTACK_TABLE_WHITE.crit * MH_DAMAGE * 2) / ROTATION_DURATION_SECONDS;
  var MH_WHITE_COMPONENT_EXTRA_ATTACKS_WINDFURY_TOTEM = MH_EXTRA_ATTACKS_WINDFURY_TOTEM * (ATTACK_TABLE_WHITE.hit * MH_DAMAGE + ATTACK_TABLE_WHITE.glance * MH_DAMAGE * 0.65 + ATTACK_TABLE_WHITE.crit * MH_DAMAGE * 2) / ROTATION_DURATION_SECONDS;
  var OH_WHITE_COMPONENT_EXTRA_ATTACKS_SWORD_SPECIALIZATION = OH_EXTRA_ATTACKS_SWORD_SPECIALIZATION * (ATTACK_TABLE_WHITE.hit * MH_DAMAGE + ATTACK_TABLE_WHITE.glance * MH_DAMAGE * 0.65 + ATTACK_TABLE_WHITE.crit * MH_DAMAGE * 2) / ROTATION_DURATION_SECONDS * 0.75;
  var MH_WHITE_COMPONENT = (ATTACK_TABLE_WHITE.hit * MH_DAMAGE + ATTACK_TABLE_WHITE.glance * MH_DAMAGE * 0.65 + ATTACK_TABLE_WHITE.crit * MH_DAMAGE * 2) / (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE);
  var OH_WHITE_COMPONENT = (ATTACK_TABLE_WHITE.hit * OH_DAMAGE + ATTACK_TABLE_WHITE.glance * OH_DAMAGE * 0.65 + ATTACK_TABLE_WHITE.crit * OH_DAMAGE * 2) * 0.75 / (WEAPON_OFFHAND.weapon_speed / 1000 / TOTAL_HASTE);
  var WHITE_COMPONENT = MH_WHITE_COMPONENT + MH_WHITE_COMPONENT_EXTRA_ATTACKS_SWORD_SPECIALIZATION + MH_WHITE_COMPONENT_EXTRA_ATTACKS_WINDFURY_TOTEM + OH_WHITE_COMPONENT + OH_WHITE_COMPONENT_EXTRA_ATTACKS_SWORD_SPECIALIZATION;
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
      dps: MH_WHITE_COMPONENT + MH_WHITE_COMPONENT_EXTRA_ATTACKS_SWORD_SPECIALIZATION + MH_WHITE_COMPONENT_EXTRA_ATTACKS_WINDFURY_TOTEM,
      subSegments: [{
        source: _objectSpread({}, SWORD_SPECIALIZATION, {
          name: 'Sword Specialization'
        }),
        dps: MH_WHITE_COMPONENT_EXTRA_ATTACKS_SWORD_SPECIALIZATION
      }, {
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
      dps: OH_WHITE_COMPONENT + OH_WHITE_COMPONENT_EXTRA_ATTACKS_SWORD_SPECIALIZATION,
      subSegments: [{
        source: _objectSpread({}, SWORD_SPECIALIZATION, {
          name: 'Sword Specialization'
        }),
        dps: OH_WHITE_COMPONENT_EXTRA_ATTACKS_SWORD_SPECIALIZATION
      }]
    }]
  }, {
    source: _abilities.default.sinister,
    dps: (SINISTER_HIT_COMPONENT + SINISTER_CRIT_COMPONENT) * (SND_CP + RUPTURE_CP + EXTRA_ENERGY / SINISTER_COST) / ROTATION_DURATION_SECONDS
  }, {
    source: _abilities.default.rupture,
    dps: RUPTURE_DAMAGE / ROTATION_DURATION_SECONDS
  }, {
    source: _abilities.default.deadlypoison,
    dps: DEADLY_POISON_DAMAGE
  }, {
    source: _abilities.default.instantpoison,
    dps: INSTANT_POISON_DAMAGE_COMPONENT
  }];
  return segments;
};

exports.default = _default;