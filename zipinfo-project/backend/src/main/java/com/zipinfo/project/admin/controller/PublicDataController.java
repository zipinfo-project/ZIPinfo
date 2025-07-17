package com.zipinfo.project.admin.controller;

import java.net.URI;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api/publicdata")
public class PublicDataController {
    
    @Value("${publicdata.serviceKey}")
    private String serviceKey;
    
    private final RestTemplate rt = new RestTemplate();
    
    @GetMapping("/tn_pubr_public_med_office_api")
    public ResponseEntity<String> proxyMedicalOffice(
            @RequestParam("ESTBL_REG_NO") String estblRegNo,
            @RequestParam(value = "pageNo", defaultValue = "1") int pageNo,
            @RequestParam(value = "numOfRows", defaultValue = "1") int numOfRows
    ) {
        try {
            // URI 클래스로 인코딩 방지 (서비스키 원본 그대로 전송)
            String url = String.format(
                "http://api.data.go.kr/openapi/tn_pubr_public_med_office_api?serviceKey=%s&ESTBL_REG_NO=%s&pageNo=%d&numOfRows=%d&type=json",
                serviceKey, estblRegNo, pageNo, numOfRows
            );
            
            System.out.println("🔗 요청 URL: " + url);
            
            // URI 클래스 사용으로 자동 인코딩 방지
            URI uri = new URI(url);
            String body = rt.getForObject(uri, String.class);
            return ResponseEntity.ok(body);
            
        } catch (Exception e) {
            System.err.println("❌ API 호출 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body("API 호출 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}