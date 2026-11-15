"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowDownToLine, AudioLines, Check, CheckCircle2, ChevronRight, CircleAlert, Clock3, FileAudio, FileText, ListTodo, Mic2, Plus, RefreshCw, Sparkles, UploadCloud, Users, WandSparkles, X } from "lucide-react";
import type { MeetingInsight } from "@/lib/types";

type Saved = { id: string; name: string; date: string; provider: string; data: MeetingInsight };
const empty: MeetingInsight = { title: "", summary: "", keyPoints: [], decisions: [], actionItems: [], complaints: [], risks: [], followUps: [] };

export default function Home() {
  const [tab, setTab] = useState<"upload" | "transcript">("upload");
  const [transcript, setTranscript] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<MeetingInsight | null>(null);
  const [provider, setProvider] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<Saved[]>([]);
  const [active, setActive] = useState("new");

  useEffect(() => {
    try { setSaved(JSON.parse(localStorage.getItem("voxnote-meetings") || "[]")); } catch {}
  }, []);
  const completed = result?.actionItems.filter(x => x.owner).length || 0;

  async function processMeeting() {
    setBusy(true); setError(""); setResult(null);
    try {
      const body = new FormData();
      if (file && tab === "upload") body.append("audio", file);
      else body.append("transcript", transcript);
      const response = await fetch("/api/analyze", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed");
      setResult(data.result); setProvider(data.provider);
      const item: Saved = { id: crypto.randomUUID(), name: data.result.title || file?.name || "Meeting", date: new Date().toISOString(), provider: data.provider, data: data.result };
      setSaved(old => { const next = [item, ...old].slice(0, 30); localStorage.setItem("voxnote-meetings", JSON.stringify(next)); return next; });
      setActive(item.id);
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong"); }
    finally { setBusy(false); }
  }

  function openSaved(item: Saved) { setResult(item.data); setProvider(item.provider); setActive(item.id); }
  function download() {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "voxnote-meeting-insights.json"; a.click(); URL.revokeObjectURL(url);
  }

  return <main className="min-h-screen">
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#09090d]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 lg:px-8">
        <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300"><AudioLines size={23}/></div><div><div className="text-lg font-bold tracking-tight">voxnote<span className="text-violet-400">.</span></div><div className="text-[10px] tracking-[.22em] text-zinc-500">MEETING INTELLIGENCE</div></div></div>
        <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-xs text-emerald-300 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"/> AI system ready</div>
        <button onClick={() => {setResult(null);setFile(null);setTranscript("");setActive("new");}} className="btn border border-white/10 text-sm text-zinc-300 hover:bg-white/5"><Plus size={16}/> New meeting</button>
      </div>
    </header>

    <div className="mx-auto grid max-w-[1440px] gap-6 px-5 py-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:px-8">
      <aside className="space-y-5">
        <div className="panel p-4"><div className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">Workspace</div><div className="flex items-center gap-3 rounded-xl bg-violet-500/10 p-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500 text-sm font-bold">E</div><div><div className="text-sm font-semibold">The Experts</div><div className="text-xs text-zinc-500">Personal workspace</div></div></div></div>
        <div><div className="mb-3 px-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">Your workspace</div><div className="space-y-1"><div className="flex items-center gap-3 rounded-xl bg-white/[.06] px-3 py-2.5 text-sm text-white"><Activity size={17} className="text-violet-300"/> Overview</div><div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400"><ListTodo size={17}/> Action items</div><div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400"><Users size={17}/> People & owners</div></div></div>
        <div><div className="mb-3 flex items-center justify-between px-2"><span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Recent meetings</span><span className="text-xs text-zinc-600">{saved.length}</span></div><div className="space-y-1">{saved.map(item => <button key={item.id} onClick={() => openSaved(item)} className={`w-full rounded-xl px-3 py-2.5 text-left text-sm ${active === item.id ? "bg-violet-500/10 text-violet-200" : "text-zinc-400 hover:bg-white/[.04]"}`}><div className="truncate">{item.name}</div><div className="mt-1 text-[11px] text-zinc-600">{new Date(item.date).toLocaleDateString()}</div></button>)}{!saved.length && <div className="px-3 text-xs text-zinc-600">Your processed meetings appear here.</div>}</div></div>
        <div className="panel p-4"><div className="mb-2 flex items-center gap-2 text-sm font-semibold"><Sparkles size={16} className="text-violet-300"/> Powered by AI</div><p className="text-xs leading-5 text-zinc-500">NVIDIA is primary. Gemini automatically takes over if the primary provider is unavailable.</p></div>
      </aside>

      <section className="min-w-0 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><div className="mb-2 text-xs font-semibold uppercase tracking-[.2em] text-violet-300">Your meeting command center</div><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Turn conversations<br className="sm:hidden"/> into <span className="text-violet-300">momentum.</span></h1><p className="mt-2 max-w-xl text-sm text-zinc-400">Extract decisions, assign ownership, and make sure the important things actually happen.</p></div><div className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-400"><Clock3 size={14}/> {new Date().toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})}</div></div>

        {!result && <div className="panel overflow-hidden">
          <div className="border-b border-white/10 px-5 py-4"><div className="flex items-center gap-2 text-sm font-semibold"><WandSparkles size={17} className="text-violet-300"/> New meeting analysis</div><p className="mt-1 text-xs text-zinc-500">Upload a recording or paste an existing transcript.</p></div>
          <div className="p-5">
            <div className="mb-5 flex w-fit rounded-xl bg-black/30 p-1"><button onClick={() => setTab("upload")} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm ${tab==="upload"?"bg-violet-500 text-white":"text-zinc-400"}`}><FileAudio size={15}/> Audio file</button><button onClick={() => setTab("transcript")} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm ${tab==="transcript"?"bg-violet-500 text-white":"text-zinc-400"}`}><FileText size={15}/> Transcript</button></div>
            {tab === "upload" ? <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-violet-400/30 bg-violet-500/[.035] px-5 text-center transition hover:border-violet-400/60 hover:bg-violet-500/[.07]"><input type="file" accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)}/><div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300"><UploadCloud size={26}/></div><div className="font-semibold">{file ? file.name : "Drop your meeting recording here"}</div><div className="mt-2 text-xs text-zinc-500">{file ? `${(file.size/1024/1024).toFixed(1)} MB · Ready to analyze` : "or click to browse · MP3, WAV, M4A, WEBM"}</div><div className="mt-4 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400">Choose audio file</div></label> : <div><textarea value={transcript} onChange={e => setTranscript(e.target.value)} placeholder={"Paste your meeting transcript here...\n\nSpeaker 1: We need to ship the new dashboard by Friday.\nSpeaker 2: I'll take ownership of the frontend..."} className="field min-h-56 resize-y text-sm leading-6"/><div className="mt-2 text-right text-xs text-zinc-600">{transcript.length.toLocaleString()} characters</div></div>}
            {error && <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-300"><CircleAlert size={17} className="mt-0.5 shrink-0"/>{error}</div>}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-zinc-600">Your content is sent securely to the configured AI provider for processing.</p><button onClick={processMeeting} disabled={busy || (tab==="upload" ? !file : !transcript.trim())} className="btn btn-primary">{busy ? <><RefreshCw size={16} className="animate-spin"/> Analyzing meeting...</> : <><Sparkles size={16}/> Generate meeting insights <ChevronRight size={16}/></>}</button></div>
          </div>
        </div>}

        {result && <div className="space-y-5">
          <div className="panel p-5 sm:p-6"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2 text-xs text-emerald-300"><CheckCircle2 size={15}/> Analysis complete · {provider}</div><button onClick={download} className="btn border border-white/10 text-xs text-zinc-300"><ArrowDownToLine size={14}/> Export JSON</button></div><h2 className="text-2xl font-semibold">{result.title}</h2><p className="mt-3 max-w-4xl text-sm leading-7 text-zinc-300">{result.summary}</p></div>
          <div className="grid gap-3 sm:grid-cols-3"><Stat icon={<ListTodo size={17}/>} label="Action items" value={result.actionItems.length}/><Stat icon={<CheckCircle2 size={17}/>} label="With identified owner" value={completed}/><Stat icon={<CircleAlert size={17}/>} label="Issues detected" value={result.complaints.length}/></div>
          <div className="grid gap-5 xl:grid-cols-2">
            <div className="panel p-5"><Heading icon={<ListTodo size={17}/>} title="Action items" count={result.actionItems.length}/><div className="mt-4 space-y-3">{result.actionItems.map((item,i)=><div key={i} className="rounded-xl border border-white/[.07] bg-black/20 p-3"><div className="flex gap-3"><div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-xs text-violet-300">{i+1}</div><div className="min-w-0 flex-1"><div className="text-sm font-medium">{item.task}</div><div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-500"><span className="rounded-md bg-white/[.05] px-2 py-1">Owner: {item.owner || "Unassigned"}</span><span className="rounded-md bg-white/[.05] px-2 py-1">Due: {item.dueDate || "Not specified"}</span><span className={`rounded-md px-2 py-1 ${item.priority==="high"?"bg-red-500/10 text-red-300":"bg-white/[.05]"}`}>{item.priority} priority</span></div></div></div></div>)}</div>{!result.actionItems.length && <Empty text="No explicit action items were identified."/>}</div>
            <div className="panel p-5"><Heading icon={<Check size={17}/>} title="Decisions made" count={result.decisions.length}/><div className="mt-4 space-y-3">{result.decisions.map((d,i)=><div key={i} className="rounded-xl border border-white/[.07] p-3"><div className="text-sm font-medium">{d.decision}</div>{d.context && <p className="mt-1 text-xs leading-5 text-zinc-500">{d.context}</p>}</div>)}</div>{!result.decisions.length && <Empty text="No confirmed decisions were identified."/>}</div>
            <div className="panel p-5"><Heading icon={<CircleAlert size={17}/>} title="Complaints & issues" count={result.complaints.length}/><div className="mt-4 space-y-3">{result.complaints.map((c,i)=><div key={i} className="flex items-start justify-between gap-3 rounded-xl border border-white/[.07] p-3"><div className="text-sm">{c.issue}<div className="mt-1 text-xs text-zinc-500">Owner: {c.owner || "Unassigned"}</div></div><span className="rounded-md bg-amber-500/10 px-2 py-1 text-[11px] text-amber-300">{c.severity}</span></div>)}</div>{!result.complaints.length && <Empty text="No complaints were identified."/>}</div>
            <div className="panel p-5"><Heading icon={<Activity size={17}/>} title="Key discussion points" count={result.keyPoints.length}/><BulletList items={result.keyPoints}/></div>
            <div className="panel p-5"><Heading icon={<CircleAlert size={17}/>} title="Risks & blockers" count={result.risks.length}/><BulletList items={result.risks}/></div>
            <div className="panel p-5"><Heading icon={<Clock3 size={17}/>} title="Follow-ups" count={result.followUps.length}/><BulletList items={result.followUps}/></div>
          </div>
          <div className="flex justify-end"><button onClick={() => {setResult(null);setActive("new");}} className="btn border border-white/10 text-sm text-zinc-300"><Plus size={15}/> Analyze another meeting</button></div>
        </div>}
        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[.07] pt-5 text-[11px] text-zinc-600"><span>VOXNOTE · THE EXPERTS · v0.1.0</span><span>Human review required before acting on AI-generated outputs.</span></footer>
      </section>
    </div>
  </main>;
}

function Stat({icon,label,value}:{icon:React.ReactNode;label:string;value:number}) { return <div className="panel flex items-center gap-3 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">{icon}</div><div><div className="text-2xl font-semibold">{value}</div><div className="text-xs text-zinc-500">{label}</div></div></div>; }
function Heading({icon,title,count}:{icon:React.ReactNode;title:string;count:number}) { return <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-semibold">{icon}{title}</div><span className="rounded-md bg-white/[.06] px-2 py-1 text-xs text-zinc-400">{count}</span></div>; }
function BulletList({items}:{items:string[]}) { return <div className="mt-4 space-y-3">{items.map((item,i)=><div key={i} className="flex gap-2 text-sm leading-6 text-zinc-300"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400"/>{item}</div>)}{!items.length && <Empty text="Nothing identified in this category."/>}</div>; }
function Empty({text}:{text:string}) { return <p className="mt-4 rounded-xl border border-dashed border-white/10 p-4 text-xs text-zinc-500">{text}</p>; }
