import Link from "next/link";

export default async function Home() {
  return (
    <div className="flex-auto w-full min-w-0 pt-6 lg:px-8 lg:pt-8 pb:12 xl:pb-24 lg:pb-16 p-1 ">
      <header id="header" className="relative z-20">
        <div>
          <p className="mb-2 text-sm leading-6 font-semibold text-slate-700  dark:text-slate-400 ">
            Home Page
          </p>
          <div className="flex items-center">
            <h1 className="inline-block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200">
              Models
            </h1>
          </div>
        </div>
        <div>
          <p className="mt-2 text-lg text-slate-700 dark:text-slate-400">
            Here are the top-level models for your application.
          </p>
        </div>
      </header>
      <div className="w-full overflow-x-auto  pt-2">
        {/* @nexquik routeList start */}
        <Link href={`/nexquikTemplateModel/create`}>Route</Link>
        {/* @nexquik routeList stop */}
      </div>
    </div>
  );
}
