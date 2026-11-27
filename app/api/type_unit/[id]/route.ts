import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type RouteContext = { params: Promise<{ id: string }> }

function isPrismaError(error: unknown, code: string) {
  return typeof error === "object" && error !== null && "code" in error &&
    (error as { code: unknown }).code === code
}

async function getUnitId(context: RouteContext) {
  const { id } = await context.params
  const unitId = Number(id)
  return Number.isInteger(unitId) && unitId > 0 ? unitId : null
}

export async function GET(_request: Request, context: RouteContext) {
  const unitId = await getUnitId(context)
  if (!unitId) return NextResponse.json({ error: "ID type unit tidak valid." }, { status: 400 })

  try {
    const unit = await prisma.tbl_type_unit.findUnique({
      where: { id_unit_type: unitId },
      select: { id_unit_type: true, nama_type_unit: true, branch_id: true },
    })
    if (!unit) return NextResponse.json({ error: "Type unit tidak ditemukan." }, { status: 404 })

    const [facilities, relations] = await Promise.all([
      prisma.tbl_facility.findMany({
        orderBy: { kode_facility: "asc" },
        select: { kode_facility: true, nama_facility: true },
      }),
      prisma.tbl_type_unit_facility.findMany({
        where: { id_unit_type: unitId },
        select: { kode_facility: true },
      }),
    ])

    return NextResponse.json({
      unit,
      facilities,
      selectedCodes: relations.map((relation) => relation.kode_facility),
    })
  } catch (error) {
    console.error("Failed to fetch type unit:", error)
    return NextResponse.json({ error: "Gagal memuat data type unit." }, { status: 500 })
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const unitId = await getUnitId(context)
  if (!unitId) return NextResponse.json({ error: "ID type unit tidak valid." }, { status: 400 })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Format request tidak valid." }, { status: 400 })
  }

  if (!Array.isArray(body.kode_facilities) ||
      body.kode_facilities.some((code) => typeof code !== "string")) {
    return NextResponse.json({ error: "Daftar fasilitas tidak valid." }, { status: 400 })
  }

  const codes = [...new Set(body.kode_facilities as string[])]

  try {
    await prisma.$transaction(async (transaction) => {
      await transaction.tbl_type_unit.findUniqueOrThrow({
        where: { id_unit_type: unitId },
      })
      await transaction.tbl_type_unit_facility.deleteMany({
        where: { id_unit_type: unitId },
      })
      if (codes.length > 0) {
        await transaction.tbl_type_unit_facility.createMany({
          data: codes.map((kode_facility) => ({ id_unit_type: unitId, kode_facility })),
        })
      }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (isPrismaError(error, "P2025")) {
      return NextResponse.json({ error: "Type unit tidak ditemukan." }, { status: 404 })
    }
    console.error("Failed to update type unit facilities:", error)
    return NextResponse.json({ error: "Gagal menyimpan fasilitas type unit." }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unitId = await getUnitId(context)
  if (!unitId) return NextResponse.json({ error: "ID type unit tidak valid." }, { status: 400 })

  try {
    await prisma.tbl_type_unit.delete({ where: { id_unit_type: unitId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (isPrismaError(error, "P2025")) {
      return NextResponse.json({ error: "Type unit tidak ditemukan." }, { status: 404 })
    }
    console.error("Failed to delete type unit:", error)
    return NextResponse.json({ error: "Gagal menghapus type unit." }, { status: 500 })
  }
}