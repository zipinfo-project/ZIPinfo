package com.zipinfo.project.member.model.dto;

import java.util.Collection;
import java.util.List;
import java.time.LocalDate;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data

public class Member implements UserDetails {
	private int memberNo;
	private String memberEmail;
	private String memberPw;
	private String memberImg;
	private String enrollDate;
	private String memberDelFl;
	private String memberLogin; // E이면 그냥 이메일 가입, K이면 카카오 가입, N이면 네이버 가입
	private String memberNickname;
	private String memberName;
	private int memberAuth;
	private String accessToken;
	private int memberLocation; // 관심 주소 => DB저장용
	private int townNo; // 관심 주소 => DB저장용
	private int postCount;  // 게시글 수

	private String companyName; // 중개사 명
	private String companyLocation; // 중개사 주소 => DB저장용
	private String brokerNo; // 중개등록번호
	private String presidentName; // 이름 (그냥 유저 이름이랑 똑같이 넣으면 됨)
	private String presidentPhone; // 대표번호

	private String postcode;
	private String address;
	private String detailAddress;

	private String companyPostcode;
	private String companyAddress;
	private String companyDetailAddress;

	private String memberWithdrawDate;

	public String getRole() {
		return switch (this.memberAuth) {
		case 0 -> "ROLE_ADMIN";
		case 1 -> "ROLE_USER";
		case 2 -> "ROLE_WAITINGBROKER";
		case 3 -> "ROLE_BROKER";
		default -> "ROLE_USER";
		};
	}

	@Override
	@JsonIgnore
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return List.of(new SimpleGrantedAuthority(this.getRole()));
	}

	@Override
	public String getPassword() {
		return this.memberPw;
	}

	@Override
	public String getUsername() {
		return this.memberEmail;
	}

}