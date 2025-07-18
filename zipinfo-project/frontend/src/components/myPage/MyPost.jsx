import React, { useEffect, useState } from "react";
import "../../css/myPage/myPost.css";
import "../../css/myPage/menu.css";
import Menu from "./Menu";
import { useLocation, useNavigate } from "react-router-dom";
import { axiosAPI } from "../../api/axiosApi";

const MyPost = () => {
  const nav = useNavigate();

  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    try {
      const response = await axiosAPI.get("/myPage/getMyPost");
      setPosts(response.data);
    } catch (err) {
      console.error("매물 불러오기 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialPage = parseInt(queryParams.get("cp")) || 1;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPosts = posts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(posts.length / itemsPerPage);

  const pageGroupSize = 10;
  const currentGroup = Math.floor((currentPage - 1) / pageGroupSize);
  const startPage = currentGroup * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    nav(`/myPage/myPost?cp=${page}`); // URL 업데이트
  };

  const handleBoardClick = (item) => {
    nav(`/neighborhoodBoard/detail/${item.boardNo}?cp=${currentPage}`);
  };

  return (
    <div className="my-page">
      <div className="my-page-container">
        <Menu />

        {/* 게시판 헤더 */}
        <div>
          <table className="nb-board-table">
            <thead>
              <tr className="nb-header">
                <th className="nb-header-subject">분류</th>
                <th className="nb-header-title">제목</th>
                <th className="nb-header-area">지역</th>
                <th className="nb-header-author">작성자</th>
                <th className="nb-header-likes">좋아요</th>
                <th className="nb-header-date">날짜</th>
                <th className="nb-header-views">조회</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{ textAlign: "center", padding: "12px" }}
                  >
                    게시글이 없습니다.
                  </td>
                </tr>
              ) : (
                currentPosts.map((item, index) => (
                  <tr key={index} className="nb-row">
                    <td className="nb-cell-subject">
                      {item.boardSubject === "Q"
                        ? "질문답변"
                        : item.boardSubject === "R"
                        ? "리뷰"
                        : "자유"}
                    </td>
                    <td
                      className="nb-cell-title"
                      onClick={() => handleBoardClick(item)}
                      style={{ cursor: "pointer" }}
                    >
                      {item.boardTitle}
                    </td>
                    <td className="nb-cell-area">
                      {item.cityName} {">"} {item.townName}
                    </td>
                    <td className="nb-cell-author">{item.memberNickName}</td>
                    <td className="nb-cell-likes">{item.likeCount}</td>
                    <td className="nb-cell-date">{item.boardWriteDate}</td>
                    <td className="nb-cell-views">{item.readCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="my-stock-pagination">
            <button
              className="my-stock-page-prev"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              ‹‹
            </button>

            {/* 이전 그룹으로 이동 또는 1페이지로 */}
            <button
              className="my-stock-page-prev"
              onClick={() => {
                if (startPage === 1) {
                  handlePageChange(1);
                } else {
                  handlePageChange(startPage - 1);
                }
              }}
              disabled={currentPage === 1}
            >
              ‹
            </button>

            {/* 현재 그룹 페이지들 */}
            {Array.from({ length: endPage - startPage + 1 }, (_, index) => {
              const page = startPage + index;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={currentPage === page ? "active-page" : ""}
                >
                  {page}
                </button>
              );
            })}

            {/* 다음 그룹으로 이동 또는 마지막 페이지로 */}
            <button
              className="my-stock-page-next"
              onClick={() => {
                if (endPage >= totalPages) {
                  handlePageChange(totalPages);
                } else {
                  handlePageChange(endPage + 1);
                }
              }}
              disabled={currentPage === totalPages}
            >
              ›
            </button>

            {/* 맨 마지막 페이지로 */}
            <button
              className="my-stock-page-next"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              ››
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPost;
