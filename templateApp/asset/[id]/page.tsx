import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "utils/db";

export default async function ShowAsset({ params }) {
  const asset = await prisma.asset.findUnique({ where: { id: params.id } });
  async function deleteAsset(formData: FormData) {
    "use server";
    await prisma.asset.delete(
      //@nexquik prismaDeleteClause start
      { where: { id: formData.get("id") } }
      //@nexquik prismaDeleteClause stop
    );
    revalidatePath(`/asset`);
    redirect(`/asset`);
  }
  return (
    <div>
      <h1> Assets - Show</h1>
      {/* //@nexquik showForm start*/}
      <form>
        <input hidden type="text" name="id" defaultValue={asset?.id} />
        <Link href={`/asset`}>Back to All Assets</Link>
        <Link href={`/asset/${asset?.id}/edit`}>Edit</Link>
        <button formAction={deleteAsset}>Delete</button>
        <ul>
          <li>
            <p>name: {asset?.name}</p>
          </li>
          <li>
            <p>lat: {asset?.lat}</p>
          </li>
          <li>
            <p>lng: {asset?.lng}</p>
          </li>
        </ul>
      </form>
      {/* //@nexquik showForm stop*/}
    </div>
  );
}
