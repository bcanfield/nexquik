import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "utils/db";

export default async function EditAsset({ params }) {
  const asset = await prisma.asset.findUnique({ where: { id: params.id } });

  async function editAsset(formData: FormData) {
    "use server";
    await prisma.asset.update(
      //@nexquik prismaUpdateInput
      { where: { id: params.id }, data: { name: formData.get("name") } }
      //@nexquik
    );
    redirect(`/assets/${params.id}`);
  }

  return (
    <div>
      <h1> Assets - Edit</h1>
      <form action={editAsset}>
        <label>name</label>
        <input type="text" name="name" defaultValue={asset?.name} />
        <label>lat</label>
        <input type="num" name="lat" defaultValue={asset?.lat} />
        <label>lng</label>
        <input type="number" name="lng" defaultValue={asset?.lng} />
        <Link href={`/assets/${params.id}`}>Cancel</Link>
        <button type="submit">Update Asset</button>
      </form>
    </div>
  );
}
