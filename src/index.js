import _ from 'lodash'

import fireMage from './models/mage/fire'
import combatRogue from './models/rogue/combat'
import assassinationRogue from './models/rogue/assassination'
import furyWarrior from './models/warrior/fury'
import armsWarrior from './models/warrior/arms'
import shadowPriest from './models/priest/shadow'
import elementalShaman from './models/shaman/elemental'
import enhancementShaman from './models/shaman/enhancement'
import destructionWarlock from './models/warlock/destruction'
import retributionPaladin from './models/paladin/retribution'
import balanceDruid from './models/druid/balance'
import feralDruid from './models/druid/feral'
import beastmasteryHunter from './models/hunter/beastmastery'

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
