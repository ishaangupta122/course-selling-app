import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import UpdateCourse from "../../components/instructor/UpdateCourse";
import {
  Plus,
  Trash2,
  FolderOpen,
  FileVideo,
  FileText,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  X,
} from "lucide-react";
import { Error, Loading } from "../../components/LoadingError";
import { Course, CourseContent, CourseFolder } from "../../utils/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCourse,
  createCourseFolder,
  deleteCourseFolder,
  deleteCourseContent,
  deleteCourse,
  reorderContent,
} from "../../api/courses";

// ─── Inline viewer modal ─────────────────────────────────────────────────────
const ContentViewer = ({
  content,
  onClose,
}: {
  content: CourseContent;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <div className="flex items-center gap-3">
          {content.type === "VIDEO" ? (
            <FileVideo size={20} className="text-blue-500" />
          ) : (
            <FileText size={20} className="text-green-500" />
          )}
          <div>
            <h2 className="font-semibold text-gray-900 text-base">
              {content.name}
            </h2>
            <span className="text-xs text-gray-400 uppercase">
              {content.type}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1"
            title="Open in new tab">
            <ExternalLink size={16} />
            Open
          </a>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-900">
        {content.type === "VIDEO" ? (
          <video
            key={content.url}
            controls
            autoPlay
            className="w-full max-h-[70vh] outline-none">
            <source src={content.url} />
            Your browser does not support the video tag.
          </video>
        ) : (
          <iframe
            key={content.url}
            src={content.url}
            className="w-full h-[70vh]"
            title={content.name}
          />
        )}
      </div>
    </div>
  </div>
);

// ─── Main page ───────────────────────────────────────────────────────────────
const ManageCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { isLoading, error, refetch, data } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourse(courseId!),
  });

  const [course, setCourse] = useState<Course>();
  const [isUpdateCourseModalOpen, setIsUpdateCourseModalOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [addingFolder, setAddingFolder] = useState(false);
  const [expandedFolderId, setExpandedFolderId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingCourse, setDeletingCourse] = useState(false);
  const [previewContent, setPreviewContent] = useState<CourseContent | null>(
    null,
  );
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    if (data?.course) {
      setCourse(data.course);
    }
  }, [data]);

  useEffect(() => {
    if (isUpdateCourseModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isUpdateCourseModalOpen]);

  const handleClickAway = () => setIsUpdateCourseModalOpen(false);

  const handleAddFolder = async (e: any) => {
    e.preventDefault();
    try {
      setAddingFolder(true);
      await createCourseFolder(courseId!, folderName);
      setFolderName("");
      setAddingFolder(false);
      await refetch();
    } catch {
      setAddingFolder(false);
      alert("Something went wrong!");
    }
  };

  const handleDeleteFolder = async (folder: CourseFolder) => {
    if (!confirm(`Delete folder "${folder.name}" and all its contents?`))
      return;
    try {
      setDeletingId(folder.id);
      await deleteCourseFolder(folder.id);
      if (expandedFolderId === folder.id) setExpandedFolderId(null);
      await refetch();
    } catch {
      alert("Failed to delete folder.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteContent = async (content: CourseContent) => {
    if (!confirm(`Delete "${content.name}"?`)) return;
    try {
      setDeletingId(content.id);
      await deleteCourseContent(content.id);
      await refetch();
    } catch {
      alert("Failed to delete content.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCourse = async () => {
    if (
      !confirm(
        `Delete "${course?.title}"?\n\nThis will permanently remove the course, all its folders, videos and notes from storage. This cannot be undone.`,
      )
    )
      return;
    try {
      setDeletingCourse(true);
      await deleteCourse(courseId!);
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      navigate("/instructor/dashboard");
    } catch {
      alert("Failed to delete course. Please try again.");
      setDeletingCourse(false);
    }
  };

  // Move a content item up or down within its folder, persist to DB
  const handleMove = async (
    folder: CourseFolder,
    content: CourseContent,
    direction: "up" | "down",
  ) => {
    if (!folder.courseContents) return;
    const sorted = [...folder.courseContents].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    const idx = sorted.findIndex((c) => c.id === content.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    // Swap locally for instant UI feedback
    [sorted[idx], sorted[swapIdx]] = [sorted[swapIdx], sorted[idx]];

    setCourse((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        courseFolders: prev.courseFolders?.map((f) =>
          f.id === folder.id
            ? { ...f, courseContents: sorted }
            : f,
        ),
      };
    });

    // Persist to DB
    try {
      setReordering(true);
      await reorderContent(
        folder.id,
        sorted.map((c) => c.id),
      );
    } catch {
      // Revert on failure
      await refetch();
    } finally {
      setReordering(false);
    }
  };

  if (isLoading || !course) return <Loading />;
  if (error) return <Error />;

  return (
    <>
      {/* Content viewer modal */}
      {previewContent && (
        <ContentViewer
          content={previewContent}
          onClose={() => setPreviewContent(null)}
        />
      )}

      <div>
        {/* ── Course header ── */}
        <section className="text-gray-700 body-font overflow-hidden">
          <div className="container px-5 pt-10 pb-10 mx-auto">
            <div className="md:w-4/5 mx-auto flex flex-wrap items-center">
              <img
                alt="course thumbnail"
                className="md:w-1/2 w-full object-cover rounded-xl border border-gray-200 aspect-video"
                src={course?.thumbnailUrl}
              />
              <div className="md:w-1/2 w-full md:pl-10 md:py-6 mt-6 md:mt-0">
                <h1 className="text-gray-900 text-3xl font-bold mb-2">
                  {course?.title}
                </h1>
                <p className="text-2xl font-medium text-gray-800 mb-3">
                  ₹{course?.price}
                </p>
                <div className="flex gap-2 mb-3">
                  {course?.level && (
                    <span className="bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-xs font-semibold">
                      {course.level}
                    </span>
                  )}
                  {course?.type && (
                    <span className="bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-xs font-semibold">
                      {course.type}
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {course?.description}
                </p>
                {course?.startDate && (
                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                    <span className="bg-gray-100 rounded-full px-2 py-1 font-medium">
                      {course.startDate.slice(0, 10)}
                    </span>
                    {course.endDate && (
                      <>
                        <span>→</span>
                        <span className="bg-gray-100 rounded-full px-2 py-1 font-medium">
                          {course.endDate.slice(0, 10)}
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap border-t border-gray-200 mt-5 pt-5 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsUpdateCourseModalOpen(true)}
                    className="h-10 px-5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition">
                    Edit
                  </button>
                  <Link to={`/instructor/dashboard/course/${courseId}/add`}>
                    <button
                      type="button"
                      className="h-10 px-5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition">
                      Add Content
                    </button>
                  </Link>
                  <button
                    type="button"
                    disabled={deletingCourse}
                    onClick={handleDeleteCourse}
                    className="ml-auto inline-flex items-center gap-2 h-10 px-4 rounded-lg border-2 border-red-500 text-red-500 text-sm font-medium hover:bg-red-50 transition disabled:opacity-50">
                    <AlertTriangle size={15} />
                    {deletingCourse ? "Deleting..." : "Delete Course"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Course Content ── */}
        <div className="container md:w-4/5 mx-auto px-4 pb-16">
          <div className="flex md:flex-row flex-col md:items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 md:mb-0 mb-4">
              Course Content
            </h2>
            <form
              className="flex items-center gap-3"
              onSubmit={handleAddFolder}>
              <input
                type="text"
                className="border border-gray-200 p-2 outline-none rounded-lg text-sm focus:border-gray-500 transition"
                placeholder="New folder name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                required
              />
              <button
                disabled={addingFolder}
                type="submit"
                className={`flex items-center px-4 py-2 rounded-lg text-white text-sm font-medium ${
                  addingFolder ? "bg-gray-400" : "bg-gray-900 hover:bg-gray-700"
                } transition`}>
                {addingFolder ? (
                  "Adding..."
                ) : (
                  <>
                    <Plus size={15} />
                    <span className="pl-1">Add Folder</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {!course?.courseFolders?.length ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
              <FolderOpen size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">
                No folders yet. Create one above to organise your content.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {course.courseFolders.map((folder) => {
                const sortedContents = [...(folder.courseContents ?? [])].sort(
                  (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
                );
                const isExpanded = expandedFolderId === folder.id;

                return (
                  <div
                    key={folder.id}
                    className="border border-gray-200 rounded-xl overflow-hidden">
                    {/* Folder row */}
                    <div className="flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition">
                      <button
                        className="flex items-center gap-3 flex-1 text-left"
                        onClick={() =>
                          setExpandedFolderId(isExpanded ? null : folder.id)
                        }>
                        <FolderOpen
                          size={19}
                          className="text-yellow-500 shrink-0"
                        />
                        <span className="font-semibold text-gray-800 text-sm">
                          {folder.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({sortedContents.length} item
                          {sortedContents.length !== 1 ? "s" : ""})
                        </span>
                        {isExpanded ? (
                          <ChevronDown
                            size={15}
                            className="text-gray-400 ml-1"
                          />
                        ) : (
                          <ChevronRight
                            size={15}
                            className="text-gray-400 ml-1"
                          />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteFolder(folder)}
                        disabled={deletingId === folder.id}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-40"
                        title="Delete folder">
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Content list */}
                    {isExpanded && (
                      <div className="divide-y divide-gray-100">
                        {!sortedContents.length ? (
                          <p className="px-6 py-5 text-sm text-gray-400 text-center">
                            No content in this folder yet.{" "}
                            <Link
                              to={`/instructor/dashboard/course/${courseId}/add`}
                              className="text-gray-800 underline">
                              Upload something →
                            </Link>
                          </p>
                        ) : (
                          sortedContents.map((content, idx) => (
                            <div
                              key={content.id}
                              className="flex items-center justify-between px-6 py-3 bg-white hover:bg-gray-50 transition group">
                              {/* Left: icon + name (click to preview) */}
                              <button
                                className="flex items-center gap-3 flex-1 text-left"
                                onClick={() => setPreviewContent(content)}>
                                {content.type === "VIDEO" ? (
                                  <FileVideo
                                    size={17}
                                    className="text-blue-400 shrink-0"
                                  />
                                ) : (
                                  <FileText
                                    size={17}
                                    className="text-green-500 shrink-0"
                                  />
                                )}
                                <div>
                                  <p className="text-sm font-medium text-gray-800 group-hover:text-black">
                                    {content.name}
                                  </p>
                                  <span className="text-xs text-gray-400 uppercase">
                                    {content.type} · Click to preview
                                  </span>
                                </div>
                              </button>

                              {/* Right: reorder + delete */}
                              <div className="flex items-center gap-1 ml-4">
                                {/* Up */}
                                <button
                                  disabled={idx === 0 || reordering}
                                  onClick={() =>
                                    handleMove(folder, content, "up")
                                  }
                                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition disabled:opacity-20"
                                  title="Move up">
                                  <ArrowUp size={14} />
                                </button>
                                {/* Down */}
                                <button
                                  disabled={
                                    idx === sortedContents.length - 1 ||
                                    reordering
                                  }
                                  onClick={() =>
                                    handleMove(folder, content, "down")
                                  }
                                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition disabled:opacity-20"
                                  title="Move down">
                                  <ArrowDown size={14} />
                                </button>
                                {/* Delete */}
                                <button
                                  onClick={() => handleDeleteContent(content)}
                                  disabled={deletingId === content.id}
                                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-40 ml-1"
                                  title="Delete content">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {isUpdateCourseModalOpen && (
        <UpdateCourse handleClickAway={handleClickAway} course={course!} />
      )}
    </>
  );
};

export default ManageCourse;
