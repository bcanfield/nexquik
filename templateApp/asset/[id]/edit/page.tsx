import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "utils/db";

export default async function EditAsset({ params }) {
  const asset = await prisma.asset.findUnique({ where: { id: params.id } });

  async function editAsset(formData: FormData) {
    "use server";
    await prisma.asset.update({
      where: { id: params.id },
      data:
        //@nexquik prismaDataInput start
        { name: formData.get("name") },
      //@nexquik prismaDataInput stop
    });
    redirect(`/asset/${params.id}`);
  }

  return (
    <div>
      <h1> Assets - Edit</h1>
      {/* //@nexquik editForm */}
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
      {/* //@nexquik */}
    </div>
  );
}
