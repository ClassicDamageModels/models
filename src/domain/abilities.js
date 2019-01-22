export default {
  fireball: {
    name: 'Fireball',
    icon: 'spell_fire_flamebolt',
    damage: (717 + 914) / 2,
    castTime: 3.5,
    coefficient: 1 - 0.1 //  Patch 2.0.6 (23-Jan-2007): Each rank of "Improved Fireball" now reduces Fireball's spell damage coefficient by 2%. Prior to this patch, the talent only reduced cast time.
  },
  scorch: {
    name: 'Scorch',
    icon: 'spell_fire_soulburn',
    damage: (305 + 362) / 2,
    castTime: 1.5,
    coefficient: 1.5 / 3.5
  },
  sinister: {
    name: 'Sinister Strike',
    icon: 'spell_shadow_ritualofsacrifice'
  },
  rupture: {
    name: 'Rupture',
    icon: 'ability_rogue_rupture'
  },
  deadlypoison: {
    name: 'Deadly Poison',
    icon: 'ability_rogue_dualweild'
  },
  instantpoison: {
    name: 'Instant Poison',
    icon: 'ability_poisons'
  },
  heroicstrike: {
    name: 'Heroic Strike',
    icon: 'ability_rogue_ambush'
  },
  bloodthirst: {
    name: 'Bloodthirst',
    icon: 'spell_nature_bloodlust'
  },
  whirlwind: {
    name: 'Whirlwind',
    icon: 'ability_whirlwind'
  },
  deepwounds: {
    name: 'Deep Wounds',
    icon: 'ability_backstab'
  },
  mortalstrike: {
    name: 'Mortal Strike',
    icon: 'ability_warrior_savageblow'
  },
  slam: {
    name: 'Slam',
    icon: 'ability_warrior_decisivestrike'
  },
  mindblast: {
    name: 'Mind Blast',
    icon: 'spell_shadow_unholyfrenzy',
    damage: (708 + 749) / 2,
    castTime: 1.5,
    coefficient: 1.5 / 3.5
  },
  vampirictouch: {
    name: 'Vampiric Toich',
    icon: 'spell_holy_stoicism',
    damage: 65,
    castTime: 1.5,
    coefficient: 15 / 15
  },
  mindflay: {
    name: 'Mind Flay',
    icon: 'spell_shadow_siphonmana',
    damage: 528,
    castTime: 3,
    coefficient: 2 / 3.5
  },
  shadowwordpain: {
    name: 'Shadow Word: Pain',
    icon: 'spell_shadow_shadowwordpain',
    damage: 1236,
    castTime: 1.5,
    coefficient: 1
  },
  shadowworddeath: {
    name: 'Shadow Word: Death',
    icon: 'spell_shadow_demonicfortitude',
    damage: (572 + 664) / 2,
    castTime: 1.5,
    coefficient: 1.5 / 3.5
  },
  lightningbolt: {
    name: 'Lightning Bolt',
    icon: 'spell_nature_lightning',
    damage: (563 + 644) / 2,
    castTime: 2,
    coefficient: 0.794
  },
  chainlightning: {
    name: 'Chain Lightning',
    icon: 'spell_nature_chainlightning',
    damage: (734 + 839) / 2,
    castTime: 1.5,
    coefficient: 0.641
  },
  shadowbolt: {
    name: 'Shadow Bolt',
    icon: 'spell_shadow_shadowbolt',
    damage: (541 + 604) / 2,
    castTime: 2.5,
    coefficient: 1.0571
  },
  crusaderstrike: {
    name: 'Crusader Strike',
    icon: 'spell_holy_crusaderstrike'
  },
  sealofblood: {
    name: 'Seal of Blood',
    icon: 'spell_holy_sealofblood'
  },
  sealofcommand: {
    name: 'Seal of Command',
    icon: 'ability_warrior_innerrage'
  },
  judgement: {
    name: 'Judgement',
    icon: 'spell_holy_righteousfury'
  },
  starfire: {
    name: 'Starfire',
    icon: 'spell_arcane_starfire',
    damage: (550 + 647) / 2,
    coefficient: 3.5 / 3.5 + 0.2,
    castTime: 3
  },
  moonfire: {
    name: 'Moonfire',
    icon: 'spell_nature_starfall',
    damage: (305 + 357) / 2,
    coefficient: 0.15,
    castTime: 1.5,
    dot: {
      damage: 600,
      duration: 12,
      coefficient: 0.57
    }
  },
  shred: {
    name: 'Shred',
    icon: 'spell_shadow_vampiricaura'
  },
  mangle: {
    name: 'Mangle',
    icon: 'ability_druid_mangle2'
  },
  rip: {
    name: 'Rip',
    icon: 'ability_ghoulfrenzy'
  },
  steadyshot: {
    name: 'Steady Shot',
    icon: 'ability_hunter_steadyshot'
  },
  mutilate: {
    name: 'Mutilate',
    icon: 'ability_rogue_shadowstrikes'
  },
  windfury: {
    name: 'Windfury Weapon',
    icon: 'spell_nature_cyclone'
  },
  earthshock: {
    name: 'Earth Shock',
    icon: 'spell_nature_earthshock',
    damage: (658 + 693) / 2,
    coefficient: 1.5 / 3.5
  },
  stormstrike: {
    name: 'Storm Strike',
    icon: 'ability_shaman_stormstrike'
  }
}
