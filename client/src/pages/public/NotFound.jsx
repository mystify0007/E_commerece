import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-semibold text-stone-900">404</h1>
      <p className="mt-2 text-stone-500">This page doesn&apos;t exist.</p>
      <Link to="/" className="mt-6 text-brand-600 hover:text-brand-700">
        Back to home
      </Link>
    </div>
  );
}
