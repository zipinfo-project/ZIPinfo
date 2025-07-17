import React, { useEffect, useState } from "react";
import { Search, RefreshCw, Lock, XCircle } from "lucide-react";
import "../../../css/admin/Management/MemberList.css";
import { toast } from "react-toastify";
import { axiosAPI } from "../../../api/axiosApi";

const BASE_URL = "http://localhost:8080";

const MemberList = ({ initialMembers }) => {
  const [currentMembers, setCurrentMembers] = useState(
    Array.isArray(initialMembers) ? initialMembers : []
  );
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const membersPerPage = 10;

  const authMap = {
    0: "관리자",
    1: "일반회원",
    2: "중개회원 신청",
    3: "중개회원",
  };

  const roleOptions = ["관리자", "일반회원", "중개회원 신청", "중개회원"];

  // 컴포넌트 마운트 시 API 호출해서 최신 멤버 목록 불러오기
  useEffect(() => {
    axiosAPI
      .get("/admin/management/members")
      .then((res) => {
        console.log("API 응답 데이터:", res.data);
        setCurrentMembers(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  // 초기 prop이 변경되면 상태에 반영
  useEffect(() => {
    if (Array.isArray(initialMembers)) {
      setCurrentMembers(initialMembers);
    } else {
      setCurrentMembers([]);
    }
  }, [initialMembers]);

  // 검색어, 필터, 멤버 변경에 따른 필터링 및 페이징 초기화
  useEffect(() => {
    let updated = [...currentMembers];

    if (searchTerm.trim()) {
      updated = updated.filter(
        (member) =>
          member.memberId?.includes(searchTerm) ||
          member.memberEmail?.includes(searchTerm) ||
          member.memberNo?.toString().includes(searchTerm)
      );
    }

    if (roleFilter) {
      updated = updated.filter(
        (member) => authMap[member.memberAuth] === roleFilter
      );
    }

    setFilteredMembers(updated);
    setCurrentPage(1);
  }, [searchTerm, roleFilter, currentMembers]);

  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentPageMembers = filteredMembers.slice(
    indexOfFirstMember,
    indexOfLastMember
  );

  const totalPages = Math.ceil(filteredMembers.length / membersPerPage);

  const handleRefresh = () => {
    setSearchTerm("");
    setRoleFilter("");
    setFilteredMembers(currentMembers);
    setCurrentPage(1);
  };

  const handleDeleteMember = async (memberNo) => {
    const confirmed = window.confirm("정말 이 회원을 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      await axiosAPI.delete(`${BASE_URL}/admin/management/members/${memberNo}`);
      toast.success(
        <div>
          <div className="toast-success-title">삭제 성공 알림!</div>
          <div className="toast-success-body">회원정보가 삭제되었습니다.</div>
        </div>
      );
      setCurrentMembers((prev) => prev.filter((m) => m.memberNo !== memberNo));
    } catch (error) {
      console.error("회원 삭제 실패", error);
      toast.error(
        <div>
          <div className="toast-error-title">오류 알림!</div>
          <div className="toast-error-body">회원 삭제에 실패하였습니다.</div>
        </div>
      );
    }
  };

  return (
    <div className="member-list-container p-4">
      <h3 className="member-list-header">회원 목록</h3>

      <div className="controls">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="회원 아이디 또는 번호 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
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

        <button className="refresh-button" onClick={handleRefresh}>
          <RefreshCw size={16} className="icon-inline" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="member-table">
          <thead>
            <tr>
              <th>번호</th>
              <th>아이디</th>
              <th>권한</th>
              <th>가입일</th>
              {/* <th>최근 로그인</th> */}
              <th>게시글 수</th>
              <th>삭제</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  회원 정보가 없습니다.
                </td>
              </tr>
            ) : (
              currentPageMembers.map((member) => (
                <tr key={member.memberNo}>
                  <td>{member.memberNo}</td>
                  <td>{member.memberEmail || member.memberId}</td>
                  <td>{authMap[member.memberAuth] || "알 수 없음"}</td>
                  <td>
                    {member.enrollDate ||
                      member.joinDate ||
                      member.createdAt ||
                      "-"}
                  </td>
                  <td>{member.postCount ?? member.POST_COUNT ?? 0}</td>
                  <td>
                    <button
                      type="button"
                      className={`status-button ${
                        member.blockFlag ? "blocked" : "active"
                      }`}
                      title={member.blockFlag ? "차단됨" : "정상"}
                      onClick={() => handleDeleteMember(member.memberNo)}
                    >
                      {member.blockFlag ? (
                        <Lock size={18} />
                      ) : (
                        <XCircle size={18} />
                      )}
                    </button>
                  </td>
                </tr>
              ))
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
              aria-label={`페이지 ${page}`}
            >
              {page}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default MemberList;
