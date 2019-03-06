import _ from 'lodash'
import abilities from '../../domain/abilities'
import { getAttackTable, getAPCoefficient, getArmorMultiplier } from '../../utils/combat'

export default ({
  vitals: stats,
  target,
  buffs,
  character: {
    data: { gear }
  },
  spells
}) => {
  const WEAPON_MAINHAND = _.get(_.find(gear, { slot: 'weapon1' }), 'item')
  const WEAPON_OFFHAND = _.get(_.find(gear, { slot: 'weapon2' }), 'item')
  const DAGGERS =
    (WEAPON_MAINHAND &&
      WEAPON_OFFHAND &&
      (WEAPON_MAINHAND.subclass === 'dagger' && WEAPON_OFFHAND.subclass === 'dagger')) ||
    false

  const FIGHT_DURATION_SECONDS = 5 * 60

  const MANGLE = buffs.raid
  const WINDFURY_TOTEM = buffs.raid // FIXME: Pass all buffs explicitly

  // T4 2-piece: Increases the duration of your Slice and Dice ability by 3 sec.
  const SET_BONUS_TIER4_2PIECE = _.find(spells, { id: 37167 })
  // T4 4-piece: Your finishing moves have a 15% chance to grant you a combo point.
  const SET_BONUS_TIER4_4PIECE = _.find(spells, { id: 37168 })

  const ATTACK_TABLE_WHITE = getAttackTable('white', stats, [WEAPON_MAINHAND, WEAPON_OFFHAND])
  const ATTACK_TABLE_YELLOW = getAttackTable('yellow', stats, [WEAPON_MAINHAND, WEAPON_OFFHAND])

  const AP_COEFFICIENT = getAPCoefficient(WEAPON_MAINHAND)

  const BONUS_HASTE =
    // Slice and Dice
    1.3 *
    // Blade Flurry (15/120s uptime * 20% = 2.5% average)
    1.025

  const TOTAL_HASTE = (1 + stats.haste / 100) * BONUS_HASTE

  const ARMOR_MULTIPLIER = getArmorMultiplier(_.clamp(target.stats.armor - stats.armorpen, 0, 7700))

  const SND_DURATIONS = {
    1: Math.floor((9 + (SET_BONUS_TIER4_2PIECE ? 3 : 0)) * 1.45),
    2: Math.floor((12 + (SET_BONUS_TIER4_2PIECE ? 3 : 0)) * 1.45),
    3: Math.floor((15 + (SET_BONUS_TIER4_2PIECE ? 3 : 0)) * 1.45),
    4: Math.floor((18 + (SET_BONUS_TIER4_2PIECE ? 3 : 0)) * 1.45),
    5: Math.floor((21 + (SET_BONUS_TIER4_2PIECE ? 3 : 0)) * 1.45)
  }

  /*
    Our rotation is 3s/5r, enabling 100% uptime for both snd and expose weakness

    --
    Mutilate 2-3cp
    Snd 0-1cp
    Mutilate 1-4 cp
    Mutilate 4-5 cp
    Rupture 0-1
    --
    Mutilate 2-4
    Snd 0-1

  */
  const SND_CP = 3
  const RUPTURE_CP = 5
  const MUTILATE_COST = 60
  const SND_COST = 25
  const RUPTURE_COST = 25
  const RUTHLESSNESS_CHANCE = 0.6
  const T4_4PC_CHANCE = SET_BONUS_TIER4_4PIECE ? 0.15 : 0
  const DISCOUNT_PER_CP = 5

  const MAX_ENERGY = 110 / FIGHT_DURATION_SECONDS
  const ENERGY_REGEN = 10

  const ENERGY_PER_SECOND = MAX_ENERGY + ENERGY_REGEN

  const YELLOW_HIT_CHANCE =
    1 - ATTACK_TABLE_YELLOW.miss - ATTACK_TABLE_YELLOW.dodge - ATTACK_TABLE_YELLOW.parry

  const MUTILATE_CRIT_CHANCE = ATTACK_TABLE_YELLOW.crit + 0.15

  const CP_PER_MUTILATE = YELLOW_HIT_CHANCE * 2 + YELLOW_HIT_CHANCE * MUTILATE_CRIT_CHANCE

  const MUTILATES_TO_REACH_SND_CPS =
    (SND_CP - RUTHLESSNESS_CHANCE - T4_4PC_CHANCE) / CP_PER_MUTILATE
  const MUTILATES_TO_REACH_RUPTURE_CPS =
    (RUPTURE_CP - RUTHLESSNESS_CHANCE - T4_4PC_CHANCE) / CP_PER_MUTILATE

  const ROTATION_ENERGY_CONSUMPTION =
    MUTILATES_TO_REACH_SND_CPS * MUTILATE_COST +
    SND_COST -
    SND_CP * DISCOUNT_PER_CP +
    MUTILATES_TO_REACH_RUPTURE_CPS * MUTILATE_COST +
    RUPTURE_COST -
    RUPTURE_CP * DISCOUNT_PER_CP

  const ROTATION_DURATION_SECONDS = 20

  const EXTRA_ENERGY = ENERGY_PER_SECOND * ROTATION_DURATION_SECONDS - ROTATION_ENERGY_CONSUMPTION

  const MH_WEAPON_DAMAGE =
    (WEAPON_MAINHAND && (WEAPON_MAINHAND.dmg_min + WEAPON_MAINHAND.dmg_max) / 2) || 0
  const OH_WEAPON_DAMAGE =
    (WEAPON_OFFHAND && (WEAPON_OFFHAND.dmg_min + WEAPON_OFFHAND.dmg_max) / 2) || 0

  const MH_SWINGS_PER_ROTATION =
    ROTATION_DURATION_SECONDS / (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE)

  const MH_ATTACKS_PER_ROTATION =
    MH_SWINGS_PER_ROTATION + MUTILATES_TO_REACH_SND_CPS + MUTILATES_TO_REACH_RUPTURE_CPS

  const MH_EXTRA_ATTACKS_WINDFURY_TOTEM = WINDFURY_TOTEM ? 0.2 * MH_SWINGS_PER_ROTATION : 0

  const MUTILATE_DAMAGE =
    (!!(DAGGERS && WEAPON_MAINHAND && WEAPON_OFFHAND) &&
      (101 +
        MH_WEAPON_DAMAGE +
        (AP_COEFFICIENT * stats.attackpower) / 14 +
        (101 + OH_WEAPON_DAMAGE + (AP_COEFFICIENT * stats.attackpower) / 14)) *
        // Poisoned Target
        1.5 *
        // Talent: Murder
        1.02 *
        // Talent: Find Weakness
        1.1 *
        ARMOR_MULTIPLIER *
        target.multipliers.physical) ||
    0

  // Yellow hits that dont miss and dont crit
  const MUTILATE_HIT_COMPONENT = YELLOW_HIT_CHANCE * (1 - MUTILATE_CRIT_CHANCE) * MUTILATE_DAMAGE

  // Yellow hits that dont miss and do crit
  const MUTILATE_CRIT_COMPONENT =
    YELLOW_HIT_CHANCE *
    MUTILATE_CRIT_CHANCE *
    MUTILATE_DAMAGE *
    // Melee crit
    2 *
    // Talent: Lethality
    1.3

  const MUTILATE_DPS =
    ((MUTILATE_HIT_COMPONENT + MUTILATE_CRIT_COMPONENT) *
      (MUTILATES_TO_REACH_RUPTURE_CPS +
        MUTILATES_TO_REACH_SND_CPS +
        EXTRA_ENERGY / MUTILATE_COST)) /
    ROTATION_DURATION_SECONDS

  // Rupture at 5 combo points deals 8 ticks at 125 + 0.03 * AP
  const RUPTURE_DAMAGE =
    (125 + 0.03 * stats.attackpower) *
    8 * // 8 ticks
    1.1 * // Talent: Find Weakness
    (MANGLE ? 1.3 : 1) *
    target.multipliers.physical

  // Each strike has a 30% chance of poisoning the enemy for 180 Nature damage over 12 sec. Stacks up to 5 times on a single target.
  // FIXME: Assumed 100% uptime
  const DEADLY_POISON_DAMAGE = ((5 * 180) / 12) * 1.2 * target.multipliers.nature

  // Use Instant Poison in MH unless we have Windfury Totem
  const INSTANT_POISON_DAMAGE = ((146 + 195) / 2) * 1.2 * target.multipliers.nature
  const SPELL_CRIT_CHANCE = 0.05 // FIXME: ... apply bonuses
  const SPELL_HIT_CHANCE = 0.83 // FIXME: ... apply bonuses
  const INSTANT_POISON_HIT_COMPONENT =
    SPELL_HIT_CHANCE * (1 - SPELL_CRIT_CHANCE) * INSTANT_POISON_DAMAGE
  const INSTANT_POISON_CRIT_COMPONENT =
    SPELL_HIT_CHANCE * SPELL_CRIT_CHANCE * INSTANT_POISON_DAMAGE * 1.5
  const INSTANT_POISON_DAMAGE_COMPONENT = WINDFURY_TOTEM
    ? 0
    : (MH_ATTACKS_PER_ROTATION * 0.2 * SPELL_HIT_CHANCE * INSTANT_POISON_DAMAGE) /
      ROTATION_DURATION_SECONDS

  const MH_DAMAGE =
    (WEAPON_MAINHAND &&
      (MH_WEAPON_DAMAGE + (stats.attackpower / 14) * (WEAPON_MAINHAND.weapon_speed / 1000)) *
        ARMOR_MULTIPLIER *
        target.multipliers.physical) ||
    0

  const OH_DAMAGE =
    (WEAPON_OFFHAND &&
      (OH_WEAPON_DAMAGE + (stats.attackpower / 14) * (WEAPON_OFFHAND.weapon_speed / 1000)) *
        ARMOR_MULTIPLIER *
        target.multipliers.physical) ||
    0

  const MH_WHITE_COMPONENT_EXTRA_ATTACKS_WINDFURY_TOTEM =
    (MH_EXTRA_ATTACKS_WINDFURY_TOTEM *
      (ATTACK_TABLE_WHITE.hit * MH_DAMAGE +
        ATTACK_TABLE_WHITE.glance * MH_DAMAGE * 0.65 +
        ATTACK_TABLE_WHITE.crit * MH_DAMAGE * 2)) /
    ROTATION_DURATION_SECONDS

  const MH_WHITE_COMPONENT =
    (ATTACK_TABLE_WHITE.hit * MH_DAMAGE +
      ATTACK_TABLE_WHITE.glance * MH_DAMAGE * 0.65 +
      ATTACK_TABLE_WHITE.crit * MH_DAMAGE * 2) /
    (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE)

  const OH_WHITE_COMPONENT =
    ((ATTACK_TABLE_WHITE.hit * OH_DAMAGE +
      ATTACK_TABLE_WHITE.glance * OH_DAMAGE * 0.65 +
      ATTACK_TABLE_WHITE.crit * OH_DAMAGE * 2) *
      0.75) /
    (WEAPON_OFFHAND.weapon_speed / 1000 / TOTAL_HASTE)

  const WHITE_COMPONENT =
    MH_WHITE_COMPONENT + MH_WHITE_COMPONENT_EXTRA_ATTACKS_WINDFURY_TOTEM + OH_WHITE_COMPONENT

  const segments = [
    {
      source: { icon: 'inv_sword_04', name: 'Auto Attacks' },
      dps: WHITE_COMPONENT,
      subSegments: [
        {
          source: { ...WEAPON_MAINHAND, name: 'Main Hand' },
          dps: MH_WHITE_COMPONENT + MH_WHITE_COMPONENT_EXTRA_ATTACKS_WINDFURY_TOTEM,
          subSegments: [
            {
              source: { icon: 'spell_nature_windfury', name: 'Windfury Totem' },
              dps: MH_WHITE_COMPONENT_EXTRA_ATTACKS_WINDFURY_TOTEM
            }
          ]
        },
        {
          source: { ...WEAPON_OFFHAND, name: 'Off Hand' },
          dps: OH_WHITE_COMPONENT
        }
      ]
    },
    {
      source: abilities.rupture,
      dps: RUPTURE_DAMAGE / ROTATION_DURATION_SECONDS
    },
    {
      source: abilities.deadlypoison,
      dps: DEADLY_POISON_DAMAGE
    },
    {
      source: abilities.instantpoison,
      dps: INSTANT_POISON_DAMAGE_COMPONENT
    },
    {
      source: abilities.mutilate,
      dps: MUTILATE_DPS
    }
  ]

  return segments

  return []
}
