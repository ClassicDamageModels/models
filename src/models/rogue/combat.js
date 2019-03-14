import _ from 'lodash'
import abilities from '../../domain/abilities'
import { getAttackTable, getAPCoefficient, getArmorMultiplier } from '../../utils/combat'

export default ({
  spec,
  vitals: stats,
  target,
  buffs,
  character: {
    data: { gear }
  },
  spells
}) => {
  const weapons = {
    mh: _.find(gear, { slot: 'weapon1' }),
    oh: _.find(gear, { slot: 'weapon2' }),
    ranged: _.find(gear, { slot: 'ranged' })
  }

  const WEAPON_MAINHAND = _.get(weapons, 'mh.item')
  const WEAPON_OFFHAND = _.get(weapons, 'oh.item')

  const MH_WEAPON_DAMAGE =
    (WEAPON_MAINHAND && (WEAPON_MAINHAND.dmg_min + WEAPON_MAINHAND.dmg_max) / 2) || 0
  const OH_WEAPON_DAMAGE =
    (WEAPON_OFFHAND && (WEAPON_OFFHAND.dmg_min + WEAPON_OFFHAND.dmg_max) / 2) || 0

  const FIGHT_DURATION_SECONDS = 5 * 60

  // T4 2-piece: Increases the duration of your Slice and Dice ability by 3 sec.
  const SET_BONUS_TIER4_2PIECE = _.find(spells, { id: 37167 })
  // T4 4-piece: Your finishing moves have a 15% chance to grant you a combo point.
  const SET_BONUS_TIER4_4PIECE = _.find(spells, { id: 37168 })

  const WINDFURY_TOTEM = buffs.raid // FIXME: Pass all buffs explicitly

  const SWORD_SPECIALIZATION = _.find(spec.talents, { name: 'Sword Specialization' })
  const SWORD_SPECIALIZATION_ACTIVE =
    SWORD_SPECIALIZATION && WEAPON_MAINHAND.subclass === 'sword_1h'

  const [ATTACK_TABLE_WHITE_MH, ATTACK_TABLE_WHITE_OH] = getAttackTable('white', stats, [
    WEAPON_MAINHAND,
    WEAPON_OFFHAND
  ])
  const [ATTACK_TABLE_YELLOW_MH] = getAttackTable('yellow', stats, [
    WEAPON_MAINHAND,
    WEAPON_OFFHAND
  ])

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

  /* We are assuming 4s/5r rotation (100% snd uptime) */
  const SND_CP = SET_BONUS_TIER4_2PIECE ? 2 : 4
  const ROTATION_DURATION_SECONDS = SND_DURATIONS[SND_CP]
  const RUPTURE_CP = 5
  const SINISTER_COST = 45 - 5
  const SND_COST = 25
  const RUPTURE_COST = 25
  const RUTHLESSNESS_CHANCE = 0.6
  const T4_4PC_CHANCE = SET_BONUS_TIER4_4PIECE ? 0.15 : 0
  const DISCOUNT_PER_CP = 5

  const MH_SWINGS_PER_ROTATION =
    ROTATION_DURATION_SECONDS / (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE)

  const MH_ATTACKS_PER_ROTATION = MH_SWINGS_PER_ROTATION + 4 + RUPTURE_CP

  const MH_EXTRA_ATTACKS_SWORD_SPECIALIZATION = SWORD_SPECIALIZATION_ACTIVE
    ? 0.05 * MH_ATTACKS_PER_ROTATION * (WINDFURY_TOTEM ? 1.2 : 1)
    : 0

  const MH_EXTRA_ATTACKS_WINDFURY_TOTEM = WINDFURY_TOTEM
    ? 0.2 * MH_SWINGS_PER_ROTATION * (SWORD_SPECIALIZATION_ACTIVE ? 1.05 : 1)
    : 0

  const OH_EXTRA_ATTACKS_SWORD_SPECIALIZATION = SWORD_SPECIALIZATION_ACTIVE
    ? 0.05 * (ROTATION_DURATION_SECONDS / (WEAPON_OFFHAND.weapon_speed / 1000 / TOTAL_HASTE))
    : 0

  const MAX_ENERGY = 100 / FIGHT_DURATION_SECONDS
  const ENERGY_REGEN = 10
  const ENERGY_FROM_POTENCY =
    (WEAPON_OFFHAND &&
      ((ATTACK_TABLE_WHITE_OH.hit + ATTACK_TABLE_WHITE_OH.glance + ATTACK_TABLE_WHITE_OH.crit) *
        0.2 *
        15) /
        (WEAPON_OFFHAND.weapon_speed / 1000 / TOTAL_HASTE)) ||
    0

  const ENERGY_FROM_AR = 150 / FIGHT_DURATION_SECONDS
  const ENERGY_BUDGET = MAX_ENERGY + ENERGY_REGEN + ENERGY_FROM_POTENCY + ENERGY_FROM_AR

  const ROTATION_ENERGY_CONSUMPTION =
    ((SND_CP - RUTHLESSNESS_CHANCE - T4_4PC_CHANCE) * SINISTER_COST +
      SND_COST -
      SND_CP * DISCOUNT_PER_CP +
      (RUPTURE_CP - RUTHLESSNESS_CHANCE - T4_4PC_CHANCE) * SINISTER_COST +
      RUPTURE_COST -
      RUPTURE_CP * DISCOUNT_PER_CP) /
    SND_DURATIONS[SND_CP]

  const EXTRA_ENERGY = (ENERGY_BUDGET - ROTATION_ENERGY_CONSUMPTION) * SND_DURATIONS[SND_CP]

  const SINISTER_DAMAGE =
    (!!WEAPON_MAINHAND &&
      98 +
        (MH_WEAPON_DAMAGE + (AP_COEFFICIENT * stats.attackpower) / 14) *
          // Talent: Murder
          1.02 *
          // Talent: Aggression
          1.06 *
          // Talent: Surprise Attacks
          1.1 *
          ARMOR_MULTIPLIER *
          target.multipliers.physical) ||
    0

  // Rupture at 5 combo points deals 8 ticks at 125 + 0.03 * AP
  const RUPTURE_DAMAGE =
    (125 + 0.03 * stats.attackpower) * 8 * ARMOR_MULTIPLIER * target.multipliers.physical

  const YELLOW_HIT_CHANCE =
    1 - ATTACK_TABLE_YELLOW_MH.miss - ATTACK_TABLE_YELLOW_MH.dodge - ATTACK_TABLE_YELLOW_MH.parry

  // Yellow hits that dont miss and dont crit
  const SINISTER_HIT_COMPONENT =
    YELLOW_HIT_CHANCE * (1 - ATTACK_TABLE_YELLOW_MH.crit) * SINISTER_DAMAGE

  // Yellow hits that dont miss and do crit
  const SINISTER_CRIT_COMPONENT =
    YELLOW_HIT_CHANCE *
    ATTACK_TABLE_YELLOW_MH.crit *
    SINISTER_DAMAGE *
    // Melee crit
    2 *
    // Talent: Lethality
    1.3

  // Each strike has a 30% chance of poisoning the enemy for 180 Nature damage over 12 sec. Stacks up to 5 times on a single target.
  // FIXME: Assumed 100% uptime
  const DEADLY_POISON_DAMAGE = ((5 * 180) / 12) * target.multipliers.nature

  // Use Instant Poison in MH unless we have Windfury Totem
  const INSTANT_POISON_DAMAGE = ((146 + 195) / 2) * target.multipliers.nature
  const SPELL_CRIT_CHANCE = 0.05 // FIXME: ... apply bonuses
  const SPELL_HIT_CHANCE = 0.83 // FIXME: ... apply bonuses
  const INSTANT_POISON_HIT_COMPONENT =
    SPELL_HIT_CHANCE * (1 - SPELL_CRIT_CHANCE) * INSTANT_POISON_DAMAGE
  const INSTANT_POISON_CRIT_COMPONENT =
    SPELL_HIT_CHANCE * SPELL_CRIT_CHANCE * INSTANT_POISON_DAMAGE * 1.5
  const INSTANT_POISON_DAMAGE_COMPONENT = WINDFURY_TOTEM
    ? 0
    : (MH_ATTACKS_PER_ROTATION *
        // 4/5 Improved Poisons
        0.28 *
        (INSTANT_POISON_HIT_COMPONENT + INSTANT_POISON_CRIT_COMPONENT)) /
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

  const MH_WHITE_COMPONENT_EXTRA_ATTACKS_SWORD_SPECIALIZATION =
    (MH_EXTRA_ATTACKS_SWORD_SPECIALIZATION *
      (ATTACK_TABLE_WHITE_MH.hit * MH_DAMAGE +
        ATTACK_TABLE_WHITE_MH.glance * MH_DAMAGE * 0.65 +
        ATTACK_TABLE_WHITE_MH.crit * MH_DAMAGE * 2)) /
    ROTATION_DURATION_SECONDS

  const MH_WHITE_COMPONENT_EXTRA_ATTACKS_WINDFURY_TOTEM =
    (MH_EXTRA_ATTACKS_WINDFURY_TOTEM *
      (ATTACK_TABLE_WHITE_MH.hit * MH_DAMAGE +
        ATTACK_TABLE_WHITE_MH.glance * MH_DAMAGE * 0.65 +
        ATTACK_TABLE_WHITE_MH.crit * MH_DAMAGE * 2)) /
    ROTATION_DURATION_SECONDS

  const OH_WHITE_COMPONENT_EXTRA_ATTACKS_SWORD_SPECIALIZATION =
    ((OH_EXTRA_ATTACKS_SWORD_SPECIALIZATION *
      (ATTACK_TABLE_WHITE_OH.hit * MH_DAMAGE +
        ATTACK_TABLE_WHITE_OH.glance * MH_DAMAGE * 0.65 +
        ATTACK_TABLE_WHITE_OH.crit * MH_DAMAGE * 2)) /
      ROTATION_DURATION_SECONDS) *
    0.75

  const MH_WHITE_COMPONENT =
    (ATTACK_TABLE_WHITE_MH.hit * MH_DAMAGE +
      ATTACK_TABLE_WHITE_MH.glance * MH_DAMAGE * 0.65 +
      ATTACK_TABLE_WHITE_MH.crit * MH_DAMAGE * 2) /
    (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE)

  const OH_WHITE_COMPONENT =
    ((ATTACK_TABLE_WHITE_OH.hit * OH_DAMAGE +
      ATTACK_TABLE_WHITE_OH.glance * OH_DAMAGE * 0.65 +
      ATTACK_TABLE_WHITE_OH.crit * OH_DAMAGE * 2) *
      0.75) /
    (WEAPON_OFFHAND.weapon_speed / 1000 / TOTAL_HASTE)

  const WHITE_COMPONENT =
    MH_WHITE_COMPONENT +
    MH_WHITE_COMPONENT_EXTRA_ATTACKS_SWORD_SPECIALIZATION +
    MH_WHITE_COMPONENT_EXTRA_ATTACKS_WINDFURY_TOTEM +
    OH_WHITE_COMPONENT +
    OH_WHITE_COMPONENT_EXTRA_ATTACKS_SWORD_SPECIALIZATION

  const segments = [
    {
      source: { icon: 'inv_sword_04', name: 'Auto Attacks' },
      dps: WHITE_COMPONENT,
      subSegments: [
        {
          source: { ...WEAPON_MAINHAND, name: 'Main Hand' },
          dps:
            MH_WHITE_COMPONENT +
            MH_WHITE_COMPONENT_EXTRA_ATTACKS_SWORD_SPECIALIZATION +
            MH_WHITE_COMPONENT_EXTRA_ATTACKS_WINDFURY_TOTEM,
          subSegments: [
            {
              source: { ...SWORD_SPECIALIZATION, name: 'Sword Specialization' },
              dps: MH_WHITE_COMPONENT_EXTRA_ATTACKS_SWORD_SPECIALIZATION
            },
            {
              source: { icon: 'spell_nature_windfury', name: 'Windfury Totem' },
              dps: MH_WHITE_COMPONENT_EXTRA_ATTACKS_WINDFURY_TOTEM
            }
          ]
        },
        {
          source: { ...WEAPON_OFFHAND, name: 'Off Hand' },
          dps: OH_WHITE_COMPONENT + OH_WHITE_COMPONENT_EXTRA_ATTACKS_SWORD_SPECIALIZATION,
          subSegments: [
            {
              source: { ...SWORD_SPECIALIZATION, name: 'Sword Specialization' },
              dps: OH_WHITE_COMPONENT_EXTRA_ATTACKS_SWORD_SPECIALIZATION
            }
          ]
        }
      ]
    },
    {
      source: abilities.sinister,
      dps:
        ((SINISTER_HIT_COMPONENT + SINISTER_CRIT_COMPONENT) *
          (SND_CP + RUPTURE_CP + EXTRA_ENERGY / SINISTER_COST)) /
        ROTATION_DURATION_SECONDS
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
    }
  ]

  return segments
}
