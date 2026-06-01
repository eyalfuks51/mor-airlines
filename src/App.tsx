function App() {
  return (
    <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-center">
        <h1 className="text-5xl font-black text-white tracking-wide mb-3">
          מור איירליינס
        </h1>
        <p className="text-slate-400 text-xl font-light">
          לאן טסים הפעם?
        </p>
      </div>

      <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl border border-slate-700">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-slate-500 text-xs uppercase tracking-widest mb-1">נוסעים</div>
            <div className="text-white font-bold text-lg">מור ואייל</div>
          </div>
          <div>
            <div className="text-slate-500 text-xs uppercase tracking-widest mb-1">מושב</div>
            <div className="text-white font-bold">2A — חלון</div>
          </div>
        </div>

        <div className="border-t border-dashed border-slate-600 my-4" />

        <div className="flex items-center justify-between">
          <div>
            <div className="text-slate-500 text-xs uppercase tracking-widest mb-1">יעד</div>
            <div className="text-indigo-400 font-bold text-2xl">???</div>
          </div>
          <div className="text-slate-600 font-mono text-sm">MOR-001</div>
        </div>
      </div>

      <button
        className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all text-white font-bold text-xl px-12 py-4 rounded-2xl shadow-lg shadow-indigo-500/30 cursor-pointer"
        type="button"
      >
        לאן טסים?
      </button>

      <p className="text-slate-600 text-sm">
        בניית העולם...
      </p>
    </main>
  )
}

export default App
