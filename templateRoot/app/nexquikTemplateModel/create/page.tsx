import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

//@nexquik prismaEnumImport start
import { Enum } from "@prisma/client";
//@nexquik prismaEnumImport stop

export default async function CreateNexquikTemplateModel({
  params,
}: {
  params: any;
}) {
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
    <div className="main">
      <h1 className="title"> Create NexquikTemplateModel</h1>
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
