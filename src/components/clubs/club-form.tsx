"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClubSchema, type CreateClubInput } from "@/schemas/club";
import { requestClub } from "@/actions/clubs";
import { CLUB_CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function ClubForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateClubInput>({
    resolver: zodResolver(createClubSchema),
    defaultValues: {
      name: "",
      description: "",
      category: CLUB_CATEGORIES[0],
      logoUrl: "",
    },
  });

  const selectedCategory = watch("category");

  const onSubmit = async (values: CreateClubInput) => {
    setLoading(true);
    setError(null);

    try {
      const res = await requestClub(values);
      if (!res.success) {
        setError(res.error);
        toast.error(res.error);
        return;
      }

      toast.success("Club creation request submitted for Super Admin review!");
      router.push("/clubs");
      router.refresh();
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto border-border/80 shadow-md">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-1">
          <Sparkles className="h-4 w-4" />
          <span>New Student Organization</span>
        </div>
        <CardTitle className="text-2xl font-bold">Request to Start a Club</CardTitle>
        <CardDescription>
          Fill in your club details. Once submitted, super administrators will review and approve your club.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-5">
          {error && (
            <div className="p-3 text-sm rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Club Name</Label>
            <Input
              id="name"
              placeholder="e.g. Robotics & AI Society"
              disabled={loading}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={(val) => {
                if (val) setValue("category", val as any, { shouldValidate: true });
              }}
              disabled={loading}
            >
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CLUB_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-destructive">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">About the Club</Label>
            <Textarea
              id="description"
              placeholder="Describe your club's mission, regular activities, and what students will gain..."
              rows={4}
              disabled={loading}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl">Club Logo URL (Optional)</Label>
            <Input
              id="logoUrl"
              placeholder="https://example.com/logo.png"
              type="url"
              disabled={loading}
              {...register("logoUrl")}
            />
            {errors.logoUrl && (
              <p className="text-xs text-destructive">{errors.logoUrl.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3 pt-4 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting Request...
              </>
            ) : (
              "Submit for Approval"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
