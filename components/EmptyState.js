export default function EmptyState({ message = 'No data yet.' }) {
  return (
    <div className="text-center py-16 px-4 bg-slate-50 rounded-xl border border-slate-200">
      <p className="text-slate-500 font-medium">{message}</p>
    </div>
  );
}
