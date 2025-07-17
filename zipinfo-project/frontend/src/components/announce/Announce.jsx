import React, { useEffect, useState, useContext, useMemo } from "react";
import { fetchPosts } from "../../api/AnnounceApi";
import { useNavigate } from "react-router-dom";
import { MemberContext } from "../member/MemberContext";
import "../../css/Announce/Announce.css";
import { toast } from "react-toastify";
import search from "../../assets/search-icon.svg";

const Announce = () => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 (0부터 시작)
  const [totalPages, setTotalPages] = useState(1); // 총 페이지 수
  // 슈밤
  // 검색 입력과 실제 검색 키워드 분리
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");

  const navigate = useNavigate();
  const { member: user } = useContext(MemberContext);
  // 관리자 여부 판단: memberAuth가 0이면 관리자
  const isAdmin = useMemo(() => {
    if (!user) return false;
    const memberAuth = user.memberAuth ?? user.member_auth;
    return Number(memberAuth) === 0;
  }, [user]);

  // 공지사항 목록 불러오기 함수 (페이지 번호를 0부터 받음)
  const loadPosts = async (page = 0, searchKeyword = keyword) => {
    try {
      const data = await fetchPosts(page, 10, searchKeyword);

      setPosts(data.posts || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error("공지사항 불러오기 실패", error);
      setPosts([]);
      setCurrentPage(0);
      setTotalPages(1);
    }
  };

  // 컴포넌트 마운트 시 0페이지(첫 페이지) 불러오기
  useEffect(() => {
    loadPosts(0);
  }, []);

  // 검색 버튼 클릭 시 호출, 0페이지부터 다시 조회 및 keyword 상태 업데이트
  const handleSearch = () => {
    setKeyword(searchInput);
    loadPosts(0, searchInput);
  };

  // 검색 입력값 변경 시
  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  // 페이지 번호 버튼 렌더링 함수
  const renderPagination = () => {
    const pageButtons = [];
    for (let i = 0; i < totalPages; i++) {
      pageButtons.push(
        <button
          key={i}
          className={`an-page-btn ${i === currentPage ? "an-page-active" : ""}`}
          onClick={() => loadPosts(i, keyword)}
        >
          {(i + 1).toString().padStart(2, "0")}
        </button>
      );
    }
    return pageButtons;
  };

  // 글쓰기 버튼 클릭 시 관리자 여부 확인 후 이동
  const handleWriteClick = () => {
    if (!isAdmin) {
      toast.error(
        <div>
          <div className="toast-error-title">오류 알림!</div>
          <div className="toast-error-body">
            관리자만 공지사항을 작성할 수 있습니다.
          </div>
        </div>
      );
      return;
    }
    navigate("/announce/write");
  };

  return (
    <div className="an-container">
      <div className="an-board-wrapper">
        <h1 className="an-title">공지사항</h1>

        {/* 게시판 테이블 헤더 및 본문 */}
        <div className="an-board-table">
          <div className="an-header">
            <div className="an-header-cell an-header-number">번호</div>
            <div className="an-header-cell an-header-title">제목</div>
            <div className="an-header-cell an-header-author">작성자</div>
            <div className="an-header-cell an-header-date">날짜</div>
            <div className="an-header-cell an-header-views">조회</div>
          </div>

          <div className="an-body">
            {posts.length > 0 ? (
              posts.map((post) => {
                const id = post.announceNo ?? post.boardNo;

                return (
                  <div key={id} className="an-row">
                    <div className="an-cell an-cell-number">{id}</div>
                    <div
                      className="an-cell an-cell-title"
                      onClick={() => navigate(`/announce/detail/${id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      {post.announceTitle ?? "제목 없음"}
                    </div>
                    <div className="an-cell an-cell-author">
                      {post.memberNickname ?? "관리자"}
                    </div>
                    <div className="an-cell an-cell-date">
                      {post.announceWriteDate.substring(0, 10)}
                    </div>
                    <div className="an-cell an-cell-views">
                      {post.announceReadCount ?? 0}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="an-row">
                <div
                  className="an-cell"
                  style={{ gridColumn: "1 / -1", textAlign: "center" }}
                >
                  게시글이 없습니다.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 페이지네이션 및 글쓰기 버튼 */}
        <div className="an-pagination-container">
          <div className="an-pagination">
            <button
              className="an-page-btn"
              onClick={() => loadPosts(Math.max(0, currentPage - 1), keyword)}
              disabled={currentPage === 0}
            >
              ‹
            </button>

            {renderPagination()}

            <button
              className="an-page-btn"
              onClick={() =>
                loadPosts(Math.min(totalPages - 1, currentPage + 1), keyword)
              }
              disabled={currentPage === totalPages - 1}
            >
              ›
            </button>
          </div>

          {isAdmin && (
            <button className="an-write-btn" onClick={handleWriteClick}>
              글쓰기
            </button>
          )}
        </div>

        {/* 검색창 */}
        <div className="an-search-container">
          <div className="an-search-input-wrap">
            <span className="an-search-icon">
              <img src={search} alt="검색 아이콘" />
            </span>
            <input
              type="text"
              className="an-search-input"
              placeholder="검색어를 입력하세요"
              value={searchInput}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <button className="an-search-btn" onClick={handleSearch}>
            검색
          </button>
        </div>
      </div>
    </div>
  );
};

export default Announce;
