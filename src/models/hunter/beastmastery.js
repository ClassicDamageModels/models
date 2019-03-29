import _ from 'lodash'
import abilities from '../../domain/abilities'
import { getRangedAttackTable, getArmorMultiplier } from '../../utils/combat'

export default ({
  vitals: stats,
  target,
  character: {
    data: { gear }
  }
}) => {
  const DELAY_LAG = 0.1
  const DELAY_HUMAN_FACTOR = 0.1
  const GCD = 1.5

  const WEAPON_MAINHAND = _.find(gear, { slot: 'ranged' }).item
  const ATTACK_TABLE = getRangedAttackTable(stats)

  // Chicken & egg problem here, value would be calculated later
  // FIXME: implement N-pass modeling
  const ASSUMED_HASTE = 1.4778690091230573
  const AUTO_ATTACKS_PER_SECOND = 1 / (WEAPON_MAINHAND.weapon_speed / 1000 / ASSUMED_HASTE)

  const IMPROVED_HAWK_UPTIME = 1 - Math.pow(1 - 0.1, AUTO_ATTACKS_PER_SECOND * 12)
  const IMPROVED_HAWK_HASTE = 1 + IMPROVED_HAWK_UPTIME * 0.15

  const QUIVER_HASTE = 1.15

  const SERPENTS_SWIFTNESS_HASTE = 1.2
  const BONUS_HASTE = SERPENTS_SWIFTNESS_HASTE * IMPROVED_HAWK_HASTE * QUIVER_HASTE
  const TOTAL_HASTE = (1 + stats.haste / 100) * BONUS_HASTE

  const MAX_TOTAL_HASTE = (1 + stats.haste / 100) * QUIVER_HASTE * SERPENTS_SWIFTNESS_HASTE * 1.15

  const PROJECTILE_DAMAGE = 32 * (WEAPON_MAINHAND.weapon_speed / 1000)
  const WEAPON_DAMAGE =
    (WEAPON_MAINHAND &&
      (WEAPON_MAINHAND.dmg_min + WEAPON_MAINHAND.dmg_max) / 2 + PROJECTILE_DAMAGE) ||
    0

  const ARMOR_MULTIPLIER = getArmorMultiplier(_.clamp(target.stats.armor - stats.armorpen, 0, 7700))

  const MH_DAMAGE =
    (WEAPON_MAINHAND &&
      (WEAPON_DAMAGE + (stats.rangedattackpower / 14) * (WEAPON_MAINHAND.weapon_speed / 1000)) *
      ARMOR_MULTIPLIER *
      1.02 * // Talent: Focused Fire
        target.multipliers.physical) ||
    0

  const MH_WHITE_COMPONENT =
    (ATTACK_TABLE.hit * MH_DAMAGE + ATTACK_TABLE.crit * MH_DAMAGE * 2.3) /
    (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE)

  const CLIPPED_MH =
    DELAY_LAG + DELAY_HUMAN_FACTOR + GCD - WEAPON_MAINHAND.weapon_speed / 1000 / MAX_TOTAL_HASTE

  const MH_CLIPPED_COMPONENT =
    (CLIPPED_MH > 0 &&
      ((ATTACK_TABLE.hit * MH_DAMAGE + ATTACK_TABLE.crit * MH_DAMAGE * 2.3) /
        (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE)) *
        (CLIPPED_MH / (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE))) ||
    0

  const WEAPON_DPS =
    (WEAPON_MAINHAND.dmg_min + WEAPON_MAINHAND.dmg_max) / 2 / (WEAPON_MAINHAND.weapon_speed / 1000)

  /* Actual Equation
  The tooltip is proven to be wrong and the following is the best player worked out formula so far with data taken from [1]
  Formula: DamagePercentageBonus*RangedWeaponSpecialization*(150 + WeaponDamage/WeaponSpeed*2.8 + 0.2*RAP + [Dazed: 175])
  https://wowwiki.fandom.com/wiki/Steady_Shot?oldid=680876
  */
  const STEADY_SHOT_DAMAGE =
    (150 + WEAPON_DPS * 2.8 + 0.2 * stats.rangedattackpower) *
    1.02 * // Talent: Focused Fire
    ARMOR_MULTIPLIER *
    target.multipliers.physical

  const STEADY_SHOT_HIT_COMPONENT = ATTACK_TABLE.hit * STEADY_SHOT_DAMAGE
  const STEADY_SHOT_CRIT_COMPONENT = ATTACK_TABLE.crit * STEADY_SHOT_DAMAGE * 2.3

  const STEADY_SHOT_DPS =
    (STEADY_SHOT_HIT_COMPONENT + STEADY_SHOT_CRIT_COMPONENT) /
    Math.max(
      WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE,
      GCD + DELAY_LAG + DELAY_HUMAN_FACTOR
    )

  return [
    {
      source: { icon: 'ability_whirlwind', name: 'Auto Shot' },
      dps: MH_WHITE_COMPONENT - MH_CLIPPED_COMPONENT
    },
    {
      source: abilities.steadyshot,
      dps: STEADY_SHOT_DPS
    }
  ]
}
