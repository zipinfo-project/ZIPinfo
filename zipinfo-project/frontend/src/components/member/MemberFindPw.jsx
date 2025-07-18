import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../css/member/MemberFindPw.css";
import { axiosAPI } from "../../api/axiosApi";

export default function MemberFindPw() {
  const navigate = useNavigate();

  // 단계 관리 상태를 따로 만든다. (1 => 이메일 인증화면을 보여준다, 2 => 새로운 비밀번호 설정화면을 보여준다)
  const [step, setStep] = useState(1);

  // 이메일 인증 단계의 폼 데이터
  const [emailFormData, setEmailFormData] = useState({
    memberEmail: "",
    authKey: "",
  });

  // 비밀번호 설정 단계의 폼 데이터
  const [passwordFormData, setPasswordFormData] = useState({
    memberPw: "",
    memberPwConfirm: "",
  });

  // 이메일 인증 단계의 유효성 검사 상태
  const [emailCheckObj, setEmailCheckObj] = useState({
    memberEmail: false,
    authKey: false,
  });

  // 비밀번호 설정 단계의 유효성 검사 상태
  const [passwordCheckObj, setPasswordCheckObj] = useState({
    memberPw: false,
    memberPwConfirm: false,
  });

  // 이메일 인증 단계의 메시지 상태
  const [emailMessages, setEmailMessages] = useState({
    emailMessage: "가입하신 이메일을 입력해주세요.",
    authKeyMessage: "",
  });

  // 비밀번호 설정 단계의 메시지 상태
  const [passwordMessages, setPasswordMessages] = useState({
    pwMessage: "영어,숫자,특수문자(!,@,#,-,_) 6~20글자 사이로 입력해주세요.",
    pwMessageConfirm: "비밀번호를 다시 한번 입력해주세요.",
  });

  const [emailMessageClasses, setEmailMessageClasses] = useState({});
  const [passwordMessageClasses, setPasswordMessageClasses] = useState({});

  // 타이머 관련 상태
  const [authTimer, setAuthTimer] = useState(null);
  const [min, setMin] = useState(5);
  const [sec, setSec] = useState(0);
  const initTime = "05:00";

  // 타이머 정리
  useEffect(() => {
    return () => {
      if (authTimer) {
        clearInterval(authTimer);
      }
    };
  }, [authTimer]);

  // 이메일 메시지 업데이트 반영을 위한 함수
  const updateEmailMessage = (field, message, className = "") => {
    setEmailMessages((prev) => ({ ...prev, [field]: message }));
    setEmailMessageClasses((prev) => ({ ...prev, [field]: className }));
  };

  // 비밀번호 메시지 업데이트 반영을 위한 함수
  const updatePasswordMessage = (field, message, className = "") => {
    setPasswordMessages((prev) => ({ ...prev, [field]: message }));
    setPasswordMessageClasses((prev) => ({ ...prev, [field]: className }));
  };

  // 이메일 체크 상태 업데이트 반영을 위한 함수
  const updateEmailCheckObj = (field, isValid) => {
    setEmailCheckObj((prev) => ({ ...prev, [field]: isValid }));
  };

  // 비밀번호 체크 상태 업데이트 반영을 위한 함수
  const updatePasswordCheckObj = (field, isValid) => {
    setPasswordCheckObj((prev) => ({ ...prev, [field]: isValid }));
  };

  // 이메일 인증 단계 입력값 변경 핸들러
  const handleEmailInputChange = (e) => {
    const { name, value } = e.target;
    setEmailFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "memberEmail") {
      validateEmail(value);
    }
  };

  // 비밀번호 설정 단계 입력값 변경 핸들러
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "memberPw") {
      validatePassword(value);
    } else if (name === "memberPwConfirm") {
      validatePasswordConfirm(value);
    }
  };

  // 이메일 유효성 검사
  const validateEmail = (inputEmail) => {
    // 이메일 인증 후 이메일이 변경된 경우
    updateEmailCheckObj("authKey", false);
    updateEmailMessage("authKeyMessage", "");
    if (authTimer) {
      clearInterval(authTimer);
      setAuthTimer(null);
    }

    // 입력된 이메일이 없을 경우
    if (inputEmail.trim().length === 0) {
      updateEmailMessage("emailMessage", "가입하신 이메일을 입력해주세요.", "");
      updateEmailCheckObj("memberEmail", false);
      return;
    }
    if (inputEmail.length > 50) {
      updateEmailMessage(
        "emailMessage",
        "이메일은 50자 이내로 입력해주세요.",
        "error"
      );
      updateEmailCheckObj("memberEmail", false);
      return;
    }
    // 정규식 검사
    const regExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!regExp.test(inputEmail)) {
      updateEmailMessage(
        "emailMessage",
        "알맞은 이메일형식으로 작성해주세요.",
        "error"
      );
      updateEmailCheckObj("memberEmail", false);
      return;
    }

    // 이메일 존재 확인
    axiosAPI
      .get(`/member/checkEmail?memberEmail=${inputEmail}`)
      .then((response) => {
        const count = response.data;
        if (count === 0) {
          updateEmailMessage(
            "emailMessage",
            "등록되지 않은 이메일입니다.",
            "error"
          );
          updateEmailCheckObj("memberEmail", false);
          return;
        }

        updateEmailMessage("emailMessage", "확인된 이메일입니다.", "confirm");
        updateEmailCheckObj("memberEmail", true);
      })
      .catch((err) => {
        console.log(err);
        updateEmailMessage(
          "emailMessage",
          "이메일 확인 중 오류가 발생했습니다.",
          "error"
        );
        updateEmailCheckObj("memberEmail", false);
      });
  };

  // 비밀번호 유효성 검사
  const validatePassword = (inputPw) => {
    if (inputPw.trim().length === 0) {
      updatePasswordMessage(
        "pwMessage",
        "영어,숫자,특수문자(!,@,#,-,_) 6~20글자 사이로 입력해주세요.",
        ""
      );
      updatePasswordCheckObj("memberPw", false);
      return;
    }
    if (inputPw.length < 6 || inputPw.length > 20) {
      updatePasswordMessage(
        "pwMessage",
        "비밀번호는 6~20자 사이로 입력해주세요.",
        "error"
      );
      updatePasswordCheckObj("memberPw", false);
      return;
    }

    const regExp = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#_-])[A-Za-z\d!@#_-]{6,20}$/;

    if (!regExp.test(inputPw)) {
      updatePasswordMessage(
        "pwMessage",
        "비밀번호가 유효하지 않습니다.",
        "error"
      );
      updatePasswordCheckObj("memberPw", false);
      return;
    }

    updatePasswordMessage(
      "pwMessage",
      "유효한 비밀번호 형식입니다.",
      "confirm"
    );
    updatePasswordCheckObj("memberPw", true);

    // 비밀번호 확인란에 값이 있으면 비교
    if (passwordFormData.memberPwConfirm.length > 0) {
      checkPw(inputPw, passwordFormData.memberPwConfirm);
    }
  };

  // 비밀번호 확인 유효성 검사
  const validatePasswordConfirm = (inputPwConfirm) => {
    if (passwordCheckObj.memberPw) {
      checkPw(passwordFormData.memberPw, inputPwConfirm);
    } else {
      updatePasswordCheckObj("memberPwConfirm", false);
    }
  };

  // 비밀번호 일치 검사
  const checkPw = (pw, pwConfirm) => {
    if (pw === pwConfirm) {
      updatePasswordMessage(
        "pwMessageConfirm",
        "비밀번호가 일치합니다.",
        "confirm"
      );
      updatePasswordCheckObj("memberPwConfirm", true);
    } else {
      updatePasswordMessage(
        "pwMessageConfirm",
        "비밀번호가 일치하지 않습니다.",
        "error"
      );
      updatePasswordCheckObj("memberPwConfirm", false);
    }
  };

  // 숫자 앞에 0 붙이기
  const addZero = (number) => {
    return number < 10 ? "0" + number : number;
  };

  // 인증번호 받기
  const sendAuthKey = () => {
    updateEmailCheckObj("authKey", false);
    updateEmailMessage("authKeyMessage", "");

    if (!emailCheckObj.memberEmail) {
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
      .post("/email/findPwEmail", {
        memberEmail: emailFormData.memberEmail,
      })
      .then((response) => {
        console.log("비밀번호 찾기 인증번호 발송 성공");

        // 타이머 시작
        updateEmailMessage("authKeyMessage", initTime, "");
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
              updateEmailCheckObj("authKey", false);
              clearInterval(timer);
              setAuthTimer(null);
              updateEmailMessage(
                "authKeyMessage",
                "시간이 만료되었습니다. 다시 인증번호를 요청해주세요!",
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
          updateEmailMessage("authKeyMessage", timeDisplay, "");
        }, 1000);

        setAuthTimer(timer);
      })
      .catch((err) => {
        console.log(err);
        if (err.response?.status === 404) {
          toast.error(
            <div>
              <div className="toast-error-title">오류 알림!</div>
              <div className="toast-error-body">
                등록되지 않은 이메일입니다.
              </div>
            </div>
          );
        } else {
          toast.error(
            <div>
              <div className="toast-error-title">오류 알림!</div>
              <div className="toast-error-body">
                인증번호 발송에 실패했습니다.
              </div>
            </div>
          );
        }
      });
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

    if (emailFormData.authKey.length < 6 || emailFormData.authKey.length >= 7) {
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
      memberEmail: emailFormData.memberEmail,
      authKey: emailFormData.authKey,
    };

    axiosAPI
      .post("/email/checkFindPwAuthKey", obj)
      .then((response) => {
        const result = response.data;
        if (result === 0) {
          toast.error(
            <div>
              <div className="toast-error-title">오류 알림!</div>
              <div className="toast-error-body">
                인증번호가 일치하지 않습니다.
              </div>
            </div>
          );
          updateEmailCheckObj("authKey", false);
          return;
        }

        // 인증 성공
        if (authTimer) {
          clearInterval(authTimer);
          setAuthTimer(null);
        }
        updateEmailMessage("authKeyMessage", "인증되었습니다", "confirm");
        updateEmailCheckObj("authKey", true);
      })
      .catch((err) => {
        console.log(err);
        toast.error(
          <div>
            <div className="toast-error-title">오류 알림!</div>
            <div className="toast-error-body">
              인증번호 확인에 실패했습니다.
            </div>
          </div>
        );
      });
  };

  // 다음 단계로 이동 (비밀번호 설정 단계로)
  const handleNext = () => {
    if (!emailCheckObj.memberEmail) {
      toast.error(
        <div>
          <div className="toast-error-title">오류 알림!</div>
          <div className="toast-error-body">유효한 이메일을 입력해주세요.</div>
        </div>
      );
      return;
    }

    if (!emailCheckObj.authKey) {
      toast.error(
        <div>
          <div className="toast-error-title">오류 알림!</div>
          <div className="toast-error-body">이메일 인증을 완료해주세요.</div>
        </div>
      );
      return;
    }

    // 비밀번호 설정 단계로 이동
    setStep(2);
  };

  // 비밀번호 변경 제출
  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!passwordCheckObj.memberPw) {
      toast.error(
        <div>
          <div className="toast-error-title">오류 알림!</div>
          <div className="toast-error-body">비밀번호가 유효하지 않습니다.</div>
        </div>
      );
      document.querySelector('[name="memberPw"]')?.focus();
      return;
    }

    if (!passwordCheckObj.memberPwConfirm) {
      toast.error(
        <div>
          <div className="toast-error-title">오류 알림!</div>
          <div className="toast-error-body">비밀번호가 일치하지 않습니다.</div>
        </div>
      );
      document.querySelector('[name="memberPwConfirm"]')?.focus();
      return;
    }

    // 비밀번호 변경 API 호출
    const submitData = {
      memberEmail: emailFormData.memberEmail,
      memberPw: passwordFormData.memberPw,
    };

    axiosAPI
      .post("/member/setPw", submitData)
      .then((response) => {
        const result = response.data;
        if (result === "1" || result === 1) {
          toast.success(
            <div>
              <div className="toast-success-title">성공 알림!</div>
              <div className="toast-success-body">
                새 비밀번호가 설정되었습니다. 로그인해주세요.
              </div>
            </div>
          );
          navigate("/login");
        } else {
          toast.error(
            <div>
              <div className="toast-error-title">오류 알림!</div>
              <div className="toast-error-body">
                비밀번호 변경에 실패했습니다. 다시 시도해주세요.
              </div>
            </div>
          );
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error(
          <div>
            <div className="toast-error-title">오류 알림!</div>
            <div className="toast-error-body">
              비밀번호 변경 중 오류가 발생했습니다.
            </div>
          </div>
        );
      });
  };

  // 이전 단계로 돌아가기
  const handleBack = () => {
    setStep(1);
  };

  // 이메일 인증 단계 렌더링
  const renderEmailStep = () => (
    <div className="find-pw-container">
      <h1 className="find-pw-title">비밀번호 찾기</h1>

      <div className="find-pw-form">
        <div className="find-pw-form-group">
          <label className="find-pw-form-label">이메일</label>
          <div className="find-pw-input-wrapper">
            <input
              type="email"
              id="memberEmail"
              name="memberEmail"
              value={emailFormData.memberEmail}
              onChange={handleEmailInputChange}
              placeholder="가입하신 이메일을 입력해주세요"
              maxLength={50}
              className="find-pw-form-input"
              required
            />
            <button
              type="button"
              className="find-pw-verify-button"
              onClick={sendAuthKey}
            >
              인증받기
            </button>
          </div>
          <span
            className={`find-pw-message ${
              emailMessageClasses.emailMessage || ""
            }`}
          >
            {emailMessages.emailMessage}
          </span>

          <div className="find-pw-input-wrapper">
            <input
              type="text"
              id="authKey"
              name="authKey"
              value={emailFormData.authKey}
              onChange={handleEmailInputChange}
              placeholder="인증번호를 입력해주세요"
              className="find-pw-form-input"
              required
            />
            <button
              type="button"
              className="find-pw-verify-button"
              onClick={checkAuthKey}
            >
              인증확인
            </button>
          </div>
          <span
            className={`find-pw-message ${
              emailMessageClasses.authKeyMessage || ""
            }`}
          >
            {emailMessages.authKeyMessage}
          </span>
        </div>

        <button
          type="button"
          className="find-pw-submit-button"
          onClick={handleNext}
        >
          다음 단계
        </button>

        <div className="find-pw-back-to-login">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="find-pw-back-btn"
          >
            로그인으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );

  // 비밀번호 설정 단계 렌더링
  const renderPasswordStep = () => (
    <div className="find-pw-container">
      <h1 className="find-pw-title">새 비밀번호 설정</h1>

      <div className="find-pw-email-info-box">
        <p className="find-pw-email-info">
          <strong>{emailFormData.memberEmail}</strong>님의 비밀번호를 새로
          설정합니다.
        </p>
      </div>

      <form className="find-pw-form" onSubmit={handlePasswordSubmit}>
        <div className="find-pw-form-group">
          <label className="find-pw-form-label">새 비밀번호</label>
          <input
            type="password"
            id="memberPw"
            name="memberPw"
            value={passwordFormData.memberPw}
            onChange={handlePasswordInputChange}
            placeholder="새 비밀번호를 입력해주세요"
            className="find-pw-form-input"
            maxLength={20}
            required
          />
          <span
            className={`find-pw-message ${
              passwordMessageClasses.pwMessage || ""
            }`}
          >
            {passwordMessages.pwMessage}
          </span>
        </div>

        <div className="find-pw-form-group">
          <label className="find-pw-form-label">새 비밀번호 확인</label>
          <input
            type="password"
            id="memberPwConfirm"
            name="memberPwConfirm"
            value={passwordFormData.memberPwConfirm}
            onChange={handlePasswordInputChange}
            placeholder="새 비밀번호를 다시 입력해주세요"
            className="find-pw-form-input"
            maxLength={20}
            required
          />
          <span
            className={`find-pw-message ${
              passwordMessageClasses.pwMessageConfirm || ""
            }`}
          >
            {passwordMessages.pwMessageConfirm}
          </span>
        </div>

        <button type="submit" className="find-pw-submit-button">
          비밀번호 변경하기
        </button>

        <div className="find-pw-back-to-login">
          <button
            type="button"
            onClick={handleBack}
            className="find-pw-back-btn"
          >
            이전 단계
          </button>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="find-pw-back-btn"
          >
            로그인으로 돌아가기
          </button>
        </div>
      </form>
    </div>
  );

  return <>{step === 1 ? renderEmailStep() : renderPasswordStep()}</>;
}
