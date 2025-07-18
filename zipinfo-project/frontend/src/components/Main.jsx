import "../css/Main.css";

import search from "../assets/search-icon.svg";
import apart from "../assets/apart-icon.svg";
import house from "../assets/house-villa-icon.svg";
import officetel from "../assets/officetel-icon.svg";
import sale from "../assets/sale-icon.svg";

import banner from "../assets/banner.svg";
import agent from "../assets/agent-icon.svg";
import deleteBtn from "../assets/delete-icon.svg";

import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { axiosAPI } from "../api/axiosApi";

import { formatPrice } from "../components/common/priceConvert";
import { convertToJSDate, getTimeAgo } from "../components/common/dateConvert";
import { X } from "lucide-react";

const Main = () => {
  const navigate = useNavigate();

  const [stockList, setStockList] = useState([]);
  const [saleList, setSaleList] = useState([]);
  const [mainAd, setMainAd] = useState(null);

  const [searchContent, setSearchContent] = useState("");

  const searchRef = useRef(null);

  const [isSearchActive, setIsSearchActive] = useState(false);

  const [searchRegion, setSearchRegion] = useState([]);
  const [searchStock, setSearchStock] = useState([]);
  const [searchSale, setSearchSale] = useState([]);

  const [recentSearch, setRecentSearch] = useState([]);

  const handleSearchActive = () => {
    setIsSearchActive(true);
  };

  const handleSearchResult = async (e) => {
    const value = e.target.value;
    setSearchContent(value);
    if (!value.trim()) {
      setSearchRegion("");
      setSearchStock("");
      setSearchSale("");
      return;
    }

    const lastChar = value[value.length - 1];
    const isKoreanComplete = lastChar && lastChar.match(/[가-힣]/);

    if (!isKoreanComplete) {
      // 완성된 글자가 아니라면 이전 검색결과 유지
      return;
    }

    const response = await axiosAPI.post("/myPage/searchResult", value);
    setSearchStock(response.data.stock);
    setSearchSale(response.data.sale);
  };

  const highlightMatch = (text, keyword) => {
    if (!keyword || !text.includes(keyword)) return text;

    const parts = text.split(new RegExp(`(${keyword})`, "gi"));
    return parts.map((part, idx) =>
      part.toLowerCase() === keyword.toLowerCase() ? (
        <span key={idx} className="search-highlight">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const handleClickStock = (stock) => {
    let history = JSON.parse(localStorage.getItem("recentSearch")) || [];

    // stockNo 기준으로 중복 제거
    history = history.filter((item) => {
      if (stock.stockNo) {
        // 일반 매물: stockNo 기준으로 비교
        return item.stockNo !== stock.stockNo;
      } else {
        // 분양 매물: saleNo 기준으로 비교
        return item.saleStockNo !== stock.saleStockNo;
      }
    });

    const isStock = !!stock.stockNo;
    const newItem = isStock
      ? {
          stockNo: stock.stockNo,
          stockName: stock.stockName,
          stockAddress: stock.stockAddress,
          stockForm: stock.stockForm,
        }
      : {
          saleStockNo: stock.saleStockNo,
          saleStockName: stock.saleStockName,
          saleAddress: stock.saleAddress,
          saleStatus: stock.saleStatus,
        };

    // 최신 항목을 맨 앞에 추가
    history.unshift(newItem);

    // 최대 10개까지만 저장
    if (history.length > 10) {
      history = history.slice(0, 10);
    }

    // 다시 저장
    localStorage.setItem("recentSearch", JSON.stringify(history));

    stock.stockNo
      ? navigate(`/stock/${stock.stockNo}`, {
          state: { lat: stock.lat, lng: stock.lng, shouldFocus: true },
        })
      : navigate(`/sale/${stock.saleStockNo}`, {
          state: { lat: stock.lat, lng: stock.lng, shouldFocus: true },
        });
  };

  const deleteRecentSearch = (e) => {
    let number = 0;
    e.stockNo ? (number = e.stockNo) : (number = e.saleNo);
    let history = JSON.parse(localStorage.getItem("recentSearch")) || [];

    history = history.filter((item) =>
      e.stockNo ? item.stockNo !== number : item.saleNo !== number
    );

    localStorage.setItem("recentSearch", JSON.stringify(history));

    setRecentSearch(history);
  };

  const deleteAllSearch = () => {
    let history = [];

    localStorage.setItem("recentSearch", JSON.stringify(history));

    setRecentSearch(history);
  };

  const returnAddress = (add) => {
    const str = add;
    const parts = str.split("^^^");
    const address = parts[1]; // "서울 중랑구 중랑역로 272-6"

    return address;
  };

  const returnForm = (form) => {
    const forms = {
      1: "아파트",
      2: "빌라",
      3: "오피스텔",
    };
    return forms[form] || "기타";
  };

  const returnSaleStatus = (status) => {
    const result = {
      1: "분양중",
      2: "분양예정",
      3: "분양완료",
    };
    return result[status] || "기타";
  };

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("recentSearch")) || [];
    setRecentSearch(history);

    const loadAd = async () => {
      const resp = await axiosAPI.get("/advertisement/getMainAd");
      setMainAd(resp.data);
    };

    const loadStock = async () => {
      const resp = await axiosAPI.post("/stock/itemOnMain", {});
      setStockList(resp.data);
    };

    const loadSale = async () => {
      const resp = await axiosAPI.get("/sale/selectSaleList");
      setSaleList(resp.data);
    };

    loadStock();
    loadSale();
    loadAd();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isSearchActive &&
        searchRef.current &&
        !searchRef.current.contains(e.target)
      ) {
        setIsSearchActive(false); // 외부 클릭 시 닫기
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchActive]);

  const StockSample = () => {
    return stockList.map((item, index) => (
      <div className="card" key={item.stockNo}>
        <img
          src={`http://localhost:8080${item.imgUrl}`}
          alt="실거래 집 썸네일 이미지"
          onClick={() => {
            navigate(`/stock/${item.stockNo}`, {
              state: { lat: item.lat, lng: item.lng, shouldFocus: true },
            });
          }}
        />
        <div
          className="card-title"
          onClick={() => {
            navigate(`/stock/${item.stockNo}`, {
              state: { lat: item.lat, lng: item.lng, shouldFocus: true },
            });
          }}
        >
          {item.stockForm === 1
            ? "아파트"
            : item.stockForm === 2
            ? "빌라"
            : item.stockForm === 3
            ? "오피스텔"
            : "기타"}{" "}
          · {item.stockName}
        </div>
        <div
          className="card-price"
          onClick={() => {
            navigate(`/stock/${item.stockNo}`, {
              state: { lat: item.lat, lng: item.lng, shouldFocus: true },
            });
          }}
        >
          {item.stockType === 0 ? (
            <>
              <span>매매 </span>
              {formatPrice(item.stockSellPrice)}
            </>
          ) : item.stockType === 1 ? (
            <>
              <span>전세 </span>
              {formatPrice(item.stockSellPrice)}
            </>
          ) : item.stockType === 2 ? (
            <>
              <span>월세 </span>
              {formatPrice(item.stockSellPrice)} / {item.stockFeeMonth}
            </>
          ) : (
            "기타"
          )}
        </div>
        <div className="card-desc">
          {item.currentFloor}/{item.floorTotalCount}층 <span>|</span>{" "}
          {item.exclusiveArea}㎡ <span>|</span> 관리비{" "}
          {item.stockManageFee !== 0
            ? `${item.stockManageFee / 10000}만원`
            : "없음"}
        </div>
        <div className="card-agent">
          <span>
            <img src={agent} alt="중개사 아이콘" />
          </span>
          {item.companyName}
        </div>
      </div>
    ));
  };

  const showSales = () => {
    const uniqueList = [
      ...new Map(saleList.map((item) => [item.saleStockNo, item])).values(),
    ];

    return uniqueList.slice(0, 4).map((item) => {
      const imgUrl = `http://localhost:8080${item.saleImgUrl}`;

      return (
        <div
          className="card-sale"
          key={item.saleStockNo}
          onClick={() =>
            navigate(`/sale/${item.saleStockNo}`, {
              state: { lat: item.lat, lng: item.lng, shouldFocus: true },
            })
          }
        >
          <img src={imgUrl} alt="분양 썸네일 이미지" />
          <div className="card-title">
            {item.saleStockForm === 1
              ? "아파트"
              : item.saleStockForm === 2
              ? "빌라"
              : item.saleStockForm === 3
              ? "오피스텔"
              : "기타"}{" "}
            · {item.saleStockName}
          </div>
          <div className="card-price">
            <span style={{ color: "blue" }}>분양가</span>{" "}
            <strong>{formatPrice(item.salePrice)}</strong>
          </div>
          <div className="card-adress">{item.saleAddress}</div>
          <div className="card-area">{item.saleSupplyArea}㎡</div>
        </div>
      );
    });
  };

  return (
    <main>
      <section className="main-visual">
        <div className="main-visual-bg"></div>
        <div className="main-visual-content">
          <h1>
            <span>ZIPinfo와 함께하는 내 집 마련의 여정</span>
          </h1>
          <p className="subtitle">
            당신의 삶이 머무를 공간을 위해 믿을 수 있는 정보로 함께
            찾아드립니다.
          </p>
          <div className="search-wrapper">
            <div
              ref={searchRef}
              className={!isSearchActive ? "search-bar" : "search-bar-active"}
            >
              <img
                src={search}
                alt="검색 아이콘"
                className="main-search-icon"
              />
              <input
                onFocus={() => setIsSearchActive(true)}
                onClick={() => handleSearchActive()}
                onChange={handleSearchResult}
                type="text"
                placeholder="검색어를 입력하세요"
                value={searchContent}
              />
              {isSearchActive && (
                <div className="expanded-search-overlay">
                  <div className="expanded-search-container">
                    {!searchContent?.trim() && recentSearch.length === 0 && (
                      <div className="no-search-result">
                        <div className="no-result-info">
                          아직 원하는 검색 결과가 없나요?
                        </div>
                        <div className="no-result-info">
                          검색어를 완성해주세요 :)
                        </div>
                        <div className="no-result-info">
                          해당하는 매물이 없을 수 있습니다.
                        </div>
                        <div className="search-bottom-block"></div>
                      </div>
                    )}
                    {searchContent?.trim() &&
                      searchStock.length === 0 &&
                      searchSale.length === 0 && (
                        <div className="no-search-result">
                          <div className="no-result-info">
                            아직 원하는 검색 결과가 없나요?
                          </div>
                          <div className="no-result-info">
                            검색어를 완성해주세요 :)
                          </div>
                          <div className="no-result-info">
                            해당하는 매물이 없을 수 있습니다.
                          </div>
                          <div className="search-bottom-block"></div>
                        </div>
                      )}
                    {recentSearch.length > 0 && !searchContent && (
                      <div className="search-column-1">
                        <div className="search-bar-title">
                          <div className="search-bar-result">최근 검색</div>
                          <button
                            type="button"
                            className="search-bar-title-button"
                            onClick={deleteAllSearch}
                          >
                            전체 삭제
                          </button>
                        </div>
                        <ul>
                          {recentSearch?.map((item, idx) => (
                            <li
                              key={idx}
                              onClick={() => handleClickStock(item)}
                            >
                              <div className="search-result-info-div">
                                <div className="stock-info-div">
                                  <div className="stock-name-div">
                                    {item.stockName
                                      ? item.stockName
                                      : item.saleStockName}
                                  </div>
                                  <div>
                                    {item.stockAddress
                                      ? returnAddress(item.stockAddress)
                                      : item.saleAddress}
                                  </div>
                                </div>
                                <div className="stock-form-ddiv">
                                  <div className="stock-form-div">
                                    {item.stockForm
                                      ? returnForm(item.stockForm)
                                      : returnSaleStatus(item.saleStatus)}
                                  </div>
                                  <div
                                    className="delete-recent-search"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteRecentSearch(item);
                                    }}
                                  >
                                    <img src={deleteBtn} alt="검색 삭제 버튼" />
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                        <div className="search-bottom-block"></div>
                      </div>
                    )}
                    {searchStock.length > 0 && (
                      <div className="search-column-1">
                        <div className="result-info">단지</div>
                        <div className="scrollable-ul-wrapper">
                          <ul>
                            {searchStock?.map((item, idx) => (
                              <li
                                key={idx}
                                onClick={() => handleClickStock(item)}
                              >
                                <div className="stock-info-div">
                                  <div className="stock-name-div">
                                    {highlightMatch(
                                      item.stockName,
                                      searchContent
                                    )}
                                  </div>
                                  <div>
                                    {highlightMatch(
                                      returnAddress(item.stockAddress),
                                      searchContent
                                    )}
                                  </div>
                                </div>
                                <div className="stock-form-ddiv">
                                  <div className="stock-form-div">
                                    {returnForm(item.stockForm)}
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="search-bottom-block"></div>
                      </div>
                    )}

                    {searchSale.length > 0 && (
                      <div
                        className={
                          searchRegion.length > 0 && searchStock.length > 0
                            ? "search-column"
                            : "search-column-1"
                        }
                      >
                        <div className="result-info">분양</div>
                        <ul>
                          {searchSale?.map((item, idx) => (
                            <li
                              key={idx}
                              onClick={() => handleClickStock(item)}
                            >
                              <div className="stock-info-div">
                                <div className="stock-name-div">
                                  {highlightMatch(
                                    item.saleStockName,
                                    searchContent
                                  )}
                                </div>
                                <div>
                                  {highlightMatch(
                                    item.saleAddress,
                                    searchContent
                                  )}
                                </div>
                              </div>
                              <div className="stock-form-ddiv">
                                <div className="stock-form-div">
                                  {returnSaleStatus(item.saleStatus)}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                        <div className="search-bottom-block"></div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="main-icons">
            <button
              className="apart-icons"
              onClick={() => {
                navigate("/stock?sido=11&type=1");
              }}
            >
              <img src={apart} alt="아파트 아이콘 이미지" />
            </button>
            <button
              className="house-icons"
              onClick={() => {
                navigate("/stock?sido=11&type=2");
              }}
            >
              <img src={house} alt="주택/빌라 아이콘 이미지" />
            </button>
            <button
              className="officetel-icons"
              onClick={() => {
                navigate("/stock?sido=11&type=3");
              }}
            >
              <img src={officetel} alt="오피스텔 아이콘 이미지" />
            </button>
            <button
              className="sale-icons"
              onClick={() => {
                navigate("/sale");
              }}
            >
              <img src={sale} alt="분양 아이콘 이미지" />
            </button>
          </div>
        </div>
      </section>

      {mainAd && mainAd.adImgUrl !== null ? (
        <div className="banner">
          <img
            src={`http://localhost:8080${mainAd.adImgUrl}`}
            alt="배너광고 이미지"
          />
        </div>
      ) : (
        <div />
      )}

      <section className="section-main">
        <div className="section-header">
          <h2>최근 올라온 신규 매물을 확인해보세요</h2>
          <button
            className="more-btn"
            onClick={() => {
              navigate("/stock");
            }}
          >
            모두 보기
          </button>
        </div>
        <div className="card-list ">{StockSample()}</div>

        <section className="sale">
          <div className="section-header">
            <h2>분양 소식을 빠르게 접해보세요</h2>
            <button className="more-btn" onClick={() => navigate("/sale")}>
              모두 보기
            </button>
          </div>
          <div className="card-list">{showSales()}</div>
        </section>
      </section>
    </main>
  );
};

export default Main;
