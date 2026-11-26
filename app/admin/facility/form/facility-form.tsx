'use client'

// =========================================================================
// IMPORT
// =========================================================================
import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

// =========================================================================
// TIPE DATA
// Sama dengan field yang dikirim API (facilityFields).
// =========================================================================
type Facility = {
  kode_facility: string
  nama_facility: string
}

// =========================================================================
// PROPS
// - kodeFacility ada  -> mode EDIT (data dimuat lalu disimpan dengan PUT)
// - kodeFacility kosong -> mode TAMBAH (disimpan dengan POST)
// =========================================================================
type FacilityFormProps = {
  kodeFacility?: string
}

// Batas panjang nama, sesuai kolom database VarChar(20)
const MAX_NAMA = 20

export function FacilityForm({ kodeFacility }: FacilityFormProps) {
  const router = useRouter()

  // ---------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------
  const [facility, setFacility] = useState<Facility | null>(null)
  // Saat mode edit, mulai dalam keadaan loading sampai data selesai dimuat
  const [isLoading, setIsLoading] = useState(Boolean(kodeFacility))
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [namaFacility, setNamaFacility] = useState("")

  // ---------------------------------------------------------------------
  // MUAT DATA (hanya mode edit)
  // GET /api/tbl_facility?kode=FAC0000001  ->  { facility }
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (!kodeFacility) return

    // Penanda agar state tidak diubah jika komponen sudah ditutup
    let isActive = true

    async function loadFacility() {
      try {
        const response = await fetch(
          `/api/facility?kode=${encodeURIComponent(kodeFacility!)}`
        )

        // Pastikan respons JSON (bukan halaman 404 HTML)
        const contentType = response.headers.get("content-type") ?? ""
        if (!contentType.includes("application/json")) {
          throw new Error(`Endpoint tidak mengembalikan JSON (status ${response.status}).`)
        }

        const result = await response.json()
        if (!response.ok) throw new Error(result.error ?? "Gagal memuat facility.")

        if (isActive) {
          setFacility(result.facility)
          setNamaFacility(result.facility.nama_facility)
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError instanceof Error ? loadError.message : "Gagal memuat facility.")
        }
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    void loadFacility()

    // Cleanup: tandai komponen sudah tidak aktif
    return () => {
      isActive = false
    }
  }, [kodeFacility])

  // ---------------------------------------------------------------------
  // SIMPAN DATA
  // - Edit   : PUT  /api/tbl_facility?kode=...
  // - Tambah : POST /api/tbl_facility
  // Body sama: { nama_facility }. kode_facility dibuat otomatis oleh API.
  // ---------------------------------------------------------------------
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault() // cegah reload halaman
    setIsSaving(true)
    setError("")

    try {
      const url = kodeFacility
        ? `/api/facility?kode=${encodeURIComponent(kodeFacility)}`
        : "/api/facility"

      const response = await fetch(url, {
        method: kodeFacility ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama_facility: namaFacility.trim() }),
      })

      const contentType = response.headers.get("content-type") ?? ""
      if (!contentType.includes("application/json")) {
        throw new Error(`Endpoint tidak mengembalikan JSON (status ${response.status}).`)
      }

      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? "Gagal menyimpan facility.")

      // Berhasil -> kembali ke halaman daftar
      router.push("/admin/facility")
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Gagal menyimpan facility.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="m-6 px-4">
      {/* ============ HEADER: judul + tombol kembali ============ */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">
          {kodeFacility ? "Edit facility" : "Tambah facility"}
        </h1>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/facility")}>
          <ArrowLeft aria-hidden="true" />
          Kembali
        </Button>
      </div>

      {/* Pesan error (jika ada) */}
      {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}

      {isLoading ? (
        // Sedang memuat data (mode edit)
        <p className="mt-5 text-sm text-muted-foreground">Memuat facility...</p>
      ) : kodeFacility && !facility ? null : (
        // Mode edit tapi data gagal dimuat -> form disembunyikan (error sudah tampil)
        <form onSubmit={handleSubmit} className="mt-5 grid gap-4 rounded-md border p-4 sm:grid-cols-2">
          {/* Kode facility: hanya tampil saat edit, tidak bisa diubah (primary key) */}
          {facility && (
            <div className="grid gap-1.5">
              <label htmlFor="kode_facility" className="text-sm font-medium">Kode facility</label>
              <Input id="kode_facility" value={facility.kode_facility} disabled readOnly />
            </div>
          )}

          {/* Nama facility */}
          <div className="grid gap-1.5">
            <label htmlFor="nama_facility" className="text-sm font-medium">Nama facility</label>
            <Input
              id="nama_facility"
              value={namaFacility}
              onChange={(event) => setNamaFacility(event.target.value)}
              required
              maxLength={MAX_NAMA}
              placeholder={`Maksimal ${MAX_NAMA} karakter`}
            />
          </div>

          {/* Tombol batal + simpan */}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/facility")}
              disabled={isSaving}
            >
              <X aria-hidden="true" />
              Batal
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Menyimpan..." : facility ? "Simpan perubahan" : "Buat facility"}
            </Button>
          </div>
        </form>
      )}
    </Card>
  )
}