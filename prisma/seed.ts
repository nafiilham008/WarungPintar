import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import { parse } from 'csv-parse'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
    const csvFilePath = path.resolve('C:/Users/Cahyo/Downloads/warung_data.csv')

    if (!fs.existsSync(csvFilePath)) {
        console.error('CSV file not found at:', csvFilePath)
        return
    }

    // Clear existing data to avoid duplicates
    await prisma.product.deleteMany({})
    console.log('Cleared existing data.')

    const records: any[] = []
    const parser = fs
        .createReadStream(csvFilePath)
        .pipe(parse({
            columns: true, // Auto-detect header
            skip_empty_lines: true,
            trim: true,
            from_line: 4
        }))

    for await (const record of parser) {
        // if (records.length === 0) console.log('RAW RECORD KEYS:', Object.keys(record))

        // Mapping CSV columns to Database Schema

        // Clean up price string "Rp1.000" -> 1000
        let hargaStr = record['Harga Satuan (IDR)'] || '0'
        hargaStr = hargaStr.replace(/[^0-9]/g, '') // Remove non-numeric chars
        const harga = parseInt(hargaStr) || 0

        const no = parseInt(record['NO ']) || null

        // Debug log untuk memastikan key yang benar (bisa dihapus nanti)
        // console.log(record['Keterangan Tempat ']) 

        records.push({
            no: no,
            kategori: record['Kategori'],
            nama: record['Nama Barang'],
            harga: harga,
            satuan: record['Satuan'],
            // Perhatikan spasi di akhir key 'Keterangan Tempat '
            lokasi: record['Keterangan Tempat'],
            detail: record['"keterangan lanjutan (jika tidak ada), (lebih spesifik), tempat ""stok"""'] || record['keterangan lanjutan (jika tidak ada), (lebih spesifik), tempat "stok"'] || ''
        })
    }

    if (records.length > 0) {
        console.log('Sample record:', records[0])
    }

    console.log(`Found ${records.length} records. Inserting to DB...`)

    // Insert in batches or one by one
    let count = 0
    for (const item of records) {
        // Skip if name is empty (sometimes CSV has empty rows)
        if (!item.nama) continue

        await prisma.product.create({
            data: {
                no: item.no,
                kategori: item.kategori,
                nama: item.nama,
                harga: item.harga,
                satuan: item.satuan,
                lokasi: item.lokasi || 'Tidak diketahui',
                detail: item.detail
            }
        })
        count++
        if (count % 50 === 0) console.log(`Processed ${count} items...`)
    }

    console.log(`Seeding finished. Total ${count} items inserted.`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
