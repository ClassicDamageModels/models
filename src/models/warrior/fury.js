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
  const weapons = {
    mh: _.find(gear, { slot: 'weapon1' }),
    oh: _.find(gear, { slot: 'weapon2' }),
    ranged: _.find(gear, { slot: 'ranged' })
  }

  const MH = _.get(weapons, 'mh.item')
  const OH = _.get(weapons, 'oh.item')
  const WEAPON_MAINHAND = MH && MH.class === 'weapon' && MH
  const WEAPON_OFFHAND = OH && OH.class === 'weapon' && OH

  const FIGHT_DURATION_SECONDS = 5 * 60
  const WINDFURY_TOTEM = buffs.raid // FIXME: Pass all buffs explicitly

  const [ ATTACK_TABLE_WHITE_MH, ATTACK_TABLE_WHITE_OH ] = getAttackTable('white', stats, [WEAPON_MAINHAND, WEAPON_OFFHAND])
  const [ ATTACK_TABLE_YELLOW_MH ] = getAttackTable('yellow', stats, [WEAPON_MAINHAND, WEAPON_OFFHAND])

  const FLURRY_UPTIME = 1 - Math.pow(1 - ATTACK_TABLE_WHITE_MH.crit, 4)

  // T4 2-piece: Your Whirlwind ability costs 5 less rage.
  const SET_BONUS_TIER4_2PIECE = _.find(spells, { id: 37518 })
  // T4 4-piece: You gain an additional 2 rage each time one of your attacks is parried or dodged.
  const SET_BONUS_TIER4_4PIECE = _.find(spells, { id: 37519 })

  const AP_COEFFICIENT = (WEAPON_MAINHAND && getAPCoefficient(WEAPON_MAINHAND)) || 0

  const BONUS_HASTE = 1 + 0.25 * FLURRY_UPTIME

  const TOTAL_HASTE = (1 + stats.haste / 100) * BONUS_HASTE

  const ARMOR_MULTIPLIER = getArmorMultiplier(_.clamp(target.stats.armor - stats.armorpen, 0, 7700))

  // 3 BT 2 WW rotation. (3 Bloodthirst = 18 seconds, 2 Whirlwinds with 1 point in Improved Whirlwind = 18 seconds)
  const ROTATION_DURATION_SECONDS = 18

  const NUM_MH_SWINGS_PER_ROTATION =
    (WEAPON_MAINHAND &&
      ROTATION_DURATION_SECONDS / (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE)) ||
    0
  const NUM_OH_SWINGS_PER_ROTATION =
    (WEAPON_OFFHAND &&
      ROTATION_DURATION_SECONDS / (WEAPON_OFFHAND.weapon_speed / 1000 / TOTAL_HASTE)) ||
    0

  const MH_WEAPON_DAMAGE =
    (WEAPON_MAINHAND && (WEAPON_MAINHAND.dmg_min + WEAPON_MAINHAND.dmg_max) / 2) || 0

  const OH_WEAPON_DAMAGE =
    (WEAPON_OFFHAND && (WEAPON_OFFHAND.dmg_min + WEAPON_OFFHAND.dmg_max) / 2) || 0

  // Average MH swing damage
  const MH_DAMAGE =
    (WEAPON_MAINHAND &&
      (MH_WEAPON_DAMAGE + (stats.attackpower / 14) * (WEAPON_MAINHAND.weapon_speed / 1000)) *
        ARMOR_MULTIPLIER *
        target.multipliers.physical) ||
    0

  const MH_CRIT_DAMAGE = MH_DAMAGE * 2

  // Average OH swing damage
  const OH_DAMAGE =
    (WEAPON_OFFHAND &&
      (OH_WEAPON_DAMAGE + (stats.attackpower / 14) * (WEAPON_OFFHAND.weapon_speed / 1000)) *
        ARMOR_MULTIPLIER *
        target.multipliers.physical) ||
    0

  const OH_CRIT_DAMAGE = OH_DAMAGE * 2

  const MH_WHITE_COMPONENT =
    ATTACK_TABLE_WHITE_MH.hit * MH_DAMAGE +
    ATTACK_TABLE_WHITE_MH.glance * MH_DAMAGE * 0.65 +
    ATTACK_TABLE_WHITE_MH.crit * MH_CRIT_DAMAGE

  const MH_WHITE_DPS =
    (WEAPON_MAINHAND && MH_WHITE_COMPONENT / (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE)) ||
    0

  const MH_EXTRA_ATTACKS_WINDFURY_TOTEM = WINDFURY_TOTEM ? 0.2 * NUM_MH_SWINGS_PER_ROTATION : 0

  const OH_WHITE_COMPONENT =
    (ATTACK_TABLE_WHITE_OH.hit * OH_DAMAGE +
      ATTACK_TABLE_WHITE_OH.glance * OH_DAMAGE * 0.65 +
      ATTACK_TABLE_WHITE_OH.crit * OH_CRIT_DAMAGE) *
    0.625

  const OH_WHITE_DPS =
    (WEAPON_OFFHAND && OH_WHITE_COMPONENT / (WEAPON_OFFHAND.weapon_speed / 1000 / TOTAL_HASTE)) || 0

  const UNBRIDLED_WRATH_POINTS = 5
  const RAGE_PER_SECOND_UNBRIDLED_WRATH_MH =
    (WEAPON_MAINHAND &&
      (((3 * UNBRIDLED_WRATH_POINTS) / 60) * (WEAPON_MAINHAND.weapon_speed / 1000)) /
        (WEAPON_MAINHAND.weapon_speed / 1000)) ||
    0
  const RAGE_PER_SECOND_UNBRIDLED_WRATH_OH =
    (WEAPON_OFFHAND &&
      (((3 * UNBRIDLED_WRATH_POINTS) / 60) * (WEAPON_OFFHAND.weapon_speed / 1000)) /
        (WEAPON_MAINHAND.weapon_speed / 1000)) ||
    0
  const RAGE_PER_SECOND_UNBRIDLED_WRATH =
    RAGE_PER_SECOND_UNBRIDLED_WRATH_MH + RAGE_PER_SECOND_UNBRIDLED_WRATH_OH

  const RAGE_PER_SECOND_BLOODRAGE = 20 / 60
  const RAGE_PER_SECOND_ANGER_MANAGEMENT = 1 / 3

  // const c = 0.0091107836 * Math.pow(70, 2) + 3.225598133 * 70 + 4.2652911 => 274.7
  const RAGE_CONVERSION_VALUE = 274.7

  const RAGE_MH =
    (WEAPON_MAINHAND &&
      ATTACK_TABLE_WHITE_MH.hit *
        _.clamp(
          (15 * MH_DAMAGE) / (4 * RAGE_CONVERSION_VALUE) +
            (3.5 * WEAPON_MAINHAND.weapon_speed) / 1000 / 2,
          0,
          (15 * MH_DAMAGE) / RAGE_CONVERSION_VALUE
        ) +
        ATTACK_TABLE_WHITE_MH.glance *
          _.clamp(
            (15 * MH_DAMAGE * 0.65) / (4 * RAGE_CONVERSION_VALUE) +
              (3.5 * WEAPON_MAINHAND.weapon_speed) / 1000 / 2,
            0,
            (15 * MH_DAMAGE) / RAGE_CONVERSION_VALUE
          ) +
        ATTACK_TABLE_WHITE_MH.crit *
          _.clamp(
            (15 * MH_CRIT_DAMAGE) / (4 * RAGE_CONVERSION_VALUE) +
              (7 * WEAPON_MAINHAND.weapon_speed) / 1000 / 2,
            0,
            (15 * MH_DAMAGE) / RAGE_CONVERSION_VALUE
          )) ||
    0

  const RAGE_PER_SECOND_MH =
    (WEAPON_MAINHAND && RAGE_MH / (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE)) || 0

  const RAGE_PER_SECOND_WINDFURY =
    (MH_EXTRA_ATTACKS_WINDFURY_TOTEM * RAGE_MH) / ROTATION_DURATION_SECONDS

  const RAGE_OH =
    (WEAPON_OFFHAND &&
      ATTACK_TABLE_WHITE_OH.hit *
        _.clamp(
          (15 * OH_DAMAGE) / (4 * RAGE_CONVERSION_VALUE) +
            (1.75 * WEAPON_OFFHAND.weapon_speed) / 1000 / 2,
          0,
          (15 * OH_DAMAGE) / RAGE_CONVERSION_VALUE
        ) +
        ATTACK_TABLE_WHITE_OH.glance *
          _.clamp(
            (15 * OH_DAMAGE * 0.65) / (4 * RAGE_CONVERSION_VALUE) +
              (1.75 * WEAPON_OFFHAND.weapon_speed) / 1000 / 2,
            0,
            (15 * OH_DAMAGE) / RAGE_CONVERSION_VALUE
          ) +
        ATTACK_TABLE_WHITE_OH.crit *
          _.clamp(
            (15 * OH_CRIT_DAMAGE) / (4 * RAGE_CONVERSION_VALUE) +
              (3.5 * WEAPON_OFFHAND.weapon_speed) / 1000 / 2,
            0,
            (15 * OH_DAMAGE) / RAGE_CONVERSION_VALUE
          )) ||
    0
  const RAGE_PER_SECOND_OH =
    (WEAPON_OFFHAND && RAGE_OH / (WEAPON_OFFHAND.weapon_speed / 1000 / TOTAL_HASTE)) || 0

  const NUM_DODGES_PER_ROTATION = NUM_MH_SWINGS_PER_ROTATION + NUM_OH_SWINGS_PER_ROTATION + 3 + 2
  const RAGE_PER_SECOND_T4_4PC = SET_BONUS_TIER4_4PIECE
    ? (NUM_DODGES_PER_ROTATION * 2) / ROTATION_DURATION_SECONDS
    : 0

  const RAGE_BUDGET =
    ROTATION_DURATION_SECONDS *
    (RAGE_PER_SECOND_UNBRIDLED_WRATH +
      RAGE_PER_SECOND_BLOODRAGE +
      RAGE_PER_SECOND_ANGER_MANAGEMENT +
      RAGE_PER_SECOND_MH +
      RAGE_PER_SECOND_WINDFURY +
      RAGE_PER_SECOND_OH +
      RAGE_PER_SECOND_T4_4PC)

  // Assume 100% uptime, 3 second overlap due to the "previously-crit" requirement
  const RAMPAGE_RAGE_COST_PER_SECOND = 20 / (30 - 3)
  const BATTLESHOUT_RAGE_COST_PER_SECOND = 10 / 120
  const BLOODTHIRST_RAGE_COST = 30
  const WHIRLWIND_RAGE_COST = 25 - (SET_BONUS_TIER4_2PIECE ? 5 : 0)

  const ROTATION_RAGE_COST =
    ROTATION_DURATION_SECONDS * (RAMPAGE_RAGE_COST_PER_SECOND + BATTLESHOUT_RAGE_COST_PER_SECOND) +
    3 * BLOODTHIRST_RAGE_COST

  const LEFTOVER_RAGE = RAGE_BUDGET - ROTATION_RAGE_COST

  const NUM_WW_PER_ROTATION = _.clamp(LEFTOVER_RAGE / WHIRLWIND_RAGE_COST, 0, 2)

  // Improved Heroic Strike
  const HEROIC_STRIKE_RAGE_COST = 15 - 3

  // How many HS's can we perform with the leftover rage
  const NUM_HEROIC_STRIKES_PER_ROTATION = _.clamp(
    (LEFTOVER_RAGE - NUM_WW_PER_ROTATION * WHIRLWIND_RAGE_COST) /
      (HEROIC_STRIKE_RAGE_COST + RAGE_MH),
    0,
    NUM_MH_SWINGS_PER_ROTATION
  )

  // Any Heroic Strikes take away from white swings so we have to adjust
  const MH_WHITE_CONTRIBUTION = 1 - NUM_HEROIC_STRIKES_PER_ROTATION / NUM_MH_SWINGS_PER_ROTATION
  const MH_WHITE_DPS_ADJUSTED_FOR_HS = MH_WHITE_DPS * MH_WHITE_CONTRIBUTION

  const MH_WHITE_DPS_EXTRA_ATTACKS_WINDFURY_TOTEM =
    (MH_EXTRA_ATTACKS_WINDFURY_TOTEM *
      (ATTACK_TABLE_WHITE_MH.hit * MH_DAMAGE +
        ATTACK_TABLE_WHITE_MH.glance * MH_DAMAGE * 0.65 +
        ATTACK_TABLE_WHITE_MH.crit * MH_DAMAGE * 2)) /
    ROTATION_DURATION_SECONDS

  const WHITE_DPS =
    MH_WHITE_DPS_ADJUSTED_FOR_HS + MH_WHITE_DPS_EXTRA_ATTACKS_WINDFURY_TOTEM + OH_WHITE_DPS

  const YELLOW_HIT_CHANCE =
    1 - ATTACK_TABLE_YELLOW_MH.miss - ATTACK_TABLE_YELLOW_MH.dodge - ATTACK_TABLE_YELLOW_MH.parry

  const HEROIC_STRIKE_DAMAGE =
    208 +
    (MH_WEAPON_DAMAGE + (AP_COEFFICIENT * stats.attackpower) / 14) *
      ARMOR_MULTIPLIER *
      target.multipliers.physical

  // Yellow hits that dont miss and dont crit
  const HEROIC_STRIKE_COMPONENT =
    YELLOW_HIT_CHANCE * (1 - ATTACK_TABLE_YELLOW_MH.crit) * HEROIC_STRIKE_DAMAGE

  // Yellow hits that dont miss and do crit
  const HEROIC_STRIKE_CRIT_COMPONENT =
    YELLOW_HIT_CHANCE *
    ATTACK_TABLE_YELLOW_MH.crit *
    HEROIC_STRIKE_DAMAGE *
    2 * // Melee crit
    1.2 // Talent: Impale

  const HEROIC_STRIKE_DPS =
    (NUM_HEROIC_STRIKES_PER_ROTATION * (HEROIC_STRIKE_COMPONENT + HEROIC_STRIKE_CRIT_COMPONENT)) /
    ROTATION_DURATION_SECONDS

  const BLOODTHIRST_DAMAGE =
    0.45 * stats.attackpower * ARMOR_MULTIPLIER * target.multipliers.physical

  const BLOODTHIRST_COMPONENT =
    YELLOW_HIT_CHANCE * (1 - ATTACK_TABLE_YELLOW_MH.crit) * BLOODTHIRST_DAMAGE

  const BLOODTHIRST_CRIT_COMPONENT =
    YELLOW_HIT_CHANCE *
    ATTACK_TABLE_YELLOW_MH.crit *
    HEROIC_STRIKE_DAMAGE *
    2 * // Melee crit
    1.2 // Talent: Impale

  const BLOODTHIRST_DPS =
    (3 * (BLOODTHIRST_COMPONENT + BLOODTHIRST_CRIT_COMPONENT)) / ROTATION_DURATION_SECONDS

  const WHIRLWIND_DAMAGE = MH_DAMAGE + OH_DAMAGE

  const WHIRLWIND_COMPONENT = YELLOW_HIT_CHANCE * (1 - ATTACK_TABLE_YELLOW_MH.crit) * WHIRLWIND_DAMAGE
  const WHIRLWIND_CRIT_COMPONENT =
    YELLOW_HIT_CHANCE *
    ATTACK_TABLE_YELLOW_MH.crit *
    WHIRLWIND_DAMAGE *
    2 * // Melee crit
    1.2 // Talent: Impale

  const WHIRLWIND_DPS =
    (NUM_WW_PER_ROTATION * (WHIRLWIND_COMPONENT + WHIRLWIND_CRIT_COMPONENT)) /
    ROTATION_DURATION_SECONDS

  const HITS_PER_SECOND = (NUM_MH_SWINGS_PER_ROTATION + NUM_OH_SWINGS_PER_ROTATION + 3 + 2) / 18
  // Chance that after a crit we get four ticks means no crits for 12 seconds
  const DEEP_WOUNDS_P4 = Math.pow(1 - stats.critChance / 100, 12 * HITS_PER_SECOND)
  // Exactly three ticks: 9 seconds of no crits minus P4
  const DEEP_WOUNDS_P3 = Math.pow(1 - stats.critChance / 100, 9 * HITS_PER_SECOND) - DEEP_WOUNDS_P4
  // Exactly two ticks: 6 seconds of no crits minus P3
  const DEEP_WOUNDS_P2 = Math.pow(1 - stats.critChance / 100, 6 * HITS_PER_SECOND) - DEEP_WOUNDS_P3
  // Exactly one tick: 3 seconds no crits minus P2
  const DEEP_WOUNDS_P1 = Math.pow(1 - stats.critChance / 100, 3 * HITS_PER_SECOND) - DEEP_WOUNDS_P2

  const DEEP_WOUNDS_AVERAGE_TICKS_PER_CRIT =
    DEEP_WOUNDS_P1 + 2 * DEEP_WOUNDS_P2 + 3 * DEEP_WOUNDS_P3 + 4 * DEEP_WOUNDS_P4

  const DEEP_WOUNDS_TICKS_PER_ROTATION =
    HITS_PER_SECOND *
    ROTATION_DURATION_SECONDS *
    (stats.critChance / 100) *
    DEEP_WOUNDS_AVERAGE_TICKS_PER_CRIT

  const DEEP_WOUNDS_TICK_DAMAGE =
    ((MH_WEAPON_DAMAGE + (stats.attackpower / 14) * (WEAPON_MAINHAND.weapon_speed / 1000)) * 0.6) /
    4

  const DEEP_WOUNDS_DPS =
    (DEEP_WOUNDS_TICKS_PER_ROTATION * DEEP_WOUNDS_TICK_DAMAGE) / ROTATION_DURATION_SECONDS

  const segments = [
    {
      source: { icon: 'inv_sword_04', name: 'Auto Attacks' },
      dps: WHITE_DPS,
      subSegments: [
        {
          source: { ...WEAPON_MAINHAND, name: 'Main Hand' },
          dps: MH_WHITE_DPS_ADJUSTED_FOR_HS,
          subSegments: [
            {
              source: { icon: 'spell_nature_windfury', name: 'Windfury Totem' },
              dps: MH_WHITE_DPS_EXTRA_ATTACKS_WINDFURY_TOTEM
            }
          ]
        },
        {
          source: { ...WEAPON_OFFHAND, name: 'Off Hand' },
          dps: OH_WHITE_DPS
        }
      ]
    },
    {
      source: abilities.heroicstrike,
      dps: HEROIC_STRIKE_DPS
    },
    {
      source: abilities.bloodthirst,
      dps: BLOODTHIRST_DPS
    },
    {
      source: abilities.whirlwind,
      dps: WHIRLWIND_DPS
    },
    {
      source: abilities.deepwounds,
      dps: DEEP_WOUNDS_DPS
    }
  ]

  return segments
}
