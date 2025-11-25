"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/services/lib/api";

import { UsersDataTable } from "@/components/customer-data-table";

interface Kyc {
  step: number;
  status: string;
  isKycCompleted: boolean;
  hasProvidedDetails: boolean;
  hasProvidedDocuments: boolean;
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

export default function CustomersPage() {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/admin/users");
      if (response.data.success) {
        setUsers(response.data.data.items);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = () => {
    toast.success("Customer saved (frontend only — backend route missing)");
    setOpen(false);
  };

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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-semibold">Customers</h1>
                  <div className="hidden text-sm text-muted-foreground lg:block">
                    {loading
                      ? "Loading customers..."
                      : `${users.length} customer${
                          users.length === 1 ? "" : "s"
                        }`}
                  </div>
                </div>
              </div>

              <div className="px-4 lg:px-6">
                <div className="rounded-md border">
                  <div className=" overflow-auto rounded-md">
                    {loading ? (
                      <p className="p-4">Loading...</p>
                    ) : users.length === 0 ? (
                      <p className="p-4">No customers found.</p>
                    ) : (
                      <UsersDataTable data={users} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Add Customer Dialog */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>
                  Fill the details below to add a new customer.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-3 mt-4">
                <Input
                  placeholder="Customer Name"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                />
                <Input
                  placeholder="Email Address"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />
                <Input
                  placeholder="Phone Number"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
