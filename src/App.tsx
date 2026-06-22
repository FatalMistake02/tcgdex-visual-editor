import { useState } from 'react'
import { Database, Serie, Set, Card } from './types'
import { loadDatabase, loadSetsForSerie, loadCardsForSet } from './utils/fileLoader'
import { FolderOpen, Search, Edit, ChevronRight, Home } from 'lucide-react'
import SeriesList from './components/SeriesList'
import SetList from './components/SetList'
import CardList from './components/CardList'
import CardEditor from './components/CardEditor'
import SetEditor from './components/SetEditor'
import SerieEditor from './components/SerieEditor'

type View = 'home' | 'series' | 'set' | 'card' | 'edit-card' | 'edit-set' | 'edit-serie'

function App() {
  const [database, setDatabase] = useState<Database | null>(null)
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null)
  const [currentView, setCurrentView] = useState<View>('home')
  const [selectedSerie, setSelectedSerie] = useState<Serie | null>(null)
  const [selectedSet, setSelectedSet] = useState<Set | null>(null)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSelectDirectory = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const dirHandle = await (window as any).showDirectoryPicker()
      const db = await loadDatabase(dirHandle)
      setDirectoryHandle(dirHandle)
      setDatabase(db)
      setCurrentView('series')
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to load tcgdex repository')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSelectSerie = async (serie: Serie) => {
    setSelectedSerie(serie)
    if (database && directoryHandle) {
      await loadSetsForSerie(directoryHandle, serie, database)
    }
    setCurrentView('set')
  }

  const handleSelectSet = async (set: Set) => {
    setSelectedSet(set)
    if (selectedSerie && database && directoryHandle) {
      await loadCardsForSet(directoryHandle, selectedSerie, set, database)
    }
    setCurrentView('card')
  }

  const handleSelectCard = (card: Card) => {
    setSelectedCard(card)
    setCurrentView('edit-card')
  }

  const handleNextCard = () => {
    if (selectedSet && database && selectedCard) {
      const cards = database.cards.get(selectedSet.id) || []
      const currentCardNumber = (selectedCard as any).cardNumber
      const currentIndex = cards.findIndex(c => (c as any).cardNumber === currentCardNumber)
      if (currentIndex !== -1 && currentIndex < cards.length - 1) {
        setSelectedCard(cards[currentIndex + 1])
      }
    }
  }

  const handlePreviousCard = () => {
    if (selectedSet && database && selectedCard) {
      const cards = database.cards.get(selectedSet.id) || []
      const currentCardNumber = (selectedCard as any).cardNumber
      const currentIndex = cards.findIndex(c => (c as any).cardNumber === currentCardNumber)
      if (currentIndex > 0) {
        setSelectedCard(cards[currentIndex - 1])
      }
    }
  }

  const handleCreateCard = () => {
    if (selectedSet) {
      const newCard: Card = {
        set: selectedSet,
        name: { en: '' },
        rarity: 'Common',
        category: 'Pokemon'
      }
      setSelectedCard(newCard)
      setCurrentView('edit-card')
    }
  }

  const handleCreateSet = () => {
    if (selectedSerie) {
      const newSet: Set = {
        id: '',
        name: { en: '' },
        serie: selectedSerie,
        cardCount: { official: 0 },
        releaseDate: '2024-01-01'
      }
      setSelectedSet(newSet)
      setCurrentView('edit-set')
    }
  }

  const handleEditSet = () => {
    setCurrentView('edit-set')
  }

  const handleEditSerie = (serie: Serie) => {
    setSelectedSerie(serie)
    setCurrentView('edit-serie')
  }

  const handleCreateSerie = () => {
    const newSerie: Serie = {
      id: '',
      name: { en: '' }
    }
    setSelectedSerie(newSerie)
    setCurrentView('edit-serie')
  }

  const handleBack = () => {
    switch (currentView) {
      case 'card':
        setCurrentView('set')
        setSelectedSet(null)
        break
      case 'set':
        setCurrentView('series')
        setSelectedSerie(null)
        break
      case 'edit-card':
        setCurrentView('card')
        break
      case 'edit-set':
        setCurrentView('set')
        break
      case 'edit-serie':
        setCurrentView('series')
        break
      default:
        setCurrentView('home')
    }
  }

  const handleSaveCard = async (updatedCard: Card) => {
    if (selectedSet && database && directoryHandle) {
      const cardNumber = (updatedCard as any).cardNumber
      
      if (!cardNumber) {
        alert('Card number is required')
        return
      }
      
      const cards = database.cards.get(selectedSet.id) || []
      const isNew = !cards.some(c => (c as any).cardNumber === cardNumber)
      
      if (isNew) {
        cards.push(updatedCard)
        database.cards.set(selectedSet.id, cards)
        setSelectedCard(updatedCard)
      } else {
        const index = cards.findIndex(c => (c as any).cardNumber === cardNumber)
        if (index !== -1) {
          cards[index] = updatedCard
          database.cards.set(selectedSet.id, cards)
          setSelectedCard(updatedCard)
        }
      }
      
      // Save to file
      const serieName = selectedSet.serie.name.en || selectedSet.serie.id
      const setName = selectedSet.name.en || selectedSet.id
      const cardFileName = `${cardNumber}.ts`
      
      try {
        const { saveCard } = await import('./utils/fileLoader')
        await saveCard(directoryHandle, serieName, setName, updatedCard, cardFileName)
      } catch (err) {
        console.error('Error saving card:', err)
        alert('Failed to save card')
      }
    }
  }

  const handleSaveSet = async (updatedSet: Set) => {
    if (database && directoryHandle) {
      if (!updatedSet.id) {
        alert('Set ID is required')
        return
      }
      
      database.sets.set(updatedSet.id, updatedSet)
      setSelectedSet(updatedSet)
      
      // Save to file
      const serieName = updatedSet.serie.name.en || updatedSet.serie.id
      
      try {
        const { saveSet } = await import('./utils/fileLoader')
        await saveSet(directoryHandle, serieName, updatedSet)
      } catch (err) {
        console.error('Error saving set:', err)
        alert('Failed to save set')
      }
    }
  }

  const handleSaveSerie = async (updatedSerie: Serie) => {
    if (database && directoryHandle) {
      database.series.set(updatedSerie.id, updatedSerie)
      setSelectedSerie(updatedSerie)
      
      // Save to file
      try {
        const { saveSerie } = await import('./utils/fileLoader')
        await saveSerie(directoryHandle, updatedSerie)
      } catch (err) {
        console.error('Error saving series:', err)
        alert('Failed to save series')
      }
    }
  }

  const renderContent = () => {
    if (!database) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              TCG Card Database Editor
            </h1>
            <p className="text-slate-400 text-lg">
              Select your tcgdex repository directory to get started
            </p>
            <button
              onClick={handleSelectDirectory}
              disabled={loading}
              className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded-lg font-semibold transition-colors"
            >
              <FolderOpen size={24} />
              {loading ? 'Loading...' : 'Select tcgdex Repository'}
            </button>
            {error && (
              <div className="text-red-400 bg-red-900/20 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
          </div>
        </div>
      )
    }

    switch (currentView) {
      case 'series':
        return (
          <SeriesList
            database={database}
            searchQuery={searchQuery}
            onSelectSerie={handleSelectSerie}
            onSearchChange={setSearchQuery}
            onCreateSerie={handleCreateSerie}
            onEditSerie={handleEditSerie}
          />
        )
      case 'set':
        return selectedSerie ? (
          <SetList
            database={database}
            serie={selectedSerie}
            searchQuery={searchQuery}
            onSelectSet={handleSelectSet}
            onSearchChange={setSearchQuery}
            onBack={handleBack}
            onCreateSet={handleCreateSet}
          />
        ) : null
      case 'card':
        return selectedSet ? (
          <CardList
            database={database}
            set={selectedSet}
            searchQuery={searchQuery}
            onSelectCard={handleSelectCard}
            onSearchChange={setSearchQuery}
            onBack={handleBack}
            onEditSet={handleEditSet}
            onCreateCard={handleCreateCard}
          />
        ) : null
      case 'edit-card':
        return selectedCard && selectedSet ? (
          <CardEditor
            card={selectedCard}
            set={selectedSet}
            onSave={handleSaveCard}
            onBack={handleBack}
            onNext={handleNextCard}
            onPrevious={handlePreviousCard}
            isNew={!database.cards.get(selectedSet.id)?.some(c => (c as any).cardNumber === (selectedCard as any).cardNumber)}
          />
        ) : null
      case 'edit-set':
        return selectedSet && selectedSerie ? (
          <SetEditor
            set={selectedSet}
            serie={selectedSerie}
            onSave={handleSaveSet}
            onBack={handleBack}
            isNew={!database.sets.has(selectedSet.id)}
          />
        ) : null
      case 'edit-serie':
        return selectedSerie ? (
          <SerieEditor
            serie={selectedSerie}
            onSave={handleSaveSerie}
            onBack={handleBack}
          />
        ) : null
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {renderContent()}
    </div>
  )
}

export default App
