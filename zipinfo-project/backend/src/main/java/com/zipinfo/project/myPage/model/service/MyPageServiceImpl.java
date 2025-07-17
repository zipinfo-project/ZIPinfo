package com.zipinfo.project.myPage.model.service;


import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.zipinfo.project.admin.model.dto.HelpMessage;
import com.zipinfo.project.common.utility.Utility;
import com.zipinfo.project.member.model.dto.Member;
import com.zipinfo.project.myPage.model.mapper.MyPageMapper;
import com.zipinfo.project.neighborhood.model.dto.Neighborhood;
import com.zipinfo.project.sale.model.dto.Sale;
import com.zipinfo.project.stock.model.dto.Stock;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Transactional(rollbackFor = Exception.class)
@Service
@RequiredArgsConstructor
@Slf4j
public class MyPageServiceImpl implements MyPageService{

	private final MyPageMapper mapper;
	
	@Autowired
	private BCryptPasswordEncoder bcrypt;
	
	@Value("${my.stock.web-path}")
	private String stockWebPath;
	
	@Value("${my.stock.folder-path}")
	private String stockFolderPath;
	
	@Value("${my.message.web-path}")
	private String messageWebPath;
	
	@Value("${my.message.folder-path}")
	private String messageFolderPath;
	
	@Override
	public Member getMemberInfo(Member loginMember) {
		
			return mapper.getMemberInfo(loginMember);
		}
	
	@Override
	public int updateInfo(Member loginMember, Member member) {
		
		int result;
		
		member.setMemberNo(loginMember.getMemberNo());
		
		if(loginMember.getMemberAuth() == 3) {
			
			Member compareInfo = mapper.compareInfo(member);
			
			if(!compareInfo.getCompanyName().equals(member.getCompanyName()) || 
				!compareInfo.getCompanyLocation().equals(member.getCompanyLocation()) ||
				!compareInfo.getPresidentName().equals(member.getPresidentName()) ||
				!compareInfo.getPresidentPhone().equals(member.getPresidentPhone()) ||
				!compareInfo.getBrokerNo().equals(member.getBrokerNo())) {
				int changeAuth = mapper.changeAuth(member);
			}
			
			int firstResult = mapper.updateNormalInfo(member);
			
			int secondResult = mapper.updateBrokerInfo(member);
			
			result = firstResult + secondResult;
			
		}else {
			result =  mapper.updateNormalInfo(member);
		}
		
		return result;
	}
	
	@Override
	public int checkPassword(Member loginMember, Member member) {
		
		String memberPassword = mapper.getMemberPassword(loginMember);
		
		if(!bcrypt.matches(member.getMemberPw(), memberPassword)) {
			return 0;
		}
		
		return 1;
	}
	
	@Override
	public int updatePassword(Member loginMember, Member member) {
		
		String encPw = bcrypt.encode(member.getMemberPw());
		member.setMemberPw(encPw);
		member.setMemberNo(loginMember.getMemberNo());
		
		return mapper.updatePassword(member);
	}
	
	@Override
	public int checkNickname(Member loginMember, Member member) {
		
		member.setMemberNo(loginMember.getMemberNo());
		
		Integer result = mapper.checkNickname(member);
		
		return result != null ? 1: 0;
	}
	
	@Override
	public int withDraw(Member loginMember) {
		return mapper.withDraw(loginMember);
	}
	
	@Override
	public int addStock(Stock stock) {
		int addResult = mapper.addStock(stock);
		int stockNo = stock.getStockNo();
		
		int addSellDate = mapper.addSellDate(stockNo);
		
	    return addResult+addSellDate;
	}
	
	@Override
	public int addStockImg(List<MultipartFile> stockImg, int memberNo) {

		try {
			
			String finalPath = null;
			
			String originalName = null;
			String rename = null;
			
			// 성공했는지 확인용 변수
			int result = 0;
			int totalResult;
			
			int stockNo = mapper.searchStockNo(memberNo);
			
			for(int i = 0; i<stockImg.size(); i++) {
				
				MultipartFile file = stockImg.get(i);
				
				originalName = file.getOriginalFilename();
				rename = Utility.fileRename(originalName);
				
				File saveFile = new File(stockFolderPath, rename);
				
				// 디렉토리가 없으면 생성
				saveFile.getParentFile().mkdirs();
				
				// /myPage/stock/변경된 파일명
				finalPath = stockWebPath + rename;
				file.transferTo(saveFile);
				
				totalResult = mapper.addStockImg(originalName, rename, i, finalPath, stockNo);
				
				if(totalResult == 1) result++;
			}
			return result;
		} catch (Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	@Override
	public int searchStockNo(int memberNo) {
		return mapper.searchStockNo(memberNo);
	}
	
	
	@Override
	public int addCoord(Stock stock) {
		return mapper.addCoord(stock);
	}
	
	@Override
	public List<Stock> getMyStock(int memberNo) {
		
		List<Stock> stock = mapper.getMyStock(memberNo);

	    return stock;
	}
	
	@Override
	public int deleteStockInfo(int stockNo) {
		mapper.deleteStockCoord(stockNo);
		mapper.deleteSellDate(stockNo);
		mapper.deleteStockImgs(stockNo);
		mapper.deleteLikeStock(stockNo);
		mapper.deleteStockSaw(stockNo);
		return mapper.deleteStockInfo(stockNo);
	}
	
	@Override
	public int updateCoord(Stock stock) {
		return mapper.updateCoord(stock);
	}
	
	@Override
	public int updateStock(Stock stock) {
		return mapper.updateStock(stock);
	}
	
	@Override
	public int updateTumbImg(MultipartFile stockImg, int stockNo) {
		
		try {
			
			String finalPath = null;
			
			String originalName = null;
			String rename = null;
			
			MultipartFile file = stockImg;
				
			originalName = file.getOriginalFilename();
			rename = Utility.fileRename(originalName);
							File saveFile = new File(stockFolderPath, rename);
			
			// 디렉토리가 없으면 생성
			saveFile.getParentFile().mkdirs();
				
			// /myPage/stock/변경된 파일명
			finalPath = stockWebPath + rename;
			file.transferTo(saveFile);
				
			int result = mapper.updateTumbImg(originalName, rename, finalPath, stockNo);
			
			
			return result;
		} catch (Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	@Override
	public int updateBalanceImg(MultipartFile stockImg, int stockNo) {
		
		try {
			
			String finalPath = null;
			
			String originalName = null;
			String rename = null;
			
			MultipartFile file = stockImg;
				
			originalName = file.getOriginalFilename();
			rename = Utility.fileRename(originalName);
							File saveFile = new File(stockFolderPath, rename);
			
			// 디렉토리가 없으면 생성
			saveFile.getParentFile().mkdirs();
				
			// /myPage/stock/변경된 파일명
			finalPath = stockWebPath + rename;
			file.transferTo(saveFile);
				
			int result = mapper.updateBalanceImg(originalName, rename, finalPath, stockNo);
			
			
			return result;
		} catch (Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	
	@Override
	public int updateStockImg(List<MultipartFile> stockImg, int stockNo) {
	    try {
	        int result = 0;

	        // DB에 있는 기존 일반 이미지 개수 (order >= 2)
	        int stockCount = mapper.getStockImgCount(stockNo); // 반드시 stockOrder >= 2 조건으로 조회할 것
	        int newCount = stockImg.size();
	        int existingCount = stockCount-2;

	        // 1. update: 최소 개수만큼
	        int minCount = Math.min(existingCount, newCount);
	        
	        for (int i = 0; i < minCount; i++) {
	            MultipartFile file = stockImg.get(i);
	            String originalName = file.getOriginalFilename();
	            String rename = Utility.fileRename(originalName);
	            File saveFile = new File(stockFolderPath, rename);
	            saveFile.getParentFile().mkdirs();
	            file.transferTo(saveFile);

	            String finalPath = stockWebPath + rename;
	            int stockOrder = i + 2;
	            int updateResult = mapper.updateStockImg(originalName, rename, finalPath, stockNo, stockOrder);
	            if (updateResult == 1) result++;
	        }

	        // 2. insert: 새 이미지가 더 많을 때
	        if (newCount > existingCount) {
	            for (int i = existingCount; i < newCount; i++) {
	                MultipartFile file = stockImg.get(i);
	                String originalName = file.getOriginalFilename();
	                String rename = Utility.fileRename(originalName);
	                File saveFile = new File(stockFolderPath, rename);
	                saveFile.getParentFile().mkdirs();
	                file.transferTo(saveFile);

	                String finalPath = stockWebPath + rename;
	                int stockOrder = i + 2;
	                int insertResult = mapper.insertStockImg(originalName, rename, finalPath, stockNo, stockOrder);
	                if (insertResult == 1) result++;
	            }
	        }

	        // 3. delete: 기존 이미지가 더 많을 때
	        if (existingCount > newCount) {
	            for (int i = newCount; i < existingCount; i++) {
	                int stockOrder = i + 2;
	                int deleteResult = mapper.deleteStockImg(stockNo, stockOrder);
	                if (deleteResult == 1) result++;
	            }
	        }

	        return result;

	    } catch (Exception e) {
	        e.printStackTrace();
	        return 0;
	    }
	}
	
	@Override
	public List<Stock> getSawStock(int memberNo) {
	    List<Integer> sawStock = mapper.getSawStock(memberNo);
	    List<Stock> stockList = new ArrayList<>();

	    for (int stockNo : sawStock) {
	        List<Stock> stockInfoList = mapper.getSawStockInfo(stockNo);

	        for (Stock s : stockInfoList) {
	            stockList.add(s);
	        }
	    }

	    return stockList;
	}
	
	@Override
	public List<Stock> getLikeStock(int memberNo) {
	    List<Integer> sawStock = mapper.getLikeStock(memberNo);
	    List<Stock> stockList = new ArrayList<>();

	    for (int stockNo : sawStock) {
	        List<Stock> stockInfoList = mapper.getSawStockInfo(stockNo);

	        for (Stock s : stockInfoList) {

	            stockList.add(s); 
	        }
	    }

	    return stockList;
	}
	
	@Override
	public List<Neighborhood> getMyPost(int memberNo) {
		return mapper.getMyPost(memberNo);
	}
	
	@Override
	public int likeStock(Stock stock) {
		return mapper.likeStock(stock);
	}
	
	@Override
	public int unlikeStock(Stock stock) {
		return mapper.unlikeStock(stock);
	}
	
	@Override
	public int updateSellYn(Stock stock) {
		int result;
		int dateResult;
		
		if(stock.getSellYn().equals("Y")) {
			result = mapper.updateSellY(stock);
			dateResult = mapper.updateSellDate(stock);
		}else {
			result = mapper.updateSellN(stock);
			dateResult = mapper.updateSellDateNull(stock);
		}
		
		return result+dateResult;
	}
	

	   @Override
	   public int sendMessage(MultipartFile messageFile, HelpMessage message) {
	      
	      try {
	         
	         String finalPath = null;
	         
	         String originalName = null;
	         String rename = null;
	         
	         int sendResult = 0;
	         
	         if(messageFile != null) {
	            MultipartFile file = messageFile;
	            
	            originalName = file.getOriginalFilename();
	            
	            // 파일 형식 검증
	            if (!isValidFileType(originalName)) {
	               System.out.println("지원하지 않는 파일 형식: " + originalName);
	               return 0;
	            }
	            
	            rename = Utility.fileRename(originalName);
	            File saveFile = new File(messageFolderPath, rename);
	            
	            // 디렉토리가 없으면 생성
	            File directory = saveFile.getParentFile();
	            if (!directory.exists()) {
	               boolean created = directory.mkdirs();
	               if (!created) {
	                  System.out.println("디렉토리 생성 실패: " + directory.getAbsolutePath());
	                  return 0;
	               }
	               System.out.println("디렉토리 생성 성공: " + directory.getAbsolutePath());
	            }
	            
	            // /message/messageFile/변경된 파일명
	            finalPath = messageWebPath + rename;
	            file.transferTo(saveFile);
	            
	               int contentResult = mapper.sendMessageContent(message);
	               if(contentResult != 1) {
	                  System.out.println("메세지 전송 실패");
	                  return 0;
	               }
	               int messageNo = mapper.getMessageNo(message.getSenderNo());
	               int result = mapper.sendMessageFile(originalName, rename, finalPath, messageNo);
	               if(result == 1) sendResult++;
	            
	         }else {
	               int contentResult = mapper.sendMessageContent(message);
	               if(contentResult != 1) {
	                  System.out.println("메세지 전송 실패");
	                  return 0;
	               }else {
	                  sendResult++;
	               }
	            }
	         
	         return sendResult;
	      } catch (Exception e) {
	         e.printStackTrace();
	         return 0;
	      }
	      
	   }
	   
	   /**
	    * 파일 형식 검증
	    * @param fileName 파일명
	    * @return 지원되는 형식이면 true, 아니면 false
	    */
	   private boolean isValidFileType(String fileName) {
	      if (fileName == null || fileName.isEmpty()) {
	         return false;
	      }
	      
	      String extension = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
	      
	      // 지원되는 파일 형식들
	      String[] allowedExtensions = {
	         ".jpg", ".jpeg", ".gif", ".png", ".pdf", ".doc", ".docx", 
	         ".hwp", ".txt", ".csv", ".zip", ".rar", ".7z", ".xls", ".xlsx"
	      };
	      
	      for (String allowedExt : allowedExtensions) {
	         if (allowedExt.equals(extension)) {
	            return true;
	         }
	      }
	      
	      return false;
	   }
	
	@Override
	public List<HelpMessage> getMyMessage(int memberNo) {
		return mapper.getMyMessage(memberNo);
	}
	
	@Override
	public HelpMessage getMessageContent(int messageNo) {
		return mapper.getMessageContent(messageNo);
	}

	@Override
	public HelpMessage getMessageFile(int messageNo) {
		return mapper.getMessageFile(messageNo);
	}
	
	@Override
	public int addSawStock(Stock stock) {
		List<Integer> sawStock = mapper.getSawStockNo(stock);
		int stockNo = stock.getStockNo();
		
		if(sawStock.contains(stock.getStockNo())) {
			mapper.deleteSawStock(stockNo);
		}
		int result = mapper.addSawStock(stock);
		int deleteResult = 0;
		
		List<Integer> sawStockList = mapper.getSawStockNo(stock);
		
		if(sawStockList.size() == 9) {
			int deleteNo = sawStockList.get(8);
			deleteResult = mapper.deleteSawStock(deleteNo);
		}
		
		return result + deleteResult;
	}
	
	@Override
	public Map<String, Object> searchResult(String value) {
		value = value.replace("\"", "");
		
		List<Stock> stock = mapper.searchStock(value);
		
		List<Sale> sale = mapper.searchSale(value);
		
	    Map<String, Object> result = new HashMap<>();
	    result.put("stock", stock);
	    result.put("sale", sale);

	    return result;
	}
}
