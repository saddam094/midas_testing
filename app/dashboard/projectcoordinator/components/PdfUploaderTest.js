"use client";
import axios from "axios";
import { useState } from "react";

const PdfUploaderTest = () => {
  const [fileName, setFileName] = useState("");
  const [uploadedFileUrl, setUploadedFileUrl] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setFileName(file.name);
      await presignedUrlMethod(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const presignedUrlMethod = async (file) => {
    try {
      const response = await axios.post(
        "https://ljnb9aytkl.execute-api.ap-south-1.amazonaws.com/production/bs_memorial_mandtory_desclosure_pdf_presigned",
        { fileName: [file.name] }
      );

      console.log("Presigned URL Response:", response.data);

      const presignedUrl = response.data["body-json"]["body"][0];
      console.log("Presigned URL:", presignedUrl);

      await uploadFile(file, presignedUrl);
    } catch (error) {
      console.error("Error getting presigned URL:", error);
    }
  };

  const uploadFile = async (file, presignedUrl) => {
    try {
      const response = await axios.put(presignedUrl, file, {
        headers: { "Content-Type": "application/pdf" },
      });

      if (response.status === 200) {
        const croppedUrl = presignedUrl.split("?")[0];
        setUploadedFileUrl(croppedUrl);
        console.log("Uploaded File URL:", croppedUrl);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
        Upload PDF
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      {fileName && <p className="text-gray-700">Selected File: {fileName}</p>}
      {uploadedFileUrl && (
        <p className="text-green-700">Uploaded File URL: {uploadedFileUrl}</p>
      )}
    </div>
  );
};

export default PdfUploaderTest;
