import { redirect } from "next/navigation";

export default async function Home() {
  // @nexquik homeRedirect start
  redirect("/gen");
  // @nexquik homeRedirect stop
  return (
    <div className="flex-auto w-full min-w-0 pt-6 lg:px-8 lg:pt-8 pb:12 xl:pb-24 lg:pb-16 p-1 ">
      APP DIR Home Page
    </div>
  );
}
