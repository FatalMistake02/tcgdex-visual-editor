import { Database, Set, Card } from '../types'
import { ArrowLeft, Edit, Settings, Plus } from 'lucide-react'

interface CardListProps {
  database: Database
  set: Set
  searchQuery: string
  onSelectCard: (card: Card) => void
  onSearchChange: (query: string) => void
  onBack: () => void
  onEditSet: () => void
  onCreateCard: () => void
}

export default function CardList({ database, set, searchQuery, onSelectCard, onSearchChange, onBack, onEditSet, onCreateCard }: CardListProps) {
  const cards = database.cards.get(set.id) || []
  
  const filteredCards = cards.filter(card => {
    const name = card.name.en || card.name.fr || ''
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="h-screen bg-slate-950 text-slate-200 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-16 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors border border-slate-700">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-white">{set.name.en || set.name.fr}</h1>
            <p className="text-xs text-slate-500">Cards ({filteredCards.length})</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onCreateCard}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all text-sm shadow-lg shadow-indigo-500/20"
          >
            <Plus size={16} />
            New Card
          </button>
          <button
            onClick={onEditSet}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all text-sm"
          >
            <Settings size={16} />
            Edit Set
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-4 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full max-w-md text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCards.map((card) => {
              const cardNumber = (card as any).cardNumber
              const serieId = card.set.serie.id
              const setId = card.set.id
              const imageUrl = `https://assets.tcgdex.net/en/${serieId}/${setId}/${cardNumber}/low.webp`
              
              return (
                <button
                  key={`${card.name.en}-${cardNumber}`}
                  onClick={() => onSelectCard(card)}
                  className="bg-slate-800 hover:bg-slate-700 p-4 rounded-lg text-left transition-colors border border-slate-700"
                >
                  <div className="aspect-[2/3] mb-3 bg-slate-900 rounded-lg overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={card.name.en || card.name.fr}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg text-white">{card.name.en || card.name.fr}</h3>
                    <Edit size={16} className="text-slate-400 flex-shrink-0 ml-2" />
                  </div>
                  <div className="space-y-1 text-sm text-slate-400">
                    <p>#{cardNumber}</p>
                    <p>Category: {card.category}</p>
                    <p>Rarity: {card.rarity}</p>
                    {card.category === 'Pokemon' && (
                      <>
                        {card.hp && <p>HP: {card.hp}</p>}
                        {card.types && <p>Type: {card.types.join(', ')}</p>}
                      </>
                    )}
                    {card.illustrator && <p>Illustrator: {card.illustrator}</p>}
                  </div>
                </button>
              )
            })}
          </div>

          {filteredCards.length === 0 && (
            <div className="text-center text-slate-500 py-12">
              No cards found matching "{searchQuery}"
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
