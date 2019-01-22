"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _abilities = _interopRequireDefault(require("../../domain/abilities"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = function _default(_ref) {
  var stats = _ref.vitals,
      target = _ref.target,
      spells = _ref.spells;
  var HUMAN_FACTOR_CAST_DELAY = 0;
  var HUMAN_FACTOR_LAG = 0.1; // T4 4-piece: Your Mind Flay and Smite spells deal 5% more damage.

  var SET_BONUS_TIER4_4PIECE = _lodash.default.find(spells, {
    id: 37571
  });

  var VAMPIRIC_TOUCH_DURATION = 15;
  var VAMPIRIC_TOUCH_CAST_TIME = 1.5 / (1 + stats.spellhaste / 100);
  var SHADOW_WORD_PAIN_DURATION = 24;
  var MIND_BLAST_COOLDOWN = 5.5;
  var MIND_BLAST_CAST_TIME = 1.5 / (1 + stats.spellhaste / 100);
  var SHADOW_WORD_DEATH_COOLDOWN = 12;
  var MIND_FLAY_CAST_TIME = 3 / (1 + stats.spellhaste / 100) + HUMAN_FACTOR_LAG;
  var GCD = 1.5 / (1 + stats.spellhaste / 100);
  var ROTATION_DURATION_SECONDS = SHADOW_WORD_PAIN_DURATION;
  var SHADOW_WORD_PAINS_PER_ROTATION = ROTATION_DURATION_SECONDS / (SHADOW_WORD_PAIN_DURATION + HUMAN_FACTOR_CAST_DELAY);
  var VAMPIRIC_TOUCHES_PER_ROTATION = ROTATION_DURATION_SECONDS / (VAMPIRIC_TOUCH_DURATION + HUMAN_FACTOR_CAST_DELAY);
  var MIND_BLASTS_PER_ROTATION = ROTATION_DURATION_SECONDS / (MIND_BLAST_COOLDOWN + HUMAN_FACTOR_CAST_DELAY);
  var SHADOW_WORD_DEATHS_PER_ROTATION = ROTATION_DURATION_SECONDS / (SHADOW_WORD_DEATH_COOLDOWN + HUMAN_FACTOR_CAST_DELAY);
  var LEFTOVER_CAST_TIME_PER_ROTATION = ROTATION_DURATION_SECONDS - SHADOW_WORD_PAINS_PER_ROTATION * GCD - VAMPIRIC_TOUCHES_PER_ROTATION * VAMPIRIC_TOUCH_CAST_TIME - MIND_BLASTS_PER_ROTATION * MIND_BLAST_CAST_TIME - SHADOW_WORD_DEATHS_PER_ROTATION * GCD;
  var MIND_FLAYS_PER_ROTATION = LEFTOVER_CAST_TIME_PER_ROTATION / MIND_FLAY_CAST_TIME;
  console.log('SHADOW_WORD_PAINS_PER_ROTATION', SHADOW_WORD_PAINS_PER_ROTATION);
  console.log('VAMPIRIC_TOUCHES_PER_ROTATION', VAMPIRIC_TOUCHES_PER_ROTATION);
  console.log('MIND_BLASTS_PER_ROTATION', MIND_BLASTS_PER_ROTATION);
  console.log('SHADOW_WORD_DEATHS_PER_ROTATION', SHADOW_WORD_DEATHS_PER_ROTATION);
  console.log('MIND_FLAYS_PER_ROTATION', MIND_FLAYS_PER_ROTATION);
  console.log('LEFTOVER_CAST_TIME_PER_ROTATION', LEFTOVER_CAST_TIME_PER_ROTATION);
  var HIT_CHANCE = (100 - (16 - _lodash.default.clamp(stats.spellhitChance, 0, 16) + 1)) / 100;
  var CRIT_CHANCE = stats.spellcritChance / 100;
  var DAMAGE_MULTIPLIER = 1 * 1.15 * // Shadowform
  1.1 * // Darkness
  target.multipliers.shadow; // Includes Misery

  var SHADOW_WORD_PAIN_DAMAGE = (_abilities.default.shadowwordpain.damage + _abilities.default.shadowwordpain.coefficient * stats.spelldamage) * DAMAGE_MULTIPLIER;
  var SHADOW_WORD_PAIN_DAMAGE_DPS = SHADOW_WORD_PAINS_PER_ROTATION * SHADOW_WORD_PAIN_DAMAGE / ROTATION_DURATION_SECONDS;
  var MIND_BLAST_DAMAGE = (_abilities.default.mindblast.damage + _abilities.default.mindblast.coefficient * stats.spelldamage) * DAMAGE_MULTIPLIER;
  var MIND_BLAST_CRIT_CHANCE = CRIT_CHANCE + 0.15;
  var MIND_BLAST_HIT_COMPONENT = HIT_CHANCE * (1 - MIND_BLAST_CRIT_CHANCE) * MIND_BLAST_DAMAGE;
  var MIND_BLAST_CRIT_COMPONENT = HIT_CHANCE * MIND_BLAST_CRIT_CHANCE * MIND_BLAST_DAMAGE * 1.5;
  var MIND_BLAST_DPS = MIND_BLASTS_PER_ROTATION * (MIND_BLAST_HIT_COMPONENT + MIND_BLAST_CRIT_COMPONENT) / ROTATION_DURATION_SECONDS;
  var VAMPIRIC_TOUCH_DAMAGE = (_abilities.default.vampirictouch.damage + _abilities.default.vampirictouch.coefficient * stats.spelldamage) * DAMAGE_MULTIPLIER;
  var VAMPIRIC_TOUCH_DPS = VAMPIRIC_TOUCHES_PER_ROTATION * VAMPIRIC_TOUCH_DAMAGE / ROTATION_DURATION_SECONDS;
  var SHADOW_WORD_DEATH_DAMAGE = (_abilities.default.shadowworddeath.damage + _abilities.default.shadowworddeath.coefficient * stats.spelldamage) * DAMAGE_MULTIPLIER;
  var SHADOW_WORD_DEATH_CRIT_CHANCE = CRIT_CHANCE + 0.15;
  var SHADOW_WORD_DEATH_HIT_COMPONENT = HIT_CHANCE * (1 - SHADOW_WORD_DEATH_CRIT_CHANCE) * SHADOW_WORD_DEATH_DAMAGE;
  var SHADOW_WORD_DEATH_CRIT_COMPONENT = HIT_CHANCE * SHADOW_WORD_DEATH_CRIT_CHANCE * SHADOW_WORD_DEATH_DAMAGE * 1.5;
  var SHADOW_WORD_DEATH_DPS = SHADOW_WORD_DEATHS_PER_ROTATION * (SHADOW_WORD_DEATH_HIT_COMPONENT + SHADOW_WORD_DEATH_CRIT_COMPONENT) / ROTATION_DURATION_SECONDS;
  var MIND_FLAY_DAMAGE = (_abilities.default.mindflay.damage + _abilities.default.mindflay.coefficient * stats.spelldamage) * (SET_BONUS_TIER4_4PIECE ? 1.05 : 1) * DAMAGE_MULTIPLIER;
  var MIND_FLAY_DPS = MIND_FLAYS_PER_ROTATION * MIND_FLAY_DAMAGE / ROTATION_DURATION_SECONDS;
  return [{
    source: _abilities.default.shadowwordpain,
    dps: SHADOW_WORD_PAIN_DAMAGE_DPS
  }, {
    source: _abilities.default.mindblast,
    dps: MIND_BLAST_DPS
  }, {
    source: _abilities.default.vampirictouch,
    dps: VAMPIRIC_TOUCH_DPS
  }, {
    source: _abilities.default.shadowworddeath,
    dps: SHADOW_WORD_DEATH_DPS
  }, {
    source: _abilities.default.mindflay,
    dps: MIND_FLAY_DPS
  }];
};

exports.default = _default;