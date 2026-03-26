const fs = require('fs');
const path = './src/app/dodaj-oferte/page.tsx';

let content = fs.readFileSync(path, 'utf8');

// Ensure mapbox imports are present at the top
if (!content.includes("import Map, { Marker, Source, Layer } from 'react-map-gl';")) {
  content = content.replace('import { CSS } from \'@dnd-kit/utilities\';', 'import { CSS } from \'@dnd-kit/utilities\';\nimport Map, { Marker, Source, Layer } from \'react-map-gl\';\nimport \'mapbox-gl/dist/mapbox-gl.css\';');
}

// The replacement content for Step 2
const newStep2 = `          {/* KROK 2 */}
          {step === 2 && (
            <motion.div key="k2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">Dodajmy <br/><span className="text-black/30 dark:text-white/30 italic">wizualia.</span></h1>
              {uploadError && <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold"><AlertCircle size={18} /> {uploadError}</div>}
              
              <div className={\`relative \${inputCardClass}\`}>
                <label className={labelClass}>Dokładny adres</label>
                <input type="text" placeholder="Wpisz i wybierz z listy..." className={inputClass} onChange={(e) => handleAddressSearch(e.target.value)} value={data.address || ''} />
                {addressSuggestions.length > 0 && (
                  <div className="absolute top-[80px] left-0 w-full bg-white dark:bg-[#111] border border-black/5 dark:border-white/10 rounded-2xl mt-2 overflow-hidden z-50 shadow-2xl max-h-60 overflow-y-auto">
                    {addressSuggestions.map((f, i) => (
                      <div key={i} onClick={() => handleSelectAddress(f)} className="px-6 py-4 border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer flex items-center gap-3">
                        <MapPin size={16} className="text-black/30 dark:text-white/40 shrink-0" /><div><p className="text-black dark:text-white font-medium">{f.text}</p><p className="text-xs text-black/50 dark:text-white/40">{f.place_name}</p></div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sekcja Mapy (pojawia się tylko gdy wybrano adres i mamy koordynaty) */}
                {data.lat && data.lng && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-8 pt-6 border-t border-black/10 dark:border-white/10">
                    
                    {/* Przełącznik Dokładna / Przybliżona (Apple Style Switch) */}
                    <div className="flex items-center justify-between mb-6 bg-black/5 dark:bg-[#111] p-2 rounded-full border border-black/5 dark:border-white/10 relative z-10">
                       <button 
                         onClick={() => updateData({ locationType: 'exact' })}
                         className={\`flex-1 py-3 text-xs md:text-sm font-black uppercase tracking-widest rounded-full transition-all duration-300 z-10 \${(!data.locationType || data.locationType === 'exact') ? 'text-black dark:text-white shadow-md' : 'text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white'}\`}
                       >
                         Dokładna
                       </button>
                       <button 
                         onClick={() => updateData({ locationType: 'approximate' })}
                         className={\`flex-1 py-3 text-xs md:text-sm font-black uppercase tracking-widest rounded-full transition-all duration-300 z-10 \${data.locationType === 'approximate' ? 'text-black dark:text-white shadow-md' : 'text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white'}\`}
                       >
                         Przybliżona
                       </button>
                       {/* Wskaźnik (Pigułka tła) */}
                       <div className={\`absolute top-2 bottom-2 w-[calc(50%-8px)] \${themeBg} rounded-full transition-all duration-300 ease-out z-0 opacity-20 \${data.locationType === 'approximate' ? 'left-[50%]' : 'left-2'}\`} />
                    </div>

                    <p className="text-[10px] text-black/50 dark:text-white/50 text-center mb-6 px-4">
                      {data.locationType === 'approximate' ? 'Zaznaczyliśmy orientacyjny obszar promieniem ok. 200m. Ukrywa to precyzyjny adres przed osobami z zewnątrz.' : 'Wybrałeś precyzyjną lokalizację. Pokażemy dokładny punkt na mapie.'}
                    </p>

                    {/* Kontener Mapbox */}
                    <div className="w-full h-[250px] md:h-[350px] rounded-[1.5rem] overflow-hidden border border-black/10 dark:border-white/20 relative z-0">
                      <Map
                        mapboxAccessToken={MAPBOX_TOKEN}
                        initialViewState={{ longitude: data.lng, latitude: data.lat, zoom: data.locationType === 'approximate' ? 14 : 15 }}
                        longitude={data.lng}
                        latitude={data.lat}
                        mapStyle="mapbox://styles/mapbox/dark-v11"
                        interactive={false}
                      >
                        {(!data.locationType || data.locationType === 'exact') ? (
                           <Marker longitude={data.lng} latitude={data.lat} color="#ef4444" />
                        ) : (
                          // Obszar promienia
                          <Source id="my-data" type="geojson" data={{
                            type: 'Feature',
                            geometry: { type: 'Point', coordinates: [data.lng, data.lat] },
                            properties: {}
                          }}>
                            <Layer 
                              id="point"
                              type="circle"
                              paint={{
                                'circle-radius': { base: 1.75, stops: [[12, 20], [22, 180]] }, // Ok. 200m
                                'circle-color': isAgency ? '#f97316' : '#10b981', // Kolor zależny od typu konta
                                'circle-opacity': 0.3,
                                'circle-stroke-width': 2,
                                'circle-stroke-color': isAgency ? '#f97316' : '#10b981'
                              }}
                            />
                          </Source>
                        )}
                      </Map>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className={\`bg-white dark:bg-[#0a0a0a] border rounded-[2rem] p-6 transition-colors shadow-xl shadow-black/[0.03] dark:shadow-none \${themeBorderLight}\`}>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <label className={\`text-[10px] font-bold uppercase tracking-widest block \${themeText}\`}>Zdjęcia obiektu (max 7)</label>
                  </div>
                  {isUploading && <Loader2 className={\`animate-spin \${themeText}\`} size={16} />}
                </div>
                <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} disabled={isUploading || imagesList.length >= 7} className={\`w-full text-black/40 dark:text-white/40 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold transition-colors cursor-pointer disabled:opacity-50 \${isAgency ? 'file:bg-orange-500/10 file:text-orange-500 hover:file:bg-orange-500 hover:file:text-white' : 'file:bg-emerald-500/10 file:text-emerald-500 hover:file:bg-emerald-500 hover:file:text-white'}\`}/>
                {imagesList.length > 0 && (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={imagesList} strategy={horizontalListSortingStrategy}>
                      <div className="flex gap-3 flex-wrap mt-6">{imagesList.map((url, index) => <SortablePhoto key={url} url={url} onRemove={removeImage} isMain={index === 0} />)}</div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>

              <div className={inputCardClass}>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[10px] font-bold text-black/40 dark:text-white/40 uppercase tracking-widest block flex items-center gap-2"><FileImage size={12}/> Rzut lokalu</label>
                  {isUploadingPlan && <Loader2 className="animate-spin text-black/30 dark:text-white/40" size={16} />}
                </div>
                {!data.floorPlan ? (
                  <input type="file" accept="image/*,.pdf" onChange={handleFloorPlanUpload} disabled={isUploadingPlan} className="w-full text-black/40 dark:text-white/40 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-black/5 dark:file:bg-white/10 file:text-black dark:file:text-white hover:file:bg-black/10 dark:hover:file:bg-white/20 transition-colors cursor-pointer disabled:opacity-50"/>
                ) : (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-black/10 dark:border-white/20 bg-black/5 dark:bg-[#111] group">
                    <img src={data.floorPlan} className="w-full h-full object-cover opacity-80" alt="Rzut" />
                    <button onClick={removePlan} className="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Usuń</button>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-8 pb-16">
                <button onClick={() => setStep(1)} className="px-8 py-6 rounded-full font-bold border border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 transition-all uppercase text-[10px] tracking-widest text-black/50 dark:text-white/70 hover:text-black dark:hover:text-white">Wróć</button>
                <div className="flex-1">
                  <button onClick={isLoggedIn ? handleSubmit : () => setStep(3)} disabled={!isStepValid() || isUploading || isUploadingPlan} className={epicBtnClass}>
                    {isLoggedIn ? (isSubmitting ? 'Publikowanie...' : 'Opublikuj') : 'Dalej ➔'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}`;

const startMarker = '{/* KROK 2 */}';
const endMarker = '{/* KROK 3 */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = content.substring(0, startIndex) + newStep2 + '\n\n          ' + content.substring(endIndex);
  fs.writeFileSync(path, newContent, 'utf8');
  console.log('Sukces! Krok 2 (Mapy i Wybór Lokalizacji) zaktualizowany chirurgicznie.');
} else {
  console.log('BŁĄD: Nie znaleziono znaczników KROK 2 lub KROK 3.');
}
