"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { completeProfileSchema, type CompleteProfileInput } from "@/schemas/auth";
import { completeProfile } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEPARTMENTS, YEARS } from "@/lib/constants";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProfileFormProps {
  initialDepartment?: string | null;
  initialYear?: number | null;
}

export function ProfileForm({ initialDepartment, initialYear }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<CompleteProfileInput>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: {
      department: initialDepartment || "",
      year: initialYear || 1,
    },
  });

  const selectedDepartment = watch("department");
  const selectedYear = watch("year");

  const onSubmit = async (values: CompleteProfileInput) => {
    setLoading(true);
    try {
      const res = await completeProfile(values);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Profile updated successfully!");
      router.refresh();
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Select
          value={selectedDepartment}
          onValueChange={(val) => {
            if (val) setValue("department", val, { shouldDirty: true });
          }}
          disabled={loading}
        >
          <SelectTrigger id="department">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.department && (
          <p className="text-xs text-destructive">{errors.department.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="year">Academic Year</Label>
        <Select
          value={selectedYear ? String(selectedYear) : "1"}
          onValueChange={(val) => {
            if (val) setValue("year", Number(val), { shouldDirty: true });
          }}
          disabled={loading}
        >
          <SelectTrigger id="year">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((y) => (
              <SelectItem key={y} value={String(y)}>
                Year {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.year && (
          <p className="text-xs text-destructive">{errors.year.message}</p>
        )}
      </div>

      <Button type="submit" size="sm" disabled={loading || !isDirty}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  );
}
