import { Database, Serie } from '../types'
import { ChevronRight, Plus, Edit, Search } from 'lucide-react'

interface SeriesListProps {
  database: Database
  searchQuery: string
  onSelectSerie: (serie: Serie) => void
  onSearchChange: (query: string) => void
  onCreateSerie: () => void
  onEditSerie: (serie: Serie) => void
}

export default function SeriesList({ database, searchQuery, onSelectSerie, onSearchChange, onCreateSerie, onEditSerie }: SeriesListProps) {
  const filteredSeries = Array.from(database.series.values()).filter(serie => {
    const name = serie.name.en || serie.name.fr || ''
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           serie.id.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="h-screen bg-slate-950 text-slate-200 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-16 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md z-10">
        <h1 className="text-lg font-bold text-white">Series</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={onCreateSerie}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all text-sm shadow-lg shadow-indigo-500/20"
          >
            <Plus size={16} />
            New Series
          </button>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search series..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 text-sm"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSeries.map((serie) => (
              <div
                key={serie.id}
                className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-white mb-1">{serie.name.en || serie.name.fr}</h2>
                    <p className="text-slate-500 text-xs">ID: {serie.id}</p>
                  </div>
                  <button
                    onClick={() => onEditSerie(serie)}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                    title="Edit series"
                  >
                    <Edit size={16} />
                  </button>
                </div>
                {serie.energies && (
                  <div className="mb-4">
                    <p className="text-slate-500 text-xs mb-2">Energies</p>
                    <div className="flex flex-wrap gap-2">
                      {serie.energies.map((energy, idx) => (
                        <span key={idx} className="px-2 py-1 bg-slate-800 rounded-md text-xs text-slate-300">
                          {energy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => onSelectSerie(serie)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors text-sm font-medium"
                >
                  View Sets
                  <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>

          {filteredSeries.length === 0 && (
            <div className="text-center text-slate-500 py-16">
              <p className="text-lg">No series found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
