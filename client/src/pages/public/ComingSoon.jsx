export function ComingSoon({ title, phase }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold text-stone-900">{title}</h1>
      <p className="mt-2 text-stone-500">This page will be built in {phase} of the development roadmap.</p>
    </div>
  );
}
