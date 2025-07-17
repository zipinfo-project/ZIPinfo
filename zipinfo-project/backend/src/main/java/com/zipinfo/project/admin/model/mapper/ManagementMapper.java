package com.zipinfo.project.admin.model.mapper;

import com.zipinfo.project.member.model.dto.Member;
import com.zipinfo.project.admin.model.dto.BrokerApplicationDTO;
import com.zipinfo.project.neighborhood.model.dto.Neighborhood;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 관리자의 회원 및 중개인 신청 관련 DB 접근 매퍼 인터페이스
 * MyBatis가 SQL 매핑을 통해 DB 조작을 수행
 */
@Mapper
public interface ManagementMapper {

    /**
     * 삭제되지 않은 전체 회원 조회
     * @return 회원 목록 반환
     */
    List<Member> selectAllMembers();

    /**
     * 논리 삭제된 회원 목록 조회
     * @return 삭제된 회원 목록 반환
     */
    List<Member> selectDeletedMembers();

    /**
     * 중개인 권한 신청 내역 조회
     * @return 중개인 신청 DTO 리스트 반환
     */
    List<BrokerApplicationDTO> selectBrokerApplications();
    
    /**
     * 중개인 정보(BROKER_INFO) 신규 저장
     * @param memberNo 회원 번호
     * @param companyName 회사명
     * @param officeLocation 사무소 위치
     * @return 삽입 성공 건수 반환
     */
    int insertBrokerInfo(@Param("memberNo") Long memberNo,
                         @Param("companyName") String companyName,
                         @Param("officeLocation") String officeLocation);

    /**
     * 특정 회원의 중개인 신청 상태 업데이트
     * @param memberNo 회원 번호 (PK)
     * @param status 신청 상태 ("승인", "거절" 등)
     * @return 영향 받은 행 수 (1 이상이면 성공)
     */
    int updateBrokerApplicationStatus(@Param("memberNo") Long memberNo, @Param("status") String status);

    /**
     * 회원 권한(authId) 변경
     * @param memberNo 회원 번호 (PK)
     * @param authId 변경할 권한 ID (0: 관리자, 1: 일반회원, 2: 중개인 신청, 3: 중개인)
     * @return 영향 받은 행 수 반환
     */
    int updateMemberAuth(@Param("memberNo") Long memberNo, @Param("authId") int authId);

    /**
     * 회원 차단 여부 설정
     * @param memberNo 회원 번호 (PK)
     * @param block 차단 여부 (true: 차단, false: 해제)
     * @return 영향 받은 행 수 반환
     */
    int toggleBlockMember(@Param("memberNo") Long memberNo, @Param("block") boolean block);

    /**
     * 회원 논리 삭제 처리
     * @param memberNo 회원 번호 (PK)
     * @return 영향 받은 행 수 반환
     */
    int deleteMember(@Param("memberNo") Long memberNo);

    /**
     * 논리 삭제된 회원 복원
     * @param memberNo 회원 번호 (PK)
     * @return 영향 받은 행 수 반환
     */
    int restoreMember(@Param("memberNo") Long memberNo);

    /**
     * 삭제된 게시글 목록 조회
     * @return 삭제된 게시글 목록 반환
     */
    List<Neighborhood> selectDeletedBoards();

    /**
     * 삭제된 게시글 복구
     * @param boardNo 게시글 번호 (PK)
     * @return 영향 받은 행 수 반환
     */
    int restoreBoard(@Param("boardNo") Long boardNo);

    /**
     * 삭제된 게시글 상세 조회
     * @param boardNo 게시글 번호 (PK)
     * @return 삭제된 게시글 상세 정보
     */
    Neighborhood selectDeletedBoardDetail(@Param("boardNo") Long boardNo);

    /**
     * 삭제된 게시글 영구 삭제
     * @param boardNo 게시글 번호 (PK)
     * @return 영향 받은 행 수 반환
     */
    int permanentlyDeleteBoard(@Param("boardNo") Long boardNo);

    /**
     * 회원 영구 삭제
     * @param memberNo 회원 번호 (PK)
     * @return 영향 받은 행 수 반환
     */
    int permanentlyDeleteMember(@Param("memberNo") Long memberNo);

    /**
     * 회원 관련 STOCK_SAW 데이터 삭제
     */
    int deleteMemberStockSaw(@Param("memberNo") Long memberNo);
    /**
     * 회원 관련 LIKE 데이터 삭제
     */
    int deleteMemberLikes(@Param("memberNo") Long memberNo);
    /**
     * 회원 관련 COMMENT 데이터 삭제
     */
    int deleteMemberComments(@Param("memberNo") Long memberNo);
    /**
     * 회원 관련 BOARD 데이터 삭제
     */
    int deleteMemberBoards(@Param("memberNo") Long memberNo);
    /**
     * 회원 관련 TOKEN_INFO 데이터 삭제
     */
    int deleteMemberTokenInfo(@Param("memberNo") Long memberNo);
    /**
     * 회원 관련 BROKER_INFO 데이터 삭제
     */
    int deleteMemberBrokerInfo(@Param("memberNo") Long memberNo);
    /**
     * 회원 관련 HELP_MESSAGE 데이터 삭제
     */
    int deleteMemberHelpMessage(@Param("memberNo") Long memberNo);
    /**
     * 회원 관련 MESSAGE_FILE 데이터 삭제
     */
    int deleteMemberMessageFiles(@Param("memberNo") Long memberNo);

    /**
     * 회원 관련 STOCK_INFO 데이터 삭제
     */

	String findBrokerNumberByEmail(@Param("memberEmail") String memberEmail);

	int deleteCommentLike(Long memberNo);

	int deleteStockCoord(int stockNo);

	int deleteStockSellDate(int stockNo);

	int deleteStockImg(int stockNo);

	int deleteLikeStock(Long memberNo);
	
	int deleteMemberStockInfo(Long memberNo);

	List<Integer> selectStockNo(Long memberNo);

	int deleteBoardLike(Long boardNo);

	int deleteComment(Long boardNo);
}