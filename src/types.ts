export type SupportedLanguages =
  'en' | 'fr' | 'es' | 'es-mx' | 'it' | 'pt' | 'pt-br' | 'pt-pt' | 'de' | 'nl' | 'pl' | 'ru' |
  'ja' | 'ko' | 'zh-tw' | 'id' | 'th' | 'zh-cn'

export type Languages<T = string> = Partial<Record<SupportedLanguages, T>>

export interface Serie {
  id: string
  name: Languages
  energies?: Array<Types>
}

export type VariantType = 'normal' | 'holo' | 'reverse' | 'metal' | 'lenticular'
export type VariantStamps = '1st-edition' | 'w-promo' | 'pre-release' | 'pokemon-center' | 'set-logo' | 'staff' | 'pikachu-tail'
  | 'wotc' | 'd-edition-error' | '1st-edition-scratch-error' | "1st-edition-error" | '1st-movie' | '1st-movie-inverted'
  | 'pokemon-4-ever' | 'pokemon-center-ny' | "winner" | '25th-celebration' | 'chris-fulop' | 'tsuguyoshi-yamato'
  | 'reed-weichler' | 'kevin-nguyen' | 'professor-program' | 'takashi-yoneda' | 'michael-gonzalez' | 'curran-hill'
  | 'jeremy-maron' | 'jimmy-ballard' | 'miska-saari' | 'hiroki-yano' | 'jason-klaczynski' | 'state-championships'
  | 'national-championships' | 'gym-challenge' | 'city-championships' | 'jeremy-scharff-kim' | 'destiny-deoxys'
  | 'pokemon-day' | 'regional-championships' | 'international-championships' | 'stadium-challenge' | '10th-anniversary' | 'wizard-world-philadelphia'
  | 'wizard-world-chicago' | 'comic-con' | 'nintendo-world' | 'gen-con' | 'akira-miyazaki' | 'tom-roos'
  | 'pokemon-rocks-america' | 'jun-hasebe' | 'origins' | 'games-expo' | 'kraze-club' | 'dylan-lefavour'
  | 'tristan-robinson' | 'paul-atanassov' | 'david-cohen' | 'tsubasa-nakamura' | 'worlds-2007' | 'finalist'
  | 'quarter-finalist' | 'semi-finalist' | 'top-sixteen' | 'top-thirty-two' | 'worlds-2008' | 'worlds-2009'
  | 'countdown-calendar' | 'michael-pramawat' | 'distributor-meeting' | 'mychael-bryan' | "stephen-silvestro"
  | 'yuka-furusawa' | 'jason-martinez' | 'yuta-komatsuda' | 'origins-2008' | 'platinum' | 'worlds-2010'
  | 'ross-cawthorn' | 'gustavo-wada' | 'christopher-kan' | 'player-rewards-program' | 'igor-costa'
  | 'zachary-bokhari' | 'shuto-itagaki' | 'snowflake' | 'trick-or-trade' | 'horizons' | 'gamestop' | 'eb-games'
  | 'illustration-contest-2024' | 'worlds-2025' | 'top-eight' | "champion" | "master-ball-league" | "ultra-ball-league" | "judge" | "asia-promo"
  | "international-championship-europe" | "international-championship-latin-america" | "international-championship-north-america" | 'ace-trainer'
  | 'pikachu' | 'bulbasaur' | 'squirtle' | 'charmander' | 'pokeball' | '30th-pokeday' | 'mcdonalds' | 'pokemon-together' | 'rain-city' | 'tournament-collection'
  | 'worlds-2024' | 'worlds-2023' | 'asia-2023-24'

export interface variant_detailed {
  type: VariantType
  subtype?: 'shadowless' | 'unlimited' | '1999-2000-copyright' | 'missing-expansion-symbol' | 'gold-border'
    | 'missing-hp' | 'aoki-error' | '1999-copyright' | 'evolution-box-error' | 'no-holo-error' | 'd-ink-dot-error'
    | 'energy-symbol-error' | 'text-error' | 'shifted-energy-cost' | 'japanese-back' | 'no-e-reader' | 'rarity-error'
    | 'cosmos' | 'blue-border'
  size?: 'standard' | 'jumbo'
  stamp?: Array<VariantStamps>
  foil?: 'pokeball' | 'greatball' | 'ultraball' | 'masterball' | 'gold' | 'cosmos' | 'galaxy' | 'starlight' | 'energy' | 'cracked-ice'
    | 'mirror' | 'league' | 'player-reward' | 'professor-program' | 'tinsel' | 'loveball' | 'friendball' | 'quickball' | 'team-rocket' | 'duskball'
  languages?: SupportedLanguages[]
  thirdParty?: {
    tcgplayer?: number
    cardmarket?: number
    cardtrader?: number
  }
}

export type Types = 'Colorless' | 'Darkness' | 'Dragon' |
  'Fairy' | 'Fighting' | 'Fire' |
  'Grass' | 'Lightning' | 'Metal' |
  'Psychic' | 'Water'

type ISODate = `${number}-${number}-${number}`

export interface Set {
  id: string
  name: Languages
  abbreviations?: Partial<Omit<Languages, 'en'> & { official?: string }>
  serie: Serie
  tcgOnline?: string
  cardCount: {
    official: number
  }
  boosters?: Record<string, {
    name: Languages<string>
  }>
  releaseDate: ISODate | Languages<ISODate>
  thirdParty?: {
    cardmarket?: number
    tcgplayer?: number
    cardtrader?: number
  }
}

export interface Card {
  cardNumber?: string
  name: Languages
  illustrator?: string
  boosters?: Array<string>
  rarity: 'ACE SPEC Rare' | 'Amazing Rare' | 'Classic Collection' | 'Common' |
    'Double rare' | 'Full Art Trainer' | 'Holo Rare' | 'Holo Rare V' |
    'Holo Rare VMAX' | 'Holo Rare VSTAR' | 'Hyper rare' | 'Illustration rare' |
    'LEGEND' | 'None' | 'Radiant Rare' | 'Rare' | 'Rare Holo' | 'Rare Holo LV.X' |
    'Rare PRIME' | 'Secret Rare' | 'Shiny Ultra Rare' | 'Shiny rare' | 'Shiny rare V' |
    'Shiny rare VMAX' | 'Special illustration rare' | 'Ultra Rare' | 'Uncommon'
    | 'Black White Rare'
    | 'Mega Hyper Rare'
    | 'One Diamond' | 'Two Diamond' | 'Three Diamond' | 'Four Diamond' | 'One Star' | 'Two Star' | 'Three Star' | 'Crown' | 'One Shiny' | 'Two Shiny'
    | 'Promo'
  category: 'Pokemon' | 'Trainer' | 'Energy'
  variants?: Array<variant_detailed>
  set: Set
  regulationMark?: string
  dexId?: Array<number>
  hp?: number
  types?: Array<Types>
  evolveFrom?: Languages
  weight?: string
  description?: Languages
  level?: number | string
  stage?: 'Basic' | 'BREAK' | 'LEVEL-UP' | 'MEGA' | 'RESTORED' | 'Stage1' | 'Stage2' | 'VMAX' | 'V-UNION' | 'Baby' | 'VSTAR'
  suffix?: 'EX' | 'GX' | 'V' | 'Legend' | 'Prime' | 'SP' | 'TAG TEAM-GX' | 'ex'
  item?: {
    name: Languages
    effect: Languages
  }
  abilities?: Array<{
    type: 'Pokemon Power' | 'Poke-BODY' | 'Poke-POWER' | 'Ability' | 'Ancient Trait'
    name: Languages
    effect: Languages
  }>
  attacks?: Array<{
    cost?: Array<Types>
    name: Languages
    effect?: Languages
    damage?: string | number
  }>
  weaknesses?: Array<{
    type: Types
    value?: string
  }>
  resistances?: Array<{
    type: Types
    value?: string
  }>
  retreat?: number
  effect?: Languages
  trainerType?: 'Supporter' | 'Item' | 'Stadium' | 'Tool' | 'Ace Spec' | 'Technical Machine' | 'Goldenrod Game Corner' | 'Rocket\'s Secret Machine'
  energyType?: 'Normal' | 'Special'
  thirdParty?: {
    tcgplayer?: number
    cardmarket?: number
    cardtrader?: number
  }
}

export interface Database {
  series: Map<string, Serie>
  sets: Map<string, Set>
  cards: Map<string, Card[]>
}
