import { RequestConfirmation } from "@/components/request-confirmation";

export default async function RequestConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RequestConfirmation id={id} />;
}
