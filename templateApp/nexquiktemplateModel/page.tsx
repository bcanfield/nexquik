import { revalidatePath } from "next/cache";
import Link from "next/link";
import { prisma } from "utils/db";

export default async function ListNexquikTemplateModels() {
  const nexquikTemplateModel = await prisma.nexquikTemplateModel
    .findMany
    //@nexquik prismaWhereParentClause start
    ();
  //@nexquik prismaWhereParentClause stop

  async function deleteNexquikTemplateModel(formData: FormData) {
    "use server";
    await prisma.nexquikTemplateModel.delete({
      where:
        //@nexquik prismaDeleteClause start
        { id: formData.get("id") },
      //@nexquik prismaDeleteClause stop
    });
    revalidatePath("/nexquikTemplateModel");
  }
  return (
    <div>
      <h1> NexquikTemplateModels - List</h1>
      <Link href={`/nexquikTemplateModel/create`}>
        Create New NexquikTemplateModel
      </Link>
      {/* @nexquik listForm start */}
      <ul>
        {nexquikTemplateModel?.map((nexquikTemplateModel, index) => (
          <li key={index}>
            <form>
              <input
                hidden
                type="text"
                name="id"
                defaultValue={nexquikTemplateModel?.id}
              />
              <p>name: {nexquikTemplateModel.name}</p>
              <p>lat: {nexquikTemplateModel.lat}</p>
              <p>lng: {nexquikTemplateModel.lat}</p>
              <Link href={`/nexquikTemplateModel/${nexquikTemplateModel.id}`}>
                View
              </Link>
              <Link
                href={`/nexquikTemplateModel/${nexquikTemplateModel.id}/edit`}
              >
                Edit
              </Link>
              <button formAction={deleteNexquikTemplateModel}>Delete</button>
            </form>
          </li>
        ))}
      </ul>
      {/* @nexquik listForm stop */}
    </div>
  );
}
