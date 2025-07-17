import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SummernoteEditor from "../neighborhood/SummernoteEditor";
import "../../css/Announce/AnnounceWrite.css";
import { axiosAPI } from "../../api/axiosApi";
import { toast } from "react-toastify";

export default function AnnounceWrite() {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.pathname.includes("/edit");

  const {
    id,
    title: initTitle = "",
    content: initContent = "",
  } = location.state || {};

  const [title, setTitle] = useState(initTitle);
  const [content, setContent] = useState(initContent);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fixImageUrls = (html) => {
    if (!html) return html;
    return html.replace(
      /src="\/images\/announceImg\//g,
      'src="http://localhost:8080/images/announceImg/'
    );
  };

  const onSubmit = async () => {
    const strippedContent = content.replace(/<[^>]+>/g, ""); // 태그 제거

    if (!title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }

    if (title.length > 50) {
      toast.error("제목은 50자 이내로 입력해주세요.");
      return;
    }

    if (!content || strippedContent.trim() === "") {
      toast.error("내용을 입력해주세요.");
      return;
    }

    if (strippedContent.length > 2000) {
      toast.error("내용은 2000자 이내로 작성해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const fixedContent = fixImageUrls(content);
      const payload = {
        announceTitle: title,
        announce: fixedContent,
      };

      if (isEditMode) {
        await axiosAPI.put(
          `http://localhost:8080/api/announce/edit/${id}`,
          payload,
          { withCredentials: true }
        );
        toast.success("공지사항이 수정되었습니다.");
      } else {
        await axiosAPI.post(
          "http://localhost:8080/api/announce/write",
          payload,
          { withCredentials: true }
        );
        toast.success("공지사항이 등록되었습니다.");
        await axiosAPI.post("http://localhost:8080/announce");
      }

      navigate("/announce");
    } catch (error) {
      console.error(error);
      toast.error("공지사항 제출 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="announce-write-container">
      <h2 style={{ marginBottom: "24px" }}>
        {isEditMode ? "수정페이지" : "작성페이지"}
      </h2>

      <div className="announce-write-form">
        {/* 제목 입력 */}
        <div style={{ marginBottom: "20px", position: "relative" }}>
          <input
            type="text"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => {
              const newValue = e.target.value;
              if (newValue.length <= 50) {
                setTitle(newValue);
              }
            }}
            disabled={isSubmitting}
            maxLength={50}
            style={{
              width: "1000px",
              padding: "12px 16px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Summernote 에디터 */}
        <div style={{ marginBottom: "20px", position: "relative" }}>
          <SummernoteEditor
            value={content}
            onChange={setContent}
            disabled={isSubmitting}
          />
        </div>

        <div className="button-container">
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="announce-write-submit-button"
          >
            {isSubmitting
              ? isEditMode
                ? "수정 중..."
                : "등록 중..."
              : isEditMode
              ? "공지사항 수정"
              : "공지사항 등록"}
          </button>
        </div>
      </div>
    </div>
  );
}
