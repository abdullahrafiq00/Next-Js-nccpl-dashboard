/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import api from "@/services/lib/api";
import { toast } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Kyc {
  step: number;
  status: string;
  isKycCompleted: boolean;
  hasProvidedDetails: boolean;
  hasProvidedDocuments: boolean;

  cnicFront?: string;
  cnicBack?: string;
  proofOfIncome?: string;

  occupation?: string;
  nameOfEmployer?: string;
  designation?: string;
  department?: string;
  employerAddress?: string;

  ibanNumber?: string;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  cnic?: string;
  mothersMaidenName?: string;
  isVerified: boolean;
  createdAt: string;
  kyc?: Kyc;
}

function normalizeUploadUrl(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const replaced = value.replace("/api/uploads/", "/api/admin/uploads/");
  if (replaced.startsWith("http://") || replaced.startsWith("https://")) {
    return replaced;
  }

  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
  const path = replaced.startsWith("/") ? replaced : `/${replaced}`;
  return base ? `${base}${path}` : replaced;
}

function useSecureImage(src?: string) {
  const [url, setUrl] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadImage() {
      if (!src) {
        setUrl(undefined);
        setHasError(false);
        return;
      }

      const normalized = normalizeUploadUrl(src);
      if (!normalized) {
        setHasError(true);
        setUrl(undefined);
        return;
      }

      try {
        setIsLoading(true);
        const session = await getSession();
        const token = session?.user?.accessToken;

        if (!token) {
          throw new Error("Missing auth token");
        }

        const response = await fetch(normalized, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);

        if (!isMounted) {
          URL.revokeObjectURL(objectUrl);
          return;
        }

        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
        }

        objectUrlRef.current = objectUrl;
        setUrl(objectUrl);
        setHasError(false);
      } catch (error) {
        console.error("Unable to load secure image", error);
        if (isMounted) {
          setUrl(undefined);
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [src]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  return { url, isLoading, hasError, hasSource: Boolean(src) };
}

export default function UserDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await api.get(`/api/admin/users/${id}`);
        setUser(res.data.data.data);
      } catch {
        toast.error("Failed to fetch user details");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-destructive">User not found</p>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />

        <div className="flex flex-col flex-1 p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{user.fullName}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>

            <Button variant="outline" onClick={() => router.back()}>
              ← Go Back
            </Button>
          </div>

          {/* Summary Top Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoCard
              label="Verified"
              value={user.isVerified ? "Verified" : "Not Verified"}
              status={user.isVerified ? "default" : "destructive"}
            />

            <InfoCard
              label="KYC Status"
              value={user.kyc?.status ?? "—"}
              status={user.kyc?.isKycCompleted ? "default" : "secondary"}
            />

            <InfoCard
              label="KYC Completed"
              value={user.kyc?.isKycCompleted ? "Yes" : "No"}
              status={user.kyc?.isKycCompleted ? "default" : "destructive"}
            />
          </div>

          {/* ==============================
                GROUPED 4 MAIN CARDS
          =============================== */}

          {user.kyc && (
            <>
              <Separator className="my-6" />
              <h2 className="text-2xl font-semibold">KYC Details</h2>

              {/* CARD 2 — Personal Information */}
              <Card className="shadow-sm mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Personal Information
                  </CardTitle>
                </CardHeader>

                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField label="Full Name" value={user.fullName} />
                  <InfoField label="CNIC" value={user.cnic} />
                  <InfoField label="Email" value={user.email} />
                  <InfoField
                    label="Mother's Maiden Name"
                    value={user.mothersMaidenName}
                  />
                </CardContent>
              </Card>

              {/* CARD 1 — Employment Details */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Employment Details</CardTitle>
                </CardHeader>

                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField label="Occupation" value={user.kyc.occupation} />
                  <InfoField
                    label="Employer Name"
                    value={user.kyc.nameOfEmployer}
                  />
                  <InfoField label="Designation" value={user.kyc.designation} />
                  <InfoField label="Department" value={user.kyc.department} />

                  <InfoField
                    label="Employer Address"
                    value={user.kyc.employerAddress}
                    full
                  />
                </CardContent>
              </Card>

              {/* CARD 3 — Uploaded Documents */}
              <Card className="shadow-sm mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Documents</CardTitle>
                </CardHeader>

                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ImageField label="CNIC Front" src={user.kyc.cnicFront} />
                  <ImageField label="CNIC Back" src={user.kyc.cnicBack} />
                  <ImageField
                    label="Proof of Income"
                    src={user.kyc.proofOfIncome}
                  />
                </CardContent>
              </Card>

              {/* CARD 4 — Bank + Contact */}
              <Card className="shadow-sm mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Bank Details</CardTitle>
                </CardHeader>

                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField label="IBAN Number" value={user.kyc.ibanNumber} />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

/* -------------------------
      REUSABLE COMPONENTS
------------------------- */

function InfoCard({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status?: "destructive" | "secondary" | "default";
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        {status ? (
          <Badge variant={status}>{value}</Badge>
        ) : (
          <p className="text-base">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}

function InfoField({
  label,
  value,
  full,
}: {
  label: string;
  value?: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-base">{value ?? "—"}</p>
    </div>
  );
}

function ImageField({ label, src }: { label: string; src?: string }) {
  const { url, isLoading, hasError, hasSource } = useSecureImage(src);

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      {url ? (
        <img
          src={url}
          alt={label}
          className="rounded border w-full h-48 object-cover"
        />
      ) : isLoading && hasSource ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : hasError && hasSource ? (
        <p className="text-destructive text-sm">Unable to load image</p>
      ) : (
        <p className="text-muted-foreground">—</p>
      )}
    </div>
  );
}
