import React, { useState } from "react";
import "../../css/myPage/updatePassword.css";
import "../../css/myPage/menu.css";
import Menu from "./Menu";
import { useNavigate } from "react-router-dom";
import { axiosAPI } from "../../api/axiosApi";
import { toast } from "react-toastify";

const PasswordChange = () => {
  const nav = useNavigate();

  const [testPass, setTestPass] = useState(
    "영어,숫자,특수문자(!,@,#,-,_) 6~20글자 사이로 입력해주세요."
  );

  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passState, setPassState] = useState(false);

  function validatePassword(password) {
    // 길이: 6~20글자
    if (password.length < 6 || password.length > 20) return false;

    // 영어 포함
    const hasLetter = /[a-zA-Z]/.test(password);
    // 숫자 포함
    const hasNumber = /[0-9]/.test(password);
    // 특수문자 포함 (지정된 것만)
    const hasSpecial = /[!@#\-_]/.test(password);

    return hasLetter && hasNumber && hasSpecial;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // 다음 상태를 미리 계산!
    const nextPassword = {
      ...password,
      [name]: value,
    };
    setPassword(nextPassword);

    // 새 비밀번호 유효성 검사
    if (name === "newPassword") {
      if (value.trim().length === 0) {
        setTestPass(
          "영어,숫자,특수문자(!,@,#,-,_) 6~20글자 사이로 입력해주세요."
        );
      } else if (validatePassword(value)) {
        setTestPass("사용 가능한 비밀번호입니다.");
        setPassState(true);
      } else {
        setTestPass("새 비밀번호가 옳바르지 않습니다.");
        setPassState(false);
      }
      // 추가: 확인값이 있고, newPassword와 다르면 불일치 경고도 같이 띄워줌
      if (
        nextPassword.confirmPassword.length > 0 &&
        value !== nextPassword.confirmPassword
      ) {
        setTestPass("새 비밀번호가 일치하지 않습니다.");
        setPassState(false);
      }
    }

    // 새 비밀번호 확인 검사
    if (name === "confirmPassword") {
      if (value !== nextPassword.newPassword) {
        setTestPass("새 비밀번호가 일치하지 않습니다.");
        setPassState(false);
      } else if (validatePassword(nextPassword.newPassword)) {
        setTestPass("사용 가능한 비밀번호입니다.");
        setPassState(true);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (password.newPassword !== password.confirmPassword) {
        toast.error(
          <div>
            <div className="toast-error-title">오류 알림!</div>
            <div className="toast-error-body">
              새 비밀번호가 일치하지 않습니다.
            </div>
          </div>
        );

        setPassword({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPassState(false);
        setTestPass(
          "영어,숫자,특수문자(!,@,#,-,_) 6~20글자 사이로 입력해주세요."
        );
        return;
      }

      if (!passState) {
        toast.error(
          <div>
            <div className="toast-error-title">오류 알림!</div>
            <div className="toast-error-body">
              변경할 비밀번호 형식이 옳바르지 않습니다.
            </div>
          </div>
        );
        setPassword({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPassState(false);
        setTestPass(
          "영어,숫자,특수문자(!,@,#,-,_) 6~20글자 사이로 입력해주세요."
        );
        return;
      }

      const response = await axiosAPI.post("/myPage/checkPassword", {
        memberPw: password.currentPassword,
      });

      if (response.status === 200 && response.data == 1) {
        const resp = await axiosAPI.post("/myPage/updatePassword", {
          memberPw: password.newPassword,
        });
        if (resp.status === 200) {
          toast.success(
            <div>
              <div className="toast-success-title">
                비밀번호 변경 성공 알림!
              </div>
              <div className="toast-success-body">
                비밀번호 변경이 완료되었습니다.
              </div>
            </div>
          );
          nav("/myPage");
        }
      } else {
        toast.error(
          <div>
            <div className="toast-error-title">오류 알림!</div>
            <div className="toast-error-body">
              현재 비밀번호가 일치하지 않습니다.
            </div>
          </div>
        );
        setPassword({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPassState(false);
        setTestPass(
          "영어,숫자,특수문자(!,@,#,-,_) 6~20글자 사이로 입력해주세요."
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="my-page">
      <div className="my-page-container">
        <Menu />

        {/* Password Change Form */}
        <div className="pass-password-form">
          <div className="pass-form-group">
            <label className="pass-form-label">기존 비밀번호</label>
            <input
              type="password"
              name="currentPassword"
              value={password.currentPassword}
              onChange={handleInputChange}
              placeholder="기존 비밀번호를 입력해주세요"
              className="pass-form-input"
            />
          </div>

          <div className="pass-form-group">
            <label className="pass-form-label">새 비밀번호</label>
            <input
              type="password"
              name="newPassword"
              value={password.newPassword}
              onChange={handleInputChange}
              placeholder="새 비밀번호를 입력해주세요"
              className="pass-form-inputs"
            />
          </div>
          <div className="pass-message-div">
            <span
              className={
                testPass === "사용 가능한 비밀번호입니다."
                  ? "pass-valid-msg"
                  : testPass === "기존 비밀번호와 동일합니다." ||
                    testPass === "새 비밀번호가 일치하지 않습니다." ||
                    testPass === "새 비밀번호가 옳바르지 않습니다."
                  ? "pass-invalid-msg"
                  : "pass-default-msg"
              }
            >
              {testPass}
            </span>
          </div>

          <div className="pass-form-group">
            <label className="pass-form-label">새 비밀번호 확인</label>
            <input
              type="password"
              name="confirmPassword"
              value={password.confirmPassword}
              onChange={handleInputChange}
              placeholder="새 비밀번호를 확인해주세요"
              className="pass-form-input"
            />
          </div>

          <button onClick={handleSubmit} className="pass-submit-button">
            변경하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordChange;
