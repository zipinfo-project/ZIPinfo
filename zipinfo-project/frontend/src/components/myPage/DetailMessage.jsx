import { useEffect, useRef, useState } from "react";
import "../../css/myPage/myMessage.css";
import StockMenu from "./StockMenu";
import MessageMenu from "./MessageMenu";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { axiosAPI } from "../../api/axiosApi";
import { Plus } from "lucide-react";

export default function MyStock() {
  const { messageNo } = useParams(); // 경로 파라미터
  const location = useLocation();

  const nav = useNavigate();

  const [message, setMessage] = useState("");
  const [messageFile, setMessageFile] = useState(null);

  const getMessageContent = async () => {
    try {
      const response = await axiosAPI.post("/myPage/getMessageContent", {
        messageNo,
      });
      setMessage(response.data);
    } catch (err) {
      console.error("문의 불러오기 실패:", err);
    }
  };

  const getMessageFile = async () => {
    try {
      const response = await axiosAPI.post("/myPage/getMessageFile", {
        messageNo,
      });
      setMessageFile(response.data);
    } catch (err) {
      console.error("문의답변 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    getMessageContent();
    getMessageFile();
  }, []);

  return (
    <div className="my-page-my-stock">
      <div className="my-page-my-stock-container">
        <StockMenu />
        <MessageMenu />

        <div className="my-message-contact-container">
          <div className="my-message-contact-title">
            <span className="my-message-span">
              zipInfo에 궁금하신 점을 문의해주세요.
            </span>
          </div>
          <div className="my-message-title">
            <span className="my-message-span">문의내용과 답변은</span>
            <span className="my-message-span-blue">'문의내역'</span>
            <span className="my-message-span">에서 확인하실 수 있습니다.</span>
          </div>

          <div className="my-detail-message-contact-form">
            <div className="my-detail-message-form-section">
              <div className="my-detail-message-inquire">문의</div>
              <div className="my-detail-message-title">
                {message.messageTitle}
              </div>
            </div>

            <div className="my-detail-message-content">
              <div className="my-detail-message-content-area">
                <div className="my-detail-message-form-textarea">
                  {message.messageContent}
                </div>

                <button className="my-page-stock-image-add-btn">
                  {messageFile && messageFile.fileOriginName ? (
                    <>
                      <span className="detail-file-tag">첨부파일 :</span>
                      <a
                        href={messageFile.fileUrl}
                        download={messageFile.fileOriginName}
                      >
                        {messageFile.fileOriginName}
                      </a>
                    </>
                  ) : null}
                </button>
              </div>
            </div>
          </div>
          <div>
            {message.replyContent && (
              <div className="my-detail-message-contact-form">
                <div className="my-detail-message-form-section">
                  <div className="my-detail-message-inquired">답변</div>
                  <div className="my-detail-message-title">
                    {message.messageTitle}
                  </div>
                </div>

                <div className="my-detail-message-content">
                  <div className="my-detail-message-content-area">
                    <div className="my-detail-message-form-textarea">
                      {message.replyContent}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => nav("/myPage/seeMyMessage")}
          className="my-message-submit-button"
        >
          목록으로
        </button>
      </div>
    </div>
  );
}
