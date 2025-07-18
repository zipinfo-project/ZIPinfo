package com.zipinfo.project.admin.controller;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.zipinfo.project.admin.model.dto.Advertisement;
import com.zipinfo.project.admin.model.service.AdvertisementService;
import com.zipinfo.project.member.model.dto.Member;
import com.zipinfo.project.myPage.controller.MyPageController;
import com.zipinfo.project.myPage.model.service.MyPageService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@Slf4j
@RestController
@RequestMapping("/advertisement")
public class AdvertisementController {

    private final AdvertisementService advertisementService;

    public AdvertisementController(AdvertisementService advertisementService) {
        this.advertisementService = advertisementService;
    }

    /**
     * 파일 저장 + 메모리 리스트에 광고 추가 (DB 저장 없음)
     */
    @PostMapping("/register")
    public ResponseEntity<Object> registerAd(@AuthenticationPrincipal Member loginMember, @RequestParam("file") MultipartFile file) {
        try {
            int memberNo = loginMember.getMemberNo();
            int result = advertisementService.saveFile(file, memberNo);
            return ResponseEntity.status(HttpStatus.OK).body(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("파일 저장 실패");
        }
    }


    /**
     * 등록된 광고 리스트 반환
     */
    @GetMapping("/list")
    public ResponseEntity<List<Advertisement>> getAdList() {
    	List<Advertisement> adList = advertisementService.getAdList();
    	
        return ResponseEntity.status(HttpStatus.OK) 
				   .body(adList); 
    }
    
    @PostMapping("updateMain")
    public ResponseEntity<Object> updateMain(@RequestBody Advertisement ad){
    	try {
    		int adNo = ad.getAdNo();
    		
    		int result = advertisementService.updateMain(adNo);
    		
    		return ResponseEntity.status(HttpStatus.OK).body(result); 
			
		} catch (Exception e) {
			 return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
		                .body("메인 광고 설정 실패: " + e.getMessage());
		}
    }
    

    /**
     * 광고 삭제 (메모리 리스트 제거 + 실제 이미지 파일 삭제)
     */
    @PostMapping("/delete")
    public ResponseEntity<Object> deleteAd(@RequestBody Advertisement ad) {
    	try {
    		int adNo = ad.getAdNo();
    		
    		int result = advertisementService.deleteAd(adNo);
    		
    		return ResponseEntity.status(HttpStatus.OK).body(result); 
			
		} catch (Exception e) {
			 return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
		                .body("메인 광고 설정 실패: " + e.getMessage());
		}
    }
    
    @GetMapping("/getMainAd")
    public ResponseEntity<Object> getMainAd(){
    	try {
    		
    		Advertisement ad = advertisementService.getMainAd();
    		
    		System.out.println("응앗"+ad);
    		
    		return ResponseEntity.status(HttpStatus.OK).body(ad); 
			
		} catch (Exception e) {
			 return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
		                .body("메인광고 가져오기 실패: " + e.getMessage());
		}
    }

}
