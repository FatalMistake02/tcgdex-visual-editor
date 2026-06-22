import { Serie, Set, Card, Database } from '../types'

// Default enum values (will be overridden by interfaces.d.ts if available)
let variantTypes = ['normal', 'holo', 'reverse', 'metal', 'lenticular']
let variantStamps = [
  '1st-edition', 'w-promo', 'pre-release', 'pokemon-center', 'set-logo', 'staff', 'pikachu-tail',
  'wotc', 'd-edition-error', '1st-edition-scratch-error', "1st-edition-error", '1st-movie', '1st-movie-inverted',
  'pokemon-4-ever', 'pokemon-center-ny', "winner", '25th-celebration', 'chris-fulop', 'tsuguyoshi-yamato',
  'reed-weichler', 'kevin-nguyen', 'professor-program', 'takashi-yoneda', 'michael-gonzalez', 'curran-hill',
  'jeremy-maron', 'jimmy-ballard', 'miska-saari', 'hiroki-yano', 'jason-klaczynski', 'state-championships',
  'national-championships', 'gym-challenge', 'city-championships', 'jeremy-scharff-kim', 'destiny-deoxys',
  'pokemon-day', 'regional-championships', 'international-championships', 'stadium-challenge', '10th-anniversary', 'wizard-world-philadelphia',
  'wizard-world-chicago', 'comic-con', 'nintendo-world', 'gen-con', 'akira-miyazaki', 'tom-roos',
  'pokemon-rocks-america', 'jun-hasebe', 'origins', 'games-expo', 'kraze-club', 'dylan-lefavour',
  'tristan-robinson', 'paul-atanassov', 'david-cohen', 'tsubasa-nakamura', 'worlds-2007', 'finalist',
  'quarter-finalist', 'semi-finalist', 'top-sixteen', 'top-thirty-two', 'worlds-2008', 'worlds-2009',
  'countdown-calendar', 'michael-pramawat', 'distributor-meeting', 'mychael-bryan', "stephen-silvestro",
  'yuka-furusawa', 'jason-martinez', 'yuta-komatsuda', 'origins-2008', 'platinum', 'worlds-2010',
  'ross-cawthorn', 'gustavo-wada', 'christopher-kan', 'player-rewards-program', 'igor-costa',
  'zachary-bokhari', 'shuto-itagaki', 'snowflake', 'trick-or-trade', 'horizons', 'gamestop', 'eb-games',
  'illustration-contest-2024', 'worlds-2025', 'top-eight', "champion", "master-ball-league", "ultra-ball-league", "judge", "asia-promo",
  "international-championship-europe", "international-championship-latin-america", "international-championship-north-america", 'ace-trainer',
  'pikachu', 'bulbasaur', 'squirtle', 'charmander', 'pokeball', '30th-pokeday', 'mcdonalds', 'pokemon-together', 'rain-city', 'tournament-collection',
  'worlds-2024', 'worlds-2023', 'asia-2023-24'
]
let subtypes = ['shadowless', 'unlimited', '1999-2000-copyright', 'missing-expansion-symbol', 'gold-border',
  'missing-hp', 'aoki-error', '1999-copyright', 'evolution-box-error', 'no-holo-error', 'd-ink-dot-error',
  'energy-symbol-error', 'text-error', 'shifted-energy-cost', 'japanese-back', 'no-e-reader', 'rarity-error',
  'cosmos', 'blue-border']
let foilTypes = [
  'pokeball', 'greatball', 'ultraball', 'masterball', 'gold', 'cosmos', 'galaxy', 'starlight', 'energy', 'cracked-ice',
  'mirror', 'league', 'player-reward', 'professor-program', 'tinsel', 'loveball', 'friendball', 'quickball', 'team-rocket', 'duskball', 'rainbow'
]
let sizes = ['standard', 'jumbo']

export function parseInterfacesFile(content: string): void {
  const variantTypeMatch = content.match(/export type VariantType\s*=\s*([^;]+)/)
  if (variantTypeMatch) {
    const typeStr = variantTypeMatch[1]
    const values = typeStr.match(/'([^']+)'/g)
    if (values) {
      variantTypes = values.map(v => v.replace(/'/g, ''))
    }
  }

  const variantStampsMatch = content.match(/export type VariantStamps\s*=\s*([^;]+)/)
  if (variantStampsMatch) {
    const typeStr = variantStampsMatch[1]
    const values = typeStr.match(/'([^']+)'/g)
    if (values) {
      variantStamps = values.map(v => v.replace(/'/g, ''))
    }
  }

  const subtypeMatch = content.match(/subtype\?:\s*([^;]+)/)
  if (subtypeMatch) {
    const typeStr = subtypeMatch[1]
    const values = typeStr.match(/'([^']+)'/g)
    if (values) {
      subtypes = values.map(v => v.replace(/'/g, ''))
    }
  }

  const foilMatch = content.match(/foil\?:\s*([^;]+)/)
  if (foilMatch) {
    const typeStr = foilMatch[1]
    const values = typeStr.match(/'([^']+)'/g)
    if (values) {
      foilTypes = values.map(v => v.replace(/'/g, ''))
    }
  }

  const sizeMatch = content.match(/size\?:\s*'([^']+)'\s*\|\s*'([^']+)'/)
  if (sizeMatch) {
    sizes = [sizeMatch[1], sizeMatch[2]]
  }
}

export const VARIANT_TYPES = variantTypes as readonly string[]
export const VARIANT_STAMPS = variantStamps as readonly string[]
export const SUBTYPES = subtypes as readonly string[]
export const FOIL_TYPES = foilTypes as readonly string[]
export const SIZES = sizes as readonly string[]

export function parseSerieFile(content: string): Serie | null {
  try {
    const match = content.match(/const\s+\w+:\s*Serie\s*=\s*({[\s\S]*?})\s*;?\s*export default/)
    if (!match) return null

    const objStr = match[1]
    const cleanedObjStr = objStr.replace(/,\s*energies:\s*\[[\s\S]*?\]/, '')
    return eval(`(${cleanedObjStr})`)
  } catch (e) {
    console.error('Error parsing serie file:', e)
    return null
  }
}

export function parseSetFile(content: string, seriesMap: Map<string, Serie>): Set | null {
  try {
    const importMatch = content.match(/import\s+\w+\s+from\s+['"]\.\.?\/(.+)['"]/)
    if (!importMatch) return null
    
    const serieName = importMatch[1]
    let serie = seriesMap.get(serieName)
    if (!serie) {
      for (const [id, s] of seriesMap.entries()) {
        if (s.name.en === serieName || s.name.fr === serieName || id === serieName) {
          serie = s
          break
        }
      }
    }
    
    if (!serie) return null
    
    const match = content.match(/const\s+\w+:\s*Set\s*=\s*({[\s\S]*?})\s*;?\s*export default/)
    if (!match) return null

    const setData = eval(`(${match[1]})`)
    setData.serie = serie
    return setData
  } catch (e) {
    console.error('Error parsing set file:', e)
    return null
  }
}

export function parseCardFile(content: string, setsMap: Map<string, Set>): Card | null {
  try {
    const importMatch = content.match(/import\s+\w+\s+from\s+['"]\.\.?\/(.+)['"]/)
    if (!importMatch) return null
    
    const setName = importMatch[1]
    let set = setsMap.get(setName)
    if (!set) {
      for (const [id, s] of setsMap.entries()) {
        if (s.name.en === setName || s.name.fr === setName || id === setName) {
          set = s
          break
        }
      }
    }
    
    if (!set) return null
    
    const match = content.match(/const\s+\w+:\s*Card\s*=\s*({[\s\S]*?})\s*;?\s*export default/)
    if (!match) return null

    const cardData = eval(`(${match[1]})`)
    cardData.set = set
    return cardData
  } catch (e) {
    console.error('Error parsing card file:', e)
    return null
  }
}

export function generateSerieFile(serie: Serie, originalContent?: string, originalSerie?: Serie): string {
  if (!originalContent || !originalSerie) {
    const energiesStr = serie.energies 
      ? `\n\n\tenergies: [\n\t\t"${serie.energies.join('", "')}"\n\t]`
      : ''
    
    const nameStr = generateLanguagesObject(serie.name, '\t')
    
    return `import { Serie } from '../interfaces'

const serie: Serie = {
\tid: "${serie.id}",
\tname: {${nameStr}
\t},${energiesStr}
}

export default serie
`
  }
  
  let content = originalContent
  if (originalSerie.id !== serie.id) {
    content = content.replace(/(id:\s*)"([^"]+)"/, `$1"${serie.id}"`)
  }
  if (!deepCompare(originalSerie.name, serie.name)) {
    const nameStr = generateLanguagesObject(serie.name, '\t')
    const nameMatch = content.match(/name:\s*\{[\s\S]*?\n\t\}/)
    if (nameMatch) {
      content = content.replace(nameMatch[0], `name: {${nameStr}\n\t}`)
    }
  }
  if (!deepCompare(originalSerie.energies, serie.energies)) {
    if (serie.energies) {
      const energiesStr = `\n\n\tenergies: [\n\t\t"${serie.energies.join('", "')}"\n\t]`
      const energiesMatch = content.match(/energies:\s*\[[\s\S]*?\n\t\]/)
      if (energiesMatch) {
        content = content.replace(energiesMatch[0], energiesStr)
      } else {
        content = content.replace(/(\n\t}\n\n)/, `${energiesStr}$1`)
      }
    } else {
      content = content.replace(/,\n\n\tenergies:\s*\[[\s\S]*?\n\t\]/, '')
    }
  }
  return content
}

export function generateSetFile(set: Set, originalContent?: string, originalSet?: Set): string {
  if (!originalContent || !originalSet) {
    const abbreviationsStr = set.abbreviations 
      ? `\n\n\tabbreviations: ${generateObjectString(set.abbreviations, '\t\t')},`
      : ''
    const boostersStr = set.boosters
      ? `\n\n\tboosters: ${generateObjectString(set.boosters, '\t\t')},`
      : ''
    const thirdPartyStr = set.thirdParty
      ? `\n\n\tthirdParty: ${generateObjectString(set.thirdParty, '\t\t')}`
      : ''
    const nameStr = generateLanguagesObject(set.name, '\t')
    const releaseDateStr = typeof set.releaseDate === 'string'
      ? `"${set.releaseDate}"`
      : generateLanguagesObject(set.releaseDate, '\t\t', true)
    
    return `import { Set } from '../../interfaces'
import serie from '../${set.serie.name.en || set.serie.id}'

const set: Set = {
\tid: "${set.id}",

\tname: {${nameStr}
\t},

\tserie: serie,

\tcardCount: {
\t\tofficial: ${set.cardCount.official}
\t},

\treleaseDate: ${releaseDateStr},${abbreviationsStr}${boostersStr}${thirdPartyStr}
}

export default set
`
  }
  
  let content = originalContent
  if (originalSet.id !== set.id) {
    content = content.replace(/(id:\s*)"([^"]+)"/, `$1"${set.id}"`)
  }
  if (!deepCompare(originalSet.name, set.name)) {
    const nameStr = generateLanguagesObject(set.name, '\t')
    const nameMatch = content.match(/name:\s*\{[\s\S]*?\n\t\}/)
    if (nameMatch) {
      content = content.replace(nameMatch[0], `name: {${nameStr}\n\t}`)
    }
  }
  if (!deepCompare(originalSet.cardCount, set.cardCount)) {
    content = content.replace(/(cardCount:\s*\{\s*official:\s*)\d+/, `$1${set.cardCount.official}`)
  }
  if (!deepCompare(originalSet.releaseDate, set.releaseDate)) {
    const releaseDateStr = typeof set.releaseDate === 'string'
      ? `"${set.releaseDate}"`
      : generateLanguagesObject(set.releaseDate, '\t\t', true)
    const releaseDateMatch = content.match(/releaseDate:\s*[^,\n]+/)
    if (releaseDateMatch) {
      content = content.replace(releaseDateMatch[0], `releaseDate: ${releaseDateStr}`)
    }
  }
  if (!deepCompare(originalSet.abbreviations, set.abbreviations)) {
    if (set.abbreviations) {
      const abbreviationsStr = `\n\n\tabbreviations: ${generateObjectString(set.abbreviations, '\t\t')},`
      const abbreviationsMatch = content.match(/abbreviations:\s*\{[\s\S]*?\n\t\}/)
      if (abbreviationsMatch) {
        content = content.replace(abbreviationsMatch[0], abbreviationsStr.trim())
      } else {
        content = content.replace(/(\n\t}\n\n)/, `${abbreviationsStr}$1`)
      }
    } else {
      content = content.replace(/,\n\n\tabbreviations:\s*\{[\s\S]*?\n\t\}/, '')
    }
  }
  if (!deepCompare(originalSet.boosters, set.boosters)) {
    if (set.boosters) {
      const boostersStr = `\n\n\tboosters: ${generateObjectString(set.boosters, '\t\t')},`
      const boostersMatch = content.match(/boosters:\s*\{[\s\S]*?\n\t\}/)
      if (boostersMatch) {
        content = content.replace(boostersMatch[0], boostersStr.trim())
      } else {
        content = content.replace(/(\n\t}\n\n)/, `${boostersStr}$1`)
      }
    } else {
      content = content.replace(/,\n\n\tboosters:\s*\{[\s\S]*?\n\t\}/, '')
    }
  }
  if (!deepCompare(originalSet.thirdParty, set.thirdParty)) {
    if (set.thirdParty) {
      const thirdPartyStr = `\n\n\tthirdParty: ${generateObjectString(set.thirdParty, '\t\t')}`
      const thirdPartyMatch = content.match(/thirdParty:\s*\{[\s\S]*?\n\t\}/)
      if (thirdPartyMatch) {
        content = content.replace(thirdPartyMatch[0], thirdPartyStr.trim())
      } else {
        content = content.replace(/(\n\t}\n)/, `${thirdPartyStr}$1`)
      }
    } else {
      content = content.replace(/,\n\n\tthirdParty:\s*\{[\s\S]*?\n\t\}/, '')
    }
  }
  return content
}

export function generateCardFile(card: Card, originalContent?: string, originalCard?: Card): string {
  if (!originalContent || !originalCard) {
    let parts: string[] = []
    parts.push(`import { Card } from "../../../interfaces"`)
    parts.push(`import Set from "../${card.set.name.en || card.set.id}"`)
    parts.push('')
    parts.push('const card: Card = {')
    if (card.dexId) parts.push(`\tdexId: [${card.dexId.map(id => `"${id}"`).join(', ')}],`)
    parts.push(`\tset: Set,`)
    parts.push('')
    parts.push(`\tname: ${generateLanguagesObject(card.name, '\t')},`)
    parts.push('')
    if (card.illustrator) parts.push(`\tillustrator: "${card.illustrator}",`)
    parts.push(`\trarity: "${card.rarity}",`)
    parts.push(`\tcategory: "${card.category}",`)
    if (card.category === 'Pokemon') {
      if (card.hp) parts.push(`\thp: ${card.hp},`)
      if (card.types) parts.push(`\ttypes: ["${card.types.join('", "')}"],`)
      if (card.stage) parts.push(`\tstage: "${card.stage}",`)
      if (card.evolveFrom) parts.push(`\tevolveFrom: ${generateLanguagesObject(card.evolveFrom, '\t')},`)
      if (card.level) parts.push(`\tlevel: ${typeof card.level === 'string' ? `"${card.level}"` : card.level},`)
      if (card.dexId) parts.push(`\tdexId: [${card.dexId.map(id => `"${id}"`).join(', ')}],`)
    }
    if (card.attacks && card.attacks.length > 0) {
      parts.push('')
      parts.push('\tattacks: [')
      card.attacks.forEach(attack => {
        parts.push('\t\t{')
        if (attack.cost) parts.push(`\t\t\tcost: ["${attack.cost.join('", "')}"],`)
        parts.push(`\t\t\tname: ${generateLanguagesObject(attack.name, '\t\t\t')},`)
        if (attack.effect) parts.push(`\t\t\teffect: ${generateLanguagesObject(attack.effect, '\t\t\t')},`)
        if (attack.damage !== undefined) {
          parts.push(`\t\t\tdamage: ${typeof attack.damage === 'number' ? attack.damage : `"${attack.damage}"`}`)
        }
        parts.push('\t\t},')
      })
      parts.push('\t],')
    }
    if (card.weaknesses && card.weaknesses.length > 0) {
      parts.push('')
      parts.push('\tweaknesses: [')
      card.weaknesses.forEach(w => {
        parts.push('\t\t{')
        parts.push(`\t\t\ttype: "${w.type}",`)
        if (w.value) parts.push(`\t\t\tvalue: "${w.value}",`)
        parts.push('\t\t},')
      })
      parts.push('\t],')
    }
    if (card.resistances && card.resistances.length > 0) {
      parts.push('')
      parts.push('\tresistances: [')
      card.resistances.forEach(r => {
        parts.push('\t\t{')
        parts.push(`\t\t\ttype: "${r.type}",`)
        if (r.value) parts.push(`\t\t\tvalue: "${r.value}",`)
        parts.push('\t\t},')
      })
      parts.push('\t],')
    }
    if (card.retreat !== undefined) parts.push(`\tretreat: ${card.retreat},`)
    if (card.regulationMark) parts.push(`\tregulationMark: "${card.regulationMark}",`)
    if (card.description) parts.push(`\tdescription: ${generateLanguagesObject(card.description, '\t')},`)
    if (card.variants && Array.isArray(card.variants)) {
      parts.push('')
      parts.push('\tvariants: [')
      card.variants.forEach(v => {
        parts.push('\t\t{')
          parts.push(`\t\t\ttype: "${v.type}",`)
        if (v.subtype) parts.push(`\t\t\tsubtype: "${v.subtype}",`)
        if (v.size) parts.push(`\t\t\tsize: "${v.size}",`)
        if (v.stamp && v.stamp.length > 0) parts.push(`\t\t\tstamp: ["${v.stamp.join('", "')}"],`)
        if (v.foil) parts.push(`\t\t\tfoil: "${v.foil}",`)
        if (v.languages && v.languages.length > 0) parts.push(`\t\t\tlanguages: ["${v.languages.join('", "')}"],`)
        if (v.thirdParty) parts.push(`\t\t\tthirdParty: ${generateObjectString(v.thirdParty, '\t\t\t\t')}`)
        parts.push('\t\t},')
      })
      parts.push('\t],')
    }
    if (card.abilities && card.abilities.length > 0) {
      parts.push('')
      parts.push('\tabilities: [')
      card.abilities.forEach(a => {
        parts.push('\t\t{')
        parts.push(`\t\t\ttype: "${a.type}",`)
        parts.push(`\t\t\tname: ${generateLanguagesObject(a.name, '\t\t\t')},`)
        parts.push(`\t\t\teffect: ${generateLanguagesObject(a.effect, '\t\t\t')}`)
        parts.push('\t\t},')
      })
      parts.push('\t],')
    }
    if (card.effect) parts.push(`\teffect: ${generateLanguagesObject(card.effect, '\t')},`)
    if (card.trainerType) parts.push(`\ttrainerType: "${card.trainerType}",`)
    if (card.energyType) parts.push(`\tenergyType: "${card.energyType}",`)
    if (card.thirdParty) parts.push(`\tthirdParty: ${generateObjectString(card.thirdParty, '\t\t')}`)
    parts.push('')
    parts.push('}')
    parts.push('')
    parts.push('export default card')
    return parts.join('\n')
  }
  
  let content = originalContent
  if (!deepCompare(originalCard.name, card.name)) {
    const nameStr = generateLanguagesObject(card.name, '\t')
    const nameMatch = content.match(/name:\s*\{[\s\S]*?\n\t\}/)
    if (nameMatch) content = content.replace(nameMatch[0], `name: {${nameStr}\n\t}`)
  }
  if (originalCard.illustrator !== card.illustrator) {
    if (card.illustrator) {
      const illustratorMatch = content.match(/illustrator:\s*"[^"]*"/)
      if (illustratorMatch) content = content.replace(illustratorMatch[0], `illustrator: "${card.illustrator}"`)
      else content = content.replace(/(name:\s*\{[\s\S]*?\n\t\},)/, `$1\n\tillustrator: "${card.illustrator}",`)
    } else {
      content = content.replace(/\n\tillustrator:\s*"[^"]*",/, '')
    }
  }
  if (originalCard.rarity !== card.rarity) {
    content = content.replace(/(rarity:\s*)"[^"]+"/, `$1"${card.rarity}"`)
  }
  if (originalCard.category !== card.category) {
    content = content.replace(/(category:\s*)"[^"]+"/, `$1"${card.category}"`)
  }
  if (originalCard.hp !== card.hp) {
    if (card.hp) {
      const hpMatch = content.match(/hp:\s*\d+/)
      if (hpMatch) content = content.replace(hpMatch[0], `hp: ${card.hp}`)
      else content = content.replace(/(category:\s*"[^"]+",)/, `$1\n\thp: ${card.hp},`)
    } else {
      content = content.replace(/\n\thp:\s*\d+,/, '')
    }
  }
  if (!deepCompare(originalCard.types, card.types)) {
    if (card.types) {
      const typesStr = `["${card.types.join('", "')}"]`
      const typesMatch = content.match(/types:\s*\[[^\]]*\]/)
      if (typesMatch) content = content.replace(typesMatch[0], `types: ${typesStr}`)
    } else {
      content = content.replace(/\n\ttypes:\s*\[[^\]]*\],/, '')
    }
  }
  if (originalCard.stage !== card.stage) {
    if (card.stage) {
      const stageMatch = content.match(/stage:\s*"[^"]*"/)
      if (stageMatch) content = content.replace(stageMatch[0], `stage: "${card.stage}"`)
      else content = content.replace(/(types:\s*\[[^\]]*\],)/, `$1\n\tstage: "${card.stage}",`)
    } else {
      content = content.replace(/\n\tstage:\s*"[^"]*",/, '')
    }
  }
  if (originalCard.retreat !== card.retreat) {
    if (card.retreat !== undefined) {
      const retreatMatch = content.match(/retreat:\s*\d+/)
      if (retreatMatch) content = content.replace(retreatMatch[0], `retreat: ${card.retreat}`)
      else content = content.replace(/(}\n\nexport)/, `\tretreat: ${card.retreat},\n$1`)
    } else {
      content = content.replace(/\n\tretreat:\s*\d+,/, '')
    }
  }
  if (originalCard.regulationMark !== card.regulationMark) {
    if (card.regulationMark) {
      const regulationMatch = content.match(/regulationMark:\s*"[^"]*"/)
      if (regulationMatch) content = content.replace(regulationMatch[0], `regulationMark: "${card.regulationMark}"`)
      else content = content.replace(/(}\n\nexport)/, `\tregulationMark: "${card.regulationMark}",\n$1`)
    } else {
      content = content.replace(/\n\tregulationMark:\s*"[^"]*",/, '')
    }
  }
  if (!deepCompare(originalCard.description, card.description)) {
    if (card.description) {
      const descStr = generateLanguagesObject(card.description, '\t')
      const descMatch = content.match(/description:\s*\{[\s\S]*?\n\t\}/)
      if (descMatch) content = content.replace(descMatch[0], `description: {${descStr}\n\t}`)
    } else {
      content = content.replace(/\n\tdescription:\s*\{[\s\S]*?\n\t\},/, '')
    }
  }
  if (!deepCompare(originalCard.variants, card.variants)) {
    if (card.variants && card.variants.length > 0) {
      const variants = card.variants
      let variantsStr = '\tvariants: ['
      variants.forEach((v, index) => {
        variantsStr += '\n\t\t{'
        let fields: string[] = []
        fields.push(`\n\t\t\ttype: "${v.type}"`)
        if (v.subtype) fields.push(`\n\t\t\tsubtype: "${v.subtype}"`)
        if (v.size) fields.push(`\n\t\t\tsize: "${v.size}"`)
        if (v.stamp && v.stamp.length > 0) fields.push(`\n\t\t\tstamp: ["${v.stamp.join('", "')}"]`)
        if (v.foil) fields.push(`\n\t\t\tfoil: "${v.foil}"`)
        if (v.languages && v.languages.length > 0) fields.push(`\n\t\t\tlanguages: ["${v.languages.join('", "')}"]`)
        if (v.thirdParty) fields.push(`\n\t\t\tthirdParty: ${generateObjectString(v.thirdParty, '\t\t\t\t')}`)
        variantsStr += fields.join(',')
        variantsStr += '\n\t\t}'
        if (index < variants.length - 1) variantsStr += ','
      })
      variantsStr += '\n\t]'
      const variantsMatch = content.match(/variants:\s*\[[\s\S]*?\n\t\]/)
      if (variantsMatch) content = content.replace(variantsMatch[0], variantsStr)
    } else {
      content = content.replace(/,\n\tvariants:\s*\[[\s\S]*?\n\t\]/, '')
    }
  }
  // Handle thirdParty removal
  if (originalCard.thirdParty && !card.thirdParty) {
    // Try multiple patterns to match thirdParty field
    const patterns = [
      /\n\tthirdParty:\s*\{[\s\S]*?\n\t\},/,  // with trailing comma
      /\n\tthirdParty:\s*\{[\s\S]*?\n\t\}/,   // without trailing comma
      /\n\tthirdParty:\s*\{[\s\S]*?\}/,      // simpler pattern
    ]
    for (const pattern of patterns) {
      const match = content.match(pattern)
      if (match) {
        content = content.replace(match[0], '')
        break
      }
    }
  }
  return content
}

function generateLanguagesObject(obj: any, indent: string, isDate = false): string {
  const entries = Object.entries(obj).map(([key, value]) => {
    return `\n${indent}\t"${key}": "${value}"`
  })
  return entries.join(',') + '\n' + indent
}

function generateObjectString(obj: any, indent: string): string {
  const entries = Object.entries(obj).map(([key, value]) => {
    const formattedValue = typeof value === 'number' ? value : `"${value}"`
    return `\n${indent}"${key}": ${formattedValue}`
  })
  return '{' + entries.join(',') + '\n' + indent.slice(0, -1) + '}'
}

function deepCompare(obj1: any, obj2: any): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2)
}

function updateFieldInContent(content: string, fieldPath: string, newValue: string): string {
  const patterns = [
    new RegExp(`(${fieldPath}\\s*:\\s*)([^,\\n]+)`, 'g'),
    new RegExp(`(${fieldPath}\\s*:\\s*)([^,\\n]+)`, 'g'),
  ]
  let updated = content
  for (const pattern of patterns) {
    updated = updated.replace(pattern, `$1${newValue}`)
  }
  return updated
}

function formatValue(value: any): string {
  if (typeof value === 'number') return value.toString()
  if (typeof value === 'string') return `"${value}"`
  if (Array.isArray(value)) return `[${value.map(v => formatValue(v)).join(', ')}]`
  if (typeof value === 'object' && value !== null) return JSON.stringify(value)
  return String(value)
}
