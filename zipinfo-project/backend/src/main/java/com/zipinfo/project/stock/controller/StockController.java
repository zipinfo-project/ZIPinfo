package com.zipinfo.project.stock.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.zipinfo.project.oauth.controller.OauthController;
import com.zipinfo.project.sale.model.dto.Sale;
import com.zipinfo.project.stock.model.dto.CoordsStatInfo;
import com.zipinfo.project.stock.model.dto.SearchRequest;
import com.zipinfo.project.stock.model.dto.Stock;
import com.zipinfo.project.stock.model.service.StockService;


import lombok.extern.slf4j.Slf4j;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("stock")
@Slf4j
public class StockController {

    private final OauthController oauthController;
	@Autowired
	private StockService service;


    StockController(OauthController oauthController) {
        this.oauthController = oauthController;
    }
	
	
	/**@RequestBody SearchRequest : dto
	 * 
	 * **내부 변수**
	 * @param coords : 전송받는 좌표. 좌표 범위 안에 있는 
	 * sw : 현재 요청한 map의 남서쪽 끝의 좌표
	 * ne : 현재 요청한 map의 북동쪽 끝의 좌표
	 * Lat : 위도
	 * Lng : 경도
	 * @param(필수X) searchKeyword : 매물이름을 찾을때 사용하는 검색 키워드
	 * @param(필수X) locationCode : 소속된 시군구 코드
	 * @param(필수X) stockType : 판매 유형(매매 : 0, 전세 : 1, 월세 : 2)
	 * @param(필수X) stockForm : 매물 형태(아파트:1, 빌라:2, 오피스텔:3)
	 * @return
	 */
	@PostMapping("items")
	private ResponseEntity<?> selectItem(@RequestBody SearchRequest sr){
		
	    double swLat = sr.getCoords().get("swLat");
	    double swLng = sr.getCoords().get("swLng");
	    double neLat = sr.getCoords().get("neLat");
	    double neLng = sr.getCoords().get("neLng");
	    
	    //요청 좌표 안쪽 범위 내부에 있는 모든 매물들을 불러오는 service동작
	    
	    
	    //return 
	    try {
	    	List<Stock> stockList = service.getStockListInRange(sr);
	    	
			return ResponseEntity.status(HttpStatus.OK).body(stockList);
		}catch(Exception e) {
			log.error("매물 조회 중 오류 발생", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("매물 조회 중 문제발생" + e.getMessage());
		
		}
	}
	
	/** 시군구 코드를 입력하면 해당 시군구의 이름을 반환하는 함수
	 * @param code : 이름을 얻고자 하는 시군구 코드
	 * @return
	 */
	@PostMapping("sigunguFullName")
	private ResponseEntity<?> getSigunguFullName(@RequestBody int code){
		
		//return 
	    try {
	    	String fullName = service.getSigunguFullName(code);
			
			return ResponseEntity.status(HttpStatus.OK).body(fullName);
		}catch(Exception e) {
			log.error("시군구 명칭 조회중 오류 발생", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("매물 조회 중 문제발생" + e.getMessage());
		
		}
	}
	
	@PostMapping("coordsFromStock")
	private ResponseEntity<?> getCoordsFromStock(@RequestBody SearchRequest sr){
		//return 
	    try {
	    	CoordsStatInfo fullName = service.getCoordsFromStock(sr);
			
			return ResponseEntity.status(HttpStatus.OK).body(fullName);
		}catch(Exception e) {
			log.error("getCoordsFromStock 조회중 오류 발생", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("getCoordsFromStock 조회중 오류 발생" + e.getMessage());
		
		}
	}
	
	@PostMapping("itemOnMain")
	private ResponseEntity<?> getAnyFour(){
		
		try {
	    	List<Stock> stockList = service.selectAnyFour();
			
			return ResponseEntity.status(HttpStatus.OK).body(stockList);
		}catch(Exception e) {
			log.error("매물 조회 중 오류 발생", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("매물 조회 중 문제발생" + e.getMessage());
		
		}
	}
	
	/** 단일 분양 매물 조회하기
	 * @param stockNo
	 * @return
	 */
	@GetMapping("detail")
	public ResponseEntity<?> selectStockDetail(@RequestParam("stockNo") int stockNo) {
//	    try {
	    	System.out.println("응애");
	        Stock stockDetail = service.selectStockDetail(stockNo);
	        if (stockDetail != null) {
	            return ResponseEntity.ok(stockDetail);
	            
	        } else {
	            return ResponseEntity.notFound().build();
	        }
	        
//	    } catch (Exception e) {
//	        e.printStackTrace();
//	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//	    }
	}
	

	
	@GetMapping("/stockChart")  // URL 경로 수정
	public ResponseEntity<List<Map<String, Object>>> stockChart() {
	    try {
	        List<Map<String, Object>> stockData = service.stockChart();
	        log.debug("스톡차트에서 가져온 내용" + stockData);
	        return ResponseEntity.ok(stockData);
	    } catch (Exception e) {
	        log.error("실거래 차트 조회 오류", e);
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
	    }
	}

}
