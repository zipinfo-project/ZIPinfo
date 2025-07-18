import React, { memo, useContext, useEffect, useState } from "react";
import { axiosAPI } from "../../api/axiosApi";
import "../../css/member/MemberLogin.css";
import { MemberContext } from "../member/MemberContext";
import NaverCallback from "../auth/NaverCallback";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Kakao from "../../assets/kakao-talk-icon.svg";
import Naver from "../../assets/naver-icon.svg";

function openNaverPopup() {
  const url = new URL("https://nid.naver.com/oauth2.0/authorize");
  url.searchParams.set("response_type", "token"); //  백엔드가 accessToken을 받던 그대로
  url.searchParams.set("client_id", import.meta.env.VITE_NAVER_CLIENT_ID);
  url.searchParams.set("redirect_uri", import.meta.env.VITE_NAVER_CALLBACK_URI);
  url.searchParams.set("state", crypto.randomUUID());
  url.searchParams.set("auth_type", "reauthenticate"); // 자동로그인 차단
  return window.open(url.toString(), "naverLogin", "width=500,height=640");
}

export default function MemberLogin() {
  useEffect(() => {
    localStorage.removeItem("loginMember");
    localStorage.removeItem("com.naver.nid.access_token");
    localStorage.removeItem("com.naver.nid.oauth.state_token");
  }, []);
  const { VITE_KAKAO_REST_API_KEY, VITE_KAKAO_REDIRECT_URI } = import.meta.env;
  const navigate = useNavigate();

  const { setMember } = useContext(MemberContext);

  const [formData, setFormData] = useState({
    email: "", // 초기화용
    password: "", // 초기화용
    saveId: false,
  });

  const handleFindPassword = () => {
    navigate("/findPassword");
  };

  // 입력값 제어
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 그냥 로그인
  const handleSubmit = async (e) => {
    // 클라이언트 측 검증 추가
    if (!formData.email.trim()) {
      toast.error("이메일을 입력해주세요.");
      return;
    }

    if (formData.email.length > 50) {
      toast.error("이메일은 50자 이내로 입력해주세요.");
      return;
    }

    if (!formData.password.trim()) {
      toast.error("비밀번호를 입력해주세요.");
      return;
    }

    if (formData.password.length < 6 || formData.password.length > 20) {
      toast.error("비밀번호는 6~20자 사이로 입력해주세요.");
      return;
    }

    try {
      const resp = await axiosAPI.post("http://localhost:8080/member/login", {
        memberEmail: formData.email, //  DTO 필드명과 동일
        memberPw: formData.password,
      });

      // 200 OK
      const { loginMember, accessToken } = resp.data; // 백엔드가 돌려준 Member

      // 아이디 저장 check 후 localStorage를 뒤져보는 경우
      if (formData.saveId) {
        localStorage.setItem("saveId", formData.email);
      } else {
        localStorage.removeItem("saveId");
      }

      // 로그인 정보 저장
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("loginMember", JSON.stringify(loginMember));
      setMember(loginMember);

      if (loginMember.memberAuth == 2) {
        toast.error(`당신은 중개사 자격이 없는 중개자입니다. `);
      }

      navigate("/"); //router 사용하여 메인페이지로 이동
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("이메일 또는 비밀번호가 다릅니다.");
      } else {
        console.error(err);
        toast.error("로그인 중 오류가 발생했습니다.");
      }
    }
  };

  const handleSubmitEnter = async (e) => {
    if (e.key === "Enter") {
      // 클라이언트 측 검증 추가
      if (!formData.email.trim()) {
        toast.error("이메일을 입력해주세요.");
        return;
      }

      if (formData.email.length > 50) {
        toast.error("이메일은 50자 이내로 입력해주세요.");
        return;
      }

      if (!formData.password.trim()) {
        toast.error("비밀번호를 입력해주세요.");
        return;
      }

      if (formData.password.length < 6 || formData.password.length > 20) {
        toast.error("비밀번호는 6~20자 사이로 입력해주세요.");
        return;
      }

      try {
        const resp = await axiosAPI.post("http://localhost:8080/member/login", {
          memberEmail: formData.email, //  DTO 필드명과 동일
          memberPw: formData.password,
        });

        // 200 OK
        const { loginMember, accessToken } = resp.data; // 백엔드가 돌려준 Member

        // 아이디 저장 check 후 localStorage를 뒤져보는 경우
        if (formData.saveId) {
          localStorage.setItem("saveId", formData.email);
        } else {
          localStorage.removeItem("saveId");
        }

        // 로그인 정보 저장
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("loginMember", JSON.stringify(loginMember));
        setMember(loginMember);

        if (loginMember.memberAuth == 2) {
          toast.error(`당신은 중개사 자격이 없는 중개자입니다. `);
        }

        navigate("/"); //router 사용하여 메인페이지로 이동
      } catch (err) {
        if (
          err.response?.status === 401 &&
          err.response?.data?.msg === "WITHDRAW_14D"
        ) {
          toast.error("탈퇴 후 14일 동안은 재가입할 수 없습니다.");
          return; // 더 이상 처리 안함
        }

        if (err.response?.status === 401) {
          toast.error("이메일 또는 비밀번호가 다릅니다.");
        } else {
          console.error(err);
          toast.error("로그인 중 오류가 발생했습니다.");
        }
      }
    }
  };

  const KAKAO_AUTH_URL =
    `https://kauth.kakao.com/oauth/authorize` +
    `?response_type=code` +
    `&client_id=${VITE_KAKAO_REST_API_KEY}` +
    `&redirect_uri=${encodeURIComponent(VITE_KAKAO_REDIRECT_URI)}`;

  // 회원가입
  const handleSignUp = () => {
    navigate("/signUp"); //router 사용
  };

  // 카카오 로그인
  const handleKakaoLogin = () => {
    localStorage.removeItem("loginMember");
    localStorage.removeItem("accessToken");
    setMember(null);

    window.Kakao.Auth.loginForm({
      scope: "profile_nickname,account_email",
      success: async (authObj) => {
        try {
          const { data } = await axiosAPI.post("/oauth/kakao", {
            code: authObj.access_token,
          });
          const { loginMember, accessToken } = data; // 백엔드 응답 키와 동일
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("loginMember", JSON.stringify(loginMember));
          setMember(loginMember);
          navigate("/");
        } catch (err) {
          if (
            err.response?.status === 403 &&
            err.response?.data?.msg === "MEMBER_WITHDRAWN"
          ) {
            // console.log("탈퇴한 회원은 로그인할 수 없습니다.");
            alert("탈퇴한 회원은 로그인할 수 없습니다.");
            return;
          }
          console.error("카카오 로그인 처리 중 에러", err);
          toast.error("로그인 중 오류가 발생했습니다.");
        }
      },
      fail: (err) => {
        console.error("카카오 로그인 실패", err);
        toast.error("로그인에 실패했습니다.");
      },
    });
  };

  // 네이버 로그인
  const handleNaverLogin = () => {
    // (1) 초기화
    localStorage.removeItem("accessToken");
    localStorage.removeItem("loginMember");
    setMember(null);

    // (2) 팝업 메시지 리스너 (한 번만)
    const listener = (e) => {
      console.log("[NAVER LOGIN] message event:", e);
      if (e.origin !== window.location.origin) return;
      if (e.data?.type !== "NAVER_TOKEN") return;
      console.log("[MemberLogin] received NAVER_TOKEN:", e.data.accessToken);

      const { accessToken: naverToken } = e.data; // 팝업에서 넘어온 네이버 토큰
      axiosAPI
        .post("/oauth/naver", { accessToken: naverToken })
        .then((response) => {
          console.log("[NAVER LOGIN] response.data =", response.data);
          const { loginMember, accessToken } = response.data;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("loginMember", JSON.stringify(loginMember));
          setMember(loginMember);
          navigate("/");
        })
        .catch((err) => {
          console.error("네이버 로그인 중 오류", err);
          toast.error("네이버 로그인에 실패했습니다.");
        });
    };
    window.addEventListener("message", listener, { once: true });

    // (4) 팝업 띄우기
    const popup = openNaverPopup();
    if (!popup) {
      window.removeEventListener("message", listener);
      return;
    }

    // (5) 팝업이 닫히면 리스너도 제거
    const poll = setInterval(() => {
      if (popup.closed) {
        clearInterval(poll);
        window.removeEventListener("message", listener);
      }
    }, 500);
  };

  // 랜더링 될떄마다 저장된 ID 불러오기. 화면을 새로고침했을 때마다 새로운게 나오면 안되잖아.
  useEffect(() => {
    const saved = localStorage.getItem("saveId");
    if (saved) setFormData((p) => ({ ...p, email: saved, saveId: true }));
  }, []);

  // 이 아래부터는 html 문법을 따른다.
  return (
    <div className="login-container">
      <div className="login-form">
        <h1 className="login-title">로그인</h1>

        {/* 이메일 */}
        <div className="login-form-group">
          <label htmlFor="email">이메일</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="이메일을 입력해주세요"
            className="login-form-input"
            value={formData.email}
            onChange={handleChange}
            maxLength={50}
            required
          />
        </div>

        {/* 비밀번호 */}
        <div className="login-form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="비밀번호를 입력해주세요"
            className="login-form-input"
            value={formData.password}
            onChange={handleChange}
            onKeyDown={handleSubmitEnter}
            maxLength={20}
            required
          />
        </div>

        {/* 옵션/버튼 */}
        <div className="login-form-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="saveId"
              checked={formData.saveId}
              onChange={handleChange}
              className="checkbox-input"
            />
            <span className="checkbox-text">아이디 저장</span>
          </label>

          <button
            type="button"
            onClick={handleFindPassword}
            className="find-password-btn"
          >
            비밀번호 찾기
          </button>
        </div>

        <button onClick={handleSubmit} className="login-btn">
          로그인하기
        </button>

        {/* 카카오 간편 로그인 */}
        <button onClick={handleKakaoLogin} className="kakao-login-btn option5">
          <img src={Kakao} alt="카카오톡 아이콘" />
          <span>카카오로 간편하게 로그인하기</span>
        </button>

        {/* 네이버 간편 로그인 */}
        <button
          onClick={handleNaverLogin}
          className="naver-login-btn brand-color"
        >
          <img src={Naver} alt="네이버 아이콘" />
          <span>네이버로 간편하게 로그인하기</span>
        </button>

        {/* 회원가입 */}
        <div className="signup-link">
          아직 회원이 아니신가요?
          <button onClick={handleSignUp} className="signup-btn">
            회원 가입하기
          </button>
        </div>
      </div>
    </div>
  );
}
