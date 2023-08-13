import { revalidatePath } from "next/cache";
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function ListNexquikTemplateModels({
  params,
}: {
  params: any;
}) {
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
    //@nexquik revalidatePath start
    revalidatePath("/nexquikTemplateModel");
    //@nexquik revalidatePath stop
  }
  return (
    <div className="flex-auto w-full min-w-0 pt-6 lg:px-8 lg:pt-8 pb:12 xl:pb-24 lg:pb-16 border-yellow-500">
      {/* @nexquik listBreadcrumb start */}
      {/* @nexquik listBreadcrumb stop */}
      <header id="header" className="relative z-20 mt-5">
        <div className="flex items-center">
          <h1 className="inline-block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200">
            NexquikTemplateModel List
          </h1>
        </div>
      </header>
      <div className="w-full overflow-x-auto border-solid border-2 border-black-500 pt-2">
        {/* @nexquik createLink start */}
        <Link href={`/nexquikTemplateModel/create`}>
          Create New NexquikTemplateModel
        </Link>
        {/* @nexquik createLink stop */}
      </div>

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
              <Link
                class="px-3 py-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                href={`/nexquikTemplateModel/${nexquikTemplateModel.id}`}
              >
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
