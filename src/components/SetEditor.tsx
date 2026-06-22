import { useState, useEffect } from 'react'
import { Set, Serie, SupportedLanguages } from '../types'
import { ArrowLeft, Save, Layout } from 'lucide-react'

interface SetEditorProps {
  set: Set
  serie: Serie
  onSave: (set: Set) => void
  onBack: () => void
  isNew?: boolean
}

export default function SetEditor({ set, serie, onSave, onBack, isNew = false }: SetEditorProps) {
  const [editedSet, setEditedSet] = useState<Set>({ ...set })
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguages>('en')

  // Autosave with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isNew) {
        onSave(editedSet)
      }
    }, 2000) // Save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId)
  }, [editedSet, onSave, isNew])

  const handleSave = () => {
    onSave(editedSet)
  }

  const updateName = (lang: SupportedLanguages, value: string) => {
    setEditedSet({
      ...editedSet,
      name: { ...editedSet.name, [lang]: value }
    })
  }

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
            <h1 className="text-sm font-bold text-white">Set Editor</h1>
            <p className="text-xs text-slate-500">{editedSet.name.en || editedSet.name.fr} — {serie.name.en || serie.name.fr}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isNew && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all text-sm shadow-lg shadow-indigo-500/20"
            >
              <Save size={16} />
              Create
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Set Metadata */}
        <aside className="w-80 border-r border-slate-800 bg-slate-900/30 overflow-y-auto p-6 space-y-6">
          <section>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Layout size={14} /> Basic Info
            </h2>
            <div className="space-y-4">
              <FormField label="Set ID">
                <input
                  type="text"
                  value={editedSet.id}
                  onChange={(e) => setEditedSet({ ...editedSet, id: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-500"
                />
              </FormField>
              <FormField label="Official Card Count">
                <input
                  type="number"
                  value={editedSet.cardCount?.official ?? ''}
                  onChange={(e) => setEditedSet({
                    ...editedSet,
                    cardCount: { ...(editedSet.cardCount || { official: 0 }), official: e.target.value ? parseInt(e.target.value) : 0 }
                  })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-500"
                />
              </FormField>
              <FormField label="Release Date">
                <input
                  type="date"
                  value={
                    editedSet.releaseDate
                      ? (typeof editedSet.releaseDate === 'string' ? editedSet.releaseDate : editedSet.releaseDate.en || '')
                      : ''
                  }
                  onChange={(e) => setEditedSet({ ...editedSet, releaseDate: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-500"
                />
              </FormField>
              <FormField label="TCG Online ID">
                <input
                  type="text"
                  value={editedSet.tcgOnline || ''}
                  onChange={(e) => setEditedSet({ ...editedSet, tcgOnline: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-500"
                />
              </FormField>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Layout size={14} /> Third Party IDs
            </h2>
            <div className="space-y-4">
              <FormField label="Cardmarket ID">
                <input
                  type="number"
                  value={editedSet.thirdParty?.cardmarket || ''}
                  onChange={(e) => setEditedSet({
                    ...editedSet,
                    thirdParty: { ...editedSet.thirdParty, cardmarket: e.target.value ? parseInt(e.target.value) : undefined }
                  })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-500"
                />
              </FormField>
              <FormField label="TCGPlayer ID">
                <input
                  type="number"
                  value={editedSet.thirdParty?.tcgplayer || ''}
                  onChange={(e) => setEditedSet({
                    ...editedSet,
                    thirdParty: { ...editedSet.thirdParty, tcgplayer: e.target.value ? parseInt(e.target.value) : undefined }
                  })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-500"
                />
              </FormField>
              <FormField label="Cardtrader ID">
                <input
                  type="number"
                  value={editedSet.thirdParty?.cardtrader || ''}
                  onChange={(e) => setEditedSet({
                    ...editedSet,
                    thirdParty: { ...editedSet.thirdParty, cardtrader: e.target.value ? parseInt(e.target.value) : undefined }
                  })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-500"
                />
              </FormField>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Layout size={14} /> Abbreviations
            </h2>
            <div className="space-y-4">
              <FormField label="Official">
                <input
                  type="text"
                  value={editedSet.abbreviations?.official || ''}
                  onChange={(e) => setEditedSet({
                    ...editedSet,
                    abbreviations: { ...editedSet.abbreviations, official: e.target.value }
                  })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-500"
                />
              </FormField>
              <FormField label="French">
                <input
                  type="text"
                  value={editedSet.abbreviations?.fr || ''}
                  onChange={(e) => setEditedSet({
                    ...editedSet,
                    abbreviations: { ...editedSet.abbreviations, fr: e.target.value }
                  })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-500"
                />
              </FormField>
            </div>
          </section>
        </aside>

        {/* RIGHT COLUMN: Names */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-950">
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                  <div className="w-1 h-4 bg-indigo-500 rounded-full" /> Set Names
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
                    value={editedSet.name[selectedLanguage] || ''}
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
