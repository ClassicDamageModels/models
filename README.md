# models

This project is a collection of mathematical models/approximations of absolute damage potential for each class and spec at any given gear level

### Class and spec support:

| class   | spec          | supported | confidence | notes                    |
| ------- | ------------- | --------- | ---------- | ------------------------ |
| rogue   | combat        | yes       | fair       | needs validation         |
| rogue   | assassination | yes       | fair       |                          |
| mage    | fire          | yes       | good       |                          |
| warrior | fury          | yes       | fair       | rage mechancis are hard  |
| warrior | arms          | yes       | fair       | ^                        |
| priest  | shadow        | yes       | fair       |                          |
| shaman  | elemental     | yes       | good       |                          |
| shaman  | enhancement   | yes       | fair       |                          |
| warlock | destruction   | yes       | good       |                          |
| warlock | affliction    | no        | -          |                          |
| druid   | balance       | yes       | good       | moonfire coeff is weird  |
| druid   | feral         | yes       | fair       |                          |
| hunter  | beast master  | yes       | incomplete | pet modelling not done   |
| hunter  | survival      | no        | -          |                          |
| paladin | retribution   | yes       | good       |                          |

### Set bonuses

| set                 | supported  | notes                                     |
| ------------------- | ---------- | ----------------------------------------- |
| rogue D3            | irrelevant | only affects evisc/envenom + kidney/cheap |
| rogue T4            | yes        | assassination needs work                  |
| rogue T5            | no         | proc to get free finisher                 |
| rogue T6            | no         | snd 5% haste (2) mutilate 6% (4)          |
| mage D3             | irrelevant |                                           |
| mage T4             | irrelevant | uninterruptable fireball, lower cds       |
| mage T5             | no         | arcane blast 20% / 70sp 6sec from crits   |
| mage T6             | no         | fireball 5% (4)                           |
| warrior D3          | irrelevant | tanking set                               |
| warrior T4          | yes        | ww -5rage, rage on parry / dodge          |
| warrior T5          | no         | bt / ms -5 rage                           |
| warrior T6          | no         | ms / bt +5% dmg                           |
| priest D3           | irrelevant |                                           |
| priest T4           | yes        | 4pc: mind flay +5%                        |
| priest T5           | no         | swp ticks have 100 sp next spell proc     |
| priest T6           | no         | swp +3sec (2) mind blast +10% (4)         |
| shaman D3           | irrelevant | CL jumps, water shield regen              |
| shaman (ele) T4     | yes        | wrath of air +20 sp, manacost             |
| shaman (ele) T5     | irrelevant |                                           |
| shaman (ele) T6     | no         | +35 crit +45 sp (2) LB +5% (4)            |
| shaman (enhance) T4 | yes        | strength totem +12 str, ss +30 dmg each   |
| shaman (enhance) T5 | no         | 5% haste from flurry                      |
| shaman (enhance) T6 | no         | 70 ap on stormstrike (100% uptime)        |
| warlock D3          | irrelevant | pet mana, seed of corruption              |
| warlock T4          | no         | +sp proc, +corruption / immolate dur      |
| warlock T5          | irrelevant |                                           |
| warlock T6          | no         | shadow bolt +6% (4)                       |
| druid D3            | irrelevant | rejuv, manacost                           |
| druid (balance) T4  | irrelevant | mana costs                                |
| druid (balance) T5  | no         | starfire 10% (4)                          |
| druid (balance) T6  | no         | moonfire +3 sec (2) starfire +5% crit (4) |
| druid (feral) T4    | no         | energy proc, 30 str                       |
| druid (feral) T5    | no         | shred +75 dmg (4)                         |
| druid (feral) T6    | no         | mangle -5 energy (2) rip +15% (4)         |
| hunter D3           | no         | kill command                              |
| hunter T4           | irrelevant | feign death, mana costs                   |
| hunter T5           | no         | steady shot 5% crit (4)                   |
| hunter T6           | no         | steady shot +10% dmg (4)                  |
| paladin D3          | irrelevant | consecration manacost, righteous defense  |
| paladin T4          | no         | judge +30 dmg, judges +10%                |
| paladin T5          | irrelevant |                                           |
| paladin T6          | no         | hammer of wrath +10% (4)                  |
| cloth D3            | yes        |                                           |
| leather D3          | yes        |                                           |
| mail D3             | yes        |                                           |
| plate D3            | yes        |                                           |
