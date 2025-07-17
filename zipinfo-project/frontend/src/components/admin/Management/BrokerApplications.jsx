import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  RefreshCw,
  XCircle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import "../../../css/admin/Management/BrokerApplications.css";
import { toast } from "react-toastify";
import { axiosAPI } from "../../../api/axiosApi";

const roleOptions = ["일반회원", "중개인 신청", "중개인"];

const roleMap = {
  0: "관리자",
  1: "일반회원",
  2: "중개인 신청",
  3: "중개인",
};

const reverseRoleMap = {
  관리자: 0,
  일반회원: 1,
  "중개인 신청": 2,
  중개인: 3,
};

function formatDate(dateString) {
  if (!dateString) return "-";
  const d = new Date(dateString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const BrokerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [brokerNumbers, setBrokerNumbers] = useState({});
  const [loadingBrokerNumbers, setLoadingBrokerNumbers] = useState({});

  const membersPerPage = 10;
  const BASE_URL = "http://localhost:8080";
  const checkBrokerNumber = async (memberNumber, memberEmail) => {
    if (!memberEmail) {
      setBrokerNumbers((prev) => ({ ...prev, [memberNumber]: false }));
      return;
    }
    if (
      brokerNumbers[memberNumber] !== undefined ||
      loadingBrokerNumbers[memberNumber]
    ) {
      return;
    }
    setLoadingBrokerNumbers((prev) => ({ ...prev, [memberNumber]: true }));

    try {
      // 1) 백엔드에서 brokerNo 받아오기
      const {
        data: { brokerNo },
      } = await axiosAPI.get(`${BASE_URL}/admin/management/selectBrokerNo`, {
        params: { email: memberEmail },
      });
      console.log("🔍 중개사번호:", brokerNo);
      if (!brokerNo) {
        setBrokerNumbers((prev) => ({ ...prev, [memberNumber]: false }));
        return;
      }

      // 2) 공공 API 요청
      const params = {
        ServiceKey: import.meta.env.VITE_PUBLIC_DATA_API_KEY,
        type: "json",
        pageNo: 1,
        numOfRows: 1,
        ESTBL_REG_NO: brokerNo,
      };
      const apiRes = await axios.get(
        `/api/publicdata/tn_pubr_public_med_office_api`,
        { params }
      );
      console.log("✅ API 응답:", apiRes.data);

      // 3) 헤더 + 바디 분리
      const { response } = apiRes.data;
      const { header, body } = response;

      // 4) 존재 여부 판단
      if (header.resultCode !== "00" || !body?.items) {
        setBrokerNumbers((prev) => ({ ...prev, [memberNumber]: false }));
      } else {
        const items = body.items.item;
        const exists = Array.isArray(items)
          ? items.some((r) => r.ESTBL_REG_NO === brokerNo)
          : items?.ESTBL_REG_NO === brokerNo;
        setBrokerNumbers((prev) => ({ ...prev, [memberNumber]: exists }));
      }
    } catch (err) {
      console.error("❌ 중개사 정보 조회 에러:", err);
      setBrokerNumbers((prev) => ({ ...prev, [memberNumber]: false }));
    } finally {
      setLoadingBrokerNumbers((prev) => ({ ...prev, [memberNumber]: false }));
    }
  };
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axiosAPI.get(
          `${BASE_URL}/admin/management/broker-applications`
        );
        const data = response?.data || [];
        setApplications(data);
        setFilteredApps(data);
      } catch (error) {
        console.error("중개회원 신청 목록 조회 실패", error);
      }
    };
    fetchApplications();
  }, []);

  useEffect(() => {
    let filtered = applications;
    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.memberId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.memberNumber?.toString().includes(searchTerm)
      );
    }
    if (roleFilter) {
      filtered = filtered.filter(
        (app) => roleMap[app.memberRole] === roleFilter
      );
    }
    setFilteredApps(filtered);
    setCurrentPage(1);
  }, [searchTerm, roleFilter, applications]);

  const handleRoleChange = async (memberNumber, newRoleStr) => {
    const newRole = reverseRoleMap[newRoleStr];
    try {
      await axiosAPI.put(
        `${BASE_URL}/admin/management/members/${memberNumber}/role`,
        null,
        { params: { authId: newRole } }
      );
      const updated = applications.map((app) =>
        app.memberNumber === memberNumber
          ? { ...app, memberRole: newRole }
          : app
      );
      setApplications(updated);
    } catch (error) {
      toast.error("회원 권한 변경에 실패하였습니다.");
    }
  };

  const handleReject = async (memberNumber) => {
    try {
      await axiosAPI.put(
        `${BASE_URL}/admin/management/broker-applications/${memberNumber}/reject`
      );
      await axiosAPI.put(
        `${BASE_URL}/admin/management/members/${memberNumber}/role`,
        null,
        { params: { authId: 1 } }
      );
      const updated = applications.map((app) =>
        app.memberNumber === memberNumber
          ? { ...app, applicationStatus: "거절됨", memberRole: 1 }
          : app
      );
      setApplications(updated);
    } catch (error) {
      toast.error("거절 처리 실패. 다시 한번 시도해주세요.");
    }
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setRoleFilter("");
    setBrokerNumbers({});
    setLoadingBrokerNumbers({});
  };

  const refreshBrokerInfo = async (memberNumber, memberEmail) => {
    setBrokerNumbers((prev) => {
      const newState = { ...prev };
      delete newState[memberNumber];
      return newState;
    });
    await checkBrokerNumber(memberNumber, memberEmail);
  };

  const renderBrokerInfo = (memberNumber, memberEmail) => {
    console.log(`중개사정보 확인 요청: ${memberNumber} → ${memberEmail}`);

    if (loadingBrokerNumbers[memberNumber]) {
      return (
        <div className="broker-loading-container">
          <div className="broker-loading-spinner"></div>
          <span className="broker-loading-text">확인중...</span>
        </div>
      );
    }

    const exists = brokerNumbers[memberNumber];

    if (exists === true) {
      return (
        <div className="broker-info-container">
          <div className="broker-status-header">
            <div className="broker-status-registered">
              <CheckCircle size={16} />
              <span>등록됨</span>
            </div>
            <button
              onClick={() => refreshBrokerInfo(memberNumber, memberEmail)}
              className="broker-refresh-button"
              title="정보 새로고침"
            >
              🔄 새로고침
            </button>
          </div>
        </div>
      );
    } else if (exists === false) {
      return (
        <div className="broker-error-container">
          <div className="broker-status-header">
            <div className="broker-status-unregistered">
              <XCircle size={16} />
              <span>미등록</span>
            </div>
            <button
              onClick={() => refreshBrokerInfo(memberNumber, memberEmail)}
              className="broker-retry-button"
              title="정보 새로고침"
            >
              🔄 다시확인
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="broker-unchecked-container">
          <div className="broker-status-unchecked">
            <AlertCircle size={16} />
            <span>미확인</span>
          </div>
          <button
            onClick={() => checkBrokerNumber(memberNumber, memberEmail)}
            className="broker-check-button"
            title="중개사 정보 확인"
          >
            🔍 중개사정보 확인
          </button>
        </div>
      );
    }
  };

  const totalPages = Math.ceil(filteredApps.length / membersPerPage);
  const indexOfLast = currentPage * membersPerPage;
  const indexOfFirst = indexOfLast - membersPerPage;
  const currentApps = filteredApps.slice(indexOfFirst, indexOfLast);
  return (
    <div className="management-container">
      <h3 className="management-header">중개인 권한 신청 목록</h3>

      <div className="controls">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="회원 이메일 또는 번호 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="member-role-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">전체 권한</option>
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>

        <button
          className="refresh-button"
          onClick={handleRefresh}
          aria-label="초기화"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm table-auto member-list">
          <thead>
            <tr>
              <th>회원 번호</th>
              <th>이메일</th>
              <th>회원 가입일</th>
              <th>회원 권한</th>
              <th>최근 접속일</th>
              <th>중개사정보</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {currentApps.length > 0 ? (
              currentApps.map((app) => (
                <tr key={app.memberNumber}>
                  <td>{app.memberNumber}</td>
                  <td className="member-id-cell" title={app.memberId}>
                    {app.memberId}
                  </td>
                  <td>{formatDate(app.joinDate)}</td>
                  <td>
                    <select
                      value={roleMap[app.memberRole] || ""}
                      onChange={(e) =>
                        handleRoleChange(app.memberNumber, e.target.value)
                      }
                      className="member-role-select"
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{formatDate(app.lastLoginDate)}</td>
                  <td className="broker-info-cell">
                    {renderBrokerInfo(app.memberNumber, app.memberId)}
                  </td>
                  <td>
                    <button
                      onClick={() => handleReject(app.memberNumber)}
                      disabled={app.applicationStatus === "거절됨"}
                      className={`reject-button ${
                        app.applicationStatus === "거절됨"
                          ? "rejected"
                          : "active"
                      }`}
                    >
                      <XCircle size={18} color="red" strokeWidth={2} />
                      <span
                        className={`reject-label ${
                          app.applicationStatus === "거절됨"
                            ? "text-disabled"
                            : "text-active"
                        }`}
                      >
                        {app.applicationStatus === "거절됨"
                          ? "거절됨"
                          : "권한신청 거절"}
                      </span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  신청 내역이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(
          (page) => (
            <button
              key={page}
              className={`page-button ${page === currentPage ? "active" : ""}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default BrokerApplications;
