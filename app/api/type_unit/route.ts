import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const typeunitFields = {
  id_unit_type: true,
  nama_type_unit: true,
  branch_id: true,
  create_at: true,
  update_at: true,
} as const

function isPrismaError(error: unknown, code: string) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === code
  )
}

function parseName(value: unknown): string | null {
  const name = typeof value === "string" ? value.trim() : ""
  return name && name.length <= 100 ? name : null
}

export async function GET() {
  try {
    const units = await prisma.tbl_type_unit.findMany({
      orderBy: { id_unit_type: "asc" },
      select: {
        ...typeunitFields,
        facilities: { select: { kode_facility: true } },
      },
    })

    return NextResponse.json(units.map((unit) => ({
      id_unit_type: unit.id_unit_type,
      nama_type_unit: unit.nama_type_unit,
      branch_id: unit.branch_id,
      total_facilities: unit.facilities.length,
    })))
  } catch (error) {
    console.error("Failed to fetch type units:", error)
    return NextResponse.json({ error: "Gagal memuat data type unit." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Format request tidak valid." }, { status: 400 })
  }

  const nama_type_unit = parseName(body.nama_type_unit)
  const branch_id = Number(body.branch_id)
  if (!nama_type_unit) {
    return NextResponse.json({ error: "Nama type unit maksimal 100 karakter." }, { status: 400 })
  }
  if (!Number.isInteger(branch_id) || branch_id <= 0) {
    return NextResponse.json({ error: "Branch tidak valid." }, { status: 400 })
  }

  try {
    const unit = await prisma.tbl_type_unit.create({
      data: { nama_type_unit, branch_id },
      select: typeunitFields,
    })
    return NextResponse.json({ unit }, { status: 201 })
  } catch (error) {
    console.error("Failed to create type unit:", error)
    return NextResponse.json({ error: "Gagal membuat type unit." }, { status: 500 })
  }
}