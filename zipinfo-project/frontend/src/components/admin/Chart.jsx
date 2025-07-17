import { useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { axiosAPI } from "../../api/axiosAPI";
import { toast } from "react-toastify";
import refresh from "../../assets/refresh.svg";

function Chart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 가입/탈퇴/분양 데이터를 하나로 합치는 함수
  const mergeChartData = (signupData, withdrawData, stockData) => {
    const dataMap = new Map();

    // 가입 데이터 추가!
    signupData.forEach((item) => {
      dataMap.set(item.CHART_DATE, {
        date: item.CHART_DATE,
        signupCount: item.SIGNUPCOUNT || 0,
        withdrawCount: 0,
        stockCount: 0,
      });
    });
    // 오타수정
    // 탈퇴 데이터 추가
    withdrawData.forEach((item) => {
      if (dataMap.has(item.CHART_DATE)) {
        dataMap.get(item.CHART_DATE).withdrawCount = item.WITHDRAWCOUNT || 0;
      } else {
        dataMap.set(item.CHART_DATE, {
          date: item.CHART_DATE,
          signupCount: 0,
          withdrawCount: item.WITHDRAWCOUNT || 0,
          stockCount: 0,
        });
      }
    });

    // 분양 데이터 추가
    stockData.forEach((item) => {
      if (dataMap.has(item.CHART_DATE)) {
        dataMap.get(item.CHART_DATE).stockCount = item.STOCKCOUNT || 0;
      } else {
        dataMap.set(item.CHART_DATE, {
          date: item.CHART_DATE,
          signupCount: 0,
          withdrawCount: 0,
          stockCount: item.STOCKCOUNT || 0,
        });
      }
    });

    // Map을 배열로 변환하고 날짜순 정렬
    return Array.from(dataMap.values()).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  };

  // API 호출 함수
  const fetchChartData = async () => {
    let loadingToastId;
    try {
      // 데이터 로딩 시작 toast (자동 닫힘)
      loadingToastId = toast.info(
        <div>
          <div className="toast-info-body">차트 데이터를 불러오는 중...</div>
        </div>,
        { autoClose: false }
      );

      const [signupResponse, withdrawResponse, stockResponse] =
        await Promise.all([
          axiosAPI.get("member/signupChart"),
          axiosAPI.get("member/withdrawChart"),
          axiosAPI.get("stock/stockChart"),
        ]);

      const mergedData = mergeChartData(
        signupResponse.data || [],
        withdrawResponse.data || [],
        stockResponse.data || []
      );

      setChartData(mergedData);

      // 로딩 토스트 닫기
      toast.dismiss(loadingToastId);

      // 데이터 로딩 성공 toast
      toast.success(
        <div>
          <div className="toast-success-title">데이터 로딩 완료!</div>
          <div className="toast-success-body">
            회원 가입/탈퇴 및 분양정보 차트 데이터를 성공적으로 불러왔습니다.
          </div>
        </div>,
        { autoClose: 3000 }
      );
    } catch (err) {
      console.error("차트 데이터 로딩 에러:", err);
      setError(err.message || "데이터 로드 중 오류가 발생했습니다.");

      // 로딩 토스트 닫기
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
    }
  };

  // 데이터 새로고침 함수
  const handleRefresh = async () => {
    setError(null);
    setChartData([]);

    const refreshToastId = toast.warning(
      <div>
        <div className="toast-warning-body">
          차트 데이터를 다시 불러옵니다...
        </div>
      </div>,
      { autoClose: false }
    );

    try {
      await fetchChartData();
      toast.dismiss(refreshToastId);
    } catch (err) {
      toast.dismiss(refreshToastId);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        await fetchChartData();
      } catch (err) {
        setError(err.message || "데이터 로드 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <h2>데이터 로딩 중...</h2>
        <p>회원 가입/탈퇴 및 분양정보 차트를 준비하고 있습니다.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <h2>오류가 발생했습니다</h2>
        <p>{error}</p>
        <button
          onClick={handleRefresh}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          다시 불러오기
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>Zipinfo 회원 가입/탈퇴 및 분양정보 추이</h2>
        <button
          className="nb-searcbar-refresh-btn"
          onClick={handleRefresh}
          style={{
            padding: "8px",
            backgroundColor: "transparent",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={refresh}
            alt="새로고침"
            style={{ width: "20px", height: "20px" }}
          />
        </button>
      </div>

      {/* 데이터가 없을 때 메시지 */}
      {chartData.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>표시할 데이터가 없습니다.</p>
          <button
            onClick={handleRefresh}
            style={{
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            데이터 다시 불러오기
          </button>
        </div>
      ) : (
        /* 차트 렌더링 */
        <ResponsiveContainer width="100%" height={500}>
          <AreaChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#888" fontSize={12} />
            <YAxis domain={[0, 20]} stroke="#888" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Area
              type="monotone"
              dataKey="signupCount"
              stroke="#4ecdc4"
              fill="url(#signupGradient)"
              fillOpacity={1}
              strokeWidth={2}
              name="가입회원"
            />
            <Area
              type="monotone"
              dataKey="withdrawCount"
              stroke="#ff6b6b"
              fill="url(#withdrawGradient)"
              fillOpacity={1}
              strokeWidth={2}
              name="탈퇴회원"
            />
            <Area
              type="monotone"
              dataKey="stockCount"
              stroke="#ffa726"
              fill="url(#stockGradient)"
              fillOpacity={1}
              strokeWidth={2}
              name="분양등록"
            />
            {/* 그라데이션 정의 */}
            <defs>
              <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4ecdc4" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#4ecdc4" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="withdrawGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff6b6b" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#ff6b6b" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffa726" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#ffa726" stopOpacity={0.1} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      )}
    </>
  );
}

export default Chart;
