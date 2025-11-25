"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import api from "@/services/lib/api"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IconEdit, IconTrash } from "@tabler/icons-react"

// SHADCN Tabs
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"

// SHADCN TABLE
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table"

interface Auction {
  id: string
  title: string
  auctionDate: string
  issueDate: string
  maturityDate: string
  auctionMonths: number
  lastAuctionRate: number
  auctionRate?: number
  faceValue?: number
  yield?: number
}

export default function AuctionsPage() {
  const [open, setOpen] = useState(false)
  const [isUpdateMode, setIsUpdateMode] = useState(false)
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null)
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("auction")

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [auctionToDelete, setAuctionToDelete] = useState<Auction | null>(null)

  const [form, setForm] = useState({
    title: "",
    auctionDate: "",
    issueDate: "",
    maturityDate: "",
    auctionMonths: "1",
    lastAuctionRate: "",
    auctionRate: "",
    faceValue: "",
    yield: "",
  })

  const today = new Date().toISOString().split("T")[0]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (value: string) => {
    setForm({ ...form, auctionMonths: value })
  }

  const fetchAuctions = async () => {
    setLoading(true)
    try {
      const response = await api.get("/api/admin/auctions")
      if (response.data.success) {
        setAuctions(response.data.data.items)
      } else {
        toast.error(response.data.message || "Failed to fetch auctions")
      }
    } catch (error) {
      console.error("Failed to fetch auctions:", error)
      toast.error("Failed to fetch auctions. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuctions()
  }, [])

  const openCreateModal = () => {
    setIsUpdateMode(false)
    setSelectedAuctionId(null)
    setActiveTab("auction")
    setForm({
      title: "",
      auctionDate: "",
      issueDate: "",
      maturityDate: "",
      auctionMonths: "1",
      lastAuctionRate: "",
      auctionRate: "",
      faceValue: "",
      yield: "",
    })
    setOpen(true)
  }

  const openUpdateModal = (auction: Auction) => {
    setIsUpdateMode(true)
    setSelectedAuctionId(auction.id)
    setActiveTab("auction")
    setForm({
      title: auction.title,
      auctionDate: auction.auctionDate.split("T")[0],
      issueDate: auction.issueDate.split("T")[0],
      maturityDate: auction.maturityDate.split("T")[0],
      auctionMonths: auction.auctionMonths.toString(),
      lastAuctionRate: auction.lastAuctionRate.toString(),
      auctionRate: auction.auctionRate?.toString() || "",
      faceValue: auction.faceValue?.toString() || "",
      yield: auction.yield?.toString() || "",
    })
    setOpen(true)
  }

  const openDeleteModal = (auction: Auction) => {
    setAuctionToDelete(auction)
    setDeleteModalOpen(true)
  }

  const handleSubmit = async () => {
    // Validate required fields
    if (!form.title || !form.auctionDate || !form.issueDate || !form.maturityDate || !form.lastAuctionRate) {
      toast.error("Please fill all required fields")
      return
    }

    // New validation: If in update mode, rates tab is active and editable, require all 3 fields
    if (isUpdateMode && activeTab === "rates" && isRatesEditable()) {
      if (!form.auctionRate || !form.faceValue || !form.yield) {
        toast.error("Please fill Auction Rate, Face Value, and Yield before updating")
        return
      }
    }

    setSubmitting(true)
    try {
      if (isUpdateMode && selectedAuctionId) {
        const response = await api.patch(`/api/admin/auctions/${selectedAuctionId}`, {
          title: form.title,
          auctionDate: form.auctionDate,
          issueDate: form.issueDate,
          maturityDate: form.maturityDate,
          auctionMonths: Number(form.auctionMonths),
          lastAuctionRate: Number(form.lastAuctionRate),
          auctionRate: form.auctionRate ? Number(form.auctionRate) : undefined,
          faceValue: form.faceValue ? Number(form.faceValue) : undefined,
          yield: form.yield ? Number(form.yield) : undefined,
        })

        if (response.data.success) {
          toast.success("Auction updated successfully!")
          setOpen(false)
          await fetchAuctions()
        } else {
          toast.error(response.data.message || "Failed to update auction")
        }
      } else {
        const response = await api.post("/api/admin/auctions", {
          title: form.title,
          auctionDate: form.auctionDate,
          issueDate: form.issueDate,
          maturityDate: form.maturityDate,
          auctionMonths: Number(form.auctionMonths),
          lastAuctionRate: Number(form.lastAuctionRate),
        })

        if (response.data.success) {
          toast.success("Auction successfully added!")
          setOpen(false)
          await fetchAuctions()
        } else {
          toast.error(response.data.message || "Failed to create auction")
        }
      }
    } catch (error: any) {
      console.error("Failed to submit auction:", error)
      toast.error(error.response?.data?.message || "Failed to submit auction. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!auctionToDelete) return

    setSubmitting(true)
    try {
      const response = await api.delete(`/api/admin/auctions/${auctionToDelete.id}`)
      if (response.data.message) {
        toast.success(response.data.message)
        setDeleteModalOpen(false)
        setAuctionToDelete(null)
        await fetchAuctions()
      } else {
        toast.error("Failed to delete auction")
      }
    } catch (error: any) {
      console.error("Delete auction error:", error)
      toast.error(error.response?.data?.message || "Failed to delete auction. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const isRatesEditable = () => {
    if (!form.auctionDate) return false
    return new Date(form.auctionDate).getTime() <= new Date().getTime()
  }

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-col flex-1 p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Auctions</h1>
            <Button onClick={openCreateModal}>Add Auction</Button>
          </div>

          {/* Create / Update Modal */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{isUpdateMode ? "Update Auction" : "Create Auction"}</DialogTitle>
              </DialogHeader>

              {isUpdateMode ? (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="auction">Update Auction</TabsTrigger>
                    <TabsTrigger value="rates">Update Auction Rates</TabsTrigger>
                  </TabsList>

                  <TabsContent value="auction">
                    <div className="grid gap-4 py-2">
                      <div className="grid gap-2">
                        <Label>Title</Label>
                        <Input name="title" value={form.title} onChange={handleChange} />
                      </div>

                      <div className="grid gap-2">
                        <Label>Auction Date</Label>
                        <Input type="date" name="auctionDate" value={form.auctionDate} min={today} onChange={handleChange} />
                      </div>

                      <div className="grid gap-2">
                        <Label>Issue Date</Label>
                        <Input type="date" name="issueDate" value={form.issueDate} min={today} onChange={handleChange} />
                      </div>

                      <div className="grid gap-2">
                        <Label>Maturity Date</Label>
                        <Input type="date" name="maturityDate" value={form.maturityDate} min={today} onChange={handleChange} />
                      </div>

                      <div className="grid gap-2">
                        <Label>Months</Label>
                        <Select value={form.auctionMonths} onValueChange={handleSelectChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Months" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="6">6</SelectItem>
                            <SelectItem value="12">12</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label>Last Auction Rate (%)</Label>
                        <Input type="number" name="lastAuctionRate" value={form.lastAuctionRate} onChange={handleChange} />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="rates">
                    <div className="grid gap-4 py-2">
                      <div className="grid gap-2">
                        <Label>Auction Rate (%)</Label>
                        <Input type="number" name="auctionRate" value={form.auctionRate} onChange={handleChange} disabled={!isRatesEditable()} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Face Value</Label>
                        <Input type="number" name="faceValue" value={form.faceValue} onChange={handleChange} disabled={!isRatesEditable()} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Yield (%)</Label>
                        <Input type="number" name="yield" value={form.yield} onChange={handleChange} disabled={!isRatesEditable()} />
                      </div>
                      {!isRatesEditable() && <p className="text-sm text-red-600">Auction Rates can only be updated after auction starts.</p>}
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="grid gap-4 py-2">
                  <div className="grid gap-2">
                    <Label>Months</Label>
                    <Select value={form.auctionMonths} onValueChange={handleSelectChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Months" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="6">6</SelectItem>
                        <SelectItem value="12">12</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Title</Label>
                    <Input name="title" value={form.title} onChange={handleChange} />
                  </div>

                  <div className="grid gap-2">
                    <Label>Auction Date</Label>
                    <Input type="date" name="auctionDate" value={form.auctionDate} min={today} onChange={handleChange} />
                  </div>

                  <div className="grid gap-2">
                    <Label>Issue Date</Label>
                    <Input type="date" name="issueDate" value={form.issueDate} min={today} onChange={handleChange} />
                  </div>

                  <div className="grid gap-2">
                    <Label>Maturity Date</Label>
                    <Input type="date" name="maturityDate" value={form.maturityDate} min={today} onChange={handleChange} />
                  </div>

                  <div className="grid gap-2">
                    <Label>Last Auction Rate (%)</Label>
                    <Input type="number" name="lastAuctionRate" value={form.lastAuctionRate} onChange={handleChange} />
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Updating..." : isUpdateMode ? "Update Auction" : "Submit"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Modal */}
          <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Delete Auction</DialogTitle>
              </DialogHeader>

              <p className="py-4">
                Are you sure you want to delete auction "<strong>{auctionToDelete?.title}</strong>"?
              </p>

              <DialogFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={submitting}>
                  Cancel
                </Button>

                <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
                  Yes, Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* SHADCN TABLE */}
          <div className="rounded-md border mt-4">
            {loading ? (
              <p className="p-4">Loading auctions...</p>
            ) : auctions.length === 0 ? (
              <p className="p-4">No auctions found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Auction Date</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Maturity Date</TableHead>
                    <TableHead>Months</TableHead>
                    <TableHead>Last Rate</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {auctions.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>{new Date(item.auctionDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(item.issueDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(item.maturityDate).toLocaleDateString()}</TableCell>
                      <TableCell>{item.auctionMonths}</TableCell>
                      <TableCell>{item.lastAuctionRate}</TableCell>
                      <TableCell className="text-right w-[150px]">
                        <div className="flex justify-start items-center gap-2">
                          {/* <Button size="sm" variant="default" onClick={() => openUpdateModal(item)}> */}
                            <IconEdit size={20} onClick={() => openUpdateModal(item)} className="text-primary cursor-pointer" />
                          {/* </Button> */}
                          {/* <Button size="sm" variant="destructive" onClick={() => openDeleteModal(item)}> */}
                            <IconTrash size={20} onClick={() => openDeleteModal(item)} className="text-destructive cursor-pointer"/>
                          {/* </Button> */}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
