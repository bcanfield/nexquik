import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "utils/db";

export default async function EditAsset({ params }) {
  const asset = await prisma.asset.findUnique({
    where:
      //@nexquik prismaWhereInput start
      { id: params.id },
    //@nexquik prismaWhereInput stop
  });

  async function editAsset(formData: FormData) {
    "use server";
    await prisma.asset.update({
      where:
        //@nexquik prismaWhereInput start
        { id: params.id },
      //@nexquik prismaWhereInput stop
      data:
        //@nexquik prismaDataInput start
        { name: formData.get("name") },
      //@nexquik prismaDataInput stop
    });
    //@nexquik editRedirect start
    redirect(`/asset/${params.id}`);
    //@nexquik editRedirect stop
  }

  return (
    <div>
      <h1> Assets - Edit</h1>
      {/* @nexquik editForm start */}
      <form action={editAsset}>
        <label>name</label>
        <input type="text" name="name" defaultValue={asset?.name} />
        <label>lat</label>
        <input type="num" name="lat" defaultValue={asset?.lat} />
        <label>lng</label>
        <input type="number" name="lng" defaultValue={asset?.lng} />
        <Link href={`/asset/${params.id}`}>Cancel</Link>
        <button type="submit">Update Asset</button>
      </form>
      {/* @nexquik editForm stop */}
    </div>
  );
}
