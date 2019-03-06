import _ from 'lodash'
import abilities from '../../domain/abilities'

export default ({ vitals: stats, target }) => {
  const HIT_CHANCE = (100 - (16 - _.clamp(stats.spellhitChance, 0, 16) + 1)) / 100

  const NUM_STARFIRES_PER_ROTATION = 4
  const NUM_MOONFIRES_PER_ROTATION = 1

  const MOONFIRE_CRIT_CHANCE = (stats.spellcritChance + 10) / 100
  const STARFIRE_CRIT_CHANCE = (stats.spellcritChance + 4) / 100

  const AVERAGE_CRIT_CHANCE =
    (STARFIRE_CRIT_CHANCE * NUM_STARFIRES_PER_ROTATION + MOONFIRE_CRIT_CHANCE) /
    (NUM_STARFIRES_PER_ROTATION + NUM_MOONFIRES_PER_ROTATION)

  const HASTE_FROM_NATURES_GRACE = HIT_CHANCE * AVERAGE_CRIT_CHANCE * 0.5

  const STARFIRE_CAST_TIME =
    abilities.starfire.castTime / (1 + stats.spellhaste / 100 + HASTE_FROM_NATURES_GRACE)
  const MOONFIRE_CAST_TIME = abilities.moonfire.castTime / (1 + stats.spellhaste / 100)

  const ROTATION_DURATION_SECONDS =
    MOONFIRE_CAST_TIME + NUM_STARFIRES_PER_ROTATION * STARFIRE_CAST_TIME

  const DAMAGE_MULTIPLIER =
    1 *
    1.1 * // Talent: Moonfire
    target.multipliers.arcane

  const STARFIRE_DAMAGE =
    (abilities.starfire.damage + abilities.starfire.coefficient * stats.spelldamage) *
    DAMAGE_MULTIPLIER

  const STARFIRE_HIT_COMPONENT = HIT_CHANCE * (1 - STARFIRE_CRIT_CHANCE) * STARFIRE_DAMAGE
  const STARFIRE_CRIT_COMPONENT = HIT_CHANCE * STARFIRE_CRIT_CHANCE * STARFIRE_DAMAGE * 2

  const STARFIRE_DPS =
    (NUM_STARFIRES_PER_ROTATION * (STARFIRE_HIT_COMPONENT + STARFIRE_CRIT_COMPONENT)) /
    ROTATION_DURATION_SECONDS

  const MOONFIRE_DAMAGE =
    (abilities.moonfire.damage + abilities.moonfire.coefficient * stats.spelldamage) *
    DAMAGE_MULTIPLIER

  const MOONFIRE_HIT_COMPONENT = HIT_CHANCE * (1 - MOONFIRE_CRIT_CHANCE) * MOONFIRE_DAMAGE
  const MOONFIRE_CRIT_COMPONENT = HIT_CHANCE * MOONFIRE_CRIT_CHANCE * MOONFIRE_DAMAGE * 2

  const MOONFIRE_DPS =
    (MOONFIRE_HIT_COMPONENT + MOONFIRE_CRIT_COMPONENT) / ROTATION_DURATION_SECONDS

  const MOONFIRE_DOT_DAMAGE =
    (abilities.moonfire.dot.damage + abilities.moonfire.dot.coefficient * stats.spelldamage) *
    DAMAGE_MULTIPLIER

  const MOONFIRE_DOT_COMPONENT = HIT_CHANCE * MOONFIRE_DOT_DAMAGE

  const MOONFIRE_DOT_DPS = MOONFIRE_DOT_COMPONENT / ROTATION_DURATION_SECONDS

  return [
    {
      source: abilities.starfire,
      dps: STARFIRE_DPS
    },
    {
      source: abilities.moonfire,
      dps: MOONFIRE_DPS + MOONFIRE_DOT_DPS
    }
  ]
}
