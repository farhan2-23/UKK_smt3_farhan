'use client'

// =========================================================================
// IMPORT
// =========================================================================
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

// =========================================================================
// TIPE DATA
// Harus sama dengan field yang dikirim API (select: facilityFields).
// Tanggal dikirim sebagai string ISO lewat JSON, jadi tipenya string.
// =========================================================================
type Facility = {
    kode_facility: string
    nama_facility: string
    create_at: string
    update_at: string
}

// Jumlah data per halaman (dikirim ke API sebagai pageSize)
const PAGE_SIZE = 10

export default function FacilityManagementPage() {
    const router = useRouter()

    // ---------------------------------------------------------------------
    // STATE
    // ---------------------------------------------------------------------
    const [facilities, setFacilities] = useState<Facility[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalFacilities, setTotalFacilities] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    // ---------------------------------------------------------------------
    // AMBIL DATA DARI API
    // GET /api/facility?page=1&pageSize=10
    // Respons: { facilities, pagination: { page, totalFacilities, ... } }
    // ---------------------------------------------------------------------
    async function loadFacilities(page = currentPage) {
        setIsLoading(true)
        setError("")
        try {
            const response = await fetch(`/api/facility?page=${page}&pageSize=${PAGE_SIZE}`)
            const result = await response.json()
            if (!response.ok) throw new Error(result.error ?? "Gagal memuat facility.")

            setFacilities(result.facilities)
            setTotalFacilities(result.pagination.totalFacilities)
            // Pakai page dari server, karena server bisa mengoreksi page
            // yang melebihi jumlah halaman
            setCurrentPage(result.pagination.page)
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Gagal memuat facility.")
        } finally {
            setIsLoading(false)
        }
    }

    // Muat halaman pertama saat komponen pertama kali tampil
    useEffect(() => {
        const loadTimer = window.setTimeout(() => {
            void loadFacilities(1)
        }, 0)

        return () => window.clearTimeout(loadTimer)
    }, [])

    // Pindah halaman: ambil ulang data untuk halaman tujuan
    function goToPage(page: number) {
        setCurrentPage(page)
        void loadFacilities(page)
    }

    // ---------------------------------------------------------------------
    // HAPUS DATA
    // DELETE /api/facility/{kode_facility}
    // encodeURIComponent dipakai agar kode aman dimasukkan ke URL.
    // ---------------------------------------------------------------------
    async function deleteFacility(facility: Facility) {
        if (!window.confirm(`Hapus facility ${facility.nama_facility}?`)) return
        setError("")
        try {
            const response = await fetch(
                `/api/facility/${encodeURIComponent(facility.kode_facility)}`,
                { method: "DELETE" }
            )
            const result = await response.json()
            if (!response.ok) throw new Error(result.error ?? "Gagal menghapus facility.")

            // Jika yang dihapus adalah data terakhir di halaman ini (dan bukan
            // halaman 1), mundur satu halaman agar tidak menampilkan halaman kosong.
            if (facilities.length === 1 && currentPage > 1) {
                goToPage(currentPage - 1)
            } else {
                await loadFacilities(currentPage)
            }
        } catch (deleteError) {
            setError(deleteError instanceof Error ? deleteError.message : "Gagal menghapus facility.")
        }
    }

    // Hitung jumlah halaman (minimal 1)
    const totalPages = Math.max(1, Math.ceil(totalFacilities / PAGE_SIZE))

    return (
        <Card className="m-6 px-4">
            {/* ============ HEADER: judul + tombol tambah ============ */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="mb-1 text-2xl font-bold">Facility Management</h1>
                    <p className="text-sm text-muted-foreground">Kelola data facility.</p>
                </div>
                <Button onClick={() => router.push("/admin/facility/form/add")}>
                    <Plus aria-hidden="true" />
                    Tambah facility
                </Button>
            </div>

            {/* Pesan error (jika ada) */}
            {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}

            {/* ============ TABEL DATA ============ */}
            <div className="mt-5 overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Kode Facility</TableHead>
                            <TableHead>Nama Facility</TableHead>
                            <TableHead>Dibuat</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            // Sedang memuat. colSpan = jumlah kolom (4)
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">Memuat facility...</TableCell>
                            </TableRow>
                        ) : facilities.length === 0 ? (
                            // Data kosong
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">Belum ada facility.</TableCell>
                            </TableRow>
                        ) : facilities.map((facility) => (
                            // key memakai kode_facility karena unik (primary key)
                            <TableRow key={facility.kode_facility}>
                                <TableCell>{facility.kode_facility}</TableCell>
                                <TableCell className="font-medium">{facility.nama_facility}</TableCell>
                                <TableCell>
                                    {new Date(facility.create_at).toLocaleDateString("id-ID")}
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-end gap-1">
                                        {/* Tombol edit -> halaman form dengan kode facility */}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Edit ${facility.nama_facility}`}
                                            title="Edit facility"
                                            onClick={() =>
                                                router.push(
                                                    `/admin/facility/form/${encodeURIComponent(facility.kode_facility)}`
                                                )
                                            }
                                        >
                                            <Pencil aria-hidden="true" />
                                        </Button>
                                        {/* Tombol hapus -> konfirmasi lalu DELETE */}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Hapus ${facility.nama_facility}`}
                                            title="Hapus facility"
                                            onClick={() => void deleteFacility(facility)}
                                        >
                                            <Trash2 aria-hidden="true" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* ============ PAGINATION ============ */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <Pagination>
                    <PaginationContent>
                        {/* Tombol sebelumnya: nonaktif di halaman 1 atau saat loading */}
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                aria-disabled={currentPage === 1 || isLoading}
                                className={currentPage === 1 || isLoading ? "pointer-events-none opacity-50" : undefined}
                                onClick={(event) => {
                                    event.preventDefault() // cegah loncat ke "#"
                                    if (currentPage > 1 && !isLoading) goToPage(currentPage - 1)
                                }}
                            />
                        </PaginationItem>

                        {/* Nomor halaman + elipsis (...) */}
                        {getPageItems(currentPage, totalPages).map((item, index) => (
                            <PaginationItem key={`${item}-${index}`}>
                                {item === "ellipsis" ? (
                                    <PaginationEllipsis />
                                ) : (
                                    <PaginationLink
                                        href="#"
                                        isActive={item === currentPage}
                                        aria-label={`Go to page ${item}`}
                                        onClick={(event) => {
                                            event.preventDefault()
                                            if (!isLoading && item !== currentPage) goToPage(item)
                                        }}
                                    >
                                        {item}
                                    </PaginationLink>
                                )}
                            </PaginationItem>
                        ))}

                        {/* Tombol berikutnya: nonaktif di halaman terakhir atau saat loading */}
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                aria-disabled={currentPage === totalPages || isLoading}
                                className={currentPage === totalPages || isLoading ? "pointer-events-none opacity-50" : undefined}
                                onClick={(event) => {
                                    event.preventDefault()
                                    if (currentPage < totalPages && !isLoading) goToPage(currentPage + 1)
                                }}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </Card>
    )
}

// =========================================================================
// HELPER: MENENTUKAN ITEM PAGINATION YANG DITAMPILKAN
// Mengembalikan daftar nomor halaman dan "ellipsis" (...).
// Contoh (totalPages = 10):
//   halaman 1  -> [1, 2, 3, ...]
//   halaman 5  -> [1, ..., 4, 5, 6, ...]
//   halaman 10 -> [..., 8, 9, 10]
// =========================================================================
function getPageItems(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
    // Halaman sedikit -> tampilkan semua
    if (totalPages <= 4) {
        return Array.from({ length: totalPages }, (_, index) => index + 1)
    }
    // Dekat awal
    if (currentPage <= 2) return [1, 2, 3, "ellipsis"]
    // Dekat akhir
    if (currentPage >= totalPages - 1) {
        return ["ellipsis", totalPages - 2, totalPages - 1, totalPages]
    }
    // Di tengah
    return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis"]
}