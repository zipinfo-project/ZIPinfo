package com.zipinfo.project.admin.model.service;

import com.zipinfo.project.member.model.dto.Member;
import com.zipinfo.project.admin.model.dto.BrokerApplicationDTO;
import com.zipinfo.project.neighborhood.model.dto.Neighborhood;
import com.zipinfo.project.admin.model.mapper.ManagementMapper;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 관리자 서비스 구현체 ManagementMapper를 통해 DB와 연동하여 회원 및 중개인 신청 관련 업무 수행
 */
@Service
@Slf4j
public class ManagementServiceImpl implements ManagementService {

	// ManagementMapper 주입 (DAO 역할)
	private final ManagementMapper managementMapper;

	/**
	 * 생성자 주입 방식으로 ManagementMapper 의존성 주입
	 * 
	 * @param managementMapper 매퍼 인터페이스
	 */
	public ManagementServiceImpl(ManagementMapper managementMapper) {
		this.managementMapper = managementMapper;
	}

	/**
	 * 삭제되지 않은 전체 회원 목록 조회
	 * 
	 * @return 삭제되지 않은 회원 리스트 반환
	 */
	@Override
	public List<Member> getAllMembers() {
		return managementMapper.selectAllMembers();
	}

	/**
	 * 논리 삭제된 회원 목록 조회
	 * 
	 * @return 삭제된 회원 리스트 반환
	 */
	@Override
	public List<Member> getDeletedMembers() {
		return managementMapper.selectDeletedMembers();
	}

	/**
	 * 중개인 권한 신청 목록 조회
	 * 
	 * @return 중개인 신청 정보 리스트 반환
	 */
	@Override
	public List<BrokerApplicationDTO> getBrokerApplications() {
		log.info("getBrokerApplications 서비스 호출");
		List<BrokerApplicationDTO> list = managementMapper.selectBrokerApplications();
		log.info("조회된 신청 개수: {}", list.size());
		return list;
	}

	/**
	 * 중개인 신청 상태 업데이트 (사용하지 않거나 필요시 구현)
	 * 
	 * @param memberNo 회원 번호
	 * @param status   신청 상태 문자열 ("승인", "거절" 등)
	 * @return 업데이트 성공 건수 (1 이상이면 성공)
	 */
	@Override
	public int updateBrokerApplicationStatus(Long memberNo, String status) {
		return managementMapper.updateBrokerApplicationStatus(memberNo, status);
	}

	/**
	 * 중개인 신청 승인 처리 - 회원 권한 MEMBER_AUTH를 3(중개인)으로 변경 - BROKER_INFO 테이블에 중개인 상세 정보 등록
	 * (추가 구현 필요)
	 * 
	 * @param dto 중개인 신청 정보 포함 DTO (회원번호, 회사명, 사무소 위치 등)
	 * @return 승인 성공 여부
	 */
	@Override
	public boolean approveBroker(BrokerApplicationDTO dto) {
		// 1. 회원 권한을 중개인(3)으로 변경
		int updated = managementMapper.updateMemberAuth((long) dto.getMemberNumber(), 3);
		if (updated < 1) {
			return false;
		}
		// 2. BROKER_INFO 테이블에 중개인 상세 정보 저장 로직 구현 필요 (예:
		// managementMapper.insertBrokerInfo(dto))
		// 현재는 예시로 성공 처리만 함
		// TODO: 중개인 상세 정보 저장 매퍼 메서드 추가 후 호출 권장
		return true;
	}

	/**
	 * 중개인 신청 거절 처리 - 회원 권한 MEMBER_AUTH를 1(일반회원)으로 변경
	 * 
	 * @param memberNo 회원 번호
	 * @return 거절 성공 여부
	 */
	@Override
	public boolean rejectBroker(int memberNo) {
		int updated = managementMapper.updateMemberAuth((long) memberNo, 1);
		return updated > 0;
	}

	/**
	 * 회원 권한 변경 처리
	 * 
	 * @param memberNo 회원 번호
	 * @param authId   권한 ID (0: 관리자, 1: 일반회원, 2: 중개인 신청, 3: 중개인)
	 * @return 업데이트 성공 건수 (1 이상 성공)
	 */
	@Override
	public int updateMemberAuth(Long memberNo, int authId) {
		return managementMapper.updateMemberAuth(memberNo, authId);
	}

	/**
	 * 회원 차단 또는 차단 해제 처리
	 * 
	 * @param memberNo 회원 번호
	 * @param block    true: 차단, false: 차단 해제
	 * @return 업데이트 성공 건수 (1 이상 성공)
	 */
	@Override
	public int toggleBlockMember(Long memberNo, boolean block) {
		return managementMapper.toggleBlockMember(memberNo, block);
	}

	/**
	 * 회원 삭제 (논리 삭제) 처리
	 * 
	 * @param memberNo 회원 번호
	 * @return 삭제 성공 건수 (1 이상 성공)
	 */
	@Override
	public int deleteMember(Long memberNo) {
		return managementMapper.deleteMember(memberNo);
	}

	/**
	 * 논리 삭제된 회원 복원 처리
	 * 
	 * @param memberNo 회원 번호
	 * @return 복원 성공 건수 (1 이상 성공)
	 */
	@Override
	public int restoreMember(Long memberNo) {
		try {
			return managementMapper.restoreMember(memberNo);
		} catch (Exception e) {
			log.error("회원 복원 중 오류 발생: memberNo={}, error={}", memberNo, e.getMessage(), e);
			throw e; // 또는 적절히 예외 처리 후 반환
		}
	}

	/**
	 * 삭제된 게시글 목록 조회
	 * 
	 * @return 삭제된 게시글 리스트
	 */
	@Override
	public List<Neighborhood> getDeletedBoards() {
		return managementMapper.selectDeletedBoards();
	}

	/**
	 * 삭제된 게시글 복구 처리
	 * 
	 * @param boardNo 게시글 번호
	 * @return 복구 성공 건수 (1 이상 성공)
	 */
	@Override
	public int restoreBoard(Long boardNo) {
		try {
			return managementMapper.restoreBoard(boardNo);
		} catch (Exception e) {
			log.error("게시글 복구 중 오류 발생: boardNo={}, error={}", boardNo, e.getMessage(), e);
			throw e;
		}
	}

	/**
	 * 삭제된 게시글 상세 조회
	 * 
	 * @param boardNo 게시글 번호
	 * @return 삭제된 게시글 상세 정보
	 */
	@Override
	public Neighborhood getDeletedBoardDetail(Long boardNo) {
		return managementMapper.selectDeletedBoardDetail(boardNo);
	}

	/**
	 * 삭제된 게시글 영구 삭제 처리
	 * 
	 * @param boardNo 게시글 번호
	 * @return 삭제 성공 건수 (1 이상 성공)
	 */
	@Override
	public int permanentlyDeleteBoard(Long boardNo) {
		try {
			managementMapper.deleteBoardLike(boardNo);
			managementMapper.deleteComment(boardNo);
			return managementMapper.permanentlyDeleteBoard(boardNo);
		} catch (Exception e) {
			log.error("게시글 영구 삭제 중 오류 발생: boardNo={}, error={}", boardNo, e.getMessage(), e);
			throw e;
		}
	}

	/**
	 * 회원 영구 삭제 처리
	 * 
	 * @param memberNo 회원 번호
	 * @return 삭제 성공 건수 (1 이상 성공)
	 */
	@Override
	public int permanentlyDeleteMember(Long memberNo) {
		try {
			List<Integer> stockNoList = managementMapper.selectStockNo(memberNo);
			
			for(int stockNo : stockNoList) {
				managementMapper.deleteStockSellDate(stockNo);  
				managementMapper.deleteStockCoord(stockNo);  
				managementMapper.deleteStockImg(stockNo);  
			}
			
			managementMapper.deleteMemberStockSaw(memberNo);
			managementMapper.deleteMemberLikes(memberNo);
			managementMapper.deleteMemberComments(memberNo);
			managementMapper.deleteCommentLike(memberNo);
			managementMapper.deleteMemberBoards(memberNo);
			managementMapper.deleteMemberTokenInfo(memberNo);
			managementMapper.deleteMemberBrokerInfo(memberNo);
			managementMapper.deleteMemberMessageFiles(memberNo); // ★ 파일 먼저 삭제
			managementMapper.deleteMemberHelpMessage(memberNo);  // 메시지 삭제
			managementMapper.deleteLikeStock(memberNo);  
			managementMapper.deleteMemberStockInfo(memberNo);
			managementMapper.deleteMemberLikeStock(memberNo); // LIKE_STOCK 삭제 추가
			return managementMapper.permanentlyDeleteMember(memberNo);
		} catch (Exception e) {
			log.error("회원 영구 삭제 중 오류 발생: memberNo={}, error={}", memberNo, e.getMessage(), e);
			throw e;
		}
	}

	
	@Override
	public String findBrokerNumberByEmail(String memberEmail) {
		// TODO Auto-generated method stub
		return managementMapper.findBrokerNumberByEmail(memberEmail);
	}
}
