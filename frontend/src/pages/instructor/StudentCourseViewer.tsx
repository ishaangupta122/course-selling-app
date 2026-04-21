import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCourseDetail } from "../../api/courses";
import { Course, CourseFolder, CourseContent } from "../../utils/types";
import { Error, Loading } from "../../components/LoadingError";
import {
  ChevronDown,
  ChevronRight,
  FolderOpen,
  FileVideo,
  FileText,
  ArrowLeft,
  PlayCircle,
} from "lucide-react";

const StudentCourseViewer = () => {
  const { courseId } = useParams();

  const { isLoading, error, data } = useQuery({
    queryKey: ["studentCourse", courseId],
    queryFn: () => getCourseDetail(courseId!),
  });

  const [course, setCourse] = useState<Course>();
  // Track which folder is open
  const [expandedFolderId, setExpandedFolderId] = useState<string | null>(null);
  // Track which content item is currently being played/viewed
  const [activeContent, setActiveContent] = useState<CourseContent | null>(null);

  useEffect(() => {
    if (data?.course) {
      setCourse(data.course);
      // Auto-open the first folder
      if (data.course.courseFolders?.length) {
        setExpandedFolderId(data.course.courseFolders[0].id);
      }
    }
  }, [data]);

  if (isLoading) return <Loading />;
  if (error) return <Error />;
  if (!course) return <Loading />;

  const isVideo = (content: CourseContent) => content.type === "VIDEO";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-4">
        <Link
          to="/enrolled-courses"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition">
          <ArrowLeft size={16} />
          My Courses
        </Link>
        <span className="text-gray-300">|</span>
        <h1 className="text-sm font-semibold text-gray-800 truncate">
          {course.title}
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-53px)]">
        {/* ── LEFT: Sidebar (folder + content list) ── */}
        <aside className="lg:w-80 w-full bg-white border-r overflow-y-auto shrink-0">
          {/* Course thumbnail + meta */}
          <div className="p-4 border-b">
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="rounded-lg w-full object-cover aspect-video mb-3"
            />
            <h2 className="font-bold text-gray-900 text-base">{course.title}</h2>
            <div className="flex gap-2 mt-2">
              {course.level && (
                <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs font-medium">
                  {course.level}
                </span>
              )}
              {course.type && (
                <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs font-medium">
                  {course.type}
                </span>
              )}
            </div>
          </div>

          {/* Folders */}
          <div className="py-2">
            {!course.courseFolders?.length ? (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">
                No content available yet.
              </p>
            ) : (
              course.courseFolders.map((folder: CourseFolder) => (
                <div key={folder.id}>
                  {/* Folder header — click to expand */}
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition text-left"
                    onClick={() =>
                      setExpandedFolderId(
                        expandedFolderId === folder.id ? null : folder.id,
                      )
                    }>
                    <div className="flex items-center gap-2">
                      <FolderOpen size={17} className="text-yellow-500 shrink-0" />
                      <span className="text-sm font-semibold text-gray-800">
                        {folder.name}
                      </span>
                    </div>
                    {expandedFolderId === folder.id ? (
                      <ChevronDown size={16} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-400" />
                    )}
                  </button>

                  {/* Content items inside folder */}
                  {expandedFolderId === folder.id && (
                    <div className="bg-gray-50 border-t border-b">
                      {!folder.courseContents?.length ? (
                        <p className="px-6 py-3 text-xs text-gray-400">
                          No content in this folder.
                        </p>
                      ) : (
                        folder.courseContents.map((content: CourseContent) => (
                          <button
                            key={content.id}
                            onClick={() => setActiveContent(content)}
                            className={`w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-gray-100 transition ${
                              activeContent?.id === content.id
                                ? "bg-blue-50 border-l-2 border-blue-500"
                                : ""
                            }`}>
                            {isVideo(content) ? (
                              <FileVideo size={15} className="text-blue-400 shrink-0" />
                            ) : (
                              <FileText size={15} className="text-green-500 shrink-0" />
                            )}
                            <span className="text-sm text-gray-700 truncate">
                              {content.name}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </aside>

        {/* ── RIGHT: Content Viewer ── */}
        <main className="flex-1 overflow-y-auto bg-gray-900 flex flex-col">
          {activeContent ? (
            <div className="flex-1 flex flex-col">
              {isVideo(activeContent) ? (
                /* Video player */
                <div className="w-full bg-black">
                  <video
                    key={activeContent.url}
                    controls
                    className="w-full max-h-[70vh] outline-none"
                    src={activeContent.url}>
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                /* Notes / PDF viewer */
                <div className="flex-1 bg-white">
                  <iframe
                    key={activeContent.url}
                    src={activeContent.url}
                    className="w-full h-full min-h-[70vh]"
                    title={activeContent.name}
                  />
                </div>
              )}

              {/* Content title bar */}
              <div className="bg-gray-800 px-6 py-4">
                <div className="flex items-center gap-3">
                  {isVideo(activeContent) ? (
                    <FileVideo size={18} className="text-blue-400" />
                  ) : (
                    <FileText size={18} className="text-green-400" />
                  )}
                  <div>
                    <h2 className="text-white font-semibold">
                      {activeContent.name}
                    </h2>
                    <span className="text-xs text-gray-400 uppercase">
                      {activeContent.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Empty state — nothing selected yet */
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <PlayCircle size={64} className="text-gray-600 mb-4" />
              <h2 className="text-white text-xl font-semibold">
                Select a lesson to start learning
              </h2>
              <p className="text-gray-400 mt-2 text-sm">
                Pick any video or notes from the sidebar on the left
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentCourseViewer;
