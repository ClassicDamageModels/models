import _ from 'lodash'
import abilities from '../abilities'

export default ({ vitals: stats, target, spells }) => {
  const HUMAN_FACTOR_CAST_DELAY = 0
  const HUMAN_FACTOR_LAG = 0.1

  // T4 4-piece: Your Mind Flay and Smite spells deal 5% more damage.
  const SET_BONUS_TIER4_4PIECE = _.find(spells, { id: 37571 })

  const VAMPIRIC_TOUCH_DURATION = 15
  const VAMPIRIC_TOUCH_CAST_TIME = 1.5 / (1 + stats.spellhaste / 100)

  const SHADOW_WORD_PAIN_DURATION = 24

  const MIND_BLAST_COOLDOWN = 5.5
  const MIND_BLAST_CAST_TIME = 1.5 / (1 + stats.spellhaste / 100)

  const SHADOW_WORD_DEATH_COOLDOWN = 12

  const MIND_FLAY_CAST_TIME = 3 / (1 + stats.spellhaste / 100) + HUMAN_FACTOR_LAG

  const GCD = 1.5 / (1 + stats.spellhaste / 100)

  const ROTATION_DURATION_SECONDS = SHADOW_WORD_PAIN_DURATION

  const SHADOW_WORD_PAINS_PER_ROTATION =
    ROTATION_DURATION_SECONDS / (SHADOW_WORD_PAIN_DURATION + HUMAN_FACTOR_CAST_DELAY)
  const VAMPIRIC_TOUCHES_PER_ROTATION =
    ROTATION_DURATION_SECONDS / (VAMPIRIC_TOUCH_DURATION + HUMAN_FACTOR_CAST_DELAY)
  const MIND_BLASTS_PER_ROTATION =
    ROTATION_DURATION_SECONDS / (MIND_BLAST_COOLDOWN + HUMAN_FACTOR_CAST_DELAY)
  const SHADOW_WORD_DEATHS_PER_ROTATION =
    ROTATION_DURATION_SECONDS / (SHADOW_WORD_DEATH_COOLDOWN + HUMAN_FACTOR_CAST_DELAY)

  const LEFTOVER_CAST_TIME_PER_ROTATION =
    ROTATION_DURATION_SECONDS -
    SHADOW_WORD_PAINS_PER_ROTATION * GCD -
    VAMPIRIC_TOUCHES_PER_ROTATION * VAMPIRIC_TOUCH_CAST_TIME -
    MIND_BLASTS_PER_ROTATION * MIND_BLAST_CAST_TIME -
    SHADOW_WORD_DEATHS_PER_ROTATION * GCD

  const MIND_FLAYS_PER_ROTATION = LEFTOVER_CAST_TIME_PER_ROTATION / MIND_FLAY_CAST_TIME

  console.log('SHADOW_WORD_PAINS_PER_ROTATION', SHADOW_WORD_PAINS_PER_ROTATION)
  console.log('VAMPIRIC_TOUCHES_PER_ROTATION', VAMPIRIC_TOUCHES_PER_ROTATION)
  console.log('MIND_BLASTS_PER_ROTATION', MIND_BLASTS_PER_ROTATION)
  console.log('SHADOW_WORD_DEATHS_PER_ROTATION', SHADOW_WORD_DEATHS_PER_ROTATION)
  console.log('MIND_FLAYS_PER_ROTATION', MIND_FLAYS_PER_ROTATION)
  console.log('LEFTOVER_CAST_TIME_PER_ROTATION', LEFTOVER_CAST_TIME_PER_ROTATION)

  const HIT_CHANCE = (100 - (16 - _.clamp(stats.spellhitChance, 0, 16) + 1)) / 100
  const CRIT_CHANCE = stats.spellcritChance / 100

  const DAMAGE_MULTIPLIER =
    1 *
    1.15 * // Shadowform
    1.1 * // Darkness
    target.multipliers.shadow // Includes Misery

  const SHADOW_WORD_PAIN_DAMAGE =
    (abilities.shadowwordpain.damage + abilities.shadowwordpain.coefficient * stats.spelldamage) *
    DAMAGE_MULTIPLIER
  const SHADOW_WORD_PAIN_DAMAGE_DPS =
    (SHADOW_WORD_PAINS_PER_ROTATION * SHADOW_WORD_PAIN_DAMAGE) / ROTATION_DURATION_SECONDS

  const MIND_BLAST_DAMAGE =
    (abilities.mindblast.damage + abilities.mindblast.coefficient * stats.spelldamage) *
    DAMAGE_MULTIPLIER

  const MIND_BLAST_CRIT_CHANCE = CRIT_CHANCE + 0.15
  const MIND_BLAST_HIT_COMPONENT = HIT_CHANCE * (1 - MIND_BLAST_CRIT_CHANCE) * MIND_BLAST_DAMAGE
  const MIND_BLAST_CRIT_COMPONENT = HIT_CHANCE * MIND_BLAST_CRIT_CHANCE * MIND_BLAST_DAMAGE * 1.5

  const MIND_BLAST_DPS =
    (MIND_BLASTS_PER_ROTATION * (MIND_BLAST_HIT_COMPONENT + MIND_BLAST_CRIT_COMPONENT)) /
    ROTATION_DURATION_SECONDS

  const VAMPIRIC_TOUCH_DAMAGE =
    (abilities.vampirictouch.damage + abilities.vampirictouch.coefficient * stats.spelldamage) *
    DAMAGE_MULTIPLIER

  const VAMPIRIC_TOUCH_DPS =
    (VAMPIRIC_TOUCHES_PER_ROTATION * VAMPIRIC_TOUCH_DAMAGE) / ROTATION_DURATION_SECONDS

  const SHADOW_WORD_DEATH_DAMAGE =
    (abilities.shadowworddeath.damage + abilities.shadowworddeath.coefficient * stats.spelldamage) *
    DAMAGE_MULTIPLIER

  const SHADOW_WORD_DEATH_CRIT_CHANCE = CRIT_CHANCE + 0.15
  const SHADOW_WORD_DEATH_HIT_COMPONENT =
    HIT_CHANCE * (1 - SHADOW_WORD_DEATH_CRIT_CHANCE) * SHADOW_WORD_DEATH_DAMAGE
  const SHADOW_WORD_DEATH_CRIT_COMPONENT =
    HIT_CHANCE * SHADOW_WORD_DEATH_CRIT_CHANCE * SHADOW_WORD_DEATH_DAMAGE * 1.5

  const SHADOW_WORD_DEATH_DPS =
    (SHADOW_WORD_DEATHS_PER_ROTATION *
      (SHADOW_WORD_DEATH_HIT_COMPONENT + SHADOW_WORD_DEATH_CRIT_COMPONENT)) /
    ROTATION_DURATION_SECONDS

  const MIND_FLAY_DAMAGE =
    (abilities.mindflay.damage + abilities.mindflay.coefficient * stats.spelldamage) *
    (SET_BONUS_TIER4_4PIECE ? 1.05 : 1) *
    DAMAGE_MULTIPLIER

  const MIND_FLAY_DPS = (MIND_FLAYS_PER_ROTATION * MIND_FLAY_DAMAGE) / ROTATION_DURATION_SECONDS

  return [
    {
      source: abilities.shadowwordpain,
      dps: SHADOW_WORD_PAIN_DAMAGE_DPS
    },
    {
      source: abilities.mindblast,
      dps: MIND_BLAST_DPS
    },
    {
      source: abilities.vampirictouch,
      dps: VAMPIRIC_TOUCH_DPS
    },
    {
      source: abilities.shadowworddeath,
      dps: SHADOW_WORD_DEATH_DPS
    },
    {
      source: abilities.mindflay,
      dps: MIND_FLAY_DPS
    }
  ]
}
