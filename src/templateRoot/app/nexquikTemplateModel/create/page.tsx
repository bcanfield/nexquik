import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

//@nexquik prismaEnumImport start
import { Enum } from "@prisma/client";
//@nexquik prismaEnumImport stop

export default async function CreateNexquikTemplateModel(
  //@nexquik props start
  {
    params,
  }: {
    params: { [key: string]: string | string[] | undefined };
  }
  //@nexquik props stop
) 
  

{
  

  async function addNexquikTemplateModel(formData: FormData) {
    "use server";
    const created = await prisma.nexquikTemplateModel.create({
      data:
        //@nexquik prismaCreateDataInput start
        {
          name: formData.get("name"),
          lat: Number(formData.get("lat")),
          lng: Number(formData.get("lng")),
        },
      //@nexquik prismaCreateDataInput stop
    });
    //@nexquik revalidatePath start
    revalidatePath("/nexquikTemplateModel");
    //@nexquik revalidatePath stop

    //@nexquik createRedirect start
    redirect(`/nexquikTemplateModel/${created.id}`);
    //@nexquik createRedirect stop
  }

  return (
    <div className="flex-auto w-full min-w-0 pt-6 lg:px-8 lg:pt-8 pb:12 xl:pb-24 lg:pb-16 p-1 ">
      {/* @nexquik createBreadcrumb start */}
      {/* @nexquik createBreadcrumb stop */}

      <header id="header" className="relative z-20 mt-5">
        <div className="flex items-center">
          <h1 className="inline-block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200">
            Create NexquikTemplateModel
          </h1>
        </div>
      </header>
      {/* @nexquik createForm start */}
      <form action={addNexquikTemplateModel}>
        <label>name</label>
        <input type="text" name="name" />
        <label>lat</label>
        <input type="number" name="lat" />
        <label>lng</label>
        <input type="number" name="lng" />
        <button type="submit">Create NexquikTemplateModel</button>
      </form>
      <Link href={`/nexquikTemplateModel`}>Cancel</Link>
      {/* @nexquik createForm stop */}
    </div>
  );
}
