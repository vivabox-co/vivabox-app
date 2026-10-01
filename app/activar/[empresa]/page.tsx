import { notFound } from "next/navigation"
import ActivarWelcome from "@/components/activar/ActivarWelcome"
import { getPartner } from "@/lib/constants/partners"

export default async function ActivarPartnerPage({
  params,
}: {
  params: Promise<{ empresa: string }>
}) {
  const { empresa } = await params
  const partner = getPartner(empresa)
  if (!partner) notFound()
  return <ActivarWelcome partner={partner} />
}
