"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/site-header"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import customerData from "../data.json"

export default function CustomersPage() {
  const [open, setOpen] = useState(false)

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
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Customers</h1>
            <Button onClick={() => setOpen(true)}>Add Customer</Button>
          </div>

          <DataTable data={customerData} />

          {/* Popup (Dialog) */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>
                  Fill the details below to add a new customer.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4 mt-4">
                <Input placeholder="Customer Name" />
                <Input placeholder="Email Address" />
                <Input placeholder="Phone Number" />
              </div>

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setOpen(false)}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
