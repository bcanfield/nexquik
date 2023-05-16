import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "utils/db";

export default async function CreateAsset() {
  async function addAsset(formData: FormData) {
    "use server";
    const created = await prisma.asset.create(
      //@nexquik prismaDataInput start
      {
        data: {
          name: formData.get("name"),
          lat: Number(formData.get("lat")),
          lng: Number(formData.get("lng")),
        },
      }
      //@nexquik prismaDataInput stop
    );
    revalidatePath(`/asset`);
    redirect(`/asset/${created.id}`);
  }

  return (
    <div>
      <h1> Assets - Create</h1>
      {/* @nexquik createForm start */}
      <form action={addAsset}>
        <label>name</label>
        <input type="text" name="name" />
        <label>lat</label>
        <input type="number" name="lat" />
        <label>lng</label>
        <input type="number" name="lng" />
        <Link href={`/asset`}>Cancel</Link>
        <button type="submit">Create Asset</button>
      </form>
      {/* @nexquik createForm stop */}
    </div>
  );
}
