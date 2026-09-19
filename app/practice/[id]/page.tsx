import { PracticeScreen } from "@/components/practice-screen";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PracticeScreen textId={id} />;
}
