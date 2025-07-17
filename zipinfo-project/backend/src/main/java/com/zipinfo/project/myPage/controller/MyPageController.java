package com.zipinfo.project.myPage.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.zipinfo.project.admin.model.dto.HelpMessage;
import com.zipinfo.project.member.model.dto.Member;
import com.zipinfo.project.myPage.model.service.MyPageService;
import com.zipinfo.project.neighborhood.model.dto.Neighborhood;
import com.zipinfo.project.stock.model.dto.Stock;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequestMapping("myPage")
@Slf4j
@RestController
@RequiredArgsConstructor
public class MyPageController {

	private final MyPageService service;
	
	@GetMapping("memberInfo")
	public ResponseEntity<Object> memberInfo(@AuthenticationPrincipal Member loginMember){
		
		try {
			
			if (loginMember == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();			
			Member member = service.getMemberInfo(loginMember);
			
			
			
			if (member.getCompanyLocation() != null) {
				String[] arr = member.getCompanyLocation().split("\\^\\^\\^");

				// 초기화
				String postcode = null;
				String address = null;
				String detailAddress = null;

				if (arr.length > 0)
					postcode = arr[0];
				if (arr.length > 1)
					address = arr[1];
				if (arr.length > 2)
					detailAddress = arr[2];
				
				String finalAddress = address +" " + detailAddress;

				member.setAddress(address);
				member.setDetailAddress(detailAddress);
				member.setPostcode(postcode);
				member.setCompanyLocation(finalAddress);

			}
			
			
			return ResponseEntity.status(HttpStatus.OK) // 200
				   .body(member); 
			
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				   .body("불러오는 중 예외 발생 : " + e.getMessage());
			
		}
	}
	
	@PostMapping("updateInfo")
	public ResponseEntity<Object> updateInfo(@AuthenticationPrincipal Member loginMember, @RequestBody Member member){
		
		try {
	        if (loginMember == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
			
			
			int result = service.updateInfo(loginMember,member);
			
			return ResponseEntity.status(HttpStatus.OK) // 200
					.body(result); 
			
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("불러오는 중 예외 발생 : " + e.getMessage());
			
		}
	}
	
	@PostMapping("checkPassword")
	public ResponseEntity<Object> checkPassword(@AuthenticationPrincipal Member loginMember, @RequestBody Member member){
		
		try {
			
	        if (loginMember == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
			
			int result = service.checkPassword(loginMember,member);
			
			return ResponseEntity.status(HttpStatus.OK) // 200
					.body(result); 
			
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("불러오는 중 예외 발생 : " + e.getMessage());
			
		}
	}
	
	
	@PostMapping("updatePassword")
	public ResponseEntity<Object> updatePassword(@AuthenticationPrincipal Member loginMember, @RequestBody Member member){
		
		try {
			
	        if (loginMember == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
			
			int result = service.updatePassword(loginMember,member);
			
			return ResponseEntity.status(HttpStatus.OK) // 200
					.body(result); 
			
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("불러오는 중 예외 발생 : " + e.getMessage());
			
		}
	}
	
	@PostMapping("checkNickname")
	public ResponseEntity<Object> checkNickname(@AuthenticationPrincipal Member loginMember, @RequestBody Member member){
		
		try {
			
	        if (loginMember == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

			int result = service.checkNickname(loginMember, member);
		
			return ResponseEntity.status(HttpStatus.OK) // 200
					.body(result); 
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("불러오는 중 예외 발생 : " + e.getMessage());
		}
	}
	
	@PostMapping("withDraw")
	public ResponseEntity<Object> withDraw(@AuthenticationPrincipal Member loginMember){
		
		try {
			
	        if (loginMember == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
			
			int result = service.withDraw(loginMember);
		
			return ResponseEntity.status(HttpStatus.OK) // 200
					.body(result); 
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("불러오는 중 예외 발생 : " + e.getMessage());
		}
		
	}
	
	@PostMapping("addStock")
	public ResponseEntity<Object> addStock(@AuthenticationPrincipal Member loginMember,  @RequestBody Stock stock){
		
		try {
			
			
	        if (loginMember == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();


			
			stock.setMemberNo(loginMember.getMemberNo());
			
			int result = service.addStock(stock);
			
			int stockNo = service.searchStockNo(loginMember.getMemberNo());
			
			stock.setStockNo(stockNo);
			
			int coordResult = service.addCoord(stock);
		
			return ResponseEntity.status(HttpStatus.OK) // 200
					.body(result); 
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("불러오는 중 예외 발생 : " + e.getMessage());
		}
		
	}
	
	@PostMapping(value = "addStockImg", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Object> addStockImg(@AuthenticationPrincipal Member loginMember, @RequestPart("stockImg") List<MultipartFile> stockImg){
		
		try {
	        if (loginMember == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

			
			int memberNo = loginMember.getMemberNo();
			
			int imgResult = service.addStockImg(stockImg, memberNo);
		
			return ResponseEntity.status(HttpStatus.OK) // 200
					.body(imgResult); 
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("불러오는 중 예외 발생 : " + e.getMessage());
		}
		
	}
	
	@GetMapping("getMyStock")
	public ResponseEntity<Object> getMyStock(@AuthenticationPrincipal Member loginMember){
		try {
			
	        if (loginMember == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
			
			int memberNo = loginMember.getMemberNo();
			
			List<Stock> stock = service.getMyStock(memberNo);
			
			return ResponseEntity.status(HttpStatus.OK) // 200
					.body(stock); 
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("불러오는 중 예외 발생 : " + e.getMessage());
		}
	}
	
	@PostMapping("deleteStockInfo")
	public ResponseEntity<Object> deleteStockInfo(@RequestBody Stock stock){
		try {
			
			int stockNo = stock.getStockNo();
			
			int result = service.deleteStockInfo(stockNo);
			
			return ResponseEntity.status(HttpStatus.OK) // 200
					.body(result); 
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("불러오는 중 예외 발생 : " + e.getMessage());
		}
	}
	
	@PostMapping("updateStock")
	public ResponseEntity<Object> updateStock(@AuthenticationPrincipal Member loginMember,  @RequestBody Stock stock){
		
		try {
			
	        if (loginMember == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
			
	        
			
			int result = service.updateStock(stock);
			
			int coordResult = service.updateCoord(stock);
		
			return ResponseEntity.status(HttpStatus.OK) // 200
					.body(result); 
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("불러오는 중 예외 발생 : " + e.getMessage());
		}
		
	}
	
	@PostMapping(value = "updateTumbImg", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Object> updateTumbImg(@RequestParam("stockNo") int stockNo, @RequestParam("stockImg") MultipartFile stockImg){
		
		try {
			
			int imgResult = service.updateTumbImg(stockImg, stockNo);
		
			return ResponseEntity.status(HttpStatus.OK) // 200
					.body(imgResult); 
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("불러오는 중 예외 발생 : " + e.getMessage());
		}
		
	}
	
	@PostMapping(value = "updateBalanceImg", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Object> updateBalanceImg(@RequestParam("stockNo") int stockNo, @RequestParam("stockImg") MultipartFile stockImg){
		
		try {
			
			int imgResult = service.updateBalanceImg(stockImg, stockNo);
		
			return ResponseEntity.status(HttpStatus.OK) // 200
					.body(imgResult); 
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("불러오는 중 예외 발생 : " + e.getMessage());
		}
		
	}
	
	@PostMapping(value = "updateStockImg", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Object> updateStockImg(@RequestParam("stockNo") int stockNo, @RequestParam("stockImg") List<MultipartFile> stockImg){
		
		try {
			
			int imgResult = service.updateStockImg(stockImg, stockNo);
		
			return ResponseEntity.status(HttpStatus.OK) // 200
					.body(imgResult); 
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("불러오는 중 예외 발생 : " + e.getMessage());
		}
		
	}
	
	@GetMapping("getSawStock")
	public ResponseEntity<Object> getSawStock(@AuthenticationPrincipal Member loginMember){
		try {
			
	        if (loginMember == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
			
			int memberNo = loginMember.getMemberNo();
			
			List<Stock> stock = service.getSawStock(memberNo);
			
			return ResponseEntity.status(HttpStatus.OK) // 200
					.body(stock); 
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("불러오는 중 예외 발생 : " + e.getMessage());
		}
	}
	
	@GetMapping("getLikeStock")
	public ResponseEntity<Object> getLikeStock(@AuthenticationPrincipal Member loginMember){
		try {
			
	        if (loginMember == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
			
			int memberNo = loginMember.getMemberNo();
			
			List<Stock> stock = service.getLikeStock(memberNo);
			
			return ResponseEntity.status(HttpStatus.OK) // 200
					.body(stock); 
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("불러오는 중 예외 발생 : " + e.getMessage());
		}
	}
	
	@GetMapping("getMyPost")
	public ResponseEntity<Object> getMyPost(@AuthenticationPrincipal Member loginMember){
		try {
			
	        if (loginMember == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
			
			int memberNo = loginMember.getMemberNo();
			
			List<Neighborhood> board = service.getMyPost(memberNo);
			
			return ResponseEntity.status(HttpStatus.OK) // 200
					.body(board); 
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("불러오는 중 예외 발생 : " + e.getMessage());
		}
	}
	
	@PostMapping("unlikeStock")
	public ResponseEntity<Object> unlikeStock(@AuthenticationPrincipal Member loginMember, @RequestBody Stock stock){
		try {
	        if (loginMember == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
			
			int memberNo = loginMember.getMemberNo();
			
			stock.setMemberNo(memberNo);
			
			int result = service.unlikeStock(stock);
			
			return ResponseEntity.status(HttpStatus.OK) // 200
					.body(result); 
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("불러오는 중 예외 발생 : " + e.getMessage());
		}
	}
	
	@PostMapping("likeStock")
	public ResponseEntity<Object> likeStock(@AuthenticationPrincipal Member loginMember, @RequestBody Stock stock){
		try {
	        if (loginMember == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
			
			int memberNo = loginMember.getMemberNo();
			
			stock.setMemberNo(memberNo);
			
			int result = service.likeStock(stock);
			
			return ResponseEntity.status(HttpStatus.OK) // 200
					.body(result); 
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("불러오는 중 예외 발생 : " + e.getMessage());
		}
	}
	
	@PostMapping("changeSellYn")
	public ResponseEntity<Object> changeSellYn(@RequestBody Stock stock){
		try {
			
			int result = service.updateSellYn(stock);
			
			return ResponseEntity.status(HttpStatus.OK) // 200
					.body(result); 
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("불러오는 중 예외 발생 : " + e.getMessage());
		}
	}
	
	@PostMapping(value = "sendMessage", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Object> sendMessage(@AuthenticationPrincipal Member loginMember, @RequestParam("messageTitle") String messageTitle,@RequestParam("messageContent") String messageContent,
			 @RequestParam(value = "messageFile", required = false) MultipartFile messageFile){
		
		try {
			
	        if (loginMember == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
			
			int memberNo = loginMember.getMemberNo();
			
			HelpMessage message = new HelpMessage();
			
			message.setMessageContent(messageContent);
			
			message.setMessageTitle(messageTitle);
			
			message.setSenderNo(memberNo);
			
			int result = service.sendMessage(messageFile, message);
		
			return ResponseEntity.status(HttpStatus.OK) // 200
					.body(result); 
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("불러오는 중 예외 발생 : " + e.getMessage());
		}
		
	}

	@GetMapping("getMyMessage")
	public ResponseEntity<Object> getMyMessage(@AuthenticationPrincipal Member loginMember){
		try {
			
	        if (loginMember == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
			
			int memberNo = loginMember.getMemberNo();
			
			List<HelpMessage> message = service.getMyMessage(memberNo);
			
			return ResponseEntity.status(HttpStatus.OK) // 200
					.body(message); 
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("불러오는 중 예외 발생 : " + e.getMessage());
		}
	}
	
	@PostMapping("getMessageContent")
	public ResponseEntity<Object> getMessageContent(@RequestBody HelpMessage message){
		try {

			int messageNo = message.getMessageNo();
			
			HelpMessage messageResult = service.getMessageContent(messageNo);
			
			return ResponseEntity.status(HttpStatus.OK) // 200
					.body(messageResult); 
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("불러오는 중 예외 발생 : " + e.getMessage());
		}
	}

	
	@PostMapping("getMessageFile")
	public ResponseEntity<Object> getMessageFile(@RequestBody HelpMessage message){
		try {
			
			int messageNo = message.getMessageNo();
			
			HelpMessage fileResult = service.getMessageFile(messageNo);
			
			System.out.println("응애"+fileResult);
			
			if (fileResult == null) {
			    return ResponseEntity.status(HttpStatus.OK).body(null);
			} else {
			    return ResponseEntity.status(HttpStatus.OK).body(fileResult);
			}
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("불러오는 중 예외 발생 : " + e.getMessage());
		}
	}
	
	@PostMapping("addSawStock")
	public ResponseEntity<Object> addSawStock(@RequestBody Stock stock){
		try {
			
			int result = service.addSawStock(stock);
			
			return ResponseEntity.status(HttpStatus.OK).body(result);
			

		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("불러오는 중 예외 발생 : " + e.getMessage());
		}
	}
	
	@PostMapping("searchResult")
	public ResponseEntity<Object> searchResult(@RequestBody String value){
//		try {
			
			Map<String, Object> result = service.searchResult(value);
			
			System.out.println("크앗"+result);
			
			return ResponseEntity.status(HttpStatus.OK).body(result);
			
//			
//		} catch (Exception e) {
//			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//					.body("불러오는 중 예외 발생 : " + e.getMessage());
//		}
	}
	
}
