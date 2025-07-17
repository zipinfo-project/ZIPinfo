package com.zipinfo.project.myPage.model.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.web.multipart.MultipartFile;

import com.zipinfo.project.admin.model.dto.HelpMessage;
import com.zipinfo.project.member.model.dto.Member;
import com.zipinfo.project.neighborhood.model.dto.Neighborhood;
import com.zipinfo.project.sale.model.dto.Sale;
import com.zipinfo.project.stock.model.dto.Stock;

@Mapper
public interface MyPageMapper {

	Member getMemberInfo(Member loginMember);

	int updateNormalInfo(Member member);

	int updateBrokerInfo(Member member);

	String getMemberPassword(Member loginMember);

	int updatePassword(Member member);

	Integer checkNickname(Member member);

	Member compareInfo(Member member);

	int changeAuth(Member member);

	int withDraw(Member loginMember);

	int addStock(Stock stock);

	int addStockImg(@Param("originalName") String originalName,
            @Param("rename") String rename,
            @Param("i") int i,
            @Param("finalPath") String finalPath,
            @Param("stockNo") int stockNo);
	
	int searchStockNo(int memberNo);

	int addCoord(Stock stock);

	List<Stock> getMyStock(int memberNo);

	int deleteStockInfo(int stockNo);

	Stock selectStockCoord(int stockNo);

	int updateCoord(Stock stock);

	int updateStock(Stock stock);

	int updateTumbImg(@Param("originalName") String originalName,
            @Param("rename") String rename,
            @Param("finalPath") String finalPath,
            @Param("stockNo") int stockNo);
	
	int updateBalanceImg(@Param("originalName") String originalName,
            @Param("rename") String rename,
            @Param("finalPath") String finalPath,
            @Param("stockNo") int stockNo);
	
	int updateStockImg(@Param("originalName") String originalName,
            @Param("rename") String rename,
            @Param("finalPath") String finalPath,
            @Param("stockNo") int stockNo,
            @Param("stockOrder") int stockOrder);

	int getStockImgCount(int stockNo);

	int deleteStockImg(@Param("stockNo") int stockNo, @Param("stockOrder") int stockOrder);

	int insertStockImg(@Param("originalName") String originalName,
            @Param("rename") String rename,
            @Param("finalPath") String finalPath,
            @Param("stockNo") int stockNo,
            @Param("stockOrder") int stockOrder);

	List<Integer> getSawStock(int memberNo);

	List<Stock> getSawStockInfo(int stockNo);

	List<Integer> getLikeStock(int memberNo);

	List<Neighborhood> getMyPost(int memberNo);

	int likeStock(Stock stock);

	int unlikeStock(Stock stock);

	int updateSellN(Stock stock);

	int updateSellY(Stock stock);

	int sendMessageFile(@Param("originalName") String originalName,
            @Param("rename") String rename,
            @Param("finalPath") String finalPath,
            @Param("messageNo") int messageNo);

	int sendMessageContent(HelpMessage message);

	List<HelpMessage> selectAuthMember();

	int getMessageNo(int senderNo);

	List<HelpMessage> getMyMessage(int memberNo);

	HelpMessage getMessageContent(int messageNo);

	HelpMessage getMessageFile(int messageNo);

	int addSawStock(Stock stock);

	List<Integer> getSawStockNo(Stock stock);

	int deleteSawStock(int deleteNo);

	List<Stock> searchStock(String value);

	List<Sale> searchSale(String value);

	int addSellDate(int stockNo);

	int updateSellDate(Stock stock);

	int updateSellDateNull(Stock stock);

	int deleteStockCoord(int stockNo);

	int deleteSellDate(int stockNo);

	int deleteStockImgs(int stockNo);

	int deleteLikeStock(int stockNo);

	int deleteStockSaw(int stockNo);


}
