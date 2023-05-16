import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "utils/db";

export default async function CreateNexquikTemplateModel() {
  async function addNexquikTemplateModel(formData: FormData) {
    "use server";
    const created = await prisma.nexquikTemplateModel.create({
      data:
        //@nexquik prismaDataInput start
        {
          name: formData.get("name"),
          lat: Number(formData.get("lat")),
          lng: Number(formData.get("lng")),
        },
      //@nexquik prismaDataInput stop
    });
    revalidatePath(`/nexquikTemplateModel`);
    //@nexquik createRedirect start
    redirect(`/nexquikTemplateModel/${created.id}`);
    //@nexquik createRedirect stop
  }

  return (
    <div>
      <h1> NexquikTemplateModels - Create</h1>
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
      {/* @nexquik createForm stop */}
      <Link href={`/nexquikTemplateModel`}>Cancel</Link>
    </div>
  );
}
