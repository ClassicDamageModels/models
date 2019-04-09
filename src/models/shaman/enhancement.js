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

  const MH = _.get(weapons, 'mh.item')
  const OH = _.get(weapons, 'oh.item')
  const WEAPON_MAINHAND = MH && MH.class === 'weapon' && MH
  const WEAPON_OFFHAND = OH && OH.class === 'weapon' && OH

  const FIGHT_DURATION_SECONDS = 5 * 60

  // T4 4-piece: Your Stormstrike ability does an additional 30 damage per weapon.
  const SET_BONUS_TIER4_4PIECE = _.find(spells, { id: 37224 })

  const [ATTACK_TABLE_WHITE_MH, ATTACK_TABLE_WHITE_OH] = getAttackTable('white', stats, [
    WEAPON_MAINHAND,
    WEAPON_OFFHAND
  ])
  const [ATTACK_TABLE_YELLOW_MH, ATTACK_TABLE_YELLOW_OH] = getAttackTable('yellow', stats, [
    WEAPON_MAINHAND,
    WEAPON_OFFHAND
  ])

  const SPELL_HIT_CHANCE = (100 - (16 - _.clamp(stats.spellhitChance, 0, 16) + 1)) / 100
  const FLURRY_UPTIME = 1 - Math.pow(1 - ATTACK_TABLE_WHITE_MH.crit, 4)

  const AP_COEFFICIENT = (WEAPON_MAINHAND && getAPCoefficient(WEAPON_MAINHAND)) || 0

  const BONUS_HASTE = 1 + 0.25 * FLURRY_UPTIME

  const TOTAL_HASTE = (1 + stats.haste / 100) * BONUS_HASTE

  const ARMOR_MULTIPLIER = getArmorMultiplier(_.clamp(target.stats.armor - stats.armorpen, 0, 7700))

  // ES cd 6, SS cd 10 => 5 ES 3 SS
  const ROTATION_DURATION_SECONDS = 30

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
      1.1 * // Talent: Weapon Mastery
        ARMOR_MULTIPLIER *
        target.multipliers.physical) ||
    0

  const MH_CRIT_DAMAGE = MH_DAMAGE * 2

  // Average OH swing damage
  const OH_DAMAGE =
    (WEAPON_OFFHAND &&
      (OH_WEAPON_DAMAGE + (stats.attackpower / 14) * (WEAPON_OFFHAND.weapon_speed / 1000)) *
      1.1 * // Talent: Weapon Mastery
        ARMOR_MULTIPLIER *
        target.multipliers.physical *
        0.5) ||
    0

  const OH_CRIT_DAMAGE = OH_DAMAGE * 2

  const MH_WHITE_COMPONENT =
    ATTACK_TABLE_WHITE_MH.hit * MH_DAMAGE +
    ATTACK_TABLE_WHITE_MH.glance * MH_DAMAGE * 0.65 +
    ATTACK_TABLE_WHITE_MH.crit * MH_CRIT_DAMAGE

  const MH_WHITE_DPS =
    (WEAPON_MAINHAND && MH_WHITE_COMPONENT / (WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE)) ||
    0

  const OH_WHITE_COMPONENT =
    ATTACK_TABLE_WHITE_OH.hit * OH_DAMAGE +
    ATTACK_TABLE_WHITE_OH.glance * OH_DAMAGE * 0.65 +
    ATTACK_TABLE_WHITE_OH.crit * OH_CRIT_DAMAGE

  const OH_WHITE_DPS =
    (WEAPON_OFFHAND && OH_WHITE_COMPONENT / (WEAPON_OFFHAND.weapon_speed / 1000 / TOTAL_HASTE)) || 0

  /* Windfury Weapon
    Imbue the Shaman's weapon with wind. Each hit has a 20% chance of dealing
    additional damage equal to two extra attacks with 445 extra attack power.
    Lasts 30 minutes.


    Elemental Weapons
    Increases the damage caused by your Rockbiter Weapon by 20%, your
    Windfury Weapon effect by 40% and increases the damage caused by
    your Flametongue Weapon and Frostbrand Weapon by 15%.

    How long on average do we wait for WF?

    icd + speed / chance
    3 + 2.0 / 0.2 = 13 seconds
  */

  const WF_CHANCE = 0.2
  const WF_COOLDOWN = 3

  const MH_WEAPON_SPEED = WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE
  const MH_TIME_BETWEEN_WF = WF_COOLDOWN + MH_WEAPON_SPEED / WF_CHANCE

  const OH_WEAPON_SPEED = WEAPON_OFFHAND.weapon_speed / 1000 / TOTAL_HASTE
  const OH_TIME_BETWEEN_WF = WF_COOLDOWN + OH_WEAPON_SPEED / WF_CHANCE

  const MH_WINDFURY_PROCS = ROTATION_DURATION_SECONDS / MH_TIME_BETWEEN_WF
  const OH_WINDFURY_PROCS = ROTATION_DURATION_SECONDS / OH_TIME_BETWEEN_WF

  const MH_WINDFURY_DAMAGE =
    (MH_WEAPON_DAMAGE + (AP_COEFFICIENT * (stats.attackpower + 445 * 1.4)) / 14) *
    1.1 * // Talent: Weapon Mastery
    ARMOR_MULTIPLIER *
    target.multipliers.physical

  const OH_WINDFURY_DAMAGE =
    (OH_WEAPON_DAMAGE + (AP_COEFFICIENT * (stats.attackpower + 445 * 1.4)) / 14) *
    1.1 * // Talent: Weapon Mastery
    ARMOR_MULTIPLIER *
    0.5 *
    target.multipliers.physical

  const YELLOW_HIT_CHANCE =
    1 - ATTACK_TABLE_YELLOW_MH.miss - ATTACK_TABLE_YELLOW_MH.dodge - ATTACK_TABLE_YELLOW_MH.parry

  const MH_WINDFURY_HIT_COMPONENT =
    YELLOW_HIT_CHANCE * (1 - ATTACK_TABLE_YELLOW_MH.crit) * MH_WINDFURY_DAMAGE
  const OH_WINDFURY_HIT_COMPONENT =
    YELLOW_HIT_CHANCE * (1 - ATTACK_TABLE_YELLOW_OH.crit) * OH_WINDFURY_DAMAGE

  const MH_WINDFURY_CRIT_COMPONENT =
    YELLOW_HIT_CHANCE * ATTACK_TABLE_YELLOW_MH.crit * MH_WINDFURY_DAMAGE * 2
  const OH_WINDFURY_CRIT_COMPONENT =
    YELLOW_HIT_CHANCE * ATTACK_TABLE_YELLOW_OH.crit * OH_WINDFURY_DAMAGE * 2

  const MH_WINDFURY_DPS =
    (MH_WINDFURY_PROCS * (MH_WINDFURY_HIT_COMPONENT + MH_WINDFURY_CRIT_COMPONENT) * 2) /
    ROTATION_DURATION_SECONDS

  const OH_WINDFURY_DPS =
    (OH_WINDFURY_PROCS * (OH_WINDFURY_HIT_COMPONENT + OH_WINDFURY_CRIT_COMPONENT) * 2) /
    ROTATION_DURATION_SECONDS

  const WHITE_DPS = MH_WHITE_DPS + OH_WHITE_DPS + MH_WINDFURY_DPS + OH_WINDFURY_DPS

  const EARTH_SHOCK_DAMAGE =
    (abilities.earthshock.damage + abilities.earthshock.coefficient * stats.spelldamage) *
    1.2 * // Stormstrike
    target.multipliers.nature

  const EARTH_SHOCK_HIT_COMPONENT =
    SPELL_HIT_CHANCE * (1 - stats.spellcritChance / 100) * EARTH_SHOCK_DAMAGE
  const EARTH_SHOCK_CRIT_COMPONENT =
    SPELL_HIT_CHANCE * (stats.spellcritChance / 100) * EARTH_SHOCK_DAMAGE * 1.5

  const EARTH_SHOCK_DPS =
    (5 * (EARTH_SHOCK_HIT_COMPONENT + EARTH_SHOCK_CRIT_COMPONENT)) / ROTATION_DURATION_SECONDS

  /*
  Instantly attack with both weapons. In addition, the next 2 sources of Nature damage dealt to the target are increased by 20%. Lasts 12sec.

   */

  const STORMSTRIKE_HIT_COMPONENT_MH =
    YELLOW_HIT_CHANCE *
    (1 - ATTACK_TABLE_YELLOW_MH.crit) *
    (MH_DAMAGE + (SET_BONUS_TIER4_4PIECE ? 30 : 0))
  const STORMSTRIKE_CRIT_COMPONENT_MH =
    YELLOW_HIT_CHANCE *
    ATTACK_TABLE_YELLOW_MH.crit *
    (MH_DAMAGE + (SET_BONUS_TIER4_4PIECE ? 30 : 0)) *
    2

  const STORMSTRIKE_HIT_COMPONENT_OH =
    YELLOW_HIT_CHANCE *
    (1 - ATTACK_TABLE_YELLOW_OH.crit) *
    (OH_DAMAGE + (SET_BONUS_TIER4_4PIECE ? 30 : 0))
  const STORMSTRIKE_CRIT_COMPONENT_OH =
    YELLOW_HIT_CHANCE *
    ATTACK_TABLE_YELLOW_OH.crit *
    (OH_DAMAGE + (SET_BONUS_TIER4_4PIECE ? 30 : 0)) *
    2

  const STORMSTRIKE_DPS =
    (3 *
      (STORMSTRIKE_HIT_COMPONENT_MH +
        STORMSTRIKE_CRIT_COMPONENT_MH +
        STORMSTRIKE_HIT_COMPONENT_OH +
        STORMSTRIKE_CRIT_COMPONENT_OH)) /
    ROTATION_DURATION_SECONDS

  return [
    {
      source: { icon: 'inv_sword_04', name: 'Auto Attacks' },
      dps: WHITE_DPS,
      subSegments: [
        {
          source: { ...WEAPON_MAINHAND, name: 'Main Hand' },
          dps: MH_WHITE_DPS + MH_WINDFURY_DPS,
          subSegments: [
            {
              source: abilities.windfury,
              dps: MH_WINDFURY_DPS
            }
          ]
        },
        {
          source: { ...WEAPON_OFFHAND, name: 'Off Hand' },
          dps: OH_WHITE_DPS + OH_WINDFURY_DPS,
          subSegments: [
            {
              source: abilities.windfury,
              dps: OH_WINDFURY_DPS
            }
          ]
        }
      ]
    },
    {
      source: abilities.earthshock,
      dps: EARTH_SHOCK_DPS
    },
    {
      source: abilities.stormstrike,
      dps: STORMSTRIKE_DPS
    }
  ]
}
