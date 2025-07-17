import { useEffect, useState } from "react";
import "../../css/myPage/myStock.css";
import StockMenu from "./StockMenu";
import MiniMenu from "./MiniMenu";
import { axiosAPI } from "../../api/axiosApi";
import { useLocation, useNavigate } from "react-router-dom";
import { Bookmark } from "lucide-react";

export default function MyStock() {
  const [properties, setProperties] = useState([]);
  // 씨발
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);

  const [likeStock, setLikeStock] = useState(new Set());

  const [sellYn, setSellYn] = useState(new Set());

  const fetchProperties = async () => {
    try {
      const response = await axiosAPI.get("/myPage/getLikeStock");
      setProperties(response.data);
      setLikeStock(new Set(response.data.map((item) => item.stockNo)));
      const sellYnSet = new Set(
        response.data
          .filter((item) => item.sellYn === "Y")
          .map((item) => item.stockNo)
      );
      setSellYn(sellYnSet);
    } catch (err) {
      console.error("매물 불러오기 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  function formatToKoreanCurrency(number) {
    if (!number || isNaN(number)) return "";

    const num = Number(number);
    const 억 = Math.floor(num / 100000000);
    const 만 = Math.floor((num % 100000000) / 10000);

    let result = "";
    if (억 > 0) result += `${억}억`;
    if (만 > 0) result += `${result ? " " : ""}${manWithComma(만)}`;

    return result || "0";
  }

  function monthPay(number) {
    if (!number || isNaN(number)) return "";

    const num = Number(number);
    const 억 = Math.floor(num / 100000000);
    const 만 = Math.floor((num % 100000000) / 10000);

    let result = "";
    if (억 > 0) result += `${억}억`;
    if (만 > 0) result += `${result ? " " : ""}${manWithComma(만)}만`;

    return result || "0";
  }

  function manWithComma(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  const getTypeClassName = (type) => {
    switch (type) {
      case "0":
        return "property-type-sale";
      case "1":
        return "property-type-jeonse";
      case "2":
        return "property-type-monthly";
      default:
        return "property-type-default";
    }
  };

  const sellYnLabel = {
    N: "계약가능",
    Y: "계약완료",
  };

  const stockTypeLabel = {
    0: "매매",
    1: "전세",
    2: "월세",
  };

  const stockFormLabel = {
    1: "아파트",
    2: "빌라",
    3: "오피스텔",
  };

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialPage = parseInt(queryParams.get("cp")) || 1;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const itemsPerPage = 8;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    nav(`/myPage/likeStock?cp=${page}`); // URL 업데이트
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProperties = properties.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(properties.length / itemsPerPage);

  const pageGroupSize = 10;
  const currentGroup = Math.floor((currentPage - 1) / pageGroupSize);
  const startPage = currentGroup * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  const handleStockLike = async (stockNo) => {
    setLikeStock((prev) => {
      const updated = new Set(prev);
      if (updated.has(stockNo)) {
        updated.delete(stockNo); // 찜 해제
      } else {
        updated.add(stockNo); // 찜 추가
      }
      return updated;
    });
    try {
      if (likeStock.has(stockNo)) {
        const resp = await axiosAPI.post("/myPage/unlikeStock", { stockNo });
      } else {
        const resp = await axiosAPI.post("/myPage/likeStock", { stockNo });
      }
    } catch (err) {
      console.error("찜 상태 변경 실패:", err);
    }
  };

  return (
    <div className="my-page-my-stock">
      <div className="my-page-my-stock-container">
        <StockMenu />
        <MiniMenu />

        <div className="property-container">
          {loading ? (
            <div className="no-like-stock">
              <h1>로딩 중...</h1>
            </div>
          ) : properties.length === 0 ? (
            <div className="no-like-stock">
              <h1>찜한 매물이 없습니다.</h1>
            </div>
          ) : (
            <>
              <div className="property-grid">
                {currentProperties.map((property) => {
                  const roomInfo = property.stockAddress?.split("^^^")[2] || "";
                  return (
                    <div key={property.stockNo} className="property-card">
                      {/* 이미지 */}
                      <div
                        onClick={() => nav(`/stock/${property.stockNo}`)}
                        className="property-image-container"
                      >
                        <div className="property-image-item">
                          <img
                            src={`http://localhost:8080${property.imgList[0].imgUrl}`}
                            className="property-image"
                            alt="매물 이미지"
                            loading="eager"
                          />
                        </div>
                      </div>

                      {/* 본문 */}
                      <div
                        onClick={() => nav(`/stock/${property.stockNo}`)}
                        className="property-content"
                      >
                        <div className="like-stock-box">
                          <div
                            className={`stock-sell-yn ${
                              sellYn.has(property.stockNo) ? "sold" : ""
                            }`}
                          >
                            {sellYn.has(property.stockNo)
                              ? sellYnLabel["Y"]
                              : sellYnLabel["N"]}
                          </div>
                          <span
                            onClick={(e) => {
                              e.stopPropagation(); // nav 방지
                              handleStockLike(property.stockNo);
                            }}
                          >
                            <Bookmark
                              className={`like-stock-bookmark ${
                                likeStock.has(property.stockNo) ? "active" : ""
                              }`}
                            />
                          </span>
                        </div>
                        <div className="property-header">
                          <span className="property-category">
                            {stockFormLabel[property.stockForm]} ·{" "}
                            {property.stockName} {roomInfo}
                          </span>
                        </div>

                        <div className="property-price-container">
                          <span className="property-price">
                            {stockTypeLabel[property.stockType]}
                          </span>
                          <span className="property-prices">
                            {" "}
                            {formatToKoreanCurrency(property.stockSellPrice)}
                          </span>
                          {property.stockType === 2 && (
                            <span className="property-fee-month">
                              /{formatToKoreanCurrency(property.stockFeeMonth)}
                            </span>
                          )}
                        </div>

                        <div className="property-details">
                          <div className="property-details-row">
                            <span>
                              {property.currentFloor}/{property.floorTotalCount}
                              층 | {property.supplyArea}㎡ | 관리비{" "}
                              {property.stockManageFee !== 0
                                ? `${monthPay(property.stockManageFee)}원`
                                : "없음"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="my-stock-pagination">
                {/* 맨 처음 페이지로 */}
                <button
                  className="my-stock-page-prev"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                >
                  ‹‹
                </button>

                {/* 이전 그룹 이동 */}
                <button
                  className="my-stock-page-prev"
                  onClick={() => handlePageChange(Math.max(1, startPage - 1))}
                  disabled={startPage === 1}
                >
                  ‹
                </button>

                {/* 현재 그룹의 페이지들 */}
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

                {/* 다음 그룹 이동 */}
                <button
                  className="my-stock-page-next"
                  onClick={() => handlePageChange(endPage + 1)}
                  disabled={endPage >= totalPages}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
