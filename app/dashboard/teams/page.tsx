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

                {/* Page Wrapper */}
                <div className="flex flex-1 flex-col p-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight">Customers</h1>
                            <p className="text-sm text-muted-foreground">
                                View and manage your customer details.
                            </p>
                        </div>
                        <Button onClick={() => setOpen(true)}>Add Customer</Button>
                    </div>

                    {/* Data Table with padding override */}
                    <div className="rounded-md border bg-background shadow-sm overflow-hidden">
                        {/* 👇 This line removes unwanted px-4 lg:px-6 from DataTable internal wrapper */}
                        <div className="[&_td]:py-2 [&_td]:px-3 [&_th]:py-2 [&_th]:px-3 text-sm [&_.flex-1]:px-0 [&_.flex-1]:lg:px-0">
                            <DataTable data={customerData} />
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
