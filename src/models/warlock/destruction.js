import _ from 'lodash'
import abilities from '../../domain/abilities'

export default ({ vitals: stats, target }) => {
  const HIT_CHANCE = (100 - (16 - _.clamp(stats.spellhitChance, 0, 16) + 1)) / 100
  const CRIT_CHANCE = stats.spellcritChance / 100

  const DAMAGE_MULTIPLIER =
    1 *
    1.15 * // Talent: Demonic Sacrifice
    target.multipliers.shadow // Includes Misery

  const SHADOW_BOLT_CAST_TIME = abilities.shadowbolt.castTime / (1 + stats.spellhaste / 100)
  const SHADOW_BOLT_DAMAGE =
    (abilities.shadowbolt.damage + abilities.shadowbolt.coefficient * stats.spelldamage) *
    DAMAGE_MULTIPLIER
  const SHADOW_BOLT_DAMAGE_HIT_COMPONENT = HIT_CHANCE * (1 - CRIT_CHANCE) * SHADOW_BOLT_DAMAGE
  const SHADOW_BOLT_DAMAGE_CRIT_COMPONENT = HIT_CHANCE * CRIT_CHANCE * SHADOW_BOLT_DAMAGE * 2

  const SHADOW_BOLT_DPS =
    (SHADOW_BOLT_DAMAGE_HIT_COMPONENT + SHADOW_BOLT_DAMAGE_CRIT_COMPONENT) / SHADOW_BOLT_CAST_TIME

  return [
    {
      source: abilities.shadowbolt,
      dps: SHADOW_BOLT_DPS
    }
  ]
}
