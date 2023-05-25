import Link from "next/link";

export default async function Home() {
  return (
    <div>
      <h1> Home Page</h1>
      {/* @nexquik routeList start */}
      <Link href={`/nexquikTemplateModel/create`}>Route</Link>
      {/* @nexquik routeList stop */}
    </div>
  );
}
