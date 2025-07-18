import { createContext, useEffect, useState, useContext } from "react";
import { AuthContext } from "../admin/AuthContext";
import { axiosAPI } from "../../api/axiosApi";
import { jwtDecode } from "jwt-decode";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const MemberContext = createContext();

export const MemberProvider = ({ children }) => {
  const navigate = useNavigate();

  // const [member]

  /* 1) 스토리지와 state 동기화 */
  const [member, setMember] = useState(() => {
    const raw = localStorage.getItem("loginMember");
    return raw && raw !== "undefined" ? JSON.parse(raw) : null;
  });

  // 2) AuthContext 의 user (토큰 디코딩 결과)
  const { user: authUser } = useContext(AuthContext);

  // 3) authUser 가 바뀔 때마다 member 동기화
  useEffect(() => {
    if (authUser) {
      setMember(authUser);
      localStorage.setItem("loginMember", JSON.stringify(authUser));
    }
  }, [authUser]);

  const token = localStorage.getItem("accessToken");
  const location = useLocation();
  const skipFetchNow =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/oauth2/kakao");

  useEffect(() => {
    if (!member && token) {
      try {
        const decoded = jwtDecode(token);
        // exp: 초 단위 UNIX timestamp
        if (decoded.exp * 1000 < Date.now()) {
          // 만료된 토큰
          localStorage.removeItem("accessToken");
          // navigate("/login");
          return;
        }
        setMember({
          memberNo: Number(decoded.sub),
          memberEmail: decoded.email,
          memberLogin: decoded.loginTp,
          memberAuth: decoded.auth,
        });
      } catch {
        /* 디코딩 실패 = 토큰 폐기 */
        localStorage.removeItem("accessToken");
      }
    }
  }, [token, member, navigate]);

  /* 3) 서버에서 새로운 정보를 한 번만 가져오기 */
  useEffect(() => {
    if (skipFetchNow || !token) return;
    axiosAPI
      .get("/member/getMember")
      .then(({ data }) => {
        if (data) {
          // data 가 null 이면 여기 안 들어옴 – 정상
          localStorage.setItem("loginMember", JSON.stringify(data));
          setMember(data);
        }
      })
      .catch(() => {
        /* 토큰이 죽었으면 정리 */
        localStorage.removeItem("accessToken");
        localStorage.removeItem("loginMember");
        setMember(null);
      });
  }, [skipFetchNow, token]);

  useEffect(() => {
    const handleForceLogout = () => {
      console.log("[MemberContext] forceLogout 이벤트 들어옴:", e.detail);
      console.log(
        "  → 현재 localStorage.accessToken =",
        localStorage.getItem("accessToken")
      );
      console.log(" 현재 state.member =", member);

      if (window.stompClient?.connected) window.stompClient.disconnect();
      toast.error("세션이 만료되어 로그아웃 됩니다.");
      localStorage.removeItem("loginMember");
      localStorage.removeItem("accessToken");
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key.startsWith("kakao_")) {
          localStorage.removeItem(key);
        }
      }
      setMember(null);
    };

    const handleForceLogouts = () => {
      if (window.stompClient?.connected) window.stompClient.disconnect();
      localStorage.removeItem("loginMember");
      localStorage.removeItem("accessToken");
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key.startsWith("kakao_")) {
          localStorage.removeItem(key);
        }
      }
      setMember(null);
    };

    window.addEventListener("forceLogout", handleForceLogout);
    window.addEventListener("forceLogouts", handleForceLogouts);
    return () => window.removeEventListener("forceLogout", handleForceLogout);
  }, [location.pathname, navigate]);

  return (
    <MemberContext.Provider value={{ member, setMember }}>
      {children}
    </MemberContext.Provider>
  );
};
