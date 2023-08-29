import { revalidatePath } from "next/cache";
import Link from "next/link";
//@nexquik prismaImport start
import prisma from "@/lib/prisma";
//@nexquik prismaImport stop
import clsx from "clsx";

export default async function ListNexquikTemplateModels(
  //@nexquik listProps start
  {
  params,
  searchParams,
}: {
  params: { [key: string]: string | string[] | undefined };
  searchParams?: { [key: string]: string | string[] | undefined };
}
 //@nexquik listProps stop
) {
  /* @nexquik listCount start */

  /* @nexquik listCount stop */

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
    <div className="flex-auto w-full min-w-0 pt-6 lg:px-8 lg:pt-8 pb:12 xl:pb-24 lg:pb-16 ">
      {/* @nexquik listBreadcrumb start */}
      {/* @nexquik listBreadcrumb stop */}
      <header id="header" className="relative z-20 mt-5">
        <div className="flex items-center">
          <h1 className="inline-block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200">
            NexquikTemplateModel List
          </h1>
        </div>
      </header>
      <div className="w-full overflow-x-auto  pt-2 pb-2">
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
                className="px-3 py-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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

      {/* @nexquik listPagination start */}
      {/* @nexquik listPagination stop */}
    </div>
  );
}
