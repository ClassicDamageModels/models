import _ from 'lodash'
import abilities from '../abilities'

export default ({ vitals: stats, target, spec }) => {
  const LIGHTNING_OVERLOAD = _.find(spec.talents, { name: 'Lightning Overload' })

  const LIGHTNING_BOLTS_PER_ROTATION = 4
  const LIGHTNING_BOLT_CAST_TIME = abilities.lightningbolt.castTime / (1 + stats.spellhaste / 100)
  const CHAIN_LIGHTNING_CAST_TIME = abilities.chainlightning.castTime / (1 + stats.spellhaste / 100)

  const ROTATION_DURATION_SECONDS =
    LIGHTNING_BOLTS_PER_ROTATION * LIGHTNING_BOLT_CAST_TIME + CHAIN_LIGHTNING_CAST_TIME

  const HIT_CHANCE = (100 - (16 - _.clamp(stats.spellhitChance, 0, 16) + 1)) / 100
  const CRIT_CHANCE = stats.spellcritChance / 100

  const DAMAGE_MULTIPLIER =
    1 *
    1.05 * // Talent: Concussion
    target.multipliers.nature // Misery

  const LIGHTNING_BOLT_DAMAGE =
    (abilities.lightningbolt.damage + abilities.lightningbolt.coefficient * stats.spelldamage) *
    DAMAGE_MULTIPLIER
  const LIGHTNING_BOLT_HIT_COMPONENT = HIT_CHANCE * (1 - CRIT_CHANCE) * LIGHTNING_BOLT_DAMAGE
  const LIGHTNING_BOLT_CRIT_COMPONENT = HIT_CHANCE * CRIT_CHANCE * LIGHTNING_BOLT_DAMAGE * 2

  const LIGHTNING_BOLT_DPS =
    (LIGHTNING_BOLTS_PER_ROTATION *
      (LIGHTNING_BOLT_HIT_COMPONENT + LIGHTNING_BOLT_CRIT_COMPONENT)) /
    ROTATION_DURATION_SECONDS

  // Overload cannot proc from itself on Netherwing
  // https://github.com/Atlantiss/NetherwingBugtracker/issues/2007#issuecomment-448341518
  const LB_OVERLOAD_PROC_DPS =
    (LIGHTNING_BOLTS_PER_ROTATION *
      0.2 *
      (LIGHTNING_BOLT_HIT_COMPONENT + LIGHTNING_BOLT_CRIT_COMPONENT)) /
    2 /
    ROTATION_DURATION_SECONDS

  const CHAIN_LIGHTNING_DAMAGE =
    (abilities.chainlightning.damage + abilities.chainlightning.coefficient * stats.spelldamage) *
    DAMAGE_MULTIPLIER
  const CHAIN_LIGHTNING_HIT_COMPONENT = HIT_CHANCE * (1 - CRIT_CHANCE) * CHAIN_LIGHTNING_DAMAGE
  const CHAIN_LIGHTNING_CRIT_COMPONENT = HIT_CHANCE * CRIT_CHANCE * CHAIN_LIGHTNING_DAMAGE * 2

  const CHAIN_LIGHTNING_DPS =
    (CHAIN_LIGHTNING_HIT_COMPONENT + CHAIN_LIGHTNING_CRIT_COMPONENT) / ROTATION_DURATION_SECONDS

  const CL_OVERLOAD_PROC_DPS =
    (0.2 * (CHAIN_LIGHTNING_HIT_COMPONENT + CHAIN_LIGHTNING_CRIT_COMPONENT)) /
    2 /
    ROTATION_DURATION_SECONDS

  return [
    {
      source: abilities.lightningbolt,
      dps: LIGHTNING_BOLT_DPS + LB_OVERLOAD_PROC_DPS,
      subSegments: [
        {
          source: { ...LIGHTNING_OVERLOAD },
          dps: LB_OVERLOAD_PROC_DPS
        }
      ]
    },
    {
      source: abilities.chainlightning,
      dps: CHAIN_LIGHTNING_DPS + CL_OVERLOAD_PROC_DPS,
      subSegments: [
        {
          source: { ...LIGHTNING_OVERLOAD },
          dps: CL_OVERLOAD_PROC_DPS
        }
      ]
    }
  ]
}
