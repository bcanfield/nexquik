import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "utils/db";

export default async function CreateAsset() {
  async function addAsset(data: FormData) {
    "use server";
    const created = await prisma.asset.create({
      //@nexquik prismaCreateInput
      data: {
        name: data.get("name"),
        lat: Number(data.get("lat")),
        lng: Number(data.get("lng")),
      },
      //@nexquik
    });
    revalidatePath(`/assets`);
    redirect(`/assets/${created.id}`);
  }

  return (
    <div>
      <h1> Assets - Create</h1>
      {/* //@nexquik form */}
      <form action={addAsset}>
        <label>name</label>
        <input type="text" name="name" />
        <label>lat</label>
        <input type="number" name="lat" />
        <label>lng</label>
        <input type="number" name="lng" />
        <Link href={`/assets`}>Cancel</Link>
        <button type="submit">Create Asset</button>
      </form>
      {/* //@nexquik */}
    </div>
  );
}
