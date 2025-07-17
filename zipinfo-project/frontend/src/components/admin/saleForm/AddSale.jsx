import React, { useState, useEffect } from "react";
import { axiosAPI } from "../../../api/axiosAPI";
import "../../../css/admin/saleForm/AddSale.css";
import { useNavigate } from "react-router-dom";

// 매물 형태 및 상태를 숫자로 매핑
const typeMap = { 아파트: 1, 빌라: 2, 오피스텔: 3 };
const statusMap = { 분양중: 1, 분양예정: 2, 분양완료: 3 };

// 초기 상태값 설정
const initialState = {
  type: "아파트",
  name: "",
  status: "분양예정",
  address: "",
  scale: "",
  startDate: "",
  endDate: "",
  recruitDate: "",
  builder: "",
  contact: "",
  tax: "",
  supplyArea: "",
  exclusiveArea: "",
  rooms: "",
  baths: "",
  price1: "",
  price2: "",
  contractRate: "",
  contractAmount: "",
  interimRate: "",
  interimAmount: "",
  balanceRate: "",
  balanceAmount: "",
  regionNo: "",
  lat: 0,
  lng: 0,
};

const AddSale = () => {
  const [form, setForm] = useState(initialState); // 폼 데이터 상태
  const [submitStatus, setSubmitStatus] = useState(""); // 등록 상태 메시지
  const [availableInterimRates, setAvailableInterimRates] = useState([]); // 중도금 비율 선택 옵션
  const [thumbnailImages, setThumbnailImages] = useState([]); // 썸네일 이미지
  const [floorImages, setFloorImages] = useState([]); // 평면도 이미지

  const formatWithComma = (val) => val.replace(/\B(?=(\d{3})+(?!\d))/g, ","); // 1000단위 콤마 추가
  const removeComma = (val) => val.replace(/,/g, ""); // 콤마 제거

  const navigate = useNavigate();

  // 총 분양가 계산 (억 단위는 필수, 만원 단위는 선택)
  const totalPrice =
    (Number(removeComma(form.price1)) * 10000 +
      (form.price2 ? Number(removeComma(form.price2)) : 0)) *
    10000;

  // 계약금이 변경될 때 중도금 비율 옵션 및 유효성 재설정
  useEffect(() => {
    const contract = parseInt(form.contractRate) || 0;
    const options = [];
    for (let i = 10; i <= 100 - contract; i += 10) {
      options.push(i);
    }
    setAvailableInterimRates(contract ? options : []);

    const currentInterim = parseInt(form.interimRate) || 0;
    if (!options.includes(currentInterim)) {
      setForm((prev) => ({ ...prev, interimRate: "", interimAmount: "" }));
    }
    if (contract === 100) {
      setForm((prev) => ({ ...prev, interimRate: "", interimAmount: "" }));
    }
  }, [form.contractRate]);

  // 계약금, 중도금, 잔금 금액 계산
  useEffect(() => {
    const contract = parseInt(form.contractRate) || 0;
    const interim = parseInt(form.interimRate) || 0;
    let balance = 100 - contract - interim;
    if (balance < 0) balance = 0;

    const toKoreanCurrency = (amount) => {
      const billion = Math.floor(amount / 100000000);
      const million = Math.floor((amount % 100000000) / 10000);

      if (billion > 0 && million > 0)
        return `${billion}억 ${million.toLocaleString()}만원`;
      if (billion > 0) return `${billion}억`;
      if (million > 0) return `${million.toLocaleString()}만원`;
      return `${amount.toLocaleString()}원`;
    };

    const contractAmount = contract
      ? toKoreanCurrency((totalPrice * contract) / 100)
      : "";
    const interimAmount = interim
      ? toKoreanCurrency((totalPrice * interim) / 100)
      : "";
    const balanceAmount = totalPrice
      ? toKoreanCurrency((totalPrice * balance) / 100)
      : "";

    setForm((prev) => ({
      ...prev,
      balanceRate: `${balance}%`,
      contractAmount,
      interimAmount,
      balanceAmount,
    }));
  }, [form.contractRate, form.interimRate, totalPrice]);

  // 입력 필드 유효성 검사 및 콤마 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    const onlyNumber = /^[0-9]*$/;
    const onlyDecimal = /^[0-9]*\.?[0-9]*$/;
    const phonePattern = /^[0-9\-]*$/;

    // 필드별 최대 길이 설정
    const fieldMaxLength = {
      name: 15,
      scale: 30,
      builder: 10,
      contact: 13,
      tax: 12,
      supplyArea: 6,
      exclusiveArea: 6,
      rooms: 2,
      baths: 2,
      price1: 3,
      price2: 4,
    };

    if (fieldMaxLength[name] && value.length > fieldMaxLength[name]) return;

    if (["price1", "price2"].includes(name) && !onlyNumber.test(value)) return;

    if (
      ["supplyArea", "exclusiveArea"].includes(name) &&
      !onlyDecimal.test(value)
    )
      return;

    // 금액 관련 입력일 경우 콤마 처리
    if (["price1", "price2", "tax"].includes(name)) {
      const numeric = removeComma(value);
      if (!onlyNumber.test(numeric)) return;
      setForm((prev) => ({ ...prev, [name]: formatWithComma(numeric) }));
      return;
    }

    if (name === "contact" && !phonePattern.test(value)) return;

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 라디오 버튼 처리
  const handleRadio = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 카카오 주소 검색 팝업
  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        let fullAddr = data.address;
        if (data.addressType === "R") {
          if (data.bname !== "") fullAddr += " " + data.bname;
          if (data.buildingName !== "") fullAddr += " " + data.buildingName;
        }
        setForm((prev) => ({ ...prev, address: fullAddr }));
      },
    }).open();
  };

  // 이미지 파일 선택 처리 - 썸네일
  const handleThumbnailChange = (e) => {
    const files = Array.from(e.target.files);
    setThumbnailImages(files);
  };

  // 이미지 파일 선택 처리 - 평면도
  const handleFloorChange = (e) => {
    const files = Array.from(e.target.files);
    setFloorImages(files);
  };

  // 최종 등록 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus("");
    if (
      !form.name ||
      !form.address ||
      !form.contact ||
      !form.price1 ||
      !form.contractRate ||
      !form.supplyArea ||
      !form.exclusiveArea ||
      thumbnailImages.length === 0 ||
      floorImages.length === 0
    ) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    // 날짜 비교
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);

      if (isNaN(start) || isNaN(end)) {
        alert("날짜 형식이 잘못되었습니다.");
        return;
      }

      if (end <= start) {
        alert("청약 종료일은 시작일보다 이후 날짜여야 합니다.");
        return;
      }
    }

    try {
      const response = await axiosAPI.get(
        "https://dapi.kakao.com/v2/local/search/address.json",
        {
          params: { query: form.address },
          // interceptor 가 withCredentials=false & KakaoAK 헤더를 자동으로 붙여줍니다
        }
      );

      const result = response.data.documents[0];

      if (!result) throw new Error("주소에 해당하는 위치가 없습니다.");

      // region_3depth_h_code 추출 (address 또는 road_address 중에서)
      const regionHCode = result.address?.h_code || result.road_address?.h_code;

      if (!regionHCode || regionHCode.length < 5) {
        throw new Error(
          "법정동 코드(region_3depth_h_code)가 유효하지 않습니다."
        );
      }

      // 앞 5자리만 추출
      const regionNo = parseInt(regionHCode.substring(0, 5), 10);

      // 위도, 경도
      const lat = result.y;
      const lng = result.x;

      // 납입 금액 계산 (실제 숫자 값으로)
      const deposit = Math.floor(
        (totalPrice * (parseInt(form.contractRate) || 0)) / 100
      );
      const middlePayment = Math.floor(
        (totalPrice * (parseInt(form.interimRate) || 0)) / 100
      );
      const balancePayment = totalPrice - deposit - middlePayment;

      const saleData = {
        saleStockForm: typeMap[form.type], // 매물 형태 (1, 2, 3)
        saleStatus: statusMap[form.status], // 분양 상태 (1, 2, 3)
        saleStockName: form.name, // 매물명
        saleAddress: form.address, // 주소
        salePrice: totalPrice, // 총 분양가 (price1 + price2)
        scale: form.scale, // 규모
        applicationStartDate: form.startDate, // 청약 접수 시작일
        applicationEndDate: form.endDate, // 청약 접수 종료일
        announcementDate: form.recruitDate, // 당첨자 발표일
        company: form.builder, // 건설사
        contactInfo: form.contact, // 문의 연락처
        acquisitionTax: parseInt(removeComma(form.tax)), // 취득세
        saleSupplyArea: parseFloat(form.supplyArea), // 공급 면적
        saleExclusiveArea: parseFloat(form.exclusiveArea), // 전용 면적
        saleRoomCount: parseInt(form.rooms), // 방 개수
        saleBathroomCount: parseInt(form.baths), // 욕실 개수
        deposit, // 계약금
        middlePayment, // 중도금
        balancePayment, // 잔금
        regionNo: parseInt(regionNo), // 법정동 코드
        lat,
        lng,
      };

      // const fd = new FormData();
      // fd.append(
      //   "saleData",
      //   new Blob([JSON.stringify(saleData)], { type: "application/json" })
      // );
      // thumbnailImages.forEach((file) => fd.append("thumbnailImages", file));
      // floorImages.forEach((file) => fd.append("floorImages", file));
      //       const res = await axios.post(
      //   "http://localhost:8080/admin/addSale",
      //   fd,
      //   {
      //     withCredentials: true,
      //     headers: {
      //       "Content-Type": "multipart/form-data",
      //     },
      //   }
      // );

      /*
        JWT로 전환하면서 axiosAPI를 커스텀용으로 사용해야만 jwt가 동작할 수 있었음
        => axiosAPI.interceptors.request.use((config)에서 Authorization 헤더 자동 추가가 필요했기에 
        반드시 우리가 따로 만든 axiosAPI를 썼어야 했다

        그런데 커스텀 axiosAPI에서는 기본 헤더를 Content-Type: application/json으로 고정시켰음
        이로 인해 FormData(multipart/form-data) 요청시 헤더 충돌이 발생하여 415 에러가 났음

        문제 해결을 위해 두 가지 선택지가 있었음:
        가장 간단히 생각할 수 있는 방법은 axiosAPI에서 FormData 감지하여 Content-Type 자동 처리. 
        다만 커스텀으로 만든 axiosAPI를 따로 건들고 예외를 둘 경우 다른 파일에서도 또 달리 처리를 해줘야 했음
        대안) API를 JSON 전송과 파일 업로드 멀티파트 데이터 전송으로 분리

        설계상 분리가 더 깔끔하다고 판단하여 백엔드에서 json과 멀티파트를 분리하는 방식을 선택함.
        */
      const { data: saleStockNo } = await axiosAPI.post(
        "/admin/addSale",
        saleData, // 순수 JS 객체 => application/json타입
        { withCredentials: true }
      );

      // 2단계: 방금 받아온 saleStockNo 로 이미지만 multipart/form-data 전송
      const imgForm = new FormData();
      thumbnailImages.forEach((f) => imgForm.append("thumbnailImages", f));
      floorImages.forEach((f) => imgForm.append("floorImages", f));
      const res = await axiosAPI.post(
        `/admin/addSaleImg/${saleStockNo}`,
        imgForm,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
          /* headers: {
      Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_API_KEY}`, interceptor가 withCredentials=false 와 KakaoAK 헤더를 자동으로 붙여줌}, */
        }
      );
      if (res.status === 200) {
        alert("분양 매물이 등록되었습니다.");
        navigate("/admin/list_sale");
        setSubmitStatus("등록이 완료되었습니다.");
        setForm(initialState);
        setThumbnailImages([]);
        setFloorImages([]);
      } else {
        alert("등록에 실패했습니다. 다시 시도해주세요.");
        setSubmitStatus("등록에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      setSubmitStatus("서버 오류가 발생했습니다.");
    }
  };

  return (
    <form className="sale-register-form" onSubmit={handleSubmit}>
      {/* 기본정보 */}
      <section className="sale-form-section">
        <h2 className="sale-section-title">기본정보</h2>
        <div className="sale-form-row">
          <label className="sale-form-label required">매물형태</label>
          <div className="sale-radio-group">
            {["아파트", "빌라", "오피스텔"].map((v) => (
              <label key={v}>
                <input
                  type="radio"
                  name="type"
                  value={v}
                  checked={form.type === v}
                  onChange={handleRadio}
                />
                {v}
              </label>
            ))}
          </div>
        </div>
        <div className="sale-form-row">
          <label className="sale-form-label required">매물명</label>
          <input
            type="text"
            name="name"
            placeholder="매물명을 입력해주세요 (20글자)"
            className="sale-form-input"
            value={form.name}
            onChange={handleChange}
          />
        </div>
        <div className="sale-form-row">
          <label className="sale-form-label required">분양 상태</label>
          <div className="sale-radio-group">
            {["분양예정", "분양중", "분양완료"].map((v) => (
              <label key={v}>
                <input
                  type="radio"
                  name="status"
                  value={v}
                  checked={form.status === v}
                  onChange={handleRadio}
                />
                {v}
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* 상세정보 */}
      <section className="sale-form-section">
        <h2 className="sale-section-title">상세정보</h2>
        <div className="sale-form-row">
          <label className="sale-form-label required">분양주소</label>
          <div style={{ display: "flex", gap: "10px", flex: 1 }}>
            <input
              type="text"
              name="address"
              className="sale-form-input"
              placeholder="주소를 검색해주세요"
              value={form.address}
              readOnly
            />
            <button
              type="button"
              className="sale-adress-btn"
              onClick={handleAddressSearch}
            >
              주소 찾기
            </button>
          </div>
        </div>
        <div className="sale-form-row">
          <label className="sale-form-label">규모</label>
          <input
            type="text"
            name="scale"
            placeholder="규모를 입력해주세요 (30글자)"
            className="sale-form-input"
            value={form.scale}
            onChange={handleChange}
          />
        </div>
        <div className="sale-form-row">
          <label className="sale-form-label">청약 접수 시작일</label>
          <input
            type="date"
            name="startDate"
            placeholder="청약 접수 시작일을 입력해주세요"
            className="sale-form-input"
            value={form.startDate}
            onChange={handleChange}
          />
        </div>
        <div className="sale-form-row">
          <label className="sale-form-label">청약 접수 종료일</label>
          <input
            type="date"
            name="endDate"
            placeholder="청약 접수 종료일을 입력해주세요"
            className="sale-form-input"
            value={form.endDate}
            onChange={handleChange}
          />
        </div>
        <div className="sale-form-row">
          <label className="sale-form-label">당첨자 발표일</label>
          <input
            type="date"
            name="recruitDate"
            placeholder="입주자 모집일을 입력해주세요"
            className="sale-form-input"
            value={form.recruitDate}
            onChange={handleChange}
          />
        </div>
        <div className="sale-form-row">
          <label className="sale-form-label">건설사</label>
          <input
            type="text"
            name="builder"
            placeholder="건설사를 입력해주세요 (10글자)"
            className="sale-form-input"
            value={form.builder}
            onChange={handleChange}
          />
        </div>
        <div className="sale-form-row">
          <label className="sale-form-label required">분양문의 연락처</label>
          <input
            type="text"
            name="contact"
            placeholder="연락처를 입력해주세요"
            className="sale-form-input"
            value={form.contact}
            onChange={handleChange}
          />
        </div>
        <div className="sale-form-row">
          <label className="sale-form-label">취득세</label>
          <input
            type="text"
            name="tax"
            placeholder="취득세를 입력해주세요 (숫자만 입력해주세요)"
            className="sale-form-input"
            value={form.tax}
            onChange={handleChange}
          />
        </div>
      </section>

      {/* 평형정보 */}
      <section className="sale-form-section">
        <h2 className="sale-section-title">평형정보</h2>
        <div className="sale-form-row">
          <label className="sale-form-label required">공급면적</label>
          <input
            type="text"
            name="supplyArea"
            placeholder="공급면적을 입력해주세요 (숫자만 입력해주세요)"
            className="sale-form-input"
            value={form.supplyArea}
            onChange={handleChange}
          />
        </div>
        <div className="sale-form-row">
          <label className="sale-form-label required">전용면적</label>
          <input
            type="text"
            name="exclusiveArea"
            placeholder="전용면적을 입력해주세요 (숫자만 입력해주세요)"
            className="sale-form-input"
            value={form.exclusiveArea}
            onChange={handleChange}
          />
        </div>
        <div className="sale-form-row">
          <label className="sale-form-label">방 개수</label>
          <input
            type="text"
            name="rooms"
            placeholder="방 개수를 입력해주세요"
            className="sale-form-input"
            value={form.rooms}
            onChange={handleChange}
          />
        </div>
        <div className="sale-form-row">
          <label className="sale-form-label">욕실 수</label>
          <input
            type="text"
            name="baths"
            placeholder="욕실 개수를 입력해주세요"
            className="sale-form-input"
            value={form.baths}
            onChange={handleChange}
          />
        </div>
      </section>

      {/* 납입정보 */}
      <section className="sale-form-section">
        <h2 className="sale-section-title">납입정보</h2>
        <div className="sale-form-row">
          <label className="sale-form-label required">분양가</label>
          <div style={{ display: "flex", gap: "10px", flex: 1 }}>
            <input
              type="text"
              name="price1"
              placeholder="(단위: 억)"
              className="sale-form-input"
              value={form.price1}
              onChange={handleChange}
            />
            <input
              type="text"
              name="price2"
              placeholder="(단위: 만원)"
              className="sale-form-input"
              value={form.price2}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="sale-form-row">
          <label className="sale-form-label">계약금</label>
          <select
            name="contractRate"
            className="sale-form-input"
            value={form.contractRate}
            onChange={handleChange}
            style={{ flex: 1, marginRight: "10px" }}
          >
            <option value="">계약금 비율 선택</option>
            {[...Array(10)].map((_, i) => {
              const value = (i + 1) * 10;
              return (
                <option key={value} value={value}>
                  {value}%
                </option>
              );
            })}
          </select>
          <input
            type="text"
            name="contractAmount"
            className="sale-form-input"
            value={form.contractAmount}
            readOnly
            style={{ flex: 1 }}
          />
        </div>

        <div className="sale-form-row">
          <label className="sale-form-label">중도금</label>
          <select
            name="interimRate"
            className="sale-form-input"
            value={form.interimRate}
            onChange={handleChange}
            style={{ flex: 1, marginRight: "10px" }}
          >
            <option value="">중도금 비율 선택</option>
            {availableInterimRates.map((rate) => (
              <option key={rate} value={rate}>
                {rate}%
              </option>
            ))}
          </select>
          <input
            type="text"
            name="interimAmount"
            className="sale-form-input"
            value={form.interimAmount}
            readOnly
            style={{ flex: 1 }}
          />
        </div>

        <div className="sale-form-row">
          <label className="sale-form-label">잔금</label>
          <input
            type="text"
            name="balanceRate"
            className="sale-form-input"
            value={form.balanceRate}
            readOnly
            style={{ flex: 1, marginRight: "10px" }}
          />
          <input
            type="text"
            name="balanceAmount"
            className="sale-form-input"
            value={form.balanceAmount}
            readOnly
            style={{ flex: 1 }}
          />
        </div>
      </section>

      <div className="sale-form-row">
        <label className="sale-form-label required">썸네일 이미지</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleThumbnailChange}
        />
        <div className="sale-file-desc">
          * 썸네일 사진은 최대 1장, 5MB 까지 등록이 가능합니다.
        </div>
      </div>

      <div className="sale-form-row">
        <label className="sale-form-label required">평면도 이미지</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFloorChange}
        />
        <div className="sale-file-desc">
          * 평면도 사진은 최대 1장, 5MB 까지 등록이 가능합니다.
        </div>
      </div>

      <div className="sale-submit-row">
        <button type="submit" className="sale-submit-btn">
          등록하기
        </button>
        <button
          type="button"
          className="sale-cancel-btn"
          onClick={() => window.history.back()}
        >
          취소하기
        </button>
      </div>
    </form>
  );
};

export default AddSale;
