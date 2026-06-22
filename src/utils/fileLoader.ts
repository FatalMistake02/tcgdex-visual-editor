import { Serie, Set, Card, Database } from '../types'
// cspell:ignore Serie serie
import { parseSerieFile, parseSetFile, parseCardFile, parseInterfacesFile } from './parser'

async function loadSeriesFromDirectory(
  dataDir: FileSystemDirectoryHandle,
  database: Database,
  seriesNameToId: Map<string, string>,
  loadSetsAndCards: boolean = true
): Promise<void> {
  const entries: any[] = []
  
  // Try different iteration methods
  try {
    for await (const entry of dataDir) {
      entries.push(entry)
    }
  } catch (e) {
    console.log('for-await-of iteration failed:', e)
  }
  
  if (entries.length === 0) {
    try {
      const values = await (dataDir as any).values()
      for await (const entry of values) {
        entries.push(entry)
      }
    } catch (e) {
      console.log('values() iteration failed:', e)
    }
  }
  
  if (entries.length === 0) {
    try {
      const entryIterator = await (dataDir as any).entries()
      for await (const entry of entryIterator) {
        entries.push(entry)
      }
    } catch (e) {
      console.log('entries() iteration failed:', e)
    }
  }
  
  for (const entry of entries) {
    const [name, handle] = Array.isArray(entry) ? entry : [entry?.name, entry]
    if (handle?.kind === 'file' && name.endsWith('.ts')) {
      console.log(`Parsing series file: ${name}`)
      const file = await handle.getFile()
      const content = await file.text()
      const serie = parseSerieFile(content)
      if (serie) {
        console.log(`Successfully parsed series: ${serie.name.en || serie.name.fr} (${serie.id})`)
        database.series.set(serie.id, serie)
        const fileName = name.replace('.ts', '')
        seriesNameToId.set(fileName, serie.id)
        const seriesName = serie.name.en || serie.name.fr || ''
        if (seriesName) {
          seriesNameToId.set(seriesName, serie.id)
        }
      }
    }
  }
  
  // Load sets and cards for each series (only if requested)
  if (loadSetsAndCards) {
    for (const entry of entries) {
      const [name, handle] = Array.isArray(entry) ? entry : [entry?.name, entry]
      if (handle?.kind === 'directory') {
        const serieId = seriesNameToId.get(name)
        if (!serieId) continue
        
        const serie = database.series.get(serieId)
        if (!serie) continue
        
        await loadSetsFromDirectory(handle, database, seriesNameToId)
      }
    }
  }
}

async function loadSetsFromDirectory(
  serieDir: FileSystemDirectoryHandle,
  database: Database
  , seriesNameToId?: Map<string, string>
): Promise<void> {
  const setEntries: any[] = []
  
  try {
    for await (const entry of serieDir) {
      setEntries.push(entry)
    }
  } catch (e) {
    console.log('Set iteration failed:', e)
  }
  
  if (setEntries.length === 0) {
    try {
      const values = await (serieDir as any).values()
      for await (const entry of values) {
        setEntries.push(entry)
      }
    } catch (e) {
      console.log('values() for sets failed:', e)
    }
  }
  
  for (const setEntry of setEntries) {
    const [setName, setHandle] = Array.isArray(setEntry) ? setEntry : [setEntry?.name, setEntry]
    if (setHandle?.kind === 'file' && setName.endsWith('.ts')) {
      const file = await setHandle.getFile()
      const content = await file.text()
      const set = parseSetFile(content, database.series)
      if (set) {
        database.sets.set(set.id, set)
        
        // Load cards for this set
        try {
          const cardDir = await serieDir.getDirectoryHandle(setName.replace('.ts', ''))
          await loadCardsFromDirectory(cardDir, set, database)
        } catch (e) {
          console.log(`No card directory for set: ${setName}`)
        }
      }
    }
  }
}

async function loadCardsFromDirectory(
  cardDir: FileSystemDirectoryHandle,
  set: Set,
  database: Database
): Promise<void> {
  const cardEntries: any[] = []
  
  try {
    for await (const entry of cardDir) {
      cardEntries.push(entry)
    }
  } catch (e) {
    console.log('Card iteration failed:', e)
  }
  
  if (cardEntries.length === 0) {
    try {
      const values = await (cardDir as any).values()
      for await (const entry of values) {
        cardEntries.push(entry)
      }
    } catch (e) {
      console.log('values() for cards failed:', e)
    }
  }
  
  const cards: Card[] = []
  for (const cardEntry of cardEntries) {
    const [cardName, cardHandle] = Array.isArray(cardEntry) ? cardEntry : [cardEntry?.name, cardEntry]
    if (cardHandle?.kind === 'file' && cardName.endsWith('.ts')) {
      const file = await cardHandle.getFile()
      const content = await file.text()
      const card = parseCardFile(content, database.sets)
      if (card) {
        // Store the card number from the file name
        const cardNumber = cardName.replace('.ts', '')
        ;(card as any).cardNumber = cardNumber
        cards.push(card)
      }
    }
  }
  
  // Sort cards by number
  cards.sort((a, b) => {
    const numA = parseInt((a as any).cardNumber || '0')
    const numB = parseInt((b as any).cardNumber || '0')
    return numA - numB
  })
  
  database.cards.set(set.id, cards)
}

export async function loadDatabase(directoryHandle: FileSystemDirectoryHandle): Promise<Database> {
  const database: Database = {
    series: new Map(),
    sets: new Map(),
    cards: new Map()
  }

  try {
    // Load interfaces.d.ts from repo root
    console.log('Loading interfaces.d.ts...')
    try {
      const interfacesFile = await directoryHandle.getFileHandle('interfaces.d.ts')
      const interfacesFileObj = await interfacesFile.getFile()
      const interfacesContent = await interfacesFileObj.text()
      parseInterfacesFile(interfacesContent)
      console.log('Successfully loaded interfaces.d.ts')
    } catch (e) {
      console.log('Could not load interfaces.d.ts:', e)
      // Continue without interfaces - will use hardcoded values
    }

    // Load data directory
    console.log('Loading data directory...')
    let dataDirHandle: FileSystemDirectoryHandle | null = null
    try {
      dataDirHandle = await directoryHandle.getDirectoryHandle('data')
    } catch (e) {
      console.log('Could not find data directory:', e)
    }

    // Load data-asia directory
    console.log('Loading data-asia directory...')
    let dataAsiaDirHandle: FileSystemDirectoryHandle | null = null
    try {
      dataAsiaDirHandle = await directoryHandle.getDirectoryHandle('data-asia')
    } catch (e) {
      console.log('Could not find data-asia directory:', e)
    }

    // Load series from both data directories (lazy loading - only series initially)
    const dataDirs: FileSystemDirectoryHandle[] = []
    if (dataDirHandle) dataDirs.push(dataDirHandle)
    if (dataAsiaDirHandle) dataDirs.push(dataAsiaDirHandle)

    if (dataDirs.length === 0) {
      throw new Error('No data directory found (data or data-asia)')
    }

    // Load only series files initially
    const seriesNameToId = new Map<string, string>()
    console.log('Starting to load series files...')
    
    for (const dataDir of dataDirs) {
      await loadSeriesFromDirectory(dataDir, database, seriesNameToId, false)
    }
    console.log(`Loaded ${database.series.size} series total`)
    return database
  } catch (error) {
    console.error('Error loading database:', error)
    throw error
  }
}

export async function loadSetsForSerie(
  directoryHandle: FileSystemDirectoryHandle,
  serie: Serie,
  database: Database
): Promise<void> {
  console.log(`Loading sets for series: ${serie.name.en || serie.id}`)
  
  // Try data directory first, then data-asia
  let dataDir: FileSystemDirectoryHandle
  try {
    dataDir = await directoryHandle.getDirectoryHandle('data')
  } catch (e) {
    dataDir = await directoryHandle.getDirectoryHandle('data-asia')
  }
  
  const seriesNameToId = new Map<string, string>()
  const fileName = serie.name.en || serie.id
  seriesNameToId.set(fileName, serie.id)
  
  try {
    const serieDir = await dataDir.getDirectoryHandle(fileName)
    await loadSetsFromDirectory(serieDir, database, seriesNameToId)
    console.log(`Loaded sets for series: ${serie.name.en || serie.id}`)
  } catch (e) {
    console.log(`No sets found for series: ${fileName}`)
  }
}

export async function loadCardsForSet(
  directoryHandle: FileSystemDirectoryHandle,
  serie: Serie,
  set: Set,
  database: Database
): Promise<void> {
  console.log(`Loading cards for set: ${set.name.en || set.id}`)
  
  // Try data directory first, then data-asia
  let dataDir: FileSystemDirectoryHandle
  try {
    dataDir = await directoryHandle.getDirectoryHandle('data')
  } catch (e) {
    dataDir = await directoryHandle.getDirectoryHandle('data-asia')
  }
  
  const serieName = serie.name.en || serie.id
  const setName = set.name.en || set.id
  
  try {
    const serieDir = await dataDir.getDirectoryHandle(serieName)
    const setDir = await serieDir.getDirectoryHandle(setName)
    await loadCardsFromDirectory(setDir, set, database)
    console.log(`Loaded cards for set: ${set.name.en || set.id}`)
  } catch (e) {
    console.log(`No cards found for set: ${setName}`)
    database.cards.set(set.id, [])
  }
}

export async function saveSerie(directoryHandle: FileSystemDirectoryHandle, serie: Serie): Promise<void> {
  const { generateSerieFile, parseSerieFile } = await import('./parser')
  const fileName = `${serie.name.en || serie.id}.ts`
  
  try {
    // Try to save to data directory first, then data-asia
    let dataDir: FileSystemDirectoryHandle
    try {
      dataDir = await directoryHandle.getDirectoryHandle('data')
    } catch (e) {
      dataDir = await directoryHandle.getDirectoryHandle('data-asia')
    }
    
    const fileHandle = await dataDir.getFileHandle(fileName, { create: true })
    const file = await fileHandle.getFile()
    const originalContent = await file.text()
    const originalSerie = parseSerieFile(originalContent)
    
    // Check if anything changed
    if (JSON.stringify(originalSerie) === JSON.stringify(serie)) {
      console.log('No changes detected, skipping save')
      return
    }
    
    const content = generateSerieFile(serie, originalContent, originalSerie || undefined)
    const writable = await fileHandle.createWritable()
    await writable.write(content)
    await writable.close()
  } catch (error) {
    console.error('Error saving serie:', error)
    throw error
  }
}

export async function saveSet(directoryHandle: FileSystemDirectoryHandle, serieName: string, set: Set): Promise<void> {
  const { generateSetFile, parseSetFile } = await import('./parser')
  const fileName = `${set.name.en || set.id}.ts`
  
  try {
    // Try to save to data directory first, then data-asia
    let dataDir: FileSystemDirectoryHandle
    try {
      dataDir = await directoryHandle.getDirectoryHandle('data')
    } catch (e) {
      dataDir = await directoryHandle.getDirectoryHandle('data-asia')
    }
    
    const serieHandle = await dataDir.getDirectoryHandle(serieName)
    const fileHandle = await serieHandle.getFileHandle(fileName, { create: true })
    const file = await fileHandle.getFile()
    const originalContent = await file.text()
    const seriesMap = new Map([[set.serie.id, set.serie]])
    const originalSet = parseSetFile(originalContent, seriesMap)
    
    // Check if anything changed
    if (JSON.stringify(originalSet) === JSON.stringify(set)) {
      console.log('No changes detected, skipping save')
      return
    }
    
    const content = generateSetFile(set, originalContent, originalSet || undefined)
    const writable = await fileHandle.createWritable()
    await writable.write(content)
    await writable.close()
  } catch (error) {
    console.error('Error saving set:', error)
    throw error
  }
}

export async function saveCard(
  directoryHandle: FileSystemDirectoryHandle,
  serieName: string,
  setName: string,
  card: Card,
  cardFileName: string
): Promise<void> {
  const { generateCardFile, parseCardFile } = await import('./parser')
  
  try {
    // Try to save to data directory first, then data-asia
    let dataDir: FileSystemDirectoryHandle
    try {
      dataDir = await directoryHandle.getDirectoryHandle('data')
    } catch (e) {
      dataDir = await directoryHandle.getDirectoryHandle('data-asia')
    }
    
    const serieHandle = await dataDir.getDirectoryHandle(serieName)
    const setHandle = await serieHandle.getDirectoryHandle(setName)
    const fileHandle = await setHandle.getFileHandle(cardFileName, { create: true })
    const file = await fileHandle.getFile()
    const originalContent = await file.text()
    const setsMap = new Map([[card.set.id, card.set]])
    const originalCard = parseCardFile(originalContent, setsMap)
    
    // Check if anything changed
    if (originalCard && JSON.stringify(originalCard) === JSON.stringify(card)) {
      console.log('No changes detected, skipping save')
      return
    }
    
    const content = generateCardFile(card, originalContent, originalCard || undefined)
    const writable = await fileHandle.createWritable()
    await writable.write(content)
    await writable.close()
  } catch (error) {
    console.error('Error saving card:', error)
    throw error
  }
}
