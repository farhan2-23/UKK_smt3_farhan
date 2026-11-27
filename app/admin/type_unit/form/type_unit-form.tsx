'use client'

import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type FacilityItem = {
  kode_facility: string
  nama_facility: string
}

type TypeUnitInfo = {
  id_unit_type: number
  nama_type_unit: string
  branch_id: number
}

type TypeUnitFormProps = {
  unitId?: string
}

// Form untuk memasang atau melepas facility pada satu Type Unit tertentu.
export function TypeUnitForm({ unitId }: TypeUnitFormProps) {
  const router = useRouter()
  const [unit, setUnit] = useState<TypeUnitInfo | null>(null)
  const [facilities, setFacilities] = useState<FacilityItem[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(unitId))
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!unitId) return

    // Muat detail unit dan daftar facility beserta relasi yang sudah tersimpan.
    let isActive = true
    async function loadData() {
      try {
        const response = await fetch(`/api/type_unit/${unitId}`)
        const result = await response.json()
        if (!response.ok) throw new Error(result.error ?? "Gagal memuat data fasilitas unit.")

        if (isActive) {
          setUnit(result.unit)
          setFacilities(result.facilities)
          setSelected(result.selectedCodes)
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError instanceof Error ? loadError.message : "Gagal memuat data.")
        }
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    void loadData()
    return () => {
      isActive = false
    }
  }, [unitId])

  function toggleItem(kode: string) {
    // Checkbox mengubah pilihan lokal; perubahan baru disimpan saat submit.
    setSelected((prev) =>
      prev.includes(kode) ? prev.filter((item) => item !== kode) : [...prev, kode]
    )
  }

  function toggleAll() {
    if (selected.length === facilities.length) {
      setSelected([])
    } else {
      setSelected(facilities.map((f) => f.kode_facility))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!unitId) return

    setIsSaving(true)
    setError("")
    try {
      // Kirim seluruh daftar pilihan agar server menyinkronkan relasi unit-facility.
      const response = await fetch(`/api/type_unit/${unitId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kode_facilities: selected }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? "Gagal menyimpan fasilitas unit.")
      router.push("/admin/type_unit")
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Gagal menyimpan fasilitas unit.")
    } finally {
      setIsSaving(false)
    }
  }

  const isAllChecked = facilities.length > 0 && selected.length === facilities.length

  return (
    <Card className="m-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {unit ? `Atur Fasilitas: ${unit.nama_type_unit}` : "Atur Fasilitas Unit"}
          </h1>
          {unit && (
            <p className="text-sm text-muted-foreground">
              Branch {unit.branch_id} &bull; {selected.length} dari {facilities.length} fasilitas dipilih
            </p>
          )}
        </div>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/type_unit")}>
          <ArrowLeft aria-hidden="true" />
          Kembali
        </Button>
      </div>

      {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}

      {!unitId ? (
        <p className="mt-5 text-sm text-destructive">ID Type Unit tidak ditemukan di URL.</p>
      ) : isLoading ? (
        <p className="mt-5 text-sm text-muted-foreground">Memuat daftar fasilitas...</p>
      ) : !unit ? null : (
        // Setiap baris mewakili facility yang dapat dipilih untuk unit ini.
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox checked={isAllChecked} onCheckedChange={toggleAll} />
                  </TableHead>
                  <TableHead className="w-40">Kode Facility</TableHead>
                  <TableHead>Nama Facility</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facilities.map((item) => {
                  const checked = selected.includes(item.kode_facility)
                  return (
                    <TableRow
                      key={item.kode_facility}
                      onClick={() => toggleItem(item.kode_facility)}
                      className={`cursor-pointer ${checked ? "bg-muted/60" : ""}`}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleItem(item.kode_facility)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{item.kode_facility}</TableCell>
                      <TableCell>{item.nama_facility}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/type_unit")}
              disabled={isSaving}
            >
              <X aria-hidden="true" />
              Batal
            </Button>
            <Button type="submit" disabled={isSaving}>
              <Save aria-hidden="true" />
              {isSaving ? "Menyimpan..." : "Simpan fasilitas"}
            </Button>
          </div>
        </form>
      )}
    </Card>
  )
}