import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchPostDetail as fetchPostById,
  deletePost,
} from "../../api/AnnounceApi";

import "../../css/Announce/AnnounceDetail.css";
import { toast } from "react-toastify";
import { MemberContext } from "../member/MemberContext";

const AnnounceDetail = () => {
  const { id } = useParams(); // URL 파라미터에서 공지사항 ID 획득
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const { member } = useContext(MemberContext);

  // 관리자 여부 판단: memberAuth가 숫자 0인 경우 관리자 권한으로 간주
  const isAdmin = member && Number(member.memberAuth) === 0;

  useEffect(() => {
    const loadPost = async () => {
      try {
        const data = await fetchPostById(id); // 상세 데이터 + 조회수 증가 API 호출
        setPost(data);
      } catch (error) {
        console.error("공지사항 상세 조회 실패", error);
        toast.error(
          <div>
            <div className="toast-error-title">오류 알림!</div>
            <div className="toast-error-body">
              공지사항을 불러오는 중 오류가 발생했습니다.
            </div>
          </div>
        );
        navigate("/announce"); // 에러 시 목록으로 이동
      }
    };
    loadPost();
  }, [id, navigate]);

  // 삭제 버튼 클릭 시 처리 함수
  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await deletePost(id); // 삭제 API 호출
        toast.success(
          <div>
            <div className="toast-success-title">삭제 성공 알림!</div>
            <div className="toast-success-body">삭제가 완료되었습니다.</div>
          </div>
        );
        navigate("/announce"); // 삭제 후 목록 페이지로 이동
      } catch (error) {
        console.error("삭제 실패", error);
        toast.error(
          <div>
            <div className="toast-error-title">오류 알림!</div>
            <div className="toast-error-body">삭제 중 오류가 발생했습니다.</div>
          </div>
        );
      }
    }
  };

  // 로딩 상태 표시
  if (!post) return <div className="an-detail-loading">로딩 중...</div>;

  return (
    <div className="an-detail-container">
      <div className="an-detail-wrapper">
        <div
          className="an-detail-header"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 0,
          }}
        >
          <h2 className="an-detail-title">
            {post.announceTitle || post.title}
          </h2>
          <div className="an-detail-meta">
            <span>
              작성자 : {post.memberNickname || post.author || "관리자"}
            </span>
            <span className="an-detail-separator">|</span>
            <span>
              작성일 :{" "}
              {post.announceWriteDate
                ? new Date(post.announceWriteDate).toLocaleDateString()
                : post.createdAt
                ? new Date(post.createdAt).toLocaleDateString()
                : "날짜 없음"}
            </span>
            <span className="an-detail-separator">|</span>
            <span>조회수: {post.announceReadCount ?? post.viewCount ?? 0}</span>
          </div>
        </div>

        {/* 본문 내용 */}
        <div
          className="an-detail-content"
          dangerouslySetInnerHTML={{ __html: post.announce || post.content }}
        ></div>

        {/* 버튼들 한 줄로 정렬 */}
        <div className="an-detail-buttons">
          {isAdmin && (
            <>
              <button
                className="an-detail-btn-edit"
                onClick={() =>
                  navigate(`/announce/edit/${id}`, {
                    state: {
                      id: id,
                      title: post.announceTitle,
                      content: post.announce,
                    },
                  })
                }
              >
                수정
              </button>

              <button className="an-detail-btn-delete" onClick={handleDelete}>
                삭제
              </button>
            </>
          )}
          <button
            className="an-detail-btn-back"
            onClick={() => navigate("/announce")}
          >
            목록으로
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnounceDetail;
