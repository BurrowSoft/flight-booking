import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-extrabold text-sky-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Route not found</h1>
      <p className="mt-2 text-slate-500">
        That flight route doesn&apos;t exist in our system.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white hover:bg-sky-700 transition-colors"
      >
        Search flights
      </Link>
    </div>
  );
}
