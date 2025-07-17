// src/App.jsx
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import Layout from "./components/common/Layout";
import React, { useEffect, useContext, useRef } from "react";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import BlockAdmin from "./BlockAdmin";

import Main from "./components/Main";
import SalePage from "./components/sale/SalePage";
import { CITY, TOWN } from "./components/common/Gonggong";
import MemberFindPw from "./components/member/MemberFindPw";
import "./App.css";
import Modal from "react-modal";

//import StockPageCopy from "./components/stock/StockPageCopy"; // ContextProvider 생성하는 방향으로 리팩토링 중!
//import { StockProvider } from "./components/stock/StockContext";
import StockProviderWrapper from "./components/stock/StockProviderWrapper";
import SaleProviderWrapper from "./components/sale/SaleProviderWrapper";

import MyInfo from "./components/myPage/MyInfo";
import MyStock from "./components/myPage/MyStock";
import UpdateMyStock from "./components/myPage/UpdateMyStock";
import AddStock from "./components/myPage/AddStock";
import SawStock from "./components/myPage/SawStock";
import LikeStock from "./components/myPage/LikeStock";
import MyMessage from "./components/myPage/MyMessage";
import SeeMyMessage from "./components/myPage/SeeMyMessage";
import DetailMessage from "./components/myPage/DetailMessage";
import MyPost from "./components/myPage/MyPost";
import UpdatePassword from "./components/myPage/UpdatePassword";
import WithDraw from "./components/myPage/WithDraw";
import UpdateInfo from "./components/myPage/UpdateInfo";

import MemberLogin from "./components/member/MemberLogin";
import MemberSignup from "./components/member/MemberSignup";
import {
  MemberProvider,
  MemberContext,
} from "./components/member/MemberContext";
import LoginHandler from "./components/member/MemberLogin";

import AddSale from "./components/admin/saleForm/AddSale";
import ListSale from "./components/admin/saleForm/ListSale";
import UpdateSale from "./components/admin/saleForm/UpdateSale";
import DashBoard from "./components/admin/DashBoard";
import Chart from "./components/admin/Chart";
import Advertisement from "./components/admin/Advertisement";
import HelpMessage from "./components/admin/HelpMessage/HelpMessage";
import Reply from "./components/admin/HelpMessage/Reply";
import Management from "./components/admin/Management/Management";
import { AuthProvider } from "./components/admin/AuthContext";

import Announce from "./components/announce/Announce";
import AnnounceDetail from "./components/announce/AnnounceDetail";
import AnnounceWrite from "./components/announce/AnnounceWrite";

import NeighborhoodBoard from "./components/neighborhood/NeighborhoodBoard";
import NeighborhoodDetail from "./components/neighborhood/NeighborhoodBoardDetail";

import Gonggong from "./components/common/Gonggong";
import NaverCallback from "./components/auth/NaverCallback";
import NeighborhoodEdit from "./components/neighborhood/NeighborhoodEdit";

import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { ToastContainer, toast } from "react-toastify";
import TermsOfService from "./components/common/TermsOfService";
import PrivacyPolicy from "./components/common/PrivacyPolicy";
import CustomerService from "./components/common/CustomerService";
import ScrollToTop from "./components/common/ScrollToTop";
import { getLocationName } from "./components/common/getLocationName";

Modal.setAppElement("#root");

function MessageListener() {
  const { setMember } = useContext(MemberContext);
  const navigate = useNavigate();

  useEffect(() => {
    const onMessage = (e) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "KAKAO_LOGIN_SUCCESS") {
        const member = e.data.member;
        localStorage.setItem("loginMember", JSON.stringify(member));
        setMember(member);
        navigate("/");
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [setMember, navigate]);

  return null;
}

function GlobalWebSocketListener() {
  const stompClientRef = useRef(null);
  const subscriptions = useRef([]);
  const connectedRef = useRef(false);
  const { member } = useContext(MemberContext);

  const memberLocation = member?.memberLocation;
  const memberCity = String(memberLocation)?.substring(0, 2);

  useEffect(() => {
    let isMounted = true;

    const connectWebSocket = () => {
      const socket = new SockJS("http://localhost:8080/ws");
      const client = Stomp.over(socket);

      client.connect({}, () => {
        if (!isMounted) return;

        const sub1 = client.subscribe("/topic/notice", (message) => {
          toast.info(
            <div>
              <div className="toast-announce-title">공지 알림!</div>
              <div className="toast-announce-body">{message.body}</div>
            </div>,
            {
              position: "bottom-right",
              autoClose: 10000,
              className: "custom-toast",
              icon: false,
            }
          );
        });

        let sub2;
        if (member?.memberLocation) {
          sub2 = client.subscribe(
            `/topic/region/${memberLocation}`,
            (message) => {
              toast.info(
                <div>
                  <div className="toast-location-title">
                    우리동네 게시판에 새 글이 등록되었습니다
                  </div>
                  {String(memberLocation).length === 2 ? (
                    <div className="toast-location-body">
                      {getLocationName(memberLocation)}에 대한 게시글이
                      등록되었습니다.
                    </div>
                  ) : (
                    <div className="toast-location-body">
                      {getLocationName(memberCity)}{" "}
                      {getLocationName(memberLocation)}에 대한 게시글이
                      등록되었습니다.
                    </div>
                  )}
                </div>,
                {
                  position: "bottom-right",
                  autoClose: 10000,
                  className: "custom-toast",
                  icon: false,
                }
              );
            }
          );
        }

        // 구독 저장
        subscriptions.current = sub2 ? [sub1, sub2] : [sub1];
        stompClientRef.current = client;
        connectedRef.current = true;
      });
    };

    const disconnectWebSocket = async () => {
      subscriptions.current.forEach((sub) => {
        try {
          sub.unsubscribe();
        } catch (e) {}
      });
      subscriptions.current = [];

      return new Promise((resolve) => {
        if (stompClientRef.current?.connected) {
          stompClientRef.current.disconnect(() => {
            connectedRef.current = false;
            resolve();
          });
        } else {
          connectedRef.current = false;
          resolve();
        }
      });
    };

    // main logic
    (async () => {
      await disconnectWebSocket(); // 기존 연결 정리
      if (isMounted && member?.memberNo) {
        connectWebSocket(); // 새로운 연결 시도
      }
    })();

    return () => {
      isMounted = false;
      disconnectWebSocket();
    };
  }, [member]);

  return null;
}

function App() {
  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(import.meta.env.VITE_KAKAO_JS_KEY);
    }

    const handleForceLogout = () => {
      // 1) 저장된 토큰 제거
      localStorage.removeItem("accessToken");
      localStorage.removeItem("loginMember");

      // window.location.href = "/login";
    };

    window.addEventListener("forceLogout", handleForceLogout);
    return () => window.removeEventListener("forceLogout", handleForceLogout);
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <MemberProvider>
          <MessageListener />
          <GlobalWebSocketListener />
          <Routes>
            {/* 공통 사용자 레이아웃 */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Main />} />
              <Route path="sale" element={<SaleProviderWrapper />} />
              <Route path="stock" element={<StockProviderWrapper />} />
              <Route path="login" element={<MemberLogin />} />
              <Route path="signUp" element={<MemberSignup />} />
              <Route path="findPassword" element={<MemberFindPw />} />
              <Route path="gonggong" element={<Gonggong />} />
              <Route path="terms" element={<TermsOfService />} />
              <Route path="privacy" element={<PrivacyPolicy />} />
              <Route path="customer" element={<CustomerService />} />
              <Route path="/oauth2/kakao/redirect" element={<LoginHandler />} />
              <Route
                path="/oauth2/naver/redirect"
                element={<NaverCallback />}
              />
              {/* 마이페이지 */}
              <Route
                path="myPage"
                element={
                  <ProtectedRoute>
                    <BlockAdmin>
                      <MyInfo />
                    </BlockAdmin>
                  </ProtectedRoute>
                }
              />
              <Route
                path="myPage/updateInfo"
                element={
                  <ProtectedRoute>
                    <BlockAdmin>
                      <UpdateInfo />
                    </BlockAdmin>
                  </ProtectedRoute>
                }
              />
              <Route
                path="myPage/myStock"
                element={
                  <ProtectedRoute>
                    <BlockAdmin>
                      <MyStock />
                    </BlockAdmin>
                  </ProtectedRoute>
                }
              />
              <Route
                path="myPage/updateMyStock"
                element={
                  <ProtectedRoute>
                    <BlockAdmin>
                      <UpdateMyStock />
                    </BlockAdmin>
                  </ProtectedRoute>
                }
              />
              <Route
                path="myPage/addStock"
                element={
                  <ProtectedRoute>
                    <BlockAdmin>
                      <AddStock />
                    </BlockAdmin>
                  </ProtectedRoute>
                }
              />
              <Route
                path="myPage/sawStock"
                element={
                  <ProtectedRoute>
                    <BlockAdmin>
                      <SawStock />
                    </BlockAdmin>
                  </ProtectedRoute>
                }
              />
              <Route
                path="myPage/likeStock"
                element={
                  <ProtectedRoute>
                    <BlockAdmin>
                      <LikeStock />
                    </BlockAdmin>
                  </ProtectedRoute>
                }
              />
              <Route
                path="myPage/myMessage"
                element={
                  <ProtectedRoute>
                    <BlockAdmin>
                      <MyMessage />
                    </BlockAdmin>
                  </ProtectedRoute>
                }
              />
              <Route
                path="myPage/seeMyMessage"
                element={
                  <ProtectedRoute>
                    <BlockAdmin>
                      <SeeMyMessage />
                    </BlockAdmin>
                  </ProtectedRoute>
                }
              />
              <Route
                path="myPage/detailMessage/:messageNo"
                element={
                  <ProtectedRoute>
                    <BlockAdmin>
                      <DetailMessage />
                    </BlockAdmin>
                  </ProtectedRoute>
                }
              />
              <Route
                path="myPage/myPost"
                element={
                  <ProtectedRoute>
                    <BlockAdmin>
                      <MyPost />
                    </BlockAdmin>
                  </ProtectedRoute>
                }
              />
              <Route
                path="myPage/updatePassword"
                element={
                  <ProtectedRoute>
                    <BlockAdmin>
                      <UpdatePassword />
                    </BlockAdmin>
                  </ProtectedRoute>
                }
              />
              <Route
                path="myPage/withDraw"
                element={
                  <ProtectedRoute>
                    <BlockAdmin>
                      <WithDraw />
                    </BlockAdmin>
                  </ProtectedRoute>
                }
              />
              {/*매물페이지*/}
              <Route
                path="/stock/:stockNo"
                element={<StockProviderWrapper />}
              />
              {/* 분양페이지 */}
              <Route
                path="/sale/:saleStockNo"
                element={<SaleProviderWrapper />}
              />
              {/* 공지사항 (Announce) */}
              <Route path="announce" element={<Announce />} />
              <Route path="announce/detail/:id" element={<AnnounceDetail />} />
              <Route
                path="announce/write"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <AnnounceWrite />
                    </AdminRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="announce/edit/:id"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <AnnounceWrite />
                    </AdminRoute>
                  </ProtectedRoute>
                }
              />
              {/* 우리동네 게시판 */}
              <Route
                path="/neighborhoodBoard"
                element={<NeighborhoodBoard />}
              />
              <Route
                path="neighborhoodBoard/detail/:boardNo"
                element={<NeighborhoodDetail />}
              />
              <Route
                path="neighborhoodBoard/edit/:boardNo?"
                element={
                  <ProtectedRoute>
                    <NeighborhoodEdit />
                  </ProtectedRoute>
                }
              />
              {/* 선택 파라미터 문법으로 ?가 있을 때는 있을수도 없을수도 있다.
              baordNo가 들어가 있으면 수정화면으로 전환
              boardNo가 안 들어가면 글쓰기 화면으로 전환할 예정이다. 하나의 path로 두개의 처리를 하여 jsx파일의 개수 자체를 줄일 수 있을 듯 하다*/}
            </Route>

            {/* 관리자 페이지 - DashBoard 레이아웃 하위 중첩 라우팅 */}
            <Route
              path="admin/*"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <DashBoard />
                  </AdminRoute>
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <Chart />
                    </AdminRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <Chart />
                    </AdminRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="chart"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <Chart />
                    </AdminRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="advertisement"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <Advertisement />
                    </AdminRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="helpMessage"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <HelpMessage />
                    </AdminRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="help/reply/:messageNo"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <Reply />
                    </AdminRoute>
                  </ProtectedRoute>
                }
              />{" "}
              <Route
                path="management"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <Management />
                    </AdminRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="list_sale"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <ListSale />
                    </AdminRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="add_sale"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <AddSale />
                    </AdminRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="edit_sale/:id"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <UpdateSale />
                    </AdminRoute>
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
          <ToastContainer position="top-center" icon={false} autoClose={3000} />
        </MemberProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
