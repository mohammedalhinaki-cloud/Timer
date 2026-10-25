/** Music-free, offline timer alerts. Sound selection persists across visits. */
export const ALARM_SOUNDS = [
  { id: 'classic', label: 'جرس كلاسيكي' },
  { id: 'digital', label: 'منبه رقمي' },
  { id: 'gentle', label: 'رنين هادئ' },
  { id: 'school', label: 'جرس مدرسة' },
  { id: 'soft', label: 'نغمة تنبيه خفيفة' },
] as const;

export type AlarmSoundId = typeof ALARM_SOUNDS[number]['id'];
const ALARM_KEY = 'tenvylo_completion_alarm_v1';
const isValid = (id: string): id is AlarmSoundId =>
  ALARM_SOUNDS.some((sound) => sound.id === id);

export function getSelectedAlarmSound(): AlarmSoundId {
  try {
    const saved = localStorage.getItem(ALARM_KEY) || '';
    return isValid(saved) ? saved : 'classic';
  } catch { return 'classic'; }
}
export function setSelectedAlarmSound(id: AlarmSoundId): void {
  if (!isValid(id)) return;
  try { localStorage.setItem(ALARM_KEY, id); } catch { /* storage disabled */ }
}

type Strike = { at: number; hz: number; duration: number; level: number };
const patterns: Record<AlarmSoundId, Strike[]> = {
  classic: [{at:0,hz:784,duration:1.7,level:1},{at:.28,hz:988,duration:1.5,level:.7}],
  digital: [{at:0,hz:880,duration:.15,level:1},{at:.26,hz:880,duration:.15,level:1},{at:.52,hz:1047,duration:.2,level:.85}],
  gentle: [{at:0,hz:659,duration:1.5,level:.75},{at:.34,hz:784,duration:1.3,level:.7},{at:.7,hz:988,duration:1.2,level:.55}],
  school: [{at:0,hz:720,duration:.65,level:.9},{at:.35,hz:720,duration:.65,level:1},{at:.75,hz:930,duration:.65,level:.9},{at:1.1,hz:930,duration:.65,level:1}],
  soft: [{at:0,hz:680,duration:.15,level:.8},{at:.43,hz:680,duration:.15,level:.65}],
};
const durations: Record<AlarmSoundId, number> =
  {classic:2.7,digital:2.0,gentle:2.9,school:2.5,soft:2.2};
let context: AudioContext | null = null;
let looping: AudioBufferSourceNode | null = null;
let loopGain: GainNode | null = null;
let preview: AudioBufferSourceNode | null = null;
let previewGain: GainNode | null = null;
const cache = new Map<AlarmSoundId,AudioBuffer>();

function audioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (context && context.state !== 'closed') return context;
  try {
    const Constructor = window.AudioContext ||
      (window as Window & {webkitAudioContext?: typeof AudioContext}).webkitAudioContext;
    if (!Constructor) return null;
    context = new Constructor();
    cache.clear();
    return context;
  } catch { return null; }
}
export function warmupAudioContext(): void {
  const ctx = audioContext();
  if (ctx?.state === 'suspended') void ctx.resume().catch(() => {});
}
function bufferFor(ctx: AudioContext, id: AlarmSoundId): AudioBuffer {
  const existing = cache.get(id);
  if (existing) return existing;
  const sr = ctx.sampleRate;
  const b = ctx.createBuffer(1,Math.ceil(sr * durations[id]),sr);
  const samples=b.getChannelData(0);
  for(let i=0;i<samples.length;i++){
    const t=i/sr;
    let v=0;
    for(const p of patterns[id]){
      const dt=t-p.at;
      if(dt<0||dt>=p.duration) continue;
      const phase=2*Math.PI*p.hz*dt;
      const edge=Math.min(1,dt/.008)*Math.min(1,(p.duration-dt)/.05);
      const decay=(id==='classic'||id==='gentle'||id==='school')
        ? Math.exp(-(id==='school'?3.7:2.8)*dt):1;
      let wave=Math.sin(phase);
      if(id==='classic') wave=.65*wave+.23*Math.sin(2.01*phase)+.12*Math.sin(3.07*phase);
      if(id==='school') wave=.53*wave+.3*Math.sin(2.17*phase)+.17*Math.sin(3.82*phase);
      if(id==='digital') wave=.72*wave+.2*Math.sin(3*phase)+.08*Math.sin(5*phase);
      if(id==='gentle') wave=.88*wave+.12*Math.sin(2*phase);
      v+=p.level*wave*edge*decay;
    }
    samples[i]=Math.max(-1,Math.min(1,v));
  }
  cache.set(id,b);
  return b;
}
function disconnect(src: AudioBufferSourceNode|null,gain: GainNode|null): void {
  try{src?.stop();}catch{/* already stopped */}
  try{src?.disconnect();}catch{/* ignore */}
  try{gain?.disconnect();}catch{/* ignore */}
}
export function stopAlarmPreview(): void {
  const s=preview,g=previewGain;
  preview=null;previewGain=null;
  disconnect(s,g);
}
function play(id: AlarmSoundId, repeat: boolean): void {
  const ctx=audioContext();
  if(!ctx)return;
  try{
    const source=ctx.createBufferSource();
    const gain=ctx.createGain();
    source.buffer=bufferFor(ctx,id);
    source.loop=repeat;
    gain.gain.value = id === 'soft' ? 0.35 : id === 'school' ? 0.5 : 0.6;
    source.connect(gain);
    gain.connect(ctx.destination);
    if(repeat){looping=source;loopGain=gain;}
    else {
      preview=source;previewGain=gain;
      source.onended=()=>{
        if(preview===source){preview=null;previewGain=null;}
        try{source.disconnect();gain.disconnect();}catch{/* ignore */}
      };
    }
    source.start();
    if(ctx.state==='suspended')void ctx.resume().catch(()=>{});
  }catch{
    if(repeat)stopRepeatingFinishBell();
    else stopAlarmPreview();
  }
}
export function previewAlarmSound(id: AlarmSoundId): void {
  stopAlarmPreview();
  play(id,false);
}
export function startRepeatingFinishBell(): void {
  if(looping)return;
  stopAlarmPreview();
  play(getSelectedAlarmSound(),true);
}
export function stopRepeatingFinishBell(): void {
  const s=looping,g=loopGain;
  looping=null;loopGain=null;
  disconnect(s,g);
}
