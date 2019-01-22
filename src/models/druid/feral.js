import _ from 'lodash'
import abilities from '../../domain/abilities'
import { getAttackTable, getArmorMultiplier } from '../../utils/combat'

export default ({
  vitals: stats,
  target,
  character: {
    data: { gear }
  }
}) => {
  const WOLFSHEAD_HELM = _.get(_.find(gear, { slot: 'head' }), 'item.name') === 'Wolfshead Helm'
  const WEAPON_MAINHAND = {
    weapon_speed: 1000,
    name: 'Auto Attacks',
    icon: 'ability_druid_catformattack'
  }

  const ATTACK_TABLE_WHITE = getAttackTable('white', stats, [WEAPON_MAINHAND])
  const ATTACK_TABLE_YELLOW = getAttackTable('yellow', stats, [WEAPON_MAINHAND])

  const TOTAL_HASTE = 1 + stats.haste / 100

  const ARMOR_MULTIPLIER = getArmorMultiplier(_.clamp(target.stats.armor - stats.armorpen, 0, 7700))

  // Mangle -> Shred to 4-5 combo points -> Wait for 70+ energy (preferably 80+), Rip->Mangle, start again.

  const MANGLE_ENERGY_COST = 45 - 5
  const SHRED_ENERGY_COST = 60 - 18
  const RIP_ENERGY_COST = 30

  const ROTATION_ENERGY_COST = MANGLE_ENERGY_COST + 3 * SHRED_ENERGY_COST + RIP_ENERGY_COST

  const YELLOW_HIT_CHANCE =
    1 - ATTACK_TABLE_YELLOW.miss - ATTACK_TABLE_YELLOW.dodge - ATTACK_TABLE_YELLOW.parry

  const CP_PER_YELLOW = YELLOW_HIT_CHANCE + YELLOW_HIT_CHANCE * ATTACK_TABLE_YELLOW.crit

  const AVERAGE_YELLOW_COST = (3 * SHRED_ENERGY_COST + MANGLE_ENERGY_COST) / 4
  const YELLOWS_PER_RIP = 4 / CP_PER_YELLOW

  const ENERGY_REGEN = 10
  // Twice per minute - dunno what's sustainable
  const ENERGY_POWER_SHIFT = (40 + (WOLFSHEAD_HELM ? 20 : 0)) / 30

  // Omen of Clarity, 2 ppm
  const ENERGY_FROM_OOC = (2 / 60) * AVERAGE_YELLOW_COST
  const ENERGY_BUDGET = ENERGY_REGEN + ENERGY_FROM_OOC + ENERGY_POWER_SHIFT
  const SECONDS_TO_RIP = (AVERAGE_YELLOW_COST * YELLOWS_PER_RIP) / ENERGY_BUDGET

  // Rotation cannot be shorter than 10 seconds due to Rip duration
  const ROTATION_DURATION_SECONDS = Math.max(SECONDS_TO_RIP + 1, 10)

  const MH_SWINGS_PER_ROTATION =
    ROTATION_DURATION_SECONDS / (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE)

  const CAT_EXTRA_DAMAGE = 55
  const WEAPON_DAMAGE = CAT_EXTRA_DAMAGE + stats.attackpower / 14
  const MH_DAMAGE = WEAPON_DAMAGE * ARMOR_MULTIPLIER * target.multipliers.physical

  const MH_WHITE_COMPONENT =
    (ATTACK_TABLE_WHITE.hit * MH_DAMAGE +
      ATTACK_TABLE_WHITE.glance * MH_DAMAGE * 0.65 +
      ATTACK_TABLE_WHITE.crit * MH_DAMAGE * 2.1) /
    (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE)

  const MH_WHITE_DPS = (MH_WHITE_COMPONENT * MH_SWINGS_PER_ROTATION) / ROTATION_DURATION_SECONDS

  // console.log('MH_DAMAGE', MH_DAMAGE)
  // console.log('MH_WHITE_DPS', MH_WHITE_DPS)
  // console.log('ROTATION_DURATION_SECONDS', ROTATION_DURATION_SECONDS)
  // console.log('ENERGY_FROM_OOC', ENERGY_FROM_OOC)
  // console.log('AVERAGE_YELLOW_COST', AVERAGE_YELLOW_COST)
  // console.log('YELLOWS_PER_RIP', YELLOWS_PER_RIP)
  // console.log('CP_PER_YELLOW', CP_PER_YELLOW)
  // console.log('SECONDS_TO_RIP', SECONDS_TO_RIP)
  // console.log('ROTATION_ENERGY_COST', ROTATION_ENERGY_COST)

  const SHRED_DAMAGE =
    (405 + 2.25 * WEAPON_DAMAGE) * 1.3 * ARMOR_MULTIPLIER * target.multipliers.physical
  const SHRED_HIT_COMPONENT = YELLOW_HIT_CHANCE * (1 - ATTACK_TABLE_YELLOW.crit) * SHRED_DAMAGE
  const SHRED_CRIT_COMPONENT = YELLOW_HIT_CHANCE * ATTACK_TABLE_YELLOW.crit * SHRED_DAMAGE * 2.1

  // console.log('SHRED_DAMAGE', SHRED_DAMAGE)

  const SHRED_DPS =
    ((YELLOWS_PER_RIP - 1) * (SHRED_HIT_COMPONENT + SHRED_CRIT_COMPONENT)) /
    ROTATION_DURATION_SECONDS

  const MANGLE_DAMAGE =
    (317 + 1.6 * WEAPON_DAMAGE) *
    1.2 * // Talent: Savage Fury
    ARMOR_MULTIPLIER *
    target.multipliers.physical

  const MANGLE_HIT_COMPONENT = YELLOW_HIT_CHANCE * (1 - ATTACK_TABLE_YELLOW.crit) * MANGLE_DAMAGE
  const MANGLE_CRIT_COMPONENT = YELLOW_HIT_CHANCE * ATTACK_TABLE_YELLOW.crit * MANGLE_DAMAGE * 2.1
  const MANGLE_DPS = (MANGLE_HIT_COMPONENT + MANGLE_CRIT_COMPONENT) / ROTATION_DURATION_SECONDS

  const RIP_DAMAGE = (774 + 0.24 * stats.attackpower) * 1.3
  const RIP_DPS = RIP_DAMAGE / ROTATION_DURATION_SECONDS

  return [
    {
      source: WEAPON_MAINHAND,
      dps: MH_WHITE_DPS
    },
    {
      source: abilities.shred,
      dps: SHRED_DPS
    },
    {
      source: abilities.mangle,
      dps: MANGLE_DPS
    },
    {
      source: abilities.rip,
      dps: RIP_DPS
    }
  ]
}
