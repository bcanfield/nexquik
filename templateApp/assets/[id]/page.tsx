import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "utils/db";

export default async function ShowAsset({ params }) {
  const asset = await prisma.asset.findUnique({ where: { id: params.id } });
  async function deleteAsset(data: FormData) {
    "use server";
    await prisma.asset.delete(
      //@nexquik prismaDeleteInput
      { where: { id: data.get("id") } }
      //@nexquik
    );
    revalidatePath(`/assets`);
    redirect(`/assets`);
  }
  return (
    <div>
      <h1> Assets - Show</h1>
      <form>
        <input hidden type="text" name="id" defaultValue={asset?.id} />
        <Link href={`/assets`}>Back to All Assets</Link>
        <Link href={`/assets/${asset?.id}/edit`}>Edit</Link>
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
    </div>
  );
}
