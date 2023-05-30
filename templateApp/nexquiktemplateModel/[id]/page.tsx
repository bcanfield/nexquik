import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
//@nexquik prismaClientImport start
import { prisma } from "utils/db";
//@nexquik prismaClientImport stop

export default async function ShowNexquikTemplateModel({ params }) {
  const nexquikTemplateModel = await prisma.nexquikTemplateModel.findUnique({
    where:
      //@nexquik prismaWhereInput start
      { id: params.id },
    //@nexquik prismaWhereInput stop
  });
  async function deleteNexquikTemplateModel(formData: FormData) {
    "use server";
    await prisma.nexquikTemplateModel.delete({
      where:
        //@nexquik prismaDeleteClause start
        { id: formData.get("id") },
      //@nexquik prismaDeleteClause stop
    });
    //@nexquik revalidatePath start
    revalidatePath("/nexquikTemplateModel");
    //@nexquik revalidatePath stop

    //@nexquik listRedirect start
    redirect(`/nexquikTemplateModel`);
    //@nexquik listRedirect stop
  }
  return (
    <div className="main">
      <h1 className="title"> View NexquikTemplateModel</h1>
      {/* @nexquik showForm start */}
      <form>
        <input
          hidden
          type="text"
          name="id"
          defaultValue={nexquikTemplateModel?.id}
        />
        <Link href={`/nexquikTemplateModel`}>
          Back to All NexquikTemplateModels
        </Link>
        <Link href={`/nexquikTemplateModel/${nexquikTemplateModel?.id}/edit`}>
          Edit
        </Link>
        <button formAction={deleteNexquikTemplateModel}>Delete</button>
        <ul>
          <li>
            <p>name: {nexquikTemplateModel?.name}</p>
          </li>
          <li>
            <p>lat: {nexquikTemplateModel?.lat}</p>
          </li>
          <li>
            <p>lng: {nexquikTemplateModel?.lng}</p>
          </li>
        </ul>
      </form>
      {/* @nexquik showForm stop */}
      <div className="button-group">
        {/* @nexquik listChildren start */}
        {/* @nexquik listChildren stop */}
      </div>

      <div className="button-group">
        {/* @nexquik backToCurrentLink start */}
        <Link href={`/nexquikTemplateModel/create`}>Back</Link>
        {/* @nexquik backToCurrentLink stop */}
      </div>
    </div>
  );
}
