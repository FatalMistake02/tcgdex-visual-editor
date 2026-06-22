import { useState, useEffect, useRef } from 'react'
import { Card, Set, Types, SupportedLanguages } from '../types'
import { ArrowLeft, Plus, Trash2, Image as ImageIcon, Layout, ChevronRight, ChevronLeft } from 'lucide-react'
import { VARIANT_TYPES, VARIANT_STAMPS, SUBTYPES, FOIL_TYPES, SIZES } from '../utils/parser'

interface CardEditorProps {
  card: Card
  set: Set
  onSave: (card: Card, persist?: boolean) => void
  onBack: () => void
  onNext?: () => void
  onPrevious?: () => void
  isNew?: boolean
}

export default function CardEditor({ card, set, onSave, onBack, onNext, onPrevious, isNew = false }: CardEditorProps) {
  const [editedCard, setEditedCard] = useState<Card>({ ...card })
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguages>('en')

  // Autosave with debounce: persist to disk when cardNumber exists, otherwise keep in-memory
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const cardNumber = (editedCard as any).cardNumber
      if (cardNumber) {
        onSave(editedCard, true)
      } else {
        // update in-memory only until cardNumber is assigned
        onSave(editedCard, false)
      }
    }, 2000) // Save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId)
  }, [editedCard, onSave])

  // Update editedCard when navigating to a different card (by cardNumber)
  const prevCardNumber = useRef<string | undefined>((card as any).cardNumber)
  useEffect(() => {
    const newCardNumber = (card as any).cardNumber
    if (prevCardNumber.current !== newCardNumber) {
      setEditedCard({ ...card })
      prevCardNumber.current = newCardNumber
    }
  }, [card])

  

  const updateName = (lang: SupportedLanguages, value: string) => {
    setEditedCard({ ...editedCard, name: { ...editedCard.name, [lang]: value } })
  }

  const updateDescription = (lang: SupportedLanguages, value: string) => {
    setEditedCard({ ...editedCard, description: { ...editedCard.description, [lang]: value } })
  }

  const addVariant = () => {
    const legacy = (editedCard as any).variants
    // If variants exist in legacy (object) format, convert supported keys to new variant objects
    if (legacy && !Array.isArray(legacy) && typeof legacy === 'object') {
      const newVariants: Array<any> = []
      for (const [key, value] of Object.entries(legacy) as [string, any][]) {
        let type = key
        if (!VARIANT_TYPES.includes(type)) {
          const kebab = key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
          if (VARIANT_TYPES.includes(kebab)) type = kebab
        }

        if (key === 'firstEdition' || key === 'first_edition' || key === 'first-edition') {
          if (legacy[key]) newVariants.push({ type: 'normal', stamp: ['1st-edition'] })
          continue
        }

        if (!VARIANT_TYPES.includes(type)) {
          continue
        }

        if (value === true) {
          newVariants.push({ type })
          continue
        }

        if (typeof value === 'object' && value !== null) {
          const obj: any = value
          const v: any = { type }
          if (obj.thirdParty) v.thirdParty = obj.thirdParty
          if (obj.stamp) v.stamp = Array.isArray(obj.stamp) ? obj.stamp : [obj.stamp]
          if (obj.foil) v.foil = obj.foil
          if (obj.size) v.size = obj.size
          if (obj.subtype) v.subtype = obj.subtype
          newVariants.push(v)
          continue
        }

        if (value) newVariants.push({ type })
      }

      const updated = { ...editedCard, variants: [...newVariants, { type: 'normal' }] }
      setEditedCard(updated)
      try {
        onSave(updated, true)
      } catch (e) {
        console.error('Error saving after converting variants and adding new one:', e)
      }
      return
    }

    setEditedCard(prev => ({ ...prev, variants: [...(prev.variants || []), { type: 'normal' }] }))
  }

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...(editedCard.variants || [])]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setEditedCard({ ...editedCard, variants: newVariants })
  }

  const removeVariant = (index: number) => {
    const newVariants = editedCard.variants?.filter((_, i) => i !== index) || []
    setEditedCard({ ...editedCard, variants: newVariants })
  }

  const addAttack = () => {
    setEditedCard({ ...editedCard, attacks: [...(editedCard.attacks || []), { name: { en: '' }, cost: [] }] })
  }

  const updateAttack = (index: number, field: string, value: any) => {
    const newAttacks = [...(editedCard.attacks || [])]
    newAttacks[index] = { ...newAttacks[index], [field]: value }
    setEditedCard({ ...editedCard, attacks: newAttacks })
  }

  const updateAttackName = (index: number, lang: SupportedLanguages, value: string) => {
    const newAttacks = [...(editedCard.attacks || [])]
    newAttacks[index] = { ...newAttacks[index], name: { ...newAttacks[index].name, [lang]: value } }
    setEditedCard({ ...editedCard, attacks: newAttacks })
  }

  const removeAttack = (index: number) => {
    const newAttacks = editedCard.attacks?.filter((_, i) => i !== index) || []
    setEditedCard({ ...editedCard, attacks: newAttacks })
  }

  const updateAttackEffect = (index: number, lang: SupportedLanguages, value: string) => {
    const newAttacks = [...(editedCard.attacks || [])]
    newAttacks[index] = { ...newAttacks[index], effect: { ...newAttacks[index].effect, [lang]: value } }
    setEditedCard({ ...editedCard, attacks: newAttacks })
  }

  const addAbility = () => {
    setEditedCard({ ...editedCard, abilities: [...(editedCard.abilities || []), { type: 'Ability', name: { en: '' }, effect: { en: '' } }] })
  }

  const updateAbility = (index: number, field: string, value: any) => {
    const newAbilities = [...(editedCard.abilities || [])]
    newAbilities[index] = { ...newAbilities[index], [field]: value }
    setEditedCard({ ...editedCard, abilities: newAbilities })
  }

  const updateAbilityName = (index: number, lang: SupportedLanguages, value: string) => {
    const newAbilities = [...(editedCard.abilities || [])]
    newAbilities[index] = { ...newAbilities[index], name: { ...newAbilities[index].name, [lang]: value } }
    setEditedCard({ ...editedCard, abilities: newAbilities })
  }

  const updateAbilityEffect = (index: number, lang: SupportedLanguages, value: string) => {
    const newAbilities = [...(editedCard.abilities || [])]
    newAbilities[index] = { ...newAbilities[index], effect: { ...newAbilities[index].effect, [lang]: value } }
    setEditedCard({ ...editedCard, abilities: newAbilities })
  }

  const removeAbility = (index: number) => {
    const newAbilities = editedCard.abilities?.filter((_, i) => i !== index) || []
    setEditedCard({ ...editedCard, abilities: newAbilities })
  }

  const types: Types[] = ['Colorless', 'Darkness', 'Dragon', 'Fairy', 'Fighting', 'Fire', 'Grass', 'Lightning', 'Metal', 'Psychic', 'Water']
  const languages: SupportedLanguages[] = ['en', 'fr', 'es', 'es-mx', 'it', 'pt', 'pt-br', 'pt-pt', 'de', 'nl', 'pl', 'ru', 'ja', 'ko', 'zh-tw', 'id', 'th', 'zh-cn']

  const toArray = <T,>(v?: T[] | Record<string, T> | null): T[] => {
    if (Array.isArray(v)) return v
    if (!v) return []
    try { return Object.values(v as Record<string, T>) }
    catch { return [] }
  }
  const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 ml-1">{label}</label>
      {children}
    </div>
  )

  const isLegacyVariantsFormat = (v: any): boolean => {
    if (!v || Array.isArray(v) || typeof v !== 'object') return false
    const keys = Object.keys(v)
    if (keys.length === 0) return false
    // If any key looks like a variant type or known legacy key, consider it legacy
    const knownLegacyKeys = ['firstEdition', 'first_edition', 'first-edition']
    return keys.some(k => VARIANT_TYPES.includes(k) || knownLegacyKeys.includes(k) || VARIANT_TYPES.includes(k.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()))
  }

  const convertLegacyVariants = () => {
    const legacy = (editedCard as any).variants
    if (!isLegacyVariantsFormat(legacy)) return
    const newVariants: Array<any> = []
    for (const [key, value] of Object.entries(legacy) as [string, any][]) {
      // normalize key to variant type where possible
      let type = key
      if (!VARIANT_TYPES.includes(type)) {
        const kebab = key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
        if (VARIANT_TYPES.includes(kebab)) type = kebab
      }

      if (key === 'firstEdition' || key === 'first_edition' || key === 'first-edition') {
        // map firstEdition -> normal + 1st-edition stamp
        if (legacy[key]) newVariants.push({ type: 'normal', stamp: ['1st-edition'] })
        continue
      }

      if (!VARIANT_TYPES.includes(type)) {
        // unknown key - skip
        continue
      }

      if (value === true) {
        newVariants.push({ type })
        continue
      }

      if (typeof value === 'object' && value !== null) {
        // merge supported fields from legacy object to new variant
        const obj: any = value
        const v: any = { type }
        if (obj.thirdParty) v.thirdParty = obj.thirdParty
        if (obj.stamp) v.stamp = Array.isArray(obj.stamp) ? obj.stamp : [obj.stamp]
        if (obj.foil) v.foil = obj.foil
        if (obj.size) v.size = obj.size
        if (obj.subtype) v.subtype = obj.subtype
        newVariants.push(v)
        continue
      }

      // truthy fallback
      if (value) newVariants.push({ type })
    }

    const updated = { ...editedCard, variants: newVariants }
    setEditedCard(updated)
    try {
      onSave(updated, true)
    } catch (e) {
      // onSave may trigger async save; log failures but keep UI updated
      console.error('Error saving after converting variants:', e)
    }
  }

  return (
    <div className="h-screen bg-slate-950 text-slate-200 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-16 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors border border-slate-700">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-white">Card Editor</h1>
            <p className="text-xs text-slate-500">{editedCard.name.en || editedCard.name.fr}</p>
          </div>
        </div>
          <div className="flex items-center gap-3">
          {!isNew && onPrevious && (
            <button
              onClick={onPrevious}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all text-sm"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
          )}
          {!isNew && onNext && (
            <button
              onClick={onNext}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all text-sm"
            >
              Next Card
              <ChevronRight size={16} />
            </button>
          )}
          {isNew && null}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Global Metadata */}
        <aside className="w-80 border-r border-slate-800 bg-slate-900/30 overflow-y-auto p-6 space-y-6">
          {/* Fixed Legacy Delete logic */}
          {editedCard.thirdParty && (
            <section className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
              <h2 className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Layout size={14} /> Legacy Data
              </h2>
              <p className="text-xs text-yellow-200 mb-3">
                This card has legacy thirdParty data at the card level. This should be moved to variants.
              </p>
              <div className="text-xs text-yellow-300 mb-3 space-y-1">
                {editedCard.thirdParty.tcgplayer && <p>TCGPlayer: {editedCard.thirdParty.tcgplayer}</p>}
                {editedCard.thirdParty.cardmarket && <p>Cardmarket: {editedCard.thirdParty.cardmarket}</p>}
                {editedCard.thirdParty.cardtrader && <p>Cardtrader: {editedCard.thirdParty.cardtrader}</p>}
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditedCard(prev => {
                    const { thirdParty, ...rest } = prev; // Destructure to remove thirdParty
                    return rest;
                  })
                }}
                className="w-full px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded-md transition-colors"
              >
                Delete Legacy Data
              </button>
            </section>
          )}
          {!editedCard.thirdParty && (
            <div className="text-xs text-green-400 mb-4">No legacy data</div>
          )}
          
          <section>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Layout size={14} /> General Info
            </h2>
            <div className="space-y-4">
              <FormField label="Category">
                <select
                  value={editedCard.category}
                  onChange={(e) => setEditedCard({ ...editedCard, category: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:ring-2 ring-indigo-500 outline-none"
                >
                  <option value="Pokemon">Pokemon</option>
                  <option value="Trainer">Trainer</option>
                  <option value="Energy">Energy</option>
                </select>
              </FormField>

              <FormField label="Card Number">
                <input
                  type="text"
                  value={(editedCard as any).cardNumber || ''}
                  onChange={(e) => setEditedCard({ ...editedCard, cardNumber: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-500"
                  placeholder="e.g., 001"
                />
              </FormField>

              <FormField label="Rarity">
                <select
                  value={editedCard.rarity}
                  onChange={(e) => setEditedCard({ ...editedCard, rarity: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:ring-2 ring-indigo-500 outline-none"
                >
                  {['Common', 'Uncommon', 'Rare', 'Holo Rare', 'Rare Holo', 'Ultra Rare', 'Secret Rare', 'Illustration rare', 'Special illustration rare', 'Double rare', 'Hyper rare', 'Promo', 'None'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Illustrator">
                <input
                  type="text"
                  value={editedCard.illustrator || ''}
                  onChange={(e) => setEditedCard({ ...editedCard, illustrator: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-500"
                />
              </FormField>

              <FormField label="Regulation Mark">
                <input
                  type="text"
                  value={editedCard.regulationMark || ''}
                  onChange={(e) => setEditedCard({ ...editedCard, regulationMark: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-500"
                  maxLength={1}
                />
              </FormField>
            </div>
          </section>

          <section className="pt-6 border-t border-slate-800">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Localization</h2>
            <div className="space-y-4">
              <FormField label="Target Language">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as SupportedLanguages)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-500"
                >
                  {languages.map(lang => <option key={lang} value={lang}>{lang.toUpperCase()}</option>)}
                </select>
              </FormField>

              <FormField label={`Card Name (${selectedLanguage})`}>
                <input
                  type="text"
                  value={editedCard.name[selectedLanguage] || ''}
                  onChange={(e) => updateName(selectedLanguage, e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-500"
                />
              </FormField>

              <FormField label={`Description (${selectedLanguage})`}>
                <textarea
                  value={editedCard.description?.[selectedLanguage] || ''}
                  onChange={(e) => updateDescription(selectedLanguage, e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm h-32 resize-none outline-none focus:ring-2 ring-indigo-500"
                />
              </FormField>
            </div>
          </section>
        </aside>

        {/* CENTER COLUMN: Gameplay Data & Visual */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-950">
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-4">
              <div className="sticky top-0">
                <div className="aspect-[2/3] bg-slate-900 rounded-xl border-2 border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center group relative">
                  {(() => {
                    const cardNumber = (card as any).cardNumber
                    const serieId = set.serie.id
                    const setId = set.id
                    const imageUrl = `https://assets.tcgdex.net/en/${serieId}/${setId}/${cardNumber}/low.webp`
                    return (
                      <img
                        src={imageUrl}
                        alt="preview"
                        className="w-full h-full object-contain transition-transform group-hover:scale-105"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                    )
                  })()}
                  <div className="absolute bottom-2 right-2 p-2 bg-slate-900/80 rounded-lg backdrop-blur-sm text-slate-400">
                    <ImageIcon size={14} />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              {editedCard.category === 'Pokemon' ? (
                <>
                  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl shadow-sm">
                    <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                      <div className="w-1 h-4 bg-indigo-500 rounded-full" /> Stats & Attributes
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      <FormField label="HP">
                        <input
                          type="number"
                          value={editedCard.hp || ''}
                          onChange={(e) => setEditedCard({ ...editedCard, hp: e.target.value ? parseInt(e.target.value) : undefined })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-500"
                        />
                      </FormField>
                      <FormField label="Stage">
                        <select
                          value={editedCard.stage || ''}
                          onChange={(e) => setEditedCard({ ...editedCard, stage: e.target.value as any })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-500"
                        >
                          <option value="">None</option>
                          {['Basic', 'Stage1', 'Stage2', 'VMAX', 'VSTAR', 'MEGA', 'EX', 'GX', 'BREAK'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </FormField>
                      <FormField label="Retreat Cost">
                        <input
                          type="number"
                          value={editedCard.retreat || ''}
                          onChange={(e) => setEditedCard({ ...editedCard, retreat: e.target.value ? parseInt(e.target.value) : undefined })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-500"
                        />
                      </FormField>
                      <FormField label="Dex ID">
                        <input
                          type="text"
                          value={editedCard.dexId?.join(', ') || ''}
                          onChange={(e) => setEditedCard({ 
                            ...editedCard, 
                            dexId: e.target.value.split(',').map(s => s.trim()).filter(s => s).map(Number) 
                          })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-500"
                        />
                      </FormField>
                    </div>

                    <div className="mt-6">
                      <FormField label="Types">
                        <div className="flex flex-wrap gap-2 p-2 bg-slate-800 border border-slate-700 rounded-md min-h-[42px]">
                          {types.map(type => (
                            <button
                              key={type}
                              onClick={() => {
                                const current = editedCard.types || []
                                const next = current.includes(type) ? current.filter(t => t !== type) : [...current, type]
                                setEditedCard({ ...editedCard, types: next })
                              }}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                (editedCard.types || []).includes(type) 
                                ? 'bg-indigo-600 text-white ring-2 ring-indigo-400' 
                                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </FormField>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <div className="w-1 h-4 bg-indigo-500 rounded-full" /> Attacks
                      </h3>
                      <button
                        onClick={addAttack}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors text-xs font-semibold"
                      >
                        <Plus size={14} /> Add Attack
                      </button>
                    </div>

                    <div className="space-y-4">
                      {toArray(editedCard.attacks).map((attack, index) => (
                        <div key={index} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 group">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-slate-500 uppercase">Attack #{index + 1}</span>
                            <button onClick={() => removeAttack(index)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label={`Name (${selectedLanguage})`}>
                              <input
                                type="text"
                                value={attack.name[selectedLanguage] || ''}
                                onChange={(e) => updateAttackName(index, selectedLanguage, e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-500"
                              />
                            </FormField>
                            <FormField label="Damage">
                              <input
                                type="text"
                                value={attack.damage || ''}
                                onChange={(e) => updateAttack(index, 'damage', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-500"
                              />
                            </FormField>
                            <div className="col-span-full">
                              <FormField label="Energy Cost">
                                <div className="flex flex-wrap gap-2 p-2 bg-slate-800 border border-slate-700 rounded-md min-h-[42px]">
                                  {types.map(type => (
                                    <button
                                      key={type}
                                      onClick={() => {
                                        const current = attack.cost || []
                                        const next = current.includes(type) ? current.filter(t => t !== type) : [...current, type]
                                        updateAttack(index, 'cost', next)
                                      }}
                                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                        (attack.cost || []).includes(type) 
                                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-400' 
                                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                      }`}
                                    >
                                      {type}
                                    </button>
                                  ))}
                                </div>
                              </FormField>
                            </div>
                            <div className="col-span-full">
                              <FormField label={`Effect (${selectedLanguage})`}>
                                <textarea
                                  value={attack.effect?.[selectedLanguage] || ''}
                                  onChange={(e) => updateAttackEffect(index, selectedLanguage, e.target.value)}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-500 min-h-[60px] resize-y"
                                  rows={2}
                                />
                              </FormField>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <div className="w-1 h-4 bg-indigo-500 rounded-full" /> Abilities
                      </h3>
                      <button
                        onClick={addAbility}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors text-xs font-semibold"
                      >
                        <Plus size={14} /> Add Ability
                      </button>
                    </div>

                    <div className="space-y-4">
                      {toArray(editedCard.abilities).map((ability, index) => (
                        <div key={index} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 group">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-slate-500 uppercase">Ability #{index + 1}</span>
                            <button onClick={() => removeAbility(index)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="space-y-4">
                            <FormField label="Type">
                              <select
                                value={ability.type || ''}
                                onChange={(e) => updateAbility(index, 'type', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-500"
                              >
                                <option value="Ability">Ability</option>
                                <option value="Pokémon Power">Pokémon Power</option>
                                <option value="Poké-POWER">Poké-POWER</option>
                                <option value="Poké-BODY">Poké-BODY</option>
                                <option value="Ancient Trait">Ancient Trait</option>
                              </select>
                            </FormField>
                            <FormField label={`Name (${selectedLanguage})`}>
                              <input
                                type="text"
                                value={ability.name[selectedLanguage] || ''}
                                onChange={(e) => updateAbilityName(index, selectedLanguage, e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-500"
                              />
                            </FormField>
                            <FormField label={`Effect (${selectedLanguage})`}>
                              <textarea
                                value={ability.effect?.[selectedLanguage] || ''}
                                onChange={(e) => updateAbilityEffect(index, selectedLanguage, e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-500 min-h-[80px] resize-y"
                                rows={3}
                              />
                            </FormField>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl shadow-sm">
                    <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                      <div className="w-1 h-4 bg-indigo-500 rounded-full" /> Weaknesses
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      <FormField label="Type">
                        <select
                          value={editedCard.weaknesses?.[0]?.type || ''}
                          onChange={(e) => {
                            const weaknesses = [...(editedCard.weaknesses || [])]
                            if (weaknesses.length > 0) {
                              weaknesses[0] = { ...weaknesses[0], type: e.target.value as Types }
                            } else {
                              weaknesses.push({ type: e.target.value as Types, value: 'x2' })
                            }
                            setEditedCard({ ...editedCard, weaknesses })
                          }}
                          className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-500"
                        >
                          <option value="">None</option>
                          {types.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                      </FormField>
                      <FormField label="Multiplier">
                        <input
                          type="text"
                          value={editedCard.weaknesses?.[0]?.value || ''}
                          onChange={(e) => {
                            const weaknesses = [...(editedCard.weaknesses || [])]
                            if (weaknesses.length > 0) {
                              weaknesses[0] = { ...weaknesses[0], value: e.target.value }
                              setEditedCard({ ...editedCard, weaknesses })
                            }
                          }}
                          className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-500"
                        />
                      </FormField>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 italic border-2 border-dashed border-slate-800 rounded-xl">
                  Generic card stats for {editedCard.category} are not yet implemented.
                </div>
              )}
            </div>
          </div>
        </main>

        {/* RIGHT COLUMN: Variants Only */}
        <aside className="w-196 border-l border-slate-800 bg-slate-900/50 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Variants</h2>
            <button
              onClick={addVariant}
              className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-4">
            {isLegacyVariantsFormat((editedCard as any).variants) && (
              <section className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                <h3 className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-2">Legacy Variants Detected</h3>
                <p className="text-xs text-yellow-200 mb-3">This card uses the old variants object format and cannot be edited until converted.</p>
                <div className="flex gap-2">
                  <button
                    onClick={convertLegacyVariants}
                    className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded-md transition-colors"
                  >
                    Convert to new format
                  </button>
                </div>
              </section>
            )}

            {Array.isArray(editedCard.variants) && toArray(editedCard.variants).map((variant, index) => (
              <div key={index} className="p-4 rounded-xl bg-slate-800 border border-slate-700 shadow-sm hover:border-indigo-500/50 transition-colors group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tight">Variant {index + 1}</span>
                  <button onClick={() => removeVariant(index)} className="p-1 text-slate-500 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Type">
                    <select
                      value={variant.type}
                      onChange={(e) => updateVariant(index, 'type', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1.5 text-xs outline-none focus:ring-2 ring-indigo-500"
                    >
                      {VARIANT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Subtype">
                    <select
                      value={variant.subtype || 'none'}
                      onChange={(e) => updateVariant(index, 'subtype', e.target.value === 'none' ? undefined : e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1.5 text-xs outline-none focus:ring-2 ring-indigo-500"
                    >
                      <option value="none">None</option>
                      {SUBTYPES.map(subtype => <option key={subtype} value={subtype}>{subtype}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Size">
                    <select
                      value={variant.size || 'standard'}
                      onChange={(e) => updateVariant(index, 'size', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1.5 text-xs outline-none focus:ring-2 ring-indigo-500"
                    >
                      {SIZES.map(size => <option key={size} value={size}>{size}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Foil">
                    <select
                      value={variant.foil || 'none'}
                      onChange={(e) => updateVariant(index, 'foil', e.target.value === 'none' ? undefined : e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1.5 text-xs outline-none focus:ring-2 ring-indigo-500"
                    >
                      <option value="none">None</option>
                      {FOIL_TYPES.map(foil => <option key={foil} value={foil}>{foil}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Stamp">
                    <select
                      value={variant.stamp?.[0] || 'none'}
                      onChange={(e) => updateVariant(index, 'stamp', e.target.value === 'none' ? undefined : [e.target.value])}
                      className="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1.5 text-xs outline-none focus:ring-2 ring-indigo-500"
                    >
                      <option value="none">None</option>
                      {VARIANT_STAMPS.map(stamp => <option key={stamp} value={stamp}>{stamp}</option>)}
                    </select>
                  </FormField>
                  <FormField label="TCGPlayer ID">
                    <input
                      type="number"
                      value={variant.thirdParty?.tcgplayer || ''}
                      onChange={(e) => updateVariant(index, 'thirdParty', { ...variant.thirdParty, tcgplayer: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1.5 text-xs outline-none focus:ring-2 ring-indigo-500"
                    />
                  </FormField>
                  <FormField label="Cardmarket ID">
                    <input
                      type="number"
                      value={variant.thirdParty?.cardmarket || ''}
                      onChange={(e) => updateVariant(index, 'thirdParty', { ...variant.thirdParty, cardmarket: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1.5 text-xs outline-none focus:ring-2 ring-indigo-500"
                    />
                  </FormField>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
