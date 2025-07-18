import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import "../../css/myPage/menu.css";
import "../../css/myPage/addStock.css";
import StockMenu from "./StockMenu";
import MiniMenu from "./MiniMenu";
import { axiosAPI } from "../../api/axiosApi";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AddStock() {
  const location = useLocation();
  const property = location.state;

  const [formData, setFormData] = useState({
    stockNo: property.stockNo,
    stockType: property.stockType,
    stockSellPrice: property.stockSellPrice,
    stockFeeMonth: property.stockFeeMonth,
    stockName: property.stockName,
    stockManageFee: property.stockManageFee,
    stockInfo: property.stockInfo,
    stockAddress: property.stockAddress,
    stockForm: property.stockForm,
    exclusiveArea: property.exclusiveArea,
    supplyArea: property.supplyArea,
    currentFloor: property.currentFloor,
    floorTotalCount: property.floorTotalCount,
    roomCount: property.roomCount,
    bathCount: property.bathCount,
    stockDirection: property.stockDirection,
    ableDate: property.ableDate.substring(0, 10),
    useApprovalDate: property.useApprovalDate.substring(0, 10),
    stockDetail: property.stockDetail,
    regionNo: property.regionNo,
    lat: property.lat,
    lng: property.lng,
  });

  const keyToLabel = {
    stockType: "매물유형이",
    stockSellPrice: "매물 가격이",
    stockFeeMonth: "월세가",
    stockName: "매물 이름이",
    stockInfo: "요약정보가",
    stockAddress: "상세주소가",
    stockForm: "매물 형태가",
    exclusiveArea: "전용 면적이",
    supplyArea: "공급 면적이",
    currentFloor: "현재 층이",
    floorTotalCount: "총 층수가",
    roomCount: "방 개수가",
    bathCount: "욕실 개수가",
    stockDirection: "방향이",
    stockManageFee: "관리비가",
    ableDate: "입주 가능일이",
    useApprovalDate: "사용 승인일이",
    stockDetail: "상세 설명이",
  };

  const [checkData, setCheckData] = useState({
    stockType: true,
    stockSellPrice: true,
    stockFeeMonth: true,
    stockName: true,
    stockInfo: true,
    stockAddress: true,
    stockForm: true,
    exclusiveArea: true,
    supplyArea: true,
    currentFloor: true,
    floorTotalCount: true,
    roomCount: true,
    bathCount: true,
    stockDirection: true,
    stockManageFee: true,
    ableDate: true,
    useApprovalDate: true,
    stockDetail: true,
  });

  const nav = useNavigate();

  const restApiKey = "ecd31a0cd396c7f727923cde30c29eb5";

  //---------------------- 이미지 관련 구문입니다-------------------------

  const [previewTumbImgName, setPreviewTumbImgName] = useState(
    property.imgList[0].imgOriginName
  );
  const [previewBalanceImgName, setPreviewBalanceImgName] = useState(
    property.imgList[1].imgOriginName
  );
  const [previewImgName, setPreviewImgName] = useState(
    property.imgList.slice(2).map((img) => img.imgOriginName)
  );

  const [stockTumbImg, setStockTumbImg] = useState(null);
  const [stockImg, setStockImg] = useState([]);
  const [balanceImg, setBalanceImg] = useState(null);

  // 각각의 input ref
  const thumbInputRef = useRef(null);
  const inputRef = useRef(null);
  const balanceInputRef = useRef(null);

  // 각각의 버튼 클릭 핸들러
  const handleThumbClick = () => thumbInputRef.current.click();
  const handleBenefitClick = () => balanceInputRef.current.click();
  const handleClick = () => inputRef.current.click();

  const maxFileSize = 10 * 1024 * 1024;
  const maxFilesSize = 10 * 1024 * 1024;

  // 파일 선택되면 상태에 추가
  const handleTumbChange = (e) => {
    const file = e.target.files[0];
    setStockTumbImg(file);

    if (file.size > maxFileSize) {
      toast.error(
        <div>
          <div className="toast-error-title">오류 알림!</div>
          <div className="toast-error-body">
            파일 크기는 10MB 이하만 업로드 할 수 있습니다.
          </div>
        </div>
      );
      setStockTumbImg(null);
      return;
    }
  };

  const handleChange = (e) => {
    const filess = Array.from(e.target.files);

    const file = e.target.files[0];

    if (file.size > maxFileSize) {
      toast.error(
        <div>
          <div className="toast-error-title">오류 알림!</div>
          <div className="toast-error-body">
            파일 크기는 10MB 이하만 업로드 할 수 있습니다.
          </div>
        </div>
      );
      return;
    }

    const totalSize = [...stockImg, ...filess].reduce(
      (acc, file) => acc + file.size,
      0
    );
    if (totalSize > maxFilesSize) {
      toast.error(
        <div>
          <div className="toast-error-title">오류 알림!</div>
          <div className="toast-error-body">
            모든 파일 합이 30MB를 초과합니다.
          </div>
        </div>
      );
      return;
    }

    setStockImg((prev) => [...prev, ...filess]);
  };

  const handleBalanceChange = (e) => {
    const file = e.target.files[0];
    setBalanceImg(file);

    if (file.size > maxFileSize) {
      toast.error(
        <div>
          <div className="toast-error-title">오류 알림!</div>
          <div className="toast-error-body">
            파일 크기는 10MB 이하만 업로드 할 수 있습니다.
          </div>
        </div>
      );
      setStockTumbImg(null);
      return;
    }
  };

  const combinedImages = [
    ...(stockTumbImg ? [stockTumbImg] : []),
    ...(balanceImg ? [balanceImg] : []),
    ...stockImg,
  ];

  //-----------------------------여기까지-----------------------------

  const [postcode, setPostcode] = useState(
    property.stockAddress?.split("^^^")[0] || ""
  );
  const [address, setAddress] = useState(
    property.stockAddress?.split("^^^")[1] || ""
  );
  const [detailAddress, setDetailAddress] = useState(
    property.stockAddress?.split("^^^")[2] || ""
  );

  const execJusoAPI = (addr) => {
    const callbackName = `jusoCallback_${Date.now()}`;
    window[callbackName] = (data) => {
      if (data.results && data.results.juso && data.results.juso.length > 0) {
        const { admCd } = data.results.juso[0];
        const admCdNo = parseInt(admCd.substring(0, 5));
        setFormData((prev) => ({
          ...prev,
          regionNo: admCdNo,
        }));
      } else {
        toast.error(
          <div>
            <div className="toast-error-title">오류 알림!</div>
            <div className="toast-error-body">검색 결과가 없습니다.</div>
          </div>
        );
      }

      // 정리
      delete window[callbackName];
      document.body.removeChild(script);
    };

    const params = new URLSearchParams({
      currentPage: 1,
      countPerPage: 10,
      resultType: "json",
      confmKey: "devU01TX0FVVEgyMDI1MDYyNDA5NDMxODExNTg3MjU=",
      keyword: addr,
      callback: callbackName,
    });

    const script = document.createElement("script");
    script.src = `https://business.juso.go.kr/addrlink/addrLinkApiJsonp.do?${params.toString()}`;
    document.body.appendChild(script);
  };

  const execDaumPostcode = () => {
    new window.daum.Postcode({
      oncomplete: async (data) => {
        const addr =
          data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;
        setPostcode(data.zonecode);
        setAddress(addr);
        document.getElementsByName("detailAddress")[0].focus();

        execJusoAPI(addr);

        const res = await fetch(
          `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(
            addr
          )}`,
          {
            headers: {
              Authorization: `KakaoAK ${restApiKey}`,
            },
          }
        );

        const coordData = await res.json();
        if (coordData.documents.length > 0) {
          const { x, y } = coordData.documents[0]; // 경도 x, 위도 y
          setFormData((prev) => ({
            ...prev,
            lat: y,
            lng: x,
          }));
        } else {
          toast.error(
            <div>
              <div className="toast-error-title">오류 알림!</div>
              <div className="toast-error-body">좌표를 찾을 수 없습니다.</div>
            </div>
          );
          setFormData((prev) => ({
            ...prev,
            lat: 0,
            lng: 0,
          }));
        }
      },
    }).open();
  };

  const handleStockType = (e) => {
    const { value } = e.target;

    setFormData((prev) => ({
      ...prev,
      stockType: parseInt(value),
    }));
  };

  const handleStockForm = (e) => {
    const { value } = e.target;

    setFormData((prev) => ({
      ...prev,
      stockForm: value,
    }));
  };

  const handleDetailAddress = (e) => {
    const { value } = e.target;

    setDetailAddress(value);
    setFormData((prev) => ({
      ...prev,
      stockAddress: [postcode, address, value].join("^^^"),
    }));
    formData.stockAddress.length > 2 && formData.stockAddress.length < 1000
      ? setCheckData((prev) => ({
          ...prev,
          stockAddress: true,
        }))
      : setCheckData((prev) => ({
          ...prev,
          stockAddress: false,
        }));
  };

  const handleStockInfo = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    const trimmed = value.trim();

    switch (name) {
      case "stockSellPrice":
        !isNaN(trimmed) && trimmed.length > 2 && trimmed.length < 15
          ? setCheckData((prev) => ({
              ...prev,
              stockSellPrice: true,
            }))
          : setCheckData((prev) => ({
              ...prev,
              stockSellPrice: false,
            }));
        break;

      case "stockFeeMonth":
        !isNaN(trimmed) && trimmed.length > 2 && trimmed.length < 15
          ? setCheckData((prev) => ({
              ...prev,
              stockFeeMonth: true,
            }))
          : setCheckData((prev) => ({
              ...prev,
              stockFeeMonth: false,
            }));
        break;

      case "stockName":
        trimmed.length > 0 && trimmed.length < 50
          ? setCheckData((prev) => ({
              ...prev,
              stockName: true,
            }))
          : setCheckData((prev) => ({
              ...prev,
              stockName: false,
            }));
        break;

      case "stockInfo":
        trimmed.length > 1 && trimmed.length < 100
          ? setCheckData((prev) => ({
              ...prev,
              stockInfo: true,
            }))
          : setCheckData((prev) => ({
              ...prev,
              stockInfo: false,
            }));
        break;

      case "exclusiveArea":
        !isNaN(trimmed) && trimmed.length > 0 && trimmed.length < 11
          ? setCheckData((prev) => ({
              ...prev,
              exclusiveArea: true,
            }))
          : setCheckData((prev) => ({
              ...prev,
              exclusiveArea: false,
            }));
        break;

      case "supplyArea":
        !isNaN(trimmed) && trimmed.length > 0 && trimmed.length < 11
          ? setCheckData((prev) => ({
              ...prev,
              supplyArea: true,
            }))
          : setCheckData((prev) => ({
              ...prev,
              supplyArea: false,
            }));
        break;

      case "currentFloor":
        !isNaN(trimmed) && trimmed.length > 0 && trimmed.length < 3
          ? setCheckData((prev) => ({
              ...prev,
              currentFloor: true,
            }))
          : setCheckData((prev) => ({
              ...prev,
              currentFloor: false,
            }));
        break;

      case "floorTotalCount":
        !isNaN(trimmed) && trimmed.length > 0 && trimmed.length < 3
          ? setCheckData((prev) => ({
              ...prev,
              floorTotalCount: true,
            }))
          : setCheckData((prev) => ({
              ...prev,
              floorTotalCount: false,
            }));
        break;

      case "roomCount":
        !isNaN(trimmed) && trimmed.length > 0 && trimmed.length < 3
          ? setCheckData((prev) => ({
              ...prev,
              roomCount: true,
            }))
          : setCheckData((prev) => ({
              ...prev,
              roomCount: false,
            }));
        break;

      case "bathCount":
        !isNaN(trimmed) && trimmed.length > 0 && trimmed.length < 3
          ? setCheckData((prev) => ({
              ...prev,
              bathCount: true,
            }))
          : setCheckData((prev) => ({
              ...prev,
              bathCount: false,
            }));
        break;

      case "stockDirection":
        trimmed.length > 0 && trimmed.length < 11
          ? setCheckData((prev) => ({
              ...prev,
              stockDirection: true,
            }))
          : setCheckData((prev) => ({
              ...prev,
              stockDirection: false,
            }));
        break;

      case "stockManageFee":
        !isNaN(trimmed) && trimmed.length < 15
          ? setCheckData((prev) => ({
              ...prev,
              stockManageFee: true,
            }))
          : setCheckData((prev) => ({
              ...prev,
              stockManageFee: false,
            }));
        break;

      case "ableDate":
        trimmed.length > 0 && trimmed.length < 11
          ? setCheckData((prev) => ({
              ...prev,
              ableDate: true,
            }))
          : setCheckData((prev) => ({
              ...prev,
              ableDate: false,
            }));
        break;

      case "useApprovalDate":
        trimmed.length > 0 && trimmed.length < 11
          ? setCheckData((prev) => ({
              ...prev,
              useApprovalDate: true,
            }))
          : setCheckData((prev) => ({
              ...prev,
              useApprovalDate: false,
            }));
        break;

      case "stockDetail":
        trimmed.length > 0 && trimmed.length < 2000
          ? setCheckData((prev) => ({
              ...prev,
              stockDetail: true,
            }))
          : setCheckData((prev) => ({
              ...prev,
              stockDetail: false,
            }));
        break;
    }
  };

  const handleSubmit = async () => {
    try {
      for (const [key, value] of Object.entries(checkData)) {
        if (!value) {
          const label = keyToLabel[key] || key;
          toast.error(
            <div>
              <div className="toast-error-title">오류 알림!</div>
              <div className="toast-error-body">{label} 올바르지 않습니다.</div>
            </div>
          );
          return;
        }
      }

      const convertedData = {
        ...formData,
        stockType: parseInt(formData.stockType),
        stockForm: parseInt(formData.stockForm),
        stockSellPrice: parseInt(formData.stockSellPrice),
        stockFeeMonth: parseInt(formData.stockFeeMonth),
        stockManageFee: parseInt(formData.stockManageFee),
        exclusiveArea: parseInt(formData.exclusiveArea),
        supplyArea: parseInt(formData.supplyArea),
        currentFloor: parseInt(formData.currentFloor),
        floorTotalCount: parseInt(formData.floorTotalCount),
        roomCount: parseInt(formData.roomCount),
        bathCount: parseInt(formData.bathCount),
        regionNo: parseInt(formData.regionNo),
      };

      const response = await axiosAPI.post(
        "/myPage/updateStock",
        convertedData,
        { withCredentials: true }
      );

      if (response.status === 200) {
        // const combinedImages = [
        // ...(stockTumbImg ? [stockTumbImg] : []),
        // ...(balanceImg ? [balanceImg] : []),
        // ...stockImg
        // ];
        if (stockTumbImg !== null) {
          const tumbImgForm = new FormData();
          tumbImgForm.append("stockImg", stockTumbImg);
          tumbImgForm.append("stockNo", parseInt(formData.stockNo));
          const tumbImgResp = await axiosAPI.post(
            "/myPage/updateTumbImg",
            tumbImgForm,
            {
              withCredentials: true,
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
        }

        if (balanceImg !== null) {
          const balanceImgForm = new FormData();
          balanceImgForm.append("stockImg", balanceImg);
          balanceImgForm.append("stockNo", parseInt(formData.stockNo));
          const balanceImgResp = await axiosAPI.post(
            "/myPage/updateBalanceImg",
            balanceImgForm,
            {
              withCredentials: true,
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
        }

        if (stockImg.length !== 0) {
          const stockImgForm = new FormData();
          stockImg.forEach((file) => stockImgForm.append("stockImg", file));
          stockImgForm.append("stockNo", parseInt(formData.stockNo));
          const stockImgResp = await axiosAPI.post(
            "/myPage/updateStockImg",
            stockImgForm,
            {
              withCredentials: true,
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
        }

        toast.success(
          <div>
            <div className="toast-success-title">수정 성공 알림!</div>
            <div className="toast-success-body">
              매물 정보가 수정되었습니다.
            </div>
          </div>
        );
        nav("/myPage/myStock");
      }
    } catch (error) {
      console.log("업로드 실패", error);
    }
  };

  return (
    <div className="my-page-add-stock">
      <div className="my-page-add-stock-container">
        <StockMenu />
        <MiniMenu />

        <div className="my-page-stock-content-card">
          {/* 기본정보 섹션 */}
          <div className="my-page-stock-section">
            <h2 className="my-page-stock-section-title">기본정보</h2>

            <div className="my-page-stock-form-group">
              <div className="my-page-stock-input-row">
                <label className="my-page-stock-input-label">매물유형</label>
                <select
                  value={formData.stockType}
                  onChange={handleStockType}
                  className="my-page-stock-input-field"
                >
                  <option value="0">매매</option>
                  <option value="1">전세</option>
                  <option value="2">월세</option>
                </select>
              </div>

              {formData.stockType === 0 && (
                <>
                  <div className="my-page-stock-input-row">
                    <label className="my-page-stock-input-label">매매가</label>
                    <input
                      type="number"
                      placeholder="매매가를 입력해주세요(숫자만 입력하세요)"
                      className="my-page-stock-input-field"
                      value={formData.stockSellPrice}
                      onChange={handleStockInfo}
                      name="stockSellPrice"
                      maxLength={12}
                    />
                  </div>

                  <div className="my-page-stock-input-row">
                    <label className="my-page-stock-input-label">매물명</label>
                    <input
                      type="text"
                      placeholder="매물명을 입력해주세요(50글자 이내로 입력하세요)"
                      className="my-page-stock-input-field"
                      value={formData.stockName}
                      onChange={handleStockInfo}
                      name="stockName"
                      maxLength={50}
                    />
                  </div>

                  <div className="my-page-stock-input-row">
                    <label className="my-page-stock-input-label">
                      요약정보
                    </label>
                    <input
                      type="text"
                      placeholder="요약정보를 입력해주세요(100글자 이내로 입력하세요)"
                      className="my-page-stock-input-field"
                      value={formData.stockInfo}
                      onChange={handleStockInfo}
                      name="stockInfo"
                      maxLength={100}
                    />
                  </div>
                </>
              )}

              {formData.stockType === 1 && (
                <>
                  <div className="my-page-stock-input-row">
                    <label className="my-page-stock-input-label">전세가</label>
                    <input
                      type="number"
                      placeholder="전세가를 입력해주세요(숫자만 입력하세요)"
                      className="my-page-stock-input-field"
                      value={formData.stockSellPrice}
                      onChange={handleStockInfo}
                      name="stockSellPrice"
                      maxLength={12}
                    />
                  </div>

                  <div className="my-page-stock-input-row">
                    <label className="my-page-stock-input-label">매물명</label>
                    <input
                      type="text"
                      placeholder="매물명을 입력해주세요(50글자 이내로 입력하세요)"
                      className="my-page-stock-input-field"
                      value={formData.stockName}
                      onChange={handleStockInfo}
                      name="stockName"
                      maxLength={50}
                    />
                  </div>

                  <div className="my-page-stock-input-row">
                    <label className="my-page-stock-input-label">
                      요약정보
                    </label>
                    <input
                      type="text"
                      placeholder="요약정보를 입력해주세요(100글자 이내로 입력하세요)"
                      className="my-page-stock-input-field"
                      value={formData.stockInfo}
                      onChange={handleStockInfo}
                      name="stockInfo"
                      maxLength={100}
                    />
                  </div>
                </>
              )}

              {formData.stockType === 2 && (
                <>
                  <div className="my-page-stock-input-row">
                    <label className="my-page-stock-input-label">보증금</label>
                    <input
                      type="number"
                      placeholder="보증금을 입력해주세요(숫자만 입력하세요)"
                      className="my-page-stock-input-field"
                      value={formData.stockSellPrice}
                      onChange={handleStockInfo}
                      name="stockSellPrice"
                      maxLength={10}
                    />
                  </div>

                  <div className="my-page-stock-input-row">
                    <label className="my-page-stock-input-label">월세가</label>
                    <input
                      type="number"
                      placeholder="월세가를 입력해주세요(숫자만 입력하세요)"
                      className="my-page-stock-input-field"
                      value={formData.stockFeeMonth}
                      onChange={handleStockInfo}
                      name="stockFeeMonth"
                      maxLength={10}
                    />
                  </div>

                  <div className="my-page-stock-input-row">
                    <label className="my-page-stock-input-label">매물명</label>
                    <input
                      type="text"
                      placeholder="매물명을 입력해주세요(50글자 이내로 입력하세요)"
                      className="my-page-stock-input-field"
                      value={formData.stockName}
                      onChange={handleStockInfo}
                      name="stockName"
                      maxLength={50}
                    />
                  </div>

                  <div className="my-page-stock-input-row">
                    <label className="my-page-stock-input-label">
                      요약정보
                    </label>
                    <input
                      type="text"
                      placeholder="요약정보를 입력해주세요(100글자 이내로 입력하세요)"
                      className="my-page-stock-input-field"
                      value={formData.stockInfo}
                      onChange={handleStockInfo}
                      name="stockInfo"
                      maxLength={100}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 상세정보 섹션 */}
          <div className="my-page-stock-section">
            <h2 className="my-page-stock-section-title">상세정보</h2>
            <div className="my-page-stock-form-group">
              <div className="my-page-stock-input-row">
                <label className="my-page-stock-input-label">매물 위치</label>
                <input
                  type="text"
                  placeholder="우편번호"
                  className="my-page-stock-input-field"
                  value={postcode}
                  name="postcode"
                  readOnly
                />

                <button
                  className="my-page-stock-address-btn"
                  type="button"
                  onClick={execDaumPostcode}
                >
                  주소 찾기
                </button>
              </div>
              <div className="my-page-stock-input-row">
                <label className="my-page-stock-input-label"></label>
                <input
                  type="text"
                  placeholder="주소"
                  className="my-page-stock-input-field"
                  value={address}
                  name="address"
                  readOnly
                />
              </div>
              <div className="my-page-stock-input-row">
                <label className="my-page-stock-input-label"></label>
                <input
                  type="text"
                  placeholder="상세 위치를 입력해주세요"
                  className="my-page-stock-input-field"
                  value={detailAddress}
                  name="detailAddress"
                  onChange={handleDetailAddress}
                  maxLength={50}
                />
              </div>
              <div className="my-page-stock-input-row">
                <label className="my-page-stock-input-label">매물형태</label>
                <select
                  onChange={handleStockForm}
                  className="my-page-stock-input-field"
                  name="stockForm"
                >
                  <option value="1">아파트</option>
                  <option value="2">빌라</option>
                  <option value="3">오피스텔</option>
                </select>
              </div>
              <div className="my-page-stock-input-row">
                <label className="my-page-stock-input-label">전용면적</label>
                <input
                  type="number"
                  placeholder="전용면적을 입력하세요(숫자만 입력하세요)"
                  className="my-page-stock-input-field"
                  value={formData.exclusiveArea}
                  onChange={handleStockInfo}
                  name="exclusiveArea"
                  maxLength={8}
                />
              </div>
              <div className="my-page-stock-input-row">
                <label className="my-page-stock-input-label">공급면적</label>
                <input
                  type="number"
                  placeholder="공급면적을 입력하세요(숫자만 입력하세요)"
                  className="my-page-stock-input-field"
                  value={formData.supplyArea}
                  onChange={handleStockInfo}
                  name="supplyArea"
                  maxLength={8}
                />
              </div>
              <div className="my-page-stock-input-row">
                <label className="my-page-stock-input-label">해당층</label>
                <input
                  type="number"
                  placeholder="해당층을 입력하세요(숫자만 입력하세요)"
                  className="my-page-stock-input-field"
                  value={formData.currentFloor}
                  onChange={handleStockInfo}
                  name="currentFloor"
                  maxLength={3}
                />
              </div>
              <div className="my-page-stock-input-row">
                <label className="my-page-stock-input-label">건물층</label>
                <input
                  type="number"
                  placeholder="건물층을 입력하세요(숫자만 입력하세요)"
                  className="my-page-stock-input-field"
                  value={formData.floorTotalCount}
                  onChange={handleStockInfo}
                  name="floorTotalCount"
                  maxLength={3}
                />
              </div>
              <div className="my-page-stock-input-row">
                <label className="my-page-stock-input-label">방 개수</label>
                <input
                  type="number"
                  placeholder="방 개수를 입력하세요(숫자만 입력하세요)"
                  className="my-page-stock-input-field"
                  value={formData.roomCount}
                  onChange={handleStockInfo}
                  name="roomCount"
                  maxLength={3}
                />
              </div>
              <div className="my-page-stock-input-row">
                <label className="my-page-stock-input-label">욕실 개수</label>
                <input
                  type="number"
                  placeholder="욕실 개수를 입력하세요(숫자만 입력하세요)"
                  className="my-page-stock-input-field"
                  value={formData.bathCount}
                  onChange={handleStockInfo}
                  name="bathCount"
                  maxLength={3}
                />
              </div>
              <div className="my-page-stock-input-row">
                <label className="my-page-stock-input-label">방향</label>
                <input
                  type="text"
                  placeholder="방향을 입력해주세요"
                  className="my-page-stock-input-field"
                  value={formData.stockDirection}
                  onChange={handleStockInfo}
                  name="stockDirection"
                  maxLength={3}
                />
              </div>
              <div className="my-page-stock-input-row">
                <label className="my-page-stock-input-label">관리비</label>
                <input
                  type="number"
                  placeholder="관리비를 입력해주세요(숫자만 입력하세요)"
                  className="my-page-stock-input-field"
                  value={formData.stockManageFee}
                  onChange={handleStockInfo}
                  name="stockManageFee"
                  maxLength={8}
                />
              </div>
              <div className="my-page-stock-input-row">
                <label className="my-page-stock-input-label">입주가능일</label>
                <input
                  type="date"
                  placeholder="입주가능일을 입력해주세요"
                  className="my-page-stock-input-field"
                  value={formData.ableDate}
                  onChange={handleStockInfo}
                  name="ableDate"
                />
              </div>
              <div className="my-page-stock-input-row">
                <label className="my-page-stock-input-label">사용승인일</label>
                <input
                  type="date"
                  placeholder="사용승인일을 입력해주세요"
                  className="my-page-stock-input-field"
                  value={formData.useApprovalDate}
                  onChange={handleStockInfo}
                  name="useApprovalDate"
                />
              </div>
              <div className="my-page-stock-input-row">
                <label className="my-page-stock-input-label">상세설명</label>
                <textarea
                  type="text"
                  placeholder="상세설명을 입력해주세요"
                  className="my-page-stock-textarea"
                  value={formData.stockDetail}
                  onChange={handleStockInfo}
                  name="stockDetail"
                  maxLength={1999}
                />
              </div>
            </div>
          </div>

          {/* 서체정보 섹션 */}
          <div className="my-page-stock-section">
            <h2 className="my-page-stock-section-title">서체정보</h2>
            <div className="my-page-stock-form-group">
              <div className="my-page-stock-image-upload-section">
                <div className="my-page-stock-image-upload-header">
                  <span className="my-page-stock-image-upload-title">
                    썸네일 이미지
                  </span>
                  <button
                    className="my-page-stock-image-add-btn"
                    onClick={handleThumbClick}
                  >
                    <Plus size={16} className="plus-icon" />
                    이미지추가
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={thumbInputRef}
                    style={{ display: "none" }}
                    onChange={handleTumbChange}
                  />
                </div>
                <ul>
                  {stockTumbImg !== null ? (
                    <li className="imgList">{stockTumbImg.name}</li>
                  ) : (
                    <li className="imgList">{previewTumbImgName}</li>
                  )}
                </ul>
                <p className="my-page-stock-image-upload-desc">
                  이미지 파일의 크기는 10MB를 넘으면 안됩니다.
                </p>
                <p className="my-page-stock-image-upload-desc">
                  공유할 이미지는 1개만 첨부할 수 있습니다
                </p>
              </div>

              <div className="my-page-stock-image-upload-section">
                <div className="my-page-stock-image-upload-header">
                  <span className="my-page-stock-image-upload-title">
                    평형 이미지
                  </span>
                  <button
                    className="my-page-stock-image-add-btn"
                    onClick={handleBenefitClick}
                  >
                    <Plus size={16} className="plus-icon" />
                    이미지추가
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={balanceInputRef}
                    style={{ display: "none" }}
                    onChange={handleBalanceChange}
                  />
                </div>
                <ul>
                  {balanceImg !== null ? (
                    <li className="imgList">{balanceImg.name}</li>
                  ) : (
                    <li className="imgList">{previewBalanceImgName}</li>
                  )}
                </ul>
                <p className="my-page-stock-image-upload-desc">
                  이미지 파일의 크기는 10MB를 넘으면 안됩니다.
                </p>
                <p className="my-page-stock-image-upload-desc">
                  공유할 이미지는 1개만 첨부할 수 있습니다
                </p>
              </div>

              <div className="my-page-stock-image-upload-section">
                <div className="my-page-stock-image-upload-header">
                  <span className="my-page-stock-image-upload-title">사진</span>
                  <button
                    className="my-page-stock-image-add-btn"
                    onClick={handleClick}
                  >
                    <Plus size={16} className="plus-icon" />
                    이미지추가
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={inputRef}
                    style={{ display: "none" }}
                    onChange={handleChange}
                  />
                </div>
                <ul>
                  {stockImg.length > 0
                    ? stockImg.map((img, idx) => (
                        <li className="imgList" key={idx}>
                          {img.name}
                        </li>
                      ))
                    : previewImgName.map((name, idx) => (
                        <li className="imgList" key={idx}>
                          {name}
                        </li>
                      ))}
                </ul>
                <p className="my-page-stock-image-upload-desc">
                  이미지 파일의 크기는 10MB를 넘으면 안됩니다.
                </p>
                <p className="my-page-stock-image-upload-desc">
                  공유할 이미지는 30MB까지 첨부할 수 있습니다
                </p>
              </div>
            </div>
          </div>
          {/* 저장 버튼 */}
          <div className="my-page-stock-save-button-container">
            <button
              onClick={handleSubmit}
              className="my-page-stock-save-button"
            >
              저장하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
