import { revalidatePath } from "next/cache";
import Link from "next/link";
import { prisma } from "utils/db";

export default async function ListAssets() {
  const assets = await prisma.asset.findMany();
  async function deleteAsset(data: FormData) {
    "use server";
    await prisma.asset.delete(
      //@nexquik prismaDeleteInput
      { where: { id: data.get("id") } }
      //@nexquik
    );
    revalidatePath("/assets");
  }
  return (
    <div>
      <h1> Assets - List</h1>
      <Link href={`/assets/create`}>Create New Asset</Link>
      <ul>
        {assets?.map((asset) => (
          <li key={asset.id}>
            <form>
              <input hidden type="text" name="id" defaultValue={asset?.id} />
              <p>name: {asset.name}</p>
              <p>lat: {asset.lat}</p>
              <p>lng: {asset.lat}</p>
              <Link href={`/assets/${asset.id}`}>View</Link>
              <Link href={`/assets/${asset.id}/edit`}>Edit</Link>
              <button formAction={deleteAsset}>Delete</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
