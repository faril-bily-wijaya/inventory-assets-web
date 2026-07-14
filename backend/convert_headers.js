const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '..', 'source_data', 'infranexia_export_2026-07-06 (2).xlsx');
const outputFile = path.join(__dirname, '..', 'source_data', 'ready_to_upload.xlsx');

const headerMap = {
  'ID Perangkat': 'id',
  'Kode Perangkat': 'device_code',
  'Nama Perangkat': 'device_name',
  'Tipe Perangkat': 'device_type',
  'Merek / Brand': 'brand',
  'Model': 'model',
  'Serial Number': 'serial_number',
  'Label Code': 'label_code',
  'Kapasitas': 'kapasitas',
  'Satuan Kapasitas': 'satuan_kapasitas',
  'Tahun Pembuatan': 'year',
  'Usia Perangkat (Tahun)': 'usia_perangkat',
  'Status': 'status',
  'Kondisi': 'condition',
  'Kapasitas Real': 'cap_real',
  'Jenis Tegangan': 'jenis_tegangan',
  'Beban Arus': 'beban_arus',
  'Satuan Beban': 'satuan_beban',
  'Kode Ruangan': 'ruangan_code',
  'Nama Ruangan': 'ruangan_name',
  'Luas Ruangan': 'ruangan_luas',
  'Kode Rak': 'rack_code',
  'Nama Rak': 'rack_name',
  'Luas Rak': 'rack_luas',
  'Keterangan': 'keterangan',
  'Butuh Modernisasi': 'butuh_modernisasi',
  'Alasan Modernisasi': 'alasan_modernisasi',
  'UUID (Sistem)': 'uuid',
  'ID Organisasi': 'organization_uuid',
  'Nama Organisasi': 'organization_name',
  'Singkatan Organisasi': 'organization_sname',
  'Area': 'area',
  'Regional': 'regional',
  'District': 'district',
  'Cluster': 'cluster',
  'ID Lokasi': 'location_id',
  'Nama Lokasi (Site)': 'site_name',
  'Site Code': 'site_code',
  'Alamat Lokasi': 'address',
  'Tipe Kelas Lokasi': 'class_type',
  'Latitude': 'latitude',
  'Longitude': 'longitude',
  'Nama Teknisi': 'teknisi',
  'Dibuat Pada': 'created_at',
  'Diperbarui Pada': 'updated_at'
};

try {
  // Read existing file
  const wb = XLSX.readFile(inputFile);
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];

  // Convert to JSON (array of arrays format to keep exact headers)
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  if (rows.length > 0) {
    const originalHeaders = rows[0];
    const newHeaders = originalHeaders.map(header => {
      // Find mapped value, or if it doesn't exist, use original
      return headerMap[header] || header;
    });

    // Replace first row
    rows[0] = newHeaders;

    // Create new sheet and workbook
    const newSheet = XLSX.utils.aoa_to_sheet(rows);
    const newWb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWb, newSheet, 'Data Perangkat');

    // Write file
    XLSX.writeFile(newWb, outputFile);
    console.log('File successfully generated at: ' + outputFile);
  } else {
    console.log('File is empty!');
  }
} catch (error) {
  console.error('Error:', error);
}
