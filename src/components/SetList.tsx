import { Database, Serie, Set } from '../types'
import { ChevronRight, ArrowLeft, Edit, Plus } from 'lucide-react'

interface SetListProps {
  database: Database
  serie: Serie
  searchQuery: string
  onSelectSet: (set: Set) => void
  onSearchChange: (query: string) => void
  onBack: () => void
  onCreateSet: () => void
}

export default function SetList({ database, serie, searchQuery, onSelectSet, onSearchChange, onBack, onCreateSet }: SetListProps) {
  const filteredSets = Array.from(database.sets.values()).filter(set => {
    return set.serie.id === serie.id && (
      (set.name.en || set.name.fr || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
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
            <h1 className="text-sm font-bold text-white">{serie.name.en || serie.name.fr}</h1>
            <p className="text-xs text-slate-500">Sets</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onCreateSet}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all text-sm shadow-lg shadow-indigo-500/20"
          >
            <Plus size={16} />
            New Set
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search sets..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-4 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full max-w-md text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSets.map((set) => (
              <button
                key={set.id}
                onClick={() => onSelectSet(set)}
                className="bg-slate-800 hover:bg-slate-700 p-6 rounded-lg text-left transition-colors border border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-1 text-white">{set.name.en || set.name.fr}</h2>
                    <p className="text-slate-400 text-sm">ID: {set.id}</p>
                    <p className="text-slate-400 text-sm">Cards: {set.cardCount?.official ?? 0}</p>
                    {set.releaseDate && (
                      <p className="text-slate-400 text-sm">
                        Released: {typeof set.releaseDate === 'string' ? set.releaseDate : (set.releaseDate as any)?.en || ''}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="text-slate-400" />
                </div>
              </button>
            ))}
          </div>

          {filteredSets.length === 0 && (
            <div className="text-center text-slate-400 py-12">
              No sets found matching "{searchQuery}"
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
