export const handleFileUpload = async (file, filetype) => {
  if (!file) return;
  if (!filetype) filetype = "auto";

  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/dmndmxhsc/${filetype}/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "chat_app_preset");

  const response = await fetch(cloudinaryUrl, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Failed to upload file.");
  }

  const { secure_url, public_id } = data;
  return { image_url: secure_url, public_id };
};
