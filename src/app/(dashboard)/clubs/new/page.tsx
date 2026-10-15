import { ClubForm } from "@/components/clubs/club-form";
import { requireSession } from "@/lib/auth/get-session";

export const dynamic = "force-dynamic";

export default async function NewClubPage() {
  await requireSession();

  return (
    <div className="py-4">
      <ClubForm />
    </div>
  );
}
