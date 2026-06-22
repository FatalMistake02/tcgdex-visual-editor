import { useState, useEffect } from 'react'
import { Serie, SupportedLanguages, Types } from '../types'
import { ArrowLeft, Plus, Trash2, Layout } from 'lucide-react'

interface SerieEditorProps {
  serie: Serie
  onSave: (serie: Serie) => void
  onBack: () => void
}

export default function SerieEditor({ serie, onSave, onBack }: SerieEditorProps) {
  const [editedSerie, setEditedSerie] = useState<Serie>({ ...serie })
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguages>('en')

  // Autosave with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSave(editedSerie)
    }, 2000) // Save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId)
  }, [editedSerie, onSave])

  const updateName = (lang: SupportedLanguages, value: string) => {
    setEditedSerie({
      ...editedSerie,
      name: { ...editedSerie.name, [lang]: value }
    })
  }

  const addEnergy = () => {
    setEditedSerie({
      ...editedSerie,
      energies: [...(editedSerie.energies || []), 'Grass']
    })
  }

  const removeEnergy = (index: number) => {
    const newEnergies = editedSerie.energies?.filter((_, i) => i !== index) || []
    setEditedSerie({ ...editedSerie, energies: newEnergies })
  }

  const updateEnergy = (index: number, value: Types) => {
    const newEnergies = [...(editedSerie.energies || [])]
    newEnergies[index] = value
    setEditedSerie({ ...editedSerie, energies: newEnergies })
  }

  const types: Types[] = ['Colorless', 'Darkness', 'Dragon', 'Fairy', 'Fighting', 'Fire', 'Grass', 'Lightning', 'Metal', 'Psychic', 'Water']
  const languages: SupportedLanguages[] = ['en', 'fr', 'es', 'es-mx', 'it', 'pt', 'pt-br', 'pt-pt', 'de', 'nl', 'pl', 'ru', 'ja', 'ko', 'zh-tw', 'id', 'th', 'zh-cn']

  const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 ml-1">{label}</label>
      {children}
    </div>
  )

  return (
    <div className="h-screen bg-slate-950 text-slate-200 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-16 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors border border-slate-700">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-white">Series Editor</h1>
            <p className="text-xs text-slate-500">{editedSerie.name.en || editedSerie.name.fr}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Save button removed - autosave enabled */}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Series Metadata */}
        <aside className="w-80 border-r border-slate-800 bg-slate-900/30 overflow-y-auto p-6 space-y-6">
          <section>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Layout size={14} /> Basic Info
            </h2>
            <div className="space-y-4">
              <FormField label="Series ID">
                <input
                  type="text"
                  value={editedSerie.id}
                  onChange={(e) => setEditedSerie({ ...editedSerie, id: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-500"
                />
              </FormField>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Layout size={14} /> Energy Types
              </h2>
              <button
                onClick={addEnergy}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors text-xs font-semibold"
              >
                <Plus size={14} /> Add
              </button>
            </div>

            <div className="space-y-3">
              {editedSerie.energies?.map((energy, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select
                    value={energy}
                    onChange={(e) => updateEnergy(index, e.target.value as Types)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-500"
                  >
                    {types.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeEnergy(index)}
                    className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </aside>

        {/* RIGHT COLUMN: Names */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-950">
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                  <div className="w-1 h-4 bg-indigo-500 rounded-full" /> Series Names
                </h3>
                
                <div className="mb-6">
                  <FormField label="Language">
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value as SupportedLanguages)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-500"
                    >
                      {languages.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </FormField>
                </div>

                <FormField label={`Name (${selectedLanguage})`}>
                  <input
                    type="text"
                    value={editedSerie.name[selectedLanguage] || ''}
                    onChange={(e) => updateName(selectedLanguage, e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-500"
                  />
                </FormField>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
