// =========================================================================
// FILE: app/api/tbl_facility/route.ts
// Semua endpoint facility ada di file ini:
//   GET    /api/?page=1&pageSize=10   -> daftar (pagination)
//   GET    /api/tbl_facility?kode=FAC0000001      -> satu data (untuk form edit)
//   POST   /api/tbl_facility                      -> tambah data
//   PUT    /api/tbl_facility?kode=FAC0000001      -> ubah data
//   DELETE /api/tbl_facility?kode=FAC0000001      -> hapus data
// =========================================================================
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// =========================================================================
// FIELD YANG DIKEMBALIKAN KE CLIENT
// Nama field harus sama persis dengan schema.prisma (huruf kecil semua).
// =========================================================================
const facilityFields = {
  kode_facility: true,
  nama_facility: true,
  create_at: true,
  update_at: true,
} as const

// =========================================================================
// HELPER: CEK ERROR PRISMA BERDASARKAN KODE
// Contoh kode: "P2002" (data duplikat), "P2025" (data tidak ditemukan)
// =========================================================================
function isPrismaError(error: unknown, code: string) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === code
  )
}

// =========================================================================
// HELPER: AMBIL NAMA KOLOM YANG BENTROK (error P2002)
// Pada MySQL, target bisa berupa nama index seperti "PRIMARY".
// Mengembalikan null jika bukan error P2002.
// =========================================================================
function getUniqueTarget(error: unknown): string | null {
  if (!isPrismaError(error, "P2002")) return null

  const target = (error as { meta?: { target?: unknown } }).meta?.target
  if (Array.isArray(target)) return target.join(",")
  if (typeof target === "string") return target
  return ""
}

// =========================================================================
// HELPER: VALIDASI NAMA FACILITY
// Kolom di database VarChar(20), jadi maksimal 20 karakter.
// Mengembalikan nama yang sudah dirapikan, atau null jika tidak valid.
// =========================================================================
function parseNama(value: unknown): string | null {
  const nama = typeof value === "string" ? value.trim() : ""
  if (!nama || nama.length > 20) return null
  return nama
}

// =========================================================================
// HELPER: AUTO NUMBER KODE FACILITY
// Cari kode terakhir berawalan "FAC", ambil angkanya, tambah 1.
// Contoh hasil: FAC0000001, FAC0000002, dst.
// Parameter `tx` = transaction client agar berada dalam satu transaksi.
// =========================================================================
async function generateKodeFacility(tx: Pick<typeof prisma, "tbl_facility">) {
  const prefix = "FAC"

  const last = await tx.tbl_facility.findFirst({
    where: { kode_facility: { startsWith: prefix } },
    orderBy: { kode_facility: "desc" },
    select: { kode_facility: true },
  })

  // Belum ada data -> mulai dari nomor 1
  if (!last?.kode_facility) {
    return `${prefix}0000001`
  }

  const lastNumber = Number.parseInt(last.kode_facility.slice(prefix.length), 10)
  const nextNumber = Number.isNaN(lastNumber) ? 1 : lastNumber + 1

  // padStart(7, "0") -> 1 menjadi "0000001"
  return `${prefix}${String(nextNumber).padStart(7, "0")}`
}

// =========================================================================
// GET
// - Ada ?kode=...  -> kembalikan SATU facility
// - Tanpa ?kode    -> kembalikan DAFTAR facility dengan pagination
// =========================================================================
export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams
  const kode = searchParams.get("kode")?.trim()

  try {
    // ---------- MODE 1: ambil satu data berdasarkan kode ----------
    if (kode) {
      const facility = await prisma.tbl_facility.findUnique({
        where: { kode_facility: kode },
        select: facilityFields,
      })

      if (!facility) {
        return NextResponse.json({ error: "Facility tidak ditemukan." }, { status: 404 })
      }

      return NextResponse.json({ facility })
    }

    // ---------- MODE 2: daftar dengan pagination ----------
    const requestedPage = Number.parseInt(searchParams.get("page") ?? "1", 10)
    const requestedPageSize = Number.parseInt(searchParams.get("pageSize") ?? "10", 10)

    // pageSize dibatasi 1 - 100, default 10
    const pageSize = Number.isFinite(requestedPageSize)
      ? Math.min(100, Math.max(1, requestedPageSize))
      : 10

    // Hitung total data untuk menentukan jumlah halaman
    const totalFacilities = await prisma.tbl_facility.count()
    const totalPages = Math.max(1, Math.ceil(totalFacilities / pageSize))

    // Pastikan page valid: minimal 1 dan tidak melebihi totalPages
    const page =
      Number.isFinite(requestedPage) && requestedPage > 0
        ? Math.min(requestedPage, totalPages)
        : 1

    const facilities = await prisma.tbl_facility.findMany({
      orderBy: { create_at: "desc" }, // terbaru di atas
      skip: (page - 1) * pageSize,    // lewati data halaman sebelumnya
      take: pageSize,
      select: facilityFields,
    })

    return NextResponse.json({
      facilities,
      pagination: { page, pageSize, totalFacilities, totalPages },
    })
  } catch (error) {
    console.error("Failed to fetch facilities:", error)
    return NextResponse.json({ error: "Gagal memuat data facility." }, { status: 500 })
  }
}

// =========================================================================
// POST  ->  body JSON: { "nama_facility": "..." }
// kode_facility dibuat otomatis oleh backend.
// =========================================================================
export async function POST(request: Request) {
  let body: Record<string, unknown>

  // Parse body. Jika formatnya rusak, balas 400 (Bad Request)
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Format request tidak valid." }, { status: 400 })
  }

  // Validasi nama
  const nama_facility = parseNama(body.nama_facility)
  if (!nama_facility) {
    return NextResponse.json(
      { error: "Nama facility tidak valid (maksimal 20 karakter)." },
      { status: 400 }
    )
  }

  // Jumlah maksimal percobaan ulang jika kode bentrok
  const MAX_RETRY = 3

  try {
    for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
      try {
        // Transaksi: generate kode dan simpan data dalam satu kesatuan
        const facility = await prisma.$transaction(async (transaction) => {
          const kode_facility = await generateKodeFacility(transaction)

          return transaction.tbl_facility.create({
            data: { kode_facility, nama_facility },
            select: facilityFields,
          })
        })

        // Berhasil -> 201 Created
        return NextResponse.json({ facility }, { status: 201 })
      } catch (error) {
        const target = getUniqueTarget(error)

        // Kode bentrok (dua request bersamaan dapat nomor sama) -> ulangi
        if (
          target !== null &&
          (target.includes("kode_facility") || target.includes("PRIMARY")) &&
          attempt < MAX_RETRY
        ) {
          continue
        }

        // Error lain / percobaan habis -> lempar ke catch luar
        throw error
      }
    }

    // Semua percobaan habis tanpa berhasil
    return NextResponse.json({ error: "Gagal membuat kode facility." }, { status: 500 })
  } catch (error) {
    console.error("Failed to create facility:", error)
    return NextResponse.json(
      { error: "Gagal membuat facility. Periksa koneksi database." },
      { status: 500 }
    )
  }
}

// =========================================================================
// PUT  ->  /api/tbl_facility?kode=FAC0000001
// body JSON: { "nama_facility": "..." }
// Hanya nama yang bisa diubah. kode_facility adalah primary key.
// update_at diperbarui otomatis oleh Prisma (@updatedAt).
// =========================================================================
export async function PUT(request: Request) {
  const kode = new URL(request.url).searchParams.get("kode")?.trim()

  if (!kode) {
    return NextResponse.json({ error: "Kode facility wajib diisi." }, { status: 400 })
  }

  let body: Record<string, unknown>

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Format request tidak valid." }, { status: 400 })
  }

  const nama_facility = parseNama(body.nama_facility)
  if (!nama_facility) {
    return NextResponse.json(
      { error: "Nama facility tidak valid (maksimal 20 karakter)." },
      { status: 400 }
    )
  }

  try {
    const facility = await prisma.tbl_facility.update({
      where: { kode_facility: kode },
      data: { nama_facility },
      select: facilityFields,
    })

    return NextResponse.json({ facility })
  } catch (error) {
    // P2025 = data yang mau diubah tidak ditemukan
    if (isPrismaError(error, "P2025")) {
      return NextResponse.json({ error: "Facility tidak ditemukan." }, { status: 404 })
    }

    console.error("Failed to update facility:", error)
    return NextResponse.json({ error: "Gagal mengubah facility." }, { status: 500 })
  }
}

// =========================================================================
// DELETE  ->  /api/tbl_facility?kode=FAC0000001
// Menghapus satu facility berdasarkan kode_facility (primary key).
// =========================================================================
export async function DELETE(request: Request) {
  const kode = new URL(request.url).searchParams.get("kode")?.trim()

  if (!kode) {
    return NextResponse.json({ error: "Kode facility wajib diisi." }, { status: 400 })
  }

  try {
    await prisma.tbl_facility.delete({
      where: { kode_facility: kode },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    // P2025 = data yang mau dihapus tidak ditemukan
    if (isPrismaError(error, "P2025")) {
      return NextResponse.json({ error: "Facility tidak ditemukan." }, { status: 404 })
    }

    console.error("Failed to delete facility:", error)
    return NextResponse.json({ error: "Gagal menghapus facility." }, { status: 500 })
  }
}