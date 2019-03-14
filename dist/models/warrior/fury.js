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

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var _default = function _default(_ref) {
  var stats = _ref.vitals,
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
  var FIGHT_DURATION_SECONDS = 5 * 60;
  var WINDFURY_TOTEM = buffs.raid; // FIXME: Pass all buffs explicitly

  var _getAttackTable = (0, _combat.getAttackTable)('white', stats, [WEAPON_MAINHAND, WEAPON_OFFHAND]),
      _getAttackTable2 = _slicedToArray(_getAttackTable, 2),
      ATTACK_TABLE_WHITE_MH = _getAttackTable2[0],
      ATTACK_TABLE_WHITE_OH = _getAttackTable2[1];

  var _getAttackTable3 = (0, _combat.getAttackTable)('yellow', stats, [WEAPON_MAINHAND, WEAPON_OFFHAND]),
      _getAttackTable4 = _slicedToArray(_getAttackTable3, 1),
      ATTACK_TABLE_YELLOW_MH = _getAttackTable4[0];

  var FLURRY_UPTIME = 1 - Math.pow(1 - ATTACK_TABLE_WHITE_MH.crit, 4); // T4 2-piece: Your Whirlwind ability costs 5 less rage.

  var SET_BONUS_TIER4_2PIECE = _lodash.default.find(spells, {
    id: 37518
  }); // T4 4-piece: You gain an additional 2 rage each time one of your attacks is parried or dodged.


  var SET_BONUS_TIER4_4PIECE = _lodash.default.find(spells, {
    id: 37519
  });

  var AP_COEFFICIENT = WEAPON_MAINHAND && (0, _combat.getAPCoefficient)(WEAPON_MAINHAND) || 0;
  var BONUS_HASTE = 1 + 0.25 * FLURRY_UPTIME;
  var TOTAL_HASTE = (1 + stats.haste / 100) * BONUS_HASTE;
  var ARMOR_MULTIPLIER = (0, _combat.getArmorMultiplier)(_lodash.default.clamp(target.stats.armor - stats.armorpen, 0, 7700)); // 3 BT 2 WW rotation. (3 Bloodthirst = 18 seconds, 2 Whirlwinds with 1 point in Improved Whirlwind = 18 seconds)

  var ROTATION_DURATION_SECONDS = 18;
  var NUM_MH_SWINGS_PER_ROTATION = WEAPON_MAINHAND && ROTATION_DURATION_SECONDS / (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE) || 0;
  var NUM_OH_SWINGS_PER_ROTATION = WEAPON_OFFHAND && ROTATION_DURATION_SECONDS / (WEAPON_OFFHAND.weapon_speed / 1000 / TOTAL_HASTE) || 0;
  var MH_WEAPON_DAMAGE = WEAPON_MAINHAND && (WEAPON_MAINHAND.dmg_min + WEAPON_MAINHAND.dmg_max) / 2 || 0;
  var OH_WEAPON_DAMAGE = WEAPON_OFFHAND && (WEAPON_OFFHAND.dmg_min + WEAPON_OFFHAND.dmg_max) / 2 || 0; // Average MH swing damage

  var MH_DAMAGE = WEAPON_MAINHAND && (MH_WEAPON_DAMAGE + stats.attackpower / 14 * (WEAPON_MAINHAND.weapon_speed / 1000)) * ARMOR_MULTIPLIER * target.multipliers.physical || 0;
  var MH_CRIT_DAMAGE = MH_DAMAGE * 2; // Average OH swing damage

  var OH_DAMAGE = WEAPON_OFFHAND && (OH_WEAPON_DAMAGE + stats.attackpower / 14 * (WEAPON_OFFHAND.weapon_speed / 1000)) * ARMOR_MULTIPLIER * target.multipliers.physical || 0;
  var OH_CRIT_DAMAGE = OH_DAMAGE * 2;
  var MH_WHITE_COMPONENT = ATTACK_TABLE_WHITE_MH.hit * MH_DAMAGE + ATTACK_TABLE_WHITE_MH.glance * MH_DAMAGE * 0.65 + ATTACK_TABLE_WHITE_MH.crit * MH_CRIT_DAMAGE;
  var MH_WHITE_DPS = WEAPON_MAINHAND && MH_WHITE_COMPONENT / (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE) || 0;
  var MH_EXTRA_ATTACKS_WINDFURY_TOTEM = WINDFURY_TOTEM ? 0.2 * NUM_MH_SWINGS_PER_ROTATION : 0;
  var OH_WHITE_COMPONENT = (ATTACK_TABLE_WHITE_OH.hit * OH_DAMAGE + ATTACK_TABLE_WHITE_OH.glance * OH_DAMAGE * 0.65 + ATTACK_TABLE_WHITE_OH.crit * OH_CRIT_DAMAGE) * 0.625;
  var OH_WHITE_DPS = WEAPON_OFFHAND && OH_WHITE_COMPONENT / (WEAPON_OFFHAND.weapon_speed / 1000 / TOTAL_HASTE) || 0;
  var UNBRIDLED_WRATH_POINTS = 5;
  var RAGE_PER_SECOND_UNBRIDLED_WRATH_MH = WEAPON_MAINHAND && 3 * UNBRIDLED_WRATH_POINTS / 60 * (WEAPON_MAINHAND.weapon_speed / 1000) / (WEAPON_MAINHAND.weapon_speed / 1000) || 0;
  var RAGE_PER_SECOND_UNBRIDLED_WRATH_OH = WEAPON_OFFHAND && 3 * UNBRIDLED_WRATH_POINTS / 60 * (WEAPON_OFFHAND.weapon_speed / 1000) / (WEAPON_MAINHAND.weapon_speed / 1000) || 0;
  var RAGE_PER_SECOND_UNBRIDLED_WRATH = RAGE_PER_SECOND_UNBRIDLED_WRATH_MH + RAGE_PER_SECOND_UNBRIDLED_WRATH_OH;
  var RAGE_PER_SECOND_BLOODRAGE = 20 / 60;
  var RAGE_PER_SECOND_ANGER_MANAGEMENT = 1 / 3; // const c = 0.0091107836 * Math.pow(70, 2) + 3.225598133 * 70 + 4.2652911 => 274.7

  var RAGE_CONVERSION_VALUE = 274.7;
  var RAGE_MH = WEAPON_MAINHAND && ATTACK_TABLE_WHITE_MH.hit * _lodash.default.clamp(15 * MH_DAMAGE / (4 * RAGE_CONVERSION_VALUE) + 3.5 * WEAPON_MAINHAND.weapon_speed / 1000 / 2, 0, 15 * MH_DAMAGE / RAGE_CONVERSION_VALUE) + ATTACK_TABLE_WHITE_MH.glance * _lodash.default.clamp(15 * MH_DAMAGE * 0.65 / (4 * RAGE_CONVERSION_VALUE) + 3.5 * WEAPON_MAINHAND.weapon_speed / 1000 / 2, 0, 15 * MH_DAMAGE / RAGE_CONVERSION_VALUE) + ATTACK_TABLE_WHITE_MH.crit * _lodash.default.clamp(15 * MH_CRIT_DAMAGE / (4 * RAGE_CONVERSION_VALUE) + 7 * WEAPON_MAINHAND.weapon_speed / 1000 / 2, 0, 15 * MH_DAMAGE / RAGE_CONVERSION_VALUE) || 0;
  var RAGE_PER_SECOND_MH = WEAPON_MAINHAND && RAGE_MH / (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE) || 0;
  var RAGE_PER_SECOND_WINDFURY = MH_EXTRA_ATTACKS_WINDFURY_TOTEM * RAGE_MH / ROTATION_DURATION_SECONDS;
  var RAGE_OH = WEAPON_OFFHAND && ATTACK_TABLE_WHITE_OH.hit * _lodash.default.clamp(15 * OH_DAMAGE / (4 * RAGE_CONVERSION_VALUE) + 1.75 * WEAPON_OFFHAND.weapon_speed / 1000 / 2, 0, 15 * OH_DAMAGE / RAGE_CONVERSION_VALUE) + ATTACK_TABLE_WHITE_OH.glance * _lodash.default.clamp(15 * OH_DAMAGE * 0.65 / (4 * RAGE_CONVERSION_VALUE) + 1.75 * WEAPON_OFFHAND.weapon_speed / 1000 / 2, 0, 15 * OH_DAMAGE / RAGE_CONVERSION_VALUE) + ATTACK_TABLE_WHITE_OH.crit * _lodash.default.clamp(15 * OH_CRIT_DAMAGE / (4 * RAGE_CONVERSION_VALUE) + 3.5 * WEAPON_OFFHAND.weapon_speed / 1000 / 2, 0, 15 * OH_DAMAGE / RAGE_CONVERSION_VALUE) || 0;
  var RAGE_PER_SECOND_OH = WEAPON_OFFHAND && RAGE_OH / (WEAPON_OFFHAND.weapon_speed / 1000 / TOTAL_HASTE) || 0;
  var NUM_DODGES_PER_ROTATION = NUM_MH_SWINGS_PER_ROTATION + NUM_OH_SWINGS_PER_ROTATION + 3 + 2;
  var RAGE_PER_SECOND_T4_4PC = SET_BONUS_TIER4_4PIECE ? NUM_DODGES_PER_ROTATION * 2 / ROTATION_DURATION_SECONDS : 0;
  var RAGE_BUDGET = ROTATION_DURATION_SECONDS * (RAGE_PER_SECOND_UNBRIDLED_WRATH + RAGE_PER_SECOND_BLOODRAGE + RAGE_PER_SECOND_ANGER_MANAGEMENT + RAGE_PER_SECOND_MH + RAGE_PER_SECOND_WINDFURY + RAGE_PER_SECOND_OH + RAGE_PER_SECOND_T4_4PC); // Assume 100% uptime, 3 second overlap due to the "previously-crit" requirement

  var RAMPAGE_RAGE_COST_PER_SECOND = 20 / (30 - 3);
  var BATTLESHOUT_RAGE_COST_PER_SECOND = 10 / 120;
  var BLOODTHIRST_RAGE_COST = 30;
  var WHIRLWIND_RAGE_COST = 25 - (SET_BONUS_TIER4_2PIECE ? 5 : 0);
  var ROTATION_RAGE_COST = ROTATION_DURATION_SECONDS * (RAMPAGE_RAGE_COST_PER_SECOND + BATTLESHOUT_RAGE_COST_PER_SECOND) + 3 * BLOODTHIRST_RAGE_COST;
  var LEFTOVER_RAGE = RAGE_BUDGET - ROTATION_RAGE_COST;

  var NUM_WW_PER_ROTATION = _lodash.default.clamp(LEFTOVER_RAGE / WHIRLWIND_RAGE_COST, 0, 2); // Improved Heroic Strike


  var HEROIC_STRIKE_RAGE_COST = 15 - 3; // How many HS's can we perform with the leftover rage

  var NUM_HEROIC_STRIKES_PER_ROTATION = _lodash.default.clamp((LEFTOVER_RAGE - NUM_WW_PER_ROTATION * WHIRLWIND_RAGE_COST) / (HEROIC_STRIKE_RAGE_COST + RAGE_MH), 0, NUM_MH_SWINGS_PER_ROTATION); // Any Heroic Strikes take away from white swings so we have to adjust


  var MH_WHITE_CONTRIBUTION = 1 - NUM_HEROIC_STRIKES_PER_ROTATION / NUM_MH_SWINGS_PER_ROTATION;
  var MH_WHITE_DPS_ADJUSTED_FOR_HS = MH_WHITE_DPS * MH_WHITE_CONTRIBUTION;
  var MH_WHITE_DPS_EXTRA_ATTACKS_WINDFURY_TOTEM = MH_EXTRA_ATTACKS_WINDFURY_TOTEM * (ATTACK_TABLE_WHITE_MH.hit * MH_DAMAGE + ATTACK_TABLE_WHITE_MH.glance * MH_DAMAGE * 0.65 + ATTACK_TABLE_WHITE_MH.crit * MH_DAMAGE * 2) / ROTATION_DURATION_SECONDS;
  var WHITE_DPS = MH_WHITE_DPS_ADJUSTED_FOR_HS + MH_WHITE_DPS_EXTRA_ATTACKS_WINDFURY_TOTEM + OH_WHITE_DPS;
  var YELLOW_HIT_CHANCE = 1 - ATTACK_TABLE_YELLOW_MH.miss - ATTACK_TABLE_YELLOW_MH.dodge - ATTACK_TABLE_YELLOW_MH.parry;
  var HEROIC_STRIKE_DAMAGE = 208 + (MH_WEAPON_DAMAGE + AP_COEFFICIENT * stats.attackpower / 14) * ARMOR_MULTIPLIER * target.multipliers.physical; // Yellow hits that dont miss and dont crit

  var HEROIC_STRIKE_COMPONENT = YELLOW_HIT_CHANCE * (1 - ATTACK_TABLE_YELLOW_MH.crit) * HEROIC_STRIKE_DAMAGE; // Yellow hits that dont miss and do crit

  var HEROIC_STRIKE_CRIT_COMPONENT = YELLOW_HIT_CHANCE * ATTACK_TABLE_YELLOW_MH.crit * HEROIC_STRIKE_DAMAGE * 2 * // Melee crit
  1.2; // Talent: Impale

  var HEROIC_STRIKE_DPS = NUM_HEROIC_STRIKES_PER_ROTATION * (HEROIC_STRIKE_COMPONENT + HEROIC_STRIKE_CRIT_COMPONENT) / ROTATION_DURATION_SECONDS;
  var BLOODTHIRST_DAMAGE = 0.45 * stats.attackpower * ARMOR_MULTIPLIER * target.multipliers.physical;
  var BLOODTHIRST_COMPONENT = YELLOW_HIT_CHANCE * (1 - ATTACK_TABLE_YELLOW_MH.crit) * BLOODTHIRST_DAMAGE;
  var BLOODTHIRST_CRIT_COMPONENT = YELLOW_HIT_CHANCE * ATTACK_TABLE_YELLOW_MH.crit * HEROIC_STRIKE_DAMAGE * 2 * // Melee crit
  1.2; // Talent: Impale

  var BLOODTHIRST_DPS = 3 * (BLOODTHIRST_COMPONENT + BLOODTHIRST_CRIT_COMPONENT) / ROTATION_DURATION_SECONDS;
  var WHIRLWIND_DAMAGE = MH_DAMAGE + OH_DAMAGE;
  var WHIRLWIND_COMPONENT = YELLOW_HIT_CHANCE * (1 - ATTACK_TABLE_YELLOW_MH.crit) * WHIRLWIND_DAMAGE;
  var WHIRLWIND_CRIT_COMPONENT = YELLOW_HIT_CHANCE * ATTACK_TABLE_YELLOW_MH.crit * WHIRLWIND_DAMAGE * 2 * // Melee crit
  1.2; // Talent: Impale

  var WHIRLWIND_DPS = NUM_WW_PER_ROTATION * (WHIRLWIND_COMPONENT + WHIRLWIND_CRIT_COMPONENT) / ROTATION_DURATION_SECONDS;
  var HITS_PER_SECOND = (NUM_MH_SWINGS_PER_ROTATION + NUM_OH_SWINGS_PER_ROTATION + 3 + 2) / 18; // Chance that after a crit we get four ticks means no crits for 12 seconds

  var DEEP_WOUNDS_P4 = Math.pow(1 - stats.critChance / 100, 12 * HITS_PER_SECOND); // Exactly three ticks: 9 seconds of no crits minus P4

  var DEEP_WOUNDS_P3 = Math.pow(1 - stats.critChance / 100, 9 * HITS_PER_SECOND) - DEEP_WOUNDS_P4; // Exactly two ticks: 6 seconds of no crits minus P3

  var DEEP_WOUNDS_P2 = Math.pow(1 - stats.critChance / 100, 6 * HITS_PER_SECOND) - DEEP_WOUNDS_P3; // Exactly one tick: 3 seconds no crits minus P2

  var DEEP_WOUNDS_P1 = Math.pow(1 - stats.critChance / 100, 3 * HITS_PER_SECOND) - DEEP_WOUNDS_P2;
  var DEEP_WOUNDS_AVERAGE_TICKS_PER_CRIT = DEEP_WOUNDS_P1 + 2 * DEEP_WOUNDS_P2 + 3 * DEEP_WOUNDS_P3 + 4 * DEEP_WOUNDS_P4;
  var DEEP_WOUNDS_TICKS_PER_ROTATION = HITS_PER_SECOND * ROTATION_DURATION_SECONDS * (stats.critChance / 100) * DEEP_WOUNDS_AVERAGE_TICKS_PER_CRIT;
  var DEEP_WOUNDS_TICK_DAMAGE = (MH_WEAPON_DAMAGE + stats.attackpower / 14 * (WEAPON_MAINHAND.weapon_speed / 1000)) * 0.6 / 4;
  var DEEP_WOUNDS_DPS = DEEP_WOUNDS_TICKS_PER_ROTATION * DEEP_WOUNDS_TICK_DAMAGE / ROTATION_DURATION_SECONDS;
  var segments = [{
    source: {
      icon: 'inv_sword_04',
      name: 'Auto Attacks'
    },
    dps: WHITE_DPS,
    subSegments: [{
      source: _objectSpread({}, WEAPON_MAINHAND, {
        name: 'Main Hand'
      }),
      dps: MH_WHITE_DPS_ADJUSTED_FOR_HS,
      subSegments: [{
        source: {
          icon: 'spell_nature_windfury',
          name: 'Windfury Totem'
        },
        dps: MH_WHITE_DPS_EXTRA_ATTACKS_WINDFURY_TOTEM
      }]
    }, {
      source: _objectSpread({}, WEAPON_OFFHAND, {
        name: 'Off Hand'
      }),
      dps: OH_WHITE_DPS
    }]
  }, {
    source: _abilities.default.heroicstrike,
    dps: HEROIC_STRIKE_DPS
  }, {
    source: _abilities.default.bloodthirst,
    dps: BLOODTHIRST_DPS
  }, {
    source: _abilities.default.whirlwind,
    dps: WHIRLWIND_DPS
  }, {
    source: _abilities.default.deepwounds,
    dps: DEEP_WOUNDS_DPS
  }];
  return segments;
};

exports.default = _default;