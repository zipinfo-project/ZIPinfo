import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../../css/admin/HelpMessage/HelpMessage.module.css";
import { MemberContext } from "./../../member/MemberContext";
import { axiosAPI } from "../../../api/axiosApi";
import { RefreshCw } from "lucide-react";

const HelpMessage = () => {
  const [activeTab, setActiveTab] = useState("received");
  const [currentPage, setCurrentPage] = useState(1);
  const [helpMessages, setHelpMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const navigate = useNavigate();

  const { member } = useContext(MemberContext);

  const fetchHelpMessages = async (showRefreshSpinner = false) => {
    try {
      if (showRefreshSpinner) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const currentUserId = member?.memberNo || 26;

      const url =
        activeTab === "received" ? "/api/help/unanswered" : "/api/help/replied";

      const params = { adminId: currentUserId };

      const response = await axiosAPI.get(url, { params });
      setHelpMessages(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "데이터를 불러오는데 실패했습니다."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!member?.memberNo) return; // memberNo가 없으면 API 호출하지 않음
    setCurrentPage(1);
    fetchHelpMessages();
    // eslint-disable-next-line
  }, [activeTab, member]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(helpMessages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentHelpMessages = helpMessages.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getStatusBadge = (replyYn) => {
    const baseClass = styles.statusBadge;
    return replyYn === "Y"
      ? `${baseClass} ${styles.statusComplete}`
      : `${baseClass} ${styles.statusWaiting}`;
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 10;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={
            i === currentPage ? styles.activePageButton : styles.pageButton
          }
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  const handleHelpMessageClick = (msg) => {
    // 읽음 처리 요청은 제거됨

    if (activeTab === "sent") {
      const targetNo =
        msg.inquiredNo && msg.inquiredNo !== 0 ? msg.inquiredNo : msg.messageNo;
      navigate(
        `/admin/help/reply/${targetNo}?senderNo=${msg.receiverNo}&viewOnly=true`
      );
    } else {
      navigate(`/admin/help/reply/${msg.messageNo}?senderNo=${msg.senderNo}`);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <span className={styles.loadingText}>문의 내용을 불러오는 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}></h1>
        <button
          className={styles.refreshButton}
          onClick={() => fetchHelpMessages(true)}
          disabled={refreshing}
          aria-label="새로고침"
        >
          <RefreshCw
            size={18}
            className={refreshing ? styles.refreshingIcon : undefined}
            style={refreshing ? { animation: "spin 1s linear infinite" } : {}}
          />
        </button>
      </div>

      {error && (
        <div className={styles.errorContainer}>
          <div className={styles.errorText}>{error}</div>
        </div>
      )}

      <div className={styles.tabContainer}>
        <button
          className={`${styles.tab} ${
            activeTab === "received" ? styles.activeTab : styles.inactiveTab
          }`}
          onClick={() => setActiveTab("received")}
        >
          받은 문의
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "sent" ? styles.activeTab : styles.inactiveTab
          }`}
          onClick={() => setActiveTab("sent")}
        >
          문의 답변
        </button>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <div>번호</div>
          <div>제목</div>
          <div>작성자</div>
          <div>날짜</div>
          <div>답변</div>
        </div>

        {currentHelpMessages.length === 0 ? (
          <div className={styles.emptyState}>
            {activeTab === "received"
              ? "받은 문의가 없습니다."
              : "답변한 문의가 없습니다."}
          </div>
        ) : (
          currentHelpMessages.map((msg) => (
            <div
              key={msg.messageNo}
              className={styles.tableRow}
              onClick={() => handleHelpMessageClick(msg)}
              style={{ cursor: "pointer" }}
            >
              <div>{msg.messageNo}</div>
              <div>{msg.messageTitle}</div>
              <div style={{ textAlign: "right", paddingRight: "10px" }}>
                {msg.memberNickname || msg.senderNo}
              </div>
              <div>
                {msg.replyYn === "Y" && msg.replyDate
                  ? new Date(msg.replyDate).toLocaleDateString("ko-KR")
                  : new Date(msg.messageWriteDate).toLocaleDateString("ko-KR")}
              </div>
              <div>
                <span className={getStatusBadge(msg.replyYn)}>
                  {msg.replyYn === "Y" ? "답변 완료" : "답변 예정"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.navButton}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            {"<"}
          </button>
          {renderPageNumbers()}
          <button
            className={styles.navButton}
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
          >
            {">"}
          </button>
        </div>
      )}
    </div>
  );
};

export default HelpMessage;
