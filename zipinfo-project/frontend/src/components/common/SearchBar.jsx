import { useState, useEffect, useRef } from "react";
import "../../css/common/SearchBar.css";
import { axiosAPI } from "../../api/axiosApi";
import arrowDown from "../../assets/arrow-down.svg";
import refresh from "../../assets/refresh.svg";
import search from "../../assets/search-icon.svg";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
const SearchBar = ({
  showSearchType = true,
  searchKeyWord,
  setSearchKeyWord, //State searchKeyWord
  searchLocationCode,
  setSearchLocationCode, //State searchLocationCode
  searchStockForm,
  setSearchStockForm, //State searchStockForm - 주거/매물형태
  searchStockType,
  setSearchStockType, //State searchStockType - 매물/분양상태
  //todo : SalePage 내부에 선언된 매물 유형 state 매개변수 추가할것.
}) => {
  const [dealType, setDealType] = useState(""); // 매물/분양 상태
  const [residenceType, setResidenceType] = useState(""); // 주거/매물형태

  const [sigunguList, setSigunguList] = useState(null);
  const [sidoSelected, setSidoSelected] = useState(-1); // 현재 선택한 시/도 상태 저장
  const [sigunguSelected, setSigunguSelected] = useState(-1); // 현재 선택한 시/군/구 상태 저장

  const handleDealChange = (e) => {
    setDealType(e.target.value);
    setSearchStockForm(e.target.value);
  };
  const handleResidenceChange = (e) => {
    setResidenceType(e.target.value);
    setSearchStockType(e.target.value);
  };

  /***********select의 glow 애니메이션을 위한 ref 변수****************** */
  const glowRef = useRef(null);
  /***************************queryString이 존재할때 상태변수 초기화 */
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const stockSido = searchParams.get("sido") // ?sido = int
      ? Number(searchParams.get("sido"))
      : -1;
    const stockSigungu =
      searchParams.get("sido") & searchParams.get("sigungu") // ?sigungu = int
        ? Number(searchParams.get("sigungu"))
        : -1;
    const stockType = searchParams.get("type") // ?type=int
      ? Number(searchParams.get("type"))
      : -1;
    const stockForm = searchParams.get("form") // ?form=int
      ? Number(searchParams.get("form"))
      : -1;
    setSearchStockType(stockType);
    setDealType(stockForm);
    setSearchStockForm(stockForm);
    setResidenceType(stockType);
    setSidoSelected(stockSido);
    setSigunguSelected(stockSigungu);
  }, [searchParams]);
  /****************************검색어 기능 */
  const handleSearchKeyWordChange = (e) => {
    setSearchKeyWord(e.target.value);
  };
  /*************************** 위치 선택 기능 *******************************/
  const handleSidoChange = (e) => {
    /*시/도 메뉴가 바뀔떄마다 */
    setSidoSelected(parseInt(e.target.value, 10)); //SeachBar.jsx 파일에 있는 SidoSelected를 바꾼뒤

    //아래 useEffect에서 매개변수로 들어온 searchLocationCode를 알맞게 바꾼다.

    //그다음, 시/군/구 리스트를 DB 로부터 업데이트 한다.
  };
  const handleSigunguChange = (e) => {
    setSigunguSelected(parseInt(e.target.value, 10)); //SeachBar.jsx 파일에 있는 SidoSelected를 바꾼뒤
    //아래 useEffect에서 매개변수로 들어온 searchLocationCode를 알맞게 바꾼다.
  };

  useEffect(() => {
    if (sigunguSelected === -1 && sidoSelected !== -1) {
      // 시/도 가 선택된 상태에서 시/군/구가 선택이 안되있거나 전체로 선택되어있을떄
      setSearchLocationCode(sidoSelected); // 시도(lower than < 100)를 SearchLocationCode로 끌어올림
      //setSearchLocationCode(1000000000000);
    } else if (sigunguSelected !== -1 && sidoSelected !== -1) {
      setSearchLocationCode(sigunguSelected);
    } else if (sigunguSelected === -1 && sidoSelected === -1) {
      setSearchLocationCode(-1);
    } else {
      console.log(
        "잘못된 시/도, 시/군/구 선택이 발생했습니다:",
        sidoSelected,
        sigunguSelected
      );
    }
  }, [sidoSelected, sigunguSelected, searchLocationCode]);

  //sidoSelected가 바뀔때마다 시/군/구 목록을 서버 DB로부터 업데이트해준다.
  useEffect(() => {
    setSigunguSelected(-1); // 시/도가 바뀌면 시/군/구를  전체로 reset해줘야 한다.
    const fetchSigunguList = async () => {
      if (sidoSelected !== -1) {
        try {
          const resp = await axiosAPI.post(
            "/searchBar/getAllSigungu",

            { sidoSelected: sidoSelected },
            { headers: { "Content-Type": "application/json" } }
          );
          setSigunguList(resp.data);
        } catch (error) {
          console.log("시군구 로딩중 error 발생 : ", error);
        }
      } else {
        setSigunguList(null);
      }
    };

    fetchSigunguList();
  }, [sidoSelected]);
  // 새로고침시 모든 검색조건을 "전체"로 초기화하는 handle함수
  const handleRefresh = () => {
    setSidoSelected(-1);
    setSigunguSelected(-1);
    setDealType(-1);
    setResidenceType(-1);
    //상태 끌어올리기
    setSearchKeyWord("");
    setSearchStockForm(-1);
    setSearchStockType(-1);

    const elements = document.querySelectorAll(".glow-target"); // 모든 .glow-target 속성을 가진 select문 요소들을 저장.
    if (elements) {
      elements.forEach((el) => {
        el.classList.add("select-glow");
        setTimeout(() => el.classList.remove("select-glow"), 200);
      }); // 400ms동안 해당 glow 효과 유지.
    }
  };
  return (
    <div className="searchbar-wrap">
      <div className="searchbar">
        {/* 검색어 입력 */}
        <div className="search-input-wrap">
          <span className="header-search-icon">
            <img src={search} alt="검색 아이콘" />
          </span>
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            onChange={handleSearchKeyWordChange}
          />
        </div>

        {/* 시/도 */}
        <div className="search-select-wrap">
          <select
            className="glow-target"
            value={sidoSelected}
            onChange={handleSidoChange}
          >
            <option value={-1}>전국</option>
            <option value={11}>서울특별시</option>
            <option value={26}>부산광역시</option>
            <option value={28}>인천광역시</option>
            <option value={30}>대전광역시</option>
            <option value={27}>대구광역시</option>
            <option value={29}>광주광역시</option>
            <option value={31}>울산광역시</option>
            <option value={36}>세종특별자치시</option>
            <option value={41}>경기도</option>
            <option value={51}>강원도</option>
            {/**행정구역 개편으로 시/도 코드 51로 변경됨. */}
            <option value={43}>충청북도</option>
            <option value={44}>충청남도</option>
            <option value={52}>전북특별자치도</option>
            {/**행정구역 개편으로 시/도 코드 52로 변경됨. */}
            <option value={46}>전라남도</option>
            <option value={47}>경상북도</option>
            <option value={48}>경상남도</option>
            <option value={50}>제주특별자치도</option>
          </select>
          <img className="arrow-icon" src={arrowDown} alt="아래 아이콘" />
        </div>

        {/* 구/군 */}
        <div className="search-select-wrap">
          <select
            className="glow-target"
            value={sigunguSelected}
            onChange={handleSigunguChange}
          >
            {sigunguList?.length === 0 ? (
              <option value={-1} disabled>
                시/도를 선택하세요
              </option>
            ) : (
              <>
                <option value={-1}>전체</option>
                {sigunguList?.map((sigungu) => (
                  <option key={sigungu.townNo} value={sigungu.townNo}>
                    {sigungu.townName}
                  </option>
                ))}
              </>
            )}
          </select>
          <img className="arrow-icon" src={arrowDown} alt="아래 아이콘" />
        </div>

        {/* 매매/전세/월세 or 분양상태 */}
        <div className="search-select-wrap">
          <select
            className="glow-target"
            value={dealType}
            onChange={handleDealChange}
          >
            {showSearchType ? (
              <>
                <option value="-1">매매/전세/월세</option>
                <option value="0">매매</option>
                <option value="1">전세</option>
                <option value="2">월세</option>
              </>
            ) : (
              <>
                <option value="-1">분양전체</option>
                <option value="1">분양예정</option>
                <option value="2">분양중</option>
                <option value="3">분양완료</option>
              </>
            )}
          </select>
          <img className="arrow-icon" src={arrowDown} alt="아래 아이콘" />
        </div>

        {/* 주거/매물형태 */}
        <div className="search-select-wrap">
          <select
            className="glow-target"
            value={residenceType}
            onChange={handleResidenceChange}
          >
            <option value="-1">주거/매물형태</option>
            <option value="1">아파트</option>
            <option value="2">주택/빌라</option>
            <option value="3">오피스텔</option>
          </select>
          <img className="arrow-icon" src={arrowDown} alt="아래 아이콘" />
        </div>

        {/* 새로고침 */}
        <button className="searcbar-refresh-btn" onClick={handleRefresh}>
          <img src={refresh} alt="새로고침" />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
