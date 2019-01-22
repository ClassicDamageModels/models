import _ from 'lodash'
import abilities from '../../domain/abilities'

export default ({ spec, vitals: stats, target }) => {
  const TALENT_IGNITE = _.find(spec.talents, { name: 'Ignite', active: true })
  const TALENT_EMPOWERED_FIREBALL = _.find(spec.talents, {
    name: 'Empowered Fireball',
    active: true
  })
  const TALENT_IMPROVED_FIREBALL = _.find(spec.talents, {
    name: 'Improved Fireball',
    active: true
  })
  const TALENT_PLAYING_WITH_FIRE = _.find(spec.talents, {
    name: 'Playing with Fire',
    active: true
  })
  const TALENT_FIRE_POWER = _.find(spec.talents, { name: 'Fire Power', active: true })
  const TALENT_MOLTEN_FURY = _.find(spec.talents, { name: 'Molten Fury', active: true })
  const TALENT_ICY_VEINS = _.find(spec.talents, { name: 'Icy Veins', active: true })

  // FIXME: Make fight duration configurable
  const FIGHT_DURATION_SECONDS = 5 * 60

  /* Miss chance against level 73 targets is 17%. Hit chance lowers this to down to minimum of 1% */
  const HIT_CHANCE = (100 - (16 - _.clamp(stats.spellhitChance, 0, 16) + 1)) / 100
  const CRIT_CHANCE = stats.spellcritChance / 100

  const BONUS_HASTE = TALENT_ICY_VEINS
    ? // Icy Veins uptime * haste bonus (20%)
      ((Math.floor(FIGHT_DURATION_SECONDS / 180) * 20) / FIGHT_DURATION_SECONDS) * 20
    : 0

  const DAMAGE_MULTIPLIER =
    1 *
    // Playing with Fire: All spells +3%
    (TALENT_PLAYING_WITH_FIRE ? 1.03 : 1) *
    // Fire Power: Fire spells +10%
    (TALENT_FIRE_POWER ? 1.1 : 1) *
    // Molten Fury: 20% more damage against targets w/ <20% hp ~= 4% average increase
    (TALENT_MOLTEN_FURY ? 1.04 : 1) *
    // Curse of Elements, Improved Scorch, Misery (FIXME: Are these all multiplicative?)
    target.multipliers.fire

  const FIREBALL_COEFFICIENT =
    abilities.fireball.coefficient + (TALENT_EMPOWERED_FIREBALL ? 0.15 : 0)
  const FIREBALL_DAMAGE =
    (abilities.fireball.damage + FIREBALL_COEFFICIENT * stats.spelldamage) * DAMAGE_MULTIPLIER

  const FIREBALL_CAST_TIME =
    (abilities.fireball.castTime + (TALENT_IMPROVED_FIREBALL ? -0.5 : 0)) /
    (1 + (stats.spellhaste + BONUS_HASTE) / 100)

  // Fireball casts that do not miss AND do not crit
  const FIREBALL_HIT_COMPONENT = HIT_CHANCE * (1 - CRIT_CHANCE) * FIREBALL_DAMAGE
  // Fireball casts that do not miss AND crit
  const FIREBALL_CRIT_COMPONENT = HIT_CHANCE * CRIT_CHANCE * FIREBALL_DAMAGE * 1.5
  // Ignite deals additional 40% from any crit damage
  const FIREBALL_IGNITE_COMPONENT = FIREBALL_CRIT_COMPONENT * 0.4

  // We assume scorch duty here ...
  const SCORCH_DAMAGE =
    (abilities.scorch.damage + abilities.scorch.coefficient * stats.spelldamage) * DAMAGE_MULTIPLIER
  const SCORCH_CAST_TIME =
    abilities.fireball.castTime / (1 + (stats.spellhaste + BONUS_HASTE) / 100)

  // Scorch casts that do not miss AND do not crit
  const SCORCH_HIT_COMPONENT = HIT_CHANCE * (1 - CRIT_CHANCE) * SCORCH_DAMAGE
  // Scorch casts that do not miss AND crit
  const SCORCH_CRIT_COMPONENT = HIT_CHANCE * CRIT_CHANCE * SCORCH_DAMAGE * 1.5
  // Ignite deals additional 40% from any crit damage
  const SCORCH_IGNITE_COMPONENT = SCORCH_CRIT_COMPONENT * 0.4

  // You are at risk of dropping scorch debuff if we go for more than 8 FBs between scorches
  const FB_CASTS = 8
  const ROTATION_DURATION_SECONDS = FB_CASTS * FIREBALL_CAST_TIME + SCORCH_CAST_TIME

  return [
    {
      source: abilities.fireball,
      dps:
        (FB_CASTS * (FIREBALL_HIT_COMPONENT + FIREBALL_CRIT_COMPONENT)) / ROTATION_DURATION_SECONDS
    },
    {
      source: abilities.scorch,
      dps: (SCORCH_HIT_COMPONENT + SCORCH_CRIT_COMPONENT) / ROTATION_DURATION_SECONDS
    },
    {
      source: TALENT_IGNITE,
      dps:
        (FB_CASTS * FIREBALL_IGNITE_COMPONENT + SCORCH_IGNITE_COMPONENT) / ROTATION_DURATION_SECONDS
    }
  ]
}
