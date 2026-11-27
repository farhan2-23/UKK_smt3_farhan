import { Suspense } from "react"
import { FacilityForm } from "../facility-form"

type EditFacilityPageProps = {
    params: Promise<{ id: string}>
}

async function EditFacilityContent({ params }: EditFacilityPageProps) {
    const { id } = await params
    return <FacilityForm kodeFacility={id} />
}

export default function EditFacilityPage({ params }: EditFacilityPageProps) {
    return (
        <Suspense fallback={<div className="p-6">Memuat form facility...</div>}>
            <EditFacilityContent params={params} />
        </Suspense>
    )
}