import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function ShowNexquikTemplateModel({
  params,
}: {
  params: any;
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
    <div className="mt-10 max-w-4xl">
      {/* @nexquik breadcrumb start */}
      {/* @nexquik breadcrumb stop */}
      <header id="header" className="relative z-20">
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
      <div className="mt-8">
        <div className="flex space-x-4">
          {/* @nexquik listChildren start */}
          {/* @nexquik listChildren stop */}
        </div>
      </div>
    </div>
  );
}
