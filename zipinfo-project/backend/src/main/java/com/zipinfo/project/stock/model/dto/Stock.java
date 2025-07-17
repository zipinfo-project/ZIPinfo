package com.zipinfo.project.stock.model.dto;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;

@Data
public class Stock {
    private int stockNo;                 // STOCK_NO
    private int memberNo;                // MEMBER_NO
    private String stockName;             // STOCK_NAME
    private int stockSellPrice;          // STOCK_SELL_PRICE
    private int stockManageFee;        // STOCK_FEE_MONTH_ADD
    private int stockFeeMonth;           // STOCK_FEE_MONTH (nullable)
    private String stockInfo;             // STOCK_INFO
    private int stockType;            // STOCK_TYPE
    private int stockForm;            // STOCK_FORM
    private int exclusiveArea;         // EXCLUSIVE_AREA
    private int supplyArea;            // SUPPLY_AREA
    private int currentFloor;         // CURRENT_FLOOR
    private int floorTotalCount;      // FLOOR_TOTAL_COUNT
    private int roomCount;            // ROOM_COUNT
    private int bathCount;            // BATH_COUNT
    private String stockDirection;        // STOCK_DIRECTION (nullable, 1 char)
    private String ableDate;                // ABLE_DATE 타입 : DATE--> STRING
    private String useApprovalDate;         // USE_APPROVAL_DATE 타입 : DATE--> STRING
    private String registDate;              // REGIST_DATE 타입 : DATE--> STRING
    private String stockDetail;           // STOCK_DETAIL (nullable)
    private String stockAddress;          // STOCK_ADDRESS
    private int regionNo;                // REGION_NO
    private String sellYn;                // SELL_YN ('Y' or 'N')
    private String imgUrl;
    private String imgOriginName;
    private int imgOrder;
    
    //STOCK_COORD에서 추가
    private double lat;
    private double lng;
    
    private List<MultipartFile> stockImg;
    private List<String> imgOriginNames;
    private List<String> imgUrls;
    private List<Stock> imgList;
    
    private String companyName;//사무소이름
    private String companyLocation;//사무소주소
    private String presidentName;//대표명
    private String brokerNo; // 중개등록번호
    private String presidentPhone; // 대표번호
    
    private String sellDate; // 판매날짜
}
