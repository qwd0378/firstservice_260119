/* app.js
   - 학번+이름으로 구글 계정 ID만 조회합니다(비밀번호 표시 X).
   - 실제 운영 시에는 이 데이터를 프론트에 넣지 말고(노출됨),
     서버/관리자 인증 뒤 조회하도록 바꾸는 게 안전합니다.
*/

(() => {
  const $ = (sel) => document.querySelector(sel);

  const form = $("#searchForm");
  const studentNoEl = $("#studentNo");
  const studentNameEl = $("#studentName");

  const statusEl = $("#status");
  const resultEl = $("#result");
  const accountIdEl = $("#accountId");

  // =========================
  // 1) 더미 데이터(예시)
  // =========================
  // key 규칙: `${학번}|${정규화이름}`
  // 이름 정규화: 공백 제거 + 소문자
  const DB = new Map([
    ["10203|홍길동", "10203@seohyun.hs.kr"],
    ["10512|김서현", "10512@seohyun.hs.kr"],
    ["20301|박주영", "20301@seohyun.hs.kr"],
  ]);

  // =========================
  // 2) 유틸
  // =========================
  function normalizeStudentNo(v) {
    return String(v ?? "").trim().replace(/\D/g, ""); // 숫자만
  }

  function normalizeName(v) {
    return String(v ?? "")
      .trim()
      .replace(/\s+/g, "") // 공백 제거
      .toLowerCase();
  }

  function setStatus(message, type = "info") {
    statusEl.textContent = message;

    // type에 따라 테두리/배경 느낌만 살짝 변경 (CSS 변수 기반)
    // CSS를 더 건드리지 않으려면 inline 스타일로 최소 변경
    if (type === "error") {
      statusEl.style.borderColor = "rgba(255, 107, 107, 0.45)";
      statusEl.style.background = "rgba(255, 107, 107, 0.06)";
      statusEl.style.color = "rgba(255, 255, 255, 0.80)";
    } else if (type === "success") {
      statusEl.style.borderColor = "rgba(143, 240, 164, 0.42)";
      statusEl.style.background = "rgba(143, 240, 164, 0.06)";
      statusEl.style.color = "rgba(255, 255, 255, 0.85)";
    } else {
      statusEl.style.borderColor = "rgba(255,255,255,0.18)";
      statusEl.style.background = "rgba(5, 8, 16, 0.50)";
      statusEl.style.color = "rgba(255,255,255,0.65)";
    }
  }

  function hideResult() {
    resultEl.hidden = true;
    accountIdEl.textContent = "-";
  }

  function showResult(accountId) {
    accountIdEl.textContent = accountId;
    resultEl.hidden = false;
  }

  // =========================
  // 3) 조회 로직
  // =========================
  function searchAccount(studentNoRaw, studentNameRaw) {
    const no = normalizeStudentNo(studentNoRaw);
    const name = normalizeName(studentNameRaw);

    // 검증
    if (!no) {
      return { ok: false, reason: "학번을 숫자로 입력하세요." };
    }
    if (no.length < 4) {
      return { ok: false, reason: "학번이 너무 짧습니다." };
    }
    if (!name) {
      return { ok: false, reason: "이름을 입력하세요." };
    }

    const key = `${no}|${name}`;
    const accountId = DB.get(key);

    if (!accountId) {
      return { ok: false, reason: "일치하는 정보가 없습니다. 학번/이름을 다시 확인하세요." };
    }

    return { ok: true, accountId };
  }

  // =========================
  // 4) 이벤트
  // =========================
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    hideResult();
    setStatus("조회 중...", "info");

    const { ok, accountId, reason } = searchAccount(
      studentNoEl.value,
      studentNameEl.value
    );

    if (!ok) {
      setStatus(reason, "error");
      return;
    }

    showResult(accountId);
    setStatus("조회 완료. 구글 계정 ID를 확인하세요.", "success");
  });

  form.addEventListener("reset", () => {
    hideResult();
    setStatus("학번과 이름을 입력하고 검색하세요.", "info");
    // UX: reset 후 학번 입력으로 포커스
    setTimeout(() => studentNoEl.focus(), 0);
  });

  // 초기 상태
  hideResult();
  setStatus("학번과 이름을 입력하고 검색하세요.", "info");
})();
