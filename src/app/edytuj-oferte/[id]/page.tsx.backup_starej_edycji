"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Loader2, X, GripHorizontal, CheckCircle, User, Building2, FileImage, ArrowRight, ShieldAlert, Lock } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const PROPERTY_TYPES = ["Mieszkanie", "Segment", "Dom Wolnostojący", "Lokal Użytkowy", "Działka"];
const ALL_DISTRICTS = ["Bemowo", "Białołęka", "Bielany", "Mokotów", "Ochota", "Praga-Południe", "Praga-Północ", "Rembertów", "Śródmieście", "Targówek", "Ursus", "Ursynów", "Wawer", "Wesoła", "Wilanów", "Włochy", "Wola", "Żoliborz"];
const AMENITIES = ["Balkon", "Garaż/Miejsce park.", "Piwnica/Pom. gosp.", "Ogródek", "Dwupoziomowe", "Winda"];
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const SortablePhoto = ({ url, onRemove, isMain }: { url: string, onRemove: (url: string) => void, isMain: boolean }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: url });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`relative w-28 h-28 rounded-xl overflow-hidden border group transition-all ${isMain ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-white/10 bg-[#111]'}`}>
      <img src={url} className={`w-full h-full object-cover saturate-[1.2] contrast-[1.1] transition-opacity ${isMain ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`} alt="Foto" />
      <div {...attributes} {...listeners} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 cursor-grab active:cursor-grabbing transition-opacity z-10"><GripHorizontal size={24} className="text-white drop-shadow-md" /></div>
      <button onClick={() => onRemove(url)} className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white/80 hover:text-white hover:bg-red-500 z-20 transition-colors"><X size={12} /></button>
      {isMain && <div className="absolute bottom-0 left-0 w-full bg-emerald-500 text-black text-[9px] uppercase tracking-widest font-black text-center py-1 z-20">Główne</div>}
    </div>
  );
};

export default function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [offerId, setOfferId] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingPlan, setIsUploadingPlan] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [statusChangedMsg, setStatusChangedMsg] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState("");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const updateData = (newData: any) => setData((prev: any) => ({ ...prev, ...newData }));
  const formatNumber = (value: string) => String(value || '').replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const isAgency = data?.advertiserType === 'agency';
  const colorAcc = isAgency ? 'orange' : 'emerald';

  useEffect(() => {
    params.then(p => setOfferId(p.id));
  }, [params]);

  useEffect(() => {
    if (!offerId) return;
    const init = async () => {
      try {
        const [authRes, offerRes] = await Promise.all([fetch('/api/auth/check'), fetch(`/api/offers/${offerId}`)]);
        const auth = await authRes.json();
        const offer = await offerRes.json();

        if (!auth.loggedIn) { setAuthError("Musisz być zalogowany, aby edytować."); setIsAuthorized(false); return; }
        if (offer.error) { setAuthError("Nie znaleziono oferty."); setIsAuthorized(false); return; }
        
        const isOwner = offer.user?.email === auth.user?.email;
        const isAdmin = auth.user?.role === 'ADMIN';

        if (!isOwner && !isAdmin) { setAuthError("Brak uprawnień. To nie jest Twoja oferta."); setIsAuthorized(false); return; }

        setData({
          ...offer,
          price: String(offer.price || ''),
          area: String(offer.area || ''),
          rooms: String(offer.rooms || ''),
          floor: String(offer.floor || ''),
          year: String(offer.year || offer.buildYear || ''),
          plotArea: String(offer.plotArea || ''),
          amenities: offer.amenities || ""
        });
        if (offer.images) setImagesList(offer.images.split(',').filter(Boolean));
        setIsAuthorized(true);
      } catch (e) { setAuthError("Błąd wczytywania oferty z serwera."); setIsAuthorized(false); }
    };
    init();
  }, [offerId]);

  useEffect(() => {
    if (step !== 2 || !data?.lat || !data?.lng || !mapContainerRef.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;
    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({ container: mapContainerRef.current, style: 'mapbox://styles/mapbox/dark-v11', center: [parseFloat(data.lng), parseFloat(data.lat)], zoom: 17, pitch: 65, interactive: false });
      mapRef.current.on('load', () => {
        mapRef.current.addLayer({ 'id': '3d-buildings', 'source': 'composite', 'source-layer': 'building', 'filter': ['==', 'extrude', 'true'], 'type': 'fill-extrusion', 'minzoom': 14, 'paint': { 'fill-extrusion-color': '#1a1a1a', 'fill-extrusion-height': ['get', 'height'], 'fill-extrusion-base': ['get', 'min_height'], 'fill-extrusion-opacity': 0.8 } });
        updateVisuals();
        
        // KRĘCĄCA SIĘ MAPA APPLE 3D
        let spinFrame: number;
        const rotateMap = () => {
            if(mapRef.current) {
                mapRef.current.rotateTo((mapRef.current.getBearing() + 0.1) % 360, { duration: 0 });
                spinFrame = requestAnimationFrame(rotateMap);
            }
        };
        rotateMap();
      });
    } else { 
      mapRef.current.flyTo({ center: [parseFloat(data.lng), parseFloat(data.lat)] }); 
      updateVisuals(); 
    }
    
    function updateVisuals() {
      if (markerRef.current) markerRef.current.remove();
      const el = document.createElement('div'); el.className = 'relative flex items-center justify-center'; el.innerHTML = `<div class="absolute w-12 h-12 bg-red-500 rounded-full animate-ping opacity-40"></div><div class="relative z-10 w-5 h-5 bg-red-600 border-[3px] border-white rounded-full shadow-[0_0_20px_rgba(239,68,68,1)]"></div>`;
      markerRef.current = new mapboxgl.Marker({ element: el }).setLngLat([parseFloat(data.lng), parseFloat(data.lat)]).addTo(mapRef.current);
    }
  }, [step, data?.lat, data?.lng]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files || files.length === 0) return;
    setIsUploading(true); const formData = new FormData(); Array.from(files).forEach(f => formData.append("files", f));
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) { const d = await res.json(); const newImgs = [...imagesList, ...d.images].slice(0, 7); setImagesList(newImgs); updateData({ images: newImgs.join(","), imageUrl: newImgs[0] }); }
    setIsUploading(false);
  };

  const handleFloorPlanUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files || files.length === 0) return;
    setIsUploadingPlan(true); const formData = new FormData(); formData.append("files", files[0]);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) { const dataU = await res.json(); updateData({ floorPlan: dataU.images[0] }); }
    } finally { setIsUploadingPlan(false); }
  };

  const removeImage = (url: string) => { const n = imagesList.filter(u => u !== url); setImagesList(n); updateData({ images: n.join(","), imageUrl: n[0] || '' }); };
  const removePlan = () => updateData({ floorPlan: undefined });

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setImagesList((items) => {
        const newItems = arrayMove(items, items.indexOf(active.id), items.indexOf(over.id));
        updateData({ images: newItems.join(","), imageUrl: newItems[0] }); return newItems;
      });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const res = await fetch(`/api/offers/${offerId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, images: imagesList.join(",") }) });
    if (res.ok) { 
       const resData = await res.json();
       if (resData.statusChanged) setStatusChangedMsg(true);
       setIsSuccess(true); 
       setTimeout(() => router.back(), 4000); 
    } else { 
       alert("Wystąpił błąd zapisu."); 
       setIsSubmitting(false); 
    }
  };

  const isStepValid = () => {
    if (!data) return false;
    if (step === 1) return (data.title?.length || 0) >= 10 && (data.price?.length || 0) > 1 && (data.area?.length || 0) > 0;
    if (step === 2) return (data.address?.length || 0) > 5 && imagesList.length > 0;
    if (step === 3) return (data.contactName?.length || 0) > 2 && (data.contactPhone?.length || 0) >= 9;
    return false;
  };

  if (isAuthorized === null || !data) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;
  if (isAuthorized === false) return <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center"><ShieldAlert size={80} className="text-red-500 mb-6 opacity-80" /><h2 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">{authError}</h2><Link href="/" className="mt-8 text-emerald-500 font-bold uppercase tracking-widest underline hover:text-emerald-400">Wróć na start</Link></div>;

  const themeText = isAgency ? 'text-orange-500' : 'text-emerald-500';
  const themeBg = isAgency ? 'bg-orange-500' : 'bg-emerald-500';
  const themeBgHover = isAgency ? 'hover:bg-orange-400' : 'hover:bg-emerald-400';
  const themeBorderLight = isAgency ? 'border-orange-500/20' : 'border-emerald-500/20';
  const themeShadow = isAgency ? 'shadow-[0_0_30px_-5px_rgba(249,115,22,0.4)]' : 'shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)]';

  const inputCardClass = "bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-6 focus-within:border-white/30 transition-colors shadow-2xl";
  const labelClass = "text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] block mb-3";
  const inputClass = "w-full text-2xl md:text-3xl font-medium placeholder:text-white/10 text-white bg-transparent outline-none focus:ring-0";
  
  const getBtnClass = () => { return "w-full py-6 rounded-[2rem] font-black text-lg md:text-xl uppercase tracking-[0.2em] flex items-center justify-center gap-3 relative overflow-hidden group premium-action-btn " + (isAgency ? "color-orange" : "color-green"); };

  return (
    <main className="bg-[#050505] text-white min-h-screen p-6 pt-32 pb-40 relative">
      <AnimatePresence>
        {isSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[999] bg-[#050505]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
            <CheckCircle className={`${themeText} mb-6 mx-auto ${themeShadow}`} size={80} strokeWidth={1.5} />
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tighter">Zapisano zmiany!</h2>
            {statusChangedMsg && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-2xl max-w-md mx-auto mb-6">
                  <p className="text-yellow-500 font-bold text-sm">Edytowano parametry chronione.</p>
                  <p className="text-white/70 text-xs mt-1">Oferta została cofnięta do weryfikacji. Dział moderacji wkrótce ją zatwierdzi.</p>
               </motion.div>
            )}
            <div className={`flex items-center gap-3 ${themeText}`}><Loader2 className="animate-spin" size={20} /><span className="text-xs uppercase tracking-widest font-bold">Przenoszenie...</span></div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto">
        <button onClick={() => router.back()} className="text-white/40 hover:text-white mb-10 inline-block text-[10px] uppercase tracking-widest font-bold transition-colors">← Wróć bez zapisywania</button>
        <div className="flex gap-2 mb-12">{[1,2,3].map(s => <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? themeBg : 'bg-white/10'}`} />)}</div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="k1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter italic">Edytuj <span className="text-white/30">detale.</span></h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-6">
                <div className={`${inputCardClass} md:col-span-2`}>
                  <label className={labelClass}>Tytuł ogłoszenia</label>
                  <input type="text" maxLength={60} className={inputClass} onChange={e => updateData({ title: e.target.value })} value={data.title || ''} />
                </div>
                <div className={inputCardClass}>
                  <label className={labelClass}>Typ Nieruchomości</label>
                  <select className={`${inputClass} appearance-none cursor-pointer`} onChange={e => updateData({ propertyType: e.target.value })} value={data.propertyType || "Mieszkanie"}>
                    {PROPERTY_TYPES.map(d => <option key={d} className="bg-black text-white">{d}</option>)}
                  </select>
                </div>
                <div className={inputCardClass}>
                  <label className={labelClass}>Dzielnica</label>
                  <select className={`${inputClass} appearance-none cursor-pointer`} onChange={e => updateData({ district: e.target.value })} value={data.district || "Śródmieście"}>
                    {ALL_DISTRICTS.map(d => <option key={d} className="bg-black text-white">{d}</option>)}
                  </select>
                </div>
                <div className={inputCardClass}>
                  <label className={labelClass}>Cena (PLN)</label>
                  <input type="text" className={inputClass} onChange={e => updateData({ price: formatNumber(e.target.value) })} value={data.price || ''} />
                </div>
                <div className={inputCardClass}>
                  <label className={labelClass}>Metraż (m²)</label>
                  <input type="text" className={inputClass} onChange={e => updateData({ area: String(e.target.value).replace(/[^0-9.,]/g, '').replace(',', '.') })} value={data.area || ''} />
                </div>
                <div className={inputCardClass}>
                  <label className={labelClass}>Liczba pokoi</label>
                  <input type="text" className={inputClass} onChange={e => updateData({ rooms: String(e.target.value).replace(/\D/g, "") })} value={data.rooms || ''} />
                </div>
                {data.propertyType !== 'Działka' && (
                  <div className={inputCardClass}>
                    <label className={labelClass}>{['Dom Wolnostojący', 'Segment'].includes(data.propertyType || '') ? 'Ilu piętrowy budynek?' : 'Piętro'}</label>
                    <select className={`${inputClass} appearance-none cursor-pointer`} onChange={e => updateData({ floor: e.target.value })} value={data.floor || "0"}>
                      <option className="bg-[#050505] text-white" value="-1">-1 (Suterena / Piwnica)</option>
                      <option className="bg-[#050505] text-white" value="0">0 (Parter)</option>
                      {[...Array(10)].map((_, i) => <option key={i+1} className="bg-[#050505] text-white" value={i+1}>{i+1}</option>)}
                      <option className="bg-[#050505] text-white" value="11+">ponad 10</option>
                    </select>
                  </div>
                )}
                {['Dom Wolnostojący', 'Segment', 'Działka'].includes(data.propertyType || '') && (
                  <div className={`${inputCardClass} md:col-span-2`}>
                    <label className={labelClass}>Powierzchnia działki (m²)</label>
                    <input type="text" className={inputClass} onChange={e => updateData({ plotArea: String(e.target.value).replace(/[^0-9.,]/g, "").replace(',', '.') })} value={data.plotArea || ''} />
                  </div>
                )}
                
                {/* KAFELKI UDOGODNIEŃ (ZAMIENNIKI) */}
                <div className={`${inputCardClass} md:col-span-2 shadow-2xl`}>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] block mb-3">Dodatkowe Udogodnienia <span className="text-white/30 lowercase normal-case tracking-normal font-normal text-xs ml-2">(Zaznacz klikając)</span></label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                    {AMENITIES.map(a => {
                      const cur = (data.amenities || "").split(',');
                      const sel = cur.includes(a);
                      return (
                        <button type="button" key={a} onClick={() => {
                          const next = sel ? cur.filter((i:any)=>i!==a) : [...cur, a];
                          updateData({ amenities: next.join(',') });
                        }} className={`relative overflow-hidden p-4 rounded-2xl border transition-all duration-300 flex items-center gap-3 group ${sel ? (colorAcc === 'orange' ? 'bg-orange-500/10 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]') : 'bg-black/40 border-white/5 hover:border-white/20'}`}>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${sel ? (colorAcc === 'orange' ? 'border-orange-500 bg-orange-500' : 'border-emerald-500 bg-emerald-500') : 'border-white/20 bg-transparent'}`}>
                             {sel && <CheckCircle size={12} className="text-black" />}
                          </div>
                          <span className={`text-xs sm:text-sm font-bold ${sel ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`}>{a}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className={`${inputCardClass} md:col-span-2`}>
                  <label className={labelClass}>Opis inwestycji</label>
                  <textarea rows={6} className="w-full text-xl font-medium placeholder:text-white/10 text-white bg-transparent outline-none focus:ring-0 resize-none" onChange={e => updateData({ description: e.target.value })} value={data.description || ''} />
                </div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <button disabled={!isStepValid()} onClick={() => { if(!data?.title || !data?.price || !data?.area) { alert("Uzupełnij wymagane pola."); return; } setStep(2); }} className={getBtnClass()}>
                  {isStepValid() && <span className={`absolute inset-0 rounded-[2rem] border-[3px] ${colorAcc === 'orange' ? 'border-orange-900/30' : 'border-emerald-900/30'} opacity-0 group-hover:animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]`}></span>}
                  <span className="relative flex items-center justify-center gap-3 z-10">
                    {isStepValid() ? <>Dalej <ArrowRight size={24} /></> : "Wypełnij wymagane pola, aby przejść dalej"}
                  </span>
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="k2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter italic">Lokalizacja <span className="text-white/30">& foto.</span></h1>
              
              {/* ZABLOKOWANY ADRES */}
              <div className={`relative ${inputCardClass} z-50`}>
                <div className="flex justify-between items-center mb-3">
                   <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Dokładny Adres</label>
                   <span className="text-[9px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/20 flex items-center gap-1"><Lock size={10}/> Zablokowane</span>
                </div>
                <input type="text" disabled className={`${inputClass} opacity-50 cursor-not-allowed`} value={data.address || ''} />
                {data.lat && data.lng && (
                  <div className="mt-8 pt-6 border-t border-white/10 relative z-0">
                    <div className="w-full h-[250px] rounded-[2rem] overflow-hidden border border-white/20 shadow-2xl relative bg-[#111]">
                      <div ref={mapContainerRef} className="w-full h-full pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-6 transition-colors shadow-2xl relative z-0">
                <div className="flex justify-between items-center mb-4">
                  <label className={`text-[10px] font-bold uppercase tracking-widest block ${themeText}`}>Zdjęcia obiektu (max 7)</label>
                  {isUploading && <Loader2 className={`animate-spin ${themeText}`} size={16} />}
                </div>
                <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} disabled={isUploading || imagesList.length >= 7} className={`w-full text-white/40 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold transition-colors cursor-pointer file:bg-${colorAcc}-500/10 file:text-${colorAcc}-500 hover:file:bg-${colorAcc}-500 hover:file:text-black`}/>
                <div className="flex gap-3 flex-wrap mt-6">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={imagesList} strategy={horizontalListSortingStrategy}>
                      {imagesList.map((url, index) => <SortablePhoto key={url} url={url} onRemove={removeImage} isMain={index === 0} />)}
                    </SortableContext>
                  </DndContext>
                </div>
              </div>
              <div className={inputCardClass}>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block flex items-center gap-2"><FileImage size={12}/> Rzut lokalu</label>
                  {isUploadingPlan && <Loader2 className="animate-spin text-white/40" size={16} />}
                </div>
                {!data.floorPlan ? (
                  <input type="file" accept="image/*,.pdf" onChange={handleFloorPlanUpload} disabled={isUploadingPlan} className="w-full text-white/40 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 transition-colors cursor-pointer"/>
                ) : (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/20 bg-[#111] group">
                    <img src={data.floorPlan} className="w-full h-full object-cover opacity-80" alt="Rzut" />
                    <button onClick={removePlan} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold uppercase tracking-widest">Usuń</button>
                  </div>
                )}
              </div>
              <div className="flex gap-4 pt-8 pb-16">
                <button onClick={() => setStep(1)} className="px-8 py-6 rounded-[2rem] font-bold border border-white/20 hover:bg-white/5 transition-all uppercase text-[10px] tracking-widest text-white/70 hover:text-white">Wróć</button>
                <div className="flex-1">
                  <button disabled={!isStepValid() || isUploading || isUploadingPlan} onClick={() => setStep(3)} className={getBtnClass()}>
                    {isStepValid() && !isUploading && !isUploadingPlan && <span className={`absolute inset-0 rounded-[2rem] border-[3px] ${colorAcc === 'orange' ? 'border-orange-900/30' : 'border-emerald-900/30'} opacity-0 group-hover:animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]`}></span>}
                    <span className="relative flex items-center justify-center gap-3 z-10">
                      {isStepValid() ? <>Dalej <ArrowRight size={24} /></> : "Wgraj adres i min. 1 zdjęcie, aby przejść dalej"}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="k3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter italic">Kontakt.</h1>
              <div className={`p-10 rounded-[3rem] border border-white/10 bg-[#0a0a0a] shadow-2xl space-y-8 ${themeBorderLight}`}>
                {isAgency && (
                  <div className="space-y-3">
                    <label className={`text-[10px] font-bold uppercase tracking-widest ${themeText}`}>Nazwa Agencji</label>
                    <input type="text" className={`w-full bg-transparent border-b border-white/10 pb-4 text-2xl outline-none focus:${themeBorderLight} text-white`} onChange={e => updateData({ agencyName: e.target.value })} value={data.agencyName || ''} />
                  </div>
                )}
                <div className="space-y-3">
                  <label className={`text-[10px] font-bold uppercase tracking-widest ${themeText}`}>{isAgency ? 'Imię i Nazwisko Agenta' : 'Osoba Kontaktowa'}</label>
                  <input type="text" className={`w-full bg-transparent border-b border-white/10 pb-4 text-2xl outline-none focus:${themeBorderLight} text-white`} onChange={e => updateData({ contactName: e.target.value })} value={data.contactName || ''} />
                </div>
                
                {/* ZABLOKOWANY TELEFON */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                     <label className={`text-[10px] font-bold uppercase tracking-widest ${themeText}`}>Telefon Kontaktowy</label>
                     <span className="text-[9px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/20 flex items-center gap-1"><Lock size={10}/> Zablokowane</span>
                  </div>
                  <div className="flex items-center border-b border-white/5 pb-4 text-2xl opacity-50 cursor-not-allowed">
                    <span className="text-white/40 mr-2">+48</span>
                    {/* W locie czyścimy numer z podwójnego 48 (jeśli jest w bazie) na potrzeby wyświetlania */}
                    <input type="text" disabled className="w-full bg-transparent outline-none text-white cursor-not-allowed" value={String(data.contactPhone || '').replace(/^(?:\+48|48)/, '')} />
                  </div>
                </div>

              </div>
              <div className="flex gap-4 pt-8 pb-16">
                <button onClick={() => setStep(2)} className="px-8 py-6 rounded-[2rem] font-bold border border-white/20 hover:bg-white/5 transition-all uppercase text-[10px] tracking-widest text-white/70 hover:text-white">Wróć</button>
                <div className="flex-1">
                  <button onClick={handleSubmit} disabled={!isStepValid() || isSubmitting} className={getBtnClass()}>
                    {isStepValid() && !isSubmitting && <span className={`absolute inset-0 rounded-[2rem] border-[3px] ${colorAcc === 'orange' ? 'border-orange-900/30' : 'border-emerald-900/30'} opacity-0 group-hover:animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]`}></span>}
                    <span className="relative flex items-center justify-center gap-3 z-10">
                      {isSubmitting ? <><Loader2 className="animate-spin" size={24}/> Zapisywanie...</> : (isStepValid() ? 'Zakończ Edycję i Zapisz' : 'Wypełnij dane kontaktowe')}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
