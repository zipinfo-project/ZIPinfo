import React, { useState, useEffect } from "react";
import { Shield, User, Trash2, UserPlus, FileX, Crown } from "lucide-react"; // 🔄 Crown 아이콘 추가
import "../../../css/admin/Management/Management.css";

import MemberList from "./MemberList";
import DeletedMembers from "./DeletedMembers";
import BrokerApplications from "./BrokerApplications";
import DeletedBoard from "./DeletedBoard"; //  추가
import Manager from "./Manager"; //  추가
import { axiosAPI } from "../../../api/axiosApi";

const Management = () => {
  const [activeTab, setActiveTab] = useState("members");

  const [members, setMembers] = useState([]);
  const [deletedMembers, setDeletedMembers] = useState([]);
  const [brokerApplications, setBrokerApplications] = useState([]);
  const [deletedBoards, setDeletedBoards] = useState([]); // ✅ 추가

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [adminName, setAdminName] = useState("");
  const [adminId, setAdminId] = useState("");

  // 응답 데이터가 배열인지 확인하고 없으면 빈 배열로 처리하는 헬퍼

  const handleResponse = (res, setDataFunc, errorMessage) => {
    console.log("[handleResponse] 응답 데이터:", res);
    if (Array.isArray(res.data)) {
      setDataFunc(res.data);
      setError(null);
    } else if (res.data && Array.isArray(res.data.data)) {
      setDataFunc(res.data.data);
      setError(null);
    } else {
      setError(errorMessage + " (데이터 형식 오류)");
      setDataFunc([]);
    }
    console.log("[handleResponse] error:", error);
    console.log("[handleResponse] setDataFunc 값:", res.data);
  };

  useEffect(() => {
    setError(null);
    setLoading(true);
    console.log("[useEffect] activeTab:", activeTab);

    if (activeTab === "members") {
      axiosAPI
        .get("http://localhost:8080/admin/management/members", {
          withCredentials: true,
        })
        .then((res) => {
          console.log("[then] 회원 목록 응답:", res);
          handleResponse(res, setMembers, "회원 목록 불러오기 실패");
        })
        .catch((err) => {
          console.log("[catch] 회원 목록 에러:", err);
          setError("회원 목록 불러오기 실패");
        })
        .finally(() => setLoading(false));
    } else if (activeTab === "deleted") {
      axiosAPI
        .get("http://localhost:8080/admin/management/members/deleted")
        .then((res) => {
          console.log("[then] 삭제된 회원 목록 응답:", res);
          handleResponse(
            res,
            setDeletedMembers,
            "삭제된 회원 목록 불러오기 실패"
          );
        })
        .catch((err) => {
          console.log("[catch] 삭제된 회원 목록 에러:", err);
          setError("삭제된 회원 목록 불러오기 실패");
        })
        .finally(() => setLoading(false));
    } else if (activeTab === "applications") {
      axiosAPI
        .get("http://localhost:8080/admin/management/broker-applications")
        .then((res) => {
          console.log("[then] 중개인 권한 신청 목록 응답:", res);
          handleResponse(
            res,
            setBrokerApplications,
            "중개인 권한 신청 목록 불러오기 실패"
          );
        })
        .catch((err) => {
          console.log("[catch] 중개인 권한 신청 목록 에러:", err);
          setError("중개인 권한 신청 목록 불러오기 실패");
        })
        .finally(() => setLoading(false));
    } else if (activeTab === "deletedBoards") {
      // ✅ 추가된 조건
      axiosAPI
        .get("http://localhost:8080/admin/management/boards/deleted")
        .then((res) => {
          console.log("[then] 삭제된 게시글 목록 응답:", res);
          handleResponse(
            res,
            setDeletedBoards,
            "삭제된 게시글 목록 불러오기 실패"
          );
        })
        .catch((err) => {
          console.log("[catch] 삭제된 게시글 목록 에러:", err);
          setError("삭제된 게시글 목록 불러오기 실패");
        })
        .finally(() => setLoading(false));
    } else if (activeTab === "manager") {
      // ✅ manager 탭은 API 호출이 필요 없으므로 로딩을 즉시 false로 설정
      setLoading(false);
    }
  }, [activeTab]);

  return (
    <div className="management-container">
      <div className="tab-menu">
        <button
          className={`tab-button ${activeTab === "members" ? "active" : ""}`}
          onClick={() => setActiveTab("members")}
        >
          <User className="tab-icon" />
          회원 목록 관리
        </button>
        <button
          className={`tab-button ${activeTab === "deleted" ? "active" : ""}`}
          onClick={() => setActiveTab("deleted")}
        >
          <Trash2 className="tab-icon" />
          삭제한 회원 목록
        </button>
        <button
          className={`tab-button ${
            activeTab === "applications" ? "active" : ""
          }`}
          onClick={() => setActiveTab("applications")}
        >
          <UserPlus className="tab-icon" />
          중개인 권한 신청
        </button>
        <button
          className={`tab-button ${
            activeTab === "deletedBoards" ? "active" : ""
          }`} // ✅ 탭 추가
          onClick={() => setActiveTab("deletedBoards")}
        >
          <FileX className="tab-icon" /> {/* 적절한 아이콘 선택 */}
          삭제된 게시글 목록
        </button>
        <button
          className={`tab-button ${activeTab === "manager" ? "active" : ""}`} // ✅ 새로운 탭 추가
          onClick={() => setActiveTab("manager")}
        >
          <Crown className="tab-icon" />
          관리자 권한 관리
        </button>
      </div>
      {/* 로딩 및 에러 메시지 */}
      {loading && <div>로딩 중...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {/* 탭별 컴포넌트 렌더링 */}
      {activeTab === "members" && <MemberList initialMembers={members} />}
      {activeTab === "deleted" && (
        <DeletedMembers initialDeletedMembers={deletedMembers} />
      )}
      {activeTab === "applications" && (
        <BrokerApplications initialApplications={brokerApplications} />
      )}
      {activeTab === "deletedBoards" && (
        <DeletedBoard initialDeletedBoards={deletedBoards} />
      )}
      {activeTab === "manager" && <Manager />} {/* ✅ 새로운 컴포넌트 추가 */}
    </div>
  );
};

export default Management;
