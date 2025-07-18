import React, { useEffect, useState } from "react";
import "../../css/myPage/seeMyMessage.css";
import "../../css/myPage/menu.css";
import StockMenu from "./StockMenu";
import MessageMenu from "./MessageMenu";
import { useLocation, useNavigate } from "react-router-dom";
import { axiosAPI } from "../../api/axiosApi";
import { Check, X } from "lucide-react";

const MyPost = () => {
  const nav = useNavigate();

  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    try {
      const response = await axiosAPI.get("/myPage/getMyMessage");
      setPosts(response.data);
    } catch (err) {
      console.error("문의내역 불러오기 실패:", err);
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
    nav(`/myPage/myPost?cp=${page}`); // URL 업데이트
  };

  const handleDate = (date) => {
    return date.substring(0, 10);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPosts = posts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(posts.length / itemsPerPage);

  const pageGroupSize = 10;
  const currentGroup = Math.floor((currentPage - 1) / pageGroupSize);
  const startPage = currentGroup * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  const handleBoardClick = (e) => {
    nav(`/myPage/detailMessage/${e.messageNo}?cp=${currentPage}`);
  };

  return (
    <div className="my-page">
      <div className="my-page-container">
        <StockMenu />
        <MessageMenu />

        <div className="my-message-container">
          {/* 게시판 헤더 */}
          <div className="my-message-table">
            <div className="my-message-header">
              <div className="my-message-header-cell my-message-header-number">
                번호
              </div>
              <div className="my-message-header-cell my-message-header-title">
                제목
              </div>

              <div className="my-message-header-cell my-message-header-date">
                날짜
              </div>
            </div>

            {currentPosts.length !== 0 ? (
              currentPosts.map((item, index) => {
                const displayNumber = posts.length - (indexOfFirstItem + index);
                return (
                  <div key={index} className="my-message-row">
                    <div className="my-message-cell my-message-cell-number">
                      {displayNumber}
                    </div>
                    <div
                      className="my-message-cell my-message-cell-title"
                      onClick={() => handleBoardClick(item)} // 클릭 이벤트로 상세화면으로 이동하게
                      style={{ cursor: "pointer" }}
                    >
                      {item.replyYn !== "Y" ? (
                        <>
                          <span className="reply-n-status">답변대기 </span>
                          {item.messageTitle}
                        </>
                      ) : (
                        <>
                          <span className="reply-y-status">답변완료 </span>
                          {item.messageTitle}
                        </>
                      )}
                    </div>
                    <div className="my-message-cell my-message-cell-date">
                      {handleDate(item.messageWriteDate)}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-my-post">작성한 문의글이 없습니다.</div>
            )}
          </div>
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
