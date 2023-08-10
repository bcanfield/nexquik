import Link from "next/link";

export default async function Home() {
  return (
    <div className="mt-10 max-w-4xl">
      <header id="header" className="relative z-20">
        <div>
          <p className="mb-2 text-sm leading-6 font-semibold text-sky-500 dark:text-sky-400">
            Home Page
          </p>
          <div className="flex items-center">
            <h1 className="inline-block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200">
              Defined Routes
            </h1>
          </div>
        </div>
        <p className="mt-2 text-lg text-slate-700 dark:text-slate-400">
          Here are the defined routes for your application
        </p>
      </header>
      <div>
        {/* @nexquik routeList start */}
        <Link href={`/nexquikTemplateModel/create`}>Route</Link>
        {/* @nexquik routeList stop */}
      </div>
    </div>
  );
}
