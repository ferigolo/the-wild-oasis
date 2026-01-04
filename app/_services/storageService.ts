import { createClient } from "@supabase/supabase-js";

// You need these in your .env
const supabase = createClient(
  process.env.SUPABASE_STORAGE_URL!,
  process.env.SUPABASE_KEY!
);
const bucketName = "cabin-images";

export async function uploadCabinImage(imageFile: File) {
  const fileName = `${Math.random()}-${imageFile.name}`.replaceAll("/", "");
  const { error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, imageFile);

  if (error) throw new Error("Cabin image could not be uploaded");

  // 2. Generate the Public URL
  // The database will only store this string string
  const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);

  return data.publicUrl;
}
