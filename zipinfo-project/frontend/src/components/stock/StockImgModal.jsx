import { useState } from "react";
import Modal from "react-modal";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import "../../css/stock/StockImgModal.css";

function StockImgModal({ item }) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  const length = item.imgUrls.length;

  const next = () => {
    if (idx === length - 1) {
      return;
    }
    setIdx((idx + 1) % item.imgUrls.length);
  };
  const prev = () => {
    if (idx === 2) {
      return;
    }
    setIdx((idx - 1 + item.imgUrls.length) % item.imgUrls.length);
  };

  const go = (i) => {
    setIdx(i + 2);
  };

  /* ───────── 스타일 객체 (원하면 className으로 대체 가능) ───────── */
  const modalStyles = {
    overlay: { backgroundColor: "rgba(0,0,0,.70)", zIndex: 1050 },
    content: {
      inset: "50% auto auto 50%",
      transform: "translate(-50%,-45%)",
      border: "none",
      background: "transparent",
      padding: 0,
      overflow: "visible",
    },
  };

  return (
    <>
      {/* ── 썸네일 목록 ─────────────────────────────────────────── */}
      <div className="stock-detail-panel">
        <div className="stock-detail-images">
          {item?.imgUrls && (
            <>
              <img
                src={`http://localhost:8080${item.imgUrls[0]}`} //?v=${Date.now()}   --> 현재 시간을 이용해 URL을 고유하게 만들어 브라우저 캐시를 우회
                alt="상세1"
                className="stock-detail-mainimg"
                onClick={() => {
                  setIdx(2);
                  setOpen(true);
                }}
              />
              <img
                src={
                  item?.imgUrls ? `http://localhost:8080${item.imgUrls[2]}` : ""
                }
                className="stock-detail-mainimg"
                onClick={() => {
                  setIdx(2);
                  setOpen(true);
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* ── 모달 ──────────────────────────────────────────────── */}
      <Modal
        isOpen={open}
        onRequestClose={() => setOpen(false)}
        style={modalStyles}
        contentLabel="매물 이미지"
        closeTimeoutMS={200}
      >
        <div className="modal-img-span">
          <span>{idx - 1}/</span>
          <span>{length - 2}</span>
        </div>
        <div>
          <button className="modal-nav left" onClick={prev}>
            <ChevronLeft size={40} />
          </button>
          <div className="slide-box">
            {/* 트랙을 왼쪽으로 이동 → translateX 에 transition 적용한다 */}
            <div
              className="slide-track"
              style={{ transform: `translateX(-${idx * 100}%)` }}
            >
              {item.imgUrls.map((u, i) => (
                <img
                  key={i}
                  className="slide-img"
                  src={`http://localhost:8080${u}`}
                  alt={`매물 이미지 ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <button className="modal-nav right" onClick={next}>
            <ChevronRight size={40} />
          </button>
        </div>

        <div className="modal-img-list">
          {item.imgUrls.slice(2).map((u, i) => (
            <div className="modal-img">
              <img
                key={i}
                className="slide-img-mini"
                src={`http://localhost:8080${u}`}
                alt={`매물 이미지 ${i + 1}`}
                onClick={() => go(i)}
              />
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}

export default StockImgModal;
