package com.zipinfo.project.admin.controller;

import com.zipinfo.project.member.model.dto.Member;
import com.zipinfo.project.admin.model.dto.BrokerApplicationDTO;
import com.zipinfo.project.neighborhood.model.dto.Neighborhood;
import com.zipinfo.project.admin.model.service.ManagementService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 관리자용 회원 관리 및 중개인 권한 신청 관련 API 컨트롤러
 * 
 * 기본 경로: /admin/management
 */
@RestController
@RequestMapping("/admin/management")
public class ManagementController {

    private final ManagementService managementService;

    public ManagementController(ManagementService managementService) {
        this.managementService = managementService;
    }

    /**
     * 전체 회원 목록 조회 (삭제되지 않은 회원)
     * GET /admin/management/members
     */
    @GetMapping("/members")
    public ResponseEntity<List<Member>> getMembers() {
        List<Member> members = managementService.getAllMembers();
        return ResponseEntity.ok(members);
    }

    /**
     * 삭제된 회원 목록 조회
     * GET /admin/management/members/deleted
     */
    @GetMapping("/members/deleted")
    public ResponseEntity<List<Member>> getDeletedMembers() {
        List<Member> deletedMembers = managementService.getDeletedMembers();
        return ResponseEntity.ok(deletedMembers);
    }

    /**
     * 중개인 권한 신청 목록 조회
     * GET /admin/management/broker-applications
     */
    @GetMapping("/broker-applications")
    public ResponseEntity<List<BrokerApplicationDTO>> getBrokerApplications() {
        System.out.println("중개인 신청 목록 API 호출됨");
        List<BrokerApplicationDTO> list = managementService.getBrokerApplications();
        System.out.println("신청 개수: " + list.size());
        return ResponseEntity.ok(list);
    }

    /**
     * 중개인 신청 승인 처리
     * POST /admin/management/broker-applications/{memberNo}/approve
     * BODY: BrokerApplicationDTO (회사명, 사무소 위치 등 포함)
     */
    @PostMapping("/broker-applications/{memberNo}/approve")
    public ResponseEntity<String> approveBrokerApplication(
            @PathVariable("memberNo") Long memberNo,
            @RequestBody BrokerApplicationDTO dto) {

        dto.setMemberNumber(memberNo.intValue());

        boolean success = managementService.approveBroker(dto);
        if (success) {
            return ResponseEntity.ok("중개인 신청이 승인되었습니다.");
        }
        return ResponseEntity.badRequest().body("중개인 승인 처리 실패");
    }

    /**
     * 중개인 신청 거절 처리
     * PUT /admin/management/broker-applications/{memberNo}/reject
     */
    @PutMapping("/broker-applications/{memberNo}/reject")
    public ResponseEntity<String> rejectBrokerApplication(@PathVariable("memberNo") Long memberNo) {

        boolean success = managementService.rejectBroker(memberNo.intValue());
        if (success) {
            return ResponseEntity.ok("중개인 신청이 거절되었습니다.");
        }
        return ResponseEntity.badRequest().body("중개인 신청 거절 처리 실패");
    }

    /**
     * 회원 권한 변경 처리
     * PUT /admin/management/members/{memberNo}/role?authId={권한번호}
     * 예: 관리자(0), 일반회원(1), 중개인 신청(2), 중개인(3)
     */
    @PutMapping("/members/{memberNo}/role")
    public ResponseEntity<String> updateMemberRole(
            @PathVariable("memberNo") Long memberNo,
            @RequestParam("authId") int authId) {

        int result = managementService.updateMemberAuth(memberNo, authId);
        if (result > 0) {
            return ResponseEntity.ok("회원 권한이 변경되었습니다.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("회원 권한 변경 실패");
        }
    }


    /**
     * 회원 삭제 (논리 삭제)
     * DELETE /admin/management/members/{memberNo}
     * @param memberNo 회원 번호
     */
    @DeleteMapping("/members/{memberNo}")
    public ResponseEntity<String> deleteMember(@PathVariable("memberNo") Long memberNo) {
        int result = managementService.deleteMember(memberNo);
        if (result > 0) {
            return ResponseEntity.ok("삭제 성공");
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("삭제 실패");
        }
    }

    /**
     * 회원 복원
     * PUT /admin/management/members/{memberNo}/restore
     * @param memberNo 회원 번호
     */
    @PutMapping("/members/{memberNo}/restore")
    public ResponseEntity<?> restoreMember(@PathVariable("memberNo") Long memberNo) {
        System.out.println("복원 요청 memberNo = " + memberNo);
        int result = managementService.restoreMember(memberNo);
        System.out.println("복원 결과 = " + result);
        if (result > 0) {
            return ResponseEntity.ok("회원이 복원되었습니다.");
        }
        return ResponseEntity.badRequest().body("회원 복원 실패");
    }

    /**
     * 회원 영구 삭제
     * DELETE /admin/management/members/{memberNo}/permanent
     * @param memberNo 회원 번호
     */
    @DeleteMapping("/members/{memberNo}/permanent")
    public ResponseEntity<String> permanentlyDeleteMember(@PathVariable("memberNo") Long memberNo) {
        try {
            int result = managementService.permanentlyDeleteMember(memberNo);
            if (result > 0) {
                return ResponseEntity.ok("회원이 영구적으로 삭제되었습니다.");
            }
            return ResponseEntity.badRequest().body("회원을 찾을 수 없습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("회원 삭제 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 삭제된 게시글 목록 조회
     * GET /admin/management/boards/deleted
     */
    @GetMapping("/boards/deleted")
    public ResponseEntity<List<Neighborhood>> getDeletedBoards() {
        List<Neighborhood> deletedBoards = managementService.getDeletedBoards();
        return ResponseEntity.ok(deletedBoards);
    }

    /**
     * 삭제된 게시글 복구
     * PUT /admin/management/boards/{boardNo}/restore
     * @param boardNo 게시글 번호
     */
    @PutMapping("/boards/{boardNo}/restore")
    public ResponseEntity<String> restoreBoard(@PathVariable("boardNo") Long boardNo) {
        int result = managementService.restoreBoard(boardNo);
        if (result > 0) {
            return ResponseEntity.ok("게시글이 복구되었습니다.");
        }
        return ResponseEntity.badRequest().body("게시글 복구 실패");
    }

    /**
     * 삭제된 게시글 상세 조회
     * GET /admin/management/boards/{boardNo}/detail
     * @param boardNo 게시글 번호
     */
    @GetMapping("/boards/{boardNo}/detail")
    public ResponseEntity<Neighborhood> getDeletedBoardDetail(@PathVariable("boardNo") Long boardNo) {
        Neighborhood board = managementService.getDeletedBoardDetail(boardNo);
        if (board != null) {
            return ResponseEntity.ok(board);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * 삭제된 게시글 영구 삭제
     * DELETE /admin/management/boards/{boardNo}/permanent
     * @param boardNo 게시글 번호
     */
    @DeleteMapping("/boards/{boardNo}/permanent")
    public ResponseEntity<String> permanentlyDeleteBoard(@PathVariable("boardNo") Long boardNo) {
        int result = managementService.permanentlyDeleteBoard(boardNo);
        if (result > 0) {
            return ResponseEntity.ok("게시글이 영구적으로 삭제되었습니다.");
        }
        return ResponseEntity.badRequest().body("게시글 영구 삭제 실패");
    }

    
    @GetMapping("/selectBrokerNo")
    public ResponseEntity<Map<String, Object>> selectBrokerNo(@RequestParam("email") String memberEmail) {
        try {
            // 이메일로 중개사번호 조회 로직
            String brokerNo = managementService.findBrokerNumberByEmail(memberEmail);
            System.out.println("이메일로 중개사번호 조회 로직 중");
            if (brokerNo != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("brokerNo", brokerNo);
                System.out.println(response);
                return ResponseEntity.ok(response);
            } else {
                // 중개사번호가 없는 경우
                Map<String, Object> response = new HashMap<>();
                response.put("brokerNo", null);
                return ResponseEntity.ok(response);
            }
            
        } catch (Exception e) {
            // 에러 발생 시
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "중개사번호 조회 실패");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}