import React, { useContext, useState } from "react";
import "../../css/myPage/withDraw.css";
import "../../css/myPage/menu.css";
import Menu from "./Menu";
import { useNavigate } from "react-router-dom";
import { axiosAPI } from "../../api/axiosApi";
import { MemberContext } from "../member/MemberContext";
import { toast } from "react-toastify";

export default function PasswordChange() {
  const nav = useNavigate();
  const { setMember } = useContext(MemberContext);

  /* 카카오 로그인 여부 */
  const kakaoKey = Object.keys(localStorage).find((k) =>
    k.startsWith("kakao_")
  );
  const isKakaoLogin = Boolean(kakaoKey);

  /* form & check */
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  const handleCheck = (e) => setAgreed(e.target.checked);
  const handlePass = (e) => setPassword(e.target.value);

  /* 탈퇴 */
  const handleWithdrawal = async () => {
    try {
      /* 약관 미동의 */
      if (!agreed) {
        toast.error("약관에 동의하세요.");
        return;
      }

      /* 일반 로그인일 때 비밀번호 검증 */
      if (!isKakaoLogin) {
        if (!password.trim()) {
          toast.error("비밀번호를 입력하세요.");
          return;
        }

        const { data: pwOK } = await axiosAPI.post("/myPage/checkPassword", {
          memberPw: password,
        });
        if (pwOK !== 1) {
          toast.error("비밀번호가 일치하지 않습니다.");
          setPassword("");
          return;
        }
      }

      /* 실제 탈퇴 – 엔드포인트 분기 */
      const url = isKakaoLogin ? "/oauth/kakaoWithdraw" : "/myPage/withDraw";
      const res = await axiosAPI.post(url);

      if (res.status === 200 || res.data === 1) {
        toast.success("회원 탈퇴가 완료되었습니다.");
        /* 클라이언트 상태 정리 */
        setMember(null);
        localStorage.removeItem("loginMember");
        localStorage.removeItem("accessToken");
        if (kakaoKey) localStorage.removeItem(kakaoKey);
        nav("/");
        return;
      }

      /* 기타 오류 */
      toast.error("탈퇴 처리 중 오류가 발생했습니다.");
    } catch (err) {
      console.error(err);
      toast.error("서버 통신 중 알 수 없는 오류가 발생했습니다.");
    }
  };

  /* ----------------------- JSX ----------------------- */
  return (
    <div className="my-page">
      <div className="my-page-container">
        <Menu />

        <div className="with-draw-container">
          {/* 비밀번호 입력(일반 로그인만) */}
          {!isKakaoLogin && (
            <div className="with-draw-password-section">
              <div className="with-draw-section-title">비밀번호</div>
              <input
                type="password"
                value={password}
                onChange={handlePass}
                className="with-draw-password-input"
                placeholder="비밀번호를 입력해주세요"
              />
            </div>
          )}

          {/* 카카오 안내(카카오 로그인만) */}
          {isKakaoLogin && (
            <div className="kakao-withdraw-info">
              카카오 로그인 계정은 비밀번호가 설정되어 있지 않습니다.
              <br />
              <strong>탈퇴 시 모든 계정 정보가 영구적으로 삭제됩니다.</strong>
            </div>
          )}

          {/* 약관 */}
          <div className="with-draw-work-section">
            <div className="with-draw-section-title">회원 탈퇴 약관</div>
            <div className="with-draw-work-intro">
              <div className="with-draw-work-item">
                회원은 언제든지 탈퇴를 요청할 수 있으며, 탈퇴 즉시 서비스 이용이
                중단됩니다.
              </div>
              <div className="with-draw-work-item">
                탈퇴 시 회원님의 개인정보는 관계 법령 및 개인정보처리방침에 따라
                일정 기간 후 안전하게 파기됩니다.
              </div>
              <div className="with-draw-work-item">
                회원 탈퇴 후 작성한 게시물 및 댓글은 삭제되지 않으며, 삭제를
                원하실 경우 반드시 사전에 별도 요청하셔야 합니다.
              </div>
              <div className="with-draw-work-item">
                탈퇴 시 보유 중인 포인트, 쿠폰, 구독 정보 등은 즉시 소멸되며,
                복구가 불가능합니다.
              </div>
              <div className="with-draw-work-item">
                탈퇴한 계정은 동일 이메일로 일정 기간 재가입이 제한될 수
                있습니다.
              </div>
              <div className="with-draw-work-item">
                탈퇴 후에는 기존 데이터 및 이용 기록(예: 구매내역, 작성글 등)에
                대한 열람이 불가능합니다.
              </div>
              <div className="with-draw-work-item">
                진행 중인 거래나 문의가 있는 경우, 해당 처리가 완료되기 전에는
                탈퇴가 제한될 수 있습니다.
              </div>
              <div className="with-draw-work-item">
                회원 탈퇴는 즉시 처리되며 철회가 불가능하므로 신중하게 결정해
                주시기 바랍니다.
              </div>
            </div>
          </div>

          {/* 동의 체크 */}
          <div className="with-draw-agreement-section">
            <label className="with-draw-agreement-item">
              <input
                type="checkbox"
                id="agree"
                checked={agreed}
                onChange={handleCheck}
              />
              <span className="withdraw-span">위 약관에 동의합니다</span>
            </label>
          </div>

          <button className="withdrawal-btn" onClick={handleWithdrawal}>
            탈퇴하기
          </button>
        </div>
      </div>
    </div>
  );
}
