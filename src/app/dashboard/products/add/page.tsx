import { AddProductForm } from "@/components/features/AddProductForm"

export default function AddProductPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Tambah Barang</h2>
                <p className="text-slate-500">Masukkan data barang baru ke database.</p>
            </div>
            <AddProductForm />
        </div>
    )
}
