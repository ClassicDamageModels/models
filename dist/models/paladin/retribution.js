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
      _ref$character$data = _ref.character.data,
      gear = _ref$character$data.gear,
      race = _ref$character$data.race;
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

  var WEAPON_MAINHAND = MH && MH.class === 'weapon' && MH;
  var MH_IS_2H = MH && MH.type === '2H weapon';
  var WINDFURY_TOTEM = buffs.raid; // FIXME: Pass all buffs explicitly

  var _getAttackTable = (0, _combat.getAttackTable)('white', stats, [WEAPON_MAINHAND]),
      _getAttackTable2 = _slicedToArray(_getAttackTable, 1),
      ATTACK_TABLE_WHITE = _getAttackTable2[0];

  var _getAttackTable3 = (0, _combat.getAttackTable)('yellow', stats, [WEAPON_MAINHAND]),
      _getAttackTable4 = _slicedToArray(_getAttackTable3, 1),
      ATTACK_TABLE_YELLOW = _getAttackTable4[0];

  var AP_COEFFICIENT = WEAPON_MAINHAND && (0, _combat.getAPCoefficient)(WEAPON_MAINHAND) || 0;
  var ARMOR_MULTIPLIER = (0, _combat.getArmorMultiplier)(_lodash.default.clamp(target.stats.armor - stats.armorpen, 0, 7700));
  var TOTAL_HASTE = 1 + stats.haste / 100;
  var MH_WEAPON_SPEED = WEAPON_MAINHAND && WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE || 1;
  var MH_WEAPON_DAMAGE = WEAPON_MAINHAND && (WEAPON_MAINHAND.dmg_min + WEAPON_MAINHAND.dmg_max) / 2 || 0;
  var NUM_CRUSADER_STRIKES_PER_ROTATION = 3;
  var NUM_JUDGEMENTS_PER_ROTATION = 2;
  var ROTATION_DURATION_SECONDS = 18;
  var NUM_MH_SWINGS_PER_ROTATION = WEAPON_MAINHAND && ROTATION_DURATION_SECONDS / MH_WEAPON_SPEED || 0;
  var NUM_MH_ATTACKS_PER_ROTATION = NUM_MH_SWINGS_PER_ROTATION + NUM_CRUSADER_STRIKES_PER_ROTATION + NUM_JUDGEMENTS_PER_ROTATION;
  var MH_DAMAGE = WEAPON_MAINHAND && (MH_WEAPON_DAMAGE + stats.attackpower / 14 * (WEAPON_MAINHAND.weapon_speed / 1000)) * ARMOR_MULTIPLIER * (MH_IS_2H ? 1.06 : 1) * // Talent: Two-Handed Weapon Specialization
  1.03 * // Talent: Crusade
  1.15 * // Talent: Vengeance
  target.multipliers.physical || 0;
  var MH_CRIT_DAMAGE = MH_DAMAGE * 2;
  var MH_WHITE_COMPONENT = ATTACK_TABLE_WHITE.hit * MH_DAMAGE + ATTACK_TABLE_WHITE.glance * MH_DAMAGE * 0.65 + ATTACK_TABLE_WHITE.crit * MH_CRIT_DAMAGE;
  var MH_EXTRA_ATTACKS_WINDFURY_TOTEM = WINDFURY_TOTEM ? 0.2 * NUM_MH_ATTACKS_PER_ROTATION : 0;
  var MH_WHITE_DPS = WEAPON_MAINHAND && NUM_MH_SWINGS_PER_ROTATION * MH_WHITE_COMPONENT / ROTATION_DURATION_SECONDS || 0;
  var MH_WHITE_DPS_EXTRA_ATTACKS_WINDFURY_TOTEM = MH_EXTRA_ATTACKS_WINDFURY_TOTEM * MH_WHITE_COMPONENT / ROTATION_DURATION_SECONDS;
  var WHITE_DPS = MH_WHITE_DPS + MH_WHITE_DPS_EXTRA_ATTACKS_WINDFURY_TOTEM;
  var YELLOW_HIT_CHANCE = 1 - ATTACK_TABLE_YELLOW.miss - ATTACK_TABLE_YELLOW.dodge - ATTACK_TABLE_YELLOW.parry;
  var CRUSADER_STRIKE_DAMAGE = WEAPON_MAINHAND && (MH_WEAPON_DAMAGE + AP_COEFFICIENT * stats.attackpower / 14) * 1.1 * ( // 110% Weapon Damage
  MH_IS_2H ? 1.06 : 1) * // Talent: Two-Handed Weapon Specialization
  1.15 * // Talent: Vengeance
  ARMOR_MULTIPLIER * target.multipliers.physical || 0;
  var CRUSADER_STRIKE_CRIT_DAMAGE = CRUSADER_STRIKE_DAMAGE * 2; // Yellow hits that dont miss and dont crit

  var CRUSADER_STRIKE_HIT_COMPONENT = YELLOW_HIT_CHANCE * (1 - ATTACK_TABLE_YELLOW.crit) * CRUSADER_STRIKE_DAMAGE; // Yellow hits that dont miss and do crit

  var CRUSADER_STRIKE_CRIT_COMPONENT = YELLOW_HIT_CHANCE * ATTACK_TABLE_YELLOW.crit * CRUSADER_STRIKE_CRIT_DAMAGE;
  var CRUSADER_STRIKE_DPS = NUM_CRUSADER_STRIKES_PER_ROTATION * (CRUSADER_STRIKE_HIT_COMPONENT + CRUSADER_STRIKE_CRIT_COMPONENT) / ROTATION_DURATION_SECONDS; // Seal of Blood: All melee attacks deal additional Holy damage equal to 35% of
  // normal weapon damage, but the Paladin loses health equal to 10% of the total damage
  // inflicted. Unleashing this Seal's energy will judge an enemy, instantly causing 295 to 326
  // Holy damage at the cost of health equal to 33% of the damage caused.

  /*
  Seal of Command procs "per minute" (ppm), rather than per hit - it will proc
  an average of 7 times per minute. So you get the same amount of procs no matter your
  weapon speed, but a slower, high damage-per-strike weapon will do more Seal of Command
  damage per hit, on average, than a faster, low damage-per-strike weapon rated at the same DPS.
  Seal of Command's ppm-rate is the same through rank 1 to 5. The only difference that the ranks
  make is the damage of the Judgement.
   Seal of Command receives 20% coefficient from normal +spell damage stats, and 29% from
  +holy damage stats (such as Judgement of the Crusader). Judgement of Command receives 43%
  coefficient from any +spell damage stats.
   Unlike other spells, Seal of Command and Judgement of Command are considered physical hits,
  that does Holy damage. They both use melee crit and hit stats instead of spell crit or hit,
  and when they crit the damage will be multiplied by two. However like other physical attacks,
  Seal of Command can miss, or be dodged, parried, or blocked. Judgement of Command can only
  be resisted.
   TL;DR SoC: 7 PPM, 20% sp coefficient, Melee mechanics, holy damage => goes through armor
  SoB: no coefficient,
  JoC & JoB: 43% sp coefficient,
   */

  var SEAL = race === 'bloodelf' ? _abilities.default.sealofblood : _abilities.default.sealofcommand;
  var SEAL_PROCS = (SEAL === _abilities.default.sealofblood ? 1 : 7 / 60 * MH_WEAPON_SPEED) * NUM_MH_SWINGS_PER_ROTATION;
  var MH_DAMAGE_SEAL = WEAPON_MAINHAND && (MH_WEAPON_DAMAGE + stats.attackpower / 14 * (WEAPON_MAINHAND.weapon_speed / 1000)) * (MH_IS_2H ? 1.06 : 1) * // Talent: Two-Handed Weapon Specialization
  1.03 * // Talent: Crusade
  1.15 * // Talent: Vengeance
  target.multipliers.holy || 0;
  var SEAL_OF_COMMAND_HIT_COMPONENT = YELLOW_HIT_CHANCE * (1 - ATTACK_TABLE_YELLOW.crit) * MH_DAMAGE_SEAL;
  var SEAL_OF_COMMAND_CRIT_COMPONENT = YELLOW_HIT_CHANCE * ATTACK_TABLE_YELLOW.crit * MH_DAMAGE_SEAL;
  var SEAL_OF_BLOOD_HIT_COMPONENT = (1 - ATTACK_TABLE_YELLOW.crit) * MH_DAMAGE_SEAL;
  var SEAL_OF_BLOOD_CRIT_COMPONENT = (1 - ATTACK_TABLE_YELLOW.miss) * ATTACK_TABLE_YELLOW.crit * MH_DAMAGE_SEAL;
  var SEAL_COMPONENT = SEAL === _abilities.default.sealofblood ? SEAL_OF_BLOOD_HIT_COMPONENT + SEAL_OF_BLOOD_CRIT_COMPONENT : SEAL_OF_COMMAND_HIT_COMPONENT + SEAL_OF_COMMAND_CRIT_COMPONENT;
  var SEAL_DAMAGE = (SEAL === _abilities.default.sealofblood ? 0.35 * SEAL_COMPONENT : 0.7 * SEAL_COMPONENT + 1 / 5 * stats.spelldamage) * 1.14 * // Talent: Sanctity Aura (Improved)
  1.15; // Talent: Vengeance

  var SEAL_DPS = SEAL_PROCS * SEAL_DAMAGE / ROTATION_DURATION_SECONDS;
  var JUDGEMENT_DAMAGE = (SEAL === _abilities.default.sealofblood ? (331 + 362) / 2 + 0.43 * stats.spelldamage : (228 + 252) / 2 + 0.43 * stats.spelldamage) * 1.14 * // Talent: Sanctity Aura (Improved)
  1.15; // Talent: Vengeance

  var _getAttackTable5 = (0, _combat.getAttackTable)('yellow', stats, [WEAPON_MAINHAND], {
    critChance: 15,
    // Talent: Fanaticism
    expertise: 100 // Judgement can only resist (meaning miss)

  }),
      _getAttackTable6 = _slicedToArray(_getAttackTable5, 1),
      JUDGEMENT_ATTACK_TABLE = _getAttackTable6[0];

  var JUDGEMENT_HIT_CHANCE = 1 - JUDGEMENT_ATTACK_TABLE.miss - JUDGEMENT_ATTACK_TABLE.dodge - JUDGEMENT_ATTACK_TABLE.parry;
  var JUDGEMENT_HIT_COMPONENT = JUDGEMENT_HIT_CHANCE * (1 - JUDGEMENT_ATTACK_TABLE.crit) * JUDGEMENT_DAMAGE;
  var JUDGEMENT_CRIT_COMPONENT = JUDGEMENT_HIT_CHANCE * JUDGEMENT_ATTACK_TABLE.crit * JUDGEMENT_DAMAGE * 2;
  var JUDGEMENT_DPS = NUM_JUDGEMENTS_PER_ROTATION * (JUDGEMENT_HIT_COMPONENT + JUDGEMENT_CRIT_COMPONENT) / ROTATION_DURATION_SECONDS;
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
      dps: MH_WHITE_DPS,
      subSegments: [{
        source: {
          icon: 'spell_nature_windfury',
          name: 'Windfury Totem'
        },
        dps: MH_WHITE_DPS_EXTRA_ATTACKS_WINDFURY_TOTEM
      }]
    }]
  }, {
    source: _abilities.default.crusaderstrike,
    dps: CRUSADER_STRIKE_DPS
  }, {
    source: SEAL,
    dps: SEAL_DPS
  }, {
    source: _abilities.default.judgement,
    dps: JUDGEMENT_DPS
  }];
};

exports.default = _default;