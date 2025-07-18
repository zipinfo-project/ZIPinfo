import { useEffect, useRef, useState } from "react";
import "../../css/myPage/myMessage.css";
import StockMenu from "./StockMenu";
import MessageMenu from "./MessageMenu";
import { useNavigate } from "react-router-dom";
import { axiosAPI } from "../../api/axiosApi";
import { Plus } from "lucide-react";
// import axios from 'axios';
import { toast } from "react-toastify";

export default function MyStock() {
  const [message, setMessage] = useState({
    messageTitle: "",
    messageContent: "",
  });

  const nav = useNavigate();

  const [messageFile, setMessageFile] = useState(null);

  const messageRef = useRef(null);

  const maxFileSize = 10 * 1024 * 1024;

  const handleBenefitClick = () => messageRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setMessageFile(null); // 사용자가 취소한 경우 상태를 null로 복원
      return;
    }

    if (file.size > maxFileSize) {
      toast.error(
        <div>
          <div className="toast-error-title">오류 알림!</div>
          <div className="toast-error-body">
            파일 크기는 10MB 이하만 업로드 할 수 있습니다.
          </div>
        </div>
      );
      setMessageFile(null);
      e.target.value = null; // input 초기화 (같은 파일 다시 선택 가능하게)
      return;
    }
    setMessageFile(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMessage((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    if (message.messageTitle.trim().length === 0) {
      toast.error(
        <div>
          <div className="toast-error-title">오류 알림!</div>
          <div className="toast-error-body">문의 제목을 입력하세요.</div>
        </div>
      );
      return;
    }

    if (message.messageContent.trim().length === 0) {
      toast.error(
        <div>
          <div className="toast-error-title">오류 알림!</div>
          <div className="toast-error-body">문의 내용을 입력하세요.</div>
        </div>
      );
      return;
    }

    const messageData = new FormData();
    messageData.append("messageFile", messageFile);
    messageData.append("messageTitle", message.messageTitle);
    messageData.append("messageContent", message.messageContent);
    const response = await axiosAPI.post(
      "http://localhost:8080/myPage/sendMessage",
      messageData,
      {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    if (response.status === 200) {
      nav("/myPage/seeMyMessage");
    } else {
      toast.error(
        <div>
          <div className="toast-error-title">오류 알림!</div>
          <div className="toast-error-body">문의 전송이 실패하였습니다.</div>
        </div>
      );
    }
  };

  return (
    <div className="my-page-my-stock">
      <div className="my-page-my-stock-container">
        <StockMenu />
        <MessageMenu />

        <div className="my-message-contact-container">
          <div className="my-message-contact-title">
            <span className="my-message-span">
              집인포에 궁금하신 점을 문의해주세요.
            </span>
          </div>
          <div className="my-message-title">
            <span className="my-message-span">문의내용과 답변은 </span>
            <span className="my-message-span-blue">'문의내역'</span>
            <span className="my-message-span">에서 확인하실 수 있습니다.</span>
          </div>

          <div className="my-message-contact-form">
            <div className="my-message-form-section">
              <div className="my-message-form-label">제목</div>
              <input
                name="messageTitle"
                value={message.messageTitle}
                onChange={handleChange}
                placeholder="제목을 입력하세요"
                className="my-message-form-input"
                maxLength={30}
              />
            </div>

            <div className="my-message-content">
              <div className="my-message-content-label">내용</div>
              <div className="my-message-textarea-container">
                <textarea
                  name="messageContent"
                  maxLength={1500}
                  value={message.messageContent}
                  onChange={handleChange}
                  placeholder="내용을 입력하세요"
                  className="my-message-form-textarea"
                />
              </div>
            </div>
            <div>
              <div className="my-message-file">
                <div className="my-message-file-label">첨부파일</div>
                <div className="my-message-file-help">
                  <button
                    className="my-page-stock-image-add-btn"
                    onClick={handleBenefitClick}
                  >
                    {messageFile === null ? (
                      <>
                        <Plus size={16} className="plus-icon" />
                        <span>파일추가</span>
                      </>
                    ) : (
                      <span>{messageFile?.name}</span>
                    )}
                  </button>
                  <input
                    type="file"
                    accept="
                      image/*,
                      .pdf,
                      .doc, .docx,
                      .hwp,
                      .txt, .csv,
                      .zip, .rar, .7z,
                      .xls, .xlsx
                    "
                    multiple
                    ref={messageRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                  <div>지원 확장자: jpg, gif, png, zip, doc, hwp(최대10M)</div>
                  <div>
                    악성코드나 개인정보가 포함된 파일은 업로드하지 마세요.
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button
            type="submit"
            onClick={handleSubmit}
            className="my-message-submit-button"
          >
            문의하기
          </button>
        </div>
      </div>
    </div>
  );
}
