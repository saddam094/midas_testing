'use client'
import { useState, useCallback, useEffect } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';


const ParticularJob = ({ jobId, closeModal }) => {

    const notify = (message) => toast.success(message);
    const notifyError = (message) => toast.error(message);

    const [jobDetails, setJobDetails] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /// Status
    const [isComplete, setIsComplete] = useState(true);
    const [isCompleteEnable, setIsCompleteEnable] = useState(false);
    const [isSendToSccount, setIsSendToAccount] = useState(false);
    // const [isSendToSccountEnable, setIsSendToAccountEnable] = useState(false);

    /// Send To Account
    const [installationImage, setInstallationImage] = useState(null);
    const [installationImageUrl, setInstallationImageUrl] = useState(null);

    const [billFiles, setBillFiles] = useState([]);
    const [billFilesUrl, setBillFilesUrl] = useState([]);

    const [remarks, setRemarks] = useState("");

    /// =================================== Send To Account=============================================
    const [installationImagePreview, setInstallationImagePreview] = useState(null);

    const [billFilePreviews, setBillFilePreviews] = useState([]);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalFile, setModalFile] = useState(null);




    const handleSendToAccount = async () => {

        if (!installationImage) {
            notifyError('Please Select Installation Image');
            return;
        }

        if (billFiles.length === 0) {
            notifyError('Please Select Bill Image And Pdf');
            return;
        }

        const installationUrl = await uploadInstallationImage();

        const billUrls = await uploadBillImageAndPdf();

        console.log('Installation', installationImageUrl);
        console.log('Bill', billFilesUrl);

        if (!installationUrl) {
            notifyError('Error While Uploading Installation Image');
            return;
        }

        if (!billUrls || billUrls.length === 0) {
            notifyError('Error While Uploading Bill Image And Pdf');
            return;
        }

        /// Send To Account Final Code
        try {
            const employeeId = localStorage.getItem('employeeId');

            const data = {
                jobId: jobId,
                sentBy: employeeId,
                remarks: remarks,
                image: [installationUrl],
                billImage: billUrls
            };

            console.log('data', data);

            const url = 'https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_job_send_to_account_from_installation';

            const response = await axios.put(url, data);

            console.log('Api Response Send To Account', response);

            if (response.data && response.data['body-json'].statusCode === 200) {

                notify(response.data['body-json']['body']);

                closeModal();

                fetchJobDetails();

            } else if (response.data && response.data['body-json'].statusCode === 400) {

                notifyError(response.data['body-json']['body']);

            } else {
                throw new Error('Failed to update job status');
            }
        } catch (err) {
            console.error("Update status error:", err);
        }


    };


    /// Handle Upload Insatallation Image
    const uploadInstallationImage = async () => {
        const signedUrl = await getPresignedUrlForInstallationImage(installationImage);

        if (signedUrl) {
            const success = await uploadFiles([signedUrl], [installationImage]);
            if (success) {
                const baseUrl = signedUrl.split('?')[0];
                // setInstallationImageUrl(baseUrl);
                notify('✅ Installation Image Uploaded Successfully'); 
                return baseUrl;
            } else {
                notifyError('Please Re-upload Installation Image');
                return null;
            }
        }
        return null;
    };

    // const uploadInstallationImage = async () => {
    //     const signedUrl = await getPresignedUrlForInstallationImage(installationImage);

    //     if (signedUrl) {
    //         console.log('✅ Installation Image Presigned Url Get Successfully');

    //         const flag = uploadFiles([signedUrl], [installationImage]);

    //         if (flag) {
    //             const [baseUrl] = signedUrl.split('?');

    //             console.log(baseUrl);

    //             setInstallationImageUrl(baseUrl);

    //             console.log(installationImageUrl);

    //             notify('✅ Installation Image Uploaded Successfully')
    //         } else {
    //             notifyError('Please Re-upload Installation Image');
    //         }

    //     }

    // };


    /// Get Presigned Url For Installation Iamge
    const getPresignedUrlForInstallationImage = async (file) => {
        try {

            const data = {
                fileName: [file.name],
                folderName: "installation-image",
                type: 'image'
            };

            console.log('data', data);

            const url = 'https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_installation_image_presigned';

            const response = await axios.post(url, data);
            console.log('Api Response Get Presigned Url For Installation Image', response);

            if (response.data && response.data['body-json'].statusCode === 200) {

                return response.data['body-json'].body[0];

            } else {
                throw new Error('Failed to update job status');
            }
        } catch (err) {
            console.error("Update status error:", err);
            return null;
        }
    };

    /// ========================================Common For Both Installation And Bill =====================================================


    /// Upload File Installation Image
    const uploadFiles = async (signedUrls, fileList) => {
        try {
            const files = Object.values(fileList).filter(file => file); // Get only non-null files

            const uploadPromises = files.map(async (file, index) => {
                if (!signedUrls[index]) {
                    console.error(`⚠️ No URL for ${file.name}`);
                    return;
                }

                try {
                    const uploadResponse = await axios.put(signedUrls[index], file, {
                        headers: {
                            'Content-Type': file.type // Ensure correct MIME type (e.g., image/png, application/pdf)
                        },
                        transformRequest: [(data, headers) => {
                            // Axios sometimes modifies data; this ensures raw binary is sent
                            return data;
                        }]
                    });

                    if (uploadResponse.status === 200) {
                        console.log(`✅ Uploaded ${file.name} successfully!`);
                        return true;

                    } else {
                        console.log(`⚠️ Upload failed for ${file.name}, Status: ${uploadResponse.status}`);
                        return false;
                    }
                } catch (error) {
                    console.error(`❌ Error uploading ${file.name}:`, error.message);
                    return false;
                }
            });

            await Promise.all(uploadPromises);
            console.log('✅ All uploads completed!');
            return true;

        } catch (error) {
            console.error('❌ Error uploading images:', error.message);
            return false;
        }
    };


    /// ===================================== Bill Image Or Pdf==================================================
    const uploadBillImageAndPdf = async () => {

        const imageFiles = [];
        const imageFileNames = [];

        const pdfFiles = [];
        const pdfFileNames = [];

        billFiles.forEach((file) => {
            if (file.type.startsWith("image/")) {
                imageFileNames.push(file.name);
                imageFiles.push(file);
            } else if (file.type === "application/pdf") {
                pdfFileNames.push(file.name);
                pdfFiles.push(file);
            }
        });



        const imageSignedUrl = await getPresignedUrlForBillImageAndPdf(imageFileNames, "installation-bill-image", "image");
        const pdfSignedUrl = await getPresignedUrlForBillImageAndPdf(pdfFileNames, "installation-bill-image", "pdf");

        if (imageSignedUrl.length !== 0 || pdfSignedUrl.length !== 0) {
            console.log('✅ Bill Image And Pdf Presigned Url Get Successfully');

            const billFileUrls = [];

            if (imageSignedUrl.length !== 0) {
                const flag1 = uploadFiles(imageSignedUrl, imageFiles);

                if (flag1) {
                    imageSignedUrl.forEach((url) => {
                        const baseUrl = url.split('?')[0];
                        billFileUrls.push(baseUrl);
                    })
                } else {
                    notifyError('Please Re-upload Bill Image');
                }
            }

            if (pdfSignedUrl.length !== 0) {
                const flag2 = uploadFiles(pdfSignedUrl, pdfFiles);

                if (flag2) {
                    pdfSignedUrl.forEach((url) => {
                        const baseUrl = url.split('?')[0];
                        billFileUrls.push(baseUrl);
                    })
                } else {
                    notifyError('Please Re-upload Bill Image');
                }
            }

            if (billFileUrls.length !== 0) {
                // console.log(billFileUrls)
                // setBillFilesUrl(billFileUrls);

                notify('✅ Bill Image And Pdf Uploaded Successfully');

                return billFileUrls;
            }

            return null;

        }

        // return null;

    };

    /// Get Presigned Url For Bill Iamge And Pdf
    const getPresignedUrlForBillImageAndPdf = async (fileNames, folder, type) => {
        try {

            const data = {
                fileName: fileNames,
                folderName: folder,
                type: type
            };

            console.log('data', data);

            const url = 'https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_installation_image_presigned';

            const response = await axios.post(url, data);
            console.log(`Api Response Get Presigned Url For Bill ${type}`, response);

            if (response.data && response.data['body-json'].statusCode === 200) {

                return response.data['body-json'].body;

            } else {
                throw new Error('Failed to update job status');
            }
        } catch (err) {
            console.error("Update status error:", err);
            return null;
        }
    };





    /// Update Status
    const updateStatus = async () => {

        if(isComplete === false){
            return;
        }

        try {
            const employeeId = localStorage.getItem("employeeId");

            const data = {
                jobId: jobId,
                staffId: employeeId,
                status: 'complete'
            };

            console.log('data', data);
            // console.log('token', token);

            // const headers = {
            //     headers: {
            //         Authorization: `Bearer ${token}`
            //     }
            // };

            const url = 'https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_installation_status_update';

            const response = await axios.put(url, data);
            console.log('Api Response Update Status', response);

            if (response.data && response.data['body-json'].statusCode === 200) {

                fetchJobDetails();

            } else {
                throw new Error('Failed to update job status');
            }
        } catch (err) {
            console.error("Update status error:", err);
        }
    };



    /// Fetch Recent Job
    const fetchJobDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = { jobId: jobId };
            console.log(data);
            const response = await axios.post('https://icutw3djvd.execute-api.ap-south-1.amazonaws.com/Prod/midas_particular_job_all_data', data);
            console.log('Api Response Job Details', response);
            const body = response.data['body-json']['body'];

            if (response.data && response.data['body-json'].statusCode === 200) {
                setJobDetails(body);
                if (body['flag'] === false && body['status'] === 'complete') {
                    setIsCompleteEnable(true);
                    setIsSendToAccount(true);
                    // setIsSendToAccountEnable(true);
                    setIsComplete(true);
                    setIsCompleteEnable(false);
                } else 
                    // if (body['status'] === 'not_started') 
                    {
                    setIsCompleteEnable(true);
                    setIsComplete(false);
                }
            } else {
                throw new Error('Failed to fetch recent jobs');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [jobId]);

    useEffect(() => {
        fetchJobDetails();
    }, [fetchJobDetails]);


    const updateCheckBox = (e) => {
        setIsComplete(e.target.checked);
    }




    if (loading) return <div className="pt-24"><p className="text-center">Loading...</p></div>;
    if (jobId === "") return <div className="pt-24"><p className="text-center">Unable To Fetch JobId</p></div>;
    if (error) return <div className="pt-24"><p className="text-center text-red-500">Error: {error}</p></div>;

    return (
        <>
            <div className="px-4 pt-20 sm:px-10">

                {/* Title and Back Button */}
                <div className="flex items-center justify-between px-4 py-3 border-b">

                    {/* Title */}
                    <h1 className="text-center w-full text-lg sm:text-xl font-semibold text-gray-800">
                        Particular Job
                    </h1>

                </div>

                {/* Spacer */}
                <div className="h-2" />


                {/* JOB DETAILS CARD */}
                <div className="bg-white border border-gray-300 rounded-xl shadow-sm py-2 px-5 sm:py-2">
                    <h2 className="text-lg font-bold text-gray-800 text-center">JOB DETAILS</h2>

                    <div className="text-sm sm:text-base text-gray-700">
                        <p><span className="font-semibold text-blue-700">Project :</span> {jobDetails?.projectName || "N/A"}</p>
                        <p><span className="font-semibold text-blue-700">Job Name :</span> {jobDetails?.jobName || "N/A"}</p>
                        <p><span className="font-semibold text-blue-700">Receive Date :</span> {jobDetails?.receiveDate || "N/A"}</p>
                        <p><span className="font-semibold text-blue-700">Status :</span> {jobDetails?.status || "N/A"}</p>
                    </div>
                </div>

                {/* Spacer */}
                <div className="h-2" />


                {/* PROJECT CO-ORDINATOR */}
                <div className="bg-white border border-gray-300 rounded-xl shadow-sm p-4 sm:p-6">
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Project Co-ordinator</h3>
                    <div className="flex items-center space-x-3">
                        <div className="bg-gray-200 p-2 rounded-full">
                            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 10a4 4 0 100-8 4 4 0 000 8zm-6 8a6 6 0 1112 0H4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <span className="text-gray-700 text-sm sm:text-base capitalize">{jobDetails?.projectCoordinatorName || "N/A"}</span>
                    </div>
                </div>

                {/* Spacer */}
                <div className="h-2" />

                {/* COMPLETE STATUS */}
                <div className="bg-white border border-gray-300 rounded-xl shadow-sm p-4 sm:p-6 space-y-3">
                    <h3 className="text-base font-semibold text-gray-800">Complete Status</h3>
                    <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={isComplete}
                                disabled={!isCompleteEnable}
                                onChange={updateCheckBox}
                                className="h-4 w-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                            />
                            <span className="text-gray-700 text-sm sm:text-base">Job has been completed</span>
                        </label>

                        {
                        isCompleteEnable && <button className={`px-3 py-1 text-md sm:text-md rounded-full ${isComplete ? "bg-green-500 text-white" : "bg-red-500 text-white"}`} 
                        // disabled={!isComplete && isCompleteEnable}
                        // disabled={isCompleteEnable}
                        // disabled={isComplete}

                        onClick={updateStatus}>Completed</button>
                        }

                    </div>
                </div>


                {/* Spacer */}
                <div className="h-2" />

                {/* SEND TO ACCOUNT */}
                <div className="bg-white border border-gray-300 rounded-xl shadow-sm p-4 sm:p-6 space-y-3">
                    <h3 className="text-base font-semibold text-gray-800">Send To Account</h3>

                    {/* Installation Image Upload */}
                    <div className="space-y-1">
                        <label className="block">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id="installation-upload"
                                disabled={!isSendToSccount}
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file && file.type.startsWith("image/")) {
                                        setInstallationImage(file);
                                        setInstallationImagePreview(URL.createObjectURL(file));
                                    } else {
                                        alert("Please upload a valid image file");
                                        e.target.value = "";
                                    }
                                }}
                            />
                            <label htmlFor="installation-upload" className={`block text-white text-center py-2 rounded-lg cursor-pointer ${isSendToSccount ? "bg-blue-700" : "bg-red-400"}`}>
                                Select Installation Image
                            </label>
                        </label>
                        <p className="text-xs text-gray-500">**A maximum of 1 image can be added at a time.</p>

                        {installationImagePreview && (
                            <div className="mt-2">
                                <p className="text-sm font-medium text-gray-700 mb-1">Preview:</p>
                                <img
                                    src={installationImagePreview}
                                    alt="Installation Preview"
                                    className="max-w-full h-20 rounded-md border"
                                />
                            </div>
                        )}

                    </div>

                    {/* Bill Image Upload */}
                    <div className="space-y-1">
                        <label className="block">
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                multiple
                                disabled={!isSendToSccount}
                                onChange={(e) => {

                                    const files = Array.from(e.target.files);
                                    if (files.length > 12) {
                                        alert("You can upload a maximum of 12 files.");
                                        e.target.value = "";
                                        return;
                                    }
                                    setBillFiles(files);

                                    // Create previews
                                    const previews = files.map(file => {
                                        let previewUrl = "";
                                        if (file.type.startsWith("image/")) {
                                            previewUrl = URL.createObjectURL(file);
                                        } else if (file.type === "application/pdf") {
                                            // For PDF, no image preview - you can show a PDF icon or file name instead
                                            previewUrl = null; // no preview URL, will handle separately
                                        }
                                        return { file, previewUrl, type: file.type };
                                    });
                                    setBillFilePreviews(previews);
                                }}

                                className="hidden"
                                id="bill-upload"
                            />
                            <label htmlFor="bill-upload" className={`block text-white text-center py-2 rounded-lg cursor-pointer ${isSendToSccount ? "bg-blue-700" : "bg-red-400"}`}>
                                Select Bill Image
                            </label>
                        </label>
                        <p className="text-xs text-gray-500">**A maximum of 12 files can be added at a time.</p>



                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 mt-4">
                            {billFilePreviews.map(({ file, previewUrl, type }, idx) => (
                                <div
                                    key={idx}
                                    className="relative flex flex-col items-center border p-2 rounded-md bg-gray-50 cursor-pointer hover:shadow-lg transition"
                                    onClick={() => {
                                        setModalFile({ file, previewUrl, type });
                                        setModalOpen(true);
                                    }}
                                >
                                    {/* REMOVE BUTTON */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent modal open when clicking remove
                                            setBillFilePreviews((prev) => prev.filter((_, i) => i !== idx));
                                        }}
                                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                                        title="Remove file"
                                    >
                                        ×
                                    </button>

                                    {/* IMAGE OR PDF PREVIEW */}
                                    {type.startsWith("image/") && previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt={`Preview ${file.name}`}
                                            className="max-w-20 max-h-20 rounded"
                                        />
                                    ) : type === "application/pdf" ? (
                                        <div className="flex flex-col items-center justify-center w-full h-24 bg-red-100 text-red-700 text-xs font-semibold rounded">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-8 w-8 mb-1"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 6v6l4 2"
                                                />
                                            </svg>
                                            <span className="truncate max-w-full">{file.name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-500 truncate max-w-full">
                                            {file.name}
                                        </span>
                                    )}

                                    <p className="mt-1 text-xs text-gray-600 text-center break-words">
                                        {file.name}
                                    </p>
                                </div>
                            ))}
                        </div>


                        {modalOpen && modalFile && (
                            <div
                                className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                                onClick={() => setModalOpen(false)}
                            >
                                <div
                                    className="bg-white rounded p-4 max-w-[90vw] max-h-[90vh] overflow-auto"
                                    onClick={e => e.stopPropagation()} // prevent closing when clicking inside modal
                                >
                                    {modalFile.type.startsWith("image/") && modalFile.previewUrl ? (
                                        <img
                                            src={modalFile.previewUrl}
                                            alt={`Preview ${modalFile.file.name}`}
                                            className="max-w-full max-h-[80vh]"
                                        />
                                    ) : modalFile.type === "application/pdf" ? (
                                        <iframe
                                            src={modalFile.previewUrl || URL.createObjectURL(modalFile.file)}
                                            title={modalFile.file.name}
                                            className="w-[80vw] h-[80vh]"
                                        />
                                    ) : (
                                        <p>Preview not available</p>
                                    )}
                                    <button
                                        onClick={() => setModalOpen(false)}
                                        className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}


                    </div>

                    {/* Remarks */}
                    <textarea
                        rows={3}
                        placeholder="Remarks (optional)"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-base"
                    />

                    {/* Submit Button */}
                    <button
                        onClick={handleSendToAccount}
                        disabled={!isSendToSccount}
                        className={`block w-full text-white text-center py-2 rounded-lg cursor-pointer ${isSendToSccount ? "bg-blue-700" : "bg-red-400"}`}
                    >
                        Send To Account
                    </button>
                </div>

            </div>
        </>
    );

}

export default ParticularJob;