import React, { useEffect, useState } from "react";
import "../../css/myPage/myInfo.css";
import "../../css/myPage/menu.css";
import { useNavigate } from "react-router-dom";
import { axiosAPI } from "../../api/axiosAPI";
import Menu from "./Menu";
import { CITY, TOWN } from "../common/Gonggong";

const MyPage = () => {
  const nav = useNavigate();
  const [user, setUser] = useState([]);

  const getLocationName = (locationCode) => {
    if (!locationCode) return null;

    const codeStr = locationCode.toString();

    if (codeStr.length === 2) {
      const city = CITY.find((c) => String(c.code) === codeStr);
      return city ? city.name : null;
    }

    if (codeStr.length === 5) {
      const town = TOWN.find((t) => String(t.fullcode) === codeStr);
      const city = CITY.find((c) => String(c.code) === String(town?.code));
      return town && city ? `${city.name} ${town.name}` : null;
    }

    return null;
  };

  async function getMemberInfo() {
    try {
      const resp = await axiosAPI.get("/myPage/memberInfo", {
        withCredentials: true,
      });

      if (resp.status === 200) {
        setUser(resp.data);
      }
    } catch (error) {
      console.log("Member Info 불러오는 중 에러 발생 : ", error);
    }
  }

  const handleNav = () => {
    nav("/myPage/updateInfo", { state: { user } });
  };

  useEffect(() => {
    getMemberInfo();
  }, []);

  const memberAuth = user.memberAuth;

  const frag =
    memberAuth == 3 ? (
      <div className="my-page-profile-card">
        <div className="my-page-profile-info">
          {/* User ID */}
          <div className="my-page-info-field">
            <label className="my-page-info-label">아이디</label>
            <div className="my-page-info-value">{user.memberEmail}</div>
          </div>

          {/* Nickname */}
          <div className="my-page-info-field">
            <label className="my-page-info-label">이름</label>
            <div className="my-page-info-value">{user.memberName}</div>
          </div>

          {/* Additional Info */}
          <div className="my-page-info-field">
            <label className="my-page-info-label">닉네임</label>
            <div className="my-page-info-value">
              {user.memberNickname != null
                ? user.memberNickname
                : "닉네임을 설정하지 않았습니다"}
            </div>
          </div>

          <div className="my-page-info-field">
            <label className="my-page-info-label">선호 지역</label>
            <div className="my-page-info-value">
              {user.memberLocation !== 0
                ? getLocationName(user.memberLocation)
                : "선호지역을 설정하지 않았습니다."}
            </div>
          </div>

          {/* Phone */}
          <div className="my-page-info-field">
            <label className="my-page-info-label">사무소 이름</label>
            <div className="my-page-info-value">{user.companyName}</div>
          </div>

          {/* Address */}
          <div className="my-page-info-field">
            <label className="my-page-info-label">사무소 주소</label>
            <div className="my-page-info-value">{user.companyLocation}</div>
          </div>

          {/* Description */}
          <div className="my-page-info-field">
            <label className="my-page-info-label">대표명</label>
            <div className="my-page-info-value">{user.presidentName}</div>
          </div>

          {/* Interests */}
          <div className="my-page-info-field">
            <label className="my-page-info-label">대표 번호</label>
            <div className="my-page-info-value">{user.presidentPhone}</div>
          </div>

          {/* Interests */}
          <div className="my-page-info-field">
            <label className="my-page-info-label">중개등록번호</label>
            <div className="my-page-info-value">{user.brokerNo}</div>
          </div>
        </div>

        {/* Edit Button */}
        <div className="my-page-edit-button-container">
          <button onClick={handleNav} className="my-page-edit-button">
            수정
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
            <div className="my-page-info-value">{user.memberEmail}</div>
          </div>

          {/* Nickname */}
          <div className="my-page-info-field">
            <label className="my-page-info-label">이름</label>
            <div className="my-page-info-value">{user.memberName}</div>
          </div>

          {/* Additional Info */}
          <div className="my-page-info-field">
            <label className="my-page-info-label">닉네임</label>
            <div className="my-page-info-value">
              {user.memberNickname != null
                ? user.memberNickname
                : "닉네임을 설정하지 않았습니다"}
            </div>
          </div>

          <div className="my-page-info-field">
            <label className="my-page-info-label">선호 지역</label>
            <div className="my-page-info-value">
              {user.memberLocation !== 0
                ? getLocationName(user.memberLocation)
                : "선호지역을 설정하지 않았습니다."}
            </div>
          </div>

          {/* Edit Button */}
          <div className="my-page-edit-button-container">
            <button onClick={handleNav} className="my-page-edit-button">
              수정
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="my-page">
      <div className="my-page-container">
        <Menu />
        {frag}
      </div>
    </div>
  );
};

export default MyPage;
