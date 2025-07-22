# ZipInfo - 부동산 정보 통합 플랫폼

<div align="center">
  <img src="https://img.shields.io/badge/Platform-Real%20Estate-blue?style=for-the-badge" alt="Platform">
  <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Auth-Kakao%20%7C%20Naver-yellow?style=for-the-badge" alt="Authentication">
</div>

## 프로젝트 소개

**부동산은 언제나 대한민국의 핵심 이슈였으며, 현재진행형이고 미래입니다.**

ZipInfo는 복잡한 부동산 시장에서 투명하고 신뢰할 수 있는 정보를 제공하는 통합 플랫폼입니다. 다양한 시공사의 분양정보부터 중개자의 실거래 정보까지, 부동산과 관련된 모든 정보를 한 곳에서 만날 수 있습니다.

---

## 주요 기능

### **스마트 인증 시스템**
- **OAuth 2.0 소셜 로그인**: 카카오, 네이버 간편 로그인 지원
- **Kakao SDK**: JavaScript SDK를 활용한 매끄러운 로그인 UX
- **이메일 인증**: 중개자 회원가입 시 필수 본인확인

### **고급 에디터 & 콘텐츠 관리**
- **Summernote 0.9.1**: WYSIWYG 에디터로 풍부한 게시글 작성
- **React Toastify**: 실시간 알림 및 사용자 피드백
- **React Modal**: 직관적인 모달 컴포넌트
- **Recharts**: 데이터 시각화 및 통계 차트
- **Lucide React**: 모던한 아이콘 시스템
- 이미지 업로드 및 멀티미디어 콘텐츠 지원

### **실시간 통신**
- **Spring WebSocket**: 실시간 양방향 통신
- **STOMP.js & SockJS**: 안정적인 웹소켓 연결
- **실시간 알림**: 관심 지역 새 게시글 즉시 알림
- **라이브 채팅**: 사용자 간 실시간 소통 지원

### **우리동네 게시판**
- 전국 시·군·구별 지역 정보 공유
- **스마트 알림**: 관심 지역 설정 시 새 게시글 자동 알림
- 지역 커뮤니티 기반의 생생한 정보 교환

### **분양 정보 센터**
- 전국 분양 정보 통합 제공
- 시공사별 분양 일정 및 조건 안내

### **실거래가 정보**
- **일반 사용자**: 실거래 가능 매물 정보 열람
- **중개자**: 보유 매물 등록·수정·삭제 관리
- 투명한 거래 정보 제공으로 시장 신뢰도 향상

### **지도 기반 서비스 & 공공데이터 연동**
- **카카오맵 API** 연동으로 직관적인 위치 정보 제공
- **V-World API**: 공간정보 오픈플랫폼 연동으로 정확한 지역 정보
- **공공데이터포털**: 정부 공식 부동산 데이터 실시간 연동
- **시군구 조회 시스템**: 전국 행정구역별 세밀한 정보 제공
- 분양 및 실거래 정보의 지도상 시각화
- 주변 시설 (편의점, 병원, 주유소 등) 및 교통 접근성 정보

### **마이페이지**
- **내 정보 관리**: 개인정보(이름, 닉네임) 및 계정 정보 수정
- **관심 매물**: 찜한 분양·실거래 매물 북마크 관리
- **등의내역**: (중개자 전용) 등록한 매물 및 거래 현황 조회
- **내가 쓴 글**: 작성한 게시글 통합 관리 및 수정·삭제
- **비밀번호 재설정**: 보안을 위한 비밀번호 변경
- **회원탈퇴**: 계정 삭제 및 개인정보 완전 삭제
- **선호 지역 설정**: 우리동네 게시판 알림을 위한 관심 지역 선택
- **사무소 정보 관리**: (중개자 전용) 부동산 사무소명, 주소, 대표명 등록

### **관리자 대시보드**
- 회원 관리 및 게시글 모니터링
- 회원 및 거래 매물 통계 분석
- **중개자 검증 시스템**: 실제 중개 등록번호 확인을 통한 사이트 무결성 보장

---

## 신뢰성과 보안

ZipInfo는 사용자의 안전한 부동산 거래를 위해 다음과 같은 검증 시스템을 운영합니다:

- **2단계 중개자 인증**: 이메일 인증 + 관리자 승인
- **실명 기반 거래**: 허위 정보 방지를 위한 본인 인증
- **지속적인 모니터링**: 관리자의 실시간 콘텐츠 관리

---

## 기술 스택

### Frontend
<div align="center">
  <img src="https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Vite-6.3.5-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/React%20Router-7.6.2-CA4245?style=flat-square&logo=reactrouter&logoColor=white" alt="React Router">
  <img src="https://img.shields.io/badge/Bootstrap-5.3.7-7952B3?style=flat-square&logo=bootstrap&logoColor=white" alt="Bootstrap">
  <img src="https://img.shields.io/badge/Axios-1.10.0-5A29E4?style=flat-square&logo=axios&logoColor=white" alt="Axios">
</div>

### UI/UX Libraries
<div align="center">
  <img src="https://img.shields.io/badge/Summernote-0.9.1-FF8C00?style=flat-square&logoColor=white" alt="Summernote">
  <img src="https://img.shields.io/badge/React%20Toastify-11.0.5-F56565?style=flat-square&logoColor=white" alt="React Toastify">
  <img src="https://img.shields.io/badge/Recharts-2.15.3-8884D8?style=flat-square&logoColor=white" alt="Recharts">
  <img src="https://img.shields.io/badge/React%20Modal-3.16.3-61DAFB?style=flat-square&logoColor=white" alt="React Modal">
  <img src="https://img.shields.io/badge/Lucide%20React-0.516.0-F56565?style=flat-square&logoColor=white" alt="Lucide React">
</div>

### Backend
<div align="center">
  <img src="https://img.shields.io/badge/Java-21-ED8B00?style=flat-square&logo=java&logoColor=white" alt="Java">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.4.5-6DB33F?style=flat-square&logo=springboot&logoColor=white" alt="Spring Boot">
  <img src="https://img.shields.io/badge/Spring%20Security-6-6DB33F?style=flat-square&logo=springsecurity&logoColor=white" alt="Spring Security">
  <img src="https://img.shields.io/badge/MyBatis-3.0.4-000000?style=flat-square&logoColor=white" alt="MyBatis">
  <img src="https://img.shields.io/badge/Oracle-F80000?style=flat-square&logo=oracle&logoColor=white" alt="Oracle">
</div>

### Real-time Communication
<div align="center">
  <img src="https://img.shields.io/badge/WebSocket-Spring-6DB33F?style=flat-square&logo=websocket&logoColor=white" alt="WebSocket">
  <img src="https://img.shields.io/badge/STOMP.js-7.1.1-FF6B6B?style=flat-square&logoColor=white" alt="STOMP.js">
  <img src="https://img.shields.io/badge/SockJS-1.6.1-010101?style=flat-square&logoColor=white" alt="SockJS">
</div>

### Security & Authentication
<div align="center">
  <img src="https://img.shields.io/badge/JWT-0.11.5-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" alt="JWT">
  <img src="https://img.shields.io/badge/OAuth%202.0-4285F4?style=flat-square&logo=google&logoColor=white" alt="OAuth">
</div>

### External APIs
<div align="center">
  <img src="https://img.shields.io/badge/Kakao%20Map-FFCD00?style=flat-square&logo=kakao&logoColor=black" alt="Kakao Map">
  <img src="https://img.shields.io/badge/Kakao%20OAuth-FFCD00?style=flat-square&logo=kakao&logoColor=black" alt="Kakao OAuth">
  <img src="https://img.shields.io/badge/Naver%20OAuth-03C75A?style=flat-square&logo=naver&logoColor=white" alt="Naver OAuth">
  <img src="https://img.shields.io/badge/V--World%20API-0066CC?style=flat-square&logoColor=white" alt="V-World API">
  <img src="https://img.shields.io/badge/공공데이터포털-336699?style=flat-square&logoColor=white" alt="Public Data Portal">
</div>

### Development Tools
<div align="center">
  <img src="https://img.shields.io/badge/Lombok-CA4245?style=flat-square&logoColor=white" alt="Lombok">
  <img src="https://img.shields.io/badge/Spring%20AOP-6DB33F?style=flat-square&logo=spring&logoColor=white" alt="Spring AOP">
  <img src="https://img.shields.io/badge/Jsoup-1.20.1-43B02A?style=flat-square&logoColor=white" alt="Jsoup">
  <img src="https://img.shields.io/badge/ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white" alt="ESLint">
  <img src="https://img.shields.io/badge/Husky-9.1.7-000000?style=flat-square&logoColor=white" alt="Husky">
</div>

### Infrastructure & Deployment
<div align="center">
  <img src="https://img.shields.io/badge/AWS-FF9900?style=flat-square&logo=amazonaws&logoColor=white" alt="AWS">
  <img src="https://img.shields.io/badge/Domain-zipinfo.site-blue?style=flat-square&logoColor=white" alt="Domain">
</div>

---

## 서비스 화면

**메인 페이지**
![메인 페이지](https://github.com/user-attachments/assets/0a4a3e30-b0e7-4cfd-8864-3643951b8213)

**분양 정보**
![분양 정보](https://github.com/user-attachments/assets/ac79324f-2ba3-47e1-b2b0-8ac560331004)

**실거래 정보**
![실거래 정보](https://github.com/user-attachments/assets/4da70c5e-f6eb-423a-8dc5-ab969d609e3e)

**지역 게시판**
<img width="907" height="569" alt="image" src="https://github.com/user-attachments/assets/24151f74-4ce5-4bd4-846b-41f5116c21c6" />

**마이페이지**
<img width="1161" height="829" alt="image" src="https://github.com/user-attachments/assets/7d544098-ee60-429e-9eda-8e351c838540" />

---

## 향후 계획

- [ ] 구글 로그인 구현
- [ ] 모바일 앱 버전 개발 (반응형)
- [ ] 지역별 시세 차트
- [ ] 지역별 부동산 관련 뉴스
- [ ] 부동산 투자 분석 도구 추가
- [ ] 실시간 채팅 상담 서비스

---

## 문의 및 지원

부동산 정보의 새로운 패러다임, **ZipInfo**를 많이 이용해 주세요!

**서비스 바로가기**: [zipinfo.site](https://www.zipinfo.site)

<div align="center">
  <a href="https://www.zipinfo.site"><img src="https://img.shields.io/badge/Website-zipinfo.site-blue?style=for-the-badge" alt="Website"></a>
  <a href="mailto:contact@zipinfo.site"><img src="https://img.shields.io/badge/Email-contact@zipinfo.site-red?style=for-the-badge" alt="Email"></a>
  <a href="#"><img src="https://img.shields.io/badge/KakaoTalk-@zipinfo-yellow?style=for-the-badge" alt="KakaoTalk"></a>
</div>

---

<div align="center">
  <sub>Built with ❤️ for Korean Real Estate Market</sub><br>
  <sub>© 2025 ZipInfo. All rights reserved.</sub>
</div>
