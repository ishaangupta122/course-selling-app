import { useEffect, useState } from "react";
import { Upload, Folder, CheckCircle, AlertCircle } from "lucide-react";
import { getCourse, uploadCourseContent } from "../../api/courses";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { Error, Loading } from "../../components/LoadingError";
import { Course } from "../../utils/types";
import { ArrowLeft } from "lucide-react";

const AddVideo = () => {
  const { courseId } = useParams();

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourse(courseId!),
  });

  const [course, setCourse] = useState<Course>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentFolder, setCurrentFolder] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<"VIDEO" | "NOTES">("VIDEO");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (data?.course) {
      setCourse(data.course);
    }
  }, [data]);

  // Reset file selection when type changes
  const handleTypeChange = (newType: "VIDEO" | "NOTES") => {
    setType(newType);
    setSelectedFile(null);
    setStatus("idle");
    setMessage("");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Auto-fill name from filename (strip extension)
      if (!name) {
        setName(file.name.replace(/\.[^/.]+$/, ""));
      }
      setSelectedFile(file);
      setStatus("idle");
      setMessage("");
    }
  };

  const uploadFile = async () => {
    if (!selectedFile || !currentFolder) {
      setMessage("Please select a file and choose a folder.");
      setStatus("error");
      return;
    }
    if (!name.trim()) {
      setMessage("Please enter a title.");
      setStatus("error");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setStatus("idle");

    try {
      await uploadCourseContent({
        file: selectedFile,
        name: name.trim(),
        type,
        courseId: courseId!,
        folderId: currentFolder,
        onUploadProgress: (progress) => setUploadProgress(progress),
      });

      setStatus("success");
      setMessage(
        `${type === "VIDEO" ? "Video" : "Notes"} uploaded successfully!`,
      );
      setSelectedFile(null);
      setName("");
      setUploadProgress(100);
      // Refresh folder list so new item shows immediately
      refetch();
    } catch (error) {
      setStatus("error");
      setMessage("Upload failed. Please check your connection and try again.");
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <Error />;

  const isNotes = type === "NOTES";
  const acceptAttr = isNotes ? "application/pdf,.pdf" : "video/*";
  const fileLabel = isNotes ? "PDF file" : "video file";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link
          to={`/instructor/dashboard/course/${courseId}`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition">
          <ArrowLeft size={16} />
          Back to {course?.title ?? "Course"}
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Add Course Content
          </h1>
          <p className="text-sm text-gray-400 mb-8">
            Upload a video lesson or PDF notes to a folder in this course.
          </p>

          {/* Content Type Toggle */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Content Type
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange("VIDEO")}
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition ${
                  !isNotes
                    ? "border-black bg-black text-white"
                    : "border-gray-200 text-gray-500 hover:border-gray-400"
                }`}>
                🎬 Video
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("NOTES")}
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition ${
                  isNotes
                    ? "border-black bg-black text-white"
                    : "border-gray-200 text-gray-500 hover:border-gray-400"
                }`}>
                📄 Notes (PDF)
              </button>
            </div>
          </div>

          {/* Folder Select */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Folder size={14} className="inline mr-1" />
              Folder
            </label>
            <select
              value={currentFolder}
              onChange={(e) => setCurrentFolder(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-800 transition">
              <option value="">Select a folder</option>
              {course?.courseFolders?.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
            {!course?.courseFolders?.length && (
              <p className="text-xs text-amber-600 mt-1">
                No folders yet.{" "}
                <Link
                  to={`/instructor/dashboard/course/${courseId}`}
                  className="underline">
                  Go back and create one first.
                </Link>
              </p>
            )}
          </div>

          {/* Title */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {isNotes ? "Notes Title" : "Video Title"}
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-800 transition"
              placeholder={
                isNotes
                  ? "e.g. Week 1 Lecture Notes"
                  : "e.g. Introduction to the Course"
              }
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* File Upload Zone */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Upload size={14} className="inline mr-1" />
              Upload {isNotes ? "PDF" : "Video"}
            </label>

            {selectedFile ? (
              <div className="border-2 border-green-300 bg-green-50 rounded-xl p-5 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB ·{" "}
                    {isNotes ? "PDF" : "Video"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setStatus("idle");
                  }}
                  className="text-xs text-red-500 hover:text-red-700 font-medium">
                  Remove
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-gray-400 transition">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept={acceptAttr}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
                    {isNotes ? "📄" : "🎬"}
                  </div>
                  <p className="text-sm font-medium text-gray-600">
                    Click to select a {fileLabel}
                  </p>
                  <p className="text-xs text-gray-400">
                    {isNotes ? "PDF only" : "MP4, MOV, AVI, MKV etc."}
                  </p>
                </label>
              </div>
            )}
          </div>

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Status Message */}
          {status !== "idle" && message && (
            <div
              className={`mb-5 p-3 rounded-xl flex items-center gap-2 text-sm ${
                status === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
              {status === "success" ? (
                <CheckCircle size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              {message}
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={uploadFile}
            disabled={
              !selectedFile || !currentFolder || !name.trim() || uploading
            }
            className={`w-full py-3 rounded-xl font-semibold text-sm transition ${
              !selectedFile || !currentFolder || !name.trim() || uploading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800 active:scale-[0.99]"
            }`}>
            {uploading
              ? `Uploading ${isNotes ? "Notes" : "Video"}...`
              : `Upload ${isNotes ? "Notes" : "Video"}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddVideo;
