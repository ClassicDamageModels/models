"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _abilities = _interopRequireDefault(require("../../domain/abilities"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = function _default(_ref) {
  var stats = _ref.vitals,
      target = _ref.target,
      spec = _ref.spec;

  var LIGHTNING_OVERLOAD = _lodash.default.find(spec.talents, {
    name: 'Lightning Overload'
  });

  var LIGHTNING_BOLTS_PER_ROTATION = 4;
  var LIGHTNING_BOLT_CAST_TIME = _abilities.default.lightningbolt.castTime / (1 + stats.spellhaste / 100);
  var CHAIN_LIGHTNING_CAST_TIME = _abilities.default.chainlightning.castTime / (1 + stats.spellhaste / 100);
  var ROTATION_DURATION_SECONDS = LIGHTNING_BOLTS_PER_ROTATION * LIGHTNING_BOLT_CAST_TIME + CHAIN_LIGHTNING_CAST_TIME;
  var HIT_CHANCE = (100 - (16 - _lodash.default.clamp(stats.spellhitChance, 0, 16) + 1)) / 100;
  var CRIT_CHANCE = stats.spellcritChance / 100;
  var DAMAGE_MULTIPLIER = 1 * 1.05 * // Talent: Concussion
  target.multipliers.nature; // Misery

  var LIGHTNING_BOLT_DAMAGE = (_abilities.default.lightningbolt.damage + _abilities.default.lightningbolt.coefficient * stats.spelldamage) * DAMAGE_MULTIPLIER;
  var LIGHTNING_BOLT_HIT_COMPONENT = HIT_CHANCE * (1 - CRIT_CHANCE) * LIGHTNING_BOLT_DAMAGE;
  var LIGHTNING_BOLT_CRIT_COMPONENT = HIT_CHANCE * CRIT_CHANCE * LIGHTNING_BOLT_DAMAGE * 2;
  var LIGHTNING_BOLT_DPS = LIGHTNING_BOLTS_PER_ROTATION * (LIGHTNING_BOLT_HIT_COMPONENT + LIGHTNING_BOLT_CRIT_COMPONENT) / ROTATION_DURATION_SECONDS; // Overload cannot proc from itself on Netherwing
  // https://github.com/Atlantiss/NetherwingBugtracker/issues/2007#issuecomment-448341518

  var LB_OVERLOAD_PROC_DPS = LIGHTNING_BOLTS_PER_ROTATION * 0.2 * (LIGHTNING_BOLT_HIT_COMPONENT + LIGHTNING_BOLT_CRIT_COMPONENT) / 2 / ROTATION_DURATION_SECONDS;
  var CHAIN_LIGHTNING_DAMAGE = (_abilities.default.chainlightning.damage + _abilities.default.chainlightning.coefficient * stats.spelldamage) * DAMAGE_MULTIPLIER;
  var CHAIN_LIGHTNING_HIT_COMPONENT = HIT_CHANCE * (1 - CRIT_CHANCE) * CHAIN_LIGHTNING_DAMAGE;
  var CHAIN_LIGHTNING_CRIT_COMPONENT = HIT_CHANCE * CRIT_CHANCE * CHAIN_LIGHTNING_DAMAGE * 2;
  var CHAIN_LIGHTNING_DPS = (CHAIN_LIGHTNING_HIT_COMPONENT + CHAIN_LIGHTNING_CRIT_COMPONENT) / ROTATION_DURATION_SECONDS;
  var CL_OVERLOAD_PROC_DPS = 0.2 * (CHAIN_LIGHTNING_HIT_COMPONENT + CHAIN_LIGHTNING_CRIT_COMPONENT) / 2 / ROTATION_DURATION_SECONDS;
  return [{
    source: _abilities.default.lightningbolt,
    dps: LIGHTNING_BOLT_DPS + LB_OVERLOAD_PROC_DPS,
    subSegments: [{
      source: _objectSpread({}, LIGHTNING_OVERLOAD),
      dps: LB_OVERLOAD_PROC_DPS
    }]
  }, {
    source: _abilities.default.chainlightning,
    dps: CHAIN_LIGHTNING_DPS + CL_OVERLOAD_PROC_DPS,
    subSegments: [{
      source: _objectSpread({}, LIGHTNING_OVERLOAD),
      dps: CL_OVERLOAD_PROC_DPS
    }]
  }];
};

exports.default = _default;