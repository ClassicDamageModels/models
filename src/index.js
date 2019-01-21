import _ from 'lodash'

import fireMage from './mage/fire'
import combatRogue from './rogue/combat'
import assassinationRogue from './rogue/assassination'
import furyWarrior from './warrior/fury'
import armsWarrior from './warrior/arms'
import shadowPriest from './priest/shadow'
import elementalShaman from './shaman/elemental'
import enhancementShaman from './shaman/enhancement'
import destructionWarlock from './warlock/destruction'
import retributionPaladin from './paladin/retribution'
import balanceDruid from './druid/balance'
import feralDruid from './druid/feral'
import beastmasteryHunter from './hunter/beastmastery'

const damageModel = props => {
  const {
    spec,
    character: {
      data: { class: className }
    }
  } = props

  const specName = (((spec && spec.name) || '') + className).toLowerCase()

  switch (specName) {
    case 'firemage':
      return fireMage(props)
    case 'combatrogue':
      return combatRogue(props)
    case 'assassinationrogue':
      return assassinationRogue(props)
    case 'furywarrior':
      return furyWarrior(props)
    case 'armswarrior':
      return armsWarrior(props)
    case 'shadowpriest':
      return shadowPriest(props)
    case 'elementalshaman':
      return elementalShaman(props)
    case 'enhancementshaman':
      return enhancementShaman(props)
    case 'destructionwarlock':
      return destructionWarlock(props)
    case 'retributionpaladin':
      return retributionPaladin(props)
    case 'balancedruid':
      return balanceDruid(props)
    case 'feraldruid':
      return feralDruid(props)
    case 'beastmasteryhunter':
      return beastmasteryHunter(props)
    default:
      return []
  }
}

export default damageModel
