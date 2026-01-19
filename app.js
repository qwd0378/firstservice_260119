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
  const copyBtn = $("#copyBtn");

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

    // CSS 클래스 기반으로만 상태 표현
    statusEl.classList.remove("success", "error");

    if (type === "success") statusEl.classList.add("success");
    if (type === "error") statusEl.classList.add("error");
  }

  function hideResult() {
    resultEl.hidden = true;
    accountIdEl.textContent = "-";
    if (copyBtn) copyBtn.disabled = true;
  }

  function showResult(accountId) {
    accountIdEl.textContent = accountId;
    resultEl.hidden = false;
    if (copyBtn) copyBtn.disabled = false;
  }

  // =========================
  // 3) 조회 로직
  // =========================
  function searchAccount(studentNoRaw, studentNameRaw) {
    const no = normalizeStudentNo(studentNoRaw);
    const name = normalizeName(studentNameRaw);

    if (!no) return { ok: false, reason: "학번을 숫자로 입력하세요." };
    if (no.length < 4) return { ok: false, reason: "학번이 너무 짧습니다." };
    if (!name) return { ok: false, reason: "이름을 입력하세요." };

    const key = `${no}|${name}`;
    const accountId = DB.get(key);

    if (!accountId) {
      return { ok: false, reason: "일치하는 정보가 없습니다. 학번/이름을 다시 확인하세요." };
    }
    return { ok: true, accountId };
  }

  // =========================
  // 4) 복사 기능
  // =========================
  async function copyToClipboard(text) {
    // secure context(https/localhost)면 최신 API 사용
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    // fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.setAttribute("readonly", "");
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }

  // =========================
  // 5) 이벤트
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
    setTimeout(() => studentNoEl.focus(), 0);
  });

  if (copyBtn) {
    copyBtn.disabled = true;

    copyBtn.addEventListener("click", async () => {
      const text = accountIdEl.textContent.trim();
      if (!text || text === "-") return;

      try {
        await copyToClipboard(text);
        setStatus("계정 ID가 클립보드에 복사되었습니다.", "success");
      } catch (err) {
        setStatus("복사에 실패했습니다. 텍스트를 드래그해서 복사해 주세요.", "error");
      }
    });
  }

  // 초기 상태
  hideResult();
  setStatus("학번과 이름을 입력하고 검색하세요.", "info");
})();
