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
  var MH_SWORD_SPECIALIZATION = WEAPON_MAINHAND && (WEAPON_MAINHAND.subclass === 'sword_1h' || WEAPON_MAINHAND.subclass === 'sword_2h') || false;
  var OH_SWORD_SPECIALIZATION = MH_SWORD_SPECIALIZATION && WEAPON_OFFHAND && (WEAPON_OFFHAND.subclass === 'sword_1h' || WEAPON_OFFHAND.subclass === 'sword_2h') || false;
  var FIGHT_DURATION_SECONDS = 5 * 60;
  var WINDFURY_TOTEM = buffs.raid; // FIXME: Pass all buffs explicitly
  // T4 2-piece: Your Whirlwind ability costs 5 less rage.

  var SET_BONUS_TIER4_2PIECE = _lodash.default.find(spells, {
    id: 37518
  }); // T4 4-piece: You gain an additional 2 rage each time one of your attacks is parried or dodged.


  var SET_BONUS_TIER4_4PIECE = _lodash.default.find(spells, {
    id: 37519
  });

  var ATTACK_TABLE_WHITE = (0, _combat.getAttackTable)('white', stats, [WEAPON_MAINHAND, WEAPON_OFFHAND]);
  var ATTACK_TABLE_YELLOW = (0, _combat.getAttackTable)('yellow', stats, [WEAPON_MAINHAND, WEAPON_OFFHAND]);
  var FLURRY_UPTIME = 1 - Math.pow(1 - ATTACK_TABLE_WHITE.crit, 4);
  var AP_COEFFICIENT = WEAPON_MAINHAND && (0, _combat.getAPCoefficient)(WEAPON_MAINHAND) || 0;
  var BONUS_HASTE = 1 + 0.15 * FLURRY_UPTIME;
  var TOTAL_HASTE = (1 + stats.haste / 100) * BONUS_HASTE;
  var ARMOR_MULTIPLIER = (0, _combat.getArmorMultiplier)(_lodash.default.clamp(target.stats.armor - stats.armorpen, 0, 7700));
  var MH_WEAPON_SPEED = WEAPON_MAINHAND && WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE || 1;
  var SLAM_IN_ROTATION = WEAPON_MAINHAND && WEAPON_MAINHAND.type === '2H weapon' || false; // Delay between auto attack & slam

  var SLAM_DELAY_SECONDS = 0.05;
  var SLAM_CAST_TIME_SECONDS = 0.5;
  var MH_WEAPON_DAMAGE = WEAPON_MAINHAND && (WEAPON_MAINHAND.dmg_min + WEAPON_MAINHAND.dmg_max) / 2 || 0;
  var OH_WEAPON_DAMAGE = WEAPON_OFFHAND && (WEAPON_OFFHAND.dmg_min + WEAPON_OFFHAND.dmg_max) / 2 || 0; // Rotation: Auto -> Slam, MS? -> Auto -> Slam, WW?? ->
  //           Auto -> Slam, MS? -> Auto -> Slam, Instant

  var SLAMS_PER_ROTATION = 4;
  var ROTATION_DURATION_SECONDS = SLAM_IN_ROTATION ? SLAMS_PER_ROTATION * (MH_WEAPON_SPEED + SLAM_DELAY_SECONDS + SLAM_CAST_TIME_SECONDS) : 12; // 2x Mortal Strike 1x WW

  var NUM_MH_SWINGS_PER_ROTATION = WEAPON_MAINHAND && (SLAM_IN_ROTATION ? SLAMS_PER_ROTATION : ROTATION_DURATION_SECONDS / (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE)) || 0;
  var NUM_MH_ATTACKS_PER_ROTATION = NUM_MH_SWINGS_PER_ROTATION + (SLAM_IN_ROTATION ? SLAMS_PER_ROTATION : 0);
  var NUM_OH_SWINGS_PER_ROTATION = WEAPON_OFFHAND && ROTATION_DURATION_SECONDS / (WEAPON_OFFHAND.weapon_speed / 1000 / TOTAL_HASTE) || 0; // Average MH swing damage

  var MH_DAMAGE = WEAPON_MAINHAND && (MH_WEAPON_DAMAGE + stats.attackpower / 14 * (WEAPON_MAINHAND.weapon_speed / 1000)) * ARMOR_MULTIPLIER * 1.05 * // Talent: Two-Handed Weapon Specialization
  target.multipliers.physical || 0;
  var MH_CRIT_DAMAGE = MH_DAMAGE * 2; // Average OH swing damage

  var OH_DAMAGE = WEAPON_OFFHAND && (OH_WEAPON_DAMAGE + stats.attackpower / 14 * (WEAPON_OFFHAND.weapon_speed / 1000)) * ARMOR_MULTIPLIER * target.multipliers.physical || 0;
  var OH_CRIT_DAMAGE = OH_DAMAGE * 2;
  var MH_WHITE_COMPONENT = ATTACK_TABLE_WHITE.hit * MH_DAMAGE + ATTACK_TABLE_WHITE.glance * MH_DAMAGE * 0.65 + ATTACK_TABLE_WHITE.crit * MH_CRIT_DAMAGE; // We just have to assume we have enough rage for instants becuse
  // this has to be done before rage calculations

  var NUM_INSTANT_ATTACKS_IN_ROTATION = 3; // Sword Specialization can proc off of any attack, white or instant.
  // Extra attacks from windfury can also proc Sword Specialization
  // Sword specialization cannot proc from itself

  var MH_EXTRA_ATTACKS_SWORD_SPECIALIZATION = MH_SWORD_SPECIALIZATION ? 0.05 * (NUM_MH_ATTACKS_PER_ROTATION + NUM_INSTANT_ATTACKS_IN_ROTATION) * (WINDFURY_TOTEM ? 1.2 : 1) : 0; // OH doesn't benefit from Windfury

  var OH_EXTRA_ATTACKS_SWORD_SPECIALIZATION = OH_SWORD_SPECIALIZATION ? 0.05 * NUM_OH_SWINGS_PER_ROTATION : 0; // Windfury can proc from any white or next-swing yellow
  // and cannot proc from itself

  var MH_EXTRA_ATTACKS_WINDFURY_TOTEM = WINDFURY_TOTEM ? 0.2 * NUM_MH_ATTACKS_PER_ROTATION * (MH_SWORD_SPECIALIZATION ? 1.05 : 1) : 0; // White dps must be adjusted for the time we are casting slam and the
  // amount of time we are clipping from the white swings before starting Slam

  var SLAM_PENALTY_SECONDS = SLAM_IN_ROTATION ? SLAM_DELAY_SECONDS + SLAM_CAST_TIME_SECONDS : 0;
  var MH_WHITE_DPS = WEAPON_MAINHAND && MH_WHITE_COMPONENT / (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE + SLAM_PENALTY_SECONDS) || 0;
  var OH_WHITE_COMPONENT = (ATTACK_TABLE_WHITE.hit * OH_DAMAGE + ATTACK_TABLE_WHITE.glance * OH_DAMAGE * 0.65 + ATTACK_TABLE_WHITE.crit * OH_CRIT_DAMAGE) * 0.5;
  var OH_WHITE_DPS = WEAPON_OFFHAND && OH_WHITE_COMPONENT / (WEAPON_OFFHAND.weapon_speed / 1000 / TOTAL_HASTE) || 0;
  var UNBRIDLED_WRATH_POINTS = 5;
  var RAGE_PER_SECOND_UNBRIDLED_WRATH_MH = WEAPON_MAINHAND && 3 * UNBRIDLED_WRATH_POINTS / 60 || 0;
  var RAGE_PER_SECOND_UNBRIDLED_WRATH_OH = WEAPON_OFFHAND && 3 * UNBRIDLED_WRATH_POINTS / 60 || 0;
  var RAGE_PER_SECOND_UNBRIDLED_WRATH = RAGE_PER_SECOND_UNBRIDLED_WRATH_MH + RAGE_PER_SECOND_UNBRIDLED_WRATH_OH;
  var RAGE_PER_SECOND_BLOODRAGE = 20 / 60;
  var RAGE_PER_SECOND_ANGER_MANAGEMENT = 1 / 3;
  var NUM_DODGES_PER_ROTATION = (NUM_MH_ATTACKS_PER_ROTATION + NUM_INSTANT_ATTACKS_IN_ROTATION) * ATTACK_TABLE_WHITE.dodge;
  var RAGE_PER_SECOND_T4_4PC = SET_BONUS_TIER4_4PIECE ? NUM_DODGES_PER_ROTATION * 2 / ROTATION_DURATION_SECONDS : 0; // const c = 0.0091107836 * Math.pow(70, 2) + 3.225598133 * 70 + 4.2652911 // 274.7

  var RAGE_CONVERSION_VALUE = 274.7;
  var RAGE_MH = WEAPON_MAINHAND && ATTACK_TABLE_WHITE.hit * _lodash.default.clamp(15 * MH_DAMAGE / (4 * RAGE_CONVERSION_VALUE) + 3.5 * WEAPON_MAINHAND.weapon_speed / 1000 / 2, 0, 15 * MH_DAMAGE / RAGE_CONVERSION_VALUE) + ATTACK_TABLE_WHITE.glance * _lodash.default.clamp(15 * MH_DAMAGE * 0.65 / (4 * RAGE_CONVERSION_VALUE) + 3.5 * WEAPON_MAINHAND.weapon_speed / 1000 / 2, 0, 15 * MH_DAMAGE / RAGE_CONVERSION_VALUE) + ATTACK_TABLE_WHITE.crit * _lodash.default.clamp(15 * MH_CRIT_DAMAGE / (4 * RAGE_CONVERSION_VALUE) + 7 * WEAPON_MAINHAND.weapon_speed / 1000 / 2, 0, 15 * MH_DAMAGE / RAGE_CONVERSION_VALUE) || 0;
  var RAGE_PER_SECOND_MH = WEAPON_MAINHAND && RAGE_MH / (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE + SLAM_PENALTY_SECONDS) || 0;
  var RAGE_PER_SECOND_WINDFURY = MH_EXTRA_ATTACKS_WINDFURY_TOTEM * RAGE_MH / ROTATION_DURATION_SECONDS;
  var RAGE_PER_SECOND_SWORD_SPECIALIZATION = MH_EXTRA_ATTACKS_SWORD_SPECIALIZATION * RAGE_MH / ROTATION_DURATION_SECONDS + OH_EXTRA_ATTACKS_SWORD_SPECIALIZATION * RAGE_MH / ROTATION_DURATION_SECONDS;
  var RAGE_OH = WEAPON_OFFHAND && ATTACK_TABLE_WHITE.hit * _lodash.default.clamp(15 * OH_DAMAGE / (4 * RAGE_CONVERSION_VALUE) + 1.75 * WEAPON_OFFHAND.weapon_speed / 1000 / 2, 0, 15 * OH_DAMAGE / RAGE_CONVERSION_VALUE) + ATTACK_TABLE_WHITE.glance * _lodash.default.clamp(15 * OH_DAMAGE * 0.65 / (4 * RAGE_CONVERSION_VALUE) + 1.75 * WEAPON_OFFHAND.weapon_speed / 1000 / 2, 0, 15 * OH_DAMAGE / RAGE_CONVERSION_VALUE) + ATTACK_TABLE_WHITE.crit * _lodash.default.clamp(15 * OH_CRIT_DAMAGE / (4 * RAGE_CONVERSION_VALUE) + 3.5 * WEAPON_OFFHAND.weapon_speed / 1000 / 2, 0, 15 * OH_DAMAGE / RAGE_CONVERSION_VALUE) || 0;
  var RAGE_PER_SECOND_OH = WEAPON_OFFHAND && RAGE_OH / (WEAPON_OFFHAND.weapon_speed / 1000 / TOTAL_HASTE) || 0;
  var RAGE_BUDGET = ROTATION_DURATION_SECONDS * (RAGE_PER_SECOND_UNBRIDLED_WRATH + RAGE_PER_SECOND_BLOODRAGE + RAGE_PER_SECOND_ANGER_MANAGEMENT + RAGE_PER_SECOND_MH + RAGE_PER_SECOND_WINDFURY + RAGE_PER_SECOND_SWORD_SPECIALIZATION + RAGE_PER_SECOND_OH + RAGE_PER_SECOND_T4_4PC);
  var BATTLESHOUT_RAGE_COST_PER_SECOND = 10 / 120;
  var MORTAL_STRIKE_RAGE_COST = 30;
  var WHIRLWIND_RAGE_COST = 25 - (SET_BONUS_TIER4_2PIECE ? 5 : 0);
  var SLAM_RAGE_COST = 15;
  var MAX_NUM_MS_PER_ROTATION = SLAM_IN_ROTATION ? 1 : 3;
  var MAX_NUM_WW_PER_ROTATION = SLAM_IN_ROTATION ? 1 : 2;
  var ROTATION_RAGE_COST = SLAM_IN_ROTATION ? ROTATION_DURATION_SECONDS * BATTLESHOUT_RAGE_COST_PER_SECOND + SLAMS_PER_ROTATION * SLAM_RAGE_COST : ROTATION_DURATION_SECONDS * BATTLESHOUT_RAGE_COST_PER_SECOND;
  var LEFTOVER_RAGE = RAGE_BUDGET - ROTATION_RAGE_COST;

  var NUM_MS_PER_ROTATION = _lodash.default.clamp(LEFTOVER_RAGE / MORTAL_STRIKE_RAGE_COST, 0, MAX_NUM_MS_PER_ROTATION);

  var NUM_WW_PER_ROTATION = _lodash.default.clamp((LEFTOVER_RAGE - NUM_MS_PER_ROTATION * MORTAL_STRIKE_RAGE_COST) / WHIRLWIND_RAGE_COST, 0, MAX_NUM_WW_PER_ROTATION);

  var HEROIC_STRIKE_RAGE_COST = 15 - 3; // Improved Heroic Strike
  // How many HS's can we perform with the leftover rage
  // Negative values are clipped (FIXME: negative leftover rage means not enough to complete the rotation...)

  var NUM_HEROIC_STRIKES_PER_ROTATION = Math.max((RAGE_BUDGET - ROTATION_RAGE_COST - NUM_MS_PER_ROTATION * MORTAL_STRIKE_RAGE_COST - NUM_WW_PER_ROTATION * WHIRLWIND_RAGE_COST) / (HEROIC_STRIKE_RAGE_COST + RAGE_MH), 0); // Any Heroic Strikes take away from white swings so we have to adjust

  var MH_WHITE_CONTRIBUTION = 1 - NUM_HEROIC_STRIKES_PER_ROTATION / NUM_MH_SWINGS_PER_ROTATION;
  var MH_WHITE_DPS_ADJUSTED_FOR_HS = MH_WHITE_DPS * MH_WHITE_CONTRIBUTION;
  var MH_WHITE_DPS_EXTRA_ATTACKS_WINDFURY_TOTEM = MH_EXTRA_ATTACKS_WINDFURY_TOTEM * (ATTACK_TABLE_WHITE.hit * MH_DAMAGE + ATTACK_TABLE_WHITE.glance * MH_DAMAGE * 0.65 + ATTACK_TABLE_WHITE.crit * MH_DAMAGE * 2) / ROTATION_DURATION_SECONDS;
  var MH_WHITE_DPS_EXTRA_ATTACKS_SWORD_SPECIALIZATION = MH_EXTRA_ATTACKS_SWORD_SPECIALIZATION * (ATTACK_TABLE_WHITE.hit * MH_DAMAGE + ATTACK_TABLE_WHITE.glance * MH_DAMAGE * 0.65 + ATTACK_TABLE_WHITE.crit * MH_DAMAGE * 2) / ROTATION_DURATION_SECONDS;
  var OH_WHITE_DPS_EXTRA_ATTACKS_SWORD_SPECIALIZATION = OH_EXTRA_ATTACKS_SWORD_SPECIALIZATION * (ATTACK_TABLE_WHITE.hit * MH_DAMAGE + ATTACK_TABLE_WHITE.glance * MH_DAMAGE * 0.65 + ATTACK_TABLE_WHITE.crit * MH_DAMAGE * 2) / ROTATION_DURATION_SECONDS;
  var WHITE_DPS = MH_WHITE_DPS_ADJUSTED_FOR_HS + MH_WHITE_DPS_EXTRA_ATTACKS_WINDFURY_TOTEM + MH_WHITE_DPS_EXTRA_ATTACKS_SWORD_SPECIALIZATION + OH_WHITE_DPS + OH_WHITE_DPS_EXTRA_ATTACKS_SWORD_SPECIALIZATION;
  var YELLOW_HIT_CHANCE = 1 - ATTACK_TABLE_YELLOW.miss - ATTACK_TABLE_YELLOW.dodge - ATTACK_TABLE_YELLOW.parry;
  var SLAM_DAMAGE = WEAPON_MAINHAND && (MH_WEAPON_DAMAGE + stats.attackpower / 14 * WEAPON_MAINHAND.weapon_speed / 1000) * 1.05 * // Talent: Two-Handed Weapon Specialization
  ARMOR_MULTIPLIER * target.multipliers.physical || 0;
  var SLAM_CRIT_DAMAGE = SLAM_DAMAGE * 2 * 1.2;
  var SLAM_HIT_COMPONENT = YELLOW_HIT_CHANCE * (1 - ATTACK_TABLE_YELLOW.crit) * SLAM_DAMAGE;
  var SLAM_CRIT_COMPONENT = YELLOW_HIT_CHANCE * ATTACK_TABLE_YELLOW.crit * SLAM_CRIT_DAMAGE;
  var SLAM_DPS = SLAM_IN_ROTATION ? SLAMS_PER_ROTATION * (SLAM_HIT_COMPONENT + SLAM_CRIT_COMPONENT) / ROTATION_DURATION_SECONDS : 0;
  var HEROIC_STRIKE_DAMAGE = 208 + (MH_WEAPON_DAMAGE + AP_COEFFICIENT * stats.attackpower / 14) * ARMOR_MULTIPLIER * target.multipliers.physical;
  var HEROIC_STRIKE_CRIT_DAMAGE = HEROIC_STRIKE_DAMAGE * 2 * // Melee crit
  1.2; // Talent: Impale
  // Yellow hits that dont miss and dont crit

  var HEROIC_STRIKE_COMPONENT = YELLOW_HIT_CHANCE * (1 - ATTACK_TABLE_YELLOW.crit) * HEROIC_STRIKE_DAMAGE; // Yellow hits that dont miss and do crit

  var HEROIC_STRIKE_CRIT_COMPONENT = YELLOW_HIT_CHANCE * ATTACK_TABLE_YELLOW.crit * HEROIC_STRIKE_CRIT_DAMAGE;
  var HEROIC_STRIKE_DPS = NUM_HEROIC_STRIKES_PER_ROTATION * (HEROIC_STRIKE_COMPONENT + HEROIC_STRIKE_CRIT_COMPONENT) / ROTATION_DURATION_SECONDS;
  var MORTAL_STRIKE_DAMAGE = WEAPON_MAINHAND && 210 + (MH_WEAPON_DAMAGE + AP_COEFFICIENT * stats.attackpower / 14) * 1.05 * // Talent: Two-Handed Weapon Specialization
  ARMOR_MULTIPLIER * target.multipliers.physical || 0;
  var MORTAL_STRIKE_CRIT_DAMAGE = MORTAL_STRIKE_DAMAGE * // Melee crit
  2 * // Talent: Impale
  1.2; // Yellow hits that dont miss and dont crit

  var MORTAL_STRIKE_HIT_COMPONENT = YELLOW_HIT_CHANCE * (1 - ATTACK_TABLE_YELLOW.crit) * MORTAL_STRIKE_DAMAGE; // Yellow hits that dont miss and do crit

  var MORTAL_STRIKE_CRIT_COMPONENT = YELLOW_HIT_CHANCE * ATTACK_TABLE_YELLOW.crit * MORTAL_STRIKE_CRIT_DAMAGE;
  var MORTAL_STRIKE_DPS = NUM_MS_PER_ROTATION * (MORTAL_STRIKE_HIT_COMPONENT + MORTAL_STRIKE_CRIT_COMPONENT) / ROTATION_DURATION_SECONDS;
  var WHIRLWIND_DAMAGE = MH_DAMAGE + OH_DAMAGE;
  var WHIRLWIND_CRIT_DAMAGE = WHIRLWIND_DAMAGE * 2 * // Melee crit
  1.2; // Talent: Impale

  var WHIRLWIND_COMPONENT = YELLOW_HIT_CHANCE * (1 - ATTACK_TABLE_YELLOW.crit) * WHIRLWIND_DAMAGE;
  var WHIRLWIND_CRIT_COMPONENT = YELLOW_HIT_CHANCE * ATTACK_TABLE_YELLOW.crit * WHIRLWIND_CRIT_DAMAGE;
  var WHIRLWIND_DPS = NUM_WW_PER_ROTATION * (WHIRLWIND_COMPONENT + WHIRLWIND_CRIT_COMPONENT) / ROTATION_DURATION_SECONDS;
  var HITS_PER_SECOND = (NUM_MH_SWINGS_PER_ROTATION + 2 + // 2 slams
  NUM_OH_SWINGS_PER_ROTATION + NUM_MS_PER_ROTATION + NUM_WW_PER_ROTATION) / ROTATION_DURATION_SECONDS; // Chance that after a crit we get four ticks means no crits for 12 seconds

  var DEEP_WOUNDS_P4 = Math.pow(1 - stats.critChance / 100, 12 * HITS_PER_SECOND); // Exactly three ticks: 9 seconds of no crits minus P4

  var DEEP_WOUNDS_P3 = Math.pow(1 - stats.critChance / 100, 9 * HITS_PER_SECOND) - DEEP_WOUNDS_P4; // Exactly two ticks: 6 seconds of no crits minus P3

  var DEEP_WOUNDS_P2 = Math.pow(1 - stats.critChance / 100, 6 * HITS_PER_SECOND) - DEEP_WOUNDS_P3; // Exactly one tick: 3 seconds no crits minus P2

  var DEEP_WOUNDS_P1 = Math.pow(1 - stats.critChance / 100, 3 * HITS_PER_SECOND) - DEEP_WOUNDS_P2;
  var DEEP_WOUNDS_AVERAGE_TICKS_PER_CRIT = DEEP_WOUNDS_P1 + 2 * DEEP_WOUNDS_P2 + 3 * DEEP_WOUNDS_P3 + 4 * DEEP_WOUNDS_P4;
  var DEEP_WOUNDS_TICKS_PER_ROTATION = HITS_PER_SECOND * ROTATION_DURATION_SECONDS * (stats.critChance / 100) * DEEP_WOUNDS_AVERAGE_TICKS_PER_CRIT;
  var DEEP_WOUNDS_TICK_DAMAGE = WEAPON_MAINHAND && (MH_WEAPON_DAMAGE + stats.attackpower / 14 * (WEAPON_MAINHAND.weapon_speed / 1000)) * 0.6 / 4 || 0;
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
      }, {
        source: {
          icon: 'inv_sword_27',
          name: 'Sword Specialization'
        },
        dps: MH_WHITE_DPS_EXTRA_ATTACKS_SWORD_SPECIALIZATION
      }]
    }, {
      source: _objectSpread({}, WEAPON_OFFHAND, {
        name: 'Off Hand'
      }),
      dps: OH_WHITE_DPS,
      subSegments: [{
        source: {
          icon: '',
          name: 'Sword Specialization'
        },
        dps: OH_WHITE_DPS_EXTRA_ATTACKS_SWORD_SPECIALIZATION
      }]
    }]
  }, {
    source: _abilities.default.slam,
    dps: SLAM_DPS
  }, {
    source: _abilities.default.heroicstrike,
    dps: HEROIC_STRIKE_DPS
  }, {
    source: _abilities.default.mortalstrike,
    dps: MORTAL_STRIKE_DPS
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