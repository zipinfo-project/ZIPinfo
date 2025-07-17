import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MemberContext } from "../components/member/MemberContext";

const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
// const { memberStatus } = useContext(MemberContext);

export const axiosAPI = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

function pushToast() {
  toast.error("다른 PC의 로그인이 감지되어 로그아웃 되었습니다.");
}

axiosAPI.interceptors.request.use((config) => {
  //  카카오 API 요청은 바로 보내기
  if (config.url?.startsWith("https://dapi.kakao.com/")) {
    delete config.headers.Authorization;
    config.withCredentials = false;
    config.headers.Authorization = `KakaoAK ${KAKAO_REST_API_KEY}`;
    return config;
  }

  //  로그인 요청은 토큰 체크 없이 바로 보내기. 토큰이 없는상태에서 로그인요청을 보내는데 토큰이 없다고 거절하면 안되니까
  if (config.url?.includes("/login")) {
    return config;
  }

  // 그 외 요청은 토큰 체크
  const token = localStorage.getItem("accessToken");
  if (token) {
    try {
      const { exp } = jwtDecode(token);
      if (exp * 1000 < Date.now()) {
        window.dispatchEvent(new CustomEvent("forceLogout")); //강제 로그아웃 이벤트함수를 수행시켜 발생시킨다.
        delete config.headers.Authorization;

        return config;
      }
    } catch {
      window.dispatchEvent(new CustomEvent("forceLogout"));
      return Promise.reject(new Error("Invalid token"));
    }
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      (error.response.status === 401 || error.response.status === 403) &&
      error.response.data?.code === "TOKEN_MISMATCH"
    ) {
      window.dispatchEvent(new CustomEvent("forceLogouts"));
      pushToast();
    }
    return Promise.reject(error);
  }
);
