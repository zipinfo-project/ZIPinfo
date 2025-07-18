import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "../../../css/admin/HelpMessage/Reply.css";
import { axiosAPI } from "./../../../api/axiosApi";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import { MemberContext } from "../../member/MemberContext";

const Reply = () => {
  const { messageNo } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const originalSenderNo = queryParams.get("senderNo"); // 문의 보낸 사람
  const viewOnly = queryParams.get("viewOnly") === "true";

  const { member } = useContext(MemberContext);

  const [inquiry, setInquiry] = useState(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(
      "useEffect 실행 - messageNo:",
      messageNo,
      "originalSenderNo:",
      originalSenderNo
    );

    if (!messageNo) {
      toast.error("잘못된 접근입니다.");
      navigate("/admin/helpMessage");
      return;
    }

    setLoading(true);
    axiosAPI
      .get(`/api/help/reply?messageNo=${messageNo}`)
      .then((res) => {
        console.log("문의 상세 데이터:", res.data);
        setInquiry(res.data);
        setReply(res.data.replyContent || "");
      })
      .catch(() => {
        toast.error("문의 정보를 불러오는 중 오류가 발생했습니다.");
        navigate("/admin/helpMessage");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [messageNo, originalSenderNo, navigate]);

  const handleSubmit = async () => {
    console.log(
      "답변 제출 시도 - messageNo:",
      messageNo,
      "originalSenderNo:",
      originalSenderNo,
      "reply:",
      reply
    );

    if (reply.length > 400) {
      toast.error("답변은 400자 이내로 작성해주세요.");
      return; // 제한 초과 시 제출 중단
    }

    if (!reply.trim()) {
      toast.error("답변 내용을 입력하세요.");
      return;
    }

    if (!member?.memberNo) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    try {
      console.log("답변 등록 요청 데이터:", {
        messageNo: parseInt(messageNo, 10),
        replyContent: reply,
        receiverNo: member.memberNo, // 로그인한 관리자 번호
      });

      await axiosAPI.post("/api/help/reply", {
        messageNo: parseInt(messageNo, 10),
        replyContent: reply,
        receiverNo: member.memberNo, // 로그인한 관리자 번호
      });

      // 답변 등록 후 현재 날짜를 inquiry에 추가
      const currentDate = new Date().toISOString();
      setInquiry((prev) => ({
        ...prev,
        replyDate: currentDate,
      }));

      toast.success("답변이 등록되었습니다.");
      // navigate("/admin/helpMessage"); // 페이지 이동 제거하여 답변일 확인 가능
    } catch (err) {
      console.error("답변 등록 오류:", err);
      toast.error("답변 등록 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return <div className="form-container">로딩 중...</div>;
  }

  if (!inquiry) {
    return <div className="form-container">문의 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="form-container">
      <h2 className="form-title">문의 상세</h2>

      <div className="form-box">
        <div className="form-label-col">제목</div>
        <div className="form-content-col">
          <input
            type="text"
            value={inquiry.messageTitle}
            readOnly
            className="form-input"
          />
        </div>
      </div>

      <div className="form-box">
        <div className="form-label-col">첨부 파일</div>
        <div className="form-content-col">
          {inquiry.fileOriginName ? (
            <a
              href={inquiry.fileUrl}
              download={inquiry.fileOriginName}
              className="download-link"
            >
              {inquiry.fileOriginName}
            </a>
          ) : (
            <span>첨부 파일이 없습니다.</span>
          )}
        </div>
      </div>

      <div className="form-box">
        <div className="form-label-col">문의내용</div>
        <div className="form-content-col">
          <div
            className="form-textarea-view"
            dangerouslySetInnerHTML={{ __html: inquiry.messageContent }}
          />
        </div>
      </div>

      <div className="form-box">
        <div className="form-label-col">답변</div>
        <div className="form-content-col">
          {viewOnly ? (
            <div style={{ whiteSpace: "pre-wrap" }}>
              {reply || "등록된 답변이 없습니다."}
            </div>
          ) : (
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="form-textarea"
              placeholder="답변을 입력하세요"
              maxLength={2000} // 2000자
              rows={8}
            />
          )}
        </div>
      </div>

      {!viewOnly && (
        <div className="form-actions">
          <button className="submit-btn" onClick={handleSubmit}>
            답변하기
          </button>
        </div>
      )}
    </div>
  );
};

export default Reply;
