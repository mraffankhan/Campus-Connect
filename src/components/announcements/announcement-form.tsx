"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAnnouncementSchema, type CreateAnnouncementInput } from "@/schemas/announcement";
import { createAnnouncement } from "@/actions/announcements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface AnnouncementFormProps {
  clubId?: string | null;
  clubName?: string;
  isSuperAdmin?: boolean;
}

export function AnnouncementForm({ clubId, clubName, isSuperAdmin }: AnnouncementFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateAnnouncementInput>({
    resolver: zodResolver(createAnnouncementSchema),
    defaultValues: {
      clubId: clubId || null,
      title: "",
      body: "",
      pinned: false,
    },
  });

  const pinned = watch("pinned");

  const onSubmit = async (values: CreateAnnouncementInput) => {
    setLoading(true);
    setError(null);

    try {
      const res = await createAnnouncement(values);
      if (!res.success) {
        setError(res.error);
        toast.error(res.error);
        return;
      }

      toast.success("Announcement broadcasted successfully!");
      reset({ clubId: clubId || null, title: "", body: "", pinned: false });
      router.refresh();
    } catch {
      setError("An unexpected error occurred while posting.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/80 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-1">
          <Megaphone className="h-3.5 w-3.5" />
          <span>{clubName ? `Posting for ${clubName}` : "Official Notice"}</span>
        </div>
        <CardTitle className="text-xl font-bold">
          {clubName ? `Post Announcement to ${clubName}` : "Broadcast College-Wide Announcement"}
        </CardTitle>
        <CardDescription>
          {clubName
            ? "Approved members of this club will receive an in-app notice."
            : "All students and faculty across campus will receive this announcement."}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Notice Headline</Label>
            <Input
              id="title"
              placeholder="e.g. Schedule Update for Workshop / Audition Results"
              disabled={loading}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Notice Content</Label>
            <Textarea
              id="body"
              placeholder="Write the complete announcement details here..."
              rows={4}
              disabled={loading}
              {...register("body")}
            />
            {errors.body && (
              <p className="text-xs text-destructive">{errors.body.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="pinned"
              checked={pinned}
              onChange={(e) => setValue("pinned", e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor="pinned" className="text-xs font-medium cursor-pointer">
              Pin to top of feed
            </label>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3 pt-3 border-t border-border/60">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              "Post Announcement"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
