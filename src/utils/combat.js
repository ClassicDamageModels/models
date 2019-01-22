import _ from 'lodash'
import { addNumbers } from './misc'
import Decimal from 'decimal.js'

const clamp = (value, min, max) => Decimal.max(Decimal.min(value, max), min).toNumber()

export const getRangedAttackTable = stats => {
  const MISS_CHANCE = clamp(Decimal(9 - stats.hitChance), 0, 100)
  const HIT_CHANCE = Decimal(100 - MISS_CHANCE)
  const CRIT_CHANCE = clamp(Decimal(stats.critChance), 0, HIT_CHANCE)
  const ORDINARY_HIT_CHANCE = clamp(
    Decimal(100)
      .minus(MISS_CHANCE)
      .minus(CRIT_CHANCE),
    0,
    100
  )

  return {
    miss: MISS_CHANCE / 100,
    crit: CRIT_CHANCE / 100,
    hit: ORDINARY_HIT_CHANCE / 100
  }
}

export const getAttackTable = (type, rawStats, weapons, bonus = {}) => {
  const DUALWIELDING = !!(weapons[0] && weapons[1])

  const stats = _.mergeWith({}, rawStats, bonus, addNumbers)

  // Base miss chance against level 73 is 9% (+19% if dualwielding)
  const MISS_CHANCE_WHITE = _.clamp(9 + (DUALWIELDING ? 19 : 0) - stats.hitChance, 0, 100)
  const MISS_CHANCE_YELLOW = _.clamp(9 - stats.hitChance, 0, 100)
  const DODGE_CHANCE = _.clamp(6.5 - Math.floor(stats.expertise) * 0.25, 0, 100)
  const PARRY_CHANCE = 0
  const GLANCE_CHANCE = 25
  const HIT_CHANCE_WHITE = 100 - MISS_CHANCE_WHITE - DODGE_CHANCE - PARRY_CHANCE - GLANCE_CHANCE
  const HIT_CHANCE_YELLOW = 100 - MISS_CHANCE_YELLOW - DODGE_CHANCE - PARRY_CHANCE

  const CRIT_CHANCE_WHITE = _.clamp(stats.critChance, 0, HIT_CHANCE_WHITE)
  const CRIT_CHANCE_YELLOW = _.clamp(stats.critChance, 0, HIT_CHANCE_YELLOW)
  const ORDINARY_HIT_CHANCE_WHITE = _.clamp(
    100 - CRIT_CHANCE_WHITE - MISS_CHANCE_WHITE - GLANCE_CHANCE - DODGE_CHANCE - PARRY_CHANCE,
    0,
    100
  )

  const ORDINARY_HIT_CHANCE_YELLOW = _.clamp(
    100 - CRIT_CHANCE_YELLOW - MISS_CHANCE_YELLOW - DODGE_CHANCE - PARRY_CHANCE,
    0,
    100
  )

  if (type === 'white') {
    return {
      miss: MISS_CHANCE_WHITE / 100,
      dodge: DODGE_CHANCE / 100,
      parry: PARRY_CHANCE / 100,
      glance: GLANCE_CHANCE / 100,
      crit: CRIT_CHANCE_WHITE / 100,
      hit: ORDINARY_HIT_CHANCE_WHITE / 100
    }
  }

  return {
    miss: MISS_CHANCE_YELLOW / 100,
    dodge: DODGE_CHANCE / 100,
    parry: PARRY_CHANCE / 100,
    crit: CRIT_CHANCE_YELLOW / 100,
    hit: ORDINARY_HIT_CHANCE_YELLOW / 100
  }
}

export const getAPCoefficient = weapon => {
  switch (weapon.subclass) {
    case 'dagger':
      return 1.7
    case 'mace_2h':
    case 'sword_2h':
    case 'poleaxe_2h':
      return 3.3
    case 'mace_1h':
    case 'sword_1h':
    case 'fist_weapon':
      return 2.4
    default:
      return 2.4
  }
}

// DR% = Armor / (Armor + 400 + 85 * (AttackerLevel + 4.5 * (AttackerLevel - 59)))
export const getArmorMultiplier = armor => 1 - armor / (armor + 400 + 85 * (70 + 4.5 * (70 - 59)))
