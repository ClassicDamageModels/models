import _ from 'lodash'
import abilities from '../abilities'
import { getAttackTable, getAPCoefficient, getArmorMultiplier } from '../utils'

export default ({
  vitals: stats,
  target,
  buffs,
  character: {
    data: { gear, race }
  }
}) => {
  const weapons = {
    mh: _.find(gear, { slot: 'weapon1' }),
    oh: _.find(gear, { slot: 'weapon2' }),
    ranged: _.find(gear, { slot: 'ranged' })
  }

  const MH = _.get(weapons, 'mh.item')
  const WEAPON_MAINHAND = MH && MH.class === 'weapon' && MH
  const MH_IS_2H = MH && MH.type === '2H weapon'

  const WINDFURY_TOTEM = buffs.raid // FIXME: Pass all buffs explicitly
  const ATTACK_TABLE_WHITE = getAttackTable('white', stats, [WEAPON_MAINHAND])
  const ATTACK_TABLE_YELLOW = getAttackTable('yellow', stats, [WEAPON_MAINHAND])
  const AP_COEFFICIENT = (WEAPON_MAINHAND && getAPCoefficient(WEAPON_MAINHAND)) || 0
  const ARMOR_MULTIPLIER = getArmorMultiplier(_.clamp(target.stats.armor - stats.armorpen, 0, 7700))
  const TOTAL_HASTE = 1 + stats.haste / 100

  const MH_WEAPON_SPEED =
    (WEAPON_MAINHAND && WEAPON_MAINHAND.weapon_speed / 1000 / TOTAL_HASTE) || 1
  const MH_WEAPON_DAMAGE =
    (WEAPON_MAINHAND && (WEAPON_MAINHAND.dmg_min + WEAPON_MAINHAND.dmg_max) / 2) || 0

  const NUM_CRUSADER_STRIKES_PER_ROTATION = 3
  const NUM_JUDGEMENTS_PER_ROTATION = 2
  const ROTATION_DURATION_SECONDS = 18

  const NUM_MH_SWINGS_PER_ROTATION =
    (WEAPON_MAINHAND && ROTATION_DURATION_SECONDS / MH_WEAPON_SPEED) || 0

  const NUM_MH_ATTACKS_PER_ROTATION =
    NUM_MH_SWINGS_PER_ROTATION + NUM_CRUSADER_STRIKES_PER_ROTATION + NUM_JUDGEMENTS_PER_ROTATION

  const MH_DAMAGE =
    (WEAPON_MAINHAND &&
      (MH_WEAPON_DAMAGE + (stats.attackpower / 14) * (WEAPON_MAINHAND.weapon_speed / 1000)) *
      ARMOR_MULTIPLIER *
      (MH_IS_2H ? 1.06 : 1) * // Talent: Two-Handed Weapon Specialization
      1.03 * // Talent: Crusade
      1.15 * // Talent: Vengeance
        target.multipliers.physical) ||
    0

  const MH_CRIT_DAMAGE = MH_DAMAGE * 2

  const MH_WHITE_COMPONENT =
    ATTACK_TABLE_WHITE.hit * MH_DAMAGE +
    ATTACK_TABLE_WHITE.glance * MH_DAMAGE * 0.65 +
    ATTACK_TABLE_WHITE.crit * MH_CRIT_DAMAGE

  const MH_EXTRA_ATTACKS_WINDFURY_TOTEM = WINDFURY_TOTEM ? 0.2 * NUM_MH_ATTACKS_PER_ROTATION : 0

  const MH_WHITE_DPS =
    (WEAPON_MAINHAND &&
      (NUM_MH_SWINGS_PER_ROTATION * MH_WHITE_COMPONENT) / ROTATION_DURATION_SECONDS) ||
    0

  const MH_WHITE_DPS_EXTRA_ATTACKS_WINDFURY_TOTEM =
    (MH_EXTRA_ATTACKS_WINDFURY_TOTEM * MH_WHITE_COMPONENT) / ROTATION_DURATION_SECONDS

  const WHITE_DPS = MH_WHITE_DPS + MH_WHITE_DPS_EXTRA_ATTACKS_WINDFURY_TOTEM

  const YELLOW_HIT_CHANCE =
    1 - ATTACK_TABLE_YELLOW.miss - ATTACK_TABLE_YELLOW.dodge - ATTACK_TABLE_YELLOW.parry

  const CRUSADER_STRIKE_DAMAGE =
    (WEAPON_MAINHAND &&
      (MH_WEAPON_DAMAGE + (AP_COEFFICIENT * stats.attackpower) / 14) *
      1.1 * // 110% Weapon Damage
      (MH_IS_2H ? 1.06 : 1) * // Talent: Two-Handed Weapon Specialization
      1.15 * // Talent: Vengeance
        ARMOR_MULTIPLIER *
        target.multipliers.physical) ||
    0

  const CRUSADER_STRIKE_CRIT_DAMAGE = CRUSADER_STRIKE_DAMAGE * 2

  // Yellow hits that dont miss and dont crit
  const CRUSADER_STRIKE_HIT_COMPONENT =
    YELLOW_HIT_CHANCE * (1 - ATTACK_TABLE_YELLOW.crit) * CRUSADER_STRIKE_DAMAGE

  // Yellow hits that dont miss and do crit
  const CRUSADER_STRIKE_CRIT_COMPONENT =
    YELLOW_HIT_CHANCE * ATTACK_TABLE_YELLOW.crit * CRUSADER_STRIKE_CRIT_DAMAGE

  const CRUSADER_STRIKE_DPS =
    (NUM_CRUSADER_STRIKES_PER_ROTATION *
      (CRUSADER_STRIKE_HIT_COMPONENT + CRUSADER_STRIKE_CRIT_COMPONENT)) /
    ROTATION_DURATION_SECONDS

  // Seal of Blood: All melee attacks deal additional Holy damage equal to 35% of
  // normal weapon damage, but the Paladin loses health equal to 10% of the total damage
  // inflicted. Unleashing this Seal's energy will judge an enemy, instantly causing 295 to 326
  // Holy damage at the cost of health equal to 33% of the damage caused.

  /*
  Seal of Command procs "per minute" (ppm), rather than per hit - it will proc
  an average of 7 times per minute. So you get the same amount of procs no matter your
  weapon speed, but a slower, high damage-per-strike weapon will do more Seal of Command
  damage per hit, on average, than a faster, low damage-per-strike weapon rated at the same DPS.
  Seal of Command's ppm-rate is the same through rank 1 to 5. The only difference that the ranks
  make is the damage of the Judgement.

  Seal of Command receives 20% coefficient from normal +spell damage stats, and 29% from
  +holy damage stats (such as Judgement of the Crusader). Judgement of Command receives 43%
  coefficient from any +spell damage stats.

  Unlike other spells, Seal of Command and Judgement of Command are considered physical hits,
  that does Holy damage. They both use melee crit and hit stats instead of spell crit or hit,
  and when they crit the damage will be multiplied by two. However like other physical attacks,
  Seal of Command can miss, or be dodged, parried, or blocked. Judgement of Command can only
  be resisted.

  TL;DR SoC: 7 PPM, 20% sp coefficient, Melee mechanics, holy damage => goes through armor
  SoB: no coefficient,
  JoC & JoB: 43% sp coefficient,

  */

  const SEAL = race === 'bloodelf' ? abilities.sealofblood : abilities.sealofcommand
  const SEAL_PROCS =
    (SEAL === abilities.sealofblood ? 1 : (7 / 60) * MH_WEAPON_SPEED) * NUM_MH_SWINGS_PER_ROTATION

  const MH_DAMAGE_SEAL =
    (WEAPON_MAINHAND &&
      (MH_WEAPON_DAMAGE + (stats.attackpower / 14) * (WEAPON_MAINHAND.weapon_speed / 1000)) *
      (MH_IS_2H ? 1.06 : 1) * // Talent: Two-Handed Weapon Specialization
      1.03 * // Talent: Crusade
      1.15 * // Talent: Vengeance
        target.multipliers.holy) ||
    0

  const SEAL_OF_COMMAND_HIT_COMPONENT =
    YELLOW_HIT_CHANCE * (1 - ATTACK_TABLE_YELLOW.crit) * MH_DAMAGE_SEAL
  const SEAL_OF_COMMAND_CRIT_COMPONENT =
    YELLOW_HIT_CHANCE * ATTACK_TABLE_YELLOW.crit * MH_DAMAGE_SEAL

  const SEAL_OF_BLOOD_HIT_COMPONENT = (1 - ATTACK_TABLE_YELLOW.crit) * MH_DAMAGE_SEAL
  const SEAL_OF_BLOOD_CRIT_COMPONENT =
    (1 - ATTACK_TABLE_YELLOW.miss) * ATTACK_TABLE_YELLOW.crit * MH_DAMAGE_SEAL

  const SEAL_COMPONENT =
    SEAL === abilities.sealofblood
      ? SEAL_OF_BLOOD_HIT_COMPONENT + SEAL_OF_BLOOD_CRIT_COMPONENT
      : SEAL_OF_COMMAND_HIT_COMPONENT + SEAL_OF_COMMAND_CRIT_COMPONENT

  const SEAL_DAMAGE =
    (SEAL === abilities.sealofblood
      ? 0.35 * SEAL_COMPONENT
      : 0.7 * SEAL_COMPONENT + (1 / 5) * stats.spelldamage) *
    1.14 * // Talent: Sanctity Aura (Improved)
    1.15 // Talent: Vengeance

  const SEAL_DPS = (SEAL_PROCS * SEAL_DAMAGE) / ROTATION_DURATION_SECONDS

  const JUDGEMENT_DAMAGE =
    (SEAL === abilities.sealofblood
      ? (331 + 362) / 2 + 0.43 * stats.spelldamage
      : (228 + 252) / 2 + 0.43 * stats.spelldamage) *
    1.14 * // Talent: Sanctity Aura (Improved)
    1.15 // Talent: Vengeance

  const JUDGEMENT_ATTACK_TABLE = getAttackTable('yellow', stats, [WEAPON_MAINHAND], {
    critChance: 15, // Talent: Fanaticism
    expertise: 100 // Judgement can only resist (meaning miss)
  })
  const JUDGEMENT_HIT_CHANCE =
    1 - JUDGEMENT_ATTACK_TABLE.miss - JUDGEMENT_ATTACK_TABLE.dodge - JUDGEMENT_ATTACK_TABLE.parry

  const JUDGEMENT_HIT_COMPONENT =
    JUDGEMENT_HIT_CHANCE * (1 - JUDGEMENT_ATTACK_TABLE.crit) * JUDGEMENT_DAMAGE
  const JUDGEMENT_CRIT_COMPONENT =
    JUDGEMENT_HIT_CHANCE * JUDGEMENT_ATTACK_TABLE.crit * JUDGEMENT_DAMAGE * 2

  const JUDGEMENT_DPS =
    (NUM_JUDGEMENTS_PER_ROTATION * (JUDGEMENT_HIT_COMPONENT + JUDGEMENT_CRIT_COMPONENT)) /
    ROTATION_DURATION_SECONDS

  return [
    {
      source: { icon: 'inv_sword_04', name: 'Auto Attacks' },
      dps: WHITE_DPS,
      subSegments: [
        {
          source: { ...WEAPON_MAINHAND, name: 'Main Hand' },
          dps: MH_WHITE_DPS,
          subSegments: [
            {
              source: { icon: 'spell_nature_windfury', name: 'Windfury Totem' },
              dps: MH_WHITE_DPS_EXTRA_ATTACKS_WINDFURY_TOTEM
            }
          ]
        }
      ]
    },
    {
      source: abilities.crusaderstrike,
      dps: CRUSADER_STRIKE_DPS
    },
    {
      source: SEAL,
      dps: SEAL_DPS
    },
    {
      source: abilities.judgement,
      dps: JUDGEMENT_DPS
    }
  ]
}
