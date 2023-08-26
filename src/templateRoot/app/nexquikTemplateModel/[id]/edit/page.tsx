import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

//@nexquik prismaEnumImport start
import { Enum } from "@prisma/client";
//@nexquik prismaEnumImport stop

export default async function EditNexquikTemplateModel({
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

  async function editNexquikTemplateModel(formData: FormData) {
    "use server";
    if (formData) {
      await prisma.nexquikTemplateModel.update({
        where:
          //@nexquik prismaWhereInput start
          { id: params.id },
        //@nexquik prismaWhereInput stop
        data:
          //@nexquik prismaEditDataInput start
          { name: formData.get("name") },
        //@nexquik prismaEditDataInput stop
      });
    }
    //@nexquik editRedirect start
    redirect(`/nexquikTemplateModel/${params.id}`);
    //@nexquik editRedirect stop
  }

  return (
    <div className="flex-auto w-full min-w-0 pt-6 lg:px-8 lg:pt-8 pb:12 xl:pb-24 lg:pb-16 p-1 ">
      {/* @nexquik editBreadCrumb start */}
      {/* @nexquik editBreadCrumb stop */}
      <header id="header" className="relative z-2 mt-5">
        <div className="flex items-center">
          <h1 className="inline-block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200">
            Edit NexquikTemplateModel
          </h1>
        </div>
      </header>{" "}
      {/* @nexquik editForm start */}
      <form action={editNexquikTemplateModel}>
        <label>name</label>
        <input
          type="text"
          name="name"
          defaultValue={nexquikTemplateModel?.name}
        />
        <label>lat</label>
        <input type="num" name="lat" defaultValue={nexquikTemplateModel?.lat} />
        <label>lng</label>
        <input
          type="number"
          name="lng"
          defaultValue={nexquikTemplateModel?.lng}
        />
        <button type="submit">Update NexquikTemplateModel</button>
      </form>
      {/* @nexquik editForm stop */}
    </div>
  );
}
