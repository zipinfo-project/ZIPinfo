import React, { useContext, useEffect, useState } from "react";
import "../../css/myPage/myInfo.css";
import { useLocation, useNavigate } from "react-router-dom";
import Menu from "./Menu";
import { axiosAPI } from "../../api/axiosApi";
import MemberLocationFilter from "../member/MemberLocationFilter";
import { CITY, TOWN } from "../common/Gonggong";
import { toast } from "react-toastify";
import { MemberContext } from "../member/MemberContext";

const UpdateInfo = () => {
  const nav = useNavigate();

  const { setMember } = useContext(MemberContext);

  const location = useLocation();
  const { user } = location.state || {}; // 안전하게 fallback 처리

  const [updateUser, setUpdateUser] = useState(user || {});

  const cityNo =
    user.memberLocation !== null
      ? parseInt(String(user.memberLocation).substring(0, 2))
      : null;
  const townNo = user.memberLocation !== null ? user.memberLocation : null;

  useEffect(() => {
    if (townNo && String(townNo).length === 5) {
      // 시군구(fullcode)까지 전달된 경우
      const town = TOWN.find((t) => t.fullcode === String(townNo));
      if (town) {
        setSelectedCity(town.code);
        setSelectedTown(town.fullcode);
      }
    } else if (cityNo && String(cityNo).length === 2) {
      // 시도만 전달된 경우
      setSelectedCity(Number(cityNo));
      setSelectedTown(-1); // 초기화
    }
  }, [cityNo, townNo]);

  const handleCityChange = (e) => {
    const location = e.target.value;
    setSelectedCity(location);
    setUpdateUser((prev) => ({
      ...prev,
      memberLocation: location,
    }));
    setSelectedTown(-1); // 시도 변경시 시군구 초기화
  };
  // 시군구 선택 핸들러
  const handleTownChange = (e) => {
    const location = e.target.value;
    setSelectedTown(location);
    setUpdateUser((prev) => ({
      ...prev,
      memberLocation: location,
    }));
  };

  const [selectedCity, setSelectedCity] = useState(
    cityNo == undefined ? -1 : cityNo
  ); // 선택된 시도 (e.target)
  const [selectedTown, setSelectedTown] = useState(
    townNo == undefined ? -1 : townNo
  ); // 선택된 시군구 (e.target)

  const memberAuth = user.memberAuth;

  const [infoCheck, setInfoCheck] = useState({
    nicknameCheck: true,
    likeLocationCheck: true,
    companyNameCheck: true,
    companyLocationCheck: true,
    presidentNameCheck: true,
    presidentPhoneCheck: true,
    brokerNoCheck: true,
  });

  const keyToLabel = {
    nicknameCheck: "닉네임",
    likeLocationCheck: "관심 지역",
    companyLocationCheck: "사무소 주소",
    companyNameCheck: "사무소 이름",
    presidentNameCheck: "대표명",
    presidentPhoneCheck: "대표 번호",
    brokerNoCheck: "중개등록번호",
  };

  const [testNickname, setTestNickname] =
    useState("한글,영어,숫자로만 2~8글자");

  const execDaumPostcode = () => {
    new window.daum.Postcode({
      oncomplete: (data) => {
        const addr =
          data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;
        setUpdateUser((prev) => ({
          ...prev,
          postcode: data.zonecode,
          address: addr,
        }));
        document.getElementsByName("detailAddress")[0].focus();
      },
    }).open();
  };

  const handleNickname = async (e) => {
    try {
      const { name, value } = e.target;

      setUpdateUser((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (value.trim().length === 0) {
        setTestNickname("한글,영어,숫자로만 2~8글자");
        setInfoCheck((prev) => ({
          ...prev,
          nicknameCheck: false,
        }));
        return;
      }

      const response = await axiosAPI.post("/myPage/checkNickname", {
        memberNickname: e.target.value,
      });

      if (response.status === 200) {
        if (response.data === 0) {
          setTestNickname("사용 가능한 닉네임입니다.");
          setInfoCheck((prev) => ({
            ...prev,
            nicknameCheck: true,
          }));
        } else {
          setTestNickname("일치하는 닉네임이 존재합니다.");
          setInfoCheck((prev) => ({
            ...prev,
            nicknameCheck: false,
          }));
        }
      }

      if (e.target.value.trim().length > 8) {
        setTestNickname("닉네임을 2글자 이상 8글자 이내로 작성해주세요");
        setInfoCheck((prev) => ({
          ...prev,
          nicknameCheck: false,
        }));
      }
    } catch (error) {}
  };

  const handleUserInfo = (e) => {
    const { name, value } = e.target;

    setUpdateUser((prev) => ({
      ...prev,
      [name]: value,
    }));

    switch (name) {
      case "companyName":
        value.trim().length <= 2 || value.trim().length >= 50
          ? setInfoCheck((prev) => ({
              ...prev,
              companyNameCheck: false,
            }))
          : setInfoCheck((prev) => ({
              ...prev,
              companyNameCheck: true,
            }));
        break;

      case "postcode":
        setUpdateUser((prev) => ({
          ...prev,
          companyLocation: [
            prev.postcode,
            prev.address,
            prev.detailAddress,
          ].join("^^^"),
        }));

        if (
          updateUser.companyLocation.trim().length <= 2 ||
          value.trim().length >= 50
        ) {
          setInfoCheck((prev) => ({
            ...prev,
            companyLocationCheck: false,
          }));
        } else {
          setInfoCheck((prev) => ({
            ...prev,
            companyLocationCheck: true,
          }));
        }
        break;

      case "address":
        setUpdateUser((prev) => ({
          ...prev,
          companyLocation: [
            prev.postcode,
            prev.address,
            prev.detailAddress,
          ].join("^^^"),
        }));

        if (
          updateUser.companyLocation.trim().length <= 2 ||
          value.trim().length >= 50
        ) {
          setInfoCheck((prev) => ({
            ...prev,
            companyLocationCheck: false,
          }));
        } else {
          setInfoCheck((prev) => ({
            ...prev,
            companyLocationCheck: true,
          }));
        }
        break;

      case "detailAddress":
        setUpdateUser((prev) => ({
          ...prev,
          companyLocation: [
            prev.postcode,
            prev.address,
            prev.detailAddress,
          ].join("^^^"),
        }));

        if (value.trim().length <= 2 || value.trim().length >= 30) {
          setInfoCheck((prev) => ({
            ...prev,
            companyLocationCheck: false,
          }));
        } else {
          setInfoCheck((prev) => ({
            ...prev,
            companyLocationCheck: true,
          }));
        }
        break;

      case "presidentName":
        value.trim().length <= 2 || value.trim().length >= 10
          ? setInfoCheck((prev) => ({
              ...prev,
              presidentNameCheck: false,
            }))
          : setInfoCheck((prev) => ({
              ...prev,
              presidentNameCheck: true,
            }));
        break;

      case "presidentPhone":
        value.trim().length <= 2 || value.trim().length >= 15
          ? setInfoCheck((prev) => ({
              ...prev,
              presidentPhoneCheck: false,
            }))
          : setInfoCheck((prev) => ({
              ...prev,
              presidentPhoneCheck: true,
            }));
        break;

      case "brokerNo":
        value.trim().length <= 2 || value.trim().length >= 20
          ? setInfoCheck((prev) => ({
              ...prev,
              brokerNoCheck: false,
            }))
          : setInfoCheck((prev) => ({
              ...prev,
              brokerNoCheck: true,
            }));
    }
  };

  async function updateInfo() {
    try {
      for (const [key, value] of Object.entries(infoCheck)) {
        if (!value) {
          const label = keyToLabel[key] || key;
          toast.error(
            <div>
              <div className="toast-error-title">오류 알림!</div>
              <div className="toast-error-body">
                {label} 값이 올바르지 않습니다.
              </div>
            </div>
          );
          return;
        }
      }

      const isConfirmed = window.confirm(
        "중개 관련 정보를 수정하였을 경우 권한이 임시변경됩니다. 수정하시겠습니까?"
      );
      if (!isConfirmed) {
        return;
      }

      const updatedData = {
        ...updateUser,
        companyLocation: [
          updateUser.postcode,
          updateUser.address,
          updateUser.detailAddress,
        ].join("^^^"),
        memberLocation:
          parseInt(selectedTown) === -1 && parseInt(selectedCity) === -1
            ? 0
            : parseInt(selectedTown) === -1
            ? selectedCity
            : selectedTown,
      };

      const response = await axiosAPI.post("/myPage/updateInfo", updatedData);

      if (response.status === 200) {
        setMember(updatedData);
        toast.success(
          <div>
            <div className="toast-success-title">수정 성공 알림!</div>
            <div className="toast-success-body">수정이 완료되었습니다.</div>
          </div>
        );
      }

      nav("/myPage");
    } catch (error) {
      toast.error(
        <div>
          <div className="toast-error-title">오류 알림!</div>
          <div className="toast-error-body">수정이 실패하였습니다.</div>
        </div>
      );
    }
  }

  const frag =
    memberAuth == 3 ? (
      <div className="my-page-profile-card">
        <div className="my-page-profile-info">
          {/* User ID */}
          <div className="my-page-info-field">
            <label className="my-page-info-label">아이디</label>
            <div className="my-page-info-value">{updateUser.memberEmail}</div>
          </div>

          {/* Nickname */}
          <div className="my-page-info-field">
            <label className="my-page-info-label">이름</label>
            <div className="my-page-info-value">{updateUser.memberName}</div>
          </div>

          {/* Additional Info */}
          <div className="my-page-info-field">
            <label className="my-page-info-label">닉네임</label>
            <input
              onChange={handleNickname}
              name="memberNickname"
              value={
                updateUser.memberNickname != null
                  ? updateUser.memberNickname
                  : "닉네임을 설정하지 않았습니다"
              }
              className="my-page-input"
            />
          </div>
          <span
            className={
              testNickname === "사용 가능한 닉네임입니다."
                ? "my-page-valid-msg"
                : testNickname === "일치하는 닉네임이 존재합니다." ||
                  testNickname ===
                    "닉네임을 2글자 이상 8글자 이내로 작성해주세요"
                ? "my-page-invalid-msg"
                : "my-page-default-msg"
            }
          >
            {testNickname}
          </span>

          <div className="my-page-info-field">
            <label className="my-page-info-label">선호 지역</label>
            <MemberLocationFilter
              selectedCity={selectedCity}
              selectedTown={selectedTown}
              onCityChange={handleCityChange}
              onTownChange={handleTownChange}
            />
          </div>

          {/* Phone */}
          <div className="my-page-info-field">
            <label className="my-page-info-label">사무소 이름</label>
            <input
              onChange={handleUserInfo}
              name="companyName"
              value={updateUser.companyName}
              className="my-page-input"
            />
          </div>

          {/* Address */}
          <div className="my-page-info-field">
            <label className="my-page-info-label">사무소 주소</label>
            <div className="my-page-address-wrap">
              <input
                id="postcode"
                onChange={handleUserInfo}
                name="postcode"
                value={updateUser.postcode}
                className="my-page-address-input"
                placeholder="우편번호"
                readOnly
              />
              <button
                type="button"
                id="searchAddress"
                className="my-page-address-btn"
                onClick={execDaumPostcode}
              >
                주소검색
              </button>
            </div>
            <input
              id="address"
              onChange={handleUserInfo}
              name="address"
              value={updateUser.address}
              className="my-page-address-input"
              placeholder="주소"
              readOnly
            />
            <input
              id="detailAddress"
              onChange={handleUserInfo}
              name="detailAddress"
              value={updateUser.detailAddress}
              className="my-page-address-input"
              placeholder="상세주소"
            />
          </div>

          {/* Description */}
          <div className="my-page-info-field">
            <label className="my-page-info-label">대표명</label>
            <input
              onChange={handleUserInfo}
              name="presidentName"
              value={updateUser.presidentName}
              className="my-page-input"
            />
          </div>

          {/* Interests */}
          <div className="my-page-info-field">
            <label className="my-page-info-label">대표 번호</label>
            <input
              onChange={handleUserInfo}
              name="presidentPhone"
              value={updateUser.presidentPhone}
              className="my-page-input"
            />
          </div>

          {/* Interests */}
          <div className="my-page-info-field">
            <label className="my-page-info-label">중개등록번호</label>
            <input
              onChange={handleUserInfo}
              name="brokerNo"
              value={updateUser.brokerNo}
              className="my-page-input"
            />
          </div>
        </div>

        {/* Edit Button */}
        <div className="my-page-edit-button-container">
          <button onClick={() => updateInfo()} className="my-page-edit-button">
            수정완료
          </button>
        </div>
      </div>
    ) : (
      // ------------------------------------------------------------------------------------------여기부터 삼항 뒷 부분
      <div className="my-page-profile-card">
        <div className="my-page-profile-info">
          {/* User ID */}
          <div className="my-page-info-field">
            <label className="my-page-info-label">아이디</label>
            <div className="my-page-info-value">{updateUser.memberEmail}</div>
          </div>

          {/* Nickname */}
          <div className="my-page-info-field">
            <label className="my-page-info-label">이름</label>
            <div className="my-page-info-value">{updateUser.memberName}</div>
          </div>

          {/* Additional Info */}
          <div className="my-page-info-field">
            <label className="my-page-info-label">닉네임</label>
            <input
              onChange={handleNickname}
              name="memberNickname"
              value={
                updateUser.memberNickname != null
                  ? updateUser.memberNickname
                  : "닉네임을 설정하지 않았습니다"
              }
              className="my-page-input"
            />
          </div>
          <span
            className={
              testNickname === "사용 가능한 닉네임입니다."
                ? "my-page-valid-msg"
                : testNickname === "일치하는 닉네임이 존재합니다." ||
                  testNickname ===
                    "닉네임을 2글자 이상 8글자 이내로 작성해주세요"
                ? "my-page-invalid-msg"
                : "my-page-default-msg"
            }
          >
            {testNickname}
          </span>

          <div className="my-page-info-field">
            <label className="my-page-info-label">선호 지역</label>
            <MemberLocationFilter
              selectedCity={selectedCity}
              selectedTown={selectedTown}
              onCityChange={handleCityChange}
              onTownChange={handleTownChange}
            />
          </div>

          {/* Edit Button */}
          <div className="my-page-edit-button-container">
            <button
              onClick={() => updateInfo()}
              className="my-page-edit-button"
            >
              수정완료
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="my-page-my-page">
      <div className="my-page-my-page-container">
        <Menu />
        {frag}
      </div>
    </div>
  );
};

export default UpdateInfo;
