import React, { useState, useEffect, useRef } from "react";
import "../../css/admin/Advertisement.css";
import { toast } from "react-toastify";
import { axiosAPI } from "../../api/axiosApi";

const Advertisement = () => {
  const fileInputRef = useRef(null);
  // 📦 광고 리스트 상태 (서버에서 불러오거나 업로드 시 추가)
  const [ads, setAds] = useState([]);
  // 📁 선택한 업로드 파일 상태
  const [selectedFile, setSelectedFile] = useState(null);

  // 🔄 서버에서 관리자 정보 가져오기
  const [adminInfo, setAdminInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        setIsLoading(true);
        const response = await axiosAPI.get("/member/getMember");
        console.log("광고 등록 adminInfo 응답:", response.data);
        setAdminInfo(response.data);
      } catch (error) {
        console.error("관리자 정보 불러오기 실패", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminInfo();
    fetchAds();
  }, []);

  // 컴포넌트 마운트 시 서버에서 광고 리스트 불러오기
  const fetchAds = async () => {
    try {
      const resp = await axiosAPI.get("/advertisement/list");
      setAds(resp.data);
    } catch (error) {
      console.error("광고 리스트 불러오기 실패", error);
    }
  };

  // 📌 파일 선택 시 실행되는 이벤트 핸들러
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
  };

  // ✅ 광고 업로드 핸들러 (서버에 파일 저장 요청)
  const handleAdUpload = async () => {
    const maxFileSize = 10 * 1024 * 1024;

    if (!selectedFile) {
      toast.error(
        <div>
          <div className="toast-error-title">오류 알림!</div>
          <div className="toast-error-body">업로드할 파일을 선택해주세요.</div>
        </div>
      );
      setSelectedFile(null);
      return;
    }

    if (selectedFile.size > maxFileSize) {
      toast.error(
        <div>
          <div className="toast-error-title">오류 알림!</div>
          <div className="toast-error-body">
            파일 크기는 10MB 이하만 업로드할 수 있습니다.
          </div>
        </div>
      );
      setSelectedFile(null);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await axiosAPI.post(
        "http://localhost:8080/advertisement/register",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": undefined }, // 반드시 있어야 함
        }
      );

      if (response.status === 200) {
        fetchAds();
      }
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success(
        <div>
          <div className="toast-success-title">광고 등록 성공 알림!</div>
          <div className="toast-success-body">광고가 등록되었습니다.</div>
        </div>
      );
    } catch (error) {
      console.error("이미지 업로드 실패", error);
      toast.error(
        <div>
          <div className="toast-error-title">오류 알림!</div>
          <div className="toast-error-body">광고 등록에 실패하였습니다.</div>
        </div>
      );
    }
  };

  // ✅ 광고 메인 등록/해제 토글
  const handleToggleMain = async (adNo) => {
    try {
      await axiosAPI.post(
        "http://localhost:8080/advertisement/updateMain",
        { adNo: parseInt(adNo) },
        { withCredentials: true }
      );
      fetchAds();
    } catch (error) {
      console.error("메인 등록 토글 실패", error);
      toast.error("메인 등록 상태 변경에 실패했습니다.");
    }
  };

  // ✅ 광고 삭제
  const handleDelete = async (adNo) => {
    try {
      await axiosAPI.post(
        "http://localhost:8080/advertisement/delete",
        { adNo: parseInt(adNo) },
        { withCredentials: true }
      );
      fetchAds();
    } catch (error) {
      console.error("광고 삭제 실패", error);
      toast.error("광고 삭제에 실패했습니다.");
    }
  };

  // 로딩 중일 때
  if (isLoading) return <div>로딩 중...</div>;

  return (
    <div className="admin-ad-wrap">
      <h1 className="admin-ad-title">광고 등록 관리</h1>

      {/* 관리자 정보가 있을 때만 표시 */}
      {adminInfo && (
        <div className="admin-ad-info">
          <p>
            현재{" "}
            <span className="admin-ad-name">{adminInfo.memberNickname}</span>{" "}
            으로 접속중입니다.
          </p>
          <p>
            접속 ID :{" "}
            <span className="admin-ad-id">{adminInfo.memberEmail}</span>
          </p>
        </div>
      )}

      {/* 광고 목록 테이블 (항상 노출) */}
      <div className="admin-ad-table-box">
        <table className="admin-ad-table">
          <thead>
            <tr>
              <th>번호</th>
              <th>이미지</th>
              <th>작성자</th>
              <th>메인등록</th>
              <th>삭제</th>
            </tr>
          </thead>
          <tbody>
            {ads.length === 0 ? (
              <tr>
                <td colSpan="5" className="admin-ad-empty">
                  등록된 광고가 없습니다.
                </td>
              </tr>
            ) : (
              ads.map((ad, index) => (
                <tr key={ad.id}>
                  <td>{index + 1}</td>
                  <td>
                    <img
                      src={`http://localhost:8080${ad.adImgUrl}`}
                      alt={`광고 이미지 ${index + 1}`}
                      style={{ width: "100px", height: "auto" }}
                    />
                  </td>
                  <td>{ad.memberNickname}</td>
                  <td>
                    <button
                      className={`admin-ad-btn ${
                        ad.adMain ? "admin-ad-green" : "admin-ad-blue"
                      }`}
                      onClick={() => handleToggleMain(ad.adNo)}
                      disabled={!adminInfo} // 비로그인 시 버튼 비활성화
                    >
                      {ad.adMain ? "등록됨" : "등록"}
                    </button>
                  </td>
                  <td>
                    <button
                      className="admin-ad-btn admin-ad-red"
                      onClick={() => handleDelete(ad.adNo)}
                      disabled={!adminInfo} // 비로그인 시 버튼 비활성화
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 광고 업로드 영역: 관리자 로그인 시에만 표시 */}
      {adminInfo && (
        <>
          <div className="admin-ad-upload">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="admin-ad-action">
            <button className="admin-ad-add" onClick={handleAdUpload}>
              이미지 업로드
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Advertisement;
