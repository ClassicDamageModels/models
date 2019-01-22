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

  var MH = _lodash.default.get(weapons, 'mh.item');

  var OH = _lodash.default.get(weapons, 'oh.item');

  var WEAPON_MAINHAND = MH && MH.class === 'weapon' && MH;
  var WEAPON_OFFHAND = OH && OH.class === 'weapon' && OH;
  var FIGHT_DURATION_SECONDS = 5 * 60; // T4 4-piece: Your Stormstrike ability does an additional 30 damage per weapon.

  var SET_BONUS_TIER4_4PIECE = _lodash.default.find(spells, {
    id: 37224
  });

  var ATTACK_TABLE_WHITE = (0, _utils.getAttackTable)('white', stats, [WEAPON_MAINHAND, WEAPON_OFFHAND]);
  var ATTACK_TABLE_YELLOW = (0, _utils.getAttackTable)('yellow', stats, [WEAPON_MAINHAND, WEAPON_OFFHAND]);
  var SPELL_HIT_CHANCE = (100 - (16 - _lodash.default.clamp(stats.spellhitChance, 0, 16) + 1)) / 100;
  var FLURRY_UPTIME = 1 - Math.pow(1 - ATTACK_TABLE_WHITE.crit, 4);
  var AP_COEFFICIENT = WEAPON_MAINHAND && (0, _utils.getAPCoefficient)(WEAPON_MAINHAND) || 0;
  var BONUS_HASTE = 1 + 0.25 * FLURRY_UPTIME;
  var TOTAL_HASTE = (1 + stats.haste / 100) * BONUS_HASTE;
  var ARMOR_MULTIPLIER = (0, _utils.getArmorMultiplier)(_lodash.default.clamp(target.stats.armor - stats.armorpen, 0, 7700)); // ES cd 6, SS cd 10 => 5 ES 3 SS

  var ROTATION_DURATION_SECONDS = 30;
  var NUM_MH_SWINGS_PER_ROTATION = WEAPON_MAINHAND && ROTATION_DURATION_SECONDS / (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE) || 0;
  var NUM_OH_SWINGS_PER_ROTATION = WEAPON_OFFHAND && ROTATION_DURATION_SECONDS / (WEAPON_OFFHAND.weapon_speed / 1000 / TOTAL_HASTE) || 0;
  var MH_WEAPON_DAMAGE = WEAPON_MAINHAND && (WEAPON_MAINHAND.dmg_min + WEAPON_MAINHAND.dmg_max) / 2 || 0;
  var OH_WEAPON_DAMAGE = WEAPON_OFFHAND && (WEAPON_OFFHAND.dmg_min + WEAPON_OFFHAND.dmg_max) / 2 || 0; // Average MH swing damage

  var MH_DAMAGE = WEAPON_MAINHAND && (MH_WEAPON_DAMAGE + stats.attackpower / 14 * (WEAPON_MAINHAND.weapon_speed / 1000)) * 1.1 * // Talent: Weapon Mastery
  ARMOR_MULTIPLIER * target.multipliers.physical || 0;
  var MH_CRIT_DAMAGE = MH_DAMAGE * 2; // Average OH swing damage

  var OH_DAMAGE = WEAPON_OFFHAND && (OH_WEAPON_DAMAGE + stats.attackpower / 14 * (WEAPON_OFFHAND.weapon_speed / 1000)) * 1.1 * // Talent: Weapon Mastery
  ARMOR_MULTIPLIER * target.multipliers.physical * 0.5 || 0;
  var OH_CRIT_DAMAGE = OH_DAMAGE * 2;
  var MH_WHITE_COMPONENT = ATTACK_TABLE_WHITE.hit * MH_DAMAGE + ATTACK_TABLE_WHITE.glance * MH_DAMAGE * 0.65 + ATTACK_TABLE_WHITE.crit * MH_CRIT_DAMAGE;
  var MH_WHITE_DPS = WEAPON_MAINHAND && MH_WHITE_COMPONENT / (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE) || 0;
  var OH_WHITE_COMPONENT = ATTACK_TABLE_WHITE.hit * OH_DAMAGE + ATTACK_TABLE_WHITE.glance * OH_DAMAGE * 0.65 + ATTACK_TABLE_WHITE.crit * OH_CRIT_DAMAGE;
  var OH_WHITE_DPS = WEAPON_OFFHAND && OH_WHITE_COMPONENT / (WEAPON_OFFHAND.weapon_speed / 1000 / TOTAL_HASTE) || 0;
  /* Windfury Weapon
     Imbue the Shaman's weapon with wind. Each hit has a 20% chance of dealing
     additional damage equal to two extra attacks with 445 extra attack power.
     Lasts 30 minutes.
       Elemental Weapons
     Increases the damage caused by your Rockbiter Weapon by 20%, your
     Windfury Weapon effect by 40% and increases the damage caused by
     your Flametongue Weapon and Frostbrand Weapon by 15%.
  */

  var MH_EXTRA_ATTACKS_WINDFURY_TOTEM = 0.2 * NUM_MH_SWINGS_PER_ROTATION;
  var OH_EXTRA_ATTACKS_WINDFURY_TOTEM = 0.2 * NUM_OH_SWINGS_PER_ROTATION;
  var MH_WINDFURY_DAMAGE = (MH_WEAPON_DAMAGE + AP_COEFFICIENT * (stats.attackpower + 445 * 1.4) / 14) * 1.1 * // Talent: Weapon Mastery
  ARMOR_MULTIPLIER * target.multipliers.physical;
  var OH_WINDFURY_DAMAGE = (OH_WEAPON_DAMAGE * 0.5 + AP_COEFFICIENT * (stats.attackpower + 445 * 1.4) / 14) * 1.1 * // Talent: Weapon Mastery
  ARMOR_MULTIPLIER * target.multipliers.physical;
  var YELLOW_HIT_CHANCE = 1 - ATTACK_TABLE_YELLOW.miss - ATTACK_TABLE_YELLOW.dodge - ATTACK_TABLE_YELLOW.parry;
  var MH_WINDFURY_HIT_COMPONENT = YELLOW_HIT_CHANCE * (1 - ATTACK_TABLE_YELLOW.crit) * MH_WINDFURY_DAMAGE;
  var OH_WINDFURY_HIT_COMPONENT = YELLOW_HIT_CHANCE * (1 - ATTACK_TABLE_YELLOW.crit) * OH_WINDFURY_DAMAGE;
  var MH_WINDFURY_CRIT_COMPONENT = YELLOW_HIT_CHANCE * ATTACK_TABLE_YELLOW.crit * MH_WINDFURY_DAMAGE * 2;
  var OH_WINDFURY_CRIT_COMPONENT = YELLOW_HIT_CHANCE * ATTACK_TABLE_YELLOW.crit * OH_WINDFURY_DAMAGE * 2;
  var MH_WINDFURY_DPS = MH_EXTRA_ATTACKS_WINDFURY_TOTEM * (MH_WINDFURY_HIT_COMPONENT + MH_WINDFURY_CRIT_COMPONENT) * 2 / ROTATION_DURATION_SECONDS;
  var OH_WINDFURY_DPS = OH_EXTRA_ATTACKS_WINDFURY_TOTEM * (OH_WINDFURY_HIT_COMPONENT + OH_WINDFURY_CRIT_COMPONENT) * 2 / ROTATION_DURATION_SECONDS;
  var WHITE_DPS = MH_WHITE_DPS + OH_WHITE_DPS + MH_WINDFURY_DPS + OH_WINDFURY_DPS;
  var EARTH_SHOCK_DAMAGE = (_abilities.default.earthshock.damage + _abilities.default.earthshock.coefficient * stats.spelldamage) * 1.2 * // Stormstrike
  target.multipliers.nature;
  var EARTH_SHOCK_HIT_COMPONENT = SPELL_HIT_CHANCE * (1 - stats.spellcritChance / 100) * EARTH_SHOCK_DAMAGE;
  var EARTH_SHOCK_CRIT_COMPONENT = SPELL_HIT_CHANCE * (stats.spellcritChance / 100) * EARTH_SHOCK_DAMAGE * 1.5;
  var EARTH_SHOCK_DPS = 5 * (EARTH_SHOCK_HIT_COMPONENT + EARTH_SHOCK_CRIT_COMPONENT) / ROTATION_DURATION_SECONDS;
  /*
  Instantly attack with both weapons. In addition, the next 2 sources of Nature damage dealt to the target are increased by 20%. Lasts 12sec.
    */

  var STORMSTRIKE_HIT_COMPONENT_MH = YELLOW_HIT_CHANCE * (1 - ATTACK_TABLE_YELLOW.crit) * (MH_DAMAGE + (SET_BONUS_TIER4_4PIECE ? 30 : 0));
  var STORMSTRIKE_CRIT_COMPONENT_MH = YELLOW_HIT_CHANCE * ATTACK_TABLE_YELLOW.crit * (MH_DAMAGE + (SET_BONUS_TIER4_4PIECE ? 30 : 0)) * 2;
  var STORMSTRIKE_HIT_COMPONENT_OH = YELLOW_HIT_CHANCE * (1 - ATTACK_TABLE_YELLOW.crit) * (OH_DAMAGE + (SET_BONUS_TIER4_4PIECE ? 30 : 0));
  var STORMSTRIKE_CRIT_COMPONENT_OH = YELLOW_HIT_CHANCE * ATTACK_TABLE_YELLOW.crit * (OH_DAMAGE + (SET_BONUS_TIER4_4PIECE ? 30 : 0)) * 2;
  var STORMSTRIKE_DPS = 3 * (STORMSTRIKE_HIT_COMPONENT_MH + STORMSTRIKE_CRIT_COMPONENT_MH + STORMSTRIKE_HIT_COMPONENT_OH + STORMSTRIKE_CRIT_COMPONENT_OH) / ROTATION_DURATION_SECONDS;
  return [{
    source: {
      icon: 'inv_sword_04',
      name: 'Auto Attacks'
    },
    dps: WHITE_DPS,
    subSegments: [{
      source: _objectSpread({}, WEAPON_MAINHAND, {
        name: 'Main Hand'
      }),
      dps: MH_WHITE_DPS + MH_WINDFURY_DPS,
      subSegments: [{
        source: _abilities.default.windfury,
        dps: MH_WINDFURY_DPS
      }]
    }, {
      source: _objectSpread({}, WEAPON_OFFHAND, {
        name: 'Off Hand'
      }),
      dps: OH_WHITE_DPS + OH_WINDFURY_DPS,
      subSegments: [{
        source: _abilities.default.windfury,
        dps: OH_WINDFURY_DPS
      }]
    }]
  }, {
    source: _abilities.default.earthshock,
    dps: EARTH_SHOCK_DPS
  }, {
    source: _abilities.default.stormstrike,
    dps: STORMSTRIKE_DPS
  }];
};

exports.default = _default;