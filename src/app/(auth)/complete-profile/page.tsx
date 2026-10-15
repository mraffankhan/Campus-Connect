"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { completeProfileSchema, type CompleteProfileInput } from "@/schemas/auth";
import { completeProfile } from "@/actions/auth";
import { DEPARTMENTS, YEARS } from "@/lib/constants";
import { toast } from "sonner";

export default function CompleteProfilePage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CompleteProfileInput>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: {
      department: "",
      year: 1,
    },
  });

  const selectedDepartment = watch("department");
  const selectedYear = watch("year");

  const onSubmit = async (values: CompleteProfileInput) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const res = await completeProfile(values);
      if (!res.success) {
        setServerError(res.error);
        toast.error(res.error);
        return;
      }

      toast.success("Profile setup complete!");
      router.push("/home");
      router.refresh();
    } catch {
      setServerError("An error occurred while saving your profile details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-radial-[at_top_right] from-primary/10 via-background to-background relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md border-border/60 shadow-xl backdrop-blur-xl bg-card/85 relative z-10">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Complete Your Student Profile
          </CardTitle>
          <CardDescription>
            Help club organizers recognize your academic background and year
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {serverError && (
              <div className="p-3 text-sm rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="department">Department / Major</Label>
              <Select
                value={selectedDepartment}
                onValueChange={(val) => {
                  if (val) setValue("department", val, { shouldValidate: true });
                }}
                disabled={isLoading}
              >
                <SelectTrigger id="department" className="w-full">
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-xs text-destructive">{errors.department.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Current Year</Label>
              <Select
                value={selectedYear ? String(selectedYear) : "1"}
                onValueChange={(val) => {
                  if (val) setValue("year", Number(val), { shouldValidate: true });
                }}
                disabled={isLoading}
              >
                <SelectTrigger id="year" className="w-full">
                  <SelectValue placeholder="Select current year" />
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
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full font-medium" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving profile...
                </>
              ) : (
                <>
                  Complete Setup & Go to Portal <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
