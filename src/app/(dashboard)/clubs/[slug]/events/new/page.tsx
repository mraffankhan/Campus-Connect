import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireClubAdmin } from "@/lib/auth/require-role";
import { EventForm } from "@/components/events/event-form";

export const dynamic = "force-dynamic";

interface NewEventPageProps {
  params: Promise<{ slug: string }>;
}

export default async function NewEventPage({ params }: NewEventPageProps) {
  const { slug } = await params;

  const club = await prisma.club.findUnique({
    where: { slug },
  });

  if (!club) {
    notFound();
  }

  // Ensure user is authorized to create events for this club
  await requireClubAdmin(club.id);

  return (
    <div className="py-4">
      <EventForm
        clubId={club.id}
        clubName={club.name}
        clubSlug={club.slug}
      />
    </div>
  );
}
