package com.zipinfo.project.admin.controller;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.zipinfo.project.admin.model.dto.HelpMessage;
import com.zipinfo.project.admin.model.service.HelpMessageService;
import com.zipinfo.project.member.model.dto.Member;

import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RestController
@RequestMapping("/api/help")
@RequiredArgsConstructor
public class HelpMessageController {

    private final HelpMessageService helpMessageService;

    @Value("${my.message.folder-path}")
    private String messageFolderPath;

    /** 문의 리스트 */
    @GetMapping("/list")
    public ResponseEntity<List<HelpMessage>> getAllMessages() {
        return ResponseEntity.ok(helpMessageService.getAllMessages());
    }

    /** 문의 답변 상세 조회 */
    @GetMapping("/reply")
    public ResponseEntity<?> getInquiryReply(@RequestParam("messageNo") int messageNo) {
        try {
            HelpMessage fullMessage = helpMessageService.getMessageWithReply(messageNo);
            if (fullMessage == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(fullMessage);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("서버 오류 발생: " + e.getMessage());
        }
    }

    /** 답변 등록 */
    @PostMapping("/reply")
    public ResponseEntity<?> postReply(@AuthenticationPrincipal Member loginMember,
                                       @RequestBody HelpMessage message) {
        if (loginMember == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        
        // 답변 내용 검증
        if (message.getReplyContent() == null || message.getReplyContent().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("답변 내용을 입력해주세요.");
        }
        
        if (message.getReplyContent().length() > 2000) {
            return ResponseEntity.badRequest().body("답변은 2000자 이내로 작성해주세요.");
        }
        
        System.out.println("로그인 회원 번호: " + loginMember.getMemberNo());
        System.out.println("받은 메시지 내용: " + message);

        message.setSenderNo(loginMember.getMemberNo());
        message.setReceiverNo(loginMember.getMemberNo()); // 반드시 로그인한 관리자 번호로 저장
        boolean success = helpMessageService.saveReply(message);

        return success
            ? ResponseEntity.ok("답변 등록 성공")
            : ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("답변 등록 실패");
    }



    /** 미답변 목록 조회 */
    @GetMapping("/unanswered")
    public List<HelpMessage> getUnanswered(@RequestParam("adminId") int adminId) {
        return helpMessageService.getUnansweredMessages(adminId);
    }

    /** 답변한 문의 목록 조회 (새로 추가한 API) */
    @GetMapping("/replied")
    public ResponseEntity<List<HelpMessage>> getRepliedMessages(@RequestParam("adminId") int adminId) {
        try {
            System.out.println("=== getRepliedMessages 호출됨 ===");
            System.out.println("받은 adminId: " + adminId);
            
            List<HelpMessage> repliedList = helpMessageService.getRepliedMessagesByAdmin(adminId);
            System.out.println("조회된 답변 목록 개수: " + (repliedList != null ? repliedList.size() : 0));
            
            return ResponseEntity.ok(repliedList);
        } catch (Exception e) {
            System.out.println("=== getRepliedMessages 오류 발생 ===");
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /** 문의글 상세 및 답변 함께 조회 */
    @GetMapping("/detailWithReply/{messageNo}")
    public ResponseEntity<HelpMessage> getMessageWithReply(@PathVariable int messageNo) {
        HelpMessage message = helpMessageService.getMessageWithReply(messageNo);
        return ResponseEntity.ok(message);
    }

    /** 파일 다운로드 */
    @GetMapping("/message/messageFile/{filename:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable("filename") String filename) {
        try {
            Path filePath = Paths.get(messageFolderPath).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(resource);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
