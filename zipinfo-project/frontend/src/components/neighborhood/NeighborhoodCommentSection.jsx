import { useState, useEffect, useContext } from "react";
import { MemberContext } from "../member/MemberContext";
import { axiosAPI } from "../../api/axiosApi";
import "../../css/neighborhood/NeighborhoodBoardComment.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
//NeighborhoodCommentSection  ────────(데이터/상태 총괄)
//   └─ fetchComments()  ───>  comments []   (DB → 평면 배열)
//   └─ buildTree()   ───────>  트리 구조        (댓글과 답글에 대한 계층화)
//   └─ CommentTree           (트리 루트들을 순회)
//         └─ CommentItem     (한 댓글 카드 + 재귀로 자식을 출력함)
//               ├─ 수정 · 삭제 · 답글 버튼
//               ├─ setEdit / setReply ← 지역 state
//               └─ axios 3종 CRUD
// 이 파일안에는 세개의 함수형 컴포넌트가 존재한다.
// 일단 하나의 댓글 또는 답글을 담당하는 부분을 분리하자.
// 하나의 댓글 또는 답글에 대해 수정 삭제 삽입등을 할 수 있게 하는 함수를 안에 만드록 return한다.

const CommentItem = ({ comment, loginMember, reload }) => {
  const navigate = useNavigate();
  const [edit, setEdit] = useState(false);
  const [reply, setReply] = useState(false);
  const [text, setText] = useState("");

  const isMine = loginMember && loginMember.memberNo === comment.memberNo;
  const isAdmin = loginMember && loginMember.memberAuth === 0;

  // 답글의 삽입 (진짜 댓글을 아래 세번째 컴포넌트에서 따로 처리하게 된다)
  const addReply = async () => {
    if (!loginMember)
      return toast.error(
        <div>
          <div className="toast-error-title">오류 알림!</div>
          <div className="toast-error-body">로그인 후 이용해주세요.</div>
        </div>
      );
    if (!text.trim())
      return toast.error(
        <div>
          <div className="toast-error-title">오류 알림!</div>
          <div className="toast-error-body">내용을 입력해주세요.</div>
        </div>
      );
    if (text.length >= 500) {
      return toast.error(
        <div>
          <div className="toast-error-title">오류알림!</div>
          <div className="toast-error-body">
            답글은 500자 이내로 작성해주세요.
          </div>
        </div>
      );
    }
    const params = {
      commentContent: text,
      memberNo: loginMember?.memberNo,
      boardNo: comment.boardNo,
      commentParentNo: comment.commentNo,
    };
    const { data: result } = await axiosAPI.post("/boardComment", params);
    if (result > 0) {
      setReply(false);
      setText("");
      reload();
    } else {
      toast.error(
        <div>
          <div className="toast-error-title">오류 알림!</div>
          <div className="toast-error-body">답글 등록에 실패했습니다.</div>
        </div>
      );
    }
  };

  // 댓글의 삭제
  const remove = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const { data: result } = await axiosAPI.delete(
      `/boardComment/${comment.commentNo}`
    );
    if (result > 0) {
      toast.success(
        <div>
          <div className="toast-success-title">삭제 성공 알림!</div>
          <div className="toast-success-body">댓글이 삭제되었습니다.</div>
        </div>
      );
      reload();
    }
  };

  // 댓글의 수정
  const update = async () => {
    if (!text.trim())
      return toast.error(
        <div>
          <div className="toast-error-title">오류 알림!</div>
          <div className="toast-error-body">내용을 입력해주세요.</div>
        </div>
      );
    if (text.length >= 500) {
      return toast.error(
        <div>
          <div className="toast-error-title">오류알림!</div>
          <div className="toast-error-body">
            댓글은 500자 이내로 작성해주세요.
          </div>
        </div>
      );
    }
    const { data: result } = await axiosAPI.put(
      `/boardComment/${comment.commentNo}`,
      { commentContent: text }
    );
    if (result > 0) {
      setEdit(false);
      reload();
    }
  };

  const adminDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const { data: result } = await axiosAPI.delete(
      `/admin/comments/${comment.commentNo}`
    );
    if (result > 0) {
      toast.success(
        <div>
          <div className="toast-success-title">삭제 성공 알림!</div>
          <div className="toast-success-body">
            관리자 권한으로 댓글이 삭제되었습니다.
          </div>
        </div>
      );
      reload();
    }
  };

  // 컴포넌트 내 댓글 랜더링 영역 => 댓글과 답글을 한번에 처리한다
  return (
    <li
      className={`comment-row ${
        comment.commentParentNo ? "child-comment" : ""
      }`}
    >
      {comment.commentDelFl === "Y" ? (
        <p className="deleted-comment">삭제된 댓글입니다</p>
      ) : (
        <>
          {/* 작성자 및 날짜 */}
          <p className="comment-writer">
            <span>{comment.memberNickname}</span>
            <span className="comment-date">{comment.commentDate}</span>
          </p>

          {/* 수정 textarea */}
          {edit ? (
            <textarea
              className="update-textarea"
              value={text}
              maxLength={500}
              onChange={(e) => setText(e.target.value)}
            />
          ) : (
            <p className="comment-content">{comment.commentContent}</p>
          )}

          {/* 버튼 영역: 답글 에디터가 켜져 있으면 숨김 */}
          {!reply && (
            <div className="comment-btn-area">
              {!edit && <button onClick={() => setReply(true)}>답글</button>}
              {isMine && !edit && (
                <>
                  <button
                    onClick={() => {
                      setEdit(true);
                      setText(comment.commentContent);
                    }}
                  >
                    수정
                  </button>
                  <button onClick={remove}>삭제</button>
                </>
              )}
              {edit && (
                <>
                  <button onClick={update}>수정</button>
                  <button onClick={() => setEdit(false)}>취소</button>
                </>
              )}
              {isAdmin && !isMine && (
                <button onClick={() => adminDelete()}>관리자 삭제</button>
              )}
            </div>
          )}

          {/* 답글 작성창 */}
          {reply && (
            <div className="comment-reply-area">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={500}
                placeholder="답글을 입력하세요"
              />
              <div className="comment-btn-area">
                <button onClick={addReply}>등록</button>
                <button onClick={() => setReply(false)}>취소</button>
              </div>
            </div>
          )}
        </>
      )}
    </li>
  );
};

// 트리화 된 댓글을 뿌려주는 컴포넌트
// 트리의 루트 댓글들을 순회 =>  각 루트를 CommentItem으로 뿌림 =>  트리를 재귀 호출로 끝까지 내려줌
// const CommentTree = ({ nodes, loginMember, reload }) =>
//   nodes.map((node) => (
//     <CommentItem
//       key={node.commentNo}
//       comment={node}
//       loginMember={loginMember}
//       reload={reload}
//     />
//   ));

const flattenTree = (nodes) =>
  nodes.flatMap((n) => [n, ...flattenTree(n.children || [])]);

// 마지막 컴포넌트의 역할: 첫 로딩 또는 새 등록 때 서버에서 목록 가져오기 => 가져온 배열을 트리 자료로 변환 => 변환된 트리를 CommentTree에 넘김
const NeighborhoodCommentSection = ({ boardNo }) => {
  const { member } = useContext(MemberContext);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const { data } = await axiosAPI.get("/boardComment", {
          params: { boardNo },
        });
        setComments(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [refreshKey, boardNo]);

  // 새 댓글등록
  const handleInsertComment = async () => {
    if (!member)
      return toast.error(
        <div>
          <div className="toast-error-title">오류 알림!</div>
          <div className="toast-error-body">로그인 후 이용해주세요.</div>
        </div>
      );
    if (!content.trim())
      return toast.error(
        <div>
          <div className="toast-error-title">오류 알림!</div>
          <div className="toast-error-body">내용을 작성해주세요.</div>
        </div>
      );

    if (content.length >= 500) {
      return toast.error(
        <div>
          <div className="toast-error-title">오류알림!</div>
          <div className="toast-error-body">
            댓글은 500자 이내로 작성해주세요.
          </div>
        </div>
      );
    }

    // 뭘 서버로 보낼래?
    const params = {
      commentContent: content,
      memberNo: member.memberNo,
      boardNo,
    };

    const { data: result } = await axiosAPI.post("/boardComment", params);
    if (result > 0) {
      setContent("");
      setRefreshKey((k) => k + 1);
      reload();
      // 트리거를 증가시켜 한 화면에서 댓글을 다시 로드한다
      toast.success(
        <div>
          <div className="toast-success-title">댓글 등록 알림!</div>
          <div className="toast-success-body">댓글이 등록되었습니다.</div>
        </div>
      );
    } else {
      toast.error(
        <div>
          <div className="toast-error-title">오류 알림!</div>
          <div className="toast-error-body">댓글 등록에 실패하였습니다.</div>
        </div>
      );
    }
  };

  // 댓글 트리의 형성
  // 수정된 buildTree
  const buildTree = (list) => {
    if (!Array.isArray(list)) return [];

    const map = {};
    list.forEach((c) => (map[c.commentNo] = { ...c, children: [] }));

    const roots = [];

    list.forEach((c) => {
      const parentId = c.commentParentNo;
      if (parentId && map[parentId]) {
        map[parentId].children.push(map[c.commentNo]);
      } else {
        roots.push(map[c.commentNo]);
      }
    });

    return roots;
  };

  return (
    <section className="nb-comment-section">
      <h3 className="nb-comment-title">댓글 {comments.length}</h3>

      <div className="nb-comment-form">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={500}
          placeholder="댓글을 입력하세요"
        />
        <button onClick={handleInsertComment}>등록</button>
      </div>
      {loading ? (
        <p className="nb-comment-loading">로딩 중…</p>
      ) : (
        <ul className="commentList">
          {flattenTree(buildTree(comments)).map((c) => (
            <CommentItem
              key={c.commentNo}
              comment={c}
              loginMember={member}
              reload={() => setRefreshKey((k) => k + 1)}
            />
          ))}
        </ul>
      )}
    </section>
  );
};

export default NeighborhoodCommentSection;
