import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosAPI } from "../../../api/axiosApi";
import { Link } from "react-router-dom";
import "../../../css/admin/saleForm/ListSale.css";

const ListSale = () => {
  const navigate = useNavigate();
  const [saleList, setSaleList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 관리자 계정
  const [adminName, setAdminName] = useState("");
  const [adminId, setAdminId] = useState("");

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const res = await axiosAPI.get("/member/getMember", {
          withCredentials: true,
        });
        setAdminName(res.data.memberNickname);
        setAdminId(res.data.memberEmail);
      } catch (err) {
        console.error("관리자 정보 불러오기 실패", err);
      }
    };

    const fetchSaleList = async () => {
      try {
        const response = await axiosAPI.get("/admin/selectSaleList");
        setSaleList(response.data);
      } catch (error) {
        console.error("매물 목록 불러오기 실패:", error);
      }
    };

    fetchAdminInfo();
    fetchSaleList();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("정말로 이 매물을 삭제하시겠습니까?")) return;
    try {
      await axiosAPI.delete(`/admin/deleteSale/${id}`, {
        withCredentials: true,
      });
      alert("삭제가 완료되었습니다.");
      setSaleList((prev) => prev.filter((sale) => sale.saleStockNo !== id));
    } catch (error) {
      console.error("매물 삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleEdit = (id) => navigate(`/admin/edit_sale/${id}`);
  const handleAdd = () => navigate("/admin/add_sale");

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString.split("T")[0];
  };

  const saleTypeMap = {
    1: "아파트",
    2: "주택/빌라",
    3: "오피스텔",
  };

  // 페이지별로 잘라서 보여줄 데이터
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = saleList.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(saleList.length / itemsPerPage);

  return (
    <div className="ls-container">
      <h1 className="ls-title">분양 관리</h1>

      <div className="ls-admin-box">
        <p>
          현재 <span className="ls-admin-name">{adminName}</span> 으로
          접속중입니다.
        </p>
        <p>
          접속 ID : <span className="ls-admin-id">{adminId}</span>
        </p>
      </div>

      <div className="ls-table-wrapper">
        <table className="ls-table">
          <thead>
            <tr>
              <th>매물번호</th>
              <th>매물유형</th>
              <th>매물명</th>
              <th>작성자</th>
              <th>작성일</th>
              <th>수정</th>
              <th>삭제</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((sale) => (
                <tr key={sale.saleStockNo}>
                  <td>
                    <Link
                      to={`/sale/${sale.saleStockNo}`}
                      state={{ shouldFocus: true }}
                      className="ls-link"
                    >
                      {sale.saleStockNo}
                    </Link>
                  </td>
                  <td>{saleTypeMap[sale.saleStockForm] || "기타"}</td>
                  <td>
                    <Link
                      to={`/sale/${sale.saleStockNo}`}
                      state={{ shouldFocus: true }}
                      className="ls-link"
                    >
                      {sale.saleStockName}
                    </Link>
                  </td>
                  <td>{sale.memberEmail}</td>
                  <td>{formatDate(sale.regDate)}</td>
                  <td>
                    <button
                      className="ls-edit-btn"
                      onClick={() => handleEdit(sale.saleStockNo)}
                    >
                      수정
                    </button>
                  </td>
                  <td>
                    <button
                      className="ls-delete-btn"
                      onClick={() => handleDelete(sale.saleStockNo)}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="ls-empty">
                  등록된 매물이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 버튼 */}
      {totalPages > 1 && (
        <div className="ls-pagination">
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx + 1}
              onClick={() => setCurrentPage(idx + 1)}
              className={`ls-page-btn ${
                currentPage === idx + 1 ? "active" : ""
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}

      <div className="ls-btn-wrapper">
        <button className="ls-add-btn" onClick={handleAdd}>
          매물 등록
        </button>
      </div>
    </div>
  );
};

export default ListSale;
