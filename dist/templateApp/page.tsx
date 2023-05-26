import Link from "next/link";

export default async function Home() {
  return (
    <div>
      <h1 className="title">Home Page</h1>
      <h2 className="title">Defined Routes</h2>{" "}
      <div className="container">
        {/* @nexquik routeList start */}
        <Link href={`/nexquikTemplateModel/create`}>Route</Link>
        {/* @nexquik routeList stop */}
      </div>
    </div>
  );
}
