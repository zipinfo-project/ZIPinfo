import { useEffect, useState } from "react";
import "../../css/myPage/myStock.css";
import StockMenu from "./StockMenu";
import MiniMenu from "./MiniMenu";
import { axiosAPI } from "../../api/axiosAPI";
import { useNavigate } from "react-router-dom";

export default function MyStock() {
  const [properties, setProperties] = useState([]);
  // 슈밤!!!!!
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);

  const [sellYn, setSellYn] = useState(new Set());

  const fetchProperties = async () => {
    try {
      const response = await axiosAPI.get("/myPage/getSawStock");
      setProperties(response.data);
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
          ) : properties.length !== 0 ? (
            <div className="property-grid">
              {properties.map((property) => {
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
                      <div>
                        <div
                          className={`stock-sell-yn ${
                            sellYn.has(property.stockNo) ? "sold" : ""
                          }`}
                        >
                          {sellYn.has(property.stockNo)
                            ? sellYnLabel["Y"]
                            : sellYnLabel["N"]}
                        </div>
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
                            {property.currentFloor}/{property.floorTotalCount}층
                            | {property.supplyArea}㎡ | 관리비{" "}
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
          ) : (
            <div className="no-like-stock">
              <h1>최근 본 매물이 없습니다.</h1>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
