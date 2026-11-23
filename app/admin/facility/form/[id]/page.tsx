import { Suspense } from "react"
import { UserForm } from "../user-form"

type EditUserPageProps = {
    params: Promise<{ id: string}>
}

async function EditUserContent({ params }: EditUserPageProps) {
    const { id } = await params
    return <UserForm userId={id} />
}

export default function EditUserPage({ params }: EditUserPageProps) {
    return (
        <Suspense fallback={<div className="p-6">Memuat form user...</div>}>
            <EditUserContent params={params} />
        </Suspense>
    )
}