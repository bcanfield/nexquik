import { revalidatePath } from "next/cache";
import Link from "next/link";
import { prisma } from "utils/db";

export default async function ListAssets() {
  const asset = await prisma.asset.findMany();
  async function deleteAsset(formData: FormData) {
    "use server";
    await prisma.asset.delete({
      where:
        //@nexquik prismaDeleteClause start
        { id: formData.get("id") },
      //@nexquik prismaDeleteClause stop
    });
    revalidatePath("/asset");
  }
  return (
    <div>
      <h1> Assets - List</h1>
      <Link href={`/asset/create`}>Create New Asset</Link>
      <ul>
        {asset?.map((asset, index) => (
          <li key={index}>
            {/* //@nexquik listForm */}
            <form>
              <input hidden type="text" name="id" defaultValue={asset?.id} />
              <p>name: {asset.name}</p>
              <p>lat: {asset.lat}</p>
              <p>lng: {asset.lat}</p>
              <Link href={`/asset/${asset.id}`}>View</Link>
              <Link href={`/asset/${asset.id}/edit`}>Edit</Link>
              <button formAction={deleteAsset}>Delete</button>
            </form>
            {/* //@nexquik */}
          </li>
        ))}
      </ul>
    </div>
  );
}
