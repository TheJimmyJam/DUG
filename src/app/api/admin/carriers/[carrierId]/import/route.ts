import { NextRequest, NextResponse } from "next/server";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import * as XLSX from "xlsx";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ carrierId: string }> }
) {
  const { carrierId } = await params;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const fileName = file.name.toLowerCase();
  let format: "csv" | "xlsx" = "csv";
  let headers: string[] = [];

  if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
    format = "xlsx";
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 });
    headers = (rows[0] ?? []).map(String);
  } else {
    format = "csv";
    const text = await file.text();
    headers = text.split("\n")[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  }

  // Upload file to storage
  const storagePath = `${carrierId}/${Date.now()}-${file.name}`;
  const fileBuffer = await file.arrayBuffer();
  const { error: uploadErr } = await supabase.storage
    .from("carrier-imports")
    .upload(storagePath, fileBuffer, { contentType: file.type || "application/octet-stream" });

  let raw_file_url: string | null = null;
  if (!uploadErr) {
    const { data: urlData } = supabase.storage
      .from("carrier-imports")
      .getPublicUrl(storagePath);
    raw_file_url = urlData?.publicUrl ?? null;
  }

  // Insert batch record
  const { data: batch, error: batchErr } = await supabase
    .from("import_batches")
    .insert({
      carrier_id: carrierId,
      source_format: format,
      field_mapping: { headers },
      raw_file_url,
      imported_by: user.id,
      status: "mapping",
    })
    .select("id")
    .single();

  if (batchErr) return NextResponse.json({ error: batchErr.message }, { status: 500 });

  return NextResponse.redirect(
    new URL(`/admin/carriers/${carrierId}/import/${batch.id}/map`, request.url)
  );
}
