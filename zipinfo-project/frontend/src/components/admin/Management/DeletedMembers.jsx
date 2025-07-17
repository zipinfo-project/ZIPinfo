import React, { useState, useEffect } from "react";
import { Search, RefreshCw } from "lucide-react";
import "../../../css/admin/Management/DeletedMembers.css";
import { toast } from "react-toastify";
import { axiosAPI } from "../../../api/axiosApi";

const roleOptions = ["일반회원", "중개회원 신청", "중개회원"];
const BASE_URL = "http://localhost:8080"; // API 주소 맞게 조정하세요

const DeletedMembers = () => {
  const [deletedMembers, setDeletedMembers] = useState([]);
  const [filteredDeletedMembers, setFilteredDeletedMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 10;

  const authMap = {
    0: "관리자",
    1: "일반회원",
    2: "중개회원 신청",
    3: "중개회원",
  };

  // 삭제된 회원 목록 불러오기
  const fetchDeletedMembers = async () => {
    try {
      const response = await axiosAPI.get(
        `${BASE_URL}/admin/management/members/deleted`
      );
      setDeletedMembers(response.data);
    } catch (error) {
      console.error("삭제된 회원 목록 로드 실패:", error);
    }
  };

  useEffect(() => {
    fetchDeletedMembers();
  }, []);

  useEffect(() => {
    setFilteredDeletedMembers(deletedMembers);
    console.log(deletedMembers);
  }, [deletedMembers]);

  useEffect(() => {
    let filtered = deletedMembers;

    if (roleFilter) {
      filtered = filtered.filter(
        (member) =>
          authMap[member.memberRole ?? member.memberAuth] === roleFilter
      );
    }

    setFilteredDeletedMembers(filtered);
    setCurrentPage(1);
  }, [searchTerm, roleFilter, deletedMembers]);

  const handleRestoreMember = async (memberNo) => {
    try {
      const response = await axiosAPI.put(
        `${BASE_URL}/admin/management/members/${memberNo}/restore`
      );

      if (response.status === 200) {
        toast.success(
          <div>
            <div className="toast-success-title">복구 성공 알림!</div>
            <div className="toast-success-body">
              계정이 성공적으로 복구되었습니다.
            </div>
          </div>
        );
        await fetchDeletedMembers();
      } else {
        toast.error(
          <div>
            <div className="toast-error-title">오류 알림!</div>
            <div className="toast-error-body">복구에 실패하였습니다.</div>
          </div>
        );
      }
    } catch (error) {
      console.error("계정 복구 중 오류:", error);
      toast.error(
        <div>
          <div className="toast-error-title">오류 알림!</div>
          <div className="toast-error-body">복구 중 오류가 발생하였습니다.</div>
        </div>
      );
    }
  };

  const handlePermanentlyDeleteMember = async (memberNo) => {
    if (window.confirm("정말로 이 회원의 계정을 영구 삭제하시겠습니까?")) {
      try {
        const response = await axiosAPI.delete(
          `${BASE_URL}/admin/management/members/${memberNo}/permanent`
        );

        if (response.status === 200) {
          toast.success(
            <div>
              <div className="toast-success-title">삭제 성공 알림!</div>
              <div className="toast-success-body">
                계정이 성공적으로 영구 삭제되었습니다.
              </div>
            </div>
          );
          await fetchDeletedMembers();
        } else {
          toast.error(
            <div>
              <div className="toast-error-title">오류 알림!</div>
              <div className="toast-error-body">삭제에 실패하였습니다.</div>
            </div>
          );
        }
      } catch (error) {
        console.error("계정 영구 삭제 중 오류:", error);
        toast.error(
          <div>
            <div className="toast-error-title">오류 알림!</div>
            <div className="toast-error-body">
              삭제 중 오류가 발생하였습니다.
            </div>
          </div>
        );
      }
    }
  };

  const totalPages = Math.ceil(filteredDeletedMembers.length / membersPerPage);
  const indexOfLast = currentPage * membersPerPage;
  const indexOfFirst = indexOfLast - membersPerPage;
  const currentData = filteredDeletedMembers.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setRoleFilter("");
  };

  return (
    <div className="deleted-members-container p-4">
      <h3 className="deleted-members-header">삭제된 회원 목록</h3>

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

        <button
          className="refresh-button"
          onClick={handleRefresh}
          aria-label="초기화"
        >
          <RefreshCw size={16} className="icon-inline" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="deleted-members-table">
          <thead>
            <tr>
              <th>회원 번호</th>
              <th>아이디</th>
              <th>가입일</th>
              <th>회원 권한</th>
              <th>탈퇴일</th>
              <th>올린 글 개수</th>
              <th>계정 복구</th>
              <th>계정 삭제</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  삭제된 회원이 없습니다.
                </td>
              </tr>
            ) : (
              currentData.map((member) => (
                <tr key={member.memberNo}>
                  <td>{member.memberNo}</td>
                  <td>{member.memberEmail || member.memberId}</td>
                  <td>{member.enrollDate ? member.enrollDate : "-"}</td>
                  <td>
                    {authMap[member.memberRole ?? member.memberAuth] || "-"}
                  </td>
                  <td>{member.memberWithdrawDate}</td>
                  <td>{member.postCount ?? member.POST_COUNT ?? 0}</td>
                  <td>
                    <button
                      className="restore-button"
                      onClick={() => handleRestoreMember(member.memberNo)}
                    >
                      계정 복구
                    </button>
                  </td>
                  <td>
                    <button
                      className="delete-button"
                      onClick={() =>
                        handlePermanentlyDeleteMember(member.memberNo)
                      }
                    >
                      계정 삭제
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
              onClick={() => handlePageChange(page)}
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

export default DeletedMembers;
