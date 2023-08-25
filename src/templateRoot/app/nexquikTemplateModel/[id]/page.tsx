import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function ShowNexquikTemplateModel({
  // eslint-disable-next-line
  params,
}: {
  params: { [key: string]: string | string[] | undefined };
}) {
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
    <div className="flex-auto w-full min-w-0 pt-6 lg:px-8 lg:pt-8 pb:12 xl:pb-24 lg:pb-16 p-1 ">
      {/* @nexquik breadcrumb start */}
      {/* @nexquik breadcrumb stop */}
      <header id="header" className="relative z-20 mt-5">
        <div className="flex items-center">
          <h1 className="inline-block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200">
            View NexquikTemplateModel
          </h1>
        </div>
      </header>{" "}
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
    </div>
  );
}
