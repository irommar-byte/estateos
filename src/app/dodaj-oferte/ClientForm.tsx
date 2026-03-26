"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Building2, Rows, Castle, Briefcase, Map as MapIcon, MapPin, Sparkles, Loader2, CheckCircle, Crown, Upload, Trash2, LayoutTemplate, X, Lock, User, Phone, Mail, ShieldCheck, Flame, AlertCircle } from "lucide-react";

import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
}

const inputPremium = "w-full bg-[#0a0a0a] border border-[#222] rounded-2xl text-white text-lg py-4 px-5 focus:bg-[#111] focus:border-emerald-500 focus:shadow-[inset_0_4px_15px_rgba(0,0,0,1),0_0_20px_rgba(16,185,129,0.15)] outline-none transition-all duration-300 placeholder:text-gray-700 shadow-[inset_0_4px_15px_rgba(0,0,0,1),0_1px_1px_rgba(255,255,255,0.05)]";
const labelPremium = "block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1";

const PROPERTY_TYPES = [
  { id: "Mieszkanie", icon: Building2 },
  { id: "Segment", icon: Rows },
  { id: "Dom Wolnostojący", icon: Castle },
  { id: "Lokal Użytkowy", icon: Briefcase },
  { id: "Działka", icon: MapIcon }
];
const AMENITIES = ["Balkon", "Garaż/Miejsce park.", "Piwnica/Pom. gosp.", "Ogródek", "Dwupoziomowe", "Winda"];

const StepNode = ({ active }: { active: boolean }) => (
  <div className={`absolute top-1/2 -left-[48px] -translate-y-1/2 w-5 h-5 rounded-full border-[3px] transition-all duration-700 z-20 flex items-center justify-center ${active ? 'bg-[#0a0a0a] border-emerald-500 shadow-[0_0_15px_#10b981]' : 'bg-[#111] border-[#222]'}`}>
    {active && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 bg-emerald-400 rounded-full" />}
  </div>
);

const LivingIcon = ({ type, isActive, icon: BaseIcon }: { type: string, isActive: boolean, icon: any }) => {
  const color = isActive ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]' : 'text-zinc-500 group-hover:text-emerald-400/80 transition-colors duration-300';
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.div whileHover={{ scale: 1.15, rotate: type === 'Lokal Użytkowy' ? 5 : type === 'Działka' ? -5 : 0 }} animate={isActive ? { y: [-2, 2, -2] } : {}} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="relative z-10 flex items-center justify-center">
        <BaseIcon size={36} strokeWidth={1.5} className={color} />
      </motion.div>
      <div className={`absolute inset-0 bg-emerald-500/20 blur-xl rounded-full transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`}></div>
      {isActive && type === 'Dom Wolnostojący' && <motion.div animate={{ y: [-10, -30], opacity: [0, 0.5, 0], scale: [0.5, 1.2] }} transition={{ duration: 2, repeat: Infinity }} className="absolute top-0 left-1/2 w-2 h-2 bg-white/30 blur-sm rounded-full" />}
    </div>
  );
};

const CategoryCRMIcon = ({ cat, isActive, onClick }: any) => (
  <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.95 }} onClick={onClick} className={`h-28 rounded-2xl border flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 group relative overflow-hidden ${isActive ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'bg-[#111] border-white/5 hover:border-emerald-500/40 hover:bg-[#161616]'}`}>
    <div className="w-12 h-12 relative z-10">
      <LivingIcon type={cat.id} isActive={isActive} icon={cat.icon} />
    </div>
    <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300 text-center relative z-10 ${isActive ? 'text-white' : 'text-zinc-600 group-hover:text-zinc-300'}`}>{cat.id}</span>
  </motion.div>
);

const SortableItem = ({ id, img, idx, onRemove }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="w-28 h-28 relative rounded-2xl overflow-hidden group border border-zinc-700 hover:border-emerald-500/50 transition-all z-50">
      <img src={img} className="w-full h-full object-cover pointer-events-none" />
      <button onPointerDown={(e) => { e.stopPropagation(); onRemove(idx); }} className="absolute top-2 right-2 p-2 bg-red-600/90 hover:bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all z-[60] shadow-lg">
        <Trash2 size={14}/> 
      </button>
      {idx === 0 && <span className="absolute bottom-0 left-0 w-full bg-emerald-500 text-black text-[9px] font-black uppercase text-center py-1 z-10">Główne</span>}
    </div>
  );
};

export default function ClientForm({ initialUser }: { initialUser?: any }) {
  const [data, setData] = useState<any>({ propertyType: '', locationType: 'exact', amenities: [], district: '', apartmentNumber: '', contactName: initialUser?.name || '', contactPhone: initialUser?.phone || '', email: initialUser?.email || '', password: '', description: '', plotArea: '' });
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);

  const [imagesList, setImagesList] = useState<string[]>([]);
  const [filesMap, setFilesMap] = useState<{[key: string]: File}>({}); 
  const [floorPlan, setFloorPlan] = useState<string | null>(null);
  const [floorPlanFile, setFloorPlanFile] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [actionModal, setActionModal] = useState<"none" | "limit" | "success" | "error">("none");
  const [uploadProgress, setUploadProgress] = useState(''); 

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const updateData = (newData: any) => setData({ ...data, ...newData });

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapInstance.current) {
      mapInstance.current = new mapboxgl.Map({
        container: mapContainerRef.current, style: 'mapbox://styles/mapbox/dark-v11', center: [21.0122, 52.2297], zoom: 11, pitch: 45
      });
    }
  }, []);

  useEffect(() => {
    if (mapInstance.current && data.lat && data.lng) {
      const map = mapInstance.current;
      map.flyTo({ center: [data.lng, data.lat], zoom: data.locationType === 'approximate' ? 14.5 : 18.2, pitch: data.locationType === 'approximate' ? 45 : 72, speed: 1.2, curve: 1 });
      if (markerRef.current) markerRef.current.remove();
      
      const el = document.createElement('div');
      if (data.locationType === 'exact') {
        el.innerHTML = `<div class="relative flex flex-col items-center justify-center -mt-10"><div class="relative flex items-center justify-center w-10 h-10"><div class="absolute w-full h-full bg-red-600 rounded-full animate-ping opacity-60"></div><div class="relative flex items-center justify-center w-8 h-8 bg-gradient-to-br from-red-400 via-red-600 to-red-900 rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_10px_20px_rgba(220,38,38,0.8)] border border-red-300 z-10"><div class="w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_white]"></div></div></div><div class="w-1 h-6 bg-gradient-to-b from-red-800 to-transparent -mt-1 rounded-full z-0"></div></div>`;
        markerRef.current = new mapboxgl.Marker({ element: el, anchor: 'bottom' }).setLngLat([data.lng, data.lat]).addTo(map);
      } else {
        el.innerHTML = `<div class="relative flex items-center justify-center w-40 h-40"><div class="absolute w-full h-full bg-emerald-500 rounded-full animate-ping opacity-20" style="animation-duration: 3s;"></div><div class="absolute w-24 h-24 bg-emerald-500 rounded-full animate-ping opacity-30" style="animation-duration: 3s; animation-delay: 1s;"></div><div class="absolute w-12 h-12 bg-emerald-500/20 rounded-full backdrop-blur-md border border-emerald-500/50 shadow-[inset_0_0_20px_rgba(16,185,129,0.5)]"></div><div class="relative w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_15px_#10b981,0_0_30px_#10b981]"></div></div>`;
        markerRef.current = new mapboxgl.Marker({ element: el }).setLngLat([data.lng, data.lat]).addTo(map);
      }
    }
  }, [data.lat, data.lng, data.locationType]);

  const handleAddressSearch = async (query: string) => {
    updateData({ address: query });
    if (query.length > 2) {
      try {
        const bbox = "20.85,52.1,21.27,52.36";
        const token = mapboxgl.accessToken || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&country=pl&bbox=${bbox}&language=pl`);
        const json = await res.json();
        setAddressSuggestions(json.features || []);
      } catch (e) {}
    } else {
      setAddressSuggestions([]);
    }
  };

  const selectAddress = (feature: any) => {
    let foundDistrict = '';
    const districts = ["Mokotów", "Praga-Południe", "Wola", "Ursynów", "Bielany", "Śródmieście", "Targówek", "Bemowo", "Ochota", "Wawer", "Praga-Północ", "Białołęka", "Ursus", "Żoliborz", "Włochy", "Wilanów", "Wesoła", "Rembertów"];
    const searchContext = [feature.place_name_pl || feature.text, ...(feature.context?.map((c: any) => c.text_pl || c.text) || [])].join(' ').toLowerCase();
    for (const d of districts) {
      if (searchContext.includes(d.toLowerCase())) { foundDistrict = d; break; }
    }
    updateData({ address: feature.place_name_pl || feature.text, lng: feature.center[0], lat: feature.center[1], locationType: 'exact', ...(foundDistrict ? { district: foundDistrict } : {}) });
    setAddressSuggestions([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newMap = { ...filesMap };
      const newImages = files.map(f => {
        const url = URL.createObjectURL(f);
        newMap[url] = f;
        return url;
      });
      setFilesMap(newMap);
      setImagesList(prev => [...prev, ...newImages].slice(0, 15));
    }
  };

  const handleFloorPlanUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFloorPlanFile(file);
      setFloorPlan(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = (indexToRemove: number) => setImagesList(prev => prev.filter((_, i) => i !== indexToRemove));

  const handleGenerateAI = () => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      const pType = data.propertyType || "Nieruchomość";
      const pDist = data.district || data.address || "prestiżowej lokalizacji";
      const pArea = data.area ? `${data.area} m²` : "przestronna";
      const aiText = `Ekskluzywna oferta w EstateOS. Ten wyjątkowy obiekt (${pType}) o powierzchni ${pArea}, położony w ${pDist}, charakteryzuje się najwyższym standardem wykończenia. Został zaprojektowany z dbałością o każdy detal, aby sprostać oczekiwaniom nawet najbardziej wymagających klientów. Idealna propozycja dla osób ceniących luksus, prywatność i komfort życia na najwyższym poziomie. Zapraszamy do kontaktu w celu umówienia dyskretnej prezentacji.`;
      updateData({ description: aiText });
      setIsGeneratingAI(false);
    }, 1800);
  };

  const handleSubmit = async () => {
    if (initialUser?.limitReached) {
      setActionModal("limit");
      return;
    }

    setIsSubmitting(true);
    try {
      setUploadProgress('Wgrywanie zdjęć na serwer...');
      const finalImages: string[] = [];
      for (const imgUrl of imagesList) {
        if (imgUrl.startsWith('blob:')) {
          const file = filesMap[imgUrl];
          if (file) {
            const formData = new FormData();
            formData.append('file', file);
            try {
              const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
              if (uploadRes.ok) {
                const uploadData = await uploadRes.json();
                finalImages.push(uploadData.url || uploadData.fileUrl || imgUrl);
              } else finalImages.push(imgUrl);
            } catch (err) { finalImages.push(imgUrl); }
          }
        } else finalImages.push(imgUrl);
      }

      let finalFloorPlan = floorPlan;
      if (floorPlan?.startsWith('blob:') && floorPlanFile) {
        const formData = new FormData();
        formData.append('file', floorPlanFile);
        try {
          const upRes = await fetch('/api/upload', { method: 'POST', body: formData });
          if (upRes.ok) {
            const upData = await upRes.json();
            finalFloorPlan = upData.url || upData.fileUrl;
          }
        } catch (e) {}
      }

      setUploadProgress('Zapis do bazy...');
      const dist = data.district || (data.address || "").split(",")[1]?.trim() || "Warszawa"; 
      const cleanPrice = String(data.price || '').replace(/\D/g, "");
      
      const payload = { 
        ...data, 
        title: data.propertyType + " - " + dist, 
        district: dist, 
        price: cleanPrice, 
        area: String(data.area).replace(',', '.'),
        rooms: data.rooms ? String(data.rooms) : null,
        year: data.buildYear ? String(data.buildYear) : null,
        plotArea: data.plotArea ? String(data.plotArea) : null,
        images: finalImages.length > 0 ? JSON.stringify(finalImages) : null, 
        imageUrl: finalImages[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop", 
        floorPlan: finalFloorPlan, 
        amenities: data.amenities.join(", ") 
      };

      const response = await fetch('/api/offers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (response.ok || response.status === 201 || response.status === 200) {
        setActionModal("success");
      } else {
        setActionModal("error");
      }
    } catch (error) { setActionModal("error"); } finally { setIsSubmitting(false); setUploadProgress(''); }
  };

  const isTypeSelected = !!data.propertyType;
  const requiresApartmentNumber = data.propertyType !== 'Działka' && data.propertyType !== 'Dom Wolnostojący';
  const isLocationSelected = !!data.lat && !!data.lng && !!data.district && (!requiresApartmentNumber || !!data.apartmentNumber);
  
  const hasValidPrice = !!String(data.price || '').replace(/\D/g, "");
  const hasValidArea = !!String(data.area || '').replace(/[^0-9.]/g, "");
  const isFinanceDone = isLocationSelected && hasValidPrice && hasValidArea;
  
  const isTechDone = isFinanceDone && (data.propertyType === 'Działka' || ((data.rooms?.length || 0) > 0 && (data.buildYear?.length || 0) === 4));
  const isAmenitiesDone = data.amenities && data.amenities.length > 0;
  const isMediaDone = imagesList.length > 0;
  const isContactDone = initialUser?.isLoggedIn || (!!data.email && !!data.contactPhone && !!data.contactName);

  const stepsArray = [isTypeSelected, isLocationSelected, isFinanceDone, isTechDone, isAmenitiesDone, isMediaDone];
  if (!initialUser?.isLoggedIn) stepsArray.push(isContactDone);
  
  const currentProgress = stepsArray.filter(Boolean).length;
  const progressPercent = Math.max(0, (currentProgress / stepsArray.length) * 100);
  
  const canPublish = initialUser?.isLoggedIn ? isMediaDone : isContactDone;

  return (
    <main className="min-h-screen bg-[#000] text-white pt-24 pb-40 px-4 md:px-8 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
      
      <div className="absolute left-[24px] md:left-[56px] top-64 bottom-0 w-1 hidden md:block bg-[#1a1a1a] rounded-full border border-white/5 shadow-inner z-0 overflow-hidden">
        <motion.div className="w-full bg-emerald-500 shadow-[0_0_15px_#10b981]" initial={{ height: "0%" }} animate={{ height: `${progressPercent}%` }} transition={{ duration: 0.8, ease: "easeInOut" }} />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 pb-20">
        
        <div className="text-center mb-16 md:pl-20 relative z-10">
          <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tighter">Dodaj <span className="text-emerald-500 drop-shadow-[0_0_15px_#10b981]">Ofertę.</span></h1>
          <p className="text-gray-300 text-lg">System publikacji klasy Premium.</p>
        </div>

        <div className="relative md:pl-20 z-10 space-y-16">
            
            <div className={`relative transition-all duration-700 ${isTypeSelected ? 'opacity-100' : 'opacity-100'}`}>
              <div className="absolute top-1/2 -left-[48px] -translate-y-1/2 w-8 h-8 rounded-full bg-[#0a0a0a] border-4 border-[#1a1a1a] flex items-center justify-center z-20 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                  <div className={`w-3 h-3 rounded-full transition-all duration-700 ${currentProgress > 0 ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : 'bg-zinc-800'}`} />
              </div>
              <h2 className="text-sm font-black text-emerald-500 uppercase tracking-[0.2em] mb-6">Krok 1: Kategoria</h2>
              <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 shadow-2xl">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {PROPERTY_TYPES.map(cat => (
                    <CategoryCRMIcon key={cat.id} cat={cat} isActive={data.propertyType === cat.id} onClick={() => updateData({ propertyType: cat.id })} />
                  ))}
                </div>
              </div>
            </div>

            <div className={`relative transition-all duration-700 ${isLocationSelected ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}>
              <StepNode active={isLocationSelected || currentProgress > 1} />
              <h2 className="text-sm font-black text-emerald-500 uppercase tracking-[0.2em] mb-6">Krok 2: Adres i Mapa</h2>
              <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 shadow-2xl">
                <div className="relative flex bg-[#0a0a0a] p-1.5 rounded-full mb-8 border border-white/5 shadow-[inset_0_4px_15px_rgba(0,0,0,0.8)] z-10 max-w-sm mx-auto">
                  <div className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-full transition-transform duration-500 ease-out z-0 bg-gradient-to-b from-white/10 to-transparent border border-white/10 backdrop-blur-xl shadow-[0_8px_20px_rgba(0,0,0,0.5),inset_0_2px_5px_rgba(255,255,255,0.2)]" style={{ transform: data.locationType === 'exact' ? 'translateX(0)' : 'translateX(100%)' }} />
                  <button onClick={() => updateData({ locationType: 'exact' })} className={`flex-1 py-3 text-[10px] md:text-xs font-black uppercase tracking-[0.15em] relative z-10 transition-all duration-500 ${data.locationType === 'exact' ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-zinc-600 hover:text-zinc-400'}`}>Szpilka na Mapie</button>
                  <button onClick={() => updateData({ locationType: 'approximate' })} className={`flex-1 py-3 text-[10px] md:text-xs font-black uppercase tracking-[0.15em] relative z-10 transition-all duration-500 ${data.locationType === 'approximate' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-zinc-600 hover:text-zinc-400'}`}>Radar Okolicy</button>
                </div>
                <div className="relative mb-6 z-50">
                  <label className={labelPremium}>Wyszukaj Adres w Warszawie</label>
                  <MapPin className="absolute left-5 top-[42px] text-emerald-500" size={20} />
                  <input type="text" placeholder="Wpisz ulicę, dzielnicę..." className={`${inputPremium} pl-14`} onChange={(e) => handleAddressSearch(e.target.value)} value={data.address || ''} />
                  {addressSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#161616] border border-emerald-500/30 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50 p-2">
                      {addressSuggestions.map((f, i) => (
                        <div key={i} onClick={() => selectAddress(f)} className="p-4 rounded-lg hover:bg-emerald-500/20 cursor-pointer text-white font-medium transition-colors">{f.place_name_pl || f.text}</div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="w-full h-80 rounded-2xl overflow-hidden bg-[#111] border border-white/5 relative z-0 mb-8">
                  <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" style={{ minHeight: "400px" }} />
                </div>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  <div>
                    <label className={labelPremium}>Dzielnica Warszawy *</label>
                    <div className="relative">
                      <MapIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
                      <select className={`${inputPremium} pl-14 appearance-none cursor-pointer`} value={data.district || ''} onChange={(e) => updateData({ district: e.target.value })}>
                        <option value="" disabled>Wybierz dzielnicę...</option>
                        {["Mokotów", "Praga-Południe", "Wola", "Ursynów", "Bielany", "Śródmieście", "Targówek", "Bemowo", "Ochota", "Wawer", "Praga-Północ", "Białołęka", "Ursus", "Żoliborz", "Włochy", "Wilanów", "Wesoła", "Rembertów", "Poza Warszawą"].map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelPremium}>Numer Mieszkania / Lokalu {requiresApartmentNumber ? '*' : ''}</label>
                    <div className="relative">
                      <Lock className="absolute left-5 top-4 text-emerald-500" size={20} />
                      <input type="text" placeholder="Np. 42A" className={`${inputPremium} pl-14`} value={data.apartmentNumber || ''} onChange={(e) => updateData({ apartmentNumber: e.target.value })} />
                    </div>
                    <p className="mt-3 text-[10px] text-gray-400 flex items-start gap-2 leading-relaxed">
                      <Lock size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span>Nie udostępniamy tego nigdzie publicznie. Adres dokładny podawany jest tylko za wyraźną zgodą właściciela.</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className={`relative transition-all duration-700 ${isFinanceDone ? 'opacity-100' : 'opacity-50 hover:opacity-100 grayscale-[50%] hover:grayscale-0'}`}>
              <StepNode active={isFinanceDone || currentProgress > 3} />
              <h2 className="text-sm font-black text-emerald-500 uppercase tracking-[0.2em] mb-6">Krok 3: Finanse i Dane</h2>
              <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {(() => {
                  const fields = [
                    { id: 'price', label: 'Cena Całkowita (PLN)', placeholder: 'Np. 850 000' }, 
                    { id: 'area', label: 'Powierzchnia (m²)', placeholder: 'Np. 45.5' }
                  ];
                  if (['Dom Wolnostojący', 'Segment', 'Działka'].includes(data.propertyType)) {
                    fields.push({ id: 'plotArea', label: 'Powierzchnia Działki (m²)', placeholder: 'Np. 1200' });
                  }
                  if (data.propertyType !== 'Działka') {
                    fields.push({ id: 'rooms', label: 'Liczba Pokoi', placeholder: 'Np. 3' });
                    fields.push({ id: 'buildYear', label: 'Rok Budowy', placeholder: 'Np. 2026' });
                  }
                  return fields.map(field => (
                    <div key={field.id}>
                      <label className={labelPremium}>{field.label}</label>
                      <input 
                        type="text" 
                        className={inputPremium} 
                        placeholder={field.placeholder} 
                        value={data[field.id] || ''} 
                        onChange={(e) => { 
                          let val = e.target.value;
                          if (field.id === 'price') val = val.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                          else if (field.id === 'area' || field.id === 'plotArea') val = val.replace(/[^0-9.,]/g, "").replace(',', '.').slice(0, 7);
                          else if (field.id === 'rooms') val = val.replace(/\D/g, "").slice(0, 2);
                          else if (field.id === 'buildYear') val = val.replace(/\D/g, "").slice(0, 4);
                          updateData({ [field.id]: val }); 
                        }} 
                      />
                    </div>
                  ));
                })()}

                {(() => {
                  const p = parseInt(String(data.price || '').replace(/\D/g, ''));
                  const a = parseFloat(String(data.area || '').replace(',', '.'));
                  if (!p || !a || a === 0) return null;
                  const ppm = Math.round(p / a);
                  let config = { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Okazja', icon: <Flame size={20} /> };
                  if (ppm > 15000) config = { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: 'Rynkowa', icon: <CheckCircle size={20} /> };
                  if (ppm > 25000) config = { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Luksusowa', icon: <Crown size={20} /> };
                  return (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mt-2 col-span-1 md:col-span-2 flex flex-wrap items-center justify-between p-6 rounded-2xl border ${config.bg} ${config.border} shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-md`}>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Analiza: Cena za m²</span>
                        <span className={`text-3xl font-black tracking-tight ${config.color}`}>{ppm.toLocaleString('pl-PL')} <span className="text-sm font-bold opacity-80">PLN / m²</span></span>
                      </div>
                      <div className={`mt-4 md:mt-0 flex items-center gap-2 px-5 py-3 rounded-xl border ${config.border} bg-[#000]/60 shadow-inner`}>
                        <span className={`${config.color} animate-pulse`}>{config.icon}</span>
                        <span className={`text-xs font-black uppercase tracking-widest ${config.color}`}>{config.label}</span>
                      </div>
                    </motion.div>
                  );
                })()}
              </div>
            </div>

            <div className={`relative transition-all duration-700 ${isAmenitiesDone ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}>
              <StepNode active={isAmenitiesDone || currentProgress > 4} />
              <h2 className="text-sm font-black text-emerald-500 uppercase tracking-[0.2em] mb-6">Krok 4: Udogodnienia Inwestycji</h2>
              <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 shadow-2xl flex flex-wrap gap-3 relative z-10">
                {AMENITIES.map(item => {
                  const isSelected = data.amenities.includes(item);
                  return <button key={item} onClick={() => updateData({ amenities: isSelected ? data.amenities.filter((a: string) => a !== item) : [...data.amenities, item] })} className={`px-6 py-4 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-all duration-300 border ${isSelected ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-[#111] border-white/5 text-gray-400 hover:bg-[#161616] hover:border-white/10 hover:text-white'}`}>{item}</button>;
                })}
              </div>
            </div>

            <div className={`relative transition-all duration-700 ${isMediaDone ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}>
              <StepNode active={isMediaDone || currentProgress > 5} />
              <h2 className="text-sm font-black text-emerald-500 uppercase tracking-[0.2em] mb-6">Krok 5: Galeria i Rzuty</h2>
              <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 shadow-2xl relative z-10">
                <div className="flex flex-wrap gap-4 mb-8">
                  <label className="w-28 h-28 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all bg-[#111] hover:border-emerald-500 hover:text-emerald-400 text-gray-500">
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <Upload size={24} className="mb-2" />
                    <span className="text-[10px] font-black uppercase text-center px-2">Wgraj<br/>Zdjęcia</span>
                  </label>
                  <DndContext collisionDetection={closestCenter} onDragEnd={(event) => { const { active, over } = event; if (active.id !== over?.id && over) { setImagesList((items) => arrayMove(items, items.indexOf(active.id as string), items.indexOf(over.id as string))); } }}>
                    <SortableContext items={imagesList} strategy={rectSortingStrategy}>
                      {imagesList.map((img, idx) => <SortableItem key={img} id={img} img={img} idx={idx} onRemove={handleRemoveImage} />)}
                    </SortableContext>
                  </DndContext>
                </div>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent my-8"></div>
                <label className={labelPremium}><LayoutTemplate size={14} className="inline mr-2 mb-0.5"/> Plan i Rzut (Opcjonalnie)</label>
                {!floorPlan ? (
                  <label className="w-full max-w-sm h-20 border border-dashed rounded-xl flex items-center justify-center gap-4 cursor-pointer transition-all bg-[#111] border-white/10 text-gray-500 hover:border-emerald-500 hover:text-emerald-400 mt-2">
                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFloorPlanUpload} />
                    <LayoutTemplate size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Wgraj Rzut 2D/3D</span>
                  </label>
                ) : (
                  <div className="relative w-full max-w-sm h-32 rounded-xl overflow-hidden border border-emerald-500/30 shadow-xl mt-2 group">
                    <img src={floorPlan} className="w-full h-full object-cover opacity-80" alt="Rzut" />
                    <button onClick={() => { setFloorPlan(null); setFloorPlanFile(null); }} className="absolute top-2 right-2 p-2 bg-red-600/90 rounded-full text-white hover:bg-red-500 transition-all z-20 shadow-lg opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
                  </div>
                )}
                
                <div className="mt-12 relative">
                  <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
                    <label className={labelPremium}><Sparkles size={14} className="inline mr-2 mb-0.5 text-emerald-500"/> AI Opis</label>
                    <button onClick={handleGenerateAI} disabled={isGeneratingAI} className="relative group overflow-hidden px-6 py-2.5 rounded-full border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.8)] transition-all duration-300 hover:border-transparent active:scale-95">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 opacity-70 group-hover:opacity-100 transition-opacity duration-500 blur-[2px]"></div>
                      <div className="absolute inset-0 bg-[#0a0a0a] m-[1.5px] rounded-full z-0 transition-opacity duration-300 group-hover:opacity-0"></div>
                      <div className="relative z-10 flex items-center gap-2 text-[10px] md:text-xs font-black text-white uppercase tracking-[0.2em] drop-shadow-md">
                        {isGeneratingAI ? <Loader2 size={14} className="animate-spin text-purple-400" /> : <Sparkles size={14} className="text-purple-400 group-hover:text-white transition-colors" />}
                        {isGeneratingAI ? 'Generowanie...' : 'Użyj AI Siri'}
                      </div>
                    </button>
                  </div>
                  <textarea placeholder="Wpisz lub wygeneruj sprzedażowe arcydzieło..." className={`${inputPremium} h-40 resize-none relative z-10`} onChange={(e) => updateData({ description: e.target.value })} value={data.description || ''}></textarea>
                </div>
              </div>
            </div>

            {!initialUser?.isLoggedIn && (
              <div className={`relative transition-all duration-700 ${isContactDone ? 'opacity-100' : 'opacity-50 hover:opacity-100 grayscale-[50%] hover:grayscale-0'}`}>
                <StepNode active={isContactDone || currentProgress > 6} />
                <h2 className="text-sm font-black text-emerald-500 uppercase tracking-[0.2em] mb-6">Krok 6: Kontakt i Weryfikacja</h2>
                <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 shadow-2xl relative z-10">
                  <div className="flex items-start gap-3 mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                    <p className="text-xs text-emerald-100/70 leading-relaxed">Uzupełnij dane kontaktowe. Jeśli nie masz konta, stworzymy je i wyślemy na podany numer kod SMS.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelPremium}>Imię i Nazwisko *</label>
                      <div className="relative">
                        <User className="absolute left-5 top-4 text-emerald-500" size={20} />
                        <input type="text" className={`${inputPremium} pl-14`} onChange={(e) => updateData({ contactName: e.target.value })} value={data.contactName || ''} />
                      </div>
                    </div>
                    <div>
                      <label className={labelPremium}>Telefon *</label>
                      <div className="relative">
                        <Phone className="absolute left-5 top-4 text-emerald-500" size={20} />
                        <input type="tel" className={`${inputPremium} pl-14`} onChange={(e) => updateData({ contactPhone: e.target.value })} value={data.contactPhone || ''} />
                      </div>
                    </div>
                    <div>
                      <label className={labelPremium}>Adres E-mail *</label>
                      <div className="relative">
                        <Mail className="absolute left-5 top-4 text-emerald-500" size={20} />
                        <input type="email" className={`${inputPremium} pl-14`} onChange={(e) => updateData({ email: e.target.value })} value={data.email || ''} />
                      </div>
                    </div>
                    <div>
                      <label className={labelPremium}>Hasło (Opcjonalne)</label>
                      <div className="relative">
                        <Lock className="absolute left-5 top-4 text-emerald-500" size={20} />
                        <input type="password" placeholder="Zostaw puste dla logowania SMS" className={`${inputPremium} pl-14`} onChange={(e) => updateData({ password: e.target.value })} value={data.password || ''} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-12 pb-32 relative z-50 w-full">
              <button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !canPublish} 
                className={`relative w-full py-6 md:py-8 rounded-[2rem] text-lg md:text-xl font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all duration-500 overflow-hidden group ${
                  (!canPublish || isSubmitting)
                    ? 'bg-[#111] text-zinc-600 border border-white/5 shadow-[inset_0_4px_20px_rgba(0,0,0,1)] cursor-not-allowed'
                    : 'bg-emerald-500 text-black border border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:shadow-[0_0_50px_rgba(16,185,129,0.8)] hover:bg-emerald-400 hover:-translate-y-1'
                }`}
              >
                {canPublish && !isSubmitting && (
                  <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-50 z-0 pointer-events-none rounded-[2rem]"></div>
                )}
                <span className="relative z-10 flex items-center justify-center gap-3 drop-shadow-sm">
                  {isSubmitting ? <Loader2 className="animate-spin" size={28} /> : (!canPublish ? <Lock size={24} className="text-zinc-600" /> : <Crown size={28} className="transition-transform duration-500 group-hover:scale-125" />)}
                  {isSubmitting ? (uploadProgress || 'WERYFIKACJA...') : 'ZAKOŃCZ I OPUBLIKUJ'}
                </span>
              </button>
            </div>

          </div>
      </div>

      <AnimatePresence>
        {actionModal !== "none" && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-10 md:p-14 max-w-xl w-full shadow-2xl relative overflow-hidden">
              <button onClick={() => setActionModal("none")} className="absolute top-8 right-8 text-white/40 hover:text-white"><X size={28} /></button>
              
              {actionModal === "success" && (
                <div className="text-center">
                  <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]"><CheckCircle className="text-emerald-400" size={36} /></div>
                  <h2 className="text-4xl font-black text-white mb-8">Gotowe!</h2>
                  <p className="text-gray-400 mb-8">Twoja oferta została pomyślnie dodana i czeka na weryfikację.</p>
                  <button onClick={() => window.location.href = '/crm'} className="w-full py-5 bg-emerald-500 text-black font-black uppercase rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:bg-emerald-400 transition-colors">Przejdź do Panelu</button>
                </div>
              )}

              {actionModal === "error" && (
                <div className="text-center">
                  <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]"><AlertCircle className="text-red-500" size={36} /></div>
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Wystąpił Błąd</h2>
                  <p className="text-gray-400 mb-8 leading-relaxed">System nie mógł przetworzyć tej oferty. Upewnij się, że wszystkie dane są poprawne, lub spróbuj ponownie za chwilę.</p>
                  <button onClick={() => setActionModal("none")} className="w-full py-5 bg-[#111] hover:bg-[#161616] border border-white/10 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg">Wróć do formularza</button>
                </div>
              )}

              {actionModal === "limit" && (
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#cba052]/20 to-[#a37b35]/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#cba052]/30 shadow-[0_0_30px_rgba(203,160,82,0.2)] backdrop-blur-sm"><Crown className="text-[#cba052]" size={36} /></div>
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-4 drop-shadow-lg">Wymagany Pakiet</h2>
                  <p className="text-gray-400 mb-8 leading-relaxed text-sm">Wykorzystałeś darmowy limit ogłoszeń dla tego konta. Odblokuj pełen zasięg EstateOS i opublikuj tę ofertę, wykupując jednorazowy dostęp.</p>
                  <button onClick={() => window.location.href = '/cennik'} className="w-full py-6 bg-gradient-to-r from-[#cba052] to-[#a37b35] hover:from-[#d9b165] hover:to-[#b38a42] text-black font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_10px_30px_rgba(203,160,82,0.3)] hover:shadow-[0_15px_40px_rgba(203,160,82,0.5)]"><Crown className="inline mr-2 mb-1" size={20} /> Opublikuj za 29 PLN</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
