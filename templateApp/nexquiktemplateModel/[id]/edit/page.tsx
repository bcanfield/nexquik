import Link from "next/link";
import { redirect } from "next/navigation";
//@nexquik prismaClientImport start
import { prisma } from "utils/db";
//@nexquik prismaClientImport stop

export default async function EditNexquikTemplateModel({ params }) {
  const nexquikTemplateModel = await prisma.nexquikTemplateModel.findUnique({
    where:
      //@nexquik prismaWhereInput start
      { id: params.id },
    //@nexquik prismaWhereInput stop
  });

  async function editNexquikTemplateModel(formData: FormData) {
    "use server";
    await prisma.nexquikTemplateModel.update({
      where:
        //@nexquik prismaWhereInput start
        { id: params.id },
      //@nexquik prismaWhereInput stop
      data:
        //@nexquik prismaDataInput start
        { name: formData.get("name") },
      //@nexquik prismaDataInput stop
    });
    //@nexquik editRedirect start
    redirect(`/nexquikTemplateModel/${params.id}`);
    //@nexquik editRedirect stop
  }

  return (
    <div className="main">
      <h1> Edit NexquikTemplateModel</h1>
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
