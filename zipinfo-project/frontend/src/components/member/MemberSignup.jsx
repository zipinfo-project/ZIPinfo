import React, { useState, useEffect } from "react";
import { axiosAPI } from "../../api/axiosApi";
import "../../css/member/MemberSignup.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import MemberLocationFilter from "../member/MemberLocationFilter";
import { CITY, TOWN } from "../common/Gonggong";

export default function MemberSignUp() {
  const navigate = useNavigate();

  // 초기 폼 데이터
  const INITIAL_FORM = {
    // Member테이블
    memberEmail: "",
    authKey: "",
    memberPw: "",
    memberPwConfirm: "",
    memberName: "",
    memberNickname: "",
    // postcode: "", // 우편번호 (관심지역)
    // address: "", // 주소 (관심지역)
    // detailAddress: "", // 상세주소 (관심지역)
    cityNo: "",
    memberLocation: "",
    //////////////////////////////////////////////////////////////
    //

    // 중개사 전용 테이블
    companyName: "", // 중개사의 이름
    brokerNo: "", // 중개사 고유 번호
    presidentPhone: "", // 대표 전화번호

    companyPostcode: "", // 중개사 우편번호
    companyAddress: "", // 중개사 주소
    companyDetailAddress: "", // 중개사 상세주소
  };

  // 유효성 검사 상태
  const INITIAL_CHECK_OBJ = {
    memberEmail: false,
    authKey: false,
    memberPw: false,
    memberPwConfirm: false,
    memberNickname: false,
    brokerNo: false,
    presidentPhone: false, // 대표 전화번호 검사 추가
  };

  // 메시지 상태
  const INITIAL_MESSAGES = {
    emailMessage: "메일을 받을 수 있는 이메일을 입력해주세요.",
    authKeyMessage: "",
    pwMessage: "영어,숫자,특수문자(!,@,#,-,_) 6~20글자 사이로 입력해주세요.",
    pwMessageConfirm: "비밀번호를 다시 한번 입력해주세요.",
    nickMessage: "한글,영어,숫자로만 2~10글자",
    brokerNoMessage: "등록번호는 최소 9자리에서 최대 20자리 내로 입력해주세요",
    presidentPhoneMessage: "전화번호는 10-11자리 숫자로 입력해주세요", // 전화번호 메시지 추가
  };

  const [activeTab, setActiveTab] = useState("general"); // 일반 vs 중개자
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [checkObj, setCheckObj] = useState(INITIAL_CHECK_OBJ);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [messageClasses, setMessageClasses] = useState({});
  const { cityNo, memberLocation } = formData;

  // 타이머 관련 상태
  const [authTimer, setAuthTimer] = useState(null);
  const [min, setMin] = useState(5);
  const [sec, setSec] = useState(0);
  const initTime = "05:00";

  /* 마이페이지 수정 페이지에서 그대로 배껴온 부분 */

  useEffect(() => {
    if (memberLocation && String(memberLocation).length === 5) {
      // 시군구(fullcode)까지 전달된 경우
      const town = TOWN.find((t) => t.fullcode === String(memberLocation));
      if (town) {
        setSelectedCity(town.code);
        setSelectedTown(town.fullcode);
      }
    } else if (cityNo && String(cityNo).length === 2) {
      // 시도만 전달된 경우
      setSelectedCity(Number(cityNo));
      setSelectedTown(-1); // 초기화
    }
  }, [cityNo, memberLocation]);

  // 시도 선택핸들러
  const handleCityChange = (e) => {
    const location = e.target.value;
    setSelectedCity(location);
    setFormData((prev) => ({ ...prev, cityNo: location, memberLocation: "" }));

    setSelectedTown(-1); // 시도 변경시 시군구 초기화
  };
  // 시군구 선택 핸들러
  const handleTownChange = (e) => {
    const location = e.target.value;
    setSelectedTown(location);
    setFormData((prev) => ({ ...prev, memberLocation: location }));
  };

  const [selectedCity, setSelectedCity] = useState(
    cityNo == undefined ? -1 : cityNo
  ); // 선택된 시도 (e.target)
  const [selectedTown, setSelectedTown] = useState(
    memberLocation == undefined ? -1 : memberLocation
  ); // 선택된 시군구 (e.target)

  // 타이머 정리
  useEffect(() => {
    return () => {
      if (authTimer) {
        clearInterval(authTimer);
      }
    };
  }, [authTimer]);

  // 입력값 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // 각 필드별 유효성 검사 실행
    switch (name) {
      case "memberEmail":
        validateEmail(value);
        break;
      case "memberPw":
        validatePassword(value);
        break;
      case "memberPwConfirm":
        validatePasswordConfirm(value);
        break;
      case "memberNickname":
        validateNickname(value);
        break;
      case "brokerNo":
        validateBrokerNo(value);
        break;
      case "presidentPhone": // 대표 전화번호 검사 추가
        validatePresidentPhone(value);
        break;
      default:
        break;
    }
  };

  // 탭 전환 시 폼 초기화
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormData(INITIAL_FORM);
    setCheckObj(INITIAL_CHECK_OBJ);
    setMessages(INITIAL_MESSAGES);
    setMessageClasses({});

    // 타이머 정리
    if (authTimer) {
      clearInterval(authTimer);
      setAuthTimer(null);
    }
  };

  // 메시지 업데이트 헬퍼 함수
  const updateMessage = (field, message, className = "") => {
    setMessages((prev) => ({ ...prev, [field]: message }));
    setMessageClasses((prev) => ({ ...prev, [field]: className }));
  };

  // 체크 상태 업데이트 헬퍼 함수
  const updateCheckObj = (field, isValid) => {
    setCheckObj((prev) => ({ ...prev, [field]: isValid }));
  };

  // 이메일 유효성 검사
  const validateEmail = (inputEmail) => {
    // 이메일 인증 후 이메일이 변경된 경우
    updateCheckObj("authKey", false);
    updateMessage("authKeyMessage", "");
    if (authTimer) {
      clearInterval(authTimer);
      setAuthTimer(null);
    }

    // 입력된 이메일이 없을 경우
    if (inputEmail.trim().length === 0) {
      updateMessage(
        "emailMessage",
        "메일을 받을 수 있는 이메일을 입력해주세요.",
        ""
      );
      updateCheckObj("memberEmail", false);
      return;
    }
    if (inputEmail.length >= 50) {
      updateMessage(
        "emailMessage",
        "이메일은 50자 이내로 입력해주세요.",
        "error"
      );
      updateCheckObj("memberEmail", false);
      return;
    }

    // 정규식 검사
    const regExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!regExp.test(inputEmail)) {
      updateMessage(
        "emailMessage",
        "알맞은 이메일형식으로 작성해주세요.",
        "error"
      );
      updateCheckObj("memberEmail", false);
      return;
    }

    // 이메일 중복 검사
    axiosAPI
      .get(`/member/checkEmail?memberEmail=${inputEmail}`)
      .then((response) => {
        const count = response.data;
        if (count == 1) {
          updateMessage("emailMessage", "이미 사용중인 이메일 입니다", "error");
          updateCheckObj("memberEmail", false);
          return;
        }

        updateMessage("emailMessage", "사용가능한 이메일 입니다.", "confirm");
        updateCheckObj("memberEmail", true);
      })
      .catch((err) => console.log(err));
  };

  // 인증번호 받기
  const sendAuthKey = () => {
    updateCheckObj("authKey", false);
    updateMessage("authKeyMessage", "");

    if (!checkObj.memberEmail) {
      toast.error(
        <div>
          <div className="toast-error-title">오류 알림!</div>
          <div className="toast-error-body">
            유효한 이메일 작성 후 클릭해주세요.
          </div>
        </div>
      );
      return;
    }

    // 타이머 초기화
    setMin(5);
    setSec(0);

    // 이전 타이머 클리어
    if (authTimer) {
      clearInterval(authTimer);
    }

    // 인증번호 발송 요청
    axiosAPI
      .post("/email/emailSignup", formData.memberEmail, {
        headers: { "Content-Type": "text/plain" },
      })
      .then((response) => {
        const result = response.data;
        if (result == 1) {
          console.log("인증 번호 발송 성공");
        } else {
          console.log("인증 번호 발송 실패");
        }
      })
      .catch((err) => console.log(err));

    // 타이머 시작
    updateMessage("authKeyMessage", initTime, "");
    toast.success(
      <div>
        <div className="toast-success-title">인증번호 발송 알림!</div>
        <div className="toast-success-body">인증번호가 발송되었습니다.</div>
      </div>
    );

    let currentMin = 5;
    let currentSec = 0;

    const timer = setInterval(() => {
      // 직접 계산
      if (currentSec > 0) {
        currentSec--;
      } else {
        if (currentMin > 0) {
          currentSec = 59;
          currentMin--;
        } else {
          // 시간 종료
          updateCheckObj("authKey", false);
          clearInterval(timer);
          setAuthTimer(null);
          updateMessage(
            "authKeyMessage",
            "시간이 만료되었습니다. 다시 이메일을 보내주세요!",
            "error"
          );
          return;
        }
      }

      // 상태 업데이트
      setMin(currentMin);
      setSec(currentSec);

      // UI 업데이트
      const timeDisplay = `${addZero(currentMin)}:${addZero(currentSec)}`;
      updateMessage("authKeyMessage", timeDisplay, "");
    }, 1000);

    setAuthTimer(timer);
  };

  // 숫자 앞에 0 붙이기
  const addZero = (number) => {
    return number < 10 ? "0" + number : number;
  };

  // 인증번호 확인
  const checkAuthKey = () => {
    if (min === 0 && sec === 0) {
      toast.error(
        <div>
          <div className="toast-error-title">오류 알림!</div>
          <div className="toast-error-body">
            인증번호 입력 제한시간을 초과하였습니다. 다시 발급해주세요.
          </div>
        </div>
      );
      return;
    }

    if (formData.authKey.length < 6 || formData.authKey.length >= 7) {
      toast.error(
        <div>
          <div className="toast-error-title">오류 알림!</div>
          <div className="toast-error-body">
            인증번호를 정확히 입력해주세요.
          </div>
        </div>
      );
      return;
    }

    const obj = {
      email: formData.memberEmail,
      authKey: formData.authKey,
    };

    axiosAPI
      .post("/email/checkAuthKey", obj)
      .then((response) => {
        const result = response.data;
        if (result == 0) {
          toast.error(
            <div>
              <div className="toast-error-title">오류 알림!</div>
              <div className="toast-error-body">
                인증번호가 일치하지 않습니다.
              </div>
            </div>
          );
          updateCheckObj("authKey", false);
          return;
        }

        // 인증 성공
        if (authTimer) {
          clearInterval(authTimer);
          setAuthTimer(null);
        }
        updateMessage("authKeyMessage", "인증되었습니다", "confirm");
        updateCheckObj("authKey", true);
      })
      .catch((err) => console.log(err));
  };

  // 비밀번호 유효성 검사
  const validatePassword = (inputPw) => {
    if (inputPw.trim().length === 0) {
      updateMessage(
        "pwMessage",
        "영어,숫자,특수문자(!,@,#,-,_) 6~20글자 사이로 입력해주세요.",
        ""
      );
      updateCheckObj("memberPw", false);
      return;
    }

    const regExp = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#_-])[A-Za-z\d!@#_-]{6,20}$/;

    if (!regExp.test(inputPw)) {
      updateMessage("pwMessage", "비밀번호가 유효하지 않습니다.", "error");
      updateCheckObj("memberPw", false);
      return;
    }

    updateMessage("pwMessage", "유효한 비밀번호 형식입니다.", "confirm");
    updateCheckObj("memberPw", true);

    // 비밀번호 확인란에 값이 있으면 비교
    if (formData.memberPwConfirm.length > 0) {
      checkPw(inputPw, formData.memberPwConfirm);
    }
  };

  const validateBrokerNo = (inputBrokerNo) => {
    // 1) 빈 값 처리
    if (inputBrokerNo.trim().length === 0) {
      updateMessage(
        "brokerNoMessage",
        "등록번호는 최소 9자리에서 최대 20자리 내로 입력해주세요",
        ""
      );
      updateCheckObj("brokerNo", false);
      return;
    }

    // 2) 형식 검사
    const regExp = /\d{3,5}-\d{2,4}-\d{1,5}$/;
    if (!regExp.test(inputBrokerNo)) {
      updateMessage(
        "brokerNoMessage",
        "중개사 번호 형식이 올바르지 않습니다.",
        "error"
      );
      updateCheckObj("brokerNo", false);
      return;
    }

    // 3) 중복 검사 (실패 로그 확인용 catch 추가)
    axiosAPI
      .get("/member/checkBrokerNo", { params: { brokerNo: inputBrokerNo } })
      .then((response) => {
        const count = response.data;
        if (count === 1) {
          updateMessage(
            "brokerNoMessage",
            "이미 사용 중인 중개사 등록번호입니다.",
            "error"
          );
          updateCheckObj("brokerNo", false);
        } else {
          updateMessage(
            "brokerNoMessage",
            "사용 가능한 중개사 등록번호입니다.",
            "confirm"
          );
          updateCheckObj("brokerNo", true);
        }
      });
  };

  // 대표 전화번호 유효성 검사
  const validatePresidentPhone = (inputPhone) => {
    // 1) 빈 값 처리
    if (inputPhone.trim().length === 0) {
      updateMessage(
        "presidentPhoneMessage",
        "전화번호는 10-11자리 숫자로 입력해주세요",
        ""
      );
      updateCheckObj("presidentPhone", false);
      return;
    }

    // 2) 숫자만 입력 확인 및 길이 검사 (10-11자리)
    const regExp = /^[0-9]{10,11}$/;
    if (!regExp.test(inputPhone)) {
      updateMessage(
        "presidentPhoneMessage",
        "전화번호는 숫자만  입력해주세요",
        "error"
      );
      updateCheckObj("presidentPhone", false);
      return;
    }

    // 3) 전화번호 형식 검사 (010, 02, 031 등으로 시작)
    const phoneFormatRegExp =
      /^(010|02|031|032|033|041|042|043|044|051|052|053|054|055|061|062|063|064|070)[0-9]{7,8}$/;
    if (!phoneFormatRegExp.test(inputPhone)) {
      updateMessage(
        "presidentPhoneMessage",
        "올바른 전화번호 형식이 아닙니다",
        "error"
      );
      updateCheckObj("presidentPhone", false);
      return;
    }

    updateMessage("presidentPhoneMessage", "유효한 전화번호입니다.", "confirm");
    updateCheckObj("presidentPhone", true);
  };

  // 비밀번호 확인 유효성 검사
  const validatePasswordConfirm = (inputPwConfirm) => {
    if (checkObj.memberPw) {
      checkPw(formData.memberPw, inputPwConfirm);
    } else {
      updateCheckObj("memberPwConfirm", false);
    }
  };

  // 비밀번호 일치 검사
  // 비밀번호 일치 검사 함수 수정
  const checkPw = (pw, pwConfirm) => {
    if (pw === pwConfirm) {
      updateMessage("pwMessageConfirm", "비밀번호가 일치합니다.", "confirm");
      updateCheckObj("memberPwConfirm", true);
    } else {
      updateMessage(
        "pwMessageConfirm",
        "비밀번호가 일치하지 않습니다.",
        "error"
      );
      updateCheckObj("memberPwConfirm", false);
    }
  };

  // 닉네임 유효성 검사
  const validateNickname = (inputNickname) => {
    if (inputNickname.trim().length === 0) {
      updateMessage("nickMessage", "한글,영어,숫자로만 2~8글자", "");
      updateCheckObj("memberNickname", false);
      return;
    }

    if (inputNickname.length < 2 || inputNickname.length > 8) {
      updateMessage("nickMessage", "닉네임은 2~8글자로 입력해주세요.", "error");
      updateCheckObj("memberNickname", false);
      return;
    }

    const regExp = /^[가-힣\w\d]{2,8}$/;

    if (!regExp.test(inputNickname)) {
      updateMessage("nickMessage", "유효하지 않은 닉네임 형식입니다", "error");
      updateCheckObj("memberNickname", false);
      return;
    }

    // 이메일 중복 검사
    axiosAPI
      .get(`/member/checkNickname?memberNickname=${inputNickname}`)
      .then((response) => {
        const count = response.data;
        if (count == 1) {
          updateMessage("nickMessage", "중복된 닉네임이 있습니다.", "error");
          updateCheckObj("memberNickname", false);
          return;
        }

        updateMessage("nickMessage", "허용가능한 닉네임입니다.", "confirm");
        updateCheckObj("memberNickname", true);
      })
      .catch((err) => console.log(err));
  };

  // 관심지역 주소 API 호출 => 관심지역은 select로 하기로 한다

  // 중개사 주소 API 호출
  const execDaumPostcodeCompany = () => {
    new window.daum.Postcode({
      oncomplete: (data) => {
        const addr =
          data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;
        setFormData((prev) => ({
          ...prev,
          companyPostcode: data.zonecode,
          companyAddress: addr,
        }));
        document.getElementsByName("companyDetailAddress")[0].focus();
      },
    }).open();
  };

  // 폼 제출
  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      activeTab === "agent" &&
      formData.companyDetailAddress &&
      formData.companyDetailAddress.length > 20
    ) {
      toast.error("상세주소는 20자 이내로 입력해주세요.");
      document.querySelector('[name="companyDetailAddress"]')?.focus();
      return;
    }

    if (activeTab === "agent") {
      if (!formData.companyPostcode) {
        toast.error("우편번호를 검색해주세요.");
        return;
      }
      if (!formData.companyAddress) {
        toast.error("주소를 검색해주세요.");
        return;
      }
      if (!formData.companyDetailAddress) {
        toast.error("상세주소를 입력해주세요.");
        return;
      }
    }
    // 탭에 따라 검증할 필드 결정
    const requiredFields =
      activeTab === "general"
        ? [
            "memberEmail",
            "authKey",
            "memberPw",
            "memberPwConfirm",
            "memberNickname",
          ]
        : [
            "memberEmail",
            "authKey",
            "memberPw",
            "memberPwConfirm",
            "memberNickname",
            "brokerNo",
            "presidentPhone", // 중개사는 대표전화번호 필수
          ];

    // 필수 필드 유효성 검사
    for (let key of requiredFields) {
      if (!checkObj[key]) {
        let str;
        switch (key) {
          case "memberEmail":
            str = "이메일이 유효하지 않습니다.";
            break;
          case "authKey":
            str = "이메일이 인증되지 않았습니다.";
            break;
          case "memberPw":
            str = "비밀번호가 유효하지 않습니다.";
            break;
          case "memberPwConfirm":
            str = "비밀번호가 일치하지 않습니다.";
            break;
          case "memberNickname":
            str = "닉네임이 유효하지 않습니다.";
            break;
          case "brokerNo":
            str = "중개사 번호가 유효하지 않습니다.";
            break;
          case "presidentPhone":
            str = "대표 전화번호가 유효하지 않습니다.";
            break;
          default:
            str = "입력값을 확인해주세요.";
        }
        toast.error(
          <div>
            <div className="toast-error-title">오류 알림!</div>
            <div className="toast-error-body">{str}</div>
          </div>
        );
        document.querySelector(`[name="${key}"]`)?.focus();
        return;
      }
    }

    // 제출 데이터 준비
    const submitData = { ...formData };

    // 필요없는 필드 제거
    if (activeTab === "general") {
      delete submitData.companyName;
      delete submitData.brokerNo;
      delete submitData.presidentPhone; // 일반회원은 대표전화번호 제거
      delete submitData.companyPostcode;
      delete submitData.companyAddress;
      delete submitData.companyDetailAddress;
    }
    if (formData.memberName && formData.memberName.length >= 10) {
      toast.error(
        <div>
          <div className="toast-error-title">오류 알림!</div>
          <div className="toast-error-body">
            이름은 10자 이내로 입력해주세요.
          </div>
        </div>
      );
      document.querySelector('[name="memberName"]')?.focus();
      return;
    }
    if (formData.memberEmail && formData.memberEmail.length > 50) {
      toast.error("이메일은 50자 이내로 입력해주세요.");
      return;
    }
    if (formData.memberNickname && formData.memberNickname.length > 8) {
      toast.error("닉네임은 8자 이내로 입력해주세요.");
      return;
    }

    if (
      activeTab === "agent" &&
      formData.companyName &&
      formData.companyName.length > 50
    ) {
      toast.error(
        <div>
          <div className="toast-error-title">오류 알림!</div>
          <div className="toast-error-body">
            중개사명은 50자 이내로 입력해주세요.
          </div>
        </div>
      );
      document.querySelector('[name="companyName"]')?.focus();
      return;
    }
    // 서버로 전송
    const endpoint = "/member/signup";

    fetch(`http://localhost:8080${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submitData),
    })
      .then((resp) => resp.text())
      .then((result) => {
        if (result === "1" || result === "success") {
          toast.success(
            <div>
              <div className="toast-success-title">회원가입 성공 알림!</div>
              <div className="toast-success-body">
                회원가입이 완료되었습니다.
              </div>
            </div>
          );
          // 성공 시 네비게이트 처리
          navigate("/login");
        } else {
          toast.error(
            <div>
              <div className="toast-error-title">오류 알림!</div>
              <div className="toast-error-body">
                회원가입에 실패하였습니다. 다시 시도해주세요.
              </div>
            </div>
          );
        }
      });
  };

  return (
    <div className="signup-container">
      {activeTab === "general" ? (
        <h1 className="signup-title">회원가입</h1>
      ) : (
        <h1 className="signup-title">중개사 회원가입</h1>
      )}

      {/* Tab Navigation */}
      <div className="signup-tab-navigation">
        <button
          className={`signup-tab-button ${
            activeTab === "general" ? "active" : ""
          }`}
          onClick={() => handleTabChange("general")}
        >
          일반 회원가입
        </button>
        <button
          className={`signup-tab-button ${
            activeTab === "agent" ? "active" : ""
          }`}
          onClick={() => handleTabChange("agent")}
        >
          중개사 회원가입
        </button>
      </div>

      <form className="signup-form" onSubmit={handleSubmit}>
        {/* 이메일 + 인증번호 */}
        <div className="signup-form-group">
          <label className="signup-form-label">이메일</label>
          <div className="signup-input-wrapper">
            <input
              type="email"
              id="memberEmail"
              name="memberEmail"
              value={formData.memberEmail}
              onChange={handleInputChange}
              placeholder="이메일을 입력해 주세요"
              className="signup-form-input"
              maxLength={50}
              required
            />
            <button
              type="button"
              id="sendAuthKeyBtn"
              className="signup-verify-button"
              onClick={sendAuthKey}
            >
              인증받기
            </button>
          </div>
          <span className={`message ${messageClasses.emailMessage || ""}`}>
            {messages.emailMessage}
          </span>

          {/* 인증번호 입력 */}
          <div className="signup-auth-input-wrapper">
            <input
              type="text"
              id="authKey"
              name="authKey"
              value={formData.authKey}
              onChange={handleInputChange}
              placeholder="인증 번호를 입력해 주세요"
              className="signup-form-input"
              required
            />
            <button
              type="button"
              id="checkAuthKeyBtn"
              className="signup-verify-button"
              onClick={checkAuthKey}
            >
              인증확인
            </button>
          </div>
          <span className={`message ${messageClasses.authKeyMessage || ""}`}>
            {messages.authKeyMessage}
          </span>
        </div>

        {/* 비밀번호 */}
        <div className="signup-form-group">
          <label className="signup-form-label">비밀번호</label>
          <input
            type="password"
            id="memberPw"
            name="memberPw"
            value={formData.memberPw}
            onChange={handleInputChange}
            placeholder="영어+숫자+특수문자를 포함한 6자리 이상"
            className="signup-form-input"
            maxLength={20}
            required
          />
          <span className={`message ${messageClasses.pwMessage || ""}`}>
            {messages.pwMessage}
          </span>
        </div>

        {/* 비밀번호 확인 */}
        <div className="signup-form-group">
          <label className="signup-form-label">비밀번호 확인</label>
          <input
            type="password"
            id="memberPwConfirm"
            name="memberPwConfirm"
            value={formData.memberPwConfirm}
            onChange={handleInputChange}
            placeholder="비밀번호를 재입력해 주세요"
            className="signup-form-input"
            maxLength={20}
            required
          />
          <span className={`message ${messageClasses.pwMessageConfirm || ""}`}>
            {messages.pwMessageConfirm}
          </span>
        </div>

        <div className="signup-info-field">
          <label className="signup-info-label">선호 지역</label>
          <MemberLocationFilter
            selectedCity={selectedCity}
            selectedTown={selectedTown}
            onCityChange={handleCityChange}
            onTownChange={handleTownChange}
          />
        </div>

        {/* 공통: 이름 */}
        <div className="signup-form-group">
          <label className="signup-form-label">이름</label>
          <input
            type="text"
            id="memberName"
            name="memberName"
            value={formData.memberName}
            onChange={handleInputChange}
            placeholder="이름을 입력해 주세요"
            maxLength={10}
            className="signup-form-input"
          />
        </div>

        {/* 공통: 닉네임 */}
        <div className="signup-form-group">
          <label className="signup-form-label">닉네임</label>
          <input
            type="text"
            id="memberNickname"
            name="memberNickname"
            value={formData.memberNickname}
            onChange={handleInputChange}
            placeholder="닉네임을 입력해 주세요"
            maxLength={8}
            className="signup-form-input"
          />
          <span className={`message ${messageClasses.nickMessage || ""}`}>
            {messages.nickMessage}
          </span>
        </div>

        {/* 중개사 전용 필드들 */}
        {activeTab === "agent" && (
          <>
            {/* 중개사만: 중개사 회사 이름 */}
            <div className="signup-form-group">
              <label className="signup-form-label">중개사명</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="중개사명을 입력해 주세요"
                className="signup-form-input"
                maxLength={50}
                required
              />
            </div>

            {/* 중개사만: 중개등록번호 */}
            <div className="signup-form-group">
              <label className="signup-form-label">중개등록번호</label>
              <input
                type="text"
                id="brokerNo"
                name="brokerNo"
                value={formData.brokerNo}
                onChange={handleInputChange}
                placeholder="중개등록번호를 입력해 주세요"
                className="signup-form-input"
                required
              />
              <span
                className={`message ${messageClasses.brokerNoMessage || ""}`}
              >
                {messages.brokerNoMessage}
              </span>
            </div>

            {/* 중개사만: 대표번호 */}
            <div className="signup-form-group">
              <label className="signup-form-label">대표번호</label>
              <input
                type="tel"
                id="presidentPhone"
                name="presidentPhone"
                value={formData.presidentPhone}
                onChange={handleInputChange}
                placeholder="대표의 전화번호를 입력해 주세요(-없이 숫자만 입력)"
                className="signup-form-input"
                required
              />
              <span
                className={`message ${
                  messageClasses.presidentPhoneMessage || ""
                }`}
              >
                {messages.presidentPhoneMessage}
              </span>
            </div>

            {/* 중개사만: 중개사 주소 */}
            <div className="signup-form-group">
              <label className="signup-form-label">중개사 주소</label>
              <div className="signup-input-wrapper">
                <input
                  type="text"
                  id="companyPostcode"
                  name="companyPostcode"
                  value={formData.companyPostcode}
                  readOnly
                  className="signup-form-input"
                  placeholder="우편 번호"
                  required
                />
                <button
                  type="button"
                  className="signup-address-button"
                  onClick={execDaumPostcodeCompany}
                >
                  주소검색
                </button>
              </div>

              <input
                type="text"
                id="companyAddress"
                name="companyAddress"
                value={formData.companyAddress}
                readOnly
                className="signup-form-input signup-address-detail"
                placeholder="주소를 검색해 주세요"
              />
              <input
                type="text"
                id="companyDetailAddress"
                name="companyDetailAddress"
                value={formData.companyDetailAddress}
                onChange={handleInputChange}
                className="signup-form-input signup-address-detail"
                placeholder="상세 주소를 입력해 주세요"
              />
            </div>
          </>
        )}

        <button type="submit" className="signup-submit-button">
          가입하기
        </button>
      </form>
    </div>
  );
}
